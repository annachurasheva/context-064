import JSZip from 'jszip'

/* ============================================================
 * Dashboard-бандл · ревизия f308ee0 · выпуск r2 (согласованный набор)
 *
 * Переиздан по TASK-0001 (дельта кодеру): устранены три регрессии
 * выпуска f308ee8 —
 *   1) vite.config.ts без @tailwindcss/vite (стили не собирались);
 *   2) package.json 502 байта — усечённые зависимости, рассинхрон
 *      с package-lock.json; теперь в бандле только .example-образец;
 *   3) .nvmrc «24.5.0.» с точкой — nvm-windows падал с
 *      «Invalid character(s) found in patch number "0."»;
 *      теперь ровно «24.5.0» (6 байт, без точки).
 * ============================================================ */

const NVMRC = '24.5.0' // ровно 6 байт, без точки и без перевода строки

const VITE_CONFIG = `import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Дашборд astro-blog. ТОЛЬКО npm; package-lock.json — источник истины.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 4321 занят блогом Astro — у дашборда свой порт (регламент кодера).
    port: 5180,
    strictPort: true,
  },
});
`

const MAIN_TSX = `import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"]
}
`

/* Образец для чистого стенда. НЕ замена локальному package.json:
   локальный набор согласован с package-lock.json (источник истины),
   engines туда уже влит через JSON-парсер. */
const PACKAGE_JSON_EXAMPLE = `{
  "name": "astro-blog-dashboard",
  "private": true,
  "version": "0.3.0",
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "vite --port 5180 --strictPort",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 5180 --strictPort",
    "typecheck": "tsc -b --noEmit"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "framer-motion": "^11.18.2",
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.15.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.4",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.4",
    "typescript": "~5.8.3",
    "vite": "^6.3.2"
  }
}
`

const REBUILD_LOCK_MD = `# Пересборка package-lock.json

Локфайл (~113 КБ, источник истины) НЕ входит в бандл: его пересобирает npm
на вашей машине — иначе он будет рассинхронизирован с вашим набором зависимостей.

## Команды (pwsh 7.6.5)

\`\`\`pwsh
cd C:\\astro-blog\\dashboard
node -v            # ожидание: v24.5.0 (nvm use 24.5.0, если другая)
npm install        # пересоберёт package-lock.json под ваш package.json
\`\`\`

## Проверка

\`\`\`pwsh
npm run dev        # http://localhost:5180 (strictPort — порт не подвинется)
npm run typecheck
\`\`\`

## Правило слияния (ревизия f308ee0)

- \`package.json.example\` из бандла — только образец для чистого стенда;
  ваш локальный package.json уже содержит \`engines\` (влит через JSON-парсер).
- Никогда не заменяйте package.json без одновременной пересборки лока.
- Бандл берётся целиком согласованным набором, либо не берётся вообще.
`

const README_MD = `# Dashboard-бандл · ревизия f308ee0 · выпуск r2 (согласованный набор)

Сборочный стенд: Node 24.5.0 · npm 11.x · Windows 10 · pwsh 7.6.5
Пакетный менеджер дашборда: ТОЛЬКО npm. package-lock.json — источник истины.
Порт dev-сервера: 5180 (strictPort; 4321 занят блогом Astro).

## Регрессии выпуска f308ee8 — устранены

1. vite.config.ts — возвращён плагин @tailwindcss/vite (react + tailwindcss + 5180 strictPort);
2. package.json — не подменяет локальный: в бандле только образец package.json.example
   (полный набор зависимостей + engines node >=22); ваш engines уже влит локально;
3. .nvmrc — ровно «24.5.0», 6 байт, без точки на конце
   (ошибка nvm-windows «Invalid character(s) in patch number "0."» больше не воспроизводится).

## Состав (7 файлов)

- README.md               — этот файл
- .nvmrc                  — 24.5.0 (без точки)
- vite.config.ts          — react + tailwindcss, порт 5180 strictPort
- src/main.tsx            — точка входа (справочно, по регламенту экспорта)
- tsconfig.json           — справочно, по регламенту экспорта
- package.json.example    — образец: полный набор зависимостей + engines
- REBUILD-LOCK.md         — как пересобрать package-lock.json (npm install)

## Что НЕ входит и почему

- package.json (замена) — локальный набор согласован с локом; подмена рассинхронизирует его;
- package-lock.json — пересобирается «npm install» на вашей машине;
- index.html, src/* (кроме main.tsx) — локальный рабочий набор остаётся.

## Принято из выпуска f308ee8 в репо

README.md · порт 5180 strictPort · engines node >=22 (влит локально).
`

export async function buildDashboardZip(): Promise<void> {
  const zip = new JSZip()
  const root = zip.folder('dashboard')
  if (!root)
    throw new Error('zip folder failed')
  root.file('README.md', README_MD)
  root.file('.nvmrc', NVMRC)
  root.file('vite.config.ts', VITE_CONFIG)
  root.file('tsconfig.json', TSCONFIG)
  root.file('package.json.example', PACKAGE_JSON_EXAMPLE)
  root.file('REBUILD-LOCK.md', REBUILD_LOCK_MD)
  const src = root.folder('src')
  if (!src)
    throw new Error('zip folder failed')
  src.file('main.tsx', MAIN_TSX)

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dashboard-bundle-f308ee0-r2.zip'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
