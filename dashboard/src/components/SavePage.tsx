import React from "react";
import { Term, Reveal } from "./ui";
import { GlobeIcon } from "./icons";

/* ============================================================
 * «Доступность и офлайн-копия»: как сохранить страницу к себе
 * на диск, чтобы читать без интернета сколько угодно раз.
 * ============================================================ */

type CopyFn = (text: string, label: string) => void;

const SAVE_CMD = `$url  = '<адрес страницы>'
$dir  = 'C:\\Docs\\vscode-kit-page'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$doc  = Invoke-WebRequest $url
$doc.Content -replace '="/assets/', '="./assets/' |
  Set-Content "$dir\\index.html" -Encoding UTF8
$doc.Links | Where-Object href -like '/assets/*' | ForEach-Object {
  $a = $_.href
  $out = Join-Path $dir ($a -replace '^/', '')
  New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null
  Invoke-WebRequest ($url.TrimEnd('/') + $a) -OutFile $out
}
Start-Process "$dir\\index.html"`;

const OPTIONS = [
  {
    k: "Закладка (Ctrl+D)",
    v: "Быстро, но адрес предпросмотра живёт, пока жива сессия. На долгий срок не рассчитывайте.",
    tone: "border-ink-700 bg-ink-900",
  },
  {
    k: "Ctrl+S → «Веб-страница полностью»",
    v: "Самый надёжный способ: браузер сам скачает страницу и все стили/скрипты рядом. Откроется двойным кликом без интернета.",
    tone: "border-mauve/50 bg-mauve/5",
  },
  {
    k: "PDF через Ctrl+P",
    v: "Удобно читать на телефоне или распечатать. Минус — без интерактива (кнопки и вкладки не работают).",
    tone: "border-ink-700 bg-ink-900",
  },
];

export function SavePage({ onCopy }: { onCopy: CopyFn }) {
  return (
    <Reveal>
      <section id="save" className="scroll-mt-6">
        <div className="rounded-xl border border-lemon/50 bg-lemon/8 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lemon/20 text-peach">
              <GlobeIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[15px] font-extrabold tracking-tight text-ink-100">
                Доступность и офлайн-копия
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-300">
                Версия страницы ровно одна — та, что вы видите. Содержимое не меняется само по себе, поэтому
                сохранённая копия всегда будет точно такой же. Выберите способ:
              </p>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {OPTIONS.map((o) => (
                  <div key={o.k} className={`rounded-lg border p-3 ${o.tone}`}>
                    <div className="font-mono text-[11.5px] font-bold text-ink-100">{o.k}</div>
                    <p className="mt-1 text-[11.5px] leading-snug text-ink-400">{o.v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <Term
                  code={SAVE_CMD}
                  comment="замените <адрес страницы> на текущий URL; PowerShell-вариант: скачает страницу и файлы из /assets/, сделает пути относительными и откроет копию"
                  onCopy={onCopy}
                />
              </div>
              <p className="mt-2 text-[11.5px] leading-snug text-ink-400">
                Без интернета шрифты подменятся системными — на читаемость и кнопки это не влияет.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
