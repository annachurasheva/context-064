import React from "react";
import type { KitFile } from "../data/kit";
import { ChevronIcon, CheckIcon } from "./icons";

/* ============================================================
 * Нижняя панель «Обоснование»: почему файл заполнен именно так.
 * Для JSONC — аккордеон групп настроек,
 * для инструкции — интерактивный чек-лист установки.
 * ============================================================ */

export function ExplainPanel({
  file,
  expanded,
  onToggle,
  checked,
  onCheck,
}: {
  file: KitFile;
  expanded: number[];
  onToggle: (i: number) => void;
  checked: number[];
  onCheck: (i: number) => void;
}) {
  const isReadme = file.kind === "readme";
  const done = checked.length;
  const total = file.checklist?.length ?? 0;

  return (
    <div className="flex h-56 shrink-0 flex-col border-t border-ink-700 bg-ink-900 md:h-64">
      <div className="flex shrink-0 items-center gap-3 border-b border-ink-700 px-4 py-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mauve">
          Обоснование
        </span>
        <span className="truncate font-mono text-[11.5px] text-ink-400">{file.path}</span>
        {isReadme ? (
          <span className="ml-auto flex items-center gap-2 font-mono text-[11px] text-ink-400">
            чек-лист установки
            <span
              className={`rounded-full px-2 py-px ${
                done === total && total > 0 ? "bg-grass/15 text-grass" : "bg-ink-800 text-ink-300"
              }`}
            >
              {done}/{total}
            </span>
          </span>
        ) : (
          <span className="ml-auto hidden font-mono text-[11px] text-ink-500 sm:inline">
            наведите на строку кода — группы ниже объясняют её
          </span>
        )}
      </div>

      <div key={file.id} className="panel-in panel-in-anim min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {isReadme ? (
          <div className="grid gap-2 md:grid-cols-2">
            {(file.checklist ?? []).map((step, i) => {
              const on = checked.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => onCheck(i)}
                  className={`group flex items-start gap-3 rounded-lg border p-3 text-left transition-all active:scale-[0.99] ${
                    on
                      ? "border-grass/50 bg-grass/5"
                      : "border-ink-700 bg-ink-950 hover:border-ink-500 hover:bg-ink-850"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                      on
                        ? "border-grass bg-grass text-white"
                        : "border-ink-500 text-transparent group-hover:border-ink-400"
                    }`}
                  >
                    <CheckIcon size={12} />
                  </span>
                  <span
                    className={`text-[13px] leading-snug transition-colors ${
                      on ? "text-ink-400 line-through decoration-grass/50" : "text-ink-200"
                    }`}
                  >
                    {step}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {(file.groups ?? []).map((g, gi) => {
              const open = expanded.includes(gi);
              return (
                <div
                  key={gi}
                  className={`overflow-hidden rounded-lg border transition-colors ${
                    open ? "border-ink-500 bg-ink-950" : "border-ink-700 bg-ink-950/60"
                  }`}
                >
                  <button
                    onClick={() => onToggle(gi)}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
                  >
                    <ChevronIcon
                      size={13}
                      className={`shrink-0 text-ink-400 transition-transform duration-300 ${
                        open ? "rotate-90" : ""
                      }`}
                    />
                    <span className={`font-display text-[12.5px] font-bold ${open ? "text-ink-100" : "text-ink-200"}`}>
                      {g.title}
                    </span>
                    <span className="ml-1 hidden rounded bg-ink-800 px-1.5 py-px font-mono text-[10.5px] text-ink-400 sm:inline">
                      {g.rows.length}
                    </span>
                    {g.note && open && (
                      <span className="ml-auto hidden max-w-[46%] truncate text-[11.5px] italic text-ink-400 lg:inline">
                        {g.note}
                      </span>
                    )}
                  </button>
                  <div className={`acc-body ${open ? "open" : ""}`}>
                    <div className="acc-inner">
                      <div className="space-y-2 px-3.5 pb-3">
                        {g.note && (
                          <p className="mb-1 text-[12px] italic leading-snug text-ink-400 lg:hidden">{g.note}</p>
                        )}
                        {g.rows.map((r, ri) => (
                          <div
                            key={ri}
                            className="flex flex-col gap-1 rounded-md bg-ink-900 p-2.5 sm:flex-row sm:items-baseline sm:gap-3"
                          >
                            <code
                              className={`shrink-0 rounded border border-ink-700 bg-ink-950 px-2 py-0.5 font-mono text-[11.5px] sm:w-56 ${file.accent}`}
                            >
                              {r.k}
                            </code>
                            <p className="text-[12.5px] leading-snug text-ink-200">{r.why}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
