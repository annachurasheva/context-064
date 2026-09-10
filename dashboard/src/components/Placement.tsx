import React from "react";
import { SectionHead, Reveal, CopyBtn } from "./ui";
import { CheckIcon } from "./icons";

/* ============================================================
 * «Куда положить файлы» — дерево размещения без конфликтов.
 * ============================================================ */

type CopyFn = (text: string, label: string) => void;

const TREE = `C:\\Projects\\astro-blog\\          ← корень репозитория (тут package.json)
├─ .vscode\\                      ← ① КОМПЛЕКТ: 5 файлов, коммитятся в git
│   ├─ settings.json             (расширения EdgeOne из их extensions.json
│   ├─ extensions.json              объедините со списком комплекта!)
│   ├─ tasks.json
│   ├─ launch.json
│   └─ retypeset.code-snippets
├─ dashboard\\                    ← ② ЭТА СТРАНИЦА: полезна, но НЕ коммитится
│   ├─ index.html                ← из dist\\ (npm run build)
│   └─ assets\\                   ← из dist\\assets\\
├─ src\\ public\\ patches\\ …       ← тема: не трогать
└─ .gitignore                    ← ③ дописать строку: /dashboard/`;

const DONT_TOUCH = [
  ["edgeone.json", "конфиг деплоя EdgeOne Pages — работает как есть"],
  ["astro.config.ts", "конфиг Astro — комплект его не заменяет"],
  ["pnpm-lock.yaml", "локфайл pnpm — никогда не редактировать руками"],
  [".github/", "CI и dependabot — не нужны для локальной разработки"],
  [".devcontainer/", "Docker-среда от авторов темы — опционально"],
];

export function PlacementSection({ onCopy }: { onCopy: CopyFn }) {
  return (
    <section id="placement" className="scroll-mt-6">
      <SectionHead
        index="01 · размещение"
        title="Куда положить файлы — без конфликтов"
        lead="Комплект живёт только в папке .vscode — она не пересекается ни с одним файлом темы. Страница-шпаргалка — отдельный артефакт в папке dashboard, которую git не видит."
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* дерево */}
        <Reveal>
          <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950">
            <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mauve">
                Структура проекта
              </span>
              <CopyBtn text={TREE} label="дерево размещения" onCopy={onCopy}>
                копировать
              </CopyBtn>
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-[1.7] text-ink-200">
              {TREE}
            </pre>
          </div>
        </Reveal>

        {/* варианты + не трогать */}
        <div className="space-y-4">
          <Reveal delay={80}>
            <div className="rounded-xl border border-mauve/40 bg-mauve/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mauve font-display text-[11px] font-bold text-white">
                  А
                </span>
                <span className="font-display text-[13.5px] font-bold text-ink-100">Рекомендуемый вариант</span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-ink-300">
                Папку <code className="font-mono text-mauve">.vscode</code> — в корень проекта и закоммитить.
                В <code className="font-mono text-mauve">.gitignore</code> дописать{" "}
                <code className="font-mono text-grass">/dashboard/</code>, и шпаргалка останется локальной
                подсказкой, не засоряя историю git.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
              <div className="mb-2 font-display text-[13px] font-bold text-ink-100">
                Вариант Б — шпаргалка вне репозитория
              </div>
              <p className="text-[12.5px] leading-relaxed text-ink-300">
                Держите <code className="font-mono text-mauve">dashboard\</code> вообще вне папки проекта,
                например в <code className="font-mono text-mauve">C:\Docs\vscode-kit\</code>. Тогда и строка
                в <code className="font-mono">.gitignore</code> не нужна.
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="rounded-xl border border-rose/40 bg-rose/5 p-4">
              <div className="mb-2.5 font-display text-[13px] font-bold text-rose">Что НЕ трогать</div>
              <ul className="space-y-1.5">
                {DONT_TOUCH.map(([f, why]) => (
                  <li key={f} className="flex items-start gap-2 text-[12px] leading-snug">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose/70" />
                    <span className="text-ink-300">
                      <code className="font-mono font-semibold text-ink-100">{f}</code> — {why}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal delay={260}>
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-grass/40 bg-grass/5 px-4 py-3">
          <CheckIcon size={15} className="mt-0.5 shrink-0 text-grass" />
          <p className="text-[12.5px] leading-relaxed text-ink-300">
            <span className="font-bold text-grass">Почему конфликтов не будет:</span> комплект добавляет только
            новые файлы в <code className="font-mono text-mauve">.vscode/</code> и ничего не переписывает в теме.
            Единственное пересечение — их <code className="font-mono">extensions.json</code>: объедините списки
            рекомендаций в один файл, и всё.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
