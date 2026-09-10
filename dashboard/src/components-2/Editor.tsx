import React, { useMemo } from "react";
import type { KitFile } from "../data/kit";
import { highlightJsonc, renderMarkdown } from "../lib/highlight";
import { CheckIcon, ChevronIcon, CopyIcon, DownloadIcon, fileIcon } from "./icons";

/* ─────────────────────────── Вкладки ──────────────────────────── */

function accentBg(accent: string) {
  const map: Record<string, string> = {
    "text-mauve": "bg-mauve",
    "text-teal": "bg-teal",
    "text-peach": "bg-peach",
    "text-grass": "bg-grass",
    "text-lemon": "bg-lemon",
    "text-sky": "bg-sky",
  };
  return map[accent] ?? "bg-mauve";
}

function Tabs({
  files,
  activeId,
  onActivate,
  onClose,
}: {
  files: KitFile[];
  activeId: string;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
}) {
  return (
    <div className="flex shrink-0 items-end overflow-x-auto border-b border-ink-700 bg-ink-900">
      {files.map((f) => {
        const active = f.id === activeId;
        return (
          <div
            key={f.id}
            onClick={() => onActivate(f.id)}
            className={`group relative flex cursor-pointer items-center gap-2 whitespace-nowrap px-3.5 py-[9px] text-[12.5px] transition-colors ${
              active
                ? "bg-ink-950 text-ink-100"
                : "border-r border-ink-700 text-ink-400 hover:bg-ink-850 hover:text-ink-200"
            }`}
          >
            {active && (
              <span className={`absolute inset-x-0 top-0 h-[2px] ${accentBg(f.accent)}`} />
            )}
            <span className={active ? "" : "opacity-70"}>{fileIcon(f.kind, 15)}</span>
            <span className="font-mono">{f.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(f.id);
              }}
              title="Закрыть вкладку"
              className={`rounded p-0.5 transition-colors hover:bg-ink-700 ${
                active ? "opacity-70 hover:opacity-100" : "opacity-0 group-hover:opacity-60"
              }`}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.4">
                <path d="m2.5 2.5 7 7M9.5 2.5l-7 7" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Код JSONC ────────────────────────── */

function CodeView({ content }: { content: string }) {
  const lines = useMemo(() => highlightJsonc(content), [content]);
  return (
    <div className="flex min-w-max font-mono text-[13px] leading-[1.62]">
      <div className="sticky left-0 select-none bg-ink-950/95 py-4 pl-4 pr-3 text-right text-ink-500 backdrop-blur-sm">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="py-4 pr-6">
        {lines.map((segs, i) => (
          <div key={i} className="code-line whitespace-pre px-2">
            {segs.length === 0 ? "\u00A0" : segs.map((s, j) => (
              <span key={j} className={s.cls}>
                {s.text}
              </span>
            ))}
          </div>
        ))}
        <div className="px-2">
          <span className="caret inline-block h-[15px] w-[7px] translate-y-[2px] bg-mauve/80" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Мини-карта (декор) ───────────────────── */

function MiniMap({ content }: { content: string }) {
  const bars = useMemo(() => {
    const src = content.split("\n");
    const step = Math.max(1, Math.ceil(src.length / 90));
    return src.filter((_, i) => i % step === 0).map((ln) => {
      const t = ln.trim();
      const w = Math.min(64, Math.max(3, t.length * 0.9));
      const color = t.startsWith("//")
        ? "bg-grass/40"
        : t.startsWith('"')
          ? "bg-sky/50"
          : t.length === 0
            ? "bg-transparent"
            : "bg-ink-500/40";
      return { w, color, indent: Math.min(14, (ln.length - ln.trimStart().length) * 0.7) };
    });
  }, [content]);

  return (
    <div className="hidden w-[104px] shrink-0 overflow-hidden border-l border-ink-700 bg-ink-900/70 py-3 pl-2 xl:block">
      {bars.map((b, i) => (
        <div key={i} className="mb-[2px] flex" style={{ paddingLeft: b.indent }}>
          <div className={`h-[3px] rounded-sm ${b.color}`} style={{ width: b.w }} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Редактор ─────────────────────────── */

export function Editor({
  openFiles,
  active,
  onActivate,
  onClose,
  copied,
  onCopy,
  onDownloadOne,
}: {
  openFiles: KitFile[];
  active: KitFile;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  copied: boolean;
  onCopy: () => void;
  onDownloadOne: () => void;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-ink-950">
      <Tabs files={openFiles} activeId={active.id} onActivate={onActivate} onClose={onClose} />

      {/* хлебные крошки + действия */}
      <div className="flex shrink-0 items-center gap-1 border-b border-ink-700 bg-ink-950 px-3 py-1.5">
        <nav className="flex min-w-0 items-center gap-1 font-mono text-[11.5px] text-ink-400">
          <span className="text-ink-300">astro-blog</span>
          {active.kind !== "readme" && (
            <>
              <ChevronIcon size={11} className="text-ink-500" />
              <span className="text-ink-300">.vscode</span>
            </>
          )}
          <ChevronIcon size={11} className="text-ink-500" />
          <span className={`truncate font-semibold ${active.accent}`}>{active.name}</span>
        </nav>
        <span className="ml-3 hidden truncate text-[11px] text-ink-500 md:inline">
          — {active.tagline}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            onClick={onCopy}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11.5px] transition-all active:scale-95 ${
              copied
                ? "border-grass/60 bg-grass/10 text-grass"
                : "border-ink-700 bg-ink-900 text-ink-200 hover:border-ink-500 hover:bg-ink-850"
            }`}
            title="Скопировать содержимое файла"
          >
            {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
            {copied ? "Готово" : "Копировать"}
          </button>
          <button
            onClick={onDownloadOne}
            className="flex items-center gap-1.5 rounded-md border border-ink-700 bg-ink-900 px-2.5 py-1 font-mono text-[11.5px] text-ink-200 transition-all hover:border-ink-500 hover:bg-ink-850 active:scale-95"
            title="Скачать этот файл"
          >
            <DownloadIcon size={13} />
            <span className="hidden sm:inline">Файл</span>
          </button>
        </div>
      </div>

      {/* полотно */}
      <div className="flex min-h-0 flex-1">
        <div key={active.id} className="panel-in panel-in-anim min-w-0 flex-1 overflow-auto">
          {active.language === "markdown" ? (
            <div className="mx-auto max-w-[720px] px-5 py-6 md:px-8">{renderMarkdown(active.content)}</div>
          ) : (
            <CodeView content={active.content} />
          )}
        </div>
        {active.language === "jsonc" && <MiniMap content={active.content} />}
      </div>
    </div>
  );
}
