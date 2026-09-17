import React, { useState, useMemo } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, X, ChevronRight, Barcode, Printer,
  MessageCircle, PauseCircle, Eraser, Check, Store, PlayCircle, Eye, UserPlus,
} from "lucide-react";
import { GlassCard, PrimaryButton, Badge, TextInput, SelectInput, EmptyState, ConfirmDialog, ProductThumb } from "../components/shared";
import { PRODUCTS, ITEM_TYPES, CUSTOMERS, fmt, genId } from "../data";
import type { Screen, Lang, CartItem, Product, PaymentMethod, Bill, HeldBill } from "../types";

// ── Shared bill math ──────────────────────────────────────────────────────
export function computeTotals(cart: CartItem[], discount: number, gstEnabled: boolean) {
  const subtotal = cart.reduce((a, c) => a + c.rate * c.qty, 0);
  const gstAmt = gstEnabled ? cart.reduce((a, c) => a + (c.rate * c.qty * c.product.gst) / 100, 0) : 0;
  const total = Math.max(0, subtotal - discount + gstAmt);
  return { subtotal, gstAmt, total };
}

interface BillingCtxProps {
  cart: CartItem[]; setCart: (c: CartItem[]) => void;
  navigate: (s: Screen) => void; t: (k: string) => string; lang: Lang;
  onSaveBill: (bill: Bill, print?: "thermal" | "a4" | "whatsapp") => void;
  heldBills: HeldBill[]; setHeldBills: (h: HeldBill[]) => void;
}

function useCartHelpers(cart: CartItem[], setCart: (c: CartItem[]) => void) {
  const addToCart = (p: Product, rate?: number) => {
    const existing = cart.find(c => c.product.id === p.id);
    if (existing) setCart(cart.map(c => c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { product: p, qty: 1, rate: rate ?? p.price }]);
  };
  const removeFromCart = (id: string) => {
    const existing = cart.find(c => c.product.id === id);
    if (!existing) return;
    if (existing.qty <= 1) setCart(cart.filter(c => c.product.id !== id));
    else setCart(cart.map(c => c.product.id === id ? { ...c, qty: c.qty - 1 } : c));
  };
  const deleteFromCart = (id: string) => setCart(cart.filter(c => c.product.id !== id));
  const setRate = (id: string, rate: number) => setCart(cart.map(c => c.product.id === id ? { ...c, rate } : c));
  const setQty = (id: string, qty: number) => setCart(cart.map(c => c.product.id === id ? { ...c, qty: Math.max(1, qty) } : c));
  return { addToCart, removeFromCart, deleteFromCart, setRate, setQty };
}

// ── POS Billing Screen ─────────────────────────────────────────────────────
export function BillingScreen({ cart, setCart, navigate, t, lang, onSaveBill, heldBills, setHeldBills }: BillingCtxProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [discount, setDiscount] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(true);
  const [customerId, setCustomerId] = useState<string>("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [received, setReceived] = useState<number | "">("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const { addToCart, removeFromCart, deleteFromCart, setQty } = useCartHelpers(cart, setCart);

  const filtered = PRODUCTS.filter(p =>
    (typeFilter === "All" || p.typeId === typeFilter) &&
    ((lang === "ta" ? p.nameTa : p.nameEn).toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search))
  );

  const { subtotal, gstAmt, total } = computeTotals(cart, discount, gstEnabled);
  const receivedNum = received === "" ? total : Number(received);
  const balance = total - receivedNum;
  const customer = CUSTOMERS.find(c => c.id === customerId);

  const finalize = (mode: "save" | "thermal" | "a4whatsapp" | "whatsapp") => {
    if (cart.length === 0) return;
    const bill: Bill = {
      id: genId(), billNo: `SMF-${1100 + Math.floor(Math.random() * 900)}`, type: "retail",
      customerId: customerId || null, customerName: customer?.name || t("walkInCustomer"),
      date: new Date().toLocaleString("en-IN"), items: cart, subtotal, discount, gst: gstAmt, total,
      received: receivedNum, balance: Math.max(0, balance), paymentMethod: payMethod, gstEnabled,
      status: balance <= 0 ? "paid" : receivedNum > 0 ? "partial" : "credit",
    };
    onSaveBill(bill, mode === "thermal" ? "thermal" : mode === "whatsapp" ? "whatsapp" : undefined);
    setCart([]); setDiscount(0); setReceived(""); setShowPayModal(false);
    navigate("receipt");
  };

  const holdCurrentBill = () => {
    if (cart.length === 0) return;
    const held: HeldBill = { id: genId(), billNo: `HOLD-${String(heldBills.length + 15).padStart(3, "0")}`, customerName: customer?.name || t("walkInCustomer"), items: cart, total, createdAt: new Date().toLocaleString("en-IN") };
    setHeldBills([held, ...heldBills]);
    setCart([]);
  };

  const cartItemCount = cart.reduce((a, c) => a + c.qty, 0);

  const CartPanel = (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between flex-shrink-0">
        <h3 className="font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t("cart")} ({cartItemCount})</h3>
        <button className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--muted)" }} onClick={() => setMobileCartOpen(false)}><X size={14} /></button>
      </div>
      {cart.length === 0 ? (
        <EmptyState icon={ShoppingCart} title={t("cartEmpty")} />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto px-5 flex flex-col gap-2 pb-2">
          {cart.map(c => (
            <div key={c.product.id} className="flex items-center gap-2.5 py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <ProductThumb id={c.product.id} className="w-11 h-11 rounded-xl" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{lang === "ta" ? c.product.nameTa : c.product.nameEn}</p>
                <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{fmt(c.rate)} × {c.qty}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => removeFromCart(c.product.id)} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}><Minus size={10} /></button>
                <span className="text-xs font-bold w-5 text-center">{c.qty}</span>
                <button onClick={() => addToCart(c.product)} className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ background: "var(--primary)" }}><Plus size={10} /></button>
              </div>
              <button onClick={() => deleteFromCart(c.product.id)} className="ml-1" style={{ color: "var(--destructive)" }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-4 flex flex-col gap-3 border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <SelectInput value={customerId} onChange={e => setCustomerId(e.target.value)}>
          <option value="">{t("walkInCustomer")}</option>
          {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </SelectInput>

        <div className="flex items-center justify-between text-xs font-semibold">
          <span>{gstEnabled ? t("gstBill") : t("nonGstBill")}</span>
          <button onClick={() => setGstEnabled(!gstEnabled)} className="w-10 h-5 rounded-full relative transition-all" style={{ background: gstEnabled ? "var(--primary)" : "var(--muted)" }}>
            <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: gstEnabled ? 22 : 2 }} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs flex-1" style={{ color: "var(--muted-foreground)" }}>{t("discount")}</span>
          <TextInput type="number" value={discount || ""} onChange={e => setDiscount(Number(e.target.value) || 0)} className="!w-24 !py-1.5 text-right" placeholder="0" />
        </div>

        <div className="flex flex-col gap-1 text-sm pt-1">
          <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{t("subtotal")}</span><span>{fmt(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{t("discount")}</span><span className="text-red-500">-{fmt(discount)}</span></div>}
          {gstEnabled && <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{t("gst")}</span><span>{fmt(gstAmt)}</span></div>}
          <div className="flex justify-between text-base font-extrabold pt-1" style={{ color: "var(--primary)" }}><span>{t("grandTotal")}</span><span>{fmt(total)}</span></div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <PrimaryButton variant="ghost" onClick={holdCurrentBill} disabled={cart.length === 0}><PauseCircle size={15} /> {t("holdBill")}</PrimaryButton>
          <PrimaryButton variant="ghost" onClick={() => setClearConfirm(true)} disabled={cart.length === 0}><Eraser size={15} /> {t("clear")}</PrimaryButton>
        </div>
        <PrimaryButton onClick={() => setShowPayModal(true)} disabled={cart.length === 0}><Check size={16} /> {t("saveBill")} · {fmt(total)}</PrimaryButton>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Products */}
      <div className="flex-1 flex flex-col pb-24 md:pb-0 min-w-0">
        <div className="px-4 md:px-6 pt-3 md:pt-5 mb-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "var(--input-background)", border: "1.5px solid var(--border)" }}>
            <Search size={16} style={{ color: "var(--muted-foreground)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("searchItem")} className="flex-1 text-sm bg-transparent outline-none" />
            <Barcode size={16} style={{ color: "var(--muted-foreground)" }} />
          </div>
        </div>

        <div className="flex gap-2 px-4 md:px-6 overflow-x-auto pb-2 mb-2">
          {["All", ...ITEM_TYPES.map(i => i.id)].map(id => {
            const label = id === "All" ? t("all") : (lang === "ta" ? ITEM_TYPES.find(i => i.id === id)?.nameTa : ITEM_TYPES.find(i => i.id === id)?.nameEn);
            return (
              <button key={id} onClick={() => setTypeFilter(id)} className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all" style={typeFilter === id ? { background: "var(--primary)", color: "white" } : { background: "var(--muted)", color: "var(--muted-foreground)" }}>
                {label}
              </button>
            );
          })}
        </div>

        <div className="px-4 md:px-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto">
          {filtered.map(p => {
            const inCart = cart.find(c => c.product.id === p.id);
            return (
              <GlassCard key={p.id} className="p-3 flex flex-col gap-2">
                <div className="relative">
                  <ProductThumb id={p.id} className="w-full h-24 md:h-28 rounded-xl" />
                  {p.stock <= p.minStock && <span className="absolute top-2 left-2"><Badge tone="danger">{t("lowStock")}</Badge></span>}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight line-clamp-2">{lang === "ta" ? p.nameTa : p.nameEn}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{p.sku} · {p.stock} {p.unit}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-extrabold" style={{ color: "var(--primary)" }}>{fmt(p.price)}</span>
                  {!inCart ? (
                    <button onClick={() => addToCart(p)} className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: "var(--primary)" }}><Plus size={14} /></button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button onClick={() => removeFromCart(p.id)} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}><Minus size={10} /></button>
                      <span className="text-xs font-bold w-4 text-center">{inCart.qty}</span>
                      <button onClick={() => addToCart(p)} className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ background: "var(--primary)" }}><Plus size={10} /></button>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {cart.length > 0 && (
          <div
            className="md:hidden fixed left-0 right-0 px-4 z-50"
            style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
          >
            <button onClick={() => setMobileCartOpen(true)} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-xl" style={{ background: "linear-gradient(135deg, var(--grad-primary-from), var(--grad-primary-to))" }}>
              <ShoppingCart size={17} /> {t("cart")} · {cartItemCount} · {fmt(total)}
            </button>
          </div>
        )}
      </div>

      {/* Desktop cart panel (always visible) */}
      <div className="hidden md:block w-[340px] flex-shrink-0 border-l" style={{ borderColor: "var(--border)" }}>
        {CartPanel}
      </div>

      {/* Mobile cart drawer */}
      {mobileCartOpen && (
        <div className="md:hidden fixed inset-0 z-[80]" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setMobileCartOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="absolute bottom-0 left-0 right-0 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden" style={{ background: "var(--background)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            {CartPanel}
          </div>
        </div>
      )}

      {showPayModal && (
        <PaymentModal
          total={total} received={receivedNum} setReceived={v => setReceived(v)}
          payMethod={payMethod} setPayMethod={setPayMethod} onClose={() => setShowPayModal(false)}
          onConfirm={() => finalize("save")} onPrint={() => finalize("thermal")} onWhatsapp={() => finalize("whatsapp")}
          t={t}
        />
      )}

      <ConfirmDialog open={clearConfirm} title={t("areYouSure")} message={t("clear") + " " + t("cart") + "?"} onCancel={() => setClearConfirm(false)} onConfirm={() => { setCart([]); setClearConfirm(false); }} danger t={t} />
    </div>
  );
}

// ── Payment Modal ───────────────────────────────────────────────────────────
function PaymentModal({ total, received, setReceived, payMethod, setPayMethod, onClose, onConfirm, onPrint, onWhatsapp, t }: {
  total: number; received: number; setReceived: (v: number | "") => void; payMethod: PaymentMethod; setPayMethod: (p: PaymentMethod) => void;
  onClose: () => void; onConfirm: () => void; onPrint: () => void; onWhatsapp: () => void; t: (k: string) => string;
}) {
  const balance = total - received;
  const methods: { id: PaymentMethod; icon: any; label: string }[] = [
    { id: "cash", icon: Store, label: t("cash") }, { id: "upi", icon: Check, label: t("upi") },
    { id: "card", icon: Check, label: t("card") }, { id: "credit", icon: Check, label: t("credit") },
  ];
  return (
    <div className="fixed inset-0 z-[95] flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl" style={{ background: "var(--popover)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t("grandTotal")}: {fmt(total)}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--muted)" }}><X size={15} /></button>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {methods.map(m => (
            <button key={m.id} onClick={() => setPayMethod(m.id)} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-bold" style={payMethod === m.id ? { background: "var(--primary)", color: "white" } : { background: "var(--muted)", color: "var(--muted-foreground)" }}>
              <m.icon size={16} /> {m.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{t("receivedAmount")}</label>
          <TextInput type="number" value={received} onChange={e => setReceived(Number(e.target.value) || 0)} />
        </div>
        <div className="flex justify-between text-sm font-bold mb-5 px-1">
          <span>{balance >= 0 ? t("balance") : t("change")}</span>
          <span style={{ color: balance > 0 ? "var(--destructive)" : "var(--success)" }}>{fmt(Math.abs(balance))}</span>
        </div>
        <div className="flex flex-col gap-2">
          <PrimaryButton onClick={onConfirm}><Check size={16} /> {t("saveBill")}</PrimaryButton>
          <div className="grid grid-cols-2 gap-2">
            <PrimaryButton variant="outline" onClick={onPrint}><Printer size={15} /> {t("saveAndPrint")}</PrimaryButton>
            <PrimaryButton variant="outline" onClick={onWhatsapp}><MessageCircle size={15} /> {t("saveAndWhatsapp")}</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Wholesale Billing Screen ────────────────────────────────────────────────
export function WholesaleBillingScreen({ cart, setCart, navigate, t, lang, onSaveBill }: BillingCtxProps) {
  const [search, setSearch] = useState("");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState("");
  const [received, setReceived] = useState<number | "">("");

  const { addToCart, deleteFromCart, setRate, setQty } = useCartHelpers(cart, setCart);
  const filtered = PRODUCTS.filter(p => (lang === "ta" ? p.nameTa : p.nameEn).toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
  const { subtotal, gstAmt, total } = computeTotals(cart, discount, gstEnabled);
  const receivedNum = received === "" ? total : Number(received);
  const balance = total - receivedNum;
  const customer = CUSTOMERS.find(c => c.id === customerId);

  const finalize = (print?: "thermal" | "whatsapp") => {
    if (cart.length === 0) return;
    const bill: Bill = {
      id: genId(), billNo: `SMF-${1100 + Math.floor(Math.random() * 900)}`, type: "wholesale",
      customerId: customerId || null, customerName: customer?.name || t("walkInCustomer"),
      date: new Date().toLocaleString("en-IN"), items: cart, subtotal, discount, gst: gstAmt, total,
      received: receivedNum, balance: Math.max(0, balance), paymentMethod: "credit", gstEnabled,
      status: balance <= 0 ? "paid" : receivedNum > 0 ? "partial" : "credit",
    };
    onSaveBill(bill, print);
    setCart([]); setDiscount(0); setReceived("");
    navigate("receipt");
  };

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-3" style={{ background: "var(--input-background)", border: "1.5px solid var(--border)" }}>
        <Search size={16} style={{ color: "var(--muted-foreground)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("searchItem")} className="flex-1 text-sm bg-transparent outline-none" />
      </div>

      {search && (
        <div className="flex flex-col gap-1.5 mb-4 max-h-48 overflow-y-auto">
          {filtered.slice(0, 6).map(p => (
            <button key={p.id} onClick={() => { addToCart(p, p.wholesalePrice); setSearch(""); }} className="flex items-center gap-3 p-2.5 rounded-xl text-left" style={{ background: "var(--muted)" }}>
              <ProductThumb id={p.id} className="w-9 h-9 rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{lang === "ta" ? p.nameTa : p.nameEn}</p>
                <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{p.sku} · {t("wholesalePrice")} {fmt(p.wholesalePrice)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <GlassCard className="p-4 mb-4">
        <SelectInput value={customerId} onChange={e => setCustomerId(e.target.value)} className="mb-3">
          <option value="">{t("selectCustomer")}</option>
          {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </SelectInput>

        {cart.length === 0 ? (
          <EmptyState icon={Store} title={t("cartEmpty")} />
        ) : (
          <div className="flex flex-col gap-2">
            {cart.map(c => (
              <div key={c.product.id} className="grid grid-cols-12 items-center gap-2 py-2.5 border-b text-xs" style={{ borderColor: "var(--border)" }}>
                <div className="col-span-4 font-semibold truncate">{lang === "ta" ? c.product.nameTa : c.product.nameEn}</div>
                <input type="number" value={c.qty} onChange={e => setQty(c.product.id, Number(e.target.value) || 1)} className="col-span-2 px-2 py-1.5 rounded-lg border text-center" style={{ background: "var(--input-background)", borderColor: "var(--border)" }} />
                <input type="number" value={c.rate} onChange={e => setRate(c.product.id, Number(e.target.value) || 0)} className="col-span-3 px-2 py-1.5 rounded-lg border text-center" style={{ background: "var(--input-background)", borderColor: "var(--border)" }} />
                <div className="col-span-2 font-bold text-right">{fmt(c.rate * c.qty)}</div>
                <button onClick={() => deleteFromCart(c.product.id)} className="col-span-1 flex justify-end" style={{ color: "var(--destructive)" }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>{gstEnabled ? t("gstBill") : t("nonGstBill")}</span>
          <button onClick={() => setGstEnabled(!gstEnabled)} className="w-10 h-5 rounded-full relative" style={{ background: gstEnabled ? "var(--primary)" : "var(--muted)" }}>
            <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: gstEnabled ? 22 : 2 }} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs flex-1" style={{ color: "var(--muted-foreground)" }}>{t("discount")}</span>
          <TextInput type="number" value={discount || ""} onChange={e => setDiscount(Number(e.target.value) || 0)} className="!w-24 !py-1.5 text-right" placeholder="0" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs flex-1" style={{ color: "var(--muted-foreground)" }}>{t("received")}</span>
          <TextInput type="number" value={received} onChange={e => setReceived(Number(e.target.value) || 0)} className="!w-24 !py-1.5 text-right" placeholder="0" />
        </div>
        <div className="flex flex-col gap-1 text-sm pt-1">
          <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{t("subtotal")}</span><span>{fmt(subtotal)}</span></div>
          {gstEnabled && <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{t("gst")}</span><span>{fmt(gstAmt)}</span></div>}
          <div className="flex justify-between text-base font-extrabold pt-1" style={{ color: "var(--primary)" }}><span>{t("grandTotal")}</span><span>{fmt(total)}</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{t("balance")}</span><span style={{ color: balance > 0 ? "var(--destructive)" : "var(--success)" }}>{fmt(Math.abs(balance))}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <PrimaryButton variant="ghost" onClick={() => setCart([])} disabled={cart.length === 0}><Eraser size={15} /> {t("clear")}</PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => finalize("whatsapp")} disabled={cart.length === 0}><MessageCircle size={15} /> {t("saveAndWhatsapp")}</PrimaryButton>
        </div>
        <PrimaryButton onClick={() => finalize()} disabled={cart.length === 0}><Check size={16} /> {t("saveBill")}</PrimaryButton>
        <PrimaryButton variant="outline" onClick={() => finalize("thermal")} disabled={cart.length === 0}><Printer size={15} /> {t("saveAndPrint")}</PrimaryButton>
      </GlassCard>
    </div>
  );
}

// ── Hold Bills Screen ───────────────────────────────────────────────────────
export function HoldBillsScreen({ heldBills, setHeldBills, setCart, navigate, t }: {
  heldBills: HeldBill[]; setHeldBills: (h: HeldBill[]) => void; setCart: (c: CartItem[]) => void; navigate: (s: Screen) => void; t: (k: string) => string;
}) {
  const [toDelete, setToDelete] = useState<string | null>(null);
  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      {heldBills.length === 0 ? (
        <EmptyState icon={PauseCircle} title={t("cartEmpty")} />
      ) : (
        <div className="flex flex-col gap-3">
          {heldBills.map(h => (
            <GlassCard key={h.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{h.billNo}</p>
                <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{h.customerName} · {h.items.length} items · {h.createdAt}</p>
              </div>
              <p className="text-sm font-extrabold" style={{ color: "var(--primary)" }}>{fmt(h.total)}</p>
              <button onClick={() => { setCart(h.items); setHeldBills(heldBills.filter(x => x.id !== h.id)); navigate("billing"); }} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--secondary)", color: "var(--primary)" }}><PlayCircle size={15} /></button>
              <button onClick={() => setToDelete(h.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--muted)", color: "var(--destructive)" }}><Trash2 size={14} /></button>
            </GlassCard>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!toDelete} title={t("areYouSure")} message={t("delete") + "?"} onCancel={() => setToDelete(null)} onConfirm={() => { setHeldBills(heldBills.filter(x => x.id !== toDelete)); setToDelete(null); }} danger t={t} />
    </div>
  );
}
