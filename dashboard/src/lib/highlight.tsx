import React from "react";

/* ============================================================
 * Лёгкая подсветка JSONC (JSON с комментариями) и мини-рендерер
 * markdown. Без внешних библиотек: достаточно для конфигов.
 * ============================================================ */

export type Seg = { text: string; cls: string };

const JSONC_TOKEN =
  /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b|\bnull\b)/g;

function clsFor(m: RegExpExecArray): string {
  if (m[1] || m[2]) return "text-grass italic"; // комментарий
  if (m[3]) return m[4] ? "text-sky" : "text-peach"; // ключ : строка
  if (m[5]) return "text-lemon"; // число
  return "text-rose"; // true/false/null
}

export function highlightJsonc(src: string): Seg[][] {
  return src.split("\n").map((line) => {
    const out: Seg[] = [];
    let last = 0;
    const re = new RegExp(JSONC_TOKEN.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) out.push({ text: line.slice(last, m.index), cls: "text-ink-200" });
      out.push({ text: m[0], cls: clsFor(m) });
      last = re.lastIndex;
    }
    if (last < line.length) out.push({ text: line.slice(last), cls: "text-ink-200" });
    return out;
  });
}

/* ─────────────────── мини-рендерер markdown ──────────────────── */

function inline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return (
        <strong key={i} className="font-bold text-ink-100">
          {p.slice(2, -2)}
        </strong>
      );
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code
          key={i}
          className="rounded border border-ink-700 bg-ink-900 px-1.5 py-px font-mono text-[0.85em] text-mauve"
        >
          {p.slice(1, -1)}
        </code>
      );
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link)
      return (
        <a
          key={i}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-mauve underline decoration-mauve/40 underline-offset-2 transition-colors hover:decoration-mauve"
        >
          {link[1]}
        </a>
      );
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export function renderMarkdown(src: string): React.ReactNode {
  const lines = src.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // блок кода ```
    if (line.trimStart().startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push(
        <pre
          key={key++}
          className="my-3 overflow-x-auto rounded-lg border border-ink-700 bg-ink-900 p-3.5 font-mono text-[12.5px] leading-relaxed text-teal"
        >
          {buf.join("\n")}
        </pre>,
      );
      continue;
    }

    // заголовки
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const cls =
        level === 1
          ? "font-display text-[26px] font-extrabold tracking-tight text-ink-100"
          : level === 2
            ? "mt-6 font-display text-[17px] font-bold text-ink-100"
            : "mt-4 font-display text-[14px] font-bold text-ink-200";
      out.push(
        <div key={key++} className={cls}>
          {inline(h[2])}
        </div>,
      );
      i++;
      continue;
    }

    // цитата >
    if (line.startsWith(">")) {
      out.push(
        <blockquote
          key={key++}
          className="my-3 border-l-[3px] border-rose bg-rose/5 py-2.5 pl-4 pr-3 text-[13.5px] leading-relaxed text-ink-300"
        >
          {inline(line.replace(/^>\s?/, ""))}
        </blockquote>,
      );
      i++;
      continue;
    }

    // списки
    if (/^(\d+)\.\s+/.test(line) || /^[-*]\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items: React.ReactNode[] = [];
      while (
        i < lines.length &&
        (/^(\d+)\.\s+/.test(lines[i]) || /^[-*]\s+/.test(lines[i]))
      ) {
        const text = lines[i].replace(/^(\d+)\.\s+|^[-*]\s+/, "");
        items.push(
          <li key={items.length} className="leading-relaxed">
            {inline(text)}
          </li>,
        );
        i++;
      }
      out.push(
        ordered ? (
          <ol key={key++} className="my-2.5 list-decimal space-y-1.5 pl-5 text-[13.5px] text-ink-200 marker:font-mono marker:text-mauve">
            {items}
          </ol>
        ) : (
          <ul key={key++} className="my-2.5 list-disc space-y-1.5 pl-5 text-[13.5px] text-ink-200 marker:text-mauve">
            {items}
          </ul>
        ),
      );
      continue;
    }

    // пустая строка
    if (line.trim() === "") {
      i++;
      continue;
    }

    // абзац
    out.push(
      <p key={key++} className="my-2 text-[13.5px] leading-relaxed text-ink-200">
        {inline(line)}
      </p>,
    );
    i++;
  }

  return <div className="leading-normal">{out}</div>;
}
