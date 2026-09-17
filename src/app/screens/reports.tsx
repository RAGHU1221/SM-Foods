import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Printer, FileText, Download, MessageCircle, RotateCcw, Trash2 } from "lucide-react";
import { GlassCard, PrimaryButton, Field, TextInput, SelectInput, SectionHeader, StatCard, ResponsiveTable, ConfirmDialog } from "../components/shared";
import { DAILY_SALES, MONTHLY_SALES, TOP_ITEMS, DELETED_BILLS, fmt } from "../data";
import { DollarSign, Receipt, TrendingUp, Percent } from "lucide-react";

const REPORT_TYPES = [
  "dailySales", "monthlySales", "itemSales", "customerSales", "gstReport",
  "paymentReport", "outstandingReport", "profitReport", "wholesaleReport",
];

export function ReportsScreen({ t }: { t: (k: string) => string }) {
  const [active, setActive] = useState("dailySales");
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-09-16");

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
          <PrimaryButton variant="ghost" className="!py-2.5"><Printer size={14} /> {t("print")}</PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5"><Download size={14} /> {t("excel")}</PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5"><FileText size={14} /> {t("pdf")}</PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5"><MessageCircle size={14} /></PrimaryButton>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label={t("todaysSales")} value={fmt(34200)} icon={DollarSign} color="var(--primary)" />
        <StatCard label={t("todaysBills")} value="64" icon={Receipt} color="var(--accent)" />
        <StatCard label={t("profitReport")} value={fmt(8940)} icon={TrendingUp} color="var(--success)" />
        <StatCard label={t("gst")} value={fmt(1710)} icon={Percent} color="#7c3aed" />
      </div>

      <GlassCard className="p-5 mb-4">
        <SectionHeader title={t(active)} />
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
  );
}

export function DeletedBillsScreen({ t }: { t: (k: string) => string }) {
  const [toRestore, setToRestore] = useState<string | null>(null);
  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <ResponsiveTable columns={[t("billNo"), t("date"), t("customerName"), t("amount"), t("deletedBy"), t("deletedDate"), t("reason"), t("actions")]}>
        {DELETED_BILLS.map(d => (
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
        {DELETED_BILLS.map(d => (
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

      <ConfirmDialog open={!!toRestore} title={t("areYouSure")} message={t("restore") + "?"} onCancel={() => setToRestore(null)} onConfirm={() => setToRestore(null)} t={t} />
    </div>
  );
}
