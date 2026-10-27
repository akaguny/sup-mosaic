"""Выгрузка карточек (PDF «SUP-доски: фото для сверки расцветок»): таблица позиций, фото, обрезка доски носом вверх.

  python3 -I tools/photos.py table  выгрузка.pdf            → JSON-список позиций [№, бренд, серия, модель, файл, ссылка]
  python3 -I tools/photos.py images выгрузка.pdf папка      → img-NNN.jpg (pdfimages) + index.json: № позиции → файл картинки
  python3 -I tools/photos.py crop   фото.jpg выход.png [rot] [kit] → доска носом вверх; rot=-90 для фото «нос влево»,
                                                              kit=1 для фото комплекта (берёт самый вытянутый объект)
Папку с фото держи отдельно от скриптов: файлы из выгрузки — чужие данные.
"""
import json, re, subprocess, sys
import numpy as np
from PIL import Image
from scipy import ndimage


def table(pdf):
    import pdfplumber
    rows = []
    with pdfplumber.open(pdf) as doc:
        for pg in doc.pages[:8]:
            for tb in pg.extract_tables():
                for r in tb:
                    if r and r[0] and r[0].strip().isdigit():
                        rows.append([(c or '').replace('\n', ' ').replace('- ', '-') for c in r])
    return rows


def images(pdf, out):
    """Сопоставляет картинки позициям по страницам карточек: на странице «N / 101» — фото позиции N."""
    subprocess.run(['pdfimages', '-j', pdf, out + '/img'], check=True)
    lst = subprocess.run(['pdfimages', '-list', pdf], capture_output=True, text=True).stdout.splitlines()[2:]
    page_img = {int(l.split()[0]): int(l.split()[1]) for l in lst}
    txt = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, text=True).stdout.split('\f')
    idx = {}
    for p, t in enumerate(txt, 1):
        m = re.match(r'\s*(\d+) / \d+\s', t)   # шапка страницы карточки: «54 / 101   Aqua Marina · №9»
        if m and p in page_img:
            idx[int(m.group(1))] = f'img-{page_img[p]:03d}.jpg'
    json.dump(idx, open(out + '/index.json', 'w'), indent=1)
    return idx


def board(path, rot=0, kit=False, thr=246):
    im = Image.open(path).convert('RGB')
    if rot:
        im = im.rotate(rot, expand=True, fillcolor=(255, 255, 255))
    a = np.asarray(im).astype(int)
    mask = ndimage.binary_opening(a.min(axis=2) < thr, iterations=2)
    lab, k = ndimage.label(mask)
    sz = ndimage.sum(mask, lab, range(1, k + 1))
    i = 1 + int(np.argmax(sz))
    if kit:
        best = None
        for j, o in enumerate(ndimage.find_objects(lab)):
            if sz[j] < sz.max() * 0.15:
                continue
            r = (o[0].stop - o[0].start) / max(1, o[1].stop - o[1].start)
            if best is None or r > best[0]:
                best = (r, j + 1)
        i = best[1]
    ys, xs = np.where(lab == i)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'table':
        print(json.dumps(table(sys.argv[2]), ensure_ascii=False, indent=1))
    elif cmd == 'images':
        print(json.dumps(images(sys.argv[2], sys.argv[3]), indent=1))
    elif cmd == 'crop':
        board(sys.argv[2], int(sys.argv[4]) if len(sys.argv) > 4 else 0, len(sys.argv) > 5).save(sys.argv[3])
