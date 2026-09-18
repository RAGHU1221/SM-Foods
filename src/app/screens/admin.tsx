import React, { useRef, useState } from "react";
import { Printer, Wifi, WifiOff, CheckCircle, XCircle, HardDrive, Download, Upload, RotateCcw, Sun, Moon, Globe, Shield, KeyRound, Clock, Loader2 } from "lucide-react";
import { GlassCard, PrimaryButton, Field, TextInput, SelectInput, SectionHeader, ConfirmDialog } from "../components/shared";
import { generateBillPdf, printBillPdf } from "../lib/pdf";
import { STORAGE_PREFIX } from "../storage";
import type { Lang, ThemeMode, PrinterSettings, BusinessSettings } from "../types";

export function PrinterScreen({ t, printerSettings, setPrinterSettings }: {
  t: (k: string) => string; printerSettings: PrinterSettings; setPrinterSettings: (p: PrinterSettings) => void;
}) {
  const [busy, setBusy] = useState<"thermal" | "a4" | null>(null);
  const update = <K extends keyof PrinterSettings>(key: K, value: PrinterSettings[K]) => setPrinterSettings({ ...printerSettings, [key]: value });

  const handleTestPrint = async (which: "thermal" | "a4") => {
    if (busy) return;
    if (which === "thermal" && !printerSettings.thermalConnected) { alert(t("disconnected")); return; }
    if (which === "a4" && !printerSettings.a4Connected) { alert(t("disconnected")); return; }
    setBusy(which);
    try {
      const blob = await generateBillPdf("test-print-area", which === "thermal" ? "thermal" : "a4");
      await printBillPdf(blob, `Test-Print-${which}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Test print failed — please check the printer and try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5 gap-4 max-w-2xl">
      {/* Off-screen content used only to generate the test-print PDF. */}
      <div id="test-print-area" style={{ position: "fixed", left: -9999, top: 0, width: 300, background: "#fff", color: "#111", padding: 16, fontFamily: "monospace" }}>
        <p style={{ fontWeight: 700, fontSize: 14 }}>Sri Murugan Foods</p>
        <p style={{ fontSize: 11 }}>Test Print — {new Date().toLocaleString("en-IN")}</p>
        <p style={{ fontSize: 11, marginTop: 8 }}>Printer: {printerSettings.thermalName}</p>
        <p style={{ fontSize: 11 }}>If you can read this, the printer is working.</p>
      </div>

      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title={t("thermalPrinter")} />
          {printerSettings.thermalConnected ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-500"><CheckCircle size={13} /> {t("connected")}</span> : <span className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle size={13} /> {t("disconnected")}</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("printerName")}><TextInput value={printerSettings.thermalName} onChange={e => update("thermalName", e.target.value)} /></Field>
          <Field label={t("paperWidth")}>
            <SelectInput value={printerSettings.paperWidth} onChange={e => update("paperWidth", e.target.value)}><option>58mm</option><option>80mm</option></SelectInput>
          </Field>
          <Field label={t("copies")}><TextInput type="number" value={printerSettings.copies} onChange={e => update("copies", Number(e.target.value) || 1)} /></Field>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{t("autoPrint")}</span>
            <button onClick={() => update("autoPrint", !printerSettings.autoPrint)} className="w-11 h-6 rounded-full relative" style={{ background: printerSettings.autoPrint ? "var(--success)" : "var(--muted)" }}>
              <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: printerSettings.autoPrint ? 22 : 2 }} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <PrimaryButton variant="outline" onClick={() => update("thermalConnected", !printerSettings.thermalConnected)}><Wifi size={14} /> {printerSettings.thermalConnected ? t("disconnected") : t("connected")}</PrimaryButton>
          <PrimaryButton onClick={() => handleTestPrint("thermal")} disabled={busy === "thermal"}>{busy === "thermal" ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />} {t("testPrint")}</PrimaryButton>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title={t("a4Printer")} />
          {printerSettings.a4Connected ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-500"><CheckCircle size={13} /> {t("connected")}</span> : <span className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle size={13} /> {t("disconnected")}</span>}
        </div>
        <Field label={t("printerName")}><TextInput value={printerSettings.a4Name} onChange={e => update("a4Name", e.target.value)} /></Field>
        <div className="flex gap-2 mt-4">
          <PrimaryButton variant="outline" onClick={() => update("a4Connected", !printerSettings.a4Connected)}><Wifi size={14} /> {printerSettings.a4Connected ? t("disconnected") : t("connected")}</PrimaryButton>
          <PrimaryButton onClick={() => handleTestPrint("a4")} disabled={busy === "a4"}>{busy === "a4" ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />} {t("testPrint")}</PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}

export function SettingsScreen({ dark, setDark, lang, setLang, t, settings, setSettings }: {
  dark: boolean; setDark: (v: boolean) => void; lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string;
  settings: BusinessSettings; setSettings: (s: BusinessSettings) => void;
}) {
  const update = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => setSettings({ ...settings, [key]: value });
  const notAvailable = () => alert(lang === "ta" ? "இந்த அம்சம் இன்னும் கிடைக்கவில்லை." : "This feature isn't available yet.");

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5 gap-4 max-w-2xl">
      <GlassCard className="p-5">
        <SectionHeader title={t("businessSettings")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("businessName")}><TextInput value={settings.businessName} onChange={e => update("businessName", e.target.value)} /></Field>
          <Field label={t("phone")}><TextInput value={settings.phone} onChange={e => update("phone", e.target.value)} /></Field>
          <Field label={t("address")}><TextInput value={settings.address} onChange={e => update("address", e.target.value)} /></Field>
          <Field label={t("gstNumber")}><TextInput value={settings.gstNumber} onChange={e => update("gstNumber", e.target.value)} /></Field>
          <Field label={t("invoiceFooter")}><TextInput value={settings.invoiceFooter} onChange={e => update("invoiceFooter", e.target.value)} /></Field>
          <Field label={t("logo")}><TextInput value={settings.logo} onChange={e => update("logo", e.target.value)} placeholder="logo.png" /></Field>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionHeader title={t("billingSettings")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between md:col-span-2">
            <span className="text-sm font-semibold">{settings.gstEnabledDefault ? t("gstBill") : t("nonGstBill")}</span>
            <button onClick={() => update("gstEnabledDefault", !settings.gstEnabledDefault)} className="w-11 h-6 rounded-full relative" style={{ background: settings.gstEnabledDefault ? "var(--success)" : "var(--muted)" }}>
              <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: settings.gstEnabledDefault ? 22 : 2 }} />
            </button>
          </div>
          <Field label={t("defaultPayment")}>
            <SelectInput value={settings.defaultPayment} onChange={e => update("defaultPayment", e.target.value as BusinessSettings["defaultPayment"])}>
              <option value="cash">{t("cash")}</option><option value="upi">{t("upi")}</option>
            </SelectInput>
          </Field>
          <Field label={t("invoicePrefix")}><TextInput value={settings.invoicePrefix} onChange={e => update("invoicePrefix", e.target.value)} /></Field>
          <Field label={t("invoiceNumber")}><TextInput type="number" value={settings.invoiceNumber} onChange={e => update("invoiceNumber", Number(e.target.value) || 0)} /></Field>
          <Field label={t("decimalSettings")}>
            <SelectInput value={String(settings.decimals)} onChange={e => update("decimals", Number(e.target.value))}><option value="0">0</option><option value="2">2</option></SelectInput>
          </Field>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionHeader title={t("language")} />
        <div className="flex gap-2">
          <button onClick={() => setLang("en")} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold" style={lang === "en" ? { background: "var(--primary)", color: "white" } : { background: "var(--muted)" }}>English</button>
          <button onClick={() => setLang("ta")} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold" style={lang === "ta" ? { background: "var(--primary)", color: "white" } : { background: "var(--muted)" }}>தமிழ்</button>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionHeader title={t("theme")} />
        <div className="flex gap-2">
          <button onClick={() => setDark(false)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold" style={!dark ? { background: "var(--primary)", color: "white" } : { background: "var(--muted)" }}><Sun size={15} /> {t("light")}</button>
          <button onClick={() => setDark(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold" style={dark ? { background: "var(--primary)", color: "white" } : { background: "var(--muted)" }}><Moon size={15} /> {t("dark")}</button>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionHeader title={t("security")} />
        <div className="flex flex-col gap-2">
          <button onClick={notAvailable} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-left" style={{ background: "var(--muted)" }}><KeyRound size={15} /> {t("password")}</button>
          <button onClick={notAvailable} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-left" style={{ background: "var(--muted)" }}><Shield size={15} /> User settings</button>
          <button onClick={notAvailable} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-left" style={{ background: "var(--muted)" }}><Clock size={15} /> {t("session")}</button>
        </div>
      </GlassCard>

      <PrimaryButton onClick={() => alert(lang === "ta" ? "அமைப்புகள் சேமிக்கப்பட்டன." : "Settings saved.")}>{t("saveSettings")}</PrimaryButton>
    </div>
  );
}

function nowStamp() {
  return new Date().toLocaleString("en-IN");
}

export function BackupScreen({ t }: { t: (k: string) => string }) {
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [sizeKb, setSizeKb] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const collectBackup = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try { data[key.slice(STORAGE_PREFIX.length)] = JSON.parse(localStorage.getItem(key) || "null"); }
        catch { /* skip unparseable entries */ }
      }
    }
    return { createdAt: new Date().toISOString(), data };
  };

  const handleCreateBackup = () => {
    const backup = collectBackup();
    const json = JSON.stringify(backup, null, 2);
    setLastBackupAt(nowStamp());
    setSizeKb(Math.round(new Blob([json]).size / 1024));
    alert(`Backup created (${Math.round(new Blob([json]).size / 1024)} KB). Use "Download Backup" to save the file.`);
  };

  const handleDownloadBackup = () => {
    const backup = collectBackup();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smfoods-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setLastBackupAt(nowStamp());
    setSizeKb(Math.round(new Blob([json]).size / 1024));
  };

  const handleRestoreConfirmed = () => {
    setConfirmRestore(false);
    if (!pendingFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const data = parsed && typeof parsed === "object" && parsed.data ? parsed.data : parsed;
        Object.keys(data).forEach(key => {
          localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data[key]));
        });
        alert("Backup restored. The app will now reload.");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("That file doesn't look like a valid backup — restore cancelled.");
      } finally {
        setPendingFile(null);
      }
    };
    reader.readAsText(pendingFile);
  };

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5 gap-4 max-w-2xl">
      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setPendingFile(f); setConfirmRestore(true); } e.target.value = ""; }} />
      <GlassCard className="p-5 flex flex-col gap-3">
        <div className="flex justify-between text-sm"><span style={{ color: "var(--muted-foreground)" }}>{t("lastBackup")}</span><span className="font-semibold">{lastBackupAt || "—"}</span></div>
        <div className="flex justify-between text-sm"><span style={{ color: "var(--muted-foreground)" }}>{t("databaseSize")}</span><span className="font-semibold">{sizeKb != null ? `${sizeKb} KB` : "—"}</span></div>
        <div className="flex justify-between text-sm"><span style={{ color: "var(--muted-foreground)" }}>{t("backupStatus")}</span><span className="font-semibold text-emerald-500 flex items-center gap-1"><CheckCircle size={13} /> {lastBackupAt ? "Success" : "No backup yet"}</span></div>
      </GlassCard>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PrimaryButton onClick={handleCreateBackup}><HardDrive size={15} /> {t("createBackup")}</PrimaryButton>
        <PrimaryButton variant="outline" onClick={handleDownloadBackup}><Download size={15} /> {t("downloadBackup")}</PrimaryButton>
        <PrimaryButton variant="danger" onClick={() => fileInputRef.current?.click()}><RotateCcw size={15} /> {t("restoreBackup")}</PrimaryButton>
      </div>
      <ConfirmDialog open={confirmRestore} title={t("areYouSure")} message={t("restoreBackup") + "? This replaces all current app data with the backup file's data."} onCancel={() => { setConfirmRestore(false); setPendingFile(null); }} onConfirm={handleRestoreConfirmed} danger t={t} />
    </div>
  );
}
