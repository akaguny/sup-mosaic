# Аудит безопасности №2 — после исправлений

Второй проход (Claude Code 2.1.310, `--model opus --effort high`, только чтение) по состоянию на коммит `bb0a5e1`.
Пункты 1–4 и 7 этого отчёта закрыты в следующем коммите (валидация листов/профилей, запасной экспорт PDF через `doc.save`), `.nojekyll` добавлен.
Пункты `i2` (CSP) и `i5` (локальные шрифты) осознанно не делались — см. раздел «Принятые риски» в README.

## Вердикт

- **Репозиторий: можно публиковать.** Секретов, личных данных и лишних файлов нет. Перед публикацией стоит исправить README и CHANGELOG: там написано, что проверяются все значения из хранилища, а это неправда (находка 6).
- **GitHub Pages в нынешнем виде: нет.** Мешают не уязвимости, а две функциональные проблемы:
  1. Без `.nojekyll` документация на Pages, скорее всего, не откроется (П1).
  2. Без `window.claude` на Pages не работает экспорт PDF, а это главная функция (П2).
- **Безопасность.** Критичных и высоких находок нет. Все остаточные — low, и для каждой нужна запись в origin: CDN, другой ваш Pages-проект или сам пользователь.

В репозитории я ничего не менял (`git status` чистый). Копию сайта запускал из `/tmp/audit2` в headless Chromium.

## Остаточные находки

| # | Крит. | Где | Что воспроизведено | Исправление |
|---|---|---|---|---|
| 1 | low | `app.js:52-53`, `app.js:31` → `state.js:22` | Лист без `swap` или со `swap:null`, например `{"sheets":[{"items":[{"s":"Gladiator|ORIGIN|22x6","c":0,"r":0}]}]}`: `TypeError … reading 'S77'`, приложение не стартует. Поломка постоянная: `saveDraft()` стоит в конце `render()` (`ui.js:16`) и не выполняется. Со `swap:"x"` падает замена цвета. Через профиль поломка держится до перезагрузки. | В `.map(sh=>…)` собирать лист заново: `{items, swap:sw(sh.swap)}`, где `sw` оставляет только пары `own(PAL,k)&&typeof v==="string"&&own(PAL,v)`. То же для `gswap`. |
| 2 | low | `ui.js:11`, `state.js:23` (O(n²)), `app.js:52` | Лимита на число досок нет. 40 000 непересекающихся досок за полем — это 2,2 МБ, в localStorage помещается. Старт занимает 55 с, и так при каждом `render()`, включая resize. Зависание тоже постоянное. | Ограничить число досок на листе (≤200) и листов (≤500), `c`/`r` через `numIn(…,-120,240)`, `rot` через `numIn(…,0,3)`. |
| 3 | low | `app.js:31` | Профиль `{"sheets":[1]}`: длина проверяется до фильтра, получается `S.sheets=[]`, и любое действие падает (`reading 'items'`) до перезагрузки. | Проверять `sheets.length` после фильтра, при пустом — `throw`. |
| 4 | low | `app.js:52`, `palette.js:11`, `app.js:45` | `it.c/r/rot/cw` не проверяются. При `c:"x"` или без `c` получается NaN, и экспорт PDF падает с `Invalid arguments passed to jsPDF.circle`. Исключение не перехвачено: `drawSheet` вызывается до `try`, тоста нет. Мусор в `cw` и `gswap` тихо превращается в S07 и сохраняется в расцветки. | Валидировать `cw` (ключи из `ROLE`, значения `own(PAL,v)`). Цикл `drawSheet` и `new jspdf.jsPDF` (`app.js:44`) перенести внутрь `try`. |
| 5 | low (новое) | GitHub Pages, нет CNAME | Все project-сайты на `akaguny.github.io/*` живут в одном origin. Любой другой ваш Pages-проект или XSS в нём читает и пишет `sup-mosaic-*` (то есть может вызвать находки 1–2) и выполняет код в этом приложении. | Отдельный поддомен через CNAME (домен подтвердить в настройках GitHub, иначе возможен захват) или принять риск. |
| 6 | low (новое) | `README.md:48`, `README.en.md:52`, `CHANGELOG.md:10`, `README.md:50`, `README.en.md:54`, `SECURITY-AUDIT.md:1` | Фраза «validates every value it reads back» и «отбраковка … цветов» не соответствуют коду (находки 1–4). README отсылает к «принятым рискам» в SECURITY-AUDIT.md, но там такого раздела нет, отчёт описывает состояние до исправлений (без SRI, jsPDF 2.5.1), а первая строка — фраза из чата «Аудит готов…». | Переформулировать, например «проверяются структура, настройки и id досок». В SECURITY-AUDIT.md добавить сверху блок «Статус на bb0a5e1» (раздел «первый аудит» ниже). |
| 7 | low | `docs.html:100` | Конфиг DOMPurify по умолчанию пропускает `style`. Проверено: md с `<div style="position:fixed;inset:0">` перекрывает страницу, а `<img src=https://…>` уходит внешний запрос (трекинг). `<form action>` и `<input>` по allowlist тоже разрешены, но их я не прогонял. | `DOMPurify.sanitize(html,{FORBID_TAGS:["style","form","input","button","textarea","select"],FORBID_ATTR:["style"]})` плюс CSP `img-src 'self' data:`. |
| П1 | функц., блокирует Pages | корень репозитория | Без `.nojekyll` Pages собирает сайт Jekyll с `jekyll-optional-front-matter`. Тогда `.md` без front matter превращаются в `.html`, а `README.md` и `docs/*.md`, скорее всего, не публикуются, и `fetch` в `docs.html:99` получит 404. Не проверено: сайт ещё не выложен, Jekyll локально нет. | Пустой файл `.nojekyll` или деплой через Actions (`upload-pages-artifact`). Путей на `_` в репозитории нет, побочных эффектов не будет. После деплоя проверить `curl -I …/README.md`. |
| П2 | функц. | `app.js:58` | На Pages нет `window.claude`, поэтому `downloads=null` и обе PDF-кнопки отключены. | Если `downloads` нет — запасной вариант `doc.save(filename)`. |
| i1 | info | `docs.html:77` | `lib/marked.umd.min.js` собрал сам cdnjs: в npm-пакете 18.1.1 есть только `lib/marked.umd.js`. SRI закрепляет минификацию cdnjs, а не файл автора. jsPDF и DOMPurify побайтно совпадают с npm. | Положить `marked.umd.js` из npm в репозиторий или ссылаться на `lib/marked.umd.js` с новым хешем. Есть 18.1.2, но там только багфиксы. |
| i2 | info | `index.html`, `docs.html` | CSP по-прежнему нет. Pages на ответы 200 не ставит ни CSP, ни X-Frame-Options, ни nosniff (у `pages.github.com` из заголовков безопасности только ACAO `*`). Статикой можно задать только `<meta http-equiv=CSP>` и `<meta name=referrer>`. `frame-ancestors`, XFO, `sandbox` и `report-uri` через meta не работают, поэтому от кликджекинга не закрыться (последствия малые). | `default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; object-src 'none'; base-uri 'none'; form-action 'none'`. Для `docs.html` встроенный скрипт вынести в `js/docs.js` или разрешить по `'sha256-…'`. Проверить, что не ломается артефакт на claude.ai. |
| i3 | info | `tools/check.js:2`, `:9` | `check.js` тестирует только `index.html`, поэтому сбой SRI или рендера в `docs.html` не заметит. Недоступный CDN (`ERR_*`) по-прежнему игнорируется. В комментарии к запуску нет `--bind`. | Добавить заход на `docs.html#status` с проверкой `#doc table`. |
| i4 | info | `docs.html:103-104`, `app.js:16`, `app.js:24` | `/^https?:/` без `i`: ссылки `HTTPS://` и `//host` открываются в той же вкладке. `byFile[f]` — обычный объект: `[x](__proto__)` даёт `#undefined`, вреда нет. `pitch` проверяется через `+o.pitch`, но сохраняется как был (`[5]`, `"5"`). `name` профилей из db не проверяется перед `localeCompare`. | `/i`; `Object.hasOwn(byFile,f)`; `o.pitch=+o.pitch`; фильтр как в `lsArr` для db. |
| i5 | info | `index.html:3`, `docs.html:7` | Google Fonts: каждое открытие передаёт Google IP и User-Agent посетителя, на публичном сайте это вопрос GDPR. | woff2 в репозитории. |

## Проверено, чисто

- **SRI.** sha384 всех трёх файлов с cdnjs я посчитал сам, они совпадают с атрибутами `integrity`. Версии внутри файлов: 4.2.1, 18.1.1, 3.4.17. cdnjs отдаёт `ACAO: *` и `immutable`, так что `crossorigin` работает. Подменил ответы CDN в Chromium: на обеих страницах скрипты заблокированы, отказ безопасный (документация показывает ошибку, PDF недоступен), `check.js` засчитывает ошибку «valid digest». Других скриптов с CDN нет.
- **DOMPurify.** HTML вставляется в `innerHTML` только в одном месте, `docs.html:100`; на `:106` туда пишется пустая строка. Прогнал 32 нагрузки: mXSS через `math`/`mglyph`/`svg`/`style`/`table`/`noscript`/`template`/`foreignObject`, `javascript:`/`data:`/`vbscript:` с разными кодировками, `ontoggle`, `onclick`. Ни одна не выполнилась. После sanitize код только переносит узлы (`replaceWith`/`append`) без повторного разбора, а `href` переписывает на id из белого списка. Клоббер `id="doc"` и `id="byFile"` не срабатывает: глобальные имена объявлены через `const`, а `getElementById` находит `<article>` первым.
- **marked 18.** `parse` возвращает строку синхронно. Все 11 документов рендерятся, число таблиц совпадает с исходным md (17 таблиц), все обёрнуты в `.tbl`.
- **jsPDF 4.2.1.** Экспортировал A4 (квадраты) и A3 landscape mini (кружки) на 4.2.1 и 2.5.1. PDF отличаются только `/Producer` и `/ID`, растры при 100 dpi побайтно одинаковы. Экспорт всех 254 листов тоже работает. Все GitHub-advisory jsPDF исправлены в версиях ≤4.2.1. DOMPurify 3.4.17 закрывает последние GHSA от 12.10.2026, и все они касаются режимов, которые здесь не используются. Версия marked 18.1.1 не попадает ни в один уязвимый диапазон. `npm audit` по трём версиям: 0.
- **Валидация, которая работает.** Пробовал `__proto__`/`constructor` в `paper`, `palette`, `cw`, `swap`, `gswap`; `cols:1e9`, `rows:-5`, `margin:"x"`, `box:null`, `cur:"x"`/`1e9`, `sheets:[]`/`[1,null,{}]`; не-массивы в profiles и colorways. Падений и зависаний нет.
- **Пункт B.** Разобрал acorn'ом 107 глобальных имён в 7 модулях и в UMD jsPDF: дублей нет, `own`, `numIn`, `cleanSettings`, `lsArr` ни с чем не пересекаются. TDZ нет: `lsCw` → `lsArr` вызывается только во время работы (`loadProfiles`, `cwSave`, `cwDel`), уже после выполнения `app.js`. `Object.hasOwn` поддерживается с Chrome 93, Firefox 92, Safari 15.4, а marked 18 сам использует его и `#private`, так что регресса нет. `Object.create(null)`: `for…in` в `conv` и `Object.keys(PAL)` работают, вызовов `.hasOwnProperty()`, spread и `JSON` на этих словарях нет.
- **Репозиторий.** 39 файлов, все с режимом 100644. Нет `.pyc`, вложенного `.git`, игнорируемого мусора. `git fsck` чистый. Во всех трёх коммитах автор только `akaguny@users.noreply.github.com`, ни в одном нет e-mail, домашних путей или токенов. Remote не настроен, Pages ещё не выложен (404). LICENSE корректен: MIT, 2026, akaguny совпадает с автором коммитов. MIT не даёт прав на товарные знаки брендов досок, об этом можно добавить строку. Сторонние библиотеки грузятся с CDN и в репозитории не лежат, поэтому NOTICE не нужен.

## Первый аудит: статус по пунктам

| Пункт | Статус |
|---|---|
| 1. SRI | **Закрыто.** Остаток — сборка marked от cdnjs (i1); библиотеки локально так и не положены. |
| 2. Санитайзер и `javascript:` | **Закрыто.** Остаётся HTML-инъекция `style`/`form`/`img` (7). |
| 3. localStorage | **Частично.** Прототипы, настройки и id досок закрыты. `swap`, `c`/`r`/`rot`/`cw`, лимиты и пустой профиль — нет (1–4). |
| 4. jsPDF | **Закрыто**, вывод PDF проверен. |
| 5. Python-парсеры | **Принято как риск** (README советует venv). Версии pdfminer и Pillow не проверялись. |
| 6. `sys.path` | **Закрыто**, во всех 6 скриптах. |
| 7. `--bind` | **Закрыто** в `workflow.md` и `README.en.md`; остался комментарий в `check.js:2`. |
| 8. CSP | **Не закрыто** (i2). |
| 9. Google Fonts | **Не закрыто** (i5). |
| 10. `#__proto__` | **Закрыто.** `byFile` — info (i4). |
| 11. Публичный URL | **Принято.** |

Временные файлы проверки лежат в `/tmp/audit2`.

Sources:
- [jsPDF security advisories](https://github.com/parallax/jsPDF/security/advisories) · [Snyk: jspdf](https://security.snyk.io/package/npm/jspdf) · [Aikido: jspdf](https://intel.aikido.dev/packages/npm/jspdf) · [GHSA-9vjf-qc39-jprp](https://github.com/advisories/GHSA-9vjf-qc39-jprp) · [CVE-2026-31898 (NVD)](https://nvd.nist.gov/vuln/detail/CVE-2026-31898) · [CVE-2026-31938](https://orbisappsec.com/blog/how-cross-site-scripting-happens-in-jspdf-and-how-to-fix-it)
- [DOMPurify advisories](https://github.com/cure53/DOMPurify/security/advisories) · [CVE-2026-49978 (GitLab)](https://advisories.gitlab.com/npm/dompurify/CVE-2026-49978/) · [CVE-2026-116804 (Strix)](https://www.strix.ai/cve/CVE-2026-116804) · [CVE-2026-116802 (Strix)](https://www.strix.ai/cve/CVE-2026-116802) · [opensearch PR #2938](https://github.com/opensearch-project/dashboards-observability/pull/2938)
- [marked advisories](https://github.com/markedjs/marked/security/advisories) · [marked v18.1.2](https://github.com/markedjs/marked/releases/tag/v18.1.2)
