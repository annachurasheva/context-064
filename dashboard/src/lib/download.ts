import JSZip from "jszip";
import type { KitFile } from "../data/kit";

/* Копирование в буфер обмена с запасным путём для старых браузеров */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

/* Скачивание одного файла */
export function downloadFile(name: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* Упаковка всего комплекта в zip: .vscode/* + инструкция в корне */
export async function downloadZip(files: KitFile[]): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(".vscode");
  if (!folder) throw new Error("zip folder failed");
  for (const f of files) {
    if (f.kind === "readme") continue;
    folder.file(f.name, f.content);
  }
  const readme = files.find((f) => f.kind === "readme");
  if (readme) zip.file("КАК-УСТАНОВИТЬ.md", readme.content);
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vscode-kit-astro-blog.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
