import React from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import {
  DollarSign, Receipt, Banknote, Smartphone, Wallet, Package, Plus, Store, Users, Coins,
  TrendingUp, AlertTriangle, ChevronRight,
} from "lucide-react";
import { GlassCard, StatCard, SectionHeader, Badge, ResponsiveTable } from "../components/shared";
import { DAILY_SALES, MONTHLY_SALES, PAYMENT_SPLIT, TOP_ITEMS, PRODUCTS, fmt, fmtK } from "../data";
import type { Screen, Lang, Bill } from "../types";

export function DashboardScreen({ dark, navigate, t, lang, bills }: { dark: boolean; navigate: (s: Screen) => void; t: (k: string) => string; lang: Lang; bills: Bill[] }) {
  const lowStock = PRODUCTS.filter(p => p.stock <= p.minStock);
  const todaySales = DAILY_SALES[DAILY_SALES.length - 1].revenue;
  const todayBills = DAILY_SALES[DAILY_SALES.length - 1].bills;

  const quickActions = [
    { label: t("newBill"), icon: Plus, color: "var(--primary)", screen: "billing" as Screen },
    { label: t("wholesaleBilling"), icon: Store, color: "var(--accent)", screen: "wholesale" as Screen },
    { label: t("addItem"), icon: Package, color: "#0f766e", screen: "itemform" as Screen },
    { label: t("customers"), icon: Users, color: "#7c3aed", screen: "customers" as Screen },
    { label: t("receivePayment"), icon: Coins, color: "var(--success)", screen: "receivepayment" as Screen },
    { label: t("reports"), icon: TrendingUp, color: "#0369a1", screen: "reports" as Screen },
  ];

  return (
    <div className="flex flex-col pb-24 md:pb-8">
      <div className="px-4 md:px-6 pt-5 md:pt-6 pb-3 md:hidden">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{t("goodMorning")}</p>
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Raghu 👋</h1>
      </div>

      {/* KPI cards */}
      <div className="px-4 md:px-6 mt-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label={t("todaysSales")} value={fmtK(todaySales)} change={12.4} icon={DollarSign} color="var(--primary)" />
        <StatCard label={t("todaysBills")} value={String(todayBills)} change={8.7} icon={Receipt} color="var(--accent)" />
        <StatCard label={t("cashReceived")} value={fmtK(todaySales * 0.38)} icon={Banknote} color="#0f766e" />
        <StatCard label={t("upiReceived")} value={fmtK(todaySales * 0.34)} icon={Smartphone} color="#0369a1" />
        <StatCard label={t("outstanding")} value={fmtK(116250)} change={-4.1} icon={Wallet} color="var(--destructive)" />
        <StatCard label={t("totalItems")} value={String(PRODUCTS.length)} icon={Package} color="#7c3aed" />
      </div>

      {/* Charts row */}
      <div className="px-4 md:px-6 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionHeader title={t("dailySales")} subtitle="Last 7 days" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DAILY_SALES} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title={t("paymentMethod")} subtitle="This week" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PAYMENT_SPLIT} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={3}>
                {PAYMENT_SPLIT.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {PAYMENT_SPLIT.map(p => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span style={{ color: "var(--muted-foreground)" }}>{p.name} {p.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="px-4 md:px-6 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 hidden lg:block">
          <SectionHeader title={t("monthlySales")} subtitle="8 months" />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={MONTHLY_SALES} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title={t("topSellingItems")} />
          <div className="flex flex-col gap-2.5">
            {TOP_ITEMS.map((it, i) => (
              <div key={it.name} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
                <span className="flex-1 text-xs font-medium truncate">{it.name}</span>
                <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>{it.units}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title={t("lowStock")} action={<button onClick={() => navigate("items")} className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{t("viewAll")}</button>} />
          <div className="flex flex-col gap-2">
            {lowStock.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <AlertTriangle size={14} color="var(--destructive)" className="flex-shrink-0" />
                <span className="flex-1 text-xs font-medium truncate">{lang === "ta" ? p.nameTa : p.nameEn}</span>
                <Badge tone="danger">{p.stock} {p.unit}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick actions */}
      <div className="px-4 md:px-6 mt-4">
        <SectionHeader title={t("quickActions")} />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map(({ label, icon: Icon, color, screen }) => (
            <button key={label} onClick={() => navigate(screen)} className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: color + "1f" }}>
                <Icon size={17} style={{ color }} />
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent bills */}
      <div className="px-4 md:px-6 mt-4">
        <SectionHeader title={t("recentBills")} action={<button onClick={() => navigate("reports")} className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{t("viewAll")}</button>} />

        <ResponsiveTable columns={[t("billNo"), t("customerName"), t("amount"), t("paymentMethod"), t("date"), t("status")]}>
          {bills.slice(0, 6).map(b => (
            <tr key={b.id} className="border-t" style={{ borderColor: "var(--border)" }}>
              <td className="px-4 py-3 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{b.billNo}</td>
              <td className="px-4 py-3">{b.customerName}</td>
              <td className="px-4 py-3 font-bold">{fmt(b.total)}</td>
              <td className="px-4 py-3 capitalize">{b.paymentMethod}</td>
              <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{b.date}</td>
              <td className="px-4 py-3"><Badge tone={b.status === "paid" ? "success" : b.status === "partial" ? "warning" : "danger"}>{b.status}</Badge></td>
            </tr>
          ))}
        </ResponsiveTable>

        <div className="md:hidden flex flex-col gap-2">
          {bills.slice(0, 6).map(b => (
            <GlassCard key={b.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{b.billNo}</p>
                  <Badge tone={b.status === "paid" ? "success" : b.status === "partial" ? "warning" : "danger"}>{b.status}</Badge>
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>{b.customerName} · {b.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-extrabold" style={{ color: "var(--primary)" }}>{fmt(b.total)}</p>
                <p className="text-[10px] capitalize" style={{ color: "var(--muted-foreground)" }}>{b.paymentMethod}</p>
              </div>
              <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
