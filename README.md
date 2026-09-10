# context-064 · OK Portal

Дашборд для разработки 8-го контура (ОК) в расширении `dmiandr/context`.

## Стек
- **Vite** — сборка  
- **React 18.3** — UI  
- **Tailwind CSS 4** — стили  
- **TypeScript** — типизация  

## Структура проекта

```
dashboard/
├── src/
│   ├── components/    # React-компоненты (V01Sheet, V02Sheet, V03Sheet, Terminal и др.)
│   ├── data/          # Данные ОК (ok.ts, tasks-ok.ts)
│   └── lib/           # Утилиты
├── docs/
│   ├── tasks/         # Спецификации задач (TASK-NNNN.md) 
│   └── answers/       # Логи выполнения (CODER-LOG.md)
└── package.json

```


## Запуск локально

```bash
cd dashboard
npm install
npm run dev
```


Ключевые документы
AGENTS.md  
README.md (этот файл)

Проект: dmiandr/context · 8-й контур (ОК)