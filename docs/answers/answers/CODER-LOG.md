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
***

## TASK-0302 · 11.09.2026

**Коммит:** `24bd744`

**Суть задачи:**

Создан `scripts/InspectOK-DOM.ps1` — скрипт PowerShell 7+ для снятия карты DOM ok.ru через CDP.
Параметры: `-Scenario` (profile_page, comments_author, group_page), `-Port` (9226 для user_01).
Перед сценарием — однократный опрос endpoint `http://localhost:PORT/json`.
Структура отчёта: 15 секций инспекционной библиотеки строго по ключам [01]...[15]:
[01] PAGE, [02] SELECTED_ENTITY, [03] ENTITY_CANDIDATES, [04] EVENT_CONTAINER, [05] EVENT_TEXT,
[06] DATE_TIME, [07] ROOT_CONTEXT, [08] COMMENT_URL, [09] TRIANGLE_ANCHOR, [10] PAGE_BEHAVIOR,
[11] SHADOW_DOM, [12] CONTEXT_MENU, [13] RAW_HTML, [14] SELECTORS, [15] NOTES.
Отчёты сохраняются в `docs/dom-inspection/OK_<scenario>_<timestamp>.json` с header (PORTAL, PAGE_TYPE, URL, DATE, TIME, ENTITY_TYPE, ENTITY_NAME, EVENT_TYPE, SOURCE_CONTEXT) и sections.
Стоп-условия реализованы: endpoint не отвечает → ошибка и выход; вкладка ok.ru не найдена → ошибка и выход.
Примечание: полноценная работа с CDP требует WebSocket (модуль PSWebSocket или внешняя утилита); текущая версия заполняет секции [01] PAGE и [15] NOTES через HTTP endpoint, остальные секции помечены как `pending_cdp_websocket`.

***