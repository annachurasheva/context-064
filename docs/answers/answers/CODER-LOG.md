***

## TASK‑0300 · 09.10.2026

**Коммит:** `64a5aaf`

**Суть задачи:**

Ошибка - переиздать

***

## TASK‑0301 · 09.11.2026

**Коммит:** `08f0f20`

**Суть задачи:**

Ошибка - отдача содержала .gitignore и package-lock.json вне разрешённого списка; доотдача TaskRegistry.tsx запрошена

***

TASK-0301 · 09.11.2026

**Коммит:** `08f0f20`

Дельта — подтверждает PASS.

***

## TASK-0302 · 11.09.2026

**Коммит:** `9b7faa9`

**Суть задачи:**

Создан `scripts/InspectOK-DOM.ps1` — скрипт PowerShell 7+ для снятия карты DOM ok.ru через CDP.
Параметры: `-Scenario` (profile_page, comments_author, group_page), `-Port` (9226 для user_01).
Перед сценарием — однократный опрос endpoint `http://localhost:PORT/json`.
Структура отчёта: 15 секций инспекционной библиотеки строго по ключам [01]...[15]:
[01] PAGE, [02] SELECTED_ENTITY, [03] ENTITY_CANDIDATES, [04] EVENT_CONTAINER, [05] EVENT_TEXT,
[06] DATE_TIME, [07] ROOT_CONTEXT, [08] COMMENT_URL, [09] TRIANGLE_ANCHOR, [10] PAGE_BEHAVIOR,
[11] SHADOW_DOM, [12] CONTEXT_MENU, [13] RAW_HTML, [14] SELECTORS, [15] NOTES.
Отчёты сохраняются в `docs/dom-inspection/OK_<scenario>_<timestamp>.json` с header и sections.
Примечание: секции [01] PAGE и [15] NOTES заполнены через HTTP endpoint, остальные требовали WebSocket.

***

## TASK-0302 (этап 2) · 11.09.2026

**Коммит:** `0610007`

**Суть задачи:**

Реализован полноценный сбор DOM через `System.Net.WebSockets.ClientWebSocket` (встроен в .NET Core/PowerShell 7, внешние модули запрещены).
Алгоритм: подключение по `webSocketDebuggerUrl`, выполнение CDP-команд (`Page.enable`, `DOM.enable`, `DOM.getDocument`, `DOM.querySelectorAll`, `Runtime.evaluate`).
Добавлена валидация сценария по URL открытой вкладки:
- `profile_page` → URL содержит `/profile/`
- `group_page` → URL содержит `/group/` или главная сообщества
- `comments_author` → лента с комментариями (/feed/, /topic/, /discussion/)
При несовпадении — СТОП с сообщением «для сценария X откройте страницу с …, сейчас открыто: <url>».
Параметр `-UrlFilter` добавлен как ручное перекрытие для нестандартных страниц.
Заполнены секции [02]–[14] реальными данными со страницы OK.ru (имя профиля/группы, текст события, дата, HTML, селекторы).
Статусы секций изменены на `complete` по факту заполнения.
Стоп-условие: если WebSocket-рукопожатие не удалось — скрипт останавливается с явной строкой ошибки.
Версия скрипта: 2.0.0.

***