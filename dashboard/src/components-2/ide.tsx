import React from "react";
import { KIT_FILES, MACHINE, REPO, type KitFile } from "../data/kit";
import {
  BranchIcon,
  ChevronIcon,
  CheckIcon,
  FilesIcon,
  InfoIcon,
  GearIcon,
  PwshIcon,
  ZipIcon,
  fileIcon,
} from "./icons";

/* ─────────────────────────── Тайтлбар ─────────────────────────── */

export function TitleBar() {
  return (
    <div className="flex h-9 shrink-0 select-none items-center gap-3 border-b border-ink-700 bg-ink-900 px-3">
      <div className="hidden items-center gap-3 font-mono text-[11px] text-ink-400 md:flex">
        {["File", "Edit", "View", "Go", "Run", "Terminal", "Help"].map((m) => (
          <span key={m} className="cursor-default transition-colors hover:text-ink-200">
            {m}
          </span>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
        <span className="hidden text-mauve sm:inline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 8 5 12l5 4M14 8l5 4-5 4" />
          </svg>
        </span>
        <span className="truncate font-mono text-[11.5px] text-ink-300">
          astro-blog — комплект .vscode — Visual Studio Code
        </span>
      </div>
      <div className="flex items-center gap-0.5 text-ink-400">
        <span className="flex h-7 w-9 cursor-default items-center justify-center transition-colors hover:bg-ink-700/60 hover:text-ink-100">
          <svg width="11" height="11" viewBox="0 0 12 12"><path d="M1 6h10" stroke="currentColor" strokeWidth="1.2" /></svg>
        </span>
        <span className="flex h-7 w-9 cursor-default items-center justify-center transition-colors hover:bg-ink-700/60 hover:text-ink-100">
          <svg width="10" height="10" viewBox="0 0 12 12"><rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.2" fill="none" /></svg>
        </span>
        <span className="flex h-7 w-9 cursor-default items-center justify-center transition-colors hover:bg-rose hover:text-white">
          <svg width="11" height="11" viewBox="0 0 12 12"><path d="m2 2 8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.2" /></svg>
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────── Активность ───────────────────────── */

export function ActivityBar({
  view,
  onView,
}: {
  view: "files" | "project";
  onView: (v: "files" | "project") => void;
}) {
  const Item = ({
    id,
    label,
    children,
  }: {
    id: "files" | "project";
    label: string;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => onView(id)}
      title={label}
      className={`group relative flex h-12 w-full items-center justify-center transition-colors ${
        view === id ? "text-mauve" : "text-ink-400 hover:text-ink-200"
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r bg-mauve transition-all ${
          view === id ? "opacity-100" : "opacity-0 group-hover:opacity-40"
        }`}
      />
      {children}
    </button>
  );

  return (
    <div className="hidden w-12 shrink-0 flex-col items-stretch border-r border-ink-700 bg-ink-900 sm:flex">
      <div className="pt-1.5">
        <Item id="files" label="Проводник комплекта">
          <FilesIcon size={22} />
        </Item>
        <Item id="project" label="Осмотр репозитория">
          <InfoIcon size={22} />
        </Item>
      </div>
      <div className="mt-auto pb-2">
        <div className="flex h-12 items-center justify-center text-ink-400">
          <GearIcon size={20} />
        </div>
        <div
          className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-mauve font-display text-[11px] font-bold text-white"
          title="anna"
        >
          А
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Проводник ────────────────────────── */

export function Explorer({
  activeId,
  onOpen,
  zipping,
  onZip,
}: {
  activeId: string;
  onOpen: (id: string) => void;
  zipping: boolean;
  onZip: () => void;
}) {
  const vs = KIT_FILES.filter((f) => f.kind !== "readme");
  const readme = KIT_FILES.find((f) => f.kind === "readme")!;

  const Row = ({ f, depth }: { f: KitFile; depth: number }) => {
    const active = activeId === f.id;
    return (
      <button
        onClick={() => onOpen(f.id)}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        className={`group flex w-full items-center gap-2 py-[7px] pr-2 text-left text-[13px] transition-colors ${
          active
            ? "bg-mauve/10 font-medium text-mauve"
            : "text-ink-300 hover:bg-ink-800 hover:text-ink-100"
        }`}
      >
        <span className={`transition-opacity ${active ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}>
          {fileIcon(f.kind)}
        </span>
        <span className="truncate font-mono">{f.name}</span>
        <span
          className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full transition-opacity ${
            active ? "bg-mauve opacity-100" : "opacity-0"
          }`}
        />
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-2 pt-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
        Проводник
      </div>

      <div className="panel-in flex-1 overflow-y-auto px-2 pb-1 pt-1 text-[13px]">
        <div className="flex items-center gap-1.5 px-2 py-1 font-semibold">
          <ChevronIcon size={13} className="rotate-90 text-ink-400" />
          <span className="font-mono text-ink-100">astro-blog</span>
        </div>

        <button
          onClick={() => onOpen(readme.id)}
          className={`flex w-full items-center gap-2 py-[7px] pl-6 pr-2 text-left transition-colors ${
            activeId === readme.id
              ? "bg-mauve/10 font-medium text-mauve"
              : "text-ink-300 hover:bg-ink-800 hover:text-ink-100"
          }`}
        >
          {fileIcon("readme")}
          <span className="truncate font-mono text-[13px]">{readme.name}</span>
        </button>

        <div className="flex items-center gap-1.5 px-6 py-1 font-semibold">
          <ChevronIcon size={13} className="rotate-90 text-ink-400" />
          <span className="font-mono text-ink-100">.vscode</span>
          <span className="ml-1 rounded bg-ink-800 px-1.5 py-px font-mono text-[10px] font-medium text-ink-300">
            5
          </span>
        </div>

        <div>
          {vs.map((f) => (
            <Row key={f.id} f={f} depth={2} />
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-2 border-t border-ink-700 p-3">
        <button
          onClick={onZip}
          disabled={zipping}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-mauve px-3 py-2 text-[13px] font-semibold text-white transition-all hover:bg-lav hover:shadow-[0_6px_20px_rgba(26,115,232,0.35)] active:scale-[0.98] disabled:opacity-70"
        >
          {zipping ? (
            <span className="spin-slow inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <ZipIcon size={16} />
          )}
          {zipping ? "Упаковываю…" : "Скачать .vscode.zip"}
        </button>
        <p className="px-1 text-[11px] leading-snug text-ink-400">
          В архиве — папка <span className="font-mono text-ink-200">.vscode</span> и инструкция{" "}
          <span className="font-mono text-ink-200">КАК-УСТАНОВИТЬ.md</span>
        </p>

        {/* разъяснение: что скачивается, а что — нет */}
        <div className="rounded-md border border-lemon/50 bg-lemon/10 px-2.5 py-2 text-[11px] leading-snug text-ink-300">
          <span className="font-bold text-peach">Скачивается только это.</span>{" "}
          Файлы <span className="font-mono">.tsx</span> (InstallGuide, Editor, Panel…) — исходный код
          самой страницы-документации: они уже встроены в неё и отдельно не скачиваются.
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── О проекте ────────────────────────── */

export function ProjectPanel() {
  return (
    <div className="panel-in h-full overflow-y-auto">
      <div className="px-4 pb-2 pt-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
        Осмотр репозитория
      </div>
      <div className="space-y-4 px-4 pb-4 text-[13px]">
        <div>
          <div className="font-mono font-semibold text-ink-100">
            {REPO.owner}/{REPO.name}
          </div>
          <div className="mt-1 text-[12px] leading-snug text-ink-400">
            форк темы <span className="font-semibold text-mauve">{REPO.theme}</span> · ветка {REPO.branch} ·{" "}
            {REPO.commits} коммитов
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {REPO.stack.map((s) => (
            <span
              key={s.label}
              className="flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-950 px-2.5 py-1 font-mono text-[11px] text-ink-200"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
              {s.label}
            </span>
          ))}
        </div>

        <div>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400">
            Скрипты package.json
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REPO.scripts.map((s) => (
              <span key={s} className="rounded border border-ink-700 bg-ink-950 px-2 py-0.5 font-mono text-[11.5px] text-teal">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400">
            Факт → решение комплекта
          </div>
          <ul className="space-y-2">
            {REPO.findings.map((f, i) => (
              <li key={i} className="rounded-md border border-ink-700 bg-ink-950 p-2.5">
                <div className="text-[12px] leading-snug text-ink-300">{f.fact}</div>
                <div className="mt-1 flex items-start gap-1.5 text-[12px] font-medium leading-snug text-peach">
                  <span className="mt-1.5 h-1 w-3 shrink-0 rounded-full bg-peach/70" />
                  {f.decision}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400">
            Ваша машина
          </div>
          <ul className="overflow-hidden rounded-md border border-ink-700">
            {MACHINE.map((m, i) => (
              <li
                key={m.k}
                className={`flex items-baseline justify-between gap-2 px-2.5 py-1.5 ${
                  i % 2 ? "bg-ink-900" : "bg-ink-950"
                }`}
              >
                <span className="font-mono text-[11px] text-ink-400">{m.k}</span>
                <span className="text-right text-[12px] text-ink-200">{m.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Статусбар ────────────────────────── */

export function StatusBar({ file, lines }: { file: KitFile; lines: number }) {
  return (
    <div className="flex h-[26px] shrink-0 select-none items-center gap-0 overflow-x-auto border-t border-ink-700 bg-mauve px-2 font-mono text-[11.5px] text-white">
      <span className="flex items-center gap-1.5 px-2 py-0.5 transition-colors hover:bg-white/10">
        <BranchIcon size={13} />
        main
      </span>
      <span className="flex items-center gap-1.5 px-2 py-0.5">
        <CheckIcon size={12} />0
        <span>0</span>
      </span>
      <span className="flex items-center gap-1.5 px-2 py-0.5">
        <PwshIcon size={14} />
        pwsh 7.6.5
      </span>
      <span className="ml-auto flex items-center gap-3">
        <span className="hidden px-2 sm:inline">Строк: {lines}</span>
        <span className="hidden px-2 md:inline">UTF-8</span>
        <span className="hidden px-2 md:inline" title="переносы строк зафиксированы на LF">
          LF
        </span>
        <span className="px-2">{file.language === "jsonc" ? "JSONC с комментариями" : "Markdown"}</span>
        <span className="flex items-center gap-1.5 bg-white/15 px-2.5 py-[3px] font-semibold">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-grass" />
          Astro
        </span>
      </span>
    </div>
  );
}

/* ─────────────────────── строка хоткеев ───────────────────────── */

export function Shortcuts() {
  const items = [
    ["Ctrl+Shift+B", "сборка"],
    ["F5", "dev + браузер"],
    ["Ctrl+`", "терминал pwsh"],
    ["Ctrl+Shift+P", "палитра команд"],
    ["rpost + Tab", "сниппет поста"],
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-1 font-mono text-[11.5px] text-ink-400">
      {items.map(([k, v]) => (
        <span key={k} className="flex items-center gap-1.5">
          <kbd className="rounded border border-ink-700 bg-ink-900 px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-200">
            {k}
          </kbd>
          {v}
        </span>
      ))}
    </div>
  );
}
