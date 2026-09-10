import React from "react";

/* ============================================================
 * Набор inline-SVG иконок в «редакторском» стиле.
 * Все наследуют currentColor — цвет задаётся классом text-*.
 * ============================================================ */

type P = { size?: number; className?: string };

const base = (size = 16) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const FilesIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 5a2 2 0 0 1 2-2h6l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" />
    <path d="M12 3v6h6" />
    <path d="M8 14h8M8 17h5" />
  </svg>
);

export const InfoIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <circle cx="12" cy="8" r="0.6" fill="currentColor" />
  </svg>
);

export const GearIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12a7 7 0 0 0-.15-1.4l2-1.55-2-3.46-2.35.95a7 7 0 0 0-2.42-1.4L13.7 2.6h-3.4l-.38 2.54a7 7 0 0 0-2.42 1.4l-2.35-.95-2 3.46 2 1.55A7 7 0 0 0 5 12c0 .48.05.94.15 1.4l-2 1.55 2 3.46 2.35-.95a7 7 0 0 0 2.42 1.4l.38 2.54h3.4l.38-2.54a7 7 0 0 0 2.42-1.4l2.35.95 2-3.46-2-1.55c.1-.46.15-.92.15-1.4Z" />
  </svg>
);

export const ChevronIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className} strokeWidth={2.2}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const CopyIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CheckIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className} strokeWidth={2.4}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const DownloadIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M4 20h16" />
  </svg>
);

export const ZipIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path d="M14 3v5h5" />
    <path d="M9 8h2M9 11h2M9 14h2M9 17h2" />
  </svg>
);

export const BranchIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="8" r="2.5" />
    <path d="M6 8.5v7M18 10.5c0 4-4 4.5-9.5 4.5" />
  </svg>
);

export const TerminalIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m7 9 3 3-3 3M12.5 15H17" />
  </svg>
);

export const PwshIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
    <path d="m6.5 8 4.5 4-4.5 4M13 16.5h5" strokeWidth={2} />
  </svg>
);

export const ArrowIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className} strokeWidth={2.2}>
    <path d="M4 12h16M13 5l7 7-7 7" />
  </svg>
);

export const GlobeIcon = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.8 2.6 4 5.7 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.7-4-9s1.2-6.4 4-9Z" />
  </svg>
);

/* Иконка файла по типу (цветные «язычки», как в VS Code) */
export function fileIcon(kind: string, size = 16) {
  const map: Record<string, { c: string; t: string }> = {
    readme: { c: "text-sky", t: "MD" },
    settings: { c: "text-mauve", t: "{ }" },
    extensions: { c: "text-teal", t: "▦" },
    tasks: { c: "text-peach", t: "▶" },
    launch: { c: "text-grass", t: "▷" },
    snippets: { c: "text-lemon", t: "✂" },
  };
  const m = map[kind] ?? map.settings;
  return (
    <span className={`inline-flex ${m.c}`}>
      <svg {...base(size)}>
        <path d="M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5" />
      </svg>
      <span className="sr-only">{m.t}</span>
    </span>
  );
}
