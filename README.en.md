# SUP Mosaic

A stencil generator for fuse beads (Hama/Perler-style thermal mosaic) on SUP boards: full-size board models and keychains. You place boards on the peg field, the app counts beads by colour, draws bead cells in the free space of the sheet and saves a 1:1 PDF for printing.

Live app: https://akaguny.github.io/sup-mosaic/ · the documentation lives there too — the "Документация" link in the header.

> The interface and the in-app documentation are in Russian. This file is the English overview.

## What's inside

| | |
|---|---|
| Boards | 104 full-size models of 8 brands: Gladiator (48), Aqua Marina (15), JS (13), Starboard (11), Mistral (11), Molokai (4), Aqua Inc, Koi |
| Keychains | one per board: 42 traced from product-card photos (all Gladiator), the other 56 are generic, built from shared rules |
| Colours | Artkal S, sampled from product-card photos; 15 boards have no or incomplete photos and are marked "≈ colours" |
| Bead sets | Artkal S, Hama midi, Perler, MARD — colours are mapped to the chosen set by nearest shade |
| Printing | A4, A3, Letter; 2.6 / 5 / 10 mm pitch; PDF of one sheet or all |

## Documents

The documentation is Russian-only and shipped with the app (`docs.html`), the source files are in `docs/`.

| Document | For | About |
|---|---|---|
| [Руководство](docs/user-guide.md) | user | how to build a sheet, change colours, print, assemble a keychain |
| [Правила брелока](docs/keychains.md) | both | width in inches, what to keep and what to drop, the ring |
| [Цвета](docs/colors.md) | both | how Artkal colours are picked, table by series |
| [Статус каталога](docs/status.md) | both | all 101 catalogue positions: what is done, what is missing |
| [Решения и вопросы](docs/decisions.md) | both | decisions and open questions |
| [Форматы данных](docs/data-format.md) | developer | `data/*.json`, grid symbols, board ids |
| [Устройство приложения](docs/architecture.md) | developer | modules, loading, storage, printing |
| [История изменений](CHANGELOG.md) | both | what changed per version |
| [Аудит безопасности](SECURITY-AUDIT.md) | developer | security review (Russian) |

## Structure

```
index.html, styles.css, docs.html   app page, styles, documentation viewer
js/                                 app modules (boot → palette → catalog → state → layout → draw → ui → app)
data/                               palettes, board catalogue, photo-traced drawings, colour keys, renames
tools/                              agent tools: photos from PDF, grid drafts, colours, review sheets, smoke test
docs/                               documentation
```

The app is a static site with no build step: any static file server works, e.g.
`python3 -m http.server 8000 --bind 127.0.0.1` in the repository root.

## Security notes

- Third-party browser libraries are loaded from cdnjs **with Subresource Integrity** (`jsPDF 4.2.1`, `marked 18.1.1`, `DOMPurify 3.4.17`); the hashes are pinned in `index.html` and `docs.html`.
- Markdown from `docs/*.md` is sanitized with DOMPurify (with `style`, `form`, `input` forbidden) before it reaches the DOM, and links with unsafe schemes are stripped.
- What the app reads back from `localStorage` is checked: draft and profile structure, settings ranges, board and colour ids, sheet and board counts; the palette and catalogue dictionaries have no prototype.
- The Python tools under `tools/` parse untrusted PDFs and photos; run them in their own venv or container.
- Reports: [audit #1](SECURITY-AUDIT.md) (before the fixes), [audit #2](SECURITY-AUDIT-2.md) (after), [audit #3](SECURITY-AUDIT-3.md) (verification of the fixes).

Accepted risks:

- No CSP: a meta policy would break the claude.ai artifact runtime, and GitHub Pages does not let static files set headers. The app handles no foreign data and sends none.
- Google Fonts receives the visitor's IP and User-Agent. A fully local build would need the woff2 files in the repository.
- All `*.github.io` project sites share one origin, so another Pages project of yours can read this app's `localStorage`. Only a custom domain (CNAME) removes that.
- The libraries stay on a CDN (no local vendoring) — integrity rests on SRI.

## License

MIT — see [LICENSE](LICENSE).
