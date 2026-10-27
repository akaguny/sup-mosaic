"""Лист сверки: фото доски носом вверх рядом с брелоком из data/art.json в цветах каталога.

  python3 -I tools/review.py лист.png ключ[@модель]=фото.jpg[:rot[:kit]] [ключ=фото.jpg ...]
rot=-90 для фото «нос влево», kit=1 для фото комплекта. Ключ — ключ ART (тот, что в style "art:<ключ>");
@модель — какая запись каталога даёт цвета, если один рисунок используют несколько брелоков (перекраски).
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(__file__))
from artkit import load
from photos import board

art, cat, K, pal = load('art'), load('catalog'), load('colors'), load('palettes')
HEX = {c: '#' + h for c, n, h in pal['colors']['artkal']}
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except OSError:
    F = ImageFont.load_default()


def tile(key, photo, rot=0, kit=False, k=22, model=None):
    a = art[key]
    nw, rows = next(iter(a['grids'].items()))
    n, w = map(int, nw.split('x'))
    e = next(o for o in cat if o.get('style') == 'art:' + key and (model is None or o['model'] == model))
    c = {r: K.get(v, v) for r, v in e['colors'].items()}
    role = {'r': c['rail'], 'o': c['rail'], 'd': c['deck'], 'p': c['pad'], 'a': c['acc'], 'b': c.get('acc2', c['acc'])}
    H = max(n, 21) * k
    ph = board(photo, rot, kit)
    ph = ph.resize((max(1, int(ph.width * H / ph.height)), H))
    t = Image.new('RGB', (ph.width + w * k + 40, H + 50), '#eef1f2')
    t.paste(ph, (0, 30))
    d = ImageDraw.Draw(t)
    for i, r in enumerate(rows):
        for j, ch in enumerate(r):
            if ch == '.':
                continue
            x, y = ph.width + 20 + j * k, 30 + i * k
            d.ellipse([x, y, x + k - 2, y + k - 2], fill=HEX[role[ch]], outline='#555')
            if ch == 'o':
                d.ellipse([x - 3, y - 3, x + k + 1, y + k + 1], outline='#d00', width=3)
    d.text((2, 4), f"{e['model']} · {nw}", fill='black', font=F)
    return t


if __name__ == '__main__':
    tiles = []
    for spec in sys.argv[2:]:
        key, rest = spec.split('=', 1)
        key, _, model = key.partition('@')
        p = rest.split(':')
        tiles.append(tile(key, p[0], int(p[1]) if len(p) > 1 else 0, len(p) > 2 and p[2] == '1', model=model or None))
    per = 5
    H = max(t.height for t in tiles) + 10
    W = max(sum(t.width + 10 for t in tiles[i:i + per]) for i in range(0, len(tiles), per))
    out = Image.new('RGB', (W, H * ((len(tiles) + per - 1) // per)), 'white')
    for i, t in enumerate(tiles):
        out.paste(t, (sum(tt.width + 10 for tt in tiles[(i // per) * per:i]), (i // per) * H))
    out.save(sys.argv[1])
