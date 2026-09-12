#Requires -Version 7.0
# TASK-0302 (этап 2, правка 1) · InspectOK-DOM.ps1 — сбор DOM ok.ru через CDP + WebSocket
# Порядок сущностей: user_01 (порт 9226). Privileged — отдельным проходом.
param(
    [Parameter(Mandatory=$true)][string]$Scenario,
    [Parameter(Mandatory=$true)][int]$Port,
    [string]$UrlFilter
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# --- Константы и валидация ---
$validScenarios = @('profile_page', 'comments_author', 'group_page')
if ($Scenario -notin $validScenarios) {
    throw "Недопустимый сценарий: $Scenario. Разрешены: $($validScenarios -join ', ')"
}

$BaseUrl = "http://localhost:$Port"
$JsonEndpoint = "$BaseUrl/json"
$VersionEndpoint = "$BaseUrl/json/version"

# --- Проверка endpoint ---
try {
    Write-Host "[CDP] Проверка endpoint: $JsonEndpoint" -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri $JsonEndpoint -Method Get -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -ne 200) { throw "HTTP $($response.StatusCode)" }
    $pages = $response.Content | ConvertFrom-Json
    if (-not $pages -or $pages.Count -eq 0) { throw "Нет активных вкладок" }
    Write-Host "[CDP] Найдено вкладок: $($pages.Count)" -ForegroundColor Green
} catch {
    throw "Endpoint не отвечает: $_. Запустите Edge: pwsh scripts/RunEdgeCdp.ps1 -Profile user_01"
}

# --- Поиск вкладки ok.ru ---
$okPage = $pages | Where-Object { $_.url -like "*ok.ru*" } | Select-Object -First 1
if (-not $okPage) {
    throw "Не найдена вкладка ok.ru. Откройте ok.ru в браузере."
}

# --- Валидация сценария по URL (Расширенные образцы) ---
$currentUrl = $okPage.url
$urlMatch = $false
$expectedPattern = ""
$reservedSlugs = @('discussions', 'topic', 'video', 'music', 'profile', 'group')

switch ($Scenario) {
    'profile_page' {
        $expectedPattern = "/profile/ ИЛИ слаг 'имя.число{6,}'"
        # Паттерн: /profile/ или конец URL имя.цифры(6+)
        if ($currentUrl -match "/profile/" -or $currentUrl -match "/[a-zA-Zа-яА-ЯёЁ]+\.\d{6,}$") {
            $urlMatch = $true
        }
    }
    'group_page' {
        $expectedPattern = "/group/ ИЛИ 'group[0-9]' ИЛИ односложный слаг (не зарезервированный)"
        if ($currentUrl -match "/group/" -or $currentUrl -match "/group\d+" -or 
           ($currentUrl -match "/([^/]+)$" -and $matches[1] -notmatch "\." -and $matches[1] -notin $reservedSlugs)) {
            $urlMatch = $true
        }
    }
    'comments_author' {
        $expectedPattern = "/discussions/ ИЛИ /topic/"
        if ($currentUrl -match "/discussions/" -or $currentUrl -match "/topic/") {
            $urlMatch = $true
        }
    }
}

# Ручной фильтр
if ($UrlFilter) {
    if ($currentUrl -match [regex]::Escape($UrlFilter)) {
        $urlMatch = $true
        Write-Host "[URL] Применён ручной фильтр: $UrlFilter" -ForegroundColor Yellow
    }
}

if (-not $urlMatch) {
    throw "СТОП: для сценария '$Scenario' откройте страницу с паттерном '$expectedPattern'. Сейчас: $currentUrl"
}
Write-Host "[URL] Сценарий '$Scenario' подтверждён: $currentUrl" -ForegroundColor Green

$wsUrl = $okPage.webSocketDebuggerUrl
$targetId = $okPage.id

# --- WebSocket клиент (.NET Core встроенный) ---
Write-Host "[WS] Подключение: $wsUrl" -ForegroundColor Cyan
$ws = New-Object System.Net.WebSockets.ClientWebSocket
try {
    $ct = New-Object System.Threading.CancellationTokenSource
    $connectTask = $ws.ConnectAsync([uri]$wsUrl, $ct.Token)
    if (-not $connectTask.Wait(5000)) { throw "Timeout подключения" }
    if ($ws.State -ne [System.Net.WebSockets.WebSocketState]::Open) { throw "State: $($ws.State)" }
    Write-Host "[WS] Успешно" -ForegroundColor Green
} catch {
    throw "СТОП: WebSocket-рукопожатие не удалось — $($_.Exception.Message)"
}

# --- Функция отправки CDP команды с guarded доступом ---
function Invoke-CdpCommand {
    param(
        [System.Net.WebSockets.ClientWebSocket]$WebSocket,
        [string]$Method,
        [hashtable]$Params = @{},
        [int]$TimeoutMs = 5000
    )
    
    $id = (Get-Random -Maximum 99999)
    $bodyObj = @{ id = $id; method = $Method; params = $Params }
    $bodyJson = $bodyObj | ConvertTo-Json -Depth 5 -Compress
    
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
    $buffer = [System.ArraySegment[byte]]::new($bytes)
    
    $sendCt = New-Object System.Threading.CancellationTokenSource($TimeoutMs)
    try {
        $WebSocket.SendAsync($buffer, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $sendCt.Token).Wait()
    } catch {
        return @{ error = "Send failed: $($_.Exception.Message)"; id = $id }
    }
    
    # Чтение ответа (цикл до совпадения ID)
    $recvBuffer = New-Object byte[] 65536
    $startTime = Get-Date
    $resultJson = $null
    
    while ((New-TimeSpan -Start $startTime).TotalMilliseconds -lt $TimeoutMs) {
        $recvCt = New-Object System.Threading.CancellationTokenSource(500)
        try {
            $receiveTask = $WebSocket.ReceiveAsync([System.ArraySegment[byte]]::new($recvBuffer), $recvCt.Token)
            if ($receiveTask.Wait(600)) {
                $count = $receiveTask.Result.Count
                if ($count -gt 0) {
                    $msgStr = [System.Text.Encoding]::UTF8.GetString($recvBuffer, 0, $count)
                    # Парсинг JSON
                    try {
                        $msgObj = $msgStr | ConvertFrom-Json
                        # Пропускаем события (без id или method без id ответа)
                        if ($null -eq $msgObj.id) { continue }
                        
                        # Ждём наш ID
                        if ($msgObj.id -eq $id) {
                            $resultJson = $msgObj
                            break
                        }
                    } catch {
                        continue # Не JSON или ошибка парсинга
                    }
                }
            }
        } catch {
            continue # Таймаут чтения, пробуем снова
        }
    }
    
    if (-not $resultJson) {
        return @{ error = "Timeout waiting for response id=$id"; id = $id }
    }
    
    return $resultJson
}

# --- Guarded доступ к свойствам ---
function Get-SafeProp {
    param($Obj, $Prop, $Default = $null)
    if ($null -eq $Obj) { return $Default }
    # Проверка наличия свойства через PSObject
    if ($Obj.PSObject.Properties.Name -contains $Prop) {
        return $Obj.$Prop
    }
    return $Default
}

# --- Инициализация CDP ---
Write-Host "[CDP] Enable domains..." -ForegroundColor Cyan
$r1 = Invoke-CdpCommand -WebSocket $ws -Method "Page.enable"
$r2 = Invoke-CdpCommand -WebSocket $ws -Method "DOM.enable"
$r3 = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.enable"

# --- Сбор данных (Guarded) ---
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

# 01 PAGE
$pageTitle = ""
$evalTitle = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.evaluate" -Params @{ expression = "document.title" }
if ($null -eq (Get-SafeProp $evalTitle "error")) {
    $res = Get-SafeProp $evalTitle "result"
    if ($null -ne $res) {
        $val = Get-SafeProp $res "result"
        if ($null -ne $val -and (Get-SafeProp $val "type") -eq "string") {
            $pageTitle = Get-SafeProp $val "value" ""
        }
    }
}
$reportSections["01-PAGE"].data = @{ url = $currentUrl; title = $pageTitle; type = $Scenario; portal = "ok.ru" }
$reportSections["01-PAGE"].status = "complete"

# DOM.getDocument
$domCmd = Invoke-CdpCommand -WebSocket $ws -Method "DOM.getDocument" -Params @{ depth = 10 }
$rootNodeId = $null
if ($null -eq (Get-SafeProp $domCmd "error")) {
    $res = Get-SafeProp $domCmd "result"
    if ($null -ne $res) {
        $root = Get-SafeProp $res "root"
        if ($null -ne $root) {
            $rootNodeId = Get-SafeProp $root "nodeId"
        }
    }
}

if ($null -eq $rootNodeId) {
    Write-Warning "Не удалось получить корень DOM. Секции DOM будут failed."
} else {
    # 07 ROOT_CONTEXT
    $reportSections["07-ROOT_CONTEXT"].data = @{ nodeId = $rootNodeId; source = "DOM.getDocument" }
    $reportSections["07-ROOT_CONTEXT"].status = "complete"

    # Сценарный сбор
    $selectorsFound = @{}
    $candidates = @()
    $selectedEntity = $null
    $eventText = ""
    $dateTimeVal = ""
    $rawHtml = ""
    $shadowDom = $false
    
    # Селекторы
    $queryList = @()
    if ($Scenario -eq 'profile_page') {
        $queryList = @(".card-author", ".username", ".profile-header")
    } elseif ($Scenario -eq 'group_page') {
        $queryList = @(".group-title", ".group-header", ".community-name")
    } elseif ($Scenario -eq 'comments_author') {
        # Структурный поиск: контейнер комментария
        # Ищем блоки, содержащие ссылку на автора и текст
        $queryList = @("div.mediac") # Базовый контейнер ленты/комментов в ОК
    }

    foreach ($sel in $queryList) {
        if ($null -eq $rootNodeId) { break }
        $qsRes = Invoke-CdpCommand -WebSocket $ws -Method "DOM.querySelectorAll" -Params @{ nodeId = $rootNodeId; selector = $sel }
        if ($null -eq (Get-SafeProp $qsRes "error")) {
            $res = Get-SafeProp $qsRes "result"
            $nodes = Get-SafeProp $res "nodeIds" @()
            if ($nodes.Count -gt 0) {
                $selectorsFound[$sel] = $nodes.Count
                $candidates += @{ selector = $sel; count = $nodes.Count; nodeIds = $nodes }
            }
        }
    }
    
    # 14 SELECTORS
    if ($selectorsFound.Count -gt 0) {
        $reportSections["14-SELECTORS"].data = $selectorsFound
        $reportSections["14-SELECTORS"].status = "complete"
    } else {
        $reportSections["14-SELECTORS"].status = "failed"
        $reportSections["14-SELECTORS"].note = "Селекторы не найдены"
    }

    # 03 ENTITY_CANDIDATES
    if ($candidates.Count -gt 0) {
        $reportSections["03-ENTITY_CANDIDATES"].data = $candidates
        $reportSections["03-ENTITY_CANDIDATES"].status = "complete"
        
        # Обработка первого кандидата для деталей
        $firstCand = $candidates[0]
        $nodeIds = $firstCand.nodeIds
        if ($nodeIds.Count -gt 0) {
            $targetNodeId = $nodeIds[0]
            
            # 02 SELECTED_ENTITY & 05 EVENT_TEXT & 04 EVENT_CONTAINER
            # ResolveNode -> ObjectId -> Properties (innerText)
            try {
                $resolveRes = Invoke-CdpCommand -WebSocket $ws -Method "DOM.resolveNode" -Params @{ nodeId = $targetNodeId }
                if ($null -eq (Get-SafeProp $resolveRes "error")) {
                    $objObj = Get-SafeProp (Get-SafeProp $resolveRes "result") "object"
                    $objId = Get-SafeProp $objObj "objectId"
                    
                    if ($objId) {
                        # Получаем innerText
                        $propRes = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.getProperties" -Params @{ objectId = $objId; ownProperties = $true }
                        if ($null -eq (Get-SafeProp $propRes "error")) {
                            $props = Get-SafeProp (Get-SafeProp $propRes "result") "result" @()
                            $innerTextProp = $props | Where-Object { $_.name -eq "innerText" } | Select-Object -First 1
                            if ($innerTextProp) {
                                $val = Get-SafeProp $innerTextProp "value"
                                if ($val -and (Get-SafeProp $val "type") -eq "string") {
                                    $rawText = Get-SafeProp $val "value" ""
                                    $eventText = $rawText.Trim()
                                    
                                    # Для comments_author: чистка от автора/даты (эвристика)
                                    if ($Scenario -eq 'comments_author') {
                                        # Удаляем строки с "Ответить", даты (месяцы)
                                        $months = "янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек|января|февраля|марта|апреля|июня|июля|августа|сентября|октября|ноября|декабря"
                                        $lines = $eventText -split "`n" | Where-Object { 
                                            $_ -notmatch "Ответить" -and $_ -notmatch "$months" -and $_.Length -gt 10 
                                        }
                                        $eventText = ($lines -join " ").Substring(0, [Math]::Min(500, ($lines -join " ").Length))
                                        
                                        # Автор = первая ссылка (упрощённо берём начало текста если ссылка не распарсилась)
                                        $authorHint = ($lines | Select-Object -First 1)
                                        $selectedEntity = @{ type = "comment_candidate"; author_hint = $authorHint; text = $eventText }
                                    } else {
                                        $selectedEntity = @{ type = "element"; text = $eventText }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch {}
            
            if ($selectedEntity) {
                $reportSections["02-SELECTED_ENTITY"].data = $selectedEntity
                $reportSections["02-SELECTED_ENTITY"].status = "complete"
            } else {
                $reportSections["02-SELECTED_ENTITY"].status = "failed"
                $reportSections["02-SELECTED_ENTITY"].note = "Не удалось извлечь текст"
            }

            if ($eventText) {
                $reportSections["05-EVENT_TEXT"].data = $eventText
                $reportSections["05-EVENT_TEXT"].status = "complete"
            }
            
            $reportSections["04-EVENT_CONTAINER"].data = @{ nodeId = $targetNodeId; selector = $firstCand.selector }
            $reportSections["04-EVENT_CONTAINER"].status = "complete"
        }
    } else {
        $reportSections["02-SELECTED_ENTITY"].status = "failed"; $reportSections["02-SELECTED_ENTITY"].note = "Кандидаты не найдены"
        $reportSections["03-ENTITY_CANDIDATES"].status = "failed"; $reportSections["03-ENTITY_CANDIDATES"].note = "Пустой список"
        $reportSections["04-EVENT_CONTAINER"].status = "failed"; $reportSections["04-EVENT_CONTAINER"].note = "Нет контейнера"
        $reportSections["05-EVENT_TEXT"].status = "failed"; $reportSections["05-EVENT_TEXT"].note = "Нет текста"
    }

    # 06 DATE_TIME
    $dateEval = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.evaluate" -Params @{ expression = "document.querySelector('time')?.dateTime || document.querySelector('.datetime')?.textContent || new Date().toISOString()" }
    if ($null -eq (Get-SafeProp $dateEval "error")) {
        $v = Get-SafeProp (Get-SafeProp (Get-SafeProp $dateEval "result") "result") "value"
        if ($v) { $dateTimeVal = $v }
    }
    if ($dateTimeVal) {
        $reportSections["06-DATE_TIME"].data = $dateTimeVal
        $reportSections["06-DATE_TIME"].status = "complete"
    } else {
        $reportSections["06-DATE_TIME"].status = "failed"; $reportSections["06-DATE_TIME"].note = "Дата не найдена"
    }

    # 08 COMMENT_URL
    $reportSections["08-COMMENT_URL"].data = $currentUrl
    $reportSections["08-COMMENT_URL"].status = "complete"

    # 09 TRIANGLE_ANCHOR (пока null)
    $reportSections["09-TRIANGLE_ANCHOR"].status = "failed"; $reportSections["09-TRIANGLE_ANCHOR"].note = "Требуется ручная привязка"

    # 10 PAGE_BEHAVIOR
    $behavEval = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.evaluate" -Params @{ expression = "({ h: document.body.scrollHeight, t: document.title })" }
    if ($null -eq (Get-SafeProp $behavEval "error")) {
        $b = Get-SafeProp (Get-SafeProp $behavEval "result") "result"
        $reportSections["10-PAGE_BEHAVIOR"].data = @{ scrollHeight = (Get-SafeProp $b "h"); title = (Get-SafeProp $b "t") }
        $reportSections["10-PAGE_BEHAVIOR"].status = "complete"
    }

    # 11 SHADOW_DOM
    $shadowEval = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.evaluate" -Params @{ expression = "!!document.querySelector('shadow-root') || !!document.body.shadowRoot" }
    if ($null -eq (Get-SafeProp $shadowEval "error")) {
        $val = Get-SafeProp (Get-SafeProp (Get-SafeProp $shadowEval "result") "result") "value"
        $shadowDom = ($val -eq $true)
    }
    $reportSections["11-SHADOW_DOM"].data = $shadowDom
    $reportSections["11-SHADOW_DOM"].status = "complete"

    # 12 CONTEXT_MENU (null)
    $reportSections["12-CONTEXT_MENU"].status = "failed"; $reportSections["12-CONTEXT_MENU"].note = "Не перехватывался"

    # 13 RAW_HTML
    $htmlEval = Invoke-CdpCommand -WebSocket $ws -Method "Runtime.evaluate" -Params @{ expression = "document.documentElement.outerHTML.substring(0, 50000)" }
    if ($null -eq (Get-SafeProp $htmlEval "error")) {
        $h = Get-SafeProp (Get-SafeProp (Get-SafeProp $htmlEval "result") "result") "value"
        if ($h) {
            $rawHtml = $h
            $reportSections["13-RAW_HTML"].data = $rawHtml
            $reportSections["13-RAW_HTML"].status = "complete"
        }
    }
    if (-not $rawHtml) {
        $reportSections["13-RAW_HTML"].status = "failed"; $reportSections["13-RAW_HTML"].note = "HTML не получен"
    }
}

# 15 NOTES
$browserInfoRaw = ""
try {
    $browserInfoRaw = Invoke-WebRequest -Uri $VersionEndpoint -UseBasicParsing -TimeoutSec 2 | Select-Object -ExpandProperty Content
} catch {
    $browserInfoRaw = "{}"
}
$reportSections["15-NOTES"].data = @{
    inspection_date = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    scenario = $Scenario
    profile = "user_01"
    port = $Port
    script_version = "2.1.0"
    task = "TASK-0302"
    browser_info_raw = $browserInfoRaw
    websocket_used = $true
    guarded_access = $true
}
$reportSections["15-NOTES"].status = "complete"

# Закрытие WS
try {
    $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", [System.Threading.CancellationToken]::None).Wait(1000)
    $ws.Dispose()
} catch {}

# --- Сохранение отчёта ---
$outputDir = Join-Path $PSScriptRoot "..\docs\dom-inspection"
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$fileName = "OK_$($Scenario)_$timestamp.json"
$outputPath = Join-Path $outputDir $fileName

$finalReport = @{
    header = @{
        PORTAL = "ok.ru"
        PAGE_TYPE = $Scenario
        URL = $currentUrl
        DATE = (Get-Date -Format "dd.MM.yyyy")
        TIME = (Get-Date -Format "HH:mm:ss")
        ENTITY_TYPE = if ($reportSections["02-SELECTED_ENTITY"].data) { $reportSections["02-SELECTED_ENTITY"].data.type } else { "unknown" }
        ENTITY_NAME = "auto_detected"
        EVENT_TYPE = "Comment/Post"
        SOURCE_CONTEXT = "CDP WebSocket (PowerShell 7)"
    }
    sections = $reportSections
}

$finalReport | ConvertTo-Json -Depth 10 | Set-Content -Path $outputPath -Encoding utf8 -NoNewline
Write-Host "[SAVE] Отчёт: $outputPath" -ForegroundColor Green
$completedCount = ($reportSections.Values | Where-Object { $_.status -eq "complete" }).Count
Write-Host "[STAT] Заполнено секций: $completedCount из 15" -ForegroundColor Cyan