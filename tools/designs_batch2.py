"""Вторая пачка брелоков: Gladiator №22–45 выгрузки (Origin SC, RNT, ONE, ART, Wind, River, Fishing, Duo, Dragon, BIG SUP, Summit).
Рисунки-близнецы (Origin SC, RNT, Wind, River, BIG SUP) переиспользуют сетки Origin 2022/2026 со своими цветами.
Запуск из корня проекта: python3 -I tools/designs_batch2.py — пишет art.json и catalog.json (идемпотентно: заменяет свои записи).
Повторно не запускать после ручных правок этих сеток в art.json."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from artkit import AR9, TR9, AR11, RC5, base, put, fill, where, rows, check, load, save_art, save_catalog

AR7 = [3, 5] + [7] * 13 + [5, 3]                         # прогулочная 17×7 (детская 28″)
TR11 = [5, 7, 9, 9] + [11] * 12 + [9, 9, 7]               # туринг 19×11
DR9 = [1, 3, 3, 5, 5, 7, 7] + [9] * 16 + [7, 7, 5, 5]     # очень длинная 27×9 (Dragon 22′)
ART, NEW = {}, {}


def setc(g, cells, ch):
    """Ставит символ без ограничений (в т. ч. внутренний контур цветом канта)."""
    for r, c in cells:
        if 0 <= r < len(g) and 0 <= c < len(g[0]) and g[r][c] != '.':
            g[r][c] = ch


def one(widths, W, top):
    """ONE 2026: нос цвета d с крупной «G»-контуром a, пэд p, хвостовой блок b с вершиной вверх."""
    g = base(widths, W); m = W // 2
    G = [".aaaaa.", "aa.....", "aa..aaa", "aa...aa", ".aaaaa."] if W >= 11 else [".aaaa", "aa...", "aa.aa", ".aaa."]
    for i, row in enumerate(G):
        for j, ch in enumerate(row):
            if ch == 'a':
                put(g, [(top + i, m - len(row) // 2 + j)], 'a')
    p = top + len(G) + 1
    end = len(g) - 1
    tail = end - 3
    where(g, lambda r, c: p <= r < tail and g[r][c] == 'd', 'p')
    put(g, [(tail, m)], 'b'); fill(g, tail, tail, m - 1, m + 1, 'b')
    fill(g, tail + 1, tail + 1, m - 3, m + 3, 'b')
    where(g, lambda r, c: tail + 1 < r < end and g[r][c] == 'd', 'b')
    where(g, lambda r, c: tail <= r < tail + 2 and g[r][c] == 'd', 'p')
    return g


def onekids():
    g = base(AR7, 7)
    put(g, [(1, 2), (1, 3), (2, 4), (3, 4), (3, 3), (3, 2), (4, 1), (2, 1)], 'a')   # завиток в носу
    where(g, lambda r, c: 6 <= r <= 11 and g[r][c] == 'd', 'p')
    put(g, [(11, 3), (12, 2), (12, 3), (12, 4)], 'a'); fill(g, 13, 14, 1, 5, 'a')    # лаймовый хвост
    return g


def oval_pad(g, r0, r1, ch, inset=1):
    """Овальный пэд: прямоугольник с отступом inset от канта и срезанными углами."""
    W = len(g[0])
    for r in range(r0, r1 + 1):
        cs = [c for c in range(W) if g[r][c] not in '.ro']
        if not cs:
            continue
        lo, hi = cs[0] + inset - 1, cs[-1] - inset + 1
        if r in (r0, r1):
            lo, hi = lo + 1, hi - 1
        put(g, [(r, c) for c in range(lo, hi + 1)], ch)


def art_audio():
    g = base(AR11, 11)
    for r in range(1, 16):                      # кассетный узор: ржавые и бирюзовые прямоугольники на кремовом
        for c in range(11):
            if (r // 2 + c // 3) % 3 == 0:
                put(g, [(r, c)], 'b')
            elif (r // 2 + c // 3) % 3 == 1 and r % 2 == 0:
                put(g, [(r, c)], 'a')
    oval_pad(g, 6, 15, 'p')
    return g


def art_avo():
    g = base(AR11, 11)
    av = [".rrr.", "raaar", "rabar", "raaar", ".rrr."]
    for i, row in enumerate(av):
        for j, ch in enumerate(row):
            if ch != '.':
                setc(g, [(1 + i, 3 + j)], ch)
    oval_pad(g, 7, 15, 'p')
    return g


def art_bones(pad_border):
    g = base(AR11, 11)
    for r in (1, 3, 5):                          # рёбра скелета в носу
        fill(g, r, r, 2, 4, 'a'); fill(g, r, r, 6, 8, 'a')
    fill(g, 1, 6, 5, 5, 'a')                     # позвоночник
    oval_pad(g, 7, 15, 'b' if pad_border else 'p')
    if pad_border:
        oval_pad(g, 8, 14, 'p', inset=2)
    return g


def fishing():
    g = base(AR11, 11)
    blobs = [(1, 3), (1, 4), (2, 6), (2, 7), (3, 2), (3, 3), (4, 7), (4, 8), (5, 4), (5, 5), (6, 1), (6, 2)]
    put(g, blobs, 'b')                            # камуфляж
    where(g, lambda r, c: 7 <= r <= 15 and g[r][c] in 'db', 'p')
    for r0, c0 in ((8, 6), (10, 3), (12, 7), (14, 4)):   # лаймовые штрихи
        put(g, [(r0, c0), (r0, c0 + 1)], 'a')
    return g


def duo():
    g = base(TR11, 11)
    put(g, [(2, 5), (3, 4), (3, 6), (4, 3), (4, 7)], 'p')               # шеврон в носу
    put(g, [(3, 5), (4, 4), (4, 6), (5, 3), (5, 7), (5, 2), (5, 8)], 'a')
    for r in range(7, 16):                                              # косые блоки: красный слева-вверху, синий справа
        for c in range(11):
            k = r - 7 + (10 - c) // 2
            if 0 <= k <= 3:
                put(g, [(r, c)], 'a')
            elif 5 <= k <= 7:
                put(g, [(r, c)], 'p')
    where(g, lambda r, c: r == 16 and g[r][c] == 'd', 'p')
    return g


def dragon():
    g = base(DR9, 9)
    for top in (3, 9, 15, 21):                                          # повторяющиеся красные арки с синей серединой
        put(g, [(top, c) for c in range(2, 7)], 'a')
        put(g, [(top + 1, 1), (top + 1, 7), (top + 2, 1), (top + 2, 7), (top + 3, 1), (top + 3, 7)], 'a')
        fill(g, top + 1, top + 3, 3, 5, 'p')
    return g


def summit():
    g = base(RC5, 5)
    where(g, lambda r, c: r <= 4 and g[r][c] == 'd', 'a')               # красный нос
    fill(g, 6, 16, 2, 2, 'p'); fill(g, 8, 15, 1, 3, 'p')                # синий пэд по центру
    fill(g, 18, 19, 1, 3, 'a')                                          # красный хвост
    return g


def origin22_9():
    """Origin 2022 в сетке 17×9 (для River 11.0×32)."""
    g = base(AR9, 9); t = 1; m = 4
    for s_ in range(4):
        put(g, [(t + s_, m - s_), (t + s_, m + s_), (t + s_ + 1, m - s_), (t + s_ + 1, m + s_)], 'a')
    for s_ in range(4):
        put(g, [(t + 3 + s_, m - s_), (t + 3 + s_, m + s_)], 'b')
    p = t + 7; end = len(g) - 2
    where(g, lambda r, c: p <= r < end and 1 <= c <= 7 and g[r][c] == 'd', 'p')
    put(g, [(p, 1), (p, 2), (p, 3)], 'a')
    return g


NEW = {
    'one26akey': ('gladiator-one-red-2026.jpg', one(AR11, 11, 1), '34″ → 8,5×5,5 см на midi'),
    'one26tkey': ('gladiator-one-red-2026.jpg', one(TR9, 9, 2), '32″ → 9,5×4,5 см на midi'),
    'onekidskey': ('gladiator-one-kids-2026.jpg', onekids(), '28″ → 8,5×3,5 см на midi'),
    'art90key': ('gladiator-art-90th-2021.png', art_audio(), '34″ → 8,5×5,5 см на midi'),
    'artavokey': ('gladiator-art-avo-2021.png', art_avo(), '34″ → 8,5×5,5 см на midi'),
    'artmermaidkey': ('gladiator-art-mermaid-2021.png', art_bones(False), '34″ → 8,5×5,5 см на midi'),
    'artridekey': ('gladiator-art-ride-2021.png', art_bones(True), '34″ → 8,5×5,5 см на midi'),
    'fishingkey': ('gladiator-fishing-2026.jpg', fishing(), '38″ → 8,5×5,5 см на midi'),
    'duokey': ('gladiator-duo-2026.jpg', duo(), '36″ → 9,5×5,5 см на midi'),
    'dragonkey': ('gladiator-dragon-2026.jpg', dragon(), '34″ → 13,5×4,5 см на midi'),
    'summitkey': ('gladiator-summit-sport-2026.jpg', summit(), '24″ → 10,5×2,5 см на midi'),
    'origin22a9key': ('gladiator-river-2022.jpg', origin22_9(), '32″ → 8,5×4,5 см на midi'),
}

G, A, T, R = 'Gladiator', 'allround', 'touring', 'race'
# (модель брелока, тип, ключ рисунка, цвета rail/deck/pad/acc/acc2, год, полноразмерные модели каталога, которые он закрывает)
KEYS = [
    ('ORIGIN SC 10.8 2022 · брелок', A, 'origin22akey', ('S78', 'S01', 'S158', 'S102', 'S79'), '2022', ['ORIGIN SC (2022)']),
    ('ORIGIN SC 12.6T 2022 · брелок', T, 'origin22tkey', ('S78', 'S01', 'S158', 'S58', 'S79'), '2022', ['ORIGIN S SC / T SC (2022)']),
    ('ORIGIN SC 10.8 2026 · брелок', A, 'origin26akey', ('S77', 'S77', 'S123', 'S21', 'S156'), '2026', ['ORIGIN SC']),
    ('ORIGIN SC 12.6T 2026 · брелок', T, 'origin26tkey', ('S77', 'S77', 'S15', 'S66', 'S107'), '2026', ['ORIGIN T SC']),
    ('RNT 10.8 2022 · брелок', A, 'origin22akey', ('S07', 'S07', 'S158', 'S72', 'S79'), '2022', ['RNT (2022)']),
    ('RNT 12.6T 2022 · брелок', T, 'origin22tkey', ('S07', 'S07', 'S158', 'S72', 'S79'), '2022', ['RNT 12.6T (2022)']),
    ('RNT 10.8 2026 · брелок', A, 'origin26akey', ('S77', 'S77', 'S103', 'S05', 'S99'), '2026', ['RNT']),
    ('RNT 12.6T 2026 · брелок', T, 'origin26tkey', ('S77', 'S77', 'S103', 'S05', 'S99'), '2026', ['RNT 12.6T']),
    ('ONE Red 10.8 · брелок', A, 'one26akey', ('S159', 'S38', 'S59', 'S79', 'S38'), '2026', ['ONE Red']),
    ('ONE Red 12.6 · брелок', T, 'one26tkey', ('S159', 'S38', 'S59', 'S79', 'S38'), '2026', ['ONE Red 12.6']),
    ('ONE Lime 10.8 · брелок', A, 'one26akey', ('S157', 'S70', 'S53', 'S157', 'S157'), '2026', ['ONE Lime']),
    ('ONE Lime 12.6 · брелок', T, 'one26tkey', ('S157', 'S70', 'S53', 'S157', 'S157'), '2026', ['ONE Lime 12.6']),
    ('ONE White 10.8 · брелок', A, 'one26akey', ('S78', 'S77', 'S64', 'S99', 'S105'), '2026', ['ONE White']),
    ('ONE White 12.6 · брелок', T, 'one26tkey', ('S78', 'S77', 'S64', 'S99', 'S105'), '2026', ['ONE White 12.6']),
    ('ONE KIDS 9.6 · брелок', A, 'onekidskey', ('S53', 'S53', 'S102', 'S46', 'S46'), '2026', ['ONE KIDS']),
    ('ART 90TH (AUDIO) 10.8 · брелок', A, 'art90key', ('S16', 'S51', 'S90', 'S09', 'S83'), '2021', ['ART 90TH (2021)']),
    ('ART AVO 10.8 · брелок', A, 'artavokey', ('S151', 'S51', 'S80', 'S145', 'S16'), '2021', ['ART AVO (2021)']),
    ('ART MERMAID 10.8 · брелок', A, 'artmermaidkey', ('S130', 'S40', 'S49', 'S01', 'S49'), '2021', ['ART MERMAID (2021)']),
    ('ART RIDE 10.8 · брелок', A, 'artridekey', ('S13', 'S44', 'S157', 'S84', 'S146'), '2021', ['ART RIDE (2021)']),
    ('WIND 11.6 2022 · брелок', A, 'origin22akey', ('S78', 'S01', 'S158', 'S24', 'S78'), '2022', ['WIND (2022)']),
    ('WindSUP 11.6 2026 · брелок', A, 'origin26akey', ('S77', 'S77', 'S106', 'S146', 'S159'), '2026', ['WindSUP']),
    ('RIVER 11.0 2022 · брелок', A, 'origin22a9key', ('S78', 'S01', 'S158', 'S48', 'S78'), '2022', ['RIVER 11.0-32 (2022)']),
    ('SPECIAL Fishing 12.6 · брелок', 'fishing', 'fishingkey', ('S158', 'S126', 'S158', 'S55', 'S125'), '2026', ['SPECIAL Fishing']),
    ('SPECIAL Duo 15.2 · брелок', T, 'duokey', ('S78', 'S01', 'S157', 'S34', 'S157'), '2026', ['SPECIAL Duo']),
    ('Dragon 22.0 · брелок', T, 'dragonkey', ('S78', 'S01', 'S157', 'S57', 'S57'), '2026', ['Dragon 22.0']),
    ('BIG SUP 17.0 · брелок', 'yoga', 'origin22akey', ('S78', 'S01', 'S158', 'S132', 'S56'), '2026', ['BIG SUP 17.0']),
    ('Summit Sport 14.0 · брелок', R, 'summitkey', ('S78', 'S01', 'S107', 'S58', 'S58'), '2026', ['Summit Sport']),
]

# брелоки первой очереди → полноразмерные модели, которые они закрывают
LINKS1 = {
    'ELITE 12.6T 2021–2025 · брелок': ['ELITE LT / S / T (2021)', 'ELITE LT / S / T (2024)', 'ELITE LT / S / T (2025)'],
    'ELITE 12.6R 2022–2025 · брелок': ['ELITE R (2022)', 'ELITE R / S 14 (2025)'],
    'ELITE 11.4 2022–2025 · брелок': ['ELITE (2022)', 'ELITE (2025)'],
    'ELITE 12.6T 2026 · брелок': ['ELITE LT / S / T'], 'ELITE 11.4 2026 · брелок': ['ELITE'],
    'ELITE 14.0GT 2026 · брелок': ['ELITE GT / GT V3'], 'PRO 10.6 2021 · брелок': ['PRO (2021)'],
    'PRO 11.4 2022–2025 · брелок': ['PRO (2022)', 'PRO (2025)'],
    'PRO 12.6T 2022–2025 · брелок': ['PRO LT / S / T / W (2022)', 'PRO LT / Sport / Touring / W (2025)'],
    'PRO 11.4 2026 · брелок': ['PRO'], 'PRO 12.6T 2026 · брелок': ['PRO LT / S / T / W'],
    'ORIGIN 10.8 2022 · брелок': ['ORIGIN (2022)'], 'ORIGIN 12.6T 2022 · брелок': ['ORIGIN LT / S / T (2022)'],
    'ORIGIN 10.8 2026 · брелок': ['ORIGIN'], 'ORIGIN 12.6T 2026 · брелок': ['ORIGIN LT / S / T'],
}

if __name__ == '__main__':
    art = load('art')
    for k, (photo, g, label) in NEW.items():
        rs = rows(g); nw = f'{len(rs)}x{len(rs[0])}'; check(rs, nw)
        art[k] = {'photo': photo, 'only': {nw: label}, 'grids': {nw: rs}}
    save_art(art)
    cat = load('catalog')
    mine = {m for m, *_ in KEYS}
    cat = [o for o in cat if o['model'] not in mine]
    links = {full: key for key, fulls in LINKS1.items() for full in fulls}
    for m, kind, key, cols, year, fulls in KEYS:
        assert key in art, key
        c = dict(zip(('rail', 'deck', 'pad', 'acc', 'acc2'), cols))
        cat.append({'brand': G, 'model': m, 'kind': kind, 'sizes': [], 'colors': c, 'style': 'art:' + key, 'year': year})
        for f in fulls:
            links[f] = m
    models = {o['model'] for o in cat if o['brand'] == G}
    for o in cat:
        if o['brand'] == G and o['sizes'] and o['model'] in links:
            assert links[o['model']] in models, links[o['model']]
            o['keychain'] = links[o['model']]
    save_catalog(cat)
    left = [o['model'] for o in cat if o['brand'] == G and o['sizes'] and 'keychain' not in o]
    print('новых рисунков', len(NEW), 'брелоков', len(KEYS), 'Gladiator без брелока:', left)
