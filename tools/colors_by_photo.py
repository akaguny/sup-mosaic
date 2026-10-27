"""Цвета каталога по фото карточек (10.10.2026). Записывает в data/catalog.json поля colors и colorsFrom.

colorsFrom: "photo" — сняты с фото и выверены глазом; "keychain" — взяты у брелока по фото (Gladiator);
"photo?" — фото неполное (вид сбоку, крупный план), цвета частично по смыслу; "approx" — фото нет, цвета прежние.
Подсказки для ролей даёт tools/photo_colors.py (кластеры и автоназначение), но роли назначены вручную по фото:
автоматика путается, когда на фото две доски, комплект или принт.
Запуск: python3 -I tools/colors_by_photo.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from artkit import load, save_catalog

# № выгрузки: (бренд, модель каталога, rail, deck, pad, acc, откуда, заметка)
BY_PHOTO = {
    46: ('Aqua Marina', 'Beast (Aqua Splash)', 'S91', 'S76', 'S07', 'S34', 'photo', ''),
    47: ('Aqua Marina', 'Monster (Heat Wave)', 'S58', 'S34', 'S68', 'S66', 'photo', ''),
    48: ('Aqua Marina', 'Magma (Earth Wave)', 'S79', 'S113', 'S114', 'S144', 'photo', ''),
    49: ('Aqua Marina', 'Coral Touring (Raspberry)', 'S49', 'S38', 'S79', 'S87', 'photo', ''),
    50: ('Aqua Marina', 'Hyper', 'S157', 'S64', 'S78', 'S58', 'photo', ''),
    51: ('Aqua Marina', 'Super Trip', 'S09', 'S76', 'S09', 'S120', 'photo', ''),
    52: ('Aqua Marina', 'Cascade (SUP-kayak)', 'S157', 'S77', 'S78', 'S57', 'photo', ''),
    53: ('Aqua Marina', 'Cascade Tandem (SUP-kayak)', 'S91', 'S77', 'S78', 'S57', 'photo', ''),
    54: ('Aqua Marina', 'Drift Fishing', 'S69', 'S01', 'S156', 'S47', 'photo', ''),
    55: ('Aqua Marina', 'Blade WindSUP', 'S69', 'S74', 'S107', 'S03', 'photo', ''),
    56: ('Aqua Marina', 'Dhyana Yoga', 'S100', 'S76', 'S44', 'S90', 'photo', ''),
    57: ('Aqua Marina', 'Glow', 'S158', 'S78', 'S159', 'S157', 'photo', ''),
    58: ('Aqua Marina', 'Halo', 'S97', 'S39', 'S93', 'S97', 'photo', ''),
    59: ('Aqua Marina', 'Pure Air', 'S43', 'S77', 'S78', 'S13', 'photo?', 'на фото только крупный план деки'),
    60: ('Aqua Marina', 'Wave (surf)', 'S157', 'S157', 'S43', 'S58', 'photo', ''),
    61: ('Starboard', 'iGO Zen SC / DC', 'S34', 'S42', 'S78', 'S146', 'photo?', 'фото сбоку'),
    62: ('Starboard', 'iGO Deluxe DC', 'S34', 'S78', 'S42', 'S158', 'photo?', 'фото сбоку'),
    63: ('Starboard', 'iGO Wing Ready', 'S34', 'S07', 'S43', 'S79', 'photo', ''),
    64: ('Starboard', 'iGO Tikhine Wave Deluxe SC', 'S159', 'S07', 'S79', 'S54', 'photo', ''),
    65: ('Starboard', 'Icon Deluxe SC', 'S158', 'S103', 'S144', 'S58', 'photo', ''),
    66: ('Starboard', 'Touring Deluxe S / M / L', 'S34', 'S138', 'S103', 'S34', 'photo', ''),
    67: ('Starboard', 'Touring Deluxe Lite M / L', 'S105', 'S75', 'S107', 'S37', 'photo', ''),
    68: ('Starboard', 'The Wall', 'S34', 'S79', 'S103', 'S146', 'photo?', 'фото сбоку'),
    69: ('Starboard', 'All Star Airline Deluxe', 'S15', 'S103', 'S104', 'S58', 'photo', ''),
    70: ('Starboard', 'Sprint Airline Deluxe', 'S157', 'S139', 'S102', 'S15', 'photo', ''),
    71: ('Starboard', 'SUP Kid Racer Deluxe SC', 'S158', 'S104', 'S103', 'S58', 'photo', ''),
    72: ('Aqua Inc', 'Carbon Tech Woven', 'S158', 'S78', 'S157', 'S01', 'photo', ''),
    73: ('Mistral', 'Sunburst Air / Club', 'S104', 'S77', 'S106', 'S54', 'photo', ''),
    74: ('Mistral', 'Sunburst', 'S103', 'S01', 'S103', 'S54', 'photo', ''),
    79: ('Mistral', 'Goldrush', 'S103', 'S01', 'S107', 'S99', 'photo', ''),
    81: ('Mistral', 'Adventurist', 'S14', 'S01', 'S51', 'S70', 'photo', ''),
    83: ('Mistral', 'Vortex Air', 'S74', 'S01', 'S79', 'S74', 'photo', ''),
    84: ('Molokai', 'Finder Air Touring', 'S11', 'S01', 'S157', 'S11', 'photo', ''),
    85: ('Molokai', 'Striker Air Race Pro (navy)', 'S144', 'S144', 'S24', 'S88', 'photo', ''),
    86: ('Molokai', 'Hero Air Race Pro (grey)', 'S144', 'S79', 'S24', 'S88', 'photo', ''),
    87: ('Molokai', 'Hero Air Race (navy)', 'S144', 'S144', 'S22', 'S88', 'photo', ''),
    88: ('Koi (FunWater)', 'Koi 350', 'S85', 'S04', 'S03', 'S96', 'photo', ''),
    89: ('JS', '335 / 350 Comanche', 'S14', 'S14', 'S107', 'S72', 'photo', ''),
    90: ('JS', '305', 'S14', 'S14', 'S64', 'S45', 'photo', ''),
    91: ('JS', '335 Arctic', 'S99', 'S44', 'S42', 'S75', 'photo', ''),
    92: ('JS', '335 Aloha', 'S72', 'S77', 'S157', 'S131', 'photo', ''),
    93: ('JS', '335 Bounty', 'S72', 'S30', 'S89', 'S96', 'photo', ''),
    94: ('JS', '335 Red Queen', 'S69', 'S69', 'S66', 'S85', 'photo', ''),
    95: ('JS', 'Dark Queen RQ335', 'S66', 'S69', 'S157', 'S15', 'photo?', 'фото сбоку: виден только красный кант, остальное по названию'),
    96: ('JS', 'Ninja NJ335 / NJ330', 'S69', 'S77', 'S69', 'S78', 'photo?', 'фото сбоку'),
    97: ('JS', 'Coral CR335', 'S76', 'S37', 'S76', 'S77', 'photo', ''),
    98: ('JS', 'GQ Blue GQ290', 'S105', 'S101', 'S75', 'S77', 'photo?', 'фото сбоку'),
    100: ('JS', 'Future FT380', 'S92', 'S70', 'S113', 'S47', 'photo?', 'фото сбоку'),
    101: ('JS', 'Spring SP', 'S91', 'S01', 'S20', 'S08', 'photo', ''),
}
NO_PHOTO = {99: 'в карточке фото весла, а не доски', 75: 'нет фото', 76: 'нет фото', 77: 'нет фото', 78: 'нет фото', 80: 'нет фото', 82: 'нет фото'}

if __name__ == '__main__':
    cat = load('catalog')
    by = {(o['brand'], o['model']): o for o in cat}
    for n, (b, m, rail, deck, pad, acc, src, note) in BY_PHOTO.items():
        o = by[(b, m)]
        o['colors'] = {'rail': rail, 'deck': deck, 'pad': pad, 'acc': acc}
        o['colorsFrom'] = src
        if note:
            o['colorsNote'] = note
        else:
            o.pop('colorsNote', None)
    keys = {(o['brand'], o['model']): o for o in cat if not o['sizes']}
    nk = 0
    for o in cat:
        if o['sizes'] and o.get('keychain'):
            k = keys[(o['brand'], o['keychain'])]
            o['colors'] = dict(k['colors'])
            o['colorsFrom'] = 'keychain'
            nk += 1
        elif not o['sizes']:
            o['colorsFrom'] = 'photo'
    for o in cat:
        o.setdefault('colorsFrom', 'approx')
    save_catalog(cat)
    left = [(o['brand'], o['model']) for o in cat if o['colorsFrom'] == 'approx']
    print('по фото', len(BY_PHOTO), 'от брелоков', nk, 'без фото:', left)
