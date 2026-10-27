"""Рисование трафаретов кодом и запись в данные приложения.

Запуск из корня проекта: python3 -I tools/<скрипт>.py, где скрипт делает `sys.path.insert(0, 'tools'); from artkit import *`.
Символы сетки: r кант, d дека, p пэд, a акцент, b акцент 2, o бусина под кольцо, . пусто. Строки — от носа к хвосту.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')

# Профили брелоков (ширины рядов). Ширина по доске: до 26″ — 5, 27–29″ — 7, 30–32″ — 9, от 33″ — 11.
# Длина по типу: race 21, touring 19, allround 17.
AR9 = [3, 7] + [9] * 13 + [7, 5]                    # прогулочная 17×9
TR9 = [3, 5, 7, 7] + [9] * 12 + [7, 7, 5]           # туринг 19×9
RC9 = [1, 3, 3, 5, 5, 7, 7] + [9] * 10 + [7, 7, 5, 5]  # длинная/гоночная 21×9
AR11 = [5, 9] + [11] * 13 + [9, 7]                  # прогулочная 17×11
RC5 = [1, 1, 3, 3, 3, 3] + [5] * 12 + [5, 3, 3]     # гоночная 21×5


def base(widths, W):
    """Заготовка: дека 'd', кант по краям рядов и в первом/последнем ряду, кольцо в центре последнего ряда."""
    g = []
    for i, w in enumerate(widths):
        off = (W - w) // 2
        row = ['.'] * W
        for c in range(off, off + w):
            row[c] = 'r' if c in (off, off + w - 1) or i in (0, len(widths) - 1) else 'd'
        g.append(row)
    g[-1][W // 2] = 'o'
    return g


def put(g, cells, ch):
    """Красит только внутренние ячейки (d/p/a/b); кант, кольцо и пустоту не трогает."""
    for r, c in cells:
        if 0 <= r < len(g) and 0 <= c < len(g[0]) and g[r][c] in 'dpab':
            g[r][c] = ch


def fill(g, r0, r1, c0, c1, ch):
    put(g, [(r, c) for r in range(r0, r1 + 1) for c in range(c0, c1 + 1)], ch)


def where(g, fn, ch):
    put(g, [(r, c) for r in range(len(g)) for c in range(len(g[0])) if fn(r, c)], ch)


def V(a, m=4, depth=4):
    """Шеврон вершиной вверх: вершина в (a, m), плечи на depth рядов вниз."""
    out = []
    for s in range(depth):
        out += [(a + s, m - s), (a + s, m + s)]
    return out


def rows(g):
    return [''.join(r) for r in g]


def check(grid_rows, key):
    n, w = map(int, key.split('x'))
    assert len(grid_rows) == n, f'{key}: рядов {len(grid_rows)}'
    for i, r in enumerate(grid_rows):
        assert len(r) == w, f'{key}: ряд {i} длиной {len(r)}'
        assert set(r) <= set('rdpabo.'), f'{key}: ряд {i} с лишними символами'


def load(name):
    with open(os.path.join(DATA, name + '.json'), encoding='utf-8') as f:
        return json.load(f)


def save_art(art):
    """Пишет data/art.json в том же виде, что и раньше: одна строка трафарета — одна строка файла."""
    out = ['{']
    keys = list(art)
    for i, k in enumerate(keys):
        v = art[k]
        head = ', '.join(f'{json.dumps(x, ensure_ascii=False)}: {json.dumps(y, ensure_ascii=False)}' for x, y in v.items() if x != 'grids')
        grids = ',\n'.join(f'  {json.dumps(g)}: [\n' + ',\n'.join(f'   {json.dumps(r)}' for r in rs) + '\n  ]' for g, rs in v['grids'].items())
        out.append(f' {json.dumps(k)}: {{{head}, "grids": {{\n{grids}\n }}}}' + (',' if i < len(keys) - 1 else ''))
    out.append('}')
    with open(os.path.join(DATA, 'art.json'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')


def save_catalog(cat):
    with open(os.path.join(DATA, 'catalog.json'), 'w', encoding='utf-8') as f:
        f.write('[\n' + ',\n'.join(' ' + json.dumps(o, ensure_ascii=False) for o in cat) + '\n]\n')


def add_keychain(key, grid, photo, label, entry):
    """Добавляет или заменяет брелок: рисунок в art.json и запись в catalog.json.
    grid — список строк или сетка из base(); label — подпись размера («32″ → 8,5×4,5 см на midi»);
    entry — {brand, model, kind, colors:{rail,deck,pad,acc,acc2?}, year}. Модель называй «PRO 11.4 2022–2025 · брелок»."""
    g = rows(grid) if grid and isinstance(grid[0], list) else list(grid)
    nw = f'{len(g)}x{len(g[0])}'
    check(g, nw)
    art = load('art')
    art[key] = {'photo': photo, 'only': {nw: label}, 'grids': {nw: g}}
    save_art(art)
    cat = load('catalog')
    e = {'brand': entry['brand'], 'model': entry['model'], 'kind': entry['kind'], 'sizes': [],
         'colors': entry['colors'], 'style': 'art:' + key, 'year': entry.get('year', '')}
    cat = [o for o in cat if o.get('style') != 'art:' + key] + [e]
    save_catalog(cat)
    return nw
