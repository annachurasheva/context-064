/* ============================================================
 * Комплект .vscode для annachurasheva/astro-blog
 * Содержимое файлов + «обоснования» для панели пояснений.
 * Все тексты — на русском, с объяснением «почему именно так».
 * ============================================================ */

export type ExplainRow = { k: string; why: string };
export type ExplainGroup = { title: string; note?: string; rows: ExplainRow[] };

export type KitFile = {
  id: string;
  name: string;
  path: string;
  language: "jsonc" | "markdown";
  kind: "readme" | "settings" | "extensions" | "tasks" | "launch" | "snippets";
  tagline: string;
  accent: string;
  content: string;
  groups?: ExplainGroup[];
  checklist?: string[];
};

/* ---------- README / инструкция по установке ---------- */

const README = `# Комплект .vscode для astro-blog

> Собран по осмотру репозитория [annachurasheva/astro-blog](https://github.com/annachurasheva/astro-blog) — форка Astro-темы **Retypeset** — и под вашу машину: **Windows 10 (кастомная сборка, один пользователь-админ), PowerShell 7.6.5**.

## Что показал осмотр репозитория

- **pnpm** — пакетный менеджер проекта: в корне \`pnpm-lock.yaml\` и \`.npmrc\`, README велит \`pnpm install\` / \`pnpm dev\`
- **eslint.config.mjs** — плоский конфиг ESLint 9 в стиле antfu: он же отвечает за форматирование, **Prettier в проекте нет и не нужен**
- **UnoCSS** (\`uno.config.ts\`) — атомарные классы вместо Tailwind
- Посты: **MDX**, математика LaTeX, диаграммы Mermaid, i18n на 6 языков (есть \`ru\`)
- \`.devcontainer/\` — готовая среда разработки в Docker от авторов темы
- \`patches/\` — пропатченные зависимости, применяются сами при \`pnpm install\`
- Деплой — **EdgeOne Pages** (\`edgeone.json\`), ветка \`main\`, 809 коммитов

## Состав комплекта (5 файлов)

1. \`settings.json\` — рабочая область: терминал pwsh 7, pnpm, сохранения, LF-переносы, поиск, UnoCSS
2. \`extensions.json\` — рекомендуемые расширения + «анти-рекомендации» (что ставить НЕ надо и почему)
3. \`tasks.json\` — задачи: dev-сервер, сборка, проверка типов, линт, обновление темы
4. \`launch.json\` — отладка: F5 поднимает сервер и открывает Edge/Chrome на :4321
5. \`retypeset.code-snippets\` — сниппеты: шаблон поста, Astro-компонент, лог с меткой

## Установка — 4 шага

1. Распакуйте архив: папку \`.vscode\` положите в **корень проекта**, рядом с \`package.json\`.
2. Откройте проект из PowerShell: \`cd C:\\путь\\к\\astro-blog\`, затем \`code .\`
3. VS Code покажет уведомление «Recommended extensions» → нажмите **Install All**.
4. Проверьте: \`Ctrl+Shift+B\` — сборка; терминал (\`Ctrl\` + клавиша **Ё**, она же обратная кавычка) откроется именно в **pwsh 7**, а не в cmd; \`F5\` — dev-сервер + браузер.

> В репозитории **уже есть** папка \`.vscode/\` (от настройки EdgeOne). Файлы с теми же именами будут заменены; если хотите сохранить их \`extensions.json\` — объедините списки рекомендаций в один файл.

## Куда положить файлы, чтобы не было конфликтов

Комплект живёт **только в папке \`.vscode\`** — она не пересекается ни с одним файлом темы, поэтому конфликтов быть не может. Эта страница-шпаргалка — отдельный артефакт: её кладут в папку \`dashboard\`, которую git **не видит**.

## Почему именно так — главное

- \`"npm.packageManager": "pnpm"\` — VS Code сам запускает скрипты через pnpm. Запустите npm — появится второй lock-файл, а строгие ссылки pnpm сломаются.
- Форматирование при сохранении делает **ESLint** (\`source.fixAll.eslint\`), а Prettier не ставим: два форматёра передрались бы за каждый файл.
- \`"files.eol": "\\n"\` — проект написан с LF-переносами строк. Windows по умолчанию ставит CRLF, и git счёл бы каждый файл изменённым.
- Терминал — профиль \`"PowerShell"\`: именно так VS Code называет PowerShell 7.x (pwsh). Встроенный в Windows 5.1 называется \`"Windows PowerShell"\`. Ваш 7.6.5 найдётся автоматически.

## Если PowerShell 7 вдруг не нашёлся

\`\`\`pwsh
winget install Microsoft.PowerShell
\`\`\`

После установки перезапустите VS Code — профиль подхватится сам.

## Шпаргалка по горячим клавишам

- \`Ctrl+Shift+B\` — задача сборки по умолчанию (\`pnpm build\`)
- \`Ctrl+Shift+P\` → «Tasks: Run Task» — все задачи комплекта
- \`F5\` — dev-сервер + браузер с отладчиком
- \`Ctrl\` + **Ё** (обратная кавычка) — встроенный терминал, и это будет pwsh 7
- \`Ctrl+Shift+X\` → \`@recommended\` — список расширений
- \`rpost\` + Tab — сниппет нового поста прямо в .md файле

## Регламент экспорта (ревизия f308ee0)

Комплект \`.vscode\` не выдаётся без бандла дашборда: \`dashboard/src/main.tsx\`, \`dashboard/tsconfig.json\`, \`dashboard/vite.config.ts\` плюс \`package.json\` с \`"engines": { "node": ">=22" }\` и \`.nvmrc\` (24.5.0 — в корне и в dashboard). Дашборд живёт **только на npm** (\`package-lock.json\` — источник истины, \`pnpm-lock.yaml\` там не создаём); блог — на pnpm 10.33.0. Дельта-задачи коммитятся **по отдельности** — готовые команды в разделе «Ревизия f308ee0» на странице.
`;

/* ---------- settings.json ---------- */

const SETTINGS = `// ════════════════════════════════════════════════════════════════
// .vscode/settings.json — настройки рабочей области astro-blog
//
// Почему файл в проекте, а не «File → Preferences»?
// Эти настройки действуют только на данную папку и коммитятся
// в репозиторий: кто угодно откроет проект — редактор ведёт себя
// так же. Настройки рабочей области побеждают личные.
//
// Файл — JSONC: это JSON, в котором разрешены комментарии.
// В обычном JSON комментарии запрещены, но собственные конфиги
// VS Code понимают их «из коробки».
//
// Машина: Windows 10 (кастомная сборка) · 1 пользователь-админ · pwsh 7.6.5
// Проект: Astro-тема Retypeset · pnpm · UnoCSS · ESLint (flat config)
// ════════════════════════════════════════════════════════════════
{
  // ── 1. Терминал: PowerShell 7 по умолчанию ─────────────────────
  // VS Code различает два PowerShell:
  //   "Windows PowerShell" — встроенный в Windows старый 5.1;
  //   "PowerShell"         — отдельно установленный 7.x (у вас 7.6.5).
  // Выбирая профиль с именем "PowerShell", закрепляем современный pwsh.
  "terminal.integrated.defaultProfile.windows": "PowerShell",

  // "source": "PowerShell" — пусть VS Code сам найдёт путь к pwsh.exe.
  // Это надёжнее, чем прописывать "C:\\\\Program Files\\\\...": обновление
  // 7.6.5 → 7.7 переживётся без правок конфига.
  "terminal.integrated.profiles.windows": {
    "PowerShell": {
      "source": "PowerShell",
      "icon": "terminal-powershell"
    }
  },

  // Задачи (Ctrl+Shift+B) и отладчик запускаются в ОСОБОМ терминале.
  // Без этой строки они могут открыться в cmd.exe — фиксируем и их на pwsh 7.
  "terminal.integrated.automationProfile.windows": {
    "source": "PowerShell"
  },

  // Shell Integration: цветные отметки успешности команд, Ctrl+R —
  // повтор недавней команды, кликабельные пути в выводе. Чистый комфорт.
  "terminal.integrated.shellIntegration.enabled": true,

  // Моноширинный шрифт с лигатурами; Cascadia Code идёт с Windows.
  "terminal.integrated.fontFamily": "'Cascadia Code', 'Consolas', monospace",

  // ── 2. Пакетный менеджер: только pnpm ──────────────────────────
  // В репозитории pnpm-lock.yaml — локфайл именно pnpm. Если VS Code
  // будет гонять скрипты через npm, появится второй package-lock.json,
  // а строгая схема ссылок pnpm нарушится. Эта настройка заставляет
  // сам VS Code использовать pnpm (npm-задачи из tasks.json, Ctrl+клик
  // по скриптам в package.json).
  "npm.packageManager": "pnpm",

  // Исключение из правила «только pnpm» (соглашение ревизии f308ee0):
  // папка dashboard/ живёт на npm — package-lock.json там источник
  // истины, pnpm-lock.yaml НЕ создаём. Задачи дашборда в tasks.json
  // запускаются с явным "npm --prefix dashboard".

  // ── 3. Сохранение: форматирует ESLint, а не Prettier ───────────
  // В теме есть eslint.config.mjs (flat config в стиле antfu) — он
  // отвечает не только за проверки, но и за форматирование (поэтому
  // в скриптах есть lint:fix). Prettier сюда не ставим: два форматёра
  // начали бы спорить о каждом файле при каждом сохранении.
  "editor.formatOnSave": false,

  // Вместо этого: при РУЧНОМ сохранении прогоняем автофиксы ESLint
  // (отступы, кавычки, лишние импорты...). "explicit" — запускать
  // только по явному Ctrl+S, не по автосохранению.
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  // Языки, которые проверяет расширение ESLint. По умолчанию оно знает
  // лишь js/ts — добавляем .astro и .mdx, главные файлы этого проекта.
  "eslint.validate": ["javascript", "typescript", "astro", "mdx"],

  // ── 4. Файлы и окончания строк ─────────────────────────────────
  // Проект написан с LF (unix) окончаниями строк, а Windows по
  // умолчанию ставит CRLF. Без фиксации git считал бы каждый файл
  // изменённым из-за невидимых символов — «грязный» diff на пустом месте.
  "files.eol": "\\n",

  // Дублируем .editorconfig из корня репозитория: пустая строка в конце
  // файла, без пробелов справа. (VS Code читает .editorconfig сам,
  // без расширений — эти строки просто страхуют поведение.)
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,

  // Прячем из Проводника генерируемые папки: .astro — кэш Astro,
  // dist — результат сборки. Они пересоздаются сами, смотреть туда незачем.
  "files.exclude": {
    "**/.git": true,
    "**/.astro": true,
    "**/dist": true
  },

  // Файловый наблюдатель (кормит HMR — живую перезагрузку) не следит
  // за тяжёлыми папками: меньше событий → меньше грузится процессор,
  // dev-сервер работает стабильнее.
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.astro/**": true,
    "**/dist/**": true
  },

  // ── 5. Поиск: не ищем там, где бесполезно ──────────────────────
  // node_modules — сотни тысяч файлов, pnpm-lock.yaml — один огромный,
  // patches — уже применённые заплатки. Исключения ускоряют Ctrl+Shift+F
  // на порядок и убирают мусор из выдачи.
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.astro": true,
    "**/pnpm-lock.yaml": true,
    "**/patches": true
  },

  // ── 6. Проводник: связанные файлы сворачиваются в «гнёзда» ─────
  // Локфайл и конфиги прячутся под package.json / astro.config.ts —
  // корень проекта не превращается в свалку из двадцати точек-файлов.
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "package.json": "pnpm-lock.yaml, .npmrc, tsconfig*, eslint.config*, .editorconfig, .gitignore",
    "astro.config.*": "uno.config.*, edgeone.json"
  },

  // ── 7. Эргономика редактора ────────────────────────────────────
  // Парные скобки разными цветами: в .astro-файлах, где фигурные скобки
  // фронтматтера мешаются с JSX, это спасает от «где закрывается }».
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",

  // Переименовали открывающий тег <div> — закрывающий переименуется сам.
  "editor.linkedEditing": true,

  // «Липкие» заголовки функций и компонентов сверху редактора:
  // всегда видно, внутри какого блока вы находитесь.
  "editor.stickyScroll.enabled": true,

  // В заголовке окна видно имя проекта — удобно при нескольких окнах.
  // \${...} — переменные VS Code, он подставит значения сам.
  "window.title": "\${dirty}\${activeEditorShort} · astro-blog (\${appName})",

  // При написании постов (.md): переносим длинные строки и глушим
  // всплывающие автодополнения — они мешают писать текст.
  "[markdown]": {
    "editor.wordWrap": "on",
    "editor.quickSuggestions": {
      "other": "off",
      "comments": "off",
      "strings": "off"
    }
  },

  // ── 8. Git ─────────────────────────────────────────────────────
  // Тихо опрашивать удалённый репозиторий каждые 3 минуты: если
  // оригинальная тема (upstream) обновилась — вы увидите стрелки
  // синхронизации в Source Control и сможете подтянуть изменения.
  "git.autofetch": true,

  // Не спрашивать «синхронизировать N коммитов?» при каждом push:
  // пользователь на машине один (вы, с правами админа) — лишняя
  // перестраховка не нужна.
  "git.confirmSync": false,

  // ── 9. UnoCSS (стилизация темы) ────────────────────────────────
  // Подчёркиваем утилитарные классы прямо в разметке и показываем
  // квадратик цвета рядом с text-* / bg-* — проще сверяться
  // с темой из uno.config.ts.
  "unocss.underline": true,
  "unocss.colorPreview": true,
  "unocss.root": ["."],

  // ── 10. Необязательное ─────────────────────────────────────────
  // Телеметрия VS Code. На кастомных сборках Windows её часто
  // отключают — редактор ничего не сообщает «домой». Строка не
  // обязательная: если вам всё равно, просто удалите её.
  "telemetry.telemetryLevel": "off"
}
`;

/* ---------- extensions.json ---------- */

const EXTENSIONS = `// ════════════════════════════════════════════════════════════════
// .vscode/extensions.json — рекомендуемые расширения
//
// Как это работает: при открытии проекта VS Code покажет
// уведомление «This workspace has extension recommendations» →
// «Install All». Тот же список виден в панели расширений
// (Ctrl+Shift+X) по фильтру @recommended.
//
// Идентификаторы имеют вид «издатель.имя» — это адрес расширения
// в Marketplace (itemName в ссылке на страницу расширения).
//
// Важно: в репозитории уже лежит свой extensions.json (от EdgeOne).
// При установке комплекта объедините списки, не потеряв их строки.
// ════════════════════════════════════════════════════════════════
{
  "recommendations": [
    // ── Обязательные (без них проект «наполовину слеп») ─────────

    // Официальное расширение Astro: автодополнение пропсов
    // компонентов, диагностика, hover-документация, форматирование
    // .astro. Без него .astro-файлы — просто «неизвестный текст».
    "astro-build.astro-vscode",

    // ESLint: стиль и форматирование проекта охраняет
    // eslint.config.mjs. Расширение подсвечивает проблемы на лету
    // и выполняет автофиксы при сохранении (см. settings.json).
    "dbaeumer.vscode-eslint",

    // UnoCSS: стили темы собираются из uno.config.ts (это НЕ
    // Tailwind!). Расширение даёт автодополнение классов, предпросмотр
    // цветов и иконок, подсвечивает несуществующие классы.
    "antfu.unocss",

    // MDX: посты темы могут быть .mdx (Markdown + JSX-компоненты).
    // Без расширения в них нет ни подсветки, ни дополнений.
    "unifiedjs.vscode-mdx",

    // ── Для написания постов ─────────────────────────────────────

    // Markdown: оглавление файла, горячие клавиши, предпросмотр,
    // автопродолжение списков. Ускоряет работу с текстом постов.
    "yzhang.markdown-all-in-one",

    // Диаграммы Mermaid во встроенном предпросмотре Markdown —
    // тема поддерживает Mermaid прямо в постах.
    "bierner.markdown-mermaid",

    // Проверка орфографии + русский словарь (в блоге есть локаль ru):
    // подчёркивает опечатки в постах и комментариях.
    "streetsidesoftware.code-spell-checker",
    "streetsidesoftware.code-spell-checker-russian",

    // ── Опционально ──────────────────────────────────────────────

    // Dev Containers: в репозитории есть папка .devcontainer/ —
    // можно разрабатывать внутри Docker-контейнера с точно таким же
    // окружением, как у авторов темы (версии Node, pnpm). Не нужно,
    // если Node и pnpm уже стоят локально.
    "ms-vscode-remote.remote-containers"
  ],

  // «Анти-рекомендации»: что в этот проект ставить НЕ надо и почему.
  // VS Code учитывает этот список, когда формирует подсказки.
  "unwantedRecommendations": [
    // Prettier: роль форматёра здесь уже занята ESLint
    // (см. eslint.config.mjs и раздел 3 в settings.json).
    "esbenp.prettier-vscode",

    // Tailwind IntelliSense: в проекте UnoCSS, а не Tailwind —
    // расширение лишь предлагало бы несуществующие классы.
    "bradlc.vscode-tailwindcss"
  ]
}
`;

/* ---------- tasks.json ---------- */

const TASKS = `// ════════════════════════════════════════════════════════════════
// .vscode/tasks.json — «задачи»: запуск команд проекта из VS Code
// (меню Terminal → Run Task… или Ctrl+Shift+B для задачи по умолчанию)
//
// Все скрипты гоняются через pnpm — так решил npm.packageManager
// в settings.json. Тип "npm" означает: VS Code берёт скрипт
// из package.json и запускает его выбранным пакетным менеджером,
// сам разруливая пути на любой ОС (на Windows — .cmd-обёртки).
// ════════════════════════════════════════════════════════════════
{
  "version": "2.0.0",
  "tasks": [
    {
      // ── Dev-сервер: Astro + живая перезагрузка на :4321 ─────────
      "label": "Astro: dev-сервер",
      "detail": "pnpm dev → http://localhost:4321",
      "type": "npm",
      "script": "dev",

      // Сервер никогда «не завершается» — он работает всё время.
      // isBackground говорит VS Code не ждать окончания задачи,
      // иначе интерфейс подвис бы в состоянии «выполняется...».
      "isBackground": true,

      // problemMatcher учит VS Code понимать вывод задачи.
      // У dev-сервера важен не разбор ошибок, а МОМЕНТЫ времени:
      // когда сервер стартовал и когда ГОТОВ принимать запросы —
      // по endsPattern отладчик (F5) понимает, что можно открывать браузер.
      "problemMatcher": {
        "owner": "astro",
        "pattern": { "regexp": "^$" },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "astro",
          "endsPattern": "Local\\\\s+http"
        }
      },

      // dedicated — серверу свой терминал: его вывод не перемешается
      // с одноразовыми командами вроде сборки.
      "presentation": { "reveal": "always", "panel": "dedicated", "group": "astro" },

      // Автозапуск при открытии папки проекта. Первый раз VS Code
      // спросит разрешение: Ctrl+Shift+P → «Tasks: Manage Automatic
      // Tasks» → «Allow Automatic Tasks». Не хотите — удалите строку.
      "runOptions": { "runOn": "folderOpen" }
    },
    {
      // ── Продакшен-сборка в папку dist/ ──────────────────────────
      "label": "Astro: сборка (build)",
      "detail": "pnpm build → dist/",
      "type": "npm",
      "script": "build",

      // Задача по умолчанию для сборки: жмёте Ctrl+Shift+B — она.
      "group": { "kind": "build", "isDefault": true },
      "problemMatcher": [],
      "presentation": { "reveal": "always", "panel": "shared", "group": "astro" }
    },
    {
      // ── Локальный просмотр УЖЕ собранного сайта ────────────────
      // Полезно проверить именно dist/ перед деплоем на EdgeOne Pages.
      "label": "Astro: предпросмотр сборки (preview)",
      "detail": "pnpm preview → dist/ на локальном порту",
      "type": "npm",
      "script": "preview",
      "isBackground": true,
      "problemMatcher": {
        "owner": "astro-preview",
        "pattern": { "regexp": "^$" },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "astro",
          "endsPattern": "Local\\\\s+http"
        }
      },
      "presentation": { "reveal": "always", "panel": "dedicated", "group": "astro" }
    },
    {
      // ── Проверка типов TypeScript внутри .astro-файлов ─────────
      "label": "Astro: проверка типов (astro check)",
      "detail": "pnpm astro check",

      // "shell" — произвольная команда, а не скрипт package.json
      // (скрипта check там нет, но CLI Astro умеет "astro check").
      "type": "shell",
      "command": "pnpm astro check",

      // \$tsc — встроенный «пониматель» вывода tsc: каждая ошибка
      // становится кликабельной — прыжок прямо в файл и строку.
      "problemMatcher": ["\$tsc"],
      "presentation": { "reveal": "silent", "panel": "shared", "group": "astro" }
    },
    {
      // ── Линт: проверить, ничего не меняя ────────────────────────
      "label": "ESLint: линт",
      "detail": "pnpm lint — отчёт о проблемах стиля",
      "type": "npm",
      "script": "lint",

      // \$eslint-stylish разбирает стильный вывод ESLint в список
      // кликабельных проблем (панель Problems, Ctrl+Shift+M).
      "problemMatcher": ["\$eslint-stylish"],
      "presentation": { "reveal": "silent", "panel": "shared", "group": "lint" }
    },
    {
      // ── Линт с автоисправлением всего, что исправимо ────────────
      "label": "ESLint: автофикс",
      "detail": "pnpm lint:fix — исправить, что можно",
      "type": "npm",
      "script": "lint:fix",
      "problemMatcher": [],
      "presentation": { "reveal": "silent", "panel": "shared", "group": "lint" }
    },
    {
      // ── Дашборд: сборка (только npm!) ───────────────────────────
      // По соглашению ревизии f308ee0 дашборд живёт на npm, а блог —
      // на pnpm 10.33.0. Явный "npm --prefix dashboard" гарантирует,
      // что глобальный pnpm сюда не вмешается, а package-lock.json
      // останется единственным источником истины.
      "label": "Dashboard: сборка (npm)",
      "detail": "npm --prefix dashboard run build",
      "type": "shell",
      "command": "npm --prefix dashboard run build",
      "problemMatcher": [],
      "presentation": { "reveal": "silent", "panel": "shared", "group": "dashboard" }
    },
    {
      // ── Дашборд: dev-сервер (порт 5180, не 4321!) ───────────────
      // 4321 занят Astro — дашборд слушает свой порт, чтобы оба
      // сервера могли работать одновременно.
      "label": "Dashboard: dev-сервер (npm)",
      "detail": "npm --prefix dashboard run dev → :5180",
      "type": "shell",
      "command": "npm --prefix dashboard run dev",
      "isBackground": true,
      "problemMatcher": {
        "owner": "dashboard",
        "pattern": { "regexp": "^$" },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "VITE",
          "endsPattern": "ready in"
        }
      },
      "presentation": { "reveal": "always", "panel": "dedicated", "group": "dashboard" }
    },
    {
      // ── Обновление темы Retypeset из оригинала ──────────────────
      // ОСТОРОЖНО: команда вливает изменения upstream в ваш форк —
      // возможны конфликты слияния. Перед запуском закоммитьте работу.
      "label": "Тема: обновить Retypeset (update-theme)",
      "detail": "pnpm update-theme — подтянуть апстрим, возможны конфликты",
      "type": "npm",
      "script": "update-theme",
      "problemMatcher": [],
      "presentation": { "reveal": "always", "panel": "dedicated", "group": "theme" }
    }
  ]
}
`;

/* ---------- launch.json ---------- */

const LAUNCH = `// ════════════════════════════════════════════════════════════════
// .vscode/launch.json — конфигурации отладки (панель Run and Debug,
// Ctrl+Shift+D; запуск — F5)
//
// Сценарий один: поднять dev-сервер задачей из tasks.json, открыть
// браузер на localhost:4321 и дать ставить breakpoints в клиентском
// коде (src/**/*.ts). Первая конфигурация — под ваш Windows 10:
// Edge установлен в системе всегда, Chrome — как кому повезло.
// Плюс node-конфигурация с "runtimeVersion": "24.5.0" — добавлена
// по дельта-задаче ревизии f308ee0.
// ════════════════════════════════════════════════════════════════
{
  "version": "0.2.0",
  "configurations": [
    {
      // ── Основная: сервер + Microsoft Edge ───────────────────────
      // "request": "launch" — VS Code САМ открывает браузер
      // (в отличие от "attach", где браузер уже запущен вами).
      "name": "Astro: dev + Edge",
      "type": "msedge",
      "request": "launch",

      // Стандартный порт Astro. Поменяете в astro.config.ts —
      // поменяйте и здесь (и в веб-интерфейсе EdgeOne — там свой).
      "url": "http://localhost:4321",

      // Корень сайта для сопоставления путей: браузерные пути
      // /src/... отобразятся в файлы проекта — без этого breakpoints
      // «не прилипнут».
      "webRoot": "\${workspaceFolder}",

      // Цепочка: F5 → сначала задача «Astro: dev-сервер» из
      // tasks.json → VS Code ждёт строку «Local http...» → только
      // потом открывает Edge. Ничего запускать вручную не нужно.
      "preLaunchTask": "Astro: dev-сервер"
    },
    {
      // ── То же самое для Google Chrome (если установлен) ─────────
      "name": "Astro: dev + Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:4321",
      "webRoot": "\${workspaceFolder}",
      "preLaunchTask": "Astro: dev-сервер"
    },
    {
      // ── Дашборд (TASK-0001): свой порт 5180 ─────────────────────
      // 4321 занят блогом Astro; у дашборда strictPort-порт 5180,
      // webRoot смотрит в подпапку dashboard/.
      "name": "Дашборд: Edge → :5180",
      "type": "msedge",
      "request": "launch",
      "url": "http://localhost:5180",
      "webRoot": "\${workspaceFolder}/dashboard"
    },
    {
      // ── Подключение к уже открытому Edge ────────────────────────
      // Сценарий: браузер уже открыт, сервер уже крутится, хочется
      // «прицепить» отладчик, ничего не перезапуская.
      // Предварительно запустите Edge из pwsh:
      //   msedge --remote-debugging-port=9222
      "name": "Edge: подключиться к браузеру (attach)",
      "type": "msedge",
      "request": "attach",
      "port": 9222,
      "url": "http://localhost:4321",
      "webRoot": "\${workspaceFolder}"
    },
    {
      // ── Node-приложение с закреплённой версией Node ──────────────
      // Добавлено по дельта-задаче ревизии f308ee0.
      // "runtimeVersion": "24.5.0" подхватывается, только если стоит
      // менеджер версий Node (nvm-windows / fnm / volta): отладчик
      // сам попросит у него нужный бинарник node.
      // Без менеджера версий строка игнорируется — берётся PATH.
      "name": "Node: текущий файл (24.5.0)",
      "type": "node",
      "request": "launch",
      "program": "\${file}",
      "runtimeVersion": "24.5.0",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
`;

/* ---------- retypeset.code-snippets ---------- */

const SNIPPETS = `// ════════════════════════════════════════════════════════════════
// .vscode/retypeset.code-snippets — сниппеты проекта
//
// Сниппет — шаблон кода: набираете префикс (например rpost),
// жмёте Tab — разворачивается заготовка. Работает только в этом
// проекте: файл лежит в .vscode/, а не в личном профиле редактора.
//
// Синтаксис: \${1:текст} — «placeholder», Tab прыгает по ним по
// порядку; \${0} — финальная позиция курсора; \${6|false,true|} —
// список выбора (открывается по Ctrl+Space). Имя файла может быть
// любым, расширение обязано: .code-snippets.
// ════════════════════════════════════════════════════════════════
{
  "Retypeset: новый пост": {
    "prefix": "rpost",
    "description": "Frontmatter поста в теме Retypeset (title, tags, draft…)",
    "body": [
      "---",
      "title: \${1:Заголовок поста}",
      "published: \${2:2026-01-01}",
      "description: \${3:Короткое описание для списка постов и SEO}",
      "category: \${4:заметки}",
      "tags: [\${5:тег}]",
      "draft: \${6|false,true|}",
      "lang: \${7|ru,en,zh|}",
      "---",
      "",
      "\${0}"
    ]
  },

  "Astro: компонент": {
    "prefix": "acomp",
    "description": "Каркас .astro-компонента с типизированными пропсами",
    "body": [
      "---",
      "// frontmatter выполняется один раз при сборке (серверная часть)",
      "interface Props {",
      "  \${1:title}: string;",
      "}",
      "const { $1 } = Astro.props;",
      "---",
      "",
      "<\${2:div} class=\\\\\"\${3:prose}\\\\\">",
      "  \${0}",
      "</$2>"
    ]
  },

  "Console: лог с меткой": {
    "prefix": "clog",
    "description": "console.log, который легко найти в выводе терминала",
    "body": ["console.log('\${1:метка}:', \${2:value});", "\${0}"]
  }
}
`;

/* ---------- файлы комплекта + обоснования ---------- */

export const KIT_FILES: KitFile[] = [
  {
    id: "readme",
    name: "КАК-УСТАНОВИТЬ.md",
    path: "КАК-УСТАНОВИТЬ.md",
    language: "markdown",
    kind: "readme",
    tagline: "осмотр репозитория, установка, выводы",
    accent: "text-sky",
    content: README,
    checklist: [
      "Распаковать папку .vscode в корень проекта (рядом с package.json)",
      "Открыть проект: в pwsh выполнить cd … и code .",
      "Согласиться на установку рекомендуемых расширений (Install All)",
      "Ctrl+Shift+B — сборка проходит без ошибок",
      "F5 — dev-сервер стартует и открывается Edge на :4321",
    ],
  },
  {
    id: "settings",
    name: "settings.json",
    path: ".vscode/settings.json",
    language: "jsonc",
    kind: "settings",
    tagline: "рабочая область: терминал, pnpm, сохранения",
    accent: "text-mauve",
    content: SETTINGS,
    groups: [
      {
        title: "Терминал: PowerShell 7",
        note: "Под вашу машину: W10 + pwsh 7.6.5, единственный пользователь с правами админа.",
        rows: [
          {
            k: "defaultProfile.windows: «PowerShell»",
            why: "Именем «PowerShell» VS Code называет pwsh 7.x, а встроенный 5.1 — «Windows PowerShell». Так терминалом по умолчанию становится ваш 7.6.5, а не древний 5.1.",
          },
          {
            k: "profiles: «source»: «PowerShell»",
            why: "VS Code сам находит pwsh.exe в системе. Не прописываем путь руками — конфиг переживёт обновление 7.6.5 → 7.7.",
          },
          {
            k: "automationProfile.windows",
            why: "Задачи и отладчик открывают отдельный «служебный» терминал. Без этой строки он мог бы стартовать в cmd.exe — фиксируем его тоже на pwsh.",
          },
          {
            k: "shellIntegration",
            why: "Галочки успешности команд, Ctrl+R для повтора, кликабельные пути — мелкие удобства, которые включаются одной строкой.",
          },
        ],
      },
      {
        title: "Пакетный менеджер: pnpm",
        rows: [
          {
            k: "npm.packageManager: «pnpm»",
            why: "В корне репозитория pnpm-lock.yaml и .npmrc — проект живёт на pnpm. Если VS Code запустит скрипт через npm, появится второй локфайл и сломается строгая схема ссылок pnpm.",
          },
        ],
      },
      {
        title: "Сохранение: ESLint вместо Prettier",
        note: "Главное решение комплекта — принято по осмотру eslint.config.mjs.",
        rows: [
          {
            k: "formatOnSave: false",
            why: "Форматированием в теме управляет ESLint (flat config в стиле antfu, в скриптах есть lint:fix). Prettier не установлен — два форматёра конфликтовали бы.",
          },
          {
            k: "source.fixAll.eslint: «explicit»",
            why: "При ручном Ctrl+S запускаются автофиксы ESLint: отступы, кавычки, неиспользуемые импорты. «explicit» бережёт от сюрпризов при автосохранении.",
          },
          {
            k: "eslint.validate + astro, mdx",
            why: "По умолчанию ESLint-расширение смотрит только js/ts. Добавляем .astro и .mdx — именно в них пишется блог.",
          },
        ],
      },
      {
        title: "Файлы и окончания строк",
        rows: [
          {
            k: "files.eol: «\\n» (LF)",
            why: "Проект написан с unix-переносами LF. Windows по умолчанию ставит CRLF — без фикса git показывал бы каждый файл «изменённым» из-за невидимых символов.",
          },
          {
            k: "insertFinalNewline, trimTrailingWhitespace",
            why: "Дублируют .editorconfig из корня репозитория: единый стиль коммитов, никаких «пробел в конце строки» в diff.",
          },
          {
            k: "files.exclude: .astro, dist",
            why: "Это генерируемые папки (кэш и сборка). Спрятаны из Проводника, чтобы не шумели.",
          },
          {
            k: "watcherExclude",
            why: "HMR-наблюдатель не следит за node_modules и .astro — меньше фоновой работы, dev-сервер стабильнее.",
          },
        ],
      },
      {
        title: "Поиск и Проводник",
        rows: [
          {
            k: "search.exclude",
            why: "Не искать в node_modules (сотни тысяч файлов), pnpm-lock.yaml (огромный) и patches/. Ctrl+Shift+F становится быстрее на порядок.",
          },
          {
            k: "explorer.fileNesting",
            why: "pnpm-lock.yaml, .npmrc, tsconfig сворачиваются «под» package.json; uno.config.ts и edgeone.json — под astro.config.ts. Корень проекта остаётся читаемым.",
          },
        ],
      },
      {
        title: "Редактор и Git",
        rows: [
          {
            k: "bracketPairColorization, guides",
            why: "В .astro скобки фронтматтера перемешаны с JSX — цветные пары спасают от потери «}».",
          },
          {
            k: "linkedEditing",
            why: "Переименование HTML-тега сразу правит и закрывающий тег.",
          },
          {
            k: "git.autofetch: true",
            why: "Каждые 3 минуты VS Code смотрит на upstream: обновится оригинальная тема Retypeset — увидите стрелки синхронизации.",
          },
          {
            k: "git.confirmSync: false",
            why: "Пользователь один (вы, админ) — окно «синхронизировать N коммитов?» лишь тормозит.",
          },
        ],
      },
      {
        title: "UnoCSS и прочее",
        rows: [
          {
            k: "unocss.underline / colorPreview",
            why: "Классы из uno.config.ts подчёркиваются в разметке, рядом с text-*/bg-* виден цвет — меньше заглядывать в конфиг.",
          },
          {
            k: "window.title",
            why: "Имя проекта в заголовке окна — не перепутаете окна, если открыто несколько репозиториев.",
          },
          {
            k: "telemetry: off",
            why: "Необязательная строка для кастомной сборки W10: редактор не шлёт данные «домой». Можно удалить.",
          },
        ],
      },
    ],
  },
  {
    id: "extensions",
    name: "extensions.json",
    path: ".vscode/extensions.json",
    language: "jsonc",
    kind: "extensions",
    tagline: "рекомендуемые расширения и «анти-список»",
    accent: "text-teal",
    content: EXTENSIONS,
    groups: [
      {
        title: "Обязательные",
        rows: [
          {
            k: "astro-build.astro-vscode",
            why: "Официальное расширение Astro: без него .astro — «неизвестный текст»: ни дополнений, ни диагностики, ни hover-документации.",
          },
          {
            k: "dbaeumer.vscode-eslint",
            why: "Весь стиль проекта (и форматирование!) живёт в eslint.config.mjs — расширение выполняет автофиксы при сохранении.",
          },
          {
            k: "antfu.unocss",
            why: "Стилизация темы — UnoCSS, не Tailwind. Расширение дополняет классы и подсвечивает несуществующие.",
          },
          {
            k: "unifiedjs.vscode-mdx",
            why: "Посты могут быть .mdx (Markdown + JSX). Без расширения — голая серая простыня.",
          },
        ],
      },
      {
        title: "Для постов",
        rows: [
          {
            k: "yzhang.markdown-all-in-one",
            why: "Оглавление, хоткеи, автопродолжение списков — быстрее писать тексты в src/content.",
          },
          {
            k: "bierner.markdown-mermaid",
            why: "Тема поддерживает Mermaid-диаграммы в постах; расширение рисует их прямо в предпросмотре.",
          },
          {
            k: "code-spell-checker + russian",
            why: "В блоге есть русская локаль — словарь ловит опечатки в постах и комментариях.",
          },
        ],
      },
      {
        title: "Опционально и «анти-список»",
        rows: [
          {
            k: "ms-vscode-remote.remote-containers",
            why: "В репозитории есть .devcontainer/ — среда в Docker с версиями Node/pnpm от авторов темы. Нужно не всем.",
          },
          {
            k: "unwanted: esbenp.prettier-vscode",
            why: "Prettier в проекте не используется — его роль играет ESLint. Установка приведёт к войне форматёров.",
          },
          {
            k: "unwanted: bradlc.vscode-tailwindcss",
            why: "Tailwind IntelliSense для Tailwind-проектов; здесь UnoCSS — расширение только мешало бы.",
          },
        ],
      },
    ],
  },
  {
    id: "tasks",
    name: "tasks.json",
    path: ".vscode/tasks.json",
    language: "jsonc",
    kind: "tasks",
    tagline: "dev, build, check, lint, update-theme",
    accent: "text-peach",
    content: TASKS,
    groups: [
      {
        title: "Как устроены задачи",
        rows: [
          {
            k: "«type»: «npm» + «script»",
            why: "VS Code берёт скрипт из package.json и запускает его пакетным менеджером из settings.json (pnpm), сам разруливая .cmd-обёртки Windows.",
          },
          {
            k: "Ctrl+Shift+B",
            why: "Горячая клавиша задачи с group.kind = build и isDefault: true — здесь это «Astro: сборка».",
          },
          {
            k: "presentation.group: «astro» / «lint»",
            why: "Задачи с одной группой делят терминал: вывод линта не затрёт вывод сервера.",
          },
        ],
      },
      {
        title: "Dev-сервер: isBackground и маркеры",
        rows: [
          {
            k: "isBackground: true",
            why: "Сервер не завершается никогда. Без флага VS Code ждал бы «окончания» и висел в статусе «выполняется».",
          },
          {
            k: "background.endsPattern: «Local http»",
            why: "Строка Astro «┃ Local http://localhost:4321» — сигнал «сервер готов». Его ждёт отладчик (preLaunchTask в launch.json), чтобы открыть браузер.",
          },
          {
            k: "runOn: «folderOpen»",
            why: "Dev-сервер стартует сам при открытии проекта. Первый раз нужно разрешить: Ctrl+Shift+P → «Tasks: Manage Automatic Tasks».",
          },
        ],
      },
      {
        title: "Проверки: problemMatcher",
        rows: [
          {
            k: "$tsc для astro check",
            why: "Встроенный разборщик вывода TypeScript: ошибка в терминале становится кликабельной — прыжок в файл и строку.",
          },
          {
            k: "$eslint-stylish для lint",
            why: "То же для стильного вывода ESLint; проблемы попадают в панель Problems (Ctrl+Shift+M).",
          },
          {
            k: "reveal: «silent»",
            why: "Терминал не выпрыгивает при каждом запуске проверки — результат виден в панели Problems.",
          },
        ],
      },
      {
        title: "Обновление темы",
        rows: [
          {
            k: "update-theme",
            why: "Скрипт темы вливает обновления оригинального Retypeset в форк. Удобно, но возможны конфликты — коммитьте работу перед запуском.",
          },
        ],
      },
    ],
  },
  {
    id: "launch",
    name: "launch.json",
    path: ".vscode/launch.json",
    language: "jsonc",
    kind: "launch",
    tagline: "F5: сервер + браузер с отладчиком",
    accent: "text-grass",
    content: LAUNCH,
    groups: [
      {
        title: "Цепочка F5",
        rows: [
          {
            k: "preLaunchTask",
            why: "F5 сначала поднимает задачу «Astro: dev-сервер» из tasks.json, ждёт маркер готовности — и только потом открывает браузер. Вручную ничего запускать не нужно.",
          },
          {
            k: "url: localhost:4321",
            why: "Стандартный порт Astro. Поменяется в astro.config.ts — правится и здесь.",
          },
          {
            k: "webRoot: ${workspaceFolder}",
            why: "Сопоставляет пути браузера с файлами проекта; без этого breakpoints «не прилипают» к коду.",
          },
        ],
      },
      {
        title: "Почему msedge первым",
        rows: [
          {
            k: "«type»: «msedge»",
            why: "На Windows 10 Edge есть всегда — конфиг работает «из коробки». Chrome добавлен вторым: оставьте тот, которым пользуетесь.",
          },
          {
            k: "attach на порту 9222",
            why: "Если браузер и сервер уже крутятся, отладчик можно «прицепить», ничего не перезапуская: запустите Edge с флагом --remote-debugging-port=9222.",
          },
        ],
      },
    ],
  },
  {
    id: "snippets",
    name: "retypeset.code-snippets",
    path: ".vscode/retypeset.code-snippets",
    language: "jsonc",
    kind: "snippets",
    tagline: "rpost, acomp, clog — заготовки по Tab",
    accent: "text-lemon",
    content: SNIPPETS,
    groups: [
      {
        title: "Механика сниппетов",
        rows: [
          {
            k: "prefix + Tab",
            why: "Набрали rpost, нажали Tab — развернулась заготовка поста. Быстрее и надёжнее копипасты из старого поста.",
          },
          {
            k: "${1:…} → Tab → ${0}",
            why: "Курсор прыгает по placeholder'ам: title → дата → описание… ${0} — финальная точка, где начнёте писать текст.",
          },
          {
            k: "${6|false,true|}",
            why: "Список выбора вместо свободного ввода: для draft нельзя случайно написать «нет» вместо true.",
          },
          {
            k: "файл в .vscode/",
            why: "Проектные сниппеты живут с репозиторием (в отличие от личных, в профиле пользователя) — достаются каждому, кто откроет проект.",
          },
        ],
      },
    ],
  },
];

/* ---------- факты о репозитории (осмотр) ---------- */

export const REPO = {
  owner: "annachurasheva",
  name: "astro-blog",
  upstream: "radishzzz/astro-theme-retypeset",
  theme: "Retypeset",
  branch: "main",
  commits: 809,
  deploy: "EdgeOne Pages",
  stack: [
    { label: "Astro", color: "bg-mauve" },
    { label: "TypeScript · 31.8%", color: "bg-sky" },
    { label: "pnpm", color: "bg-peach" },
    { label: "UnoCSS", color: "bg-teal" },
    { label: "ESLint 9 flat", color: "bg-lav" },
    { label: "MDX · LaTeX · Mermaid", color: "bg-grass" },
    { label: "i18n · 6 языков", color: "bg-lemon" },
    { label: "deploy: EdgeOne", color: "bg-rose" },
  ],
  scripts: ["dev", "build", "preview", "lint", "lint:fix", "astro check", "update-theme"],
  findings: [
    {
      fact: "pnpm-lock.yaml + .npmrc в корне",
      decision: "npm.packageManager: «pnpm» — никакого npm",
    },
    {
      fact: "eslint.config.mjs (flat, стиль antfu), скрипт lint:fix",
      decision: "форматирует ESLint, Prettier — в «анти-списке»",
    },
    {
      fact: "uno.config.ts — UnoCSS, Tailwind не используется",
      decision: "antfu.unocss вместо bradlc.vscode-tailwindcss",
    },
    {
      fact: ".devcontainer/, patches/, edgeone.json, 6 локалей",
      decision: "задача update-theme, Dev Containers — опцией, словарь ru",
    },
  ],
};

export const MACHINE = [
  { k: "ОС", v: "Windows 10, кастомная сборка" },
  { k: "Пользователь", v: "один, с правами администратора" },
  { k: "Оболочка", v: "PowerShell 7.6.5 (pwsh)" },
  { k: "Профиль VS Code", v: "«PowerShell» — так редактор именует pwsh 7.x" },
  { k: "Служебный терминал", v: "тоже pwsh (automationProfile)" },
];
