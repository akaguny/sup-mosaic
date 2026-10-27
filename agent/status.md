# Статус каталога

Состояние по безопасности и принятые риски — [security.md](security.md).

Выгрузка «SUP-доски: фото для сверки расцветок» — 101 позиция: таблица и по странице на доску с фото. Приоритеты из выгрузки: 1 — основные серии Gladiator (Elite, Pro, Origin), 2 — особые расцветки и принты, 3 — специальные доски; остальные бренды без приоритета.

## Сводка

| | Готово | Осталось |
|---|---|---|
| Брелоки Gladiator (№1–45) | все 45 позиций, 42 брелока по фото | — |
| Брелоки остальных брендов (№46–101) | типовые у всех 56 | нарисовать по фото |
| Цвета каталога | 89 по фото или по брелоку | 8 по неполному фото, 7 без фото |
| Полноразмерные трафареты по фото | №1 Elite 12.6T 2021 (26 × 6, 26 × 5, 29 × 5) | остальные — типовой узор с цветами по фото |

## Что дальше

- Все Gladiator из выгрузки (№1–45) закрыты брелоками по фото.
- Остальные бренды (№46–101: Aqua Marina, Starboard, Aqua Inc, Mistral, Molokai, Koi, JS) — пока типовые брелоки. Следующая очередь — рисовать их по фото, пачками по бренду; при добавлении поставить `keychain` у полноразмерной записи.
- Без фото (Mistral №75–78, 80, 82) остаются типовыми, пока пользователь не пришлёт фото.
- Полноразмерные трафареты по фото пока только у №1; остальные полноразмерные — типовой узор, но цвета уже по фото.
- Приблизительные цвета остались у 7 досок без фото (Mistral №75–78, 80, 82; JS GQ Orange №99 — в карточке фото весла); неполное фото (вид сбоку, крупный план) — №59, 61, 62, 68, 95, 96, 98, 100. Нужны фото сверху.

## Все позиции

Фото из PDF: `python3 -I tools/photos.py images выгрузка.pdf папка` — извлекает картинки и пишет `index.json` (№ позиции → файл). Без фото позиции 75–78, 80, 82 (Mistral; сайт закрыт антибот-проверкой).

| № | Приоритет | Доска | Файл | Сделано |
|---|---|---|---|---|
| 1 | 1 | Gladiator ELITE LT / S / T (2022) · ELITE 12.6T (2022) | `gladiator-elite-2022-touring.jpg` | брелок `elite21key` 19×9 + полноразмерный трафарет по фото (26×6, 26×5, 29×5) |
| 2 | 1 | Gladiator ELITE (2022) · ELITE 11.4 (2022) | `gladiator-elite-2022-allround.jpg` | брелок `elite22akey` 17×9 |
| 3 | 1 | Gladiator ELITE R (2022) · ELITE 12.6R (2022) | `gladiator-elite-2022-race.jpg` | брелок `elite22rkey` 21×5 |
| 4 | 1 | Gladiator ELITE LT / S / T (2024) · Elite 12′6″ T 2024 | `gladiator-elite-2024-touring.jpg` | брелок `elite21key` (рисунок как у №1, сверено по фото комплекта) |
| 5 | 1 | Gladiator ELITE LT / S / T (2025) · Elite 12′6″ T 2025 | `gladiator-elite-2025-touring.jpg` | брелок `elite21key` (как №1) |
| 6 | 1 | Gladiator ELITE (2025) · Elite 11′4″ 2025 | `gladiator-elite-2025-allround.jpg` | брелок `elite22akey` (как №2) |
| 7 | 1 | Gladiator ELITE R / S 14 (2025) · Elite 12′6″ R 2025 | `gladiator-elite-2025-race.jpg` | брелок `elite22rkey` (как №3) |
| 8 | 1 | Gladiator ELITE LT / S / T · ELITE 12.6T 2026 | `gladiator-elite-2026-touring.jpg` | брелок `elite26tkey` 19×9 |
| 9 | 1 | Gladiator ELITE · ELITE 11.4 2026 | `gladiator-elite-2026-allround.jpg` | брелок `elite26akey` 17×9 |
| 10 | 1 | Gladiator ELITE GT / GT V3 · ELITE 14.0GT 2026 | `gladiator-elite-2026-gt.jpg` | брелок `elite26gtkey` 21×9 |
| 11 | 1 | Gladiator PRO (2021) · PRO 10.6 (2021) | `gladiator-pro-2021-allround.jpg` | брелок `pro21key` 17×9 |
| 12 | 1 | Gladiator PRO (2022) · PRO 11.4 (2022) | `gladiator-pro-2022-allround.jpg` | брелок `pro22akey` 17×9 |
| 13 | 1 | Gladiator PRO LT / S / T / W (2022) · PRO 12.6T (2022) | `gladiator-pro-2022-touring.jpg` | брелок `pro22tkey` 19×9 |
| 14 | 1 | Gladiator PRO (2025) · Pro 11′4″ 2025 | `gladiator-pro-2025-allround.jpg` | брелок `pro22akey` (как №12) |
| 15 | 1 | Gladiator PRO LT / Sport / Touring / W (2025) · Pro 12′6″ Touring 2025 | `gladiator-pro-2025-touring.jpg` | брелок `pro22tkey` (как №13) |
| 16 | 1 | Gladiator PRO · PRO 11.4 2026 | `gladiator-pro-2026-allround.jpg` | брелок `pro26akey` 17×9 |
| 17 | 1 | Gladiator PRO LT / S / T / W · PRO 12.6T 2026 | `gladiator-pro-2026-touring.jpg` | брелок `pro26tkey` 19×9 |
| 18 | 1 | Gladiator ORIGIN (2022) · OR10.8 (2022) | `gladiator-origin-2022-allround.jpg` | брелок `origin22akey` 17×11 |
| 19 | 1 | Gladiator ORIGIN LT / S / T (2022) · OR12.6 T (2022) | `gladiator-origin-2022-touring.jpg` | брелок `origin22tkey` 19×9 |
| 20 | 1 | Gladiator ORIGIN · OR10.8 2026 | `gladiator-origin-2026-allround.jpg` | брелок `origin26akey` 17×11 |
| 21 | 1 | Gladiator ORIGIN LT / S / T · OR12.6 T 2026 | `gladiator-origin-2026-touring.jpg` | брелок `origin26tkey` 19×9 |
| 22 | 2 | Gladiator ORIGIN SC (2022) · OR10.8SC (2022) | `gladiator-origin-sc-2022-allround.jpg` | брелок «ORIGIN SC 10.8 2022 · брелок» (`origin22akey`) |
| 23 | 2 | Gladiator ORIGIN S SC / T SC (2022) · OR12.6T SC (2022) | `gladiator-origin-sc-2022-touring.jpg` | брелок «ORIGIN SC 12.6T 2022 · брелок» (`origin22tkey`) |
| 24 | 2 | Gladiator ORIGIN SC · OR10.8SC 2026 | `gladiator-origin-sc-2026-allround.jpg` | брелок «ORIGIN SC 10.8 2026 · брелок» (`origin26akey`) |
| 25 | 2 | Gladiator ORIGIN T SC · OR12.6T SC 2026 | `gladiator-origin-sc-2026-touring.jpg` | брелок «ORIGIN SC 12.6T 2026 · брелок» (`origin26tkey`) |
| 26 | 2 | Gladiator RNT (2022) · RNT 10.8 (2022) | `gladiator-rnt-2022-allround.jpg` | брелок «RNT 10.8 2022 · брелок» (`origin22akey`) |
| 27 | 2 | Gladiator RNT 12.6T (2022) · RNT 12.6T (2022) | `gladiator-rnt-2022-touring.jpg` | брелок «RNT 12.6T 2022 · брелок» (`origin22tkey`) |
| 28 | 2 | Gladiator RNT · RNT 10.8 2026 | `gladiator-rnt-2026-allround.jpg` | брелок «RNT 10.8 2026 · брелок» (`origin26akey`) |
| 29 | 2 | Gladiator RNT 12.6T · RNT 12.6T 2026 | `gladiator-rnt-2026-touring.jpg` | брелок «RNT 12.6T 2026 · брелок» (`origin26tkey`) |
| 30 | 2 | Gladiator ONE Red; ONE Red 12.6 · ONE 10.8 Red 2026 | `gladiator-one-red-2026.jpg` | брелок «ONE Red 10.8 · брелок» (`one26akey`); брелок «ONE Red 12.6 · брелок» (`one26tkey`) |
| 31 | 2 | Gladiator ONE Lime; ONE Lime 12.6 · ONE 10.8 Lime 2026 | `gladiator-one-lime-2026.jpg` | брелок «ONE Lime 10.8 · брелок» (`one26akey`); брелок «ONE Lime 12.6 · брелок» (`one26tkey`) |
| 32 | 2 | Gladiator ONE White; ONE White 12.6 · ONE 10.8 White 2026 | `gladiator-one-white-2026.jpg` | брелок «ONE White 10.8 · брелок» (`one26akey`); брелок «ONE White 12.6 · брелок» (`one26tkey`) |
| 33 | 2 | Gladiator ONE KIDS · ONE 9.6 KIDS 2026 | `gladiator-one-kids-2026.jpg` | брелок «ONE KIDS 9.6 · брелок» (`onekidskey`) |
| 34 | 2 | Gladiator ART 90TH (2021) · ART 10.8 90TH | `gladiator-art-90th-2021.png` | брелок «ART 90TH (AUDIO) 10.8 · брелок» (`art90key`) |
| 35 | 2 | Gladiator ART AVO (2021) · ART 10.8 AVO | `gladiator-art-avo-2021.png` | брелок «ART AVO 10.8 · брелок» (`artavokey`) |
| 36 | 2 | Gladiator ART MERMAID (2021) · ART 10.8 MERMAID | `gladiator-art-mermaid-2021.png` | брелок «ART MERMAID 10.8 · брелок» (`artmermaidkey`) |
| 37 | 2 | Gladiator ART RIDE (2021) · ART 10.8 RIDE | `gladiator-art-ride-2021.png` | брелок «ART RIDE 10.8 · брелок» (`artridekey`) |
| 38 | 3 | Gladiator WIND (2022) · WIND 11.6 (2022) | `gladiator-wind-2022.jpg` | брелок «WIND 11.6 2022 · брелок» (`origin22akey`) |
| 39 | 3 | Gladiator WindSUP · WIND 11.6 2026 | `gladiator-wind-2026.jpg` | брелок «WindSUP 11.6 2026 · брелок» (`origin26akey`) |
| 40 | 3 | Gladiator RIVER 11.0-32 (2022) · RIVER 11.0-32 (2022) | `gladiator-river-2022.jpg` | брелок «RIVER 11.0 2022 · брелок» (`origin22a9key`) |
| 41 | 3 | Gladiator SPECIAL Fishing · FISHING 2026 | `gladiator-fishing-2026.jpg` | брелок «SPECIAL Fishing 12.6 · брелок» (`fishingkey`) |
| 42 | 3 | Gladiator SPECIAL Duo · DUO 15.2 (2026) | `gladiator-duo-2026.jpg` | брелок «SPECIAL Duo 15.2 · брелок» (`duokey`) |
| 43 | 3 | Gladiator Dragon 22.0 · 22.0 Dragon (2026) | `gladiator-dragon-2026.jpg` | брелок «Dragon 22.0 · брелок» (`dragonkey`) |
| 44 | 3 | Gladiator BIG SUP 17.0 · BIG Sup17.0 (2026) | `gladiator-big-sup-2026.jpg` | брелок «BIG SUP 17.0 · брелок» (`origin22akey`) |
| 45 | 3 | Gladiator Summit Sport · Summit Sport 14.0 x 24 2026 | `gladiator-summit-sport-2026.jpg` | брелок «Summit Sport 14.0 · брелок» (`summitkey`) |
| 46 | — | Aqua Marina Beast (Aqua Splash) · 10'6"x32" | `aqua-marina-beast-aqua-splash.jpg` | типовой брелок; цвета по фото |
| 47 | — | Aqua Marina Monster (Heat Wave) · 12'0"x33" | `aqua-marina-monster-heat-wave.jpg` | типовой брелок; цвета по фото |
| 48 | — | Aqua Marina Magma (Earth Wave) · 11'2"x33" | `aqua-marina-magma-earth-wave.jpg` | типовой брелок; цвета по фото |
| 49 | — | Aqua Marina Coral Touring (Raspberry) · 11'6"x31" | `aqua-marina-coral-touring-raspberry.jpg` | типовой брелок; цвета по фото |
| 50 | — | Aqua Marina Hyper · 11'6"x31" | `aqua-marina-hyper.jpg` | типовой брелок; цвета по фото |
| 51 | — | Aqua Marina Super Trip · 12'6"x32" | `aqua-marina-super-trip.jpg` | типовой брелок; цвета по фото |
| 52 | — | Aqua Marina Cascade (SUP- kayak) · 11'2"x34" | `aqua-marina-cascade-sup-kayak.jpg` | типовой брелок; цвета по фото |
| 53 | — | Aqua Marina Cascade Tandem (SUP- kayak) · 13'2"x34" | `aqua-marina-cascade-tandem-sup-kayak.png` | типовой брелок; цвета по фото |
| 54 | — | Aqua Marina Drift Fishing · 10'10"x38" | `aqua-marina-drift-fishing.jpg` | типовой брелок; цвета по фото |
| 55 | — | Aqua Marina Blade WindSUP · 10'6"x33" | `aqua-marina-blade-windsup.jpg` | типовой брелок; цвета по фото |
| 56 | — | Aqua Marina Dhyana Yoga · 10'8"x36" | `aqua-marina-dhyana-yoga.jpg` | типовой брелок; цвета по фото |
| 57 | — | Aqua Marina Glow · 10'4"x31" | `aqua-marina-glow.jpg` | типовой брелок; цвета по фото |
| 58 | — | Aqua Marina Halo · 10'0"x32" | `aqua-marina-halo.jpg` | типовой брелок; цвета по фото |
| 59 | — | Aqua Marina Pure Air · 10'10"x30" | `aqua-marina-pure-air.jpg` | типовой брелок; цвета по неполному фото (на фото только крупный план деки) |
| 60 | — | Aqua Marina Wave (surf) · 8'8"x30" | `aqua-marina-wave-surf.jpg` | типовой брелок; цвета по фото |
| 61 | — | Starboard iGO Zen SC / DC · 11'2"x31" | `starboard-igo-zen-sc-dc.jpg` | типовой брелок; цвета по неполному фото (фото сбоку) |
| 62 | — | Starboard iGO Deluxe DC · 11'2"x31" | `starboard-igo-deluxe-dc.jpg` | типовой брелок; цвета по неполному фото (фото сбоку) |
| 63 | — | Starboard iGO Wing Ready · 11'2"x31" | `starboard-igo-wing-ready.jpg` | типовой брелок; цвета по фото |
| 64 | — | Starboard iGO Tikhine Wave Deluxe SC · 10'8"x33" | `starboard-igo-tikhine-wave-deluxe-sc.jpg` | типовой брелок; цвета по фото |
| 65 | — | Starboard Icon Deluxe SC · 10'8"x33" | `starboard-icon-deluxe-sc.jpg` | типовой брелок; цвета по фото |
| 66 | — | Starboard Touring Deluxe S / M / L · 11'6"x29" | `starboard-touring-deluxe-s-m-l.jpg` | типовой брелок; цвета по фото |
| 67 | — | Starboard Touring Deluxe Lite M / L · 12'6"x30" | `starboard-touring-deluxe-lite-m-l.jpg` | типовой брелок; цвета по фото |
| 68 | — | Starboard The Wall · 12'6"x28" | `starboard-the-wall.jpg` | типовой брелок; цвета по неполному фото (фото сбоку) |
| 69 | — | Starboard All Star Airline Deluxe · 14'0"x24.5" | `starboard-all-star-airline-deluxe.jpg` | типовой брелок; цвета по фото |
| 70 | — | Starboard Sprint Airline Deluxe · 14'0"x24" | `starboard-sprint-airline-deluxe.jpg` | типовой брелок; цвета по фото |
| 71 | — | Starboard SUP Kid Racer Deluxe SC · 12'6"x21" | `starboard-sup-kid-racer-deluxe-sc.jpg` | типовой брелок; цвета по фото |
| 72 | — | Aqua Inc Carbon Tech Woven · 12'6"x26" | `aqua-inc-carbon-tech-woven.jpg` | типовой брелок; цвета по фото |
| 73 | — | Mistral Sunburst Air / Club · 10'5"x32" | `mistral-sunburst-air-club.png` | типовой брелок; цвета по фото |
| 74 | — | Mistral Sunburst · 9'0"x30" | `mistral-sunburst.png` | типовой брелок; цвета по фото |
| 75 | — | Mistral Aruba · 10'6"x32" | нет фото | типовой брелок; цвета приблизительные — нет фото |
| 76 | — | Mistral Havana · 10'6"x32" | нет фото | типовой брелок; цвета приблизительные — нет фото |
| 77 | — | Mistral Sun Rise Air · 10'6"x32" | нет фото | типовой брелок; цвета приблизительные — нет фото |
| 78 | — | Mistral Double · 10'6"x32" | нет фото | типовой брелок; цвета приблизительные — нет фото |
| 79 | — | Mistral Goldrush · 11'5"x30" | `mistral-goldrush.jpg` | типовой брелок; цвета по фото |
| 80 | — | Mistral Sun Flower · 11'6"x31" | нет фото | типовой брелок; цвета приблизительные — нет фото |
| 81 | — | Mistral Adventurist · 12'6"x30" | `mistral-adventurist.jpg` | типовой брелок; цвета по фото |
| 82 | — | Mistral Verde · 13'2"x31" | нет фото | типовой брелок; цвета приблизительные — нет фото |
| 83 | — | Mistral Vortex Air · 12'6"x26" | `mistral-vortex-air.png` | типовой брелок; цвета по фото |
| 84 | — | Molokai Finder Air Touring · 11'6"x30" | `molokai-finder-air-touring.jpg` | типовой брелок; цвета по фото |
| 85 | — | Molokai Striker Air Race Pro (navy) · 14'0"x22.5" | `molokai-striker-air-race-pro-navy.jpg` | типовой брелок; цвета по фото |
| 86 | — | Molokai Hero Air Race Pro (grey) · 14'0"x23.5" | `molokai-hero-air-race-pro-grey.jpg` | типовой брелок; цвета по фото |
| 87 | — | Molokai Hero Air Race (navy) · 14'0"x25" | `molokai-hero-air-race-navy.jpg` | типовой брелок; цвета по фото |
| 88 | — | Koi (FunWater) Koi 350 · 11'6"x33" | `koi-funwater-koi-350.jpg` | типовой брелок; цвета по фото |
| 89 | — | JS 335 / 350 Comanche · 11'0"x32" | `js-335-350-comanche.jpg` | типовой брелок; цвета по фото |
| 90 | — | JS 305 · 10'0"x32" | `js-305.jpg` | типовой брелок; цвета по фото |
| 91 | — | JS 335 Arctic · 11'0"x32" | `js-335-arctic.jpg` | типовой брелок; цвета по фото |
| 92 | — | JS 335 Aloha · 11'0"x32" | `js-335-aloha.jpg` | типовой брелок; цвета по фото |
| 93 | — | JS 335 Bounty · 11'0"x32" | `js-335-bounty.jpg` | типовой брелок; цвета по фото |
| 94 | — | JS 335 Red Queen · 11'0"x32" | `js-335-red-queen.jpg` | типовой брелок; цвета по фото |
| 95 | — | JS Dark Queen RQ335 · 11'0"x32" | `js-dark-queen-rq335.jpg` | типовой брелок; цвета по неполному фото (фото сбоку: виден только красный кант, остальное по названию) |
| 96 | — | JS Ninja NJ335 / NJ330 · 11'0"x32" | `js-ninja-nj335-nj330.jpg` | типовой брелок; цвета по неполному фото (фото сбоку) |
| 97 | — | JS Coral CR335 · 11'0"x32" | `js-coral-cr335.jpg` | типовой брелок; цвета по фото |
| 98 | — | JS GQ Blue GQ290 · 9'6"x30" | `js-gq-blue-gq290.jpg` | типовой брелок; цвета по неполному фото (фото сбоку) |
| 99 | — | JS GQ Orange GQ290 · 9'6"x30" | `js-gq-orange-gq290.jpg` | типовой брелок; цвета приблизительные — в карточке фото весла, а не доски |
| 100 | — | JS Future FT380 · 12'6"x30" | `js-future-ft380.jpg` | типовой брелок; цвета по неполному фото (фото сбоку) |
| 101 | — | JS Spring SP · 11'6"x32" | `js-spring-sp.jpg` | типовой брелок; цвета по фото |
