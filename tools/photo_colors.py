"""Цвета ролей доски (кант, дека, пэд, акцент) по фото карточки → коды Artkal S.

  python3 -I tools/photo_colors.py лист.png выход.json фото1.jpg[=подпись] фото2.jpg[=подпись] ...
Пишет выход.json ({подпись: {rail, deck, pad, acc, rgb:{...}}}) и лист сверки: фото доски рядом с четырьмя образцами.

Как считается (доска приводится к вертикали по главной оси, фон — по цвету углов кадра):
  кант  — внешнее кольцо маски толщиной ~5 % ширины;
  пэд   — самый частый цвет в центре (35–80 % длины, 25–75 % ширины);
  дека  — самый частый цвет у носа и хвоста (8–28 % и 85–95 % длины), отличный от пэда;
  акцент — самый насыщенный заметный цвет доски, отличный от остальных трёх.
Это черновик: лист сверки обязателен, ошибки (фото комплекта, принт, тени) правь руками в catalog.json.
"""
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from scipy.cluster.vq import kmeans2
sys.path.append(os.path.dirname(__file__))
from raster import nearest, lab


def mask_of(a):
    h, w, _ = a.shape
    corners = np.concatenate([a[:8, :8].reshape(-1, 3), a[:8, -8:].reshape(-1, 3), a[-8:, :8].reshape(-1, 3), a[-8:, -8:].reshape(-1, 3)])
    bg = np.median(corners, 0)
    m = np.sqrt(((a - bg) ** 2).sum(-1)) > 28
    m = ndimage.binary_opening(m, iterations=2)
    lab_, k = ndimage.label(m)
    if not k:
        return m
    sz = ndimage.sum(m, lab_, range(1, k + 1))
    best, score = 1, -1
    for j, o in enumerate(ndimage.find_objects(lab_)):          # самый вытянутый из крупных объектов — доска
        if sz[j] < sz.max() * 0.15:
            continue
        hh, ww = o[0].stop - o[0].start, o[1].stop - o[1].start
        s = max(hh, ww) / max(1, min(hh, ww)) * (sz[j] ** .5)
        if s > score:
            best, score = j + 1, s
    return ndimage.binary_fill_holes(lab_ == best)


def upright(path):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(float)
    m = mask_of(a)
    ys, xs = np.nonzero(m)
    cov = np.cov(np.vstack([xs - xs.mean(), ys - ys.mean()]))
    vx, vy = np.linalg.eigh(cov)[1][:, -1]
    ang = np.degrees(np.arctan2(vy, vx))
    im2 = im.rotate(ang - 90 if abs(ang) < 135 else ang + 90, expand=True, fillcolor=tuple(int(v) for v in np.median(a[:8, :8].reshape(-1, 3), 0)))
    a2 = np.asarray(im2).astype(float)
    m2 = mask_of(a2)
    ys, xs = np.nonzero(m2)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    return a2[box[1]:box[3], box[0]:box[2]], m2[box[1]:box[3], box[0]:box[2]], im2.crop(box)


def dominant(px, k=3):
    if len(px) < 30:
        return px.mean(0) if len(px) else np.array([128, 128, 128.])
    px = px[:: max(1, len(px) // 4000)]
    c, l = kmeans2(px, min(k, len(px)), minit='++', seed=1)
    return c[np.bincount(l).argmax()]


def dE(a, b):
    la, lb = lab('%02x%02x%02x' % tuple(int(np.clip(v, 0, 255)) for v in a)), lab('%02x%02x%02x' % tuple(int(np.clip(v, 0, 255)) for v in b))
    return sum((x - y) ** 2 for x, y in zip(la, lb)) ** .5


def roles(path):
    a, m, crop = upright(path)
    H, W = m.shape
    er = ndimage.binary_erosion(m, iterations=max(2, int(W * .05)))
    rail = dominant(a[m & ~er])
    yy, xx = np.mgrid[0:H, 0:W]
    t, u = yy / H, xx / W
    pad = dominant(a[m & (t > .35) & (t < .8) & (u > .25) & (u < .75)])
    ends = m & er & (((t > .08) & (t < .28)) | ((t > .85) & (t < .95))) & (u > .2) & (u < .8)
    px = a[ends]
    far = np.array([dE(p, pad) > 18 for p in px[:: max(1, len(px) // 1500)]]) if len(px) else np.array([])
    deck = dominant(px[:: max(1, len(px) // 1500)][far]) if far.sum() > 30 else dominant(px)
    allp = a[m][:: max(1, m.sum() // 6000)]
    c, l = kmeans2(allp, 8, minit='++', seed=2)
    cnt = np.bincount(l, minlength=8) / len(l)
    best, bs = None, -1
    for cc, p in zip(c, cnt):
        if p < .02 or min(dE(cc, x) for x in (rail, deck, pad)) < 22:
            continue
        sat = (cc.max() - cc.min()) / 255
        if sat * (p ** .3) > bs:
            best, bs = cc, sat * (p ** .3)
    acc = best if best is not None else rail
    rgb = {'rail': rail, 'deck': deck, 'pad': pad, 'acc': acc}
    return {r: nearest(v, 1)[0][0] for r, v in rgb.items()} | {'rgb': {r: [int(x) for x in v] for r, v in rgb.items()}}, crop


if __name__ == '__main__':
    out_png, out_json, specs = sys.argv[1], sys.argv[2], sys.argv[3:]
    from artkit import load
    HEX = {c: '#' + h for c, n, h in load('palettes')['colors']['artkal']}
    try:
        F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    except OSError:
        F = ImageFont.load_default()
    res, tiles = {}, []
    for spec in specs:
        path, _, name = spec.partition('=')
        name = name or os.path.basename(path)
        r, crop = roles(path)
        res[name] = r
        Hh = 300
        crop = crop.resize((max(1, int(crop.width * Hh / crop.height)), Hh))
        t = Image.new('RGB', (crop.width + 150, Hh + 24), 'white')
        t.paste(crop, (0, 22))
        d = ImageDraw.Draw(t)
        d.text((2, 2), name[:34], fill='black', font=F)
        for i, role in enumerate(('rail', 'deck', 'pad', 'acc')):
            y = 30 + i * 66
            d.ellipse([crop.width + 10, y, crop.width + 60, y + 50], fill=HEX[r[role]], outline='#444')
            d.text((crop.width + 66, y + 8), {'rail': 'кант', 'deck': 'дека', 'pad': 'пэд', 'acc': 'акцент'}[role], fill='black', font=F)
            d.text((crop.width + 66, y + 26), r[role], fill='#333', font=F)
        tiles.append(t)
    per = 6
    TW = max(t.width for t in tiles) + 8
    sheet = Image.new('RGB', (TW * per, (tiles[0].height + 8) * ((len(tiles) + per - 1) // per)), '#eef1f2')
    for i, t in enumerate(tiles):
        sheet.paste(t, ((i % per) * TW, (i // per) * (tiles[0].height + 8)))
    sheet.save(out_png)
    json.dump(res, open(out_json, 'w'), ensure_ascii=False, indent=1)
