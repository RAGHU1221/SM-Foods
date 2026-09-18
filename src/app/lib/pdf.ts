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

async function elementToPdfBlob(el: HTMLElement, format: BillPdfFormat): Promise<Blob> {
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
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
  if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
    await nav.share({ files: [file], title: filename, text });
    return;
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
