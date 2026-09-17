import React, { useState } from "react";
import { CheckCircle, Printer, FileText, Download, MessageCircle, Share2, X, Globe } from "lucide-react";
import { GlassCard, PrimaryButton } from "../components/shared";
import { fmt } from "../data";
import type { Bill, Lang, Screen } from "../types";

export function BillPreviewScreen({ bill, navigate, t }: { bill: Bill | null; navigate: (s: Screen) => void; t: (k: string) => string }) {
  const [invoiceLang, setInvoiceLang] = useState<Lang>("en");
  const isTa = invoiceLang === "ta";

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-3">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No bill to show yet.</p>
        <PrimaryButton onClick={() => navigate("billing")}>{t("newBill")}</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-24 md:pb-10 px-4 md:px-6 pt-4 md:pt-5">
      <div className="w-full max-w-md flex justify-end mb-2">
        <button onClick={() => setInvoiceLang(isTa ? "en" : "ta")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: "var(--muted)" }}>
          <Globe size={12} /> {isTa ? "English" : "தமிழ்"}
        </button>
      </div>

      <div id="print-area" className="w-full max-w-md">
        <GlassCard className="overflow-hidden" style={{ border: "1.5px solid rgba(16,185,129,0.3)" }}>
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, var(--success), #0f766e)" }} />
          <div className="p-6 flex flex-col items-center gap-1.5 border-b" style={{ borderColor: "var(--border)" }}>
            <CheckCircle size={30} color="var(--success)" />
            <h2 className="text-lg font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{isTa ? "ஸ்ரீ முருகன் ஃபுட்ஸ்" : "Sri Murugan Foods"}</h2>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{isTa ? "No.24, மார்க்கெட் தெரு, சேலம் - 636001, GSTIN: 33SMFPQ1234K1Z8" : "No.24, Market Street, Salem - 636001, GSTIN: 33SMFPQ1234K1Z8"}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Ph: +91 98421 55667</p>
          </div>

          <div className="px-6 py-3 flex items-center justify-between text-xs border-b" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{bill.billNo}</p>
              <p style={{ color: "var(--muted-foreground)" }}>{bill.date}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{bill.customerName}</p>
              <p style={{ color: "var(--muted-foreground)" }}>{bill.gstEnabled ? (isTa ? "ஜிஎஸ்டி பில்" : "GST Bill") : (isTa ? "ஜிஎஸ்டி இல்லா பில்" : "Non-GST Bill")}</p>
            </div>
          </div>

          <div className="px-6 py-3">
            <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wide pb-2" style={{ color: "var(--muted-foreground)" }}>
              <span className="col-span-6">{isTa ? "பொருள்" : "Item"}</span>
              <span className="col-span-2 text-center">{isTa ? "எண்" : "Qty"}</span>
              <span className="col-span-2 text-right">{isTa ? "விலை" : "Rate"}</span>
              <span className="col-span-2 text-right">{isTa ? "தொகை" : "Amt"}</span>
            </div>
            {bill.items.length === 0 ? (
              <p className="text-xs py-2" style={{ color: "var(--muted-foreground)" }}>{isTa ? "விற்பனை பொருட்கள் பட்டியல்" : "Items on this invoice"}</p>
            ) : bill.items.map(c => (
              <div key={c.product.id} className="grid grid-cols-12 text-xs py-1.5 border-t" style={{ borderColor: "var(--border)" }}>
                <span className="col-span-6 truncate">{isTa ? c.product.nameTa : c.product.nameEn}</span>
                <span className="col-span-2 text-center">{c.qty}</span>
                <span className="col-span-2 text-right">{c.rate}</span>
                <span className="col-span-2 text-right font-semibold">{c.rate * c.qty}</span>
              </div>
            ))}
          </div>

          <div className="px-6 py-3 border-t flex flex-col gap-1 text-sm" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{isTa ? "துணை மொத்தம்" : "Subtotal"}</span><span>{fmt(bill.subtotal)}</span></div>
            {bill.discount > 0 && <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{isTa ? "தள்ளுபடி" : "Discount"}</span><span className="text-red-500">-{fmt(bill.discount)}</span></div>}
            {bill.gstEnabled && <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{isTa ? "ஜிஎஸ்டி" : "GST"}</span><span>{fmt(bill.gst)}</span></div>}
            <div className="flex justify-between text-base font-extrabold" style={{ color: "var(--primary)" }}><span>{isTa ? "மொத்த தொகை" : "Total"}</span><span>{fmt(bill.total)}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{isTa ? "பெற்றது" : "Received"}</span><span>{fmt(bill.received)}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>{isTa ? "மீதி" : "Balance"}</span><span style={{ color: bill.balance > 0 ? "var(--destructive)" : "var(--success)" }}>{fmt(bill.balance)}</span></div>
            <div className="flex justify-between text-xs pt-1"><span style={{ color: "var(--muted-foreground)" }}>{isTa ? "பணம் முறை" : "Payment"}</span><span className="capitalize font-semibold">{bill.paymentMethod}</span></div>
          </div>

          <div className="px-6 py-4 text-center border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{isTa ? "மீண்டும் வருக! நன்றி." : "Thank you! Visit again."}</p>
          </div>
        </GlassCard>
      </div>

      <div className="w-full max-w-md grid grid-cols-2 gap-2 mt-4">
        <PrimaryButton variant="outline" onClick={() => window.print()}><Printer size={15} /> {t("printThermal")}</PrimaryButton>
        <PrimaryButton variant="outline" onClick={() => window.print()}><FileText size={15} /> {t("printA4")}</PrimaryButton>
        <PrimaryButton variant="outline" onClick={() => alert(isTa ? "PDF பதிவிறக்கம் தொடங்கியது" : "PDF download started")}><Download size={15} /> {t("downloadPdf")}</PrimaryButton>
        <PrimaryButton variant="outline" onClick={() => alert(isTa ? "வாட்ஸ்அப் வழியாக அனுப்பப்பட்டது" : "Sent via WhatsApp")}><MessageCircle size={15} /> WhatsApp</PrimaryButton>
      </div>
      <div className="w-full max-w-md grid grid-cols-2 gap-2 mt-2">
        <PrimaryButton variant="ghost" onClick={() => alert(isTa ? "பகிரப்பட்டது" : "Shared")}><Share2 size={15} /> {t("share")}</PrimaryButton>
        <PrimaryButton onClick={() => navigate("dashboard")}><X size={15} /> {t("close")}</PrimaryButton>
      </div>
    </div>
  );
}
