# Инструкция по исследованию нового портала для подключения к универсальному расширению

## Введение

Этот документ содержит полный набор инструментов и инструкций для исследования любого веб-портала с целью его последующего подключения к универсальному браузерному расширению для отслеживания репутации пользователей.

**Цель:** Получить стандартизированный TXT-отчёт о структуре портала, который можно передать LLM или разработчику для создания адаптера.

**Требования:**
- Браузер: **Microsoft Edge** (только)
- Инструмент: **DevTools Edge** (F12)
- Никаких сторонних расширений
- Никакого знания JavaScript/DOM/CSS от пользователя

---

## ЧАСТЬ 1. БИБЛИОТЕКА КОМАНД EDGE DEVTOOLS CONSOLE

### Шаг 1. Загрузка библиотеки скриптов

1. Откройте Microsoft Edge
2. Перейдите на страницу портала, который нужно исследовать
3. Нажмите **F12** (или ПКМ → "Проверить")
4. Перейдите на вкладку **Console**
5. Скопируйте и вставьте следующий код целиком, нажмите **Enter**:

```javascript
// === PORTAL INSPECTION LIBRARY v1.0 ===
// Загружено в консоль Edge DevTools

(function() {
    'use strict';

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

    function getSelector(el) {
        if (!el) return null;
        if (el.id) return '#' + el.id;

        let path = [];
        let current = el;

        while (current && current.nodeType === Node.ELEMENT_NODE) {
            let selector = current.nodeName.toLowerCase();

            if (current.id) {
                selector = '#' + current.id;
                path.unshift(selector);
                break;
            } else {
                let sib = current, nth = 1;
                while (sib.previousElementSibling) {
                    sib = sib.previousElementSibling;
                    if (sib.nodeName.toLowerCase() === selector) nth++;
                }
                if (nth > 1 || !current.nextElementSibling) {
                    selector += ':nth-child(' + nth + ')';
                }

                if (current.className && typeof current.className === 'string' && current.className.trim()) {
                    let classes = current.className.trim().split(/\s+/).slice(0, 2).map(c => '.' + c.replace(/\./g, '\\.')).join('');
                    if (classes) selector = current.nodeName.toLowerCase() + classes;
                }
            }

            path.unshift(selector);
            current = current.parentElement;
        }

        return path.join(' > ');
    }

    function getSelectorWithReason(el) {
        if (!el) return { selector: null, reason: 'Element is null' };

        let reason = [];
        let selector = '';

        if (el.id) {
            selector = '#' + el.id;
            reason.push('Has ID: ' + el.id);
            return { selector, reason: reason.join('; ') };
        }

        if (el.className && typeof el.className === 'string' && el.className.trim()) {
            let classes = el.className.trim().split(/\s+/).filter(c => c.length > 2 && !c.startsWith('js-')).slice(0, 3);
            if (classes.length > 0) {
                selector = el.nodeName.toLowerCase() + classes.map(c => '.' + c.replace(/\./g, '\\.')).join('');
                reason.push('Has classes: ' + classes.join(', '));
            }
        }

        let dataAttrs = Array.from(el.attributes).filter(a => a.name.startsWith('data-')).slice(0, 2);
        if (dataAttrs.length > 0) {
            dataAttrs.forEach(a => {
                selector = el.nodeName.toLowerCase() + '[' + a.name + ']';
                reason.push('Has data attribute: ' + a.name);
            });
            if (selector) return { selector, reason: reason.join('; ') };
        }

        let parent = el.parentElement;
        if (parent && parent.id) {
            selector = '#' + parent.id + ' > ' + el.nodeName.toLowerCase();
            reason.push('Child of ID: ' + parent.id);
            return { selector, reason: reason.join('; ') };
        }

        selector = getSelector(el);
        reason.push('Generated path from DOM tree');

        return { selector, reason: reason.join('; ') };
    }

    function extractDataAttributes(el) {
        if (!el || !el.attributes) return {};
        let result = {};
        for (let i = 0; i < el.attributes.length; i++) {
            let attr = el.attributes[i];
            if (attr.name.startsWith('data-')) {
                result[attr.name] = attr.value;
            }
        }
        return result;
    }

    function findClosestHref(el) {
        if (!el) return null;
        if (el.tagName === 'A' && el.href) return el.href;
        let link = el.querySelector('a[href]');
        if (link && link.href) return link.href;
        let parent = el.closest('a[href]');
        if (parent && parent.href) return parent.href;
        return null;
    }

    function findEntityCandidates(el) {
        if (!el) return [];
        let candidates = [];

        let href = findClosestHref(el);
        if (href) {
            candidates.push({ type: 'HREF', value: href, source: 'Nearest <a> tag' });
        }

        let dataAttrs = extractDataAttributes(el);
        Object.keys(dataAttrs).forEach(key => {
            if (key.includes('user') || key.includes('author') || key.includes('owner') || key.includes('id') || key.includes('peer')) {
                candidates.push({ type: 'DATA_ATTR', key: key, value: dataAttrs[key], source: el.nodeName + '[' + key + ']' });
            }
        });

        let parents = [];
        let current = el.parentElement;
        let depth = 0;
        while (current && depth < 5) {
            let pData = extractDataAttributes(current);
            Object.keys(pData).forEach(key => {
                if (key.includes('user') || key.includes('author') || key.includes('owner') || key.includes('id') || key.includes('peer')) {
                    candidates.push({ type: 'PARENT_DATA_ATTR', key: key, value: pData[key], source: 'Parent ' + current.nodeName + '[' + key + ']', depth: depth });
                }
            });
            let pHref = current.getAttribute('href');
            if (pHref && current.tagName === 'A') {
                candidates.push({ type: 'PARENT_HREF', value: pHref, source: 'Parent <a>', depth: depth });
            }
            current = current.parentElement;
            depth++;
        }

        return candidates;
    }

    function findEventContainer(el) {
        if (!el) return null;

        let containers = [
            { test: (e) => e.classList && Array.from(e.classList).some(c => c.includes('comment')), name: 'Comment class' },
            { test: (e) => e.classList && Array.from(e.classList).some(c => c.includes('post')), name: 'Post class' },
            { test: (e) => e.classList && Array.from(e.classList).some(c => c.includes('message')), name: 'Message class' },
            { test: (e) => e.classList && Array.from(e.classList).some(c => c.includes('entry')), name: 'Entry class' },
            { test: (e) => e.classList && Array.from(e.classList).some(c => c.includes('item')), name: 'Item class' },
            { test: (e) => e.id && (e.id.includes('comment') || e.id.includes('post') || e.id.includes('message')), name: 'ID pattern' }
        ];

        let current = el;
        let depth = 0;
        while (current && depth < 10) {
            for (let container of containers) {
                if (container.test(current)) {
                    return {
                        element: current,
                        selector: getSelector(current),
                        reason: container.name,
                        depth: depth
                    };
                }
            }
            current = current.parentElement;
            depth++;
        }

        current = el.parentElement;
        depth = 0;
        while (current && depth < 7) {
            if (current.children && current.children.length > 2) {
                let hasText = false;
                let hasDate = false;
                let hasAuthor = false;

                for (let child of current.children) {
                    let text = (child.textContent || '').trim();
                    if (text.length > 50) hasText = true;
                    if (/\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}/.test(text) || /\d{1,2}:\d{2}/.test(text)) hasDate = true;
                    if (child === el || child.contains(el)) hasAuthor = true;
                }

                if (hasText && hasAuthor) {
                    return {
                        element: current,
                        selector: getSelector(current),
                        reason: 'Probable container with text and author',
                        depth: depth,
                        hasDate: hasDate
                    };
                }
            }
            current = current.parentElement;
            depth++;
        }

        return {
            element: el.closest('body') || el,
            selector: getSelector(el.closest('body') || el),
            reason: 'Fallback to body or nearest parent',
            depth: -1
        };
    }

    function findConversationContext(el) {
        if (!el) return null;

        let titleSelectors = [
            'h1', 'h2', '.title', '.post-title', '.article-title', '.thread-title',
            '.topic-title', '.product-title', '[itemprop="headline"]', '[itemprop="name"]'
        ];

        let title = null;
        let titleEl = null;

        for (let selector of titleSelectors) {
            titleEl = document.querySelector(selector);
            if (titleEl && titleEl.textContent.trim().length > 5) {
                title = titleEl.textContent.trim();
                break;
            }
        }

        if (!title) {
            let h1 = document.querySelector('h1');
            if (h1 && h1.textContent.trim().length > 5) {
                title = h1.textContent.trim();
                titleEl = h1;
            }
        }

        let url = window.location.href;
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && canonical.href) {
            url = canonical.href;
        }

        return {
            title: title,
            titleElement: titleEl,
            titleSelector: titleEl ? getSelector(titleEl) : null,
            url: url,
            rootElement: document.body,
            rootSelector: 'body'
        };
    }

    function extractDate(el) {
        if (!el) return null;

        let datePatterns = [
            { test: (e) => e.classList && Array.from(e.classList).some(c => c.includes('date') || c.includes('time') || c.includes('timestamp')), name: 'Date class' },
            { test: (e) => e.tagName === 'TIME', name: '<time> tag' },
            { test: (e) => e.hasAttribute && e.hasAttribute('datetime'), name: 'datetime attribute' }
        ];

        let current = el.parentElement;
        let depth = 0;
        while (current && depth < 8) {
            for (let pattern of datePatterns) {
                if (pattern.test(current)) {
                    let text = current.textContent.trim();
                    let datetime = current.getAttribute('datetime');
                    let title = current.getAttribute('title');

                    return {
                        text: text,
                        element: current,
                        selector: getSelector(current),
                        datetime: datetime,
                        title: title,
                        reason: pattern.name,
                        dataAttrs: extractDataAttributes(current)
                    };
                }
            }

            let text = (current.textContent || '').trim();
            if (/\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}/.test(text) || /\d{1,2}:\d{2}/.test(text) || /\w+\s+\d{1,2},?\s+\d{4}/i.test(text)) {
                if (text.length < 100) {
                    return {
                        text: text,
                        element: current,
                        selector: getSelector(current),
                        datetime: current.getAttribute('datetime'),
                        title: current.getAttribute('title'),
                        reason: 'Text pattern match',
                        dataAttrs: extractDataAttributes(current)
                    };
                }
            }

            current = current.parentElement;
            depth++;
        }

        return {
            text: null,
            element: null,
            selector: null,
            datetime: null,
            title: null,
            reason: 'Not found',
            dataAttrs: {}
        };
    }

    function extractMessageText(el) {
        if (!el) return null;

        let container = findEventContainer(el);
        if (!container || !container.element) {
            return {
                text: null,
                html: null,
                element: null,
                selector: null,
                reason: 'No container found'
            };
        }

        let exclTags = ['SCRIPT', 'STYLE', 'NAV', 'HEADER', 'FOOTER'];
        let textParts = [];
        let textEl = null;

        function collectText(node) {
            if (exclTags.includes(node.tagName)) return;

            for (let child of node.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    let text = child.textContent.trim();
                    if (text.length > 20) {
                        textParts.push(text);
                        if (!textEl) textEl = node;
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    if (!['A', 'SPAN', 'B', 'STRONG', 'EM', 'I', 'U', 'P', 'DIV'].includes(child.tagName)) {
                        collectText(child);
                    } else {
                        let text = child.textContent.trim();
                        if (text.length > 20) {
                            textParts.push(text);
                            if (!textEl) textEl = child;
                        }
                    }
                }
            }
        }

        collectText(container.element);

        let text = textParts.join('\n').trim();

        return {
            text: text || null,
            html: textEl ? textEl.innerHTML : null,
            element: textEl,
            selector: textEl ? getSelector(textEl) : null,
            reason: text ? 'Extracted from container' : 'No substantial text found'
        };
    }

    function findTriangleAnchor(el) {
        if (!el) return [];

        let anchors = [];

        anchors.push({
            position: 'After name',
            element: el,
            selector: getSelector(el),
            parent: el.parentElement,
            parentSelector: el.parentElement ? getSelector(el.parentElement) : null,
            description: 'Insert immediately after the author name element'
        });

        if (el.parentElement) {
            anchors.push({
                position: 'Before name',
                element: el,
                selector: getSelector(el),
                parent: el.parentElement,
                parentSelector: el.parentElement ? getSelector(el.parentElement) : null,
                description: 'Insert immediately before the author name element'
            });

            let nextSibling = el.nextElementSibling;
            if (nextSibling) {
                anchors.push({
                    position: 'Replace next sibling',
                    element: nextSibling,
                    selector: getSelector(nextSibling),
                    parent: el.parentElement,
                    parentSelector: getSelector(el.parentElement),
                    description: 'Replace or insert where next sibling exists'
                });
            }
        }

        let container = findEventContainer(el);
        if (container && container.element) {
            let headerLike = container.element.querySelector(':scope > *:first-child, :scope > div:first-child, :scope > span:first-child');
            if (headerLike && headerLike !== el && !headerLike.contains(el)) {
                anchors.push({
                    position: 'In header area',
                    element: headerLike,
                    selector: getSelector(headerLike),
                    parent: container.element,
                    parentSelector: container.selector,
                    description: 'Insert in the header area of the comment/post'
                });
            }

            let dateInfo = extractDate(el);
            if (dateInfo && dateInfo.element) {
                anchors.push({
                    position: 'Near date/time',
                    element: dateInfo.element,
                    selector: dateInfo.selector,
                    parent: dateInfo.element.parentElement,
                    parentSelector: dateInfo.element.parentElement ? getSelector(dateInfo.element.parentElement) : null,
                    description: 'Insert near the date/time element'
                });
            }
        }

        return anchors;
    }

    function inspectShadowRoot(el) {
        if (!el) return { hasShadow: false, reason: 'No element' };

        if (el.shadowRoot) {
            return {
                hasShadow: true,
                mode: 'open',
                host: el,
                hostSelector: getSelector(el),
                childrenCount: el.shadowRoot.children ? el.shadowRoot.children.length : 0,
                reason: 'shadowRoot property exists'
            };
        }

        let potentialHosts = [];
        let checkEl = el;
        let depth = 0;
        while (checkEl && depth < 5) {
            if (checkEl.shadowRoot) {
                potentialHosts.push({
                    element: checkEl,
                    selector: getSelector(checkEl),
                    mode: 'open'
                });
            }
            checkEl = checkEl.parentElement;
            depth++;
        }

        if (potentialHosts.length > 0) {
            return {
                hasShadow: true,
                foundInAncestors: true,
                hosts: potentialHosts,
                reason: 'Shadow root found in ancestor chain'
            };
        }

        return {
            hasShadow: false,
                reason: 'No shadowRoot detected on element or ancestors'
        };
    }

    function inspectPageBehavior() {
        let result = {
            url: window.location.href,
            hostname: window.location.hostname,
            pathname: window.location.pathname,
            title: document.title,
            spaIndicators: [],
            dynamicLoadDetected: false,
            historyApiUsed: false
        };

        let scripts = document.querySelectorAll('script[src]');
        scripts.forEach(s => {
            let src = s.src;
            if (src.includes('react') || src.includes('vue') || src.includes('angular') || src.includes('app.') || src.includes('bundle')) {
                result.spaIndicators.push('Framework script: ' + src.split('/').pop());
            }
        });

        if (window.history && window.history.pushState) {
            result.historyApiUsed = true;
            result.spaIndicators.push('history.pushState available');
        }

        let metaSPA = document.querySelector('meta[name="turbo-root]') || document.querySelector('[data-turbolinks]') || document.querySelector('[data-reactroot]');
        if (metaSPA) {
            result.spaIndicators.push('SPA meta/tag detected: ' + metaSPA.nodeName);
        }

        let initialDOMCount = document.body.innerHTML.length;
        result.initialDOMSize = initialDOMCount;

        setTimeout(() => {
            let newDOMCount = document.body.innerHTML.length;
            if (Math.abs(newDOMCount - initialDOMCount) > 1000) {
                result.dynamicLoadDetected = true;
                result.domChangeAfter3s = Math.abs(newDOMCount - initialDOMCount);
            }
        }, 3000);

        return result;
    }

    function inspectPage() {
        let links = document.querySelectorAll('a[href]');
        let profileLinks = Array.from(links).filter(a => {
            let href = a.href.toLowerCase();
            return href.includes('/profile') || href.includes('/user') || href.includes('/people') ||
                   a.classList && Array.from(a.classList).some(c => c.includes('user') || c.includes('author'));
        });

        let dataIds = document.querySelectorAll('[data-user-id], [data-author-id], [data-owner-id], [data-peer-id], [data-id]');

        let shadowHosts = document.querySelectorAll('*');
        let withShadow = Array.from(shadowHosts).filter(el => el.shadowRoot);

        return {
            url: window.location.href,
            hostname: window.location.hostname,
            pathname: window.location.pathname,
            title: document.title,
            totalLinks: links.length,
            potentialProfileLinks: profileLinks.length,
            elementsWithDataIds: dataIds.length,
            shadowDomHosts: withShadow.length,
            spaInfo: inspectPageBehavior()
        };
    }

    // === ГЛАВНАЯ КОМАНДА: inspectSelectedElement() ===

    window.inspectSelectedElement = function() {
        let el = $0;
        if (!el) {
            console.error('❌ No element selected. Please select an element in the Elements panel first.');
            return null;
        }

        console.log('🔍 Starting inspection of selected element...\n');

        let report = {};

        report.timestamp = new Date().toISOString();
        report.portal = window.location.hostname;
        report.pageType = 'Unknown (manual inspection)';
        report.url = window.location.href;

        report.selectedElement = {
            tagName: el.tagName,
            id: el.id || null,
            className: el.className || null,
            selector: getSelector(el),
            textContent: (el.textContent || '').trim().substring(0, 200),
            attributes: Array.from(el.attributes).map(a => ({ name: a.name, value: a.value })),
            dataAttributes: extractDataAttributes(el)
        };

        report.entityCandidates = findEntityCandidates(el);

        report.eventContainer = findEventContainer(el);
        if (report.eventContainer && report.eventContainer.element) {
            report.eventContainer = {
                selector: report.eventContainer.selector,
                reason: report.eventContainer.reason,
                depth: report.eventContainer.depth,
                outerHTML: report.eventContainer.element.outerHTML.substring(0, 1000)
            };
        }

        report.eventText = extractMessageText(el);

        report.dateTime = extractDate(el);

        report.rootContext = findConversationContext(el);

        report.triangleAnchors = findTriangleAnchor(el);

        report.pageBehavior = inspectPageBehavior();

        report.shadowDom = inspectShadowRoot(el);

        report.pageOverview = inspectPage();

        report.rawHTML = el.outerHTML;

        report.selectorAnalysis = getSelectorWithReason(el);

        console.log('✅ Inspection complete. Use saveInspection("PORTAL_TYPE_ENTITY_TEST") to export.\n');
        console.table({
            'Portal': report.portal,
            'URL': report.url.substring(0, 60) + '...',
            'Element': report.selectedElement.tagName,
            'Selector': report.selectedElement.selector?.substring(0, 80) + '...',
            'Entity Candidates': report.entityCandidates.length,
            'Event Container': report.eventContainer?.reason || 'N/A',
            'Date Found': report.dateTime?.text ? 'Yes' : 'No',
            'Shadow DOM': report.shadowDom.hasShadow ? 'Yes' : 'No'
        });

        window.lastInspectionReport = report;
        return report;
    };

    // === КОМАНДА СОХРАНЕНИЯ: saveInspection(filename) ===

    window.saveInspection = function(filenameBase) {
        if (!window.lastInspectionReport) {
            console.error('❌ No inspection data found. Run inspectSelectedElement() first.');
            return;
        }

        let report = window.lastInspectionReport;

        let filename = filenameBase || 'PORTAL_UNKNOWN_unknown_01.txt';
        if (!filename.endsWith('.txt')) filename += '.txt';

        let content = '=== PORTAL INSPECTION ===\n\n';
        content += 'PORTAL: ' + report.portal + '\n';
        content += 'PAGE_TYPE: ' + report.pageType + '\n';
        content += 'URL: ' + report.url + '\n';
        content += 'DATE: ' + new Date().toLocaleDateString() + '\n';
        content += 'TIME: ' + new Date().toLocaleTimeString() + '\n';
        content += 'ENTITY_TYPE: Author/Persona (inferred)\n';
        content += 'ENTITY_NAME: ' + (report.selectedElement?.textContent?.substring(0, 50) || 'Unknown') + '\n';
        content += 'EVENT_TYPE: Comment/Post (inferred)\n';
        content += 'SOURCE_CONTEXT: ' + (report.rootContext?.title || 'Unknown') + '\n';
        content += '\n=== END HEADER ===\n\n';

        content += '[01] PAGE\n';
        content += 'URL: ' + report.url + '\n';
        content += 'Hostname: ' + report.portal + '\n';
        content += 'Title: ' + document.title + '\n\n';

        content += '[02] SELECTED_ENTITY\n';
        content += 'Tag: ' + report.selectedElement.tagName + '\n';
        content += 'ID: ' + (report.selectedElement.id || 'none') + '\n';
        content += 'Class: ' + (report.selectedElement.className || 'none') + '\n';
        content += 'Selector: ' + report.selectedElement.selector + '\n';
        content += 'Text: ' + report.selectedElement.textContent + '\n';
        content += 'Attributes:\n';
        report.selectedElement.attributes.forEach(a => {
            content += '  - ' + a.name + ': ' + a.value + '\n';
        });
        content += '\n';

        content += '[03] ENTITY_CANDIDATES\n';
        if (report.entityCandidates.length === 0) {
            content += 'No candidates found.\n';
        } else {
            report.entityCandidates.forEach((cand, i) => {
                content += (i+1) + '. Type: ' + cand.type + '\n';
                content += '   Value: ' + (cand.value || cand.key + '=' + cand.value) + '\n';
                content += '   Source: ' + cand.source + '\n';
                if (cand.depth !== undefined) content += '   Depth: ' + cand.depth + '\n';
                content += '\n';
            });
        }
        content += '\n';

        content += '[04] EVENT_CONTAINER\n';
        content += 'Selector: ' + (report.eventContainer?.selector || 'N/A') + '\n';
        content += 'Reason: ' + (report.eventContainer?.reason || 'N/A') + '\n';
        content += 'Depth: ' + (report.eventContainer?.depth || 'N/A') + '\n';
        content += 'Preview: ' + (report.eventContainer?.outerHTML?.substring(0, 300) || 'N/A') + '\n\n';

        content += '[05] EVENT_TEXT\n';
        content += 'Found: ' + (report.eventText?.text ? 'Yes' : 'No') + '\n';
        content += 'Reason: ' + (report.eventText?.reason || 'N/A') + '\n';
        content += 'Text: ' + (report.eventText?.text || 'N/A') + '\n\n';

        content += '[06] DATE_TIME\n';
        content += 'Found: ' + (report.dateTime?.text ? 'Yes' : 'No') + '\n';
        content += 'Reason: ' + (report.dateTime?.reason || 'N/A') + '\n';
        content += 'Text: ' + (report.dateTime?.text || 'N/A') + '\n';
        content += 'Datetime attr: ' + (report.dateTime?.datetime || 'N/A') + '\n';
        content += 'Title attr: ' + (report.dateTime?.title || 'N/A') + '\n';
        content += 'Selector: ' + (report.dateTime?.selector || 'N/A') + '\n\n';

        content += '[07] ROOT_CONTEXT\n';
        content += 'Title: ' + (report.rootContext?.title || 'N/A') + '\n';
        content += 'URL: ' + (report.rootContext?.url || 'N/A') + '\n';
        content += 'Title Selector: ' + (report.rootContext?.titleSelector || 'N/A') + '\n\n';

        content += '[08] COMMENT_URL\n';
        content += 'Current URL: ' + report.url + '\n';
        content += '(No specific comment anchor detected automatically)\n\n';

        content += '[09] TRIANGLE_ANCHOR\n';
        report.triangleAnchors.forEach((anchor, i) => {
            content += (i+1) + '. Position: ' + anchor.position + '\n';
            content += '   Element: ' + anchor.element.tagName + '\n';
            content += '   Selector: ' + anchor.selector + '\n';
            content += '   Parent: ' + (anchor.parentSelector || 'N/A') + '\n';
            content += '   Description: ' + anchor.description + '\n\n';
        });

        content += '[10] PAGE_BEHAVIOR\n';
        content += 'SPA Indicators: ' + (report.pageBehavior.spaIndicators.join(', ') || 'None') + '\n';
        content += 'History API: ' + (report.pageBehavior.historyApiUsed ? 'Yes' : 'No') + '\n';
        content += 'Dynamic Load (3s): ' + (report.pageBehavior.dynamicLoadDetected ? 'Detected' : 'Not detected') + '\n\n';

        content += '[11] SHADOW_DOM\n';
        content += 'Has Shadow: ' + (report.shadowDom.hasShadow ? 'Yes' : 'No') + '\n';
        content += 'Reason: ' + report.shadowDom.reason + '\n\n';

        content += '[12] CONTEXT_MENU\n';
        content += '(Manual inspection required - see separate scenario)\n\n';

        content += '[13] RAW_HTML\n';
        content += report.rawHTML.substring(0, 1500) + '\n\n';

        content += '[14] SELECTORS\n';
        content += 'Primary: ' + report.selectorAnalysis.selector + '\n';
        content += 'Reason: ' + report.selectorAnalysis.reason + '\n\n';

        content += '[15] NOTES\n';
        content += '- Entity candidates should be manually verified\n';
        content += '- Event container may need adjustment\n';
        content += '- Date format should be validated\n';
        content += '- Triangle anchor position #1 is recommended default\n\n';

        content += '=== END REPORT ===\n';

        try {
            let blob = new Blob([content], { type: 'text/plain' });
            let url = URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('✅ File saved: ' + filename);
            console.log('📋 Report also copied to clipboard.');

            navigator.clipboard.writeText(content).catch(() => {
                console.log('⚠️ Clipboard access denied. Copy manually from the download.');
            });

        } catch (e) {
            console.error('❌ Error saving file:', e);
            console.log('\n📋 MANUAL SAVE REQUIRED:\n');
            console.log(content);
            console.log('\nCopy the above text, paste into Notepad, and save as: ' + filename);
        }

        return content;
    };

    console.log('✅ Portal Inspection Library loaded successfully!');
    console.log('📖 Usage:');
    console.log('   1. Select an element in Elements panel (e.g., author name)');
    console.log('   2. Run: inspectSelectedElement()');
    console.log('   3. Run: saveInspection("PORTAL_TYPE_ENTITY_01")');
    console.log('\n🔧 Available commands:');
    console.log('   - inspectSelectedElement()');
    console.log('   - saveInspection(filename)');
    console.log('   - getSelector($0)');
    console.log('   - findEntityCandidates($0)');
    console.log('   - findEventContainer($0)');
    console.log('   - extractDate($0)');
    console.log('   - extractMessageText($0)');
    console.log('   - findTriangleAnchor($0)');
    console.log('   - inspectShadowRoot($0)');
    console.log('   - inspectPageBehavior()');
    console.log('   - inspectPage()');

})();
```

6. Убедитесь, что в консоли появилось сообщение:
   `✅ Portal Inspection Library loaded successfully!`

---

## ЧАСТЬ 2. ОСНОВНОЙ СЦЕНАРИЙ ИССЛЕДОВАНИЯ

### Сценарий A: Комментарий под новостью/статьёй

**ШАГ 1.** Откройте Microsoft Edge.

**ШАГ 2.** Перейдите на страницу новости со статьёй и комментариями.
Пример: `https://example.com/news/some-article`

**ШАГ 3.** Пр��крутите вниз до раздела комментариев.

**ШАГ 4.** Найдите любой комментарий с именем автора.

**ШАГ 5.** Наведите курсор мыши на **имя/ник автора** комментария.

**ШАГ 6.** Нажмите **правую кнопку мыши** (ПКМ).

**ШАГ 7.** В контекстном меню выберите **"Проверить"** (или "Inspect").

**ШАГ 8.** Откроется панель DevTools. Убедитесь, что во вкладке **Elements** выделен элемент, содержащий имя автора (он будет подсвечен синим на странице).

**ШАГ 9.** Перейдите на вкладку **Console** в DevTools.

**ШАГ 10.** Введите команду и нажмите Enter:
```javascript
inspectSelectedElement()
```

**ШАГ 11.** Убедитесь, что появилась таблица с результатами проверки.

**ШАГ 12.** Введите команду для сохранения отчёта:
```javascript
saveInspection("PORTAL_comments_author_01")
```

**ШАГ 13.** Файл автоматически загрузится в папку загрузок браузера с именем:
`PORTAL_comments_author_01.txt`

**ШАГ 14.** Повторите шаги 4–13 для ещё 2–3 разных авторов в комментариях, сохраняя файлы как:
- `PORTAL_comments_author_02.txt`
- `PORTAL_comments_author_03.txt`

---

### Сценарий B: Комментарий под товаром

**ШАГ 1.** Откройте страницу товара с отзывами/комментариями.

**ШАГ 2.** Найдите отзыв с именем автора.

**ШАГ 3.** ПКМ на имени автора → **"Проверить"**.

**ШАГ 4.** В Console выполните:
```javascript
inspectSelectedElement()
saveInspection("PORTAL_product_review_01")
```

**ШАГ 5.** Сохраните файл. Повторите для 2–3 отзывов.

---

### Сценарий C: Комментарий под фотографией/изображением

**ШАГ 1.** Откройте страницу с фотографией и комментариями.

**ШАГ 2.** Найдите комментарий с автором.

**ШАГ 3.** ПКМ на имени → **"Проверить"**.

**ШАГ 4.** В Console:
```javascript
inspectSelectedElement()
saveInspection("PORTAL_photo_comment_01")
```

---

### Сценарий D: Пост автора (основное сообщение)

**ШАГ 1.** Откройте страницу с постом пользователя (например, в блоге, ленте).

**ШАГ 2.** Найдите имя автора поста (обычно в начале или над заголовком).

**ШАГ 3.** ПКМ на имени → **"Проверить"**.

**ШАГ 4.** В Console:
```javascript
inspectSelectedElement()
saveInspection("PORTAL_post_author_01")
```

---

### Сценарий E: Пост сообщества/страницы

**ШАГ 1.** Откройте пост, опубликованный от имени сообщества/группы/страницы.

**ШАГ 2.** Найдите название сообщества (где обычно стоит имя автора).

**ШАГ 3.** ПКМ на названии → **"Проверить"**.

**ШАГ 4.** В Console:
```javascript
inspectSelectedElement()
saveInspection("PORTAL_community_post_01")
```

---

### Сценарий F: Ответ на комментарий (первый уровень вложенности)

**ШАГ 1.** Найдите ветку комментариев с ответами.

**ШАГ 2.** Выберите первый ответ (не основной комментарий, а именно ответ).

**ШАГ 3.** ПКМ на имени автора ответа → **"Проверить"**.

**ШАГ 4.** В Console:
```javascript
inspectSelectedElement()
saveInspection("PORTAL_reply_comment_01")
```

---

### Сценарий G: Вложенный комментарий (глубокая вложенность)

**ШАГ 1.** Найдите глубоко вложенный комментарий (3-й уровень и глубже).

**ШАГ 2.** ПКМ на имени → **"Проверить"**.

**ШАГ 3.** В Console:
```javascript
inspectSelectedElement()
saveInspection("PORTAL_nested_comment_01")
```

---

### Сценарий H: Чат сообщества/группы

**ШАГ 1.** Откройте чат группы/сообщества.

**ШАГ 2.** Найдите любое сообщение с именем отправителя.

**ШАГ 3.** ПКМ на имени → **"Проверить"**.

**ШАГ 4.** В Console:
```javascript
inspectSelectedElement()
saveInspection("PORTAL_group_chat_01")
```

---

### Сценарий I: Личный чат/мессенджер

**ШАГ 1.** Откройте личный чат с собеседником.

**ШАГ 2.** Найдите сообщение с именем/аватаркой собеседника.

**ШАГ 3.** ПКМ на имени → **"Проверить"**.

**ШАГ 4.** В Console:
```javascript
inspectSelectedElement()
saveInspection("PORTAL_messenger_message_01")
```

---

### Сценарий J: Страница профиля пользователя

**ШАГ 1.** Откройте страницу профиля любого пользователя.

**ШАГ 2.** Найдите основное имя/ник пользователя (в шапке профиля).

**ШАГ 3.** ПКМ на имени → **"Проверить"**.

**ШАГ 4.** В Console:
```javascript
inspectSelectedElement()
saveInspection("PORTAL_profile_page_01")
```

---

## ЧАСТЬ 3. ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ

### Проверка Shadow DOM

Если есть подозрение на использование Shadow DOM:

```javascript
inspectShadowRoot($0)
```

### Анализ поведения страницы (SPA/динамическая загрузка)

```javascript
inspectPageBehavior()
```

### Общая информация о странице

```javascript
inspectPage()
```

### Исследование конкретного кандидата на идентификатор

```javascript
findEntityCandidates($0)
```

### Поиск контейнера события

```javascript
findEventContainer($0)
```

### Извлечение даты

```javascript
extractDate($0)
```

### Извлечение текста сообщения

```javascript
extractMessageText($0)
```

### Поиск точек вставки треугольника

```javascript
findTriangleAnchor($0)
```

---

## ЧАСТЬ 4. ФОРМАТ ОТЧЁТА

Каждый сохранённый файл имеет следующую структуру:

```
=== PORTAL INSPECTION ===

PORTAL: example.com
PAGE_TYPE: Unknown (manual inspection)
URL: https://example.com/news/some-article
DATE: DD.MM.YYYY
TIME: HH:MM:SS
ENTITY_TYPE: Author/Persona (inferred)
ENTITY_NAME: Username
EVENT_TYPE: Comment/Post (inferred)
SOURCE_CONTEXT: Article Title

=== END HEADER ===

[01] PAGE
...

[02] SELECTED_ENTITY
...

[03] ENTITY_CANDIDATES
...

[04] EVENT_CONTAINER
...

[05] EVENT_TEXT
...

[06] DATE_TIME
...

[07] ROOT_CONTEXT
...

[08] COMMENT_URL
...

[09] TRIANGLE_ANCHOR
...

[10] PAGE_BEHAVIOR
...

[11] SHADOW_DOM
...

[12] CONTEXT_MENU
...

[13] RAW_HTML
...

[14] SELECTORS
...

[15] NOTES
...

=== END REPORT ===
```

---

## ЧАСТЬ 5. ЧЕК-ЛИСТ ПОЛНОГО ИССЛЕДОВАНИЯ

Для полноценного подключения портала необходимо собрать следующие файлы:

- [ ] `PORTAL_comments_author_01.txt` — комментарий под статьёй
- [ ] `PORTAL_comments_author_02.txt` — другой комментарий
- [ ] `PORTAL_post_author_01.txt` — основной пост
- [ ] `PORTAL_reply_comment_01.txt` — ответ на комментарий
- [ ] `PORTAL_nested_comment_01.txt` — глубоко вложенный комментарий
- [ ] `PORTAL_profile_page_01.txt` — страница профиля

Опционально (если применимо):

- [ ] `PORTAL_product_review_01.txt` — отзыв о товаре
- [ ] `PORTAL_photo_comment_01.txt` — комментарий под фото
- [ ] `PORTAL_community_post_01.txt` — пост сообщества
- [ ] `PORTAL_group_chat_01.txt` — чат группы
- [ ] `PORTAL_messenger_message_01.txt` — личное сообщение

---

## ЧАСТЬ 6. ПЕРЕДАЧА РЕЗУЛЬТАТОВ РАЗРАБОТЧИКУ

После сбора всех файлов:

1. **Объедините файлы** в один архив (ZIP) или передайте по отдельности.
2. **Укажите в сопроводительном письме:**
   - Название портала
   - Типы страниц, которые были исследованы
   - Особые наблюдения (SPA, динамическая загрузка, Shadow DOM)
   - Проблемные места (если какие-то команды не сработали)

3. **Разработчик использует эти данные для:**
   - Определения CSS-селекторов для поиска персон
   - Выбора устойчивых идентификаторов (data-*, href, классы)
   - Настройки точки вставки треугольника
   - Определения контейнера события
   - Извлечения даты и текста
   - Понимания структуры вложенности комментариев
   - Адаптации под SPA или классическую верстку

---

## ПРИЛОЖЕНИЕ. ВОЗМОЖНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ

| Проблема | Решение |
|----------|---------|
| `$0 is undefined` | Убедитесь, что элемент выбран в панели Elements перед запуском команды |
| Файл не скачивается | Проверьте настройки загрузок браузера; используйте ручное копирование из консоли |
| Нет кандидатов сущностей | Попробуйте выбрать другой элемент (ссылку вместо текста, родительский элемент) |
| Не найдена дата | Дата может быть в атрибуте `datetime` или `title`; проверьте раздел [06] вручную |
| Shadow DOM closed | Если Shadow DOM закрыт, контент недоступен; отметьте это в notes |
| Динамическая загрузка | Запустите `inspectPageBehavior()` и подождите 3 секунды для детекции изменений |

---

## ЗАКЛЮЧЕНИЕ

Этот комплект позволяет пользователю без знаний программирования провести полное исследование структуры любого веб-портала и получить стандартизированные отчёты, пригодные для автоматической обработки и создания адаптера расширения.

**Время на исследование одного типа страницы:** 5–10 минут
**Время на полный комплект (6 файлов):** 30–45 минут
**Требуемые навыки:** Умение пользоваться браузером и контекстным меню