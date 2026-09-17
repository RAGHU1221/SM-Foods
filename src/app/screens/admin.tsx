import React, { useState } from "react";
import { Printer, Wifi, WifiOff, CheckCircle, XCircle, HardDrive, Download, Upload, RotateCcw, Sun, Moon, Globe, Shield, KeyRound, Clock } from "lucide-react";
import { GlassCard, PrimaryButton, Field, TextInput, SelectInput, SectionHeader, ConfirmDialog } from "../components/shared";
import type { Lang, ThemeMode } from "../types";

export function PrinterScreen({ t }: { t: (k: string) => string }) {
  const [thermalConnected, setThermalConnected] = useState(true);
  const [a4Connected, setA4Connected] = useState(false);
  const [autoPrint, setAutoPrint] = useState(true);

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5 gap-4 max-w-2xl">
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title={t("thermalPrinter")} />
          {thermalConnected ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-500"><CheckCircle size={13} /> {t("connected")}</span> : <span className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle size={13} /> {t("disconnected")}</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("printerName")}><TextInput defaultValue="EPSON TM-T82 (Bluetooth)" /></Field>
          <Field label={t("paperWidth")}>
            <SelectInput defaultValue="58mm"><option>58mm</option><option>80mm</option></SelectInput>
          </Field>
          <Field label={t("copies")}><TextInput type="number" defaultValue={1} /></Field>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{t("autoPrint")}</span>
            <button onClick={() => setAutoPrint(!autoPrint)} className="w-11 h-6 rounded-full relative" style={{ background: autoPrint ? "var(--success)" : "var(--muted)" }}>
              <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: autoPrint ? 22 : 2 }} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <PrimaryButton variant="outline" onClick={() => setThermalConnected(!thermalConnected)}><Wifi size={14} /> {thermalConnected ? t("disconnected") : t("connected")}</PrimaryButton>
          <PrimaryButton onClick={() => alert("Test print sent")}><Printer size={14} /> {t("testPrint")}</PrimaryButton>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title={t("a4Printer")} />
          {a4Connected ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-500"><CheckCircle size={13} /> {t("connected")}</span> : <span className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle size={13} /> {t("disconnected")}</span>}
        </div>
        <Field label={t("printerName")}><TextInput defaultValue="HP LaserJet M126 (Network)" /></Field>
        <div className="flex gap-2 mt-4">
          <PrimaryButton variant="outline" onClick={() => setA4Connected(!a4Connected)}><Wifi size={14} /> {a4Connected ? t("disconnected") : t("connected")}</PrimaryButton>
          <PrimaryButton onClick={() => alert("Test print sent")}><Printer size={14} /> {t("testPrint")}</PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}

export function SettingsScreen({ dark, setDark, lang, setLang, t }: { dark: boolean; setDark: (v: boolean) => void; lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }) {
  const [gstEnabled, setGstEnabled] = useState(true);
  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5 gap-4 max-w-2xl">
      <GlassCard className="p-5">
        <SectionHeader title={t("businessSettings")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("businessName")}><TextInput defaultValue="Sri Murugan Foods" /></Field>
          <Field label={t("phone")}><TextInput defaultValue="+91 98421 55667" /></Field>
          <Field label={t("address")}><TextInput defaultValue="No.24, Market Street, Salem - 636001" /></Field>
          <Field label={t("gstNumber")}><TextInput defaultValue="33SMFPQ1234K1Z8" /></Field>
          <Field label={t("invoiceFooter")}><TextInput defaultValue="Thank you! Visit again." /></Field>
          <Field label={t("logo")}><TextInput placeholder="logo.png" /></Field>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <SectionHeader title={t("billingSettings")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between md:col-span-2">
            <span className="text-sm font-semibold">{gstEnabled ? t("gstBill") : t("nonGstBill")}</span>
            <button onClick={() => setGstEnabled(!gstEnabled)} className="w-11 h-6 rounded-full relative" style={{ background: gstEnabled ? "var(--success)" : "var(--muted)" }}>
              <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: gstEnabled ? 22 : 2 }} />
            </button>
          </div>
          <Field label={t("defaultPayment")}><SelectInput defaultValue="cash"><option value="cash">{t("cash")}</option><option value="upi">{t("upi")}</option></SelectInput></Field>
          <Field label={t("invoicePrefix")}><TextInput defaultValue="SMF-" /></Field>
          <Field label={t("invoiceNumber")}><TextInput defaultValue="1103" /></Field>
          <Field label={t("decimalSettings")}><SelectInput defaultValue="2"><option value="0">0</option><option value="2">2</option></SelectInput></Field>
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
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-left" style={{ background: "var(--muted)" }}><KeyRound size={15} /> {t("password")}</button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-left" style={{ background: "var(--muted)" }}><Shield size={15} /> User settings</button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-left" style={{ background: "var(--muted)" }}><Clock size={15} /> {t("session")}</button>
        </div>
      </GlassCard>

      <PrimaryButton onClick={() => alert("Settings saved")}>{t("saveSettings")}</PrimaryButton>
    </div>
  );
}

export function BackupScreen({ t }: { t: (k: string) => string }) {
  const [confirmRestore, setConfirmRestore] = useState(false);
  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5 gap-4 max-w-2xl">
      <GlassCard className="p-5 flex flex-col gap-3">
        <div className="flex justify-between text-sm"><span style={{ color: "var(--muted-foreground)" }}>{t("lastBackup")}</span><span className="font-semibold">2026-09-16, 03:00 AM</span></div>
        <div className="flex justify-between text-sm"><span style={{ color: "var(--muted-foreground)" }}>{t("databaseSize")}</span><span className="font-semibold">184 MB</span></div>
        <div className="flex justify-between text-sm"><span style={{ color: "var(--muted-foreground)" }}>{t("backupStatus")}</span><span className="font-semibold text-emerald-500 flex items-center gap-1"><CheckCircle size={13} /> Success</span></div>
      </GlassCard>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PrimaryButton onClick={() => alert("Backup created")}><HardDrive size={15} /> {t("createBackup")}</PrimaryButton>
        <PrimaryButton variant="outline" onClick={() => alert("Backup downloaded")}><Download size={15} /> {t("downloadBackup")}</PrimaryButton>
        <PrimaryButton variant="danger" onClick={() => setConfirmRestore(true)}><RotateCcw size={15} /> {t("restoreBackup")}</PrimaryButton>
      </div>
      <ConfirmDialog open={confirmRestore} title={t("areYouSure")} message={t("restoreBackup") + "?"} onCancel={() => setConfirmRestore(false)} onConfirm={() => setConfirmRestore(false)} danger t={t} />
    </div>
  );
}
