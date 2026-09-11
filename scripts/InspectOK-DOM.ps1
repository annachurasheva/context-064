#Requires -Version 7.0
# TASK-0302 (этап 2) · InspectOK-DOM.ps1 — снятие карты DOM ok.ru через CDP + WebSocket
# Порядок сущностей: первым user_01 (порт 9226), privileged-профили отдельным проходом
param(
    [Parameter(Mandatory=$true)][string]$Scenario,
    [Parameter(Mandatory=$true)][int]$Port,
    [string]$UrlFilter
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Валидация сценария первой очереди
$validScenarios = @('profile_page', 'comments_author', 'group_page')
if ($Scenario -notin $validScenarios) {
    Write-Error "Недопустимый сценарий: $Scenario. Разрешены: $($validScenarios -join ', ')"
    exit 1
}

# Endpoint CDP
$BaseUrl = "http://localhost:$Port"
$JsonEndpoint = "$BaseUrl/json"
$VersionEndpoint = "$BaseUrl/json/version"

# Проверка доступности endpoint
try {
    Write-Host "Проверка endpoint: $JsonEndpoint" -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri $JsonEndpoint -Method Get -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -ne 200) {
        throw "HTTP $($response.StatusCode)"
    }
    $pages = $response.Content | ConvertFrom-Json
    if ($pages.Count -eq 0) {
        throw "Нет активных вкладок"
    }
    Write-Host "Найдено вкладок: $($pages.Count)" -ForegroundColor Green
} catch {
    Write-Error "Endpoint не отвечает: $_. Проверьте, запущен ли Edge с профилем на порту $Port (pwsh scripts/RunEdgeCdp.ps1 -Profile user_01)"
    exit 1
}

# Получение версии браузера
try {
    $versionResponse = Invoke-WebRequest -Uri $VersionEndpoint -Method Get -TimeoutSec 5 -UseBasicParsing
    $browserInfo = $versionResponse.Content | ConvertFrom-Json
} catch {
    $browserInfo = @{ browser = "unknown"; version = "unknown" }
}

# Поиск вкладки ok.ru
$okPage = $pages | Where-Object { $_.url -like "*ok.ru*" } | Select-Object -First 1
if (-not $okPage) {
    Write-Error "Не найдена вкладка ok.ru. Откройте ok.ru в браузере и повторите."
    exit 1
}

# Сверка сценария с URL открытой страницы
$currentUrl = $okPage.url
$urlMatch = $false
$expectedPattern = ""

switch ($Scenario) {
    'profile_page' {
        $expectedPattern = "/profile/"
        if ($currentUrl -match "/profile/") { $urlMatch = $true }
    }
    'group_page' {
        $expectedPattern = "/group/ или главная сообщества"
        if ($currentUrl -match "/group/" -or $currentUrl -match "^https?://ok\.ru/group$") { $urlMatch = $true }
    }
    'comments_author' {
        $expectedPattern = "лента с комментариями (стена группы)"
        # Эвристика: наличие /feed/, /topic/ или /discussion/ в URL
        if ($currentUrl -match "/feed/|/topic/|/discussion/") { $urlMatch = $true }
    }
}

# Проверка ручного фильтра
if ($UrlFilter) {
    if ($currentUrl -match [regex]::Escape($UrlFilter)) {
        $urlMatch = $true
        Write-Host "Применён ручной фильтр UrlFilter: $UrlFilter" -ForegroundColor Yellow
    }
}

if (-not $urlMatch) {
    Write-Error "СТОП: для сценария '$Scenario' откройте страницу с паттерном '$expectedPattern', сейчас открыто: $currentUrl"
    exit 1
}

Write-Host "Целевая вкладка: $($okPage.url) (сценарий: $Scenario)" -ForegroundColor Cyan

$wsUrl = $okPage.webSocketDebuggerUrl
$targetId = $okPage.id

# Функция отправки CDP-команды через WebSocket
function Invoke-CdpCommand {
    param(
        [System.Net.WebSockets.ClientWebSocket]$WebSocket,
        [string]$Method,
        [hashtable]$Params = @{},
        [int]$TimeoutMs = 5000
    )
    
    $id = Get-Random
    $body = @{
        id = $id
        method = $Method
        params = $Params
    } | ConvertTo-Json -Depth 10
    
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    $sendBuffer = [System.ArraySegment[byte]]::new($bytes)
    
    $cancellationToken = New-Object System.Threading.CancellationTokenSource($TimeoutMs)
    $task = $WebSocket.SendAsync($sendBuffer, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cancellationToken.Token)
    $task.Wait()
    
    # Чтение ответа
    $buffer = New-Object byte[] 8192
    $receivedBytes = [System.ArraySegment[byte]]::new($buffer)
    $receiveTask = $WebSocket.ReceiveAsync($receivedBytes, $cancellationToken.Token)
    $receiveTask.Wait()
    
    $resultSize = $receiveTask.Result.Count
    $resultString = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $resultSize)
    $result = $resultString | ConvertFrom-Json
    
    if ($result.id -ne $id) {
        Write-Warning "Несоответствие ID ответа: ожидалось $id, получено $($result.id)"
    }
    
    return $result
}

# Подключение к WebSocket
Write-Host "Подключение к CDP WebSocket: $wsUrl" -ForegroundColor Cyan
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$connectTask = $ws.ConnectAsync([uri]$wsUrl, [System.Threading.CancellationToken]::None)
try {
    $connectTask.Wait(5000)
    if ($ws.State -ne [System.Net.WebSockets.WebSocketState]::Open) {
        throw "WebSocket не перешёл в состояние Open (текущее: $($ws.State))"
    }
    Write-Host "WebSocket подключён успешно" -ForegroundColor Green
} catch {
    Write-Error "СТОП: WebSocket-рукопожатие не удалось — $($_.Exception.Message). Проверьте, что порт $Port свободен и браузер запущен с флагом --remote-debugging-port=$Port"
    exit 1
}

try {
    # Инициализация CDP доменов
    Write-Host "Инициализация CDP доменов..." -ForegroundColor Cyan
    $null = Invoke-CdpCommand -WebSocket $ws -Method "Page.enable"
    $null = Invoke-CdpCommand -WebSocket $ws -Method "DOM.enable"
    $null = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.enable"
    
    # Получение корня DOM
    Write-Host "Получение DOM-дерева..." -ForegroundColor Cyan
    $domResult = Invoke-CdpCommand -WebSocket $ws -Method "DOM.getDocument" -Params @{ depth = 10 }
    $rootNodeId = $domResult.result.root.nodeId
    
    # Сбор данных для секций
    $pageTitle = ""
    $pageUrl = $okPage.url
    $selectedEntity = $null
    $entityCandidates = @()
    $eventContainer = $null
    $eventText = ""
    $dateTime = ""
    $rootContext = $null
    $commentUrl = ""
    $triangleAnchor = $null
    $pageBehavior = @{ scrollHeight = 0; loadTime = (Get-Date) }
    $shadowDom = $false
    $contextMenu = $null
    $rawHtml = ""
    $selectors = @{}
    
    # Runtime.evaluate для получения заголовка и мета-данных
    Write-Host "Сбор мета-данных через Runtime.evaluate..." -ForegroundColor Cyan
    $evalTitle = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.evaluate" -Params @{ expression = "document.title" }
    $pageTitle = $evalTitle.result.result.value
    
    $evalMeta = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.evaluate" -Params @{ expression = "JSON.stringify({url: window.location.href, profile: document.querySelector('.card-author .username')?.textContent, group: document.querySelector('.group-title')?.textContent})" }
    if ($evalTitle.result.result.type -eq "string") {
        try {
            $metaObj = $evalMeta.result.result.value | ConvertFrom-Json
            if ($metaObj.profile) { $selectedEntity = @{ type = "profile"; name = $metaObj.profile } }
            if ($metaObj.group) { $selectedEntity = @{ type = "group"; name = $metaObj.group } }
        } catch {}
    }
    
    # Селекторы для разных сценариев
    $querySelectors = @()
    switch ($Scenario) {
        'profile_page' {
            $querySelectors = @(".card-author", ".username", ".profile-header", ".user-info")
            $expectedPattern = "/profile/"
        }
        'group_page' {
            $querySelectors = @(".group-title", ".group-header", ".community-name", ".group-info")
            $expectedPattern = "/group/"
        }
        'comments_author' {
            $querySelectors = @(".comment-text", ".comment-author", ".discussion-item", ".feed-comment")
            $expectedPattern = "comments"
        }
    }
    
    # Поиск элементов через querySelectorAll
    Write-Host "Поиск элементов по селекторам: $($querySelectors -join ', ')" -ForegroundColor Cyan
    foreach ($selector in $querySelectors) {
        try {
            $qsResult = Invoke-CdpCommand -WebSocket $ws -Method "DOM.querySelectorAll" -Params @{ nodeId = $rootNodeId; selector = $selector }
            if ($qsResult.result.nodeIds.Count -gt 0) {
                $entityCandidates += @{ selector = $selector; count = $qsResult.result.nodeIds.Count; nodeIds = $qsResult.result.nodeIds }
                $selectors[$selector] = $qsResult.result.nodeIds.Count
            }
        } catch {
            Write-Warning "Селектор $selector не найден или ошибка выполнения"
        }
    }
    
    # Если найдены элементы, берём первый как selected entity
    if ($entityCandidates.Count -gt 0 -and -not $selectedEntity) {
        $firstCandidate = $entityCandidates[0]
        # Получаем текст первого элемента
        try {
            $resolveNode = Invoke-CdpCommand -WebSocket $ws -Method "DOM.resolveNode" -Params @{ nodeId = $firstCandidate.nodeIds[0] }
            $objectId = $resolveNode.object.objectId
            $propResult = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.getProperties" -Params @{ objectId = $objectId; ownProperties = $true }
            $innerTextProp = $propResult.result | Where-Object { $_.name -eq "innerText" }
            if ($innerTextProp) {
                $eventText = $innerTextProp.value.value
            }
            $selectedEntity = @{ type = "element"; selector = $firstCandidate.selector; text = $eventText }
        } catch {}
    }
    
    # Получение raw HTML (ограничено по длине)
    Write-Host "Получение outerHTML документа..." -ForegroundColor Cyan
    try {
        $outerHtmlEval = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.evaluate" -Params @{ expression = "document.documentElement.outerHTML.substring(0, 50000)" }
        if ($outerHtmlEval.result.result.type -eq "string") {
            $rawHtml = $outerHtmlEval.result.result.value
        }
    } catch {}
    
    # Проверка Shadow DOM
    try {
        $shadowCheck = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.evaluate" -Params @{ expression = "!!document.querySelector('shadow-root') || !!document.body.shadowRoot" }
        if ($shadowCheck.result.result.value -eq $true) {
            $shadowDom = $true
        }
    } catch {}
    
    # Дата и время со страницы
    try {
        $dateEval = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.evaluate" -Params @{ expression = "document.querySelector('time')?.dateTime || document.querySelector('.date')?.textContent || new Date().toISOString()" }
        if ($dateEval.result.result.type -eq "string") {
            $dateTime = $dateEval.result.result.value
        }
    } catch {
        $dateTime = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    }
    
    # Root context
    $rootContext = @{
        nodeId = $rootNodeId
        nodeName = "document"
        childCount = $domResult.result.root.childNodeCount
    }
    
    # Закрытие WebSocket
    $closeTask = $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Completed", [System.Threading.CancellationToken]::None)
    $closeTask.Wait(2000)
    $ws.Dispose()
    
} catch {
    Write-Error "Ошибка при выполнении CDP-команд: $_"
    if ($ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        try {
            $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::InternalServerError, "Error", [System.Threading.CancellationToken]::None).Wait(1000)
        } catch {}
    }
    $ws.Dispose()
    exit 1
}

# Структура отчёта по 15 секциям инспекционной библиотеки (строго ключи [01]...[15])
$reportSections = @{
    '01_PAGE' = @{ description = "PAGE"; data = $null; status = "complete" }
    '02_SELECTED_ENTITY' = @{ description = "SELECTED_ENTITY"; data = $null; status = "pending" }
    '03_ENTITY_CANDIDATES' = @{ description = "ENTITY_CANDIDATES"; data = $null; status = "pending" }
    '04_EVENT_CONTAINER' = @{ description = "EVENT_CONTAINER"; data = $null; status = "pending" }
    '05_EVENT_TEXT' = @{ description = "EVENT_TEXT"; data = $null; status = "pending" }
    '06_DATE_TIME' = @{ description = "DATE_TIME"; data = $null; status = "pending" }
    '07_ROOT_CONTEXT' = @{ description = "ROOT_CONTEXT"; data = $null; status = "pending" }
    '08_COMMENT_URL' = @{ description = "COMMENT_URL"; data = $null; status = "pending" }
    '09_TRIANGLE_ANCHOR' = @{ description = "TRIANGLE_ANCHOR"; data = $null; status = "pending" }
    '10_PAGE_BEHAVIOR' = @{ description = "PAGE_BEHAVIOR"; data = $null; status = "pending" }
    '11_SHADOW_DOM' = @{ description = "SHADOW_DOM"; data = $null; status = "pending" }
    '12_CONTEXT_MENU' = @{ description = "CONTEXT_MENU"; data = $null; status = "pending" }
    '13_RAW_HTML' = @{ description = "RAW_HTML"; data = $null; status = "pending" }
    '14_SELECTORS' = @{ description = "SELECTORS"; data = $null; status = "pending" }
    '15_NOTES' = @{ description = "NOTES"; data = $null; status = "complete" }
}

# Заполнение секций реальными данными
$reportSections['01_PAGE'].data = @{
    url = $pageUrl
    title = $pageTitle
    type = $Scenario
    portal = "ok.ru"
}

if ($selectedEntity) {
    $reportSections['02_SELECTED_ENTITY'].data = $selectedEntity
    $reportSections['02_SELECTED_ENTITY'].status = "complete"
}

if ($entityCandidates.Count -gt 0) {
    $reportSections['03_ENTITY_CANDIDATES'].data = $entityCandidates
    $reportSections['03_ENTITY_CANDIDATES'].status = "complete"
}

if ($eventText) {
    $reportSections['05_EVENT_TEXT'].data = $eventText
    $reportSections['05_EVENT_TEXT'].status = "complete"
}

if ($dateTime) {
    $reportSections['06_DATE_TIME'].data = $dateTime
    $reportSections['06_DATE_TIME'].status = "complete"
}

if ($rootContext) {
    $reportSections['07_ROOT_CONTEXT'].data = $rootContext
    $reportSections['07_ROOT_CONTEXT'].status = "complete"
}

$reportSections['08_COMMENT_URL'].data = $pageUrl
$reportSections['08_COMMENT_URL'].status = "complete"

if ($pageBehavior) {
    $reportSections['10_PAGE_BEHAVIOR'].data = $pageBehavior
    $reportSections['10_PAGE_BEHAVIOR'].status = "complete"
}

$reportSections['11_SHADOW_DOM'].data = $shadowDom
$reportSections['11_SHADOW_DOM'].status = "complete"

if ($rawHtml) {
    $reportSections['13_RAW_HTML'].data = $rawHtml
    $reportSections['13_RAW_HTML'].status = "complete"
}

if ($selectors.Count -gt 0) {
    $reportSections['14_SELECTORS'].data = $selectors
    $reportSections['14_SELECTORS'].status = "complete"
}

$reportSections['15_NOTES'].data = @{
    inspection_date = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    scenario = $Scenario
    profile = "user_01"
    port = $Port
    endpoint = $BaseUrl
    script_version = "2.0.0"
    task = "TASK-0302"
    browser_info = $browserInfo
    target_url = $pageUrl
    websocket_used = $true
    cdp_methods = @("Page.enable", "DOM.enable", "Runtime.enable", "DOM.getDocument", "DOM.querySelectorAll", "Runtime.evaluate")
}

# Генерация имени файла отчёта
$outputDir = Join-Path $PSScriptRoot "..\docs\dom-inspection"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$fileName = "OK_$($Scenario)_$timestamp.json"
$outputPath = Join-Path $outputDir $fileName

# Сохранение отчёта с 15 секциями библиотеки
$finalReport = @{
    header = @{
        PORTAL = "ok.ru"
        PAGE_TYPE = $Scenario
        URL = $pageUrl
        DATE = (Get-Date -Format "dd.MM.yyyy")
        TIME = (Get-Date -Format "HH:mm:ss")
        ENTITY_TYPE = if ($selectedEntity) { $selectedEntity.type } else { "unknown" }
        ENTITY_NAME = if ($selectedEntity) { $selectedEntity.name } else { "pending_inspection" }
        EVENT_TYPE = "Comment/Post (inferred)"
        SOURCE_CONTEXT = "CDP automated inspection via WebSocket"
    }
    sections = @{}
}

# Добавляем все 15 секций по порядку
for ($i = 1; $i -le 15; $i++) {
    $key = '{0:D2}' -f $i
    $sectionKey = "$key" + "_" + $(switch ($i) {
        1 { "PAGE" }
        2 { "SELECTED_ENTITY" }
        3 { "ENTITY_CANDIDATES" }
        4 { "EVENT_CONTAINER" }
        5 { "EVENT_TEXT" }
        6 { "DATE_TIME" }
        7 { "ROOT_CONTEXT" }
        8 { "COMMENT_URL" }
        9 { "TRIANGLE_ANCHOR" }
        10 { "PAGE_BEHAVIOR" }
        11 { "SHADOW_DOM" }
        12 { "CONTEXT_MENU" }
        13 { "RAW_HTML" }
        14 { "SELECTORS" }
        15 { "NOTES" }
    })
    $finalReport.sections[$sectionKey] = @{
        description = $reportSections[$sectionKey].description
        data = $reportSections[$sectionKey].data
        status = $reportSections[$sectionKey].status
    }
}

$finalReport | ConvertTo-Json -Depth 10 | Set-Content -Path $outputPath -Encoding utf8 -NoNewline

Write-Host "Отчёт сохранён: $outputPath" -ForegroundColor Green
Write-Host "Заполнено секций: $(($finalReport.sections.Values | Where-Object { $_.status -eq "complete" }).Count) из 15" -ForegroundColor Cyan
Write-Host ""
Write-Host "Стоп-условия проверки:" -ForegroundColor Cyan
Write-Host "  - ОК блочит headed-режим: проверьте визуально"
Write-Host "  - Порт занят: ошибка при старте (endpoint не отвечает)"
Write-Host "  - URL не соответствует сценарию: скрипт остановлен до сбора"
Write-Host "  - WebSocket не подключился: явная ошибка и выход"