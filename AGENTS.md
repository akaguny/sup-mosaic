# SUP-мозаика — заметки для агента

Приложение: https://akaguny.github.io/sup-mosaic/ · артефакт: https://claude.ai/artifact/VMAbzmZZjhK3KREbrzP7yL. Пользователь собирает из термомозаики брелоки и модели SUP-досок, которые знает в жизни; главный критерий — узнаваемость конкретной доски конкретного года.

## В начале сессии

1. Загрузите скилл **sup-keychain-stencils** — правила стиля и процесс.
2. Прочитайте этот файл, затем [agent/status.md](agent/status.md) — что сделано и что следующее.
3. Скачайте проект целиком (`Artifact list scope=files`, затем `Artifact read` с `paths`) и работайте в копии. Порядок — в [agent/workflow.md](agent/workflow.md).

## Документы агента

Всё служебное лежит в `agent/`; пользовательская документация — только `docs/` (руководство, правила брелока, цвета), её не засоряем.

| Файл | О чём |
|---|---|
| [agent/status.md](agent/status.md) | статус 101 позиции выгрузки: что сделано, чего не хватает |
| [agent/workflow.md](agent/workflow.md) | порядок работы: инструменты, проверка, публикация |
| [agent/data-format.md](agent/data-format.md) | форматы `data/*.json`, символы сетки, id досок |
| [agent/architecture.md](agent/architecture.md) | модули, загрузка, хранение, печать |
| [agent/audit/](agent/audit/) | отчёты аудита безопасности: [1](agent/audit/audit-1.md), [2](agent/audit/audit-2.md), [3](agent/audit/audit-3.md) |
| [CHANGELOG.md](CHANGELOG.md) | история версий и что менялось |

Обзор проекта — [README.md](README.md), английский — [README.en.md](README.en.md).

## Правила, которые легко нарушить

- Не переписывайте проект заново и не трогайте доски вне выбранного блока.
- Переименовали модель или убрали сетку — добавьте пару в `data/rename.json`.
- Перед публикацией — `tools/check.js` с `errors: []`.
- Публикуйте в тот же URL только изменённые файлы; `.py` — с `contentType: "text/plain"`; возможности артефакта не передавайте.
- Основная площадка — GitHub (`main` → GitHub Pages); артефакт claude.ai обновляйте только если просили.
- Вместе с данными обновляйте `agent/status.md` и `CHANGELOG.md`; всё служебное — в `agent/`, не в `docs/`.
- Скрипты пачек `tools/designs_batch*.py` повторно не запускайте — затрут ручные правки сеток.
