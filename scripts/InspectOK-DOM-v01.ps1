#Requires -Version 7.0
# ============================================================================
#  АНОНС (что ищет и где)
#  --------------------------------------------------------------------------
#  Скрипт: InspectOK-DOM-v01.ps1 — версия исследования v01 (РУЧНОЙ ПРОТОКОЛ F12)
#  Порталы: ok.ru (основной домен); m.ok.ru — ТОЛЬКО запасной источник
#           поиска селекторов при неудаче на основном домене.
#           Мобильные представления НЕ исследуются (расширение не работает
#           на мобильных устройствах).
#
#  ЧТО ИЩЕТ:
#    Данные для анкеты okcom.js по порталу ОК (TASK-0304, узловая задача):
#    - селекторы имени автора (username, упоминание);
#    - контейнер события (комментарий/пост) и тип события (eventype);
#    - пермалинк комментария (глубокая ссылка);
#    - элемент и формат даты (GetTimestamp);
#    - точку вставки меню (attachMenuDomElement / TRIANGLE_ANCHOR);
#    - текстовый контейнер (GetEventText);
#    - корень и вложенность треда (IsNested, GetRootFor);
#    - поведение страницы (SPA/динамика) и наличие Shadow DOM.
#
#  ГДЕ (типы страниц и URL-паттерны):
#    P0  Дискуссия / комментарий   /discussions/.../<topic>/<message>
#    P0  Профиль                   /profile/NNN  или слаг имя.число{6,}
#    P0  Группа                    /group/NNN, groupNNN, короткий слаг
#    P1  Ответ на комментарий      /discussions/.../<topic>/<reply>
#    P1  Нить личных сообщений     нить ЛС
#    P1  Пост (запись)             пост/лента
#    P2  Упоминание / товар/фото   любые ссылки на автора, маршруты товара
#
#  МЕТОД (ручной протокол F12, принцип из connecting_a_new_portalinstruction.md):
#    Оператор вручную выбирает элемент (ПКМ -> "Проверить", $0), выполняет
#    точечные функции в Console DevTools Edge и фиксирует результат по
#    15 секциям. Скрипт НЕ обстреливает портал: движок потребляет селекторы
#    анкеты, а не массовые запросы (правило №0).
# ============================================================================

param(
    [Parameter(Mandatory=$true)][ValidateSet('profile_page','group_page','comments_author','reply_comment','messenger_thread','post','mention','product')][string]$Scenario,
    [string]$OutputDir = "$PSScriptRoot\..\docs\dom-inspection",
    [switch]$GenerateJsHelp
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# --- Анонс сценария ---
Write-Host "=== InspectOK-DOM v01 (РУЧНОЙ ПРОТОКОЛ F12) ===" -ForegroundColor Cyan
Write-Host "Сценарий: $Scenario"
Write-Host "Портал:   ok.ru (m.ok.ru - только запасной источник; мобильных представлений нет)" -ForegroundColor DarkGray

# --- Справочник сценариев: что ищем и где (URL-паттерны) ---
$scenarioMap = @{
    'profile_page'      = @{ pattern = '/profile/NNN | слаг имя.число{6,}'; target = 'имя автора в шапке профиля' }
    'group_page'        = @{ pattern = '/group/NNN | groupNNN | короткий слаг'; target = 'название сообщества (автор поста)' }
    'comments_author'   = @{ pattern = '/discussions/.../<topic>/<message>'; target = 'имя автора комментария' }
    'reply_comment'     = @{ pattern = '/discussions/.../<topic>/<reply>'; target = 'имя автора ответа (вложенность)' }
    'messenger_thread'  = @{ pattern = 'нить личных сообщений'; target = 'имя собеседника в нити' }
    'post'              = @{ pattern = 'пост/лента'; target = 'автор поста' }
    'mention'           = @{ pattern = 'любая ссылка на автора'; target = 'упоминание (не событие)' }
    'product'           = @{ pattern = 'маршрут товара'; target = 'имя автора отзыва' }
}

$info = $scenarioMap[$Scenario]

Write-Host ""
Write-Host "[INFO] Что ищем:  $($info.target)" -ForegroundColor Green
Write-Host "[INFO] Где (URL):  $($info.pattern)" -ForegroundColor Green
Write-Host ""

# --- Ручной протокол: инструкция оператору ---
Write-Host "=== ИНСТРУКЦИЯ ОПЕРАТОРУ (выполнить вручную в DevTools Edge) ===" -ForegroundColor Yellow
Write-Host "1. Откройте Microsoft Edge и перейдите на страницу с паттерном: $($info.pattern)"
Write-Host "2. ПКМ на '$($info.target)' -> 'Проверить' (элемент станет `$0 в Console)."
Write-Host "3. Перейдите на вкладку Console и выполните точечные функции:"
Write-Host "     getSelector(`$0)                - CSS-селектор элемента      [02]"
Write-Host "     findEntityCandidates(`$0)       - кандидаты идентичности     [03]"
Write-Host "     findEventContainer(`$0)         - контейнер события          [04]"
Write-Host "     extractMessageText(`$0)         - текст события              [05]"
Write-Host "     extractDate(`$0)                - дата                       [06]"
Write-Host "     findConversationContext(`$0)    - заголовок диалога          [07]"
Write-Host "     findTriangleAnchor(`$0)         - точка вставки меню         [09]"
Write-Host "     inspectShadowRoot(`$0)          - Shadow DOM                 [11]"
Write-Host "4. Зафиксируйте результаты в отчёт по 15 секциям."

if ($GenerateJsHelp) {
    Write-Host ""
    Write-Host "=== ГЕНЕРАЦИЯ JS-ПОМОЩНИКА ДЛЯ КОНСОЛИ ===" -ForegroundColor Magenta
    Write-Host "Скопируйте следующие команды в Console (библиотека из connecting_a_new_portalinstruction.md):"
    Write-Host @'
// Минимальный набор для v01 (полная библиотека — из connecting_a_new_portalinstruction.md)
var el = $0;
console.log('[02] SELECTOR:', getSelector(el));
console.log('[03] CANDIDATES:', JSON.stringify(findEntityCandidates(el), null, 2));
console.log('[04] CONTAINER:', findEventContainer(el));
console.log('[05] TEXT:', extractMessageText(el));
console.log('[06] DATE:', extractDate(el));
console.log('[07] CONTEXT:', findConversationContext(el));
console.log('[09] ANCHOR:', findTriangleAnchor(el));
console.log('[11] SHADOW:', inspectShadowRoot(el));
'@
}

# --- Подготовка структуры отчёта по 15 секциям ---
$reportSections = @{}
1..15 | ForEach-Object {
    $key = "{0:D2}" -f $_
    $name = switch ($_) {
        1 {"PAGE"}; 2 {"SELECTED_ENTITY"}; 3 {"ENTITY_CANDIDATES"}; 4 {"EVENT_CONTAINER"}
        5 {"EVENT_TEXT"}; 6 {"DATE_TIME"}; 7 {"ROOT_CONTEXT"}; 8 {"COMMENT_URL"}
        9 {"TRIANGLE_ANCHOR"}; 10 {"PAGE_BEHAVIOR"}; 11 {"SHADOW_DOM"}; 12 {"CONTEXT_MENU"}
        13 {"RAW_HTML"}; 14 {"SELECTORS"}; 15 {"NOTES"}
    }
    $reportSections["$key-$name"] = @{ description = $name; data = $null; status = "pending"; note = "" }
}

# --- Финальное сообщение оператору ---
Write-Host ""
Write-Host "=== ПОСЛЕ ВЫПОЛНЕНИЯ РУЧНОГО СБОРА ===" -ForegroundColor Green
Write-Host "Заполните секции 01-15 вручную на основе результатов функций."
Write-Host "Файл отчёта будет сохранён в: $OutputDir"
Write-Host "Имя файла: OK_$Scenario`_<timestamp>.json (шаблон ниже)."

# Шаблон отчёта для ручного заполнения
$finalReport = @{
    header = @{
        PORTAL = "ok.ru"
        PAGE_TYPE = $Scenario
        URL = "ВРУЧНУЮ: url открытой страницы"
        DATE = (Get-Date -Format "dd.MM.yyyy")
        TIME = (Get-Date -Format "HH:mm:ss")
        ENTITY_TYPE = "unknown"
        ENTITY_NAME = "auto_detected"
        EVENT_TYPE = "Comment/Post"
        SOURCE_CONTEXT = "Ручной протокол F12 (DevTools Edge)"
        METHOD = "v01"
    }
    sections = $reportSections
}

# Сохраняем шаблон отчёта (для последующего ручного заполнения)
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputPath = Join-Path $OutputDir "OK_${Scenario}_${timestamp}.template.json"
$finalReport | ConvertTo-Json -Depth 6 | Set-Content -Path $outputPath -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "[SAVE] Шаблон отчёта: $outputPath" -ForegroundColor Green
Write-Host "Заполните секции 02-14 на основе ручных проверок F12, затем переименуйте файл"
Write-Host "(уберите .template) и передайте на верификацию."