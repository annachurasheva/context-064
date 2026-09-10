import React, { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon, TerminalIcon } from "./icons";

/* ─────────────────── появление при скролле ────────────────────── */

export function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

/* ─────────────────── заголовок секции ─────────────────────────── */

export function SectionHead({
  index,
  title,
  lead,
}: {
  index: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[12px] font-bold text-mauve">{index}</span>
        <span className="h-px flex-1 bg-ink-700" />
      </div>
      <h2 className="mt-2 font-display text-[20px] font-extrabold tracking-tight text-ink-100 sm:text-2xl">
        {title}
      </h2>
      {lead && <p className="mt-1.5 max-w-[640px] text-[13.5px] leading-relaxed text-ink-300">{lead}</p>}
    </div>
  );
}

/* ─────────────── терминальный блок с копированием ─────────────── */

export function Term({
  code,
  onCopy,
  comment,
}: {
  code: string;
  comment?: string;
  onCopy: (text: string, label: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group overflow-hidden rounded-lg border border-ink-700 bg-ink-100">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-ink-400">
          <TerminalIcon size={12} className="text-teal" />
          PowerShell 7
        </span>
        <button
          onClick={() => {
            onCopy(code, "команда");
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10.5px] transition-colors ${
            copied ? "text-grass" : "text-ink-400 hover:text-white"
          }`}
        >
          {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
          {copied ? "готово" : "копировать"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[12.5px] leading-relaxed">
        <code className="text-teal">{code}</code>
        {comment && <span className="mt-1 block text-[11.5px] text-ink-400"># {comment}</span>}
      </pre>
    </div>
  );
}

/* ─────────────────── маленькая кнопка-копирование ─────────────── */

export function CopyBtn({
  text,
  label,
  onCopy,
  children,
}: {
  text: string;
  label: string;
  onCopy: (t: string, l: string) => void;
  children: React.ReactNode;
}) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        onCopy(text, label);
        setOk(true);
        setTimeout(() => setOk(false), 1600);
      }}
      className={`flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10.5px] transition-all active:scale-95 ${
        ok
          ? "border-grass/60 bg-grass/10 text-grass"
          : "border-ink-700 bg-ink-950 text-ink-300 hover:border-mauve hover:text-mauve"
      }`}
    >
      {ok ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
      {ok ? "готово" : children}
    </button>
  );
}
