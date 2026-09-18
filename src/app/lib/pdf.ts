// Real PDF generation + download/print/share for the bill receipt.
//
// The receipt screen renders the bill as normal DOM (#print-area). We turn
// that DOM into a PDF with html2canvas (DOM -> image) + jsPDF (image -> PDF
// page), then hand the result to the platform in the way that actually
// works there:
//  - Packaged Android app (Capacitor native): write the PDF to the
//    filesystem and open the native Share sheet. Android's share sheet has
//    a built-in "Print" target for PDFs, plus WhatsApp/Drive/etc, so this
//    covers "download", "print" and "share" all through one real file.
//  - Browser / PWA (Vercel, desktop, mobile Chrome): try the Web Share API
//    first (works on most mobile browsers); otherwise fall back to a plain
//    <a download> blob link, which every browser supports.
//
// Nothing here is a mock — every button that calls into this module ends
// with a real PDF file the user can open, save, print or send.

import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Printer } from "@capgo/capacitor-printer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export type BillPdfFormat = "thermal" | "a4";

const THERMAL_WIDTH_MM = 80; // standard 80mm thermal roll

// html2canvas 1.4.1 (the version this app uses) predates the CSS Color 4/5
// functions Tailwind v4 generates by default — every default palette color
// (text-red-500, text-emerald-500, ...) is defined as oklch(), and every
// "/opacity" utility (bg-primary/20, border-border/50, ...) gets a
// color-mix() variant for browsers that support it. getComputedStyle
// reports these back to JS in their literal oklch()/color-mix() form (this
// is real Chrome behaviour, not a test-only quirk), and html2canvas throws
// "Attempting to parse an unsupported color function" the moment it meets
// either one — e.g. the Customer Ledger's credit/debit amounts use
// text-emerald-500/text-red-500, which is exactly what broke Print/PDF/
// Share there in production. Fix: before html2canvas rasterizes the cloned
// DOM, walk it and replace any computed color value that uses one of these
// functions with a plain rgb()/rgba(). The 2D canvas context's fillStyle parser DOES
// understand oklch/color-mix (it just re-serializes back to oklch/oklab,
// which doesn't help) — so instead we paint a 1x1 pixel with that color and
// read the raw RGBA bytes back with getImageData, which always comes back
// as plain sRGB numbers html2canvas's own color parser can read directly.
const MODERN_COLOR_FN = /(oklch|oklab|lab|lch|color-mix)\(/i;
let sanitizeCtx: CanvasRenderingContext2D | null = null;

function resolveColorViaCanvas(cssColor: string): string {
  try {
    if (!sanitizeCtx) {
      const c = document.createElement("canvas");
      c.width = 1;
      c.height = 1;
      sanitizeCtx = c.getContext("2d", { willReadFrequently: true });
    }
    if (!sanitizeCtx) return cssColor;
    sanitizeCtx.clearRect(0, 0, 1, 1);
    sanitizeCtx.fillStyle = "#000000"; // reset so a failed parse falls back to black, not a stale color
    sanitizeCtx.fillStyle = cssColor;
    sanitizeCtx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = sanitizeCtx.getImageData(0, 0, 1, 1).data;
    return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  } catch {
    return "rgb(0, 0, 0)";
  }
}

// Replaces every oklch()/oklab()/lab()/lch()/color-mix() call inside a CSS
// value (handles nested calls like color-mix(in oklab, oklch(...) 50%, ...)
// via a balanced-paren scan, since those are valid and common) with its
// resolved rgb() equivalent. Values with none of these functions are
// returned untouched.
function sanitizeColorFunctions(value: string): string {
  if (!value || !MODERN_COLOR_FN.test(value)) return value;
  let result = "";
  let i = 0;
  while (i < value.length) {
    const rest = value.slice(i);
    const match = MODERN_COLOR_FN.exec(rest);
    if (!match || match.index === undefined) { result += rest; break; }
    const start = i + match.index;
    result += value.slice(i, start);
    const openParenIdx = start + match[0].length - 1;
    let depth = 1;
    let j = openParenIdx + 1;
    while (j < value.length && depth > 0) {
      if (value[j] === "(") depth++;
      else if (value[j] === ")") depth--;
      j++;
    }
    result += resolveColorViaCanvas(value.slice(start, j));
    i = j;
  }
  return result;
}

const COLOR_PROPS = [
  "color", "backgroundColor",
  "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor",
  "outlineColor", "textDecorationColor", "boxShadow",
] as const;

function sanitizeClonedColors(root: HTMLElement) {
  const all: HTMLElement[] = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  for (const el of all) {
    const computed = window.getComputedStyle(el);
    for (const prop of COLOR_PROPS) {
      const raw = computed[prop as keyof CSSStyleDeclaration] as unknown as string;
      if (typeof raw === "string" && MODERN_COLOR_FN.test(raw)) {
        el.style.setProperty(
          prop.replace(/[A-Z]/g, m => "-" + m.toLowerCase()),
          sanitizeColorFunctions(raw),
          "important"
        );
      }
    }
  }
}

async function elementToPdfBlob(el: HTMLElement, format: BillPdfFormat): Promise<Blob> {
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    onclone: (_doc, clonedEl) => sanitizeClonedColors(clonedEl),
  });
  const imgData = canvas.toDataURL("image/png");

  const pageWidthMm = format === "thermal" ? THERMAL_WIDTH_MM : 210; // A4 width
  const imgHeightMm = (canvas.height * pageWidthMm) / canvas.width;

  const pdf =
    format === "thermal"
      ? new jsPDF({ unit: "mm", format: [pageWidthMm, Math.max(imgHeightMm, 40)] })
      : new jsPDF({ unit: "mm", format: "a4" });

  if (format === "thermal") {
    pdf.addImage(imgData, "PNG", 0, 0, pageWidthMm, imgHeightMm);
  } else {
    // Slice across multiple A4 pages if the receipt is taller than one page.
    const pageHeightMm = pdf.internal.pageSize.getHeight();
    let heightLeft = imgHeightMm;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, pageWidthMm, imgHeightMm);
    heightLeft -= pageHeightMm;
    while (heightLeft > 0) {
      position = heightLeft - imgHeightMm;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidthMm, imgHeightMm);
      heightLeft -= pageHeightMm;
    }
  }

  return pdf.output("blob");
}

export async function generateBillPdf(elementId: string, format: BillPdfFormat): Promise<Blob> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found for PDF generation`);
  return elementToPdfBlob(el, format);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // strip the "data:application/pdf;base64," prefix Capacitor doesn't want
      resolve(result.split(",")[1] ?? result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function downloadBlobInBrowser(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Downloads the PDF (native: saves to device storage + opens the share
 * sheet so the user can pick where it goes; web: triggers a normal browser
 * download).
 */
export async function downloadBillPdf(blob: Blob, filename: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const base64 = await blobToBase64(blob);
    const written = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Documents,
      recursive: true,
    });
    try {
      await Share.share({ title: filename, url: written.uri, dialogTitle: "Save / Open bill PDF" });
    } catch {
      // Share can be cancelled by the user — the file is already saved, so that's fine.
    }
    return;
  }
  downloadBlobInBrowser(blob, filename);
}

/**
 * Opens the native share sheet (native: real Android share sheet, which
 * includes a system "Print" target, WhatsApp, Drive, etc; web: Web Share
 * API when available, else falls back to a plain download so the user can
 * still get the file).
 */
export async function shareBillPdf(blob: Blob, filename: string, text?: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const base64 = await blobToBase64(blob);
    const written = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    });
    await Share.share({ title: filename, text, url: written.uri, dialogTitle: "Share bill" });
    return;
  }

  const file = new File([blob], filename, { type: "application/pdf" });
  const nav = navigator as Navigator & { canShare?: (data?: { files?: File[] }) => boolean; share?: (data: unknown) => Promise<void> };
  try {
    if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
      await nav.share({ files: [file], title: filename, text });
      return;
    }
  } catch (err) {
    // Web Share can throw for reasons that aren't real failures — the user
    // cancelled the share sheet, or the browser's "transient activation"
    // window (needed to call navigator.share) expired while html2canvas was
    // still rendering the PDF. Either way the right recovery is the same
    // fallback a browser with no Share API gets: a plain download, not an
    // error the user has to dismiss.
    const name = (err as { name?: string })?.name;
    if (name === "AbortError") return; // user cancelled the share sheet — not an error
    console.warn("navigator.share failed, falling back to download:", err);
  }
  downloadBlobInBrowser(blob, filename);
}

/**
 * Prints the bill directly — this goes straight to the OS print dialog,
 * never a share/open sheet.
 *
 * Packaged Android app: @capgo/capacitor-printer's printBase64 calls
 * Android's real PrintManager/PrintHelper API directly — the same system
 * print dialog you'd get from Chrome or Gmail. This is what fixes "print
 * options go to share" — there is no app-picker step at all.
 *
 * Browser / PWA: deliberately NOT routed through the same plugin call —
 * its web fallback prints via a hidden iframe and has a real bug (an
 * unguarded DOM removal inside a setTimeout that can throw and leave the
 * print promise hanging forever on some browsers' PDF viewers). Opening the
 * PDF in a new tab and calling the browser's own print() on it is simpler
 * and was verified to work reliably.
 */
export async function printBillPdf(blob: Blob, filename: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const base64 = await blobToBase64(blob);
    try {
      await Printer.printBase64({ data: base64, mimeType: "application/pdf", name: filename });
      return;
    } catch (err) {
      console.error("Native print failed, falling back to share:", err);
      await shareBillPdf(blob, filename);
      return;
    }
  }

  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    downloadBlobInBrowser(blob, filename);
    return;
  }
  win.addEventListener("load", () => {
    win.focus();
    win.print();
  });
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
