import React, { useState } from "react";
import { Search, Plus, Edit3, Trash2, Phone, MapPin, BookOpen, Coins, AlertCircle, Wallet, TrendingUp, ChevronRight, Printer, FileText, Download, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import { GlassCard, PrimaryButton, Badge, TextInput, SelectInput, Field, SectionHeader, ResponsiveTable, StatCard, EmptyState, ConfirmDialog } from "../components/shared";
import { fmt, genId } from "../data";
import { generateBillPdf, downloadBillPdf, printBillPdf, shareBillPdf } from "../lib/pdf";
import type { Screen, Customer, LedgerEntry, Lang } from "../types";

export function CustomersScreen({ navigate, t, customers, setCustomers, setLedgerCustomer, onAdd, onEdit }: {
  navigate: (s: Screen) => void; t: (k: string) => string;
  customers: Customer[]; setCustomers: (c: Customer[]) => void;
  setLedgerCustomer: (id: string) => void; onAdd: () => void; onEdit: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search));

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-1" style={{ background: "var(--input-background)", border: "1.5px solid var(--border)" }}>
          <Search size={16} style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search") + "..."} className="flex-1 text-sm bg-transparent outline-none" />
        </div>
        <PrimaryButton className="!py-2.5" onClick={onAdd}><Plus size={15} /> {t("add")}</PrimaryButton>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Phone} title="No customers found" /> : (
        <>
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
                    <button onClick={() => onEdit(c.id)} className="text-amber-500"><Edit3 size={14} /></button>
                    <button onClick={() => setToDelete(c.id)} className="text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </ResponsiveTable>

          <div className="md:hidden flex flex-col gap-2">
            {filtered.map(c => (
              <GlassCard key={c.id} className="p-4 flex items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => { setLedgerCustomer(c.id); navigate("ledger"); }}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--grad-primary-from), var(--grad-primary-to))" }}>
                    {c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{c.name}</p>
                    <p className="text-xs flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}><Phone size={10} /> {c.mobile}</p>
                  </div>
                  <Badge tone={c.balance > 0 ? "danger" : "success"}>{fmt(c.balance)}</Badge>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => onEdit(c.id)} className="text-amber-500"><Edit3 size={15} /></button>
                  <button onClick={() => setToDelete(c.id)} className="text-red-500"><Trash2 size={15} /></button>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog open={!!toDelete} title={t("areYouSure")} message={t("delete") + "?"} onCancel={() => setToDelete(null)} onConfirm={() => { setCustomers(customers.filter(c => c.id !== toDelete)); setToDelete(null); }} danger t={t} />
    </div>
  );
}

function emptyCustomer(): Customer {
  return { id: genId(), name: "", mobile: "", address: "", gstNumber: "", openingBalance: 0, creditLimit: 0, balance: 0 };
}

export function CustomerFormScreen({ navigate, t, customers, setCustomers, editingCustomerId }: {
  navigate: (s: Screen) => void; t: (k: string) => string;
  customers: Customer[]; setCustomers: (c: Customer[]) => void; editingCustomerId: string | null;
}) {
  const existing = editingCustomerId ? customers.find(c => c.id === editingCustomerId) : null;
  const [form, setForm] = useState<Customer>(existing ? { ...existing } : emptyCustomer());
  const isEditing = !!existing;

  const update = <K extends keyof Customer>(key: K, value: Customer[K]) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.mobile.trim()) {
      alert(t("customerName") + " / " + t("mobile") + " " + t("areYouSure"));
      return;
    }
    const cleaned: Customer = {
      ...form,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      balance: isEditing ? form.balance : form.openingBalance,
    };
    if (isEditing) {
      setCustomers(customers.map(c => c.id === cleaned.id ? cleaned : c));
    } else {
      setCustomers([...customers, cleaned]);
    }
    navigate("customers");
  };

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <button onClick={() => navigate("customers")} className="flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft size={14} /> {t("customers")}
      </button>
      <GlassCard className="p-5 md:p-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("customerName")}><TextInput value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Arjun Stores" /></Field>
          <Field label={t("mobile")}><TextInput value={form.mobile} onChange={e => update("mobile", e.target.value)} placeholder="+91 98765 43210" /></Field>
          <Field label={t("address")}><TextInput value={form.address} onChange={e => update("address", e.target.value)} placeholder="Area, City" /></Field>
          <Field label={t("gstNumber")}><TextInput value={form.gstNumber || ""} onChange={e => update("gstNumber", e.target.value)} placeholder="Optional" /></Field>
          <Field label={t("openingBalance")}>
            <TextInput type="number" value={form.openingBalance || ""} disabled={isEditing} onChange={e => update("openingBalance", Number(e.target.value) || 0)} placeholder="0" />
          </Field>
          <Field label={t("creditLimit")}><TextInput type="number" value={form.creditLimit || ""} onChange={e => update("creditLimit", Number(e.target.value) || 0)} placeholder="0" /></Field>
        </div>
        <div className="flex gap-3 mt-4">
          <PrimaryButton variant="ghost" onClick={() => navigate("customers")} className="flex-1">{t("cancel")}</PrimaryButton>
          <PrimaryButton onClick={handleSave} className="flex-1">{t("save")}</PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}

export function CustomerLedgerScreen({ customerId, t, customers, ledgerEntries }: {
  customerId: string | null; t: (k: string) => string; customers: Customer[]; ledgerEntries: LedgerEntry[];
}) {
  const customer = customers.find(c => c.id === customerId) || customers[0];
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState<string | null>(null);
  const entries = customer ? ledgerEntries.filter(l => l.customerId === customer.id) : [];

  const withBusy = (key: string, fn: () => Promise<void>) => async () => {
    if (busy) return;
    setBusy(key);
    try { await fn(); }
    catch (err) { console.error(err); alert("Something went wrong — please try again."); }
    finally { setBusy(null); }
  };

  const filename = () => `Ledger-${(customer?.name || "customer").replace(/\s+/g, "-")}.pdf`;
  const handlePrint = withBusy("print", async () => {
    const blob = await generateBillPdf("ledger-print-area", "a4");
    await printBillPdf(blob, filename());
  });
  const handleDownload = withBusy("pdf", async () => {
    const blob = await generateBillPdf("ledger-print-area", "a4");
    await downloadBillPdf(blob, filename());
  });
  const handleWhatsapp = withBusy("whatsapp", async () => {
    const blob = await generateBillPdf("ledger-print-area", "a4");
    await shareBillPdf(blob, filename(), `${customer?.name ?? ""} — ${t("customerLedger")}`);
  });

  if (!customer) {
    return <EmptyState icon={BookOpen} title="No customer selected" />;
  }

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <Field label={t("fromDate")}><TextInput type="date" value={from} onChange={e => setFrom(e.target.value)} /></Field>
        <Field label={t("toDate")}><TextInput type="date" value={to} onChange={e => setTo(e.target.value)} /></Field>
        <div className="flex gap-2">
          <PrimaryButton variant="ghost" className="!py-2.5" disabled={!!busy} onClick={handlePrint}>{busy === "print" ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}</PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5" disabled={!!busy} onClick={handleDownload}>{busy === "pdf" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}</PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5" disabled={!!busy} onClick={handleWhatsapp}>{busy === "whatsapp" ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}</PrimaryButton>
        </div>
      </div>

      <div id="ledger-print-area">
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

        {entries.length === 0 ? <EmptyState icon={BookOpen} title="No ledger entries yet" /> : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

export function OutstandingScreen({ navigate, t, customers, setReceiveCustomer }: { navigate: (s: Screen) => void; t: (k: string) => string; customers: Customer[]; setReceiveCustomer: (id: string) => void }) {
  const withBalance = customers.filter(c => c.balance > 0);
  const total = withBalance.reduce((a, c) => a + c.balance, 0);
  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label={t("totalOutstanding")} value={fmt(total)} icon={Wallet} color="var(--destructive)" />
        <StatCard label={t("customersWithBalance")} value={String(withBalance.length)} icon={AlertCircle} color="var(--warning)" />
        <StatCard label={t("todaysCollection")} value={fmt(6150)} icon={Coins} color="var(--success)" />
        <StatCard label={t("overdueAmount")} value={fmt(32800)} icon={TrendingUp} color="#7c3aed" />
      </div>
      {withBalance.length === 0 ? <EmptyState icon={Wallet} title="No outstanding balances" /> : (
        <div className="flex flex-col gap-3">
          {withBalance.map(c => (
            <GlassCard key={c.id} className="p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--grad-primary-from), var(--grad-primary-to))" }}>
                {c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{c.name}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{c.mobile} · {t("lastPayment")}: {c.lastPaymentDate || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold" style={{ color: "var(--destructive)" }}>{fmt(c.balance)}</p>
                <button onClick={() => { setReceiveCustomer(c.id); navigate("receivepayment"); }} className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{t("receivePayment")}</button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReceivePaymentScreen({ customerId, navigate, t, customers, setCustomers, ledgerEntries, setLedgerEntries }: {
  customerId: string | null; navigate: (s: Screen) => void; t: (k: string) => string;
  customers: Customer[]; setCustomers: (c: Customer[]) => void;
  ledgerEntries: LedgerEntry[]; setLedgerEntries: (l: LedgerEntry[]) => void;
}) {
  const [selected, setSelected] = useState(customerId || customers[0]?.id || "");
  const [amount, setAmount] = useState<number | "">("");
  const [method, setMethod] = useState("cash");
  const [ref, setRef] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const customer = customers.find(c => c.id === selected) || customers[0];
  const amt = amount === "" ? 0 : Number(amount);
  const remaining = customer ? Math.max(0, customer.balance - amt) : 0;

  const handleSave = () => {
    if (!customer || !amt) return;
    const newBalance = Math.max(0, customer.balance - amt);
    const today = new Date().toISOString().slice(0, 10);
    setCustomers(customers.map(c => c.id === customer.id ? { ...c, balance: newBalance, lastPaymentDate: today } : c));
    const entry: LedgerEntry = {
      id: genId(), customerId: customer.id, date: today,
      billNo: ref.trim() || undefined,
      description: `${t("received")} (${method.toUpperCase()})${notes.trim() ? " — " + notes.trim() : ""}`,
      debit: 0, credit: amt, balance: newBalance,
    };
    setLedgerEntries([entry, ...ledgerEntries]);
    setSaved(true);
  };

  const handlePrintReceipt = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await generateBillPdf("payment-receipt-area", "thermal");
      await printBillPdf(blob, `Receipt-${customer?.name ?? "payment"}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong — please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!customer) {
    return <EmptyState icon={Coins} title="No customer available" />;
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
          <Coins size={26} style={{ color: "var(--success)" }} />
        </div>
        <p className="font-bold">{t("save")} ✓</p>
        <div id="payment-receipt-area" className="w-full max-w-sm">
          <GlassCard className="p-5 text-sm flex flex-col gap-2">
            <p className="text-xs text-center mb-1" style={{ color: "var(--muted-foreground)" }}>{customer.name} · {new Date().toLocaleString("en-IN")}</p>
            <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{t("previousBalance")}</span><span>{fmt(customer.balance + amt)}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{t("received")}</span><span className="text-emerald-500">-{fmt(amt)}</span></div>
            <div className="flex justify-between font-bold"><span>{t("remainingBalance")}</span><span>{fmt(remaining)}</span></div>
          </GlassCard>
        </div>
        <div className="flex gap-2 w-full max-w-sm">
          <PrimaryButton variant="outline" className="flex-1" disabled={busy} onClick={handlePrintReceipt}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />} {t("printReceipt")}
          </PrimaryButton>
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
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
        <PrimaryButton onClick={handleSave} disabled={!amt}>{t("save")}</PrimaryButton>
      </GlassCard>
    </div>
  );
}
