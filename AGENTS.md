# SUP-мозаика — заметки для агента

Приложение: https://claude.ai/artifact/VMAbzmZZjhK3KREbrzP7yL. Пользователь собирает из термомозаики брелоки и модели SUP-досок, которые знает в жизни; главный критерий — узнаваемость конкретной доски конкретного года.

## В начале сессии

1. Загрузите скилл **sup-keychain-stencils** — правила стиля и процесс.
2. Прочитайте этот файл, затем [docs/status.md](docs/status.md) — что сделано и что следующее, и [docs/decisions.md](docs/decisions.md) — решения пользователя и открытые вопросы.
3. Скачайте проект целиком (`Artifact list scope=files`, затем `Artifact read` с `paths`) и работайте в копии. Порядок — в [docs/workflow.md](docs/workflow.md).

## Документация

| Файл | О чём |
|---|---|
| [README.md](README.md) | обзор проекта и структура |
| [docs/user-guide.md](docs/user-guide.md) | руководство пользователя |
| [docs/keychains.md](docs/keychains.md) | правила брелока |
| [docs/colors.md](docs/colors.md) | подбор цветов, таблица по сериям |
| [docs/status.md](docs/status.md) | статус 101 позиции выгрузки |
| [docs/decisions.md](docs/decisions.md) | решения пользователя, открытые вопросы |
| [docs/data-format.md](docs/data-format.md) | форматы `data/*.json` |
| [docs/architecture.md](docs/architecture.md) | модули, загрузка, хранение |
| [docs/workflow.md](docs/workflow.md) | инструменты, проверка, публикация |
| [CHANGELOG.md](CHANGELOG.md) | история версий |

## Правила, которые легко нарушить

- Не переписывайте проект заново и не трогайте доски вне выбранного блока.
- Переименовали модель или убрали сетку — добавьте пару в `data/rename.json`.
- Перед публикацией — `tools/check.js` с `errors: []`.
- Публикуйте в тот же URL только изменённые файлы; `.py` — с `contentType: "text/plain"`; возможности артефакта не передавайте.
- Вместе с данными обновляйте документацию: статус, цвета, решения, `CHANGELOG.md`.
- Скрипты пачек `tools/designs_batch*.py` повторно не запускайте — затрут ручные правки сеток.
