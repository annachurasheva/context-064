import React from "react";
import { SectionHead, Term, Reveal } from "./ui";
import { CheckIcon, PwshIcon } from "./icons";

/* ============================================================
 * «Как установить»: софт, матрица оболочек, пошаговые команды.
 * ============================================================ */

type CopyFn = (text: string, label: string) => void;

const SOFTWARE = [
  {
    name: "Visual Studio Code",
    note: "редактор, под который собран комплект",
    cmd: "winget install Microsoft.VisualStudioCode",
    have: false,
  },
  {
    name: "Git for Windows",
    note: "git + Git Bash (понадобится для клонирования)",
    cmd: "winget install Git.Git",
    have: false,
  },
  {
    name: "Node.js LTS",
    note: "движок, на котором крутится Astro",
    cmd: "winget install OpenJS.NodeJS.LTS",
    have: false,
  },
  {
    name: "pnpm",
    note: "пакетный менеджер проекта (строго он, не npm)",
    cmd: "npm install -g pnpm",
    have: false,
  },
  {
    name: "PowerShell 7.6.5",
    note: "уже стоит — комплект настроен именно на него",
    cmd: "",
    have: true,
  },
];

const SHELLS = [
  {
    name: "PowerShell 7 (pwsh)",
    verdict: "целевая",
    good: true,
    why: "Комплект настроен на неё: профиль «PowerShell» в settings.json. Терминал, задачи и отладчик — всё в pwsh.",
  },
  {
    name: "Windows PowerShell 5.1",
    verdict: "не надо",
    good: false,
    why: "Встроенная старая версия. VS Code назовёт её «Windows PowerShell» — комплект её не выбирает.",
  },
  {
    name: "cmd.exe",
    verdict: "не надо",
    good: false,
    why: "Устаревшая оболочка. Задачи комплекта в ней не запустятся корректно.",
  },
  {
    name: "Git Bash",
    verdict: "можно",
    good: true,
    why: "Работает для ручных команд, но задачи VS Code всё равно пойдут через pwsh.",
  },
  {
    name: "WSL / Linux-эмуляция",
    verdict: "не нужно",
    good: false,
    why: "Проект — статический сайт без Linux-специфики. LF-переносы строк уже закреплены настройками files.eol.",
  },
];

export function InstallGuide({ onCopy }: { onCopy: CopyFn }) {
  return (
    <section id="install" className="scroll-mt-6">
      <SectionHead
        index="02 · установка"
        title="Софт, оболочка и приём файлов"
        lead="Ничего эмулировать не нужно: ваш PowerShell 7.6.5 — нативная программа Windows, и комплект уже настроен именно на него. Ниже — что поставить и какие команды выполнить."
      />

      {/* шаг 0: скорая помощь */}
      <Reveal>
        <div className="mb-5 rounded-xl border border-lemon/50 bg-lemon/8 p-4">
          <div className="mb-1.5 font-display text-[13.5px] font-bold text-peach">
            Шаг 0 · Если вы скачали «workspace.tar», а не архив .vscode
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-300">
            Файл <code className="font-mono">workspace (3)</code> без расширения — это{" "}
            <strong className="text-ink-100">рабочий снимок проекта страницы</strong>, а не комплект. Его не
            открывают и ничего из него не переносят в astro-blog. Настоящий артефакт —{" "}
            <code className="font-mono text-mauve">vscode-kit-astro-blog.zip</code> (кнопка «Скачать комплект»).
            Быстрая проверка, что внутри:
          </p>
          <div className="mt-2.5">
            <Term
              code={`Get-Content '.\\workspace (3)' -TotalCount 2`}
              comment="если видите <!DOCTYPE html — это страница (.html); если import/export — дамп исходников, открыть нельзя"
              onCopy={onCopy}
            />
          </div>
        </div>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* софт */}
        <Reveal delay={60}>
          <div className="h-full rounded-xl border border-ink-700 bg-ink-950 p-4">
            <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mauve">
              Какой софт поставить
            </div>
            <div className="space-y-2">
              {SOFTWARE.map((s) => (
                <div
                  key={s.name}
                  className={`rounded-lg border p-3 transition-colors ${
                    s.have ? "border-grass/50 bg-grass/5" : "border-ink-700 bg-ink-900 hover:border-mauve/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-[13px] font-bold text-ink-100">{s.name}</span>
                    {s.have && (
                      <span className="flex items-center gap-1 rounded-full bg-grass/15 px-2 py-px font-mono text-[10.5px] font-semibold text-grass">
                        <CheckIcon size={10} /> уже есть
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-ink-400">{s.note}</p>
                  {s.cmd && (
                    <button
                      onClick={() => onCopy(s.cmd, s.name)}
                      className="mt-2 w-full rounded-md border border-ink-700 bg-ink-100 px-2.5 py-1.5 text-left font-mono text-[11.5px] text-teal transition-colors hover:border-teal"
                      title="Нажмите, чтобы скопировать команду"
                    >
                      <span className="mr-1.5 text-ink-500">$</span>
                      {s.cmd}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* оболочки */}
        <Reveal delay={120}>
          <div className="h-full rounded-xl border border-ink-700 bg-ink-950 p-4">
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mauve">
              <PwshIcon size={14} className="text-teal" />
              Какую оболочку использовать
            </div>
            <div className="space-y-2">
              {SHELLS.map((s) => (
                <div
                  key={s.name}
                  className={`rounded-lg border p-3 ${
                    s.good ? "border-grass/40 bg-grass/5" : "border-ink-700 bg-ink-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[12.5px] font-semibold text-ink-100">{s.name}</span>
                    <span
                      className={`rounded-full px-2 py-px font-mono text-[10.5px] font-semibold ${
                        s.good ? "bg-grass/15 text-grass" : "bg-rose/10 text-rose"
                      }`}
                    >
                      {s.verdict}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-ink-400">{s.why}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* пошаговые команды */}
      <Reveal delay={160}>
        <div className="mt-5 rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mauve">
            Пошагово — вставьте в pwsh
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Term
              code={`Expand-Archive -Path .\\vscode-kit-astro-blog.zip -DestinationPath . -Force`}
              comment="распаковать архив с комплектом"
              onCopy={onCopy}
            />
            <Term
              code={`Copy-Item -Path .\\.vscode -Destination C:\\Projects\\astro-blog\\.vscode -Recurse -Force`}
              comment="положить папку .vscode в корень проекта"
              onCopy={onCopy}
            />
            <Term
              code={`Add-Content -Path C:\\Projects\\astro-blog\\.gitignore -Value "/dashboard/"`}
              comment="исключить шпаргалку из git"
              onCopy={onCopy}
            />
            <Term
              code={`cd C:\\Projects\\astro-blog; code .`}
              comment="открыть проект в VS Code → принять расширения → pnpm install → pnpm dev"
              onCopy={onCopy}
            />
          </div>
        </div>
      </Reveal>

      {/* точно не нужно */}
      <Reveal delay={220}>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-[12.5px] text-ink-400">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-rose">Точно не нужно:</span>
          <span>7-Zip / WinRAR — PowerShell распакует сам</span>
          <span>WSL</span>
          <span>Cygwin / MSYS2</span>
          <span>Python</span>
        </div>
      </Reveal>
    </section>
  );
}
