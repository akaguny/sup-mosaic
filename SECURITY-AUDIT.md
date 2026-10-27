Аудит готов. В репозитории я ничего не менял. Библиотеки с cdnjs скачивал только во временный каталог вне репозитория, чтобы посчитать SRI-хеши.

## Находки (по реальной опасности)

**1. Скрипты с CDN подключаются без SRI** — medium
`index.html:100` (jsPDF), `docs.html:77` (marked). Класс: цепочка поставок.
- **Как эксплуатируется:** если cdnjs скомпрометирован или подменён, чужой код выполнится в origin артефакта. Там он получит `localStorage` и `window.claude.use("db"/"user"/"downloads")`, то есть сможет читать и переписывать сохранённые профили и расцветки (`app.js:12`, `app.js:25`) и предлагать скачать подменённый «PDF».
- **Исправление:** положить копии рядом с кодом, например `vendor/jspdf.umd.min.js`, `vendor/marked.umd.min.js`, `vendor/purify.min.js`. Если оставлять CDN, то добавить `integrity` и `crossorigin`. Хеши я посчитал по файлам с cdnjs:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js" integrity="sha384-qovJwSBbRDPP5cEjCp8S0UP66wrvnjaa60XMOGzTNanrThcrGfXfnZkvgY8N1KT3" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/18.1.1/lib/marked.umd.min.js" integrity="sha384-7sjOQLpS2mL+qbjUOYVEk350vVNi+nPTKMQFruUWMDTzgcxzTJiwye3rHDJCJ9ZL" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.17/purify.min.js" integrity="sha384-P0JNneQf81HOl9VwNXK76cQ9VMD6Nfsnepxb0cCOg8+UzEdzgPHAPV4wVQrvYQSx" crossorigin="anonymous"></script>
  ```
  Если не обновляться, то для текущих версий: jsPDF 2.5.1 — `sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk`, marked 4.3.0 — `sha384-QsSpx6a0USazT7nK7w8qXDgpSAPhFsb2XtpoLFQ5+X2yFN6hvCKnwEzN8M5FWaJb`.
- **Побочный эффект:** `tools/check.js:9` отбрасывает все ошибки консоли, где есть `cdnjs`. Поэтому ошибку SRI (сообщение об integrity с адресом cdnjs) проверка не заметит. Локальные копии решают и эту проблему.

**2. Markdown вставляется в `innerHTML` без санитайзера, `javascript:`-ссылки не фильтруются** — low (теоретическая при нынешних данных)
`docs.html:99` — `el.innerHTML=marked.parse(...)`. marked по замыслу пропускает сырой HTML. `docs.html:101-102` переписывает только `http(s)` и внутренние `.md`, а ссылка вида `[x](javascript:…)` остаётся рабочей.
- **Как эксплуатируется:** нужно попасть в `*.md` в репозитории или в артефакте. Сейчас в md нет сырого HTML (единственный `<uid>` в `docs/architecture.md:32` стоит внутри code span), и все ссылки внутренние. Но `docs/status.md` и `docs/colors.md` агент пополняет текстом из PDF-выгрузки, то есть из чужих данных. Строка вроде `<img src=x onerror=…>`, перенесённая из PDF, выполнится в том же origin, что и приложение: `localStorage` и, вероятно, `window.claude`.
- **Исправление:**
  ```js
  el.innerHTML=DOMPurify.sanitize(marked.parse(await r.text()));
  // и в цикле по ссылкам, первой строкой:
  if(/^[a-z][a-z0-9+.-]*:/i.test(h)&&!/^(https?|mailto):/i.test(h)){a.removeAttribute("href");return}
  ```
  При переходе на marked 18 опции `{mangle:false,headerIds:false}` из этой строки нужно убрать: в v8+ их больше нет, а id заголовков по умолчанию и так не ставятся.

**3. Черновик и профили из хранилища читаются без проверки: можно намертво сломать приложение** — low
`app.js:40-41`, `app.js:20`, `catalog.js:59`, `palette.js:5`, `palette.js:11`, `layout.js:3`, `layout.js:6-7`, `draw.js:22`.

Прототипного загрязнения нет: `JSON.parse` и spread (`{...DEF,...d.settings}`) создают `__proto__` как обычное свойство. Но поля дальше используются как доверенные. Примеры значений `sup-mosaic-draft-v3`:
- `{"sheets":[]}` → `.every` даёт true → `S.cur=Math.min(0,-1)=-1` → `drawSheet` падает на `sh.items`.
- `{"sheets":[{"items":[{"s":"__proto__","c":0,"r":0}]}]}` → `byId["__proto__"]` равен `Object.prototype`, проверка проходит → падение на `s.g`. То же с `"constructor"` и `"toString"`.
- `"swap":{"S01":"__proto__"}` → `PAL["__proto__"]` истинно → `labOf(undefined)` → TypeError.
- `"settings":{"paper":"X"}` → TypeError в `geom`. `"cols":1e8` → `draw.js:22` рисует сотни миллионов линий, вкладка зависает. `"pitch":0,"cells":"cells"` → в `slots` получается `nc=Infinity`, бесконечный цикл и переполнение памяти.
- `"cur":"x"` → `NaN` → падение.

Поломка постоянная: `saveDraft()` стоит в конце `render()` (`ui.js:16`), поэтому плохой черновик не перезаписывается, пока пользователь сам не очистит хранилище.

Если `sup-mosaic-profiles` или `sup-mosaic-colorways` содержат не массив либо `name` не строка, то `app.js:13` (`.sort`/`localeCompare`) бросает исключение в async-функции, и список профилей не отрисуется.

- **Кто может это записать:** только код того же origin — CDN из п.1, XSS из п.2 или сам пользователь, испортивший данные. Общий ли origin у разных артефактов на хосте claude.ai, я не проверял. Если общий, то вектор межартефактный.
- **Исправление:**
  - словари без прототипа: `const PAL=Object.create(null)`, `const byId=Object.assign(Object.create(null),Object.fromEntries(...))`;
  - в `start()` и при загрузке профиля проверять состояние перед присваиванием:
  ```js
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),int=(v,a,b,d)=>Number.isFinite(+v)?Math.max(a,Math.min(b,Math.round(+v))):d;
  function cleanState(d){if(!d||!Array.isArray(d.sheets)||!d.sheets.length)return null;const s={...DEF,...(d.settings&&typeof d.settings==="object"?d.settings:{})};
    if(!own(PAPER,s.paper))s.paper=DEF.paper;if(![2.6,5,10].includes(+s.pitch))s.pitch=DEF.pitch;if(!own(SETS,s.palette))s.palette="artkal";
    if(!["boxes","cells","none"].includes(s.cells))s.cells=DEF.cells;s.cols=int(s.cols,9,120,29);s.rows=int(s.rows,9,120,29);s.margin=int(s.margin,3,25,8);s.box=int(s.box,10,80,25);
    const sw=o=>Object.fromEntries(Object.entries(o&&typeof o==="object"?o:{}).filter(([k,v])=>own(PAL,k)&&typeof v==="string"&&own(PAL,v)));
    const sheets=d.sheets.filter(sh=>sh&&Array.isArray(sh.items)).map(sh=>({swap:sw(sh.swap),items:sh.items.filter(it=>it&&typeof it.s==="string"&&own(byId,alias(it.s))).map(it=>({s:alias(it.s),c:int(it.c,0,119,0),r:int(it.r,0,119,0),rot:int(it.rot,0,3,0),...(it.cw&&typeof it.cw==="object"?{cw:Object.fromEntries(Object.entries(it.cw).filter(([k,v])=>["rail","deck","pad","acc","acc2"].includes(k)&&own(PAL,v)))}:{})}))}));
    return sheets.length?{settings:s,sheets,gswap:sw(d.gswap),cur:int(d.cur,0,sheets.length-1,0)}:null}
  ```
  - `lsProfiles`/`lsCw`: `Array.isArray(x)?x.filter(p=>p&&typeof p.id==="string"&&typeof p.name==="string"):[]`.

**4. jsPDF 2.5.1 устарел, на него есть опубликованные CVE** — low (теоретическая для этого кода)
`index.html:100`. Версия 2.5.1 попадает под CVE-2026-31938 (`output` в новое окно, 9.6), CVE-2026-25755 (`addJS`), CVE-2026-24737 (AcroForm), CVE-2026-31898 (`createAnnotation` color), CVE-2025-68428 (только Node-сборка), CVE-2025-57810 (PNG в `addImage`). Приложение вызывает только `jsPDF()`, `addPage`, `setFill/Draw/TextColor` (числа из `rgb()`), `circle/rect/line`, `setFont`, `text` и `output("blob")` (`draw.js:8-12`, `app.js:33-35`). Ни одна уязвимая функция не вызывается. Сканеры зависимостей всё равно пометят версию как critical.
- **Исправление:** jsPDF ≥ 4.2.1. Вызываемые функции в 4.x, судя по всему, не менялись, но PDF после обновления я не проверял. `check.js` экспорт PDF не тестирует, поэтому нужен ручной экспорт «этот лист» и «все листы» и проверка отрезка 50 мм.

**5. Python-инструменты разбирают недоверенные PDF и фото** — low
`photos.py:16-18` (pdfplumber → pdfminer.six), `photos.py:29-32` (poppler `pdfimages`/`pdftotext`), `Image.open` в `photos.py:43`, `photo_colors.py:44`, `raster.py:34`. Сам код безопасен: `subprocess` вызывается со списком аргументов без shell, имена выходных файлов `img-NNN.jpg` собираются из чисел.
- **Риск в библиотеках:** pdfminer.six до 20251230 подвержен CVE-2025-64512 и CVE-2025-70559 (загрузка pickle-CMap). Для RCE нужен заранее подложенный на диск `.pickle.gz`, в этом процессе это маловероятно. В Pillow предупреждение о decompression bomb срабатывает только после ~89 Мпикс, а `astype(float)` на такой картинке съедает ~2 ГБ памяти.
- **Исправление:** `pdfminer.six>=20251230`, свежие Pillow и poppler. У poppler здесь 26.01.0, Python-пакетов в этой среде нет, так что их версии проверить не удалось. Выгрузки лучше разбирать в отдельном venv или контейнере.

**6. `sys.path.insert(0, tools/)` даёт подмену модулей** — low/info
`colors_by_photo.py:10`, `photo_colors.py:18`, `raster.py:11`, `review.py:9`, `designs_batch1.py:6`, `designs_batch2.py:6`. Флаг `-I` убирает каталог скрипта из `sys.path`, а эти строки возвращают его на первое место. Тогда случайный `tools/json.py`, `numpy.py` или `PIL.py` (например, файл из выгрузки, сохранённый не туда) выполнится при импорте: `artkit.py:6` импортирует `json` уже после insert.
- **Исправление:** `sys.path.append(...)` вместо `insert(0, ...)`.

**7. Сервер для проверки слушает все интерфейсы** — low
`docs/workflow.md:23` — `python3 -m http.server 8765 -d <папка>` по умолчанию открыт на 0.0.0.0. Пока идёт проверка, вся папка (включая `.git/`, если раздаётся рабочая копия) доступна из локальной сети.
- **Исправление:** добавить `--bind 127.0.0.1`.

**8. Нет CSP** — info
Ни в одной странице нет `<meta http-equiv="Content-Security-Policy">`. Какие заголовки ставит хост артефакта, я не проверял. После переноса библиотек локально и выноса inline-скрипта `docs.html:78-107` в `js/docs.js` можно поставить в `<head>`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; object-src 'none'; base-uri 'none'; form-action 'none'">
```
`'unsafe-inline'` для стилей нужен из-за `<style>` и атрибутов `style=` в `index.html`. Риск: хост может вставлять собственный рантайм (`window.claude`) и сломаться от такой политики. Перед публикацией проверить в самом артефакте.

**9. Google Fonts** — info/приватность
`index.html:3`, `docs.html:7`. SRI к CSS Google Fonts неприменим: ответ зависит от User-Agent. Каждое открытие страницы передаёт Google IP и UA пользователя. Лучше держать woff2 локально через `@font-face` или обойтись системными шрифтами.

**10. `#__proto__` в адресе документации** — info
`docs.html:93`, `docs.html:96`: `byId[id]` по обычному объекту. Хеши `#__proto__` или `#constructor` дают `fetch(undefined)` и сообщение «Не удалось открыть undefined». Эксплуатации нет: путь берётся только из белого списка `DOCS`. Исправление: `Object.hasOwn(byId,id)?byId[id]:DOCS[0]`.

**11. Публичный URL артефакта** — info
`README.md:5`, `AGENTS.md:3`. Скорее всего так и задумано. Если артефакт приватный, сама ссылка доступа не даёт.

## Что проверено и чисто

- **DOM-вывод:** `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, строковый `setTimeout` встречаются только в `docs.html:99` и `:104` (вторая строка очищает элемент пустой строкой). Весь интерфейс (`ui.js`, `app.js`, `boot.js:9`) строится через `createElement`/`textContent`/`option.textContent`. Названия моделей, профилей и расцветок в HTML не попадают.
- **CSS-значения:** `style.background` получает hex из `palettes.json` через CSSOM, внедрить другие свойства так нельзя.
- **Canvas и PDF:** canvas `fillText` безопасен, `doc.text(String(s))` — обычный текст PDF. Имена файлов PDF собраны из констант и чисел (`app.js:35`).
- **URL:** `location.search` нигде не читается. `location.hash` используется только в `docs.html` как ключ белого списка. Открытых редиректов, `window.open`, `javascript:` в коде нет.
- **postMessage:** `postMessage` и обработчиков `message` нет, обмен с хостом идёт только через `window.claude.use`.
- **Импорт файлов:** его нет — ни `<input type=file>`, ни `FileReader`, ни drag-and-drop или буфера обмена, ни `createObjectURL`. Пункт 4 задания неприменим.
- **Загрузка модулей:** `boot.js:11` подключает только модули из константного списка, `boot.js:7` читает фиксированные `data/*.json`.
- **Данные:** в `data/*.json` нет `__proto__`, `constructor`, `<` и `>`.
- **Хранилище:** `db.collection("data/users/"+uid)` — uid выдаёт платформа, id документов генерирует приложение. В `localStorage` лежат только настройки, листы и расцветки, личных данных нет.
- **target=_blank:** `index.html:10` с `rel="noopener"`, внешние ссылки в документации тоже получают `noopener` (`docs.html:101`).
- **Python:** нет `os.system`, `shell=True`, `eval`/`exec`, `pickle`, `yaml`, сетевых запросов, зашитых учётных данных. Запись идёт только в фиксированные `data/*.json` (`artkit.py:83`, `artkit.py:88`) и по путям из аргументов, которые задаёт сам разработчик. Абсолютный путь в коде один — системный шрифт DejaVu, при его отсутствии берётся запасной.
- **tools/check.js:** Playwright на локальном URL. Инъекций нет, замечание только про фильтр ошибок `cdnjs` (п.1).
- **Секреты:** ключей, токенов, e-mail, домашних путей и приватных URL в отслеживаемых файлах нет. В истории git один коммит, неотслеживаемых файлов нет.

## Внешние зависимости и версии

| Библиотека | Сейчас | Рекомендуемая | Статус |
|---|---|---|---|
| jsPDF | 2.5.1 (`index.html:100`) | **≥ 4.2.1** (последняя на cdnjs) | 2.5.1 под CVE-2026-31938/25755/24737/31898, CVE-2025-68428 (Node), CVE-2025-57810. Уязвимые функции приложение не вызывает. Часть GitHub-advisories (GIF/BMP DoS, XMP, гонка в addJS) не открывалась, их диапазоны не уточнены. 4.2.1 закрывает все проверенные. |
| marked | 4.3.0 (`docs.html:77`) | **18.1.1**, путь `lib/marked.umd.min.js` | На 4.3.0 действующих advisory нет: ReDoS CVE-2022-21680/21681 исправлены в 4.0.10. CVE-2026-41680 касается только 18.0.0–18.0.1. Санитайзера у marked нет ни в одной версии. |
| DOMPurify | нет | **3.4.17** | В 2026 году исправлены CVE в 3.4.6–3.4.8, в основном режимы `IN_PLACE`/`SAFE_FOR_TEMPLATES`, которые здесь не нужны. |
| Google Fonts | CSS | woff2 локально | SRI неприменим, утечка IP/UA. |
| pdfminer.six (через pdfplumber) | не установлен в среде | **≥ 20251230** | CVE-2025-64512 и CVE-2025-70559 (неполный первый фикс). |
| poppler-utils | 26.01.0 | актуальная | Разбирает чужие PDF, обновлять регулярно. |

## Вердикт

Критичных и высоких уязвимостей нет. Каждый реальный сценарий атаки требует компрометации cdnjs или доступа на запись в репозиторий или артефакт. Публиковать можно после двух дешёвых правок.

**Сделать до публикации:**
1. Перенести jsPDF и marked в локальные файлы или хотя бы добавить `integrity` и `crossorigin` (п.1). Заодно поднять jsPDF до 4.2.1 и вручную проверить экспорт PDF (п.4).
2. Прогонять документацию через `DOMPurify.sanitize` и удалять ссылки с небезопасными схемами (п.2).

**Желательно в том же релизе:** проверка черновика и профилей и словари без прототипа (п.3), иначе одно битое значение в хранилище ломает приложение до ручной очистки.

**Остальное — для гигиены разработки:** `sys.path.append`, `--bind 127.0.0.1`, CSP после переноса библиотек и свежие pdfminer.six/Pillow на машине, где разбираются выгрузки.

Sources:
- [jsPDF security advisories (GitHub)](https://github.com/parallax/jsPDF/security/advisories)
- [GHSA-9vjf-qc39-jprp / CVE-2026-25755](https://github.com/advisories/GHSA-9vjf-qc39-jprp)
- [CVE-2026-24040 (SentinelOne)](https://www.sentinelone.com/vulnerability-database/cve-2026-24040/)
- [CVE-2026-31898 (SentinelOne)](https://www.sentinelone.com/vulnerability-database/cve-2026-31898/)
- [CVE-2026-24737 (SentinelOne)](https://www.sentinelone.com/vulnerability-database/cve-2026-24737/)
- [IBM bulletin по jsPDF](https://www.ibm.com/support/pages/security-bulletin-ibm-infosphere-optim-archive-viewer-affected-multiple-vulnerabilities-jspdf-cve-2026-24040-cve-2026-24043-cve-2026-24133-cve-2026-24737-3)
- [CVE-2025-68428 (OSV)](https://osv.dev/vulnerability/CVE-2025-68428)
- [CVE-2025-57810 (Mend)](https://mend.io/vulnerability-database/CVE-2025-57810)
- [CVE-2026-31938 (orbisappsec)](https://orbisappsec.com/blog/how-cross-site-scripting-happens-in-jspdf-and-how-to-fix-it)
- [marked security advisories (GitHub)](https://github.com/markedjs/marked/security/advisories)
- [marked 18.0.0–18.0.1 OOM (Patchstack)](https://patchstack.com/database/npm/plugin/marked/vulnerability/npm-marked-vulnerable-to-oom-denial-of-service-via-infinite-recursion-in-marked-tokenizer)
- [cdnjs: jspdf](https://cdnjs.com/libraries/jspdf), [marked](https://cdnjs.com/libraries/marked), [dompurify](https://cdnjs.com/libraries/dompurify)
- [CVE-2026-49458 DOMPurify (Debian)](https://security-tracker.debian.org/tracker/CVE-2026-49458), [CVE-2026-49978 (Debian)](https://security-tracker.debian.org/tracker/CVE-2026-49978)
- [CVE-2025-64512 pdfminer.six (Debian)](https://security-tracker.debian.org/tracker/CVE-2025-64512), [CVE-2025-70559 (Debian)](https://security-tracker.debian.org/tracker/CVE-2025-70559)
