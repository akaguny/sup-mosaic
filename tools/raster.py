"""Черновик трафарета по фото и подбор цветов Artkal.

Черновик — подсказка по раскладке зон, а не результат: кант и края он обычно съедает, доводи руками (artkit.py).
  python3 -I tools/raster.py фото.jpg touring 19 9 W=232,235,243 N=46,49,91 O=250,101,52 --prio N,O [--vertical] [--nose-right]
  python3 -I tools/raster.py nearest 252,189,91      → три ближайших цвета Artkal S
"""
import math, sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.dirname(__file__))
from artkit import load as load_data

PROF = {'allround': [.30, .60, .72, .62], 'touring': [.42, .85, .68, .50], 'race': [.40, .95, .60, .50]}


def shape(kind, n, w):
    """Ширины рядов, как у типовых трафаретов приложения."""
    tn, p, tt, tf = PROF[kind]
    rows = []
    for i in range(n):
        t = (i + .5) / n
        f = 1
        if t < tn:
            f = math.sin(math.pi / 2 * t / tn) ** p
        elif t > tt:
            f = 1 - (1 - tf) * ((t - tt) / (1 - tt)) ** 2
        rows.append(max(w - 2 * math.floor((w - w * f) / 2 + .5), 1 if w % 2 else 2))
    return rows


def load(path, horizontal=True, nose_left=True):
    """Фото на студийном белом фоне → (картинка, маска доски, x носа, x хвоста). Нос приводится к левому краю."""
    im = np.asarray(Image.open(path).convert('RGB')).astype(int)
    if not horizontal:
        im = np.rot90(im, 1)
    if not nose_left:
        im = im[:, ::-1]
    mask = im.min(axis=2) < 246
    lab, k = ndimage.label(mask)
    big = ndimage.binary_fill_holes(lab == 1 + int(np.argmax(ndimage.sum(mask, lab, range(1, k + 1)))))
    xs = np.where(big.any(axis=0))[0]
    return im, big, xs[0], xs[-1]


def raster(im, big, x0, x1, rows, cols, prio, thr=.35):
    """cols: {'W':(r,g,b),...}; prio — цветные зоны, побеждающие белое при доле ≥ thr. Верх фото = правый борт."""
    n = len(rows)
    K = list(cols)
    C = np.array([cols[k] for k in K])
    out = []
    for i, c in enumerate(rows):
        x = int(x0 + (i + .5) / n * (x1 - x0))
        ys = np.where(big[:, x])[0]
        top, bot = ys[0], ys[-1]
        dx = max(2, int((x1 - x0) / n * .4))
        row = ''
        for j in range(c):
            y = top + (1 - (j + .5) / c) * (bot - top)
            dy = max(2, (bot - top) / c * .4)
            px = im[int(y - dy):int(y + dy) + 1, x - dx:x + dx + 1].reshape(-1, 3)
            idx = ((px[:, None] - C[None]) ** 2).sum(-1).argmin(1)
            cnt = {k: (idx == q).mean() for q, k in enumerate(K)}
            ch = max(cnt, key=cnt.get)
            for k in prio:
                if cnt[k] >= thr:
                    ch = k
                    break
            row += ch
        out.append(row)
    return out


def lab(h):
    f = lambda v: ((v + .055) / 1.055) ** 2.4 if v > .04045 else v / 12.92
    r, g, b = [f(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)]
    x = (r * .4124 + g * .3576 + b * .1805) / .95047
    y = r * .2126 + g * .7152 + b * .0722
    z = (r * .0193 + g * .1192 + b * .9505) / 1.08883
    F = lambda v: v ** (1 / 3) if v > .008856 else 7.787 * v + 16 / 116
    x, y, z = map(F, (x, y, z))
    return (116 * y - 16, 500 * (x - y), 200 * (y - z))


def nearest(rgb, n=3):
    """Ближайшие цвета Artkal S к (r,g,b) по Lab. Очень тёмные корпуса сводятся к S158 (читается как чёрный) — для синего оттенка бери S144."""
    pal = load_data('palettes')['colors']['artkal']
    L = lab('%02x%02x%02x' % tuple(int(v) for v in rgb))
    return sorted(pal, key=lambda p: sum((a - b) ** 2 for a, b in zip(L, lab(p[2]))))[:n]


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[0] == 'nearest':
        print(nearest(tuple(map(int, a[1].split(',')))))
    else:
        path, kind, n, w = a[0], a[1], int(a[2]), int(a[3])
        cols = {kv.split('=')[0]: tuple(map(int, kv.split('=')[1].split(','))) for kv in a[4:] if '=' in kv}
        prio = a[a.index('--prio') + 1].split(',') if '--prio' in a else []
        im, big, x0, x1 = load(path, '--vertical' not in a, '--nose-right' not in a)
        for r in raster(im, big, x0, x1, shape(kind, n, w), cols, prio):
            print(r.center(w, '.'))
