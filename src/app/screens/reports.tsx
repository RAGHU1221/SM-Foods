import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Printer, FileText, Download, MessageCircle, RotateCcw, Trash2, Loader2 } from "lucide-react";
import { GlassCard, PrimaryButton, Field, TextInput, SelectInput, SectionHeader, StatCard, ResponsiveTable, ConfirmDialog, EmptyState } from "../components/shared";
import { DAILY_SALES, MONTHLY_SALES, TOP_ITEMS, fmt, genId } from "../data";
import { DollarSign, Receipt, TrendingUp, Percent } from "lucide-react";
import { generateBillPdf, downloadBillPdf, printBillPdf, shareBillPdf } from "../lib/pdf";
import type { Bill, DeletedBill } from "../types";

const REPORT_TYPES = [
  "dailySales", "monthlySales", "itemSales", "customerSales", "gstReport",
  "paymentReport", "outstandingReport", "profitReport", "wholesaleReport",
];

function reportRowsToCsv(active: string, from: string, to: string): string {
  const lines = [
    `Report,${active}`,
    `From,${from}`,
    `To,${to}`,
    "",
    "Item,Units Sold",
    ...TOP_ITEMS.map(it => `${it.name.includes(",") ? `"${it.name}"` : it.name},${it.units}`),
  ];
  return lines.join("\n");
}

function downloadTextFile(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function ReportsScreen({ t }: { t: (k: string) => string }) {
  const [active, setActive] = useState("dailySales");
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState<string | null>(null);

  const withBusy = (key: string, fn: () => Promise<void>) => async () => {
    if (busy) return;
    setBusy(key);
    try { await fn(); }
    catch (err) { console.error(err); alert("Something went wrong — please try again."); }
    finally { setBusy(null); }
  };

  const filename = () => `${active}-${from}-to-${to}.pdf`;
  const handlePrint = withBusy("print", async () => {
    const blob = await generateBillPdf("report-print-area", "a4");
    await printBillPdf(blob, filename());
  });
  const handlePdf = withBusy("pdf", async () => {
    const blob = await generateBillPdf("report-print-area", "a4");
    await downloadBillPdf(blob, filename());
  });
  const handleExcel = () => {
    downloadTextFile(reportRowsToCsv(active, from, to), `${active}-${from}-to-${to}.csv`, "text/csv");
  };
  const handleWhatsapp = withBusy("whatsapp", async () => {
    const blob = await generateBillPdf("report-print-area", "a4");
    await shareBillPdf(blob, filename(), `${t(active)} · ${from} to ${to}`);
  });

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {REPORT_TYPES.map(r => (
          <button key={r} onClick={() => setActive(r)} className="flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-semibold" style={active === r ? { background: "var(--primary)", color: "white" } : { background: "var(--muted)", color: "var(--muted-foreground)" }}>
            {t(r)}
          </button>
        ))}
      </div>

      <GlassCard className="p-4 mb-4 flex flex-wrap items-end gap-3">
        <Field label={t("fromDate")}><TextInput type="date" value={from} onChange={e => setFrom(e.target.value)} /></Field>
        <Field label={t("toDate")}><TextInput type="date" value={to} onChange={e => setTo(e.target.value)} /></Field>
        <div className="flex gap-2 ml-auto">
          <PrimaryButton variant="ghost" className="!py-2.5" disabled={!!busy} onClick={handlePrint}>{busy === "print" ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />} {t("print")}</PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5" onClick={handleExcel}><Download size={14} /> {t("excel")}</PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5" disabled={!!busy} onClick={handlePdf}>{busy === "pdf" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} {t("pdf")}</PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5" disabled={!!busy} onClick={handleWhatsapp}>{busy === "whatsapp" ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}</PrimaryButton>
        </div>
      </GlassCard>

      <div id="report-print-area">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard label={t("todaysSales")} value={fmt(34200)} icon={DollarSign} color="var(--primary)" />
          <StatCard label={t("todaysBills")} value="64" icon={Receipt} color="var(--accent)" />
          <StatCard label={t("profitReport")} value={fmt(8940)} icon={TrendingUp} color="var(--success)" />
          <StatCard label={t("gst")} value={fmt(1710)} icon={Percent} color="#7c3aed" />
        </div>

        <GlassCard className="p-5 mb-4">
          <SectionHeader title={t(active)} subtitle={`${from} — ${to}`} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={active === "monthlySales" ? MONTHLY_SALES : DAILY_SALES} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
              <XAxis dataKey={active === "monthlySales" ? "month" : "day"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <ResponsiveTable columns={[t("item"), t("qty")]}>
          {TOP_ITEMS.map(it => (
            <tr key={it.name} className="border-t" style={{ borderColor: "var(--border)" }}>
              <td className="px-4 py-2.5">{it.name}</td>
              <td className="px-4 py-2.5 font-bold">{it.units}</td>
            </tr>
          ))}
        </ResponsiveTable>
      </div>
    </div>
  );
}

export function DeletedBillsScreen({ t, deletedBills, setDeletedBills, setBills }: {
  t: (k: string) => string; deletedBills: DeletedBill[]; setDeletedBills: (d: DeletedBill[]) => void; setBills: (b: Bill[] | ((prev: Bill[]) => Bill[])) => void;
}) {
  const [toRestore, setToRestore] = useState<string | null>(null);

  const handleRestore = () => {
    const d = deletedBills.find(x => x.id === toRestore);
    if (d) {
      // Note: the deleted-bill record only keeps the bill's total, not its
      // original line items, so the restored bill comes back with the same
      // number and total but an empty item list.
      const restored: Bill = {
        id: genId(), billNo: d.billNo, type: "retail", customerId: null, customerName: d.customerName,
        date: d.date, items: [], subtotal: d.amount, discount: 0, gst: 0, total: d.amount,
        received: d.amount, balance: 0, paymentMethod: "cash", gstEnabled: false, status: "paid",
      };
      setBills(prev => [restored, ...prev]);
      setDeletedBills(deletedBills.filter(x => x.id !== toRestore));
      alert("Bill restored — note: line items from the original sale aren't retained, only the total.");
    }
    setToRestore(null);
  };

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      {deletedBills.length === 0 ? <EmptyState icon={Trash2} title="No deleted bills" /> : (
        <>
          <ResponsiveTable columns={[t("billNo"), t("date"), t("customerName"), t("amount"), t("deletedBy"), t("deletedDate"), t("reason"), t("actions")]}>
            {deletedBills.map(d => (
              <tr key={d.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-2.5 font-mono text-xs">{d.billNo}</td>
                <td className="px-4 py-2.5" style={{ color: "var(--muted-foreground)" }}>{d.date}</td>
                <td className="px-4 py-2.5">{d.customerName}</td>
                <td className="px-4 py-2.5 font-semibold">{fmt(d.amount)}</td>
                <td className="px-4 py-2.5">{d.deletedBy}</td>
                <td className="px-4 py-2.5" style={{ color: "var(--muted-foreground)" }}>{d.deletedDate}</td>
                <td className="px-4 py-2.5">{d.reason}</td>
                <td className="px-4 py-2.5"><button onClick={() => setToRestore(d.id)} className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--primary)" }}><RotateCcw size={12} /> {t("restore")}</button></td>
              </tr>
            ))}
          </ResponsiveTable>

          <div className="md:hidden flex flex-col gap-2">
            {deletedBills.map(d => (
              <GlassCard key={d.id} className="p-4">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-bold font-mono">{d.billNo}</p>
                  <p className="text-sm font-bold">{fmt(d.amount)}</p>
                </div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{d.customerName} · {d.date}</p>
                <p className="text-xs mt-1">{t("reason")}: {d.reason}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t("deletedBy")}: {d.deletedBy}</p>
                <button onClick={() => setToRestore(d.id)} className="mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: "var(--primary)" }}><RotateCcw size={12} /> {t("restore")}</button>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog open={!!toRestore} title={t("areYouSure")} message={t("restore") + "?"} onCancel={() => setToRestore(null)} onConfirm={handleRestore} t={t} />
    </div>
  );
}
