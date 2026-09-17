import React, { useState } from "react";
import { Search, Plus, Edit3, Trash2, Phone, MapPin, BookOpen, Coins, AlertCircle, Wallet, TrendingUp, ChevronRight, Printer, FileText, Download, MessageCircle } from "lucide-react";
import { GlassCard, PrimaryButton, Badge, TextInput, SelectInput, Field, SectionHeader, ResponsiveTable, StatCard, EmptyState, ConfirmDialog } from "../components/shared";
import { CUSTOMERS, LEDGER, fmt, genId } from "../data";
import type { Screen, Customer } from "../types";

export function CustomersScreen({ navigate, t, setLedgerCustomer }: { navigate: (s: Screen) => void; t: (k: string) => string; setLedgerCustomer: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const filtered = CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search));

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-1" style={{ background: "var(--input-background)", border: "1.5px solid var(--border)" }}>
          <Search size={16} style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search") + "..."} className="flex-1 text-sm bg-transparent outline-none" />
        </div>
        <PrimaryButton className="!py-2.5"><Plus size={15} /> {t("add")}</PrimaryButton>
      </div>

      <ResponsiveTable columns={[t("customerName"), t("mobile"), t("address"), t("gstNumber"), t("outstanding"), t("actions")]}>
        {filtered.map(c => (
          <tr key={c.id} className="border-t" style={{ borderColor: "var(--border)" }}>
            <td className="px-4 py-2.5 font-semibold">{c.name}</td>
            <td className="px-4 py-2.5">{c.mobile}</td>
            <td className="px-4 py-2.5" style={{ color: "var(--muted-foreground)" }}>{c.address}</td>
            <td className="px-4 py-2.5 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.gstNumber || "—"}</td>
            <td className="px-4 py-2.5"><Badge tone={c.balance > 0 ? "danger" : "success"}>{fmt(c.balance)}</Badge></td>
            <td className="px-4 py-2.5">
              <div className="flex items-center gap-2">
                <button onClick={() => { setLedgerCustomer(c.id); navigate("ledger"); }} className="text-blue-500"><BookOpen size={14} /></button>
                <button className="text-amber-500"><Edit3 size={14} /></button>
                <button onClick={() => setToDelete(c.id)} className="text-red-500"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </ResponsiveTable>

      <div className="md:hidden flex flex-col gap-2">
        {filtered.map(c => (
          <GlassCard key={c.id} className="p-4 flex items-center gap-3" onClick={() => { setLedgerCustomer(c.id); navigate("ledger"); }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--grad-primary-from), var(--grad-primary-to))" }}>
              {c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{c.name}</p>
              <p className="text-xs flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}><Phone size={10} /> {c.mobile}</p>
            </div>
            <Badge tone={c.balance > 0 ? "danger" : "success"}>{fmt(c.balance)}</Badge>
            <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
          </GlassCard>
        ))}
      </div>

      <ConfirmDialog open={!!toDelete} title={t("areYouSure")} message={t("delete") + "?"} onCancel={() => setToDelete(null)} onConfirm={() => setToDelete(null)} danger t={t} />
    </div>
  );
}

export function CustomerLedgerScreen({ customerId, t }: { customerId: string | null; t: (k: string) => string }) {
  const customer = CUSTOMERS.find(c => c.id === customerId) || CUSTOMERS[0];
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-09-16");
  const entries = LEDGER.filter(l => l.customerId === customer.id);

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <GlassCard className="p-4 mb-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--grad-primary-from), var(--grad-primary-to))" }}>
          {customer.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">{customer.name}</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{customer.mobile} · {customer.address}</p>
        </div>
        <Badge tone={customer.balance > 0 ? "danger" : "success"}>{fmt(customer.balance)}</Badge>
      </GlassCard>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <Field label={t("fromDate")}><TextInput type="date" value={from} onChange={e => setFrom(e.target.value)} /></Field>
        <Field label={t("toDate")}><TextInput type="date" value={to} onChange={e => setTo(e.target.value)} /></Field>
        <div className="flex gap-2">
          <PrimaryButton variant="ghost" className="!py-2.5"><Printer size={14} /></PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5"><FileText size={14} /></PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5"><MessageCircle size={14} /></PrimaryButton>
        </div>
      </div>

      <ResponsiveTable columns={[t("date"), t("billNo"), t("description"), t("debit"), t("creditCol"), t("balance")]}>
        {entries.map(l => (
          <tr key={l.id} className="border-t" style={{ borderColor: "var(--border)" }}>
            <td className="px-4 py-2.5" style={{ color: "var(--muted-foreground)" }}>{l.date}</td>
            <td className="px-4 py-2.5 font-mono text-xs">{l.billNo || "—"}</td>
            <td className="px-4 py-2.5">{l.description}</td>
            <td className="px-4 py-2.5">{l.debit ? fmt(l.debit) : "—"}</td>
            <td className="px-4 py-2.5 text-emerald-500">{l.credit ? fmt(l.credit) : "—"}</td>
            <td className="px-4 py-2.5 font-bold">{fmt(l.balance)}</td>
          </tr>
        ))}
      </ResponsiveTable>

      <div className="md:hidden flex flex-col gap-2">
        {entries.map(l => (
          <GlassCard key={l.id} className="p-3.5">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: "var(--muted-foreground)" }}>{l.date} {l.billNo && `· ${l.billNo}`}</span>
              <span className="font-bold">{fmt(l.balance)}</span>
            </div>
            <p className="text-sm font-medium">{l.description}</p>
            <p className="text-xs mt-1" style={{ color: l.debit ? "var(--destructive)" : "var(--success)" }}>{l.debit ? `+${fmt(l.debit)} debit` : `-${fmt(l.credit)} credit`}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export function OutstandingScreen({ navigate, t, setReceiveCustomer }: { navigate: (s: Screen) => void; t: (k: string) => string; setReceiveCustomer: (id: string) => void }) {
  const withBalance = CUSTOMERS.filter(c => c.balance > 0);
  const total = withBalance.reduce((a, c) => a + c.balance, 0);
  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label={t("totalOutstanding")} value={fmt(total)} icon={Wallet} color="var(--destructive)" />
        <StatCard label={t("customersWithBalance")} value={String(withBalance.length)} icon={AlertCircle} color="var(--warning)" />
        <StatCard label={t("todaysCollection")} value={fmt(6150)} icon={Coins} color="var(--success)" />
        <StatCard label={t("overdueAmount")} value={fmt(32800)} icon={TrendingUp} color="#7c3aed" />
      </div>
      <div className="flex flex-col gap-3">
        {withBalance.map(c => (
          <GlassCard key={c.id} className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--grad-primary-from), var(--grad-primary-to))" }}>
              {c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{c.name}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{c.mobile} · {t("lastPayment")}: {c.lastPaymentDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold" style={{ color: "var(--destructive)" }}>{fmt(c.balance)}</p>
              <button onClick={() => { setReceiveCustomer(c.id); navigate("receivepayment"); }} className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{t("receivePayment")}</button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export function ReceivePaymentScreen({ customerId, navigate, t }: { customerId: string | null; navigate: (s: Screen) => void; t: (k: string) => string }) {
  const [selected, setSelected] = useState(customerId || CUSTOMERS[0].id);
  const [amount, setAmount] = useState<number | "">("");
  const [method, setMethod] = useState("cash");
  const [ref, setRef] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const customer = CUSTOMERS.find(c => c.id === selected)!;
  const amt = amount === "" ? 0 : Number(amount);
  const remaining = Math.max(0, customer.balance - amt);

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
          <Coins size={26} style={{ color: "var(--success)" }} />
        </div>
        <p className="font-bold">{t("save")} ✓</p>
        <GlassCard className="p-5 w-full max-w-sm text-sm flex flex-col gap-2">
          <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{t("previousBalance")}</span><span>{fmt(customer.balance)}</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{t("received")}</span><span className="text-emerald-500">-{fmt(amt)}</span></div>
          <div className="flex justify-between font-bold"><span>{t("remainingBalance")}</span><span>{fmt(remaining)}</span></div>
        </GlassCard>
        <div className="flex gap-2 w-full max-w-sm">
          <PrimaryButton variant="outline" className="flex-1"><Printer size={15} /> {t("printReceipt")}</PrimaryButton>
          <PrimaryButton onClick={() => navigate("outstanding")} className="flex-1">{t("close")}</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5 items-center">
      <GlassCard className="p-5 md:p-6 w-full max-w-md flex flex-col gap-4">
        <Field label={t("selectCustomer")}>
          <SelectInput value={selected} onChange={e => setSelected(e.target.value)}>
            {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectInput>
        </Field>
        <div className="flex justify-between text-sm px-1">
          <span style={{ color: "var(--muted-foreground)" }}>{t("outstandingAmount")}</span>
          <span className="font-bold" style={{ color: "var(--destructive)" }}>{fmt(customer.balance)}</span>
        </div>
        <Field label={t("receivedAmount")}><TextInput type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || "")} placeholder="0" /></Field>
        <Field label={t("paymentMethod")}>
          <SelectInput value={method} onChange={e => setMethod(e.target.value)}>
            <option value="cash">{t("cash")}</option><option value="upi">{t("upi")}</option><option value="card">{t("card")}</option>
          </SelectInput>
        </Field>
        <Field label={t("referenceNumber")}><TextInput value={ref} onChange={e => setRef(e.target.value)} placeholder="UTR / Txn ID" /></Field>
        <Field label={t("notes")}><TextInput value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" /></Field>
        <div className="flex justify-between text-sm px-1 font-bold">
          <span>{t("remainingBalance")}</span>
          <span>{fmt(remaining)}</span>
        </div>
        <PrimaryButton onClick={() => setSaved(true)} disabled={!amt}>{t("save")}</PrimaryButton>
      </GlassCard>
    </div>
  );
}
