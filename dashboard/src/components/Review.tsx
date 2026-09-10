import React from "react";
import { SectionHead, Term } from "./ui";
import { CheckIcon, DownloadIcon, ZipIcon } from "./icons";

/* ============================================================
 * «Ревизия f308ee0»: статус дельта-задач, регламент экспорта,
 * готовые git-команды (каждая дельта — отдельным коммитом)
 * и кнопка сборки бандла дашборда.
 * ============================================================ */

type CopyFn = (text: string, label: string) => void;

const GIT_CMD = `git add .vscode/tasks.json .vscode/retypeset.code-snippets
git commit -m "chore(.vscode): add tasks.json and retypeset.code-snippets"

git add .vscode/launch.json
git commit -m "chore(.vscode): pin node runtimeVersion 24.5.0 in launch.json"

git add dashboard/package.json
git commit -m "chore(dashboard): require node >=22 via engines"

git add dashboard/src/main.tsx dashboard/tsconfig.json dashboard/vite.config.ts dashboard/README.md .nvmrc dashboard/.nvmrc
git commit -m "chore(dashboard): export bundle per f308ee0 regulation"`;

const DELTA = [
  {
    task: ".vscode/: tasks.json + retypeset.code-snippets",
    status: "в комплекте · 5/5",
  },
  {
    task: ".vscode/launch.json: «runtimeVersion»: «24.5.0»",
    status: "готово · с оговоркой про nvm",
  },
  {
    task: "dashboard/package.json: «engines»: node ≥ 22",
    status: "влито локально · образец в бандле",
  },
  {
    task: "Регламент: main.tsx, tsconfig.json, vite.config.ts",
    status: "бандл r2 · согласованный набор",
  },
];

/* Регрессии выпуска f308ee8 (TASK-0001) и как закрыты в r2 */
const REGRESSIONS = [
  {
    bug: "vite.config.ts без @tailwindcss/vite — стили не собирались",
    fix: "возвращён плагин: react + tailwindcss + порт 5180 strictPort",
  },
  {
    bug: "package.json 502 байта — усечённые зависимости, рассинхрон с локом",
    fix: "в бандле только package.json.example; локальный не подменяется",
  },
  {
    bug: ".nvmrc «24.5.0.» с точкой — nvm-windows: Invalid character(s) in patch number",
    fix: "ровно «24.5.0» · 6 байт · без точки",
  },
];

const ENGINES_SNIPPET = `"engines": {
  "node": ">=22"
}`;

export function Review({
  onCopy,
  onBundle,
  bundleBusy,
}: {
  onCopy: CopyFn;
  onBundle: () => void;
  bundleBusy: boolean;
}) {
  return (
    <section id="review" className="scroll-mt-6">
      <SectionHead
        index="03"
        title="Ревизия f308ee0 — дельта-задачи"
        lead="каждая дельта — отдельным коммитом; комплект и бандл ниже"
      />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        {/* статус + команды */}
        <div className="rise-in rounded-xl border border-ink-700 bg-ink-900 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-rose/40 bg-rose/10 px-2.5 py-1 font-mono text-[11.5px] font-semibold text-rose">
              ревизия f308ee0
            </span>
            <span className="rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 font-mono text-[11.5px] text-ink-400">
              блог: pnpm 10.33.0 · дашборд: npm · Node 24.5.0
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {DELTA.map((d) => (
              <li
                key={d.task}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-ink-700 bg-ink-950 px-3 py-2.5"
              >
                <CheckIcon size={14} className="shrink-0 translate-y-[1px] text-grass" />
                <code className="font-mono text-[12px] font-semibold text-ink-100">{d.task}</code>
                <span className="ml-auto font-mono text-[11px] text-grass">{d.status}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg border border-rose/40 bg-rose/5 p-3.5">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-rose">
              Регрессии выпуска f308ee8 → устранены в r2
            </div>
            <ul className="mt-2.5 space-y-2.5">
              {REGRESSIONS.map((r) => (
                <li key={r.bug} className="text-[12px] leading-snug">
                  <div className="flex items-start gap-2 text-ink-300">
                    <span className="mt-[3px] h-1.5 w-3 shrink-0 rounded-full bg-rose/70" />
                    <span className="line-through decoration-rose/50 decoration-[1.5px]">{r.bug}</span>
                  </div>
                  <div className="mt-0.5 flex items-start gap-2 pl-5 text-ink-200">
                    <CheckIcon size={12} className="mt-[2px] shrink-0 text-grass" />
                    <span>{r.fix}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 text-[12px] leading-snug text-ink-400">
            Команды ниже — по одной на дельту. Скачайте комплект и бандл, распакуйте в корень
            репо и прогоните их в pwsh из корня astro-blog:
          </p>
          <div className="mt-2">
            <Term code={GIT_CMD} onCopy={onCopy} comment="4 отдельных коммита — ровно по числу дельта-задач" />
          </div>
        </div>

        {/* регламент экспорта + бандл */}
        <div className="rise-in flex flex-col gap-4" style={{ animationDelay: "0.1s" }}>
          <div className="rounded-xl border border-mauve/40 bg-mauve/5 p-4 sm:p-5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[14px] font-extrabold tracking-tight text-ink-100">
                Регламент экспорта
              </span>
              <span className="rounded-full border border-grass/50 bg-grass/10 px-2 py-px font-mono text-[10.5px] font-bold text-grass">
                выпуск r2
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-300">
              Комплект <code className="font-mono text-mauve">.vscode</code> не выдаётся без бандла
              дашборда: <code className="font-mono text-ink-200">src/main.tsx</code>,{" "}
              <code className="font-mono text-ink-200">tsconfig.json</code>,{" "}
              <code className="font-mono text-ink-200">vite.config.ts</code> (react + tailwindcss +
              5180 strictPort) в корне <code className="font-mono text-ink-200">dashboard/</code>.
              Локальный <code className="font-mono text-ink-200">package.json</code> бандл не
              подменяет — только образец <code className="font-mono text-ink-200">.example</code>;
              лок пересобирается <code className="font-mono text-ink-200">npm install</code>.
            </p>
            <button
              onClick={onBundle}
              disabled={bundleBusy}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-mauve/60 bg-mauve/10 px-4 py-2.5 text-[13.5px] font-bold text-mauve transition-all hover:bg-mauve hover:text-white hover:shadow-[0_8px_24px_rgba(26,115,232,0.3)] active:scale-[0.98] disabled:opacity-70"
            >
              {bundleBusy ? (
                <span className="spin-slow inline-block h-4 w-4 rounded-full border-2 border-mauve/40 border-t-mauve" />
              ) : (
                <ZipIcon size={16} />
              )}
              {bundleBusy ? "Упаковываю…" : "Скачать dashboard-бандл r2 (.zip)"}
            </button>
            <p className="mt-2 font-mono text-[11px] text-ink-500">
              dashboard-bundle-f308ee0-r2.zip · 7 файлов · package-lock.json пересобирается npm install
            </p>
          </div>

          <div className="rounded-xl border border-ink-700 bg-ink-900 p-4 sm:p-5">
            <div className="font-display text-[13.5px] font-extrabold tracking-tight text-ink-100">
              Сниппет: engines в dashboard/package.json
            </div>
            <Term code={ENGINES_SNIPPET} onCopy={onCopy} comment="вставьте после поля «version»" />
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-lemon/50 bg-lemon/10 p-3">
              <DownloadIcon size={14} className="mt-0.5 shrink-0 text-peach" />
              <p className="text-[11.5px] leading-snug text-ink-300">
                Локфайл собран на <b>Node 24.5.0 / npm 11.x</b> — строка для README уже есть в
                бандле (<span className="font-mono">dashboard/README.md</span>). В JSON комментарии
                запрещены, поэтому «где собирал» живёт там, а не в package.json.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
