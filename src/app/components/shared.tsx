import React from "react";
import { Package } from "lucide-react";

// Deterministic color from any id/string — used so product/category thumbnails
// never depend on the network (no external photos = the app works offline
// straight out of the box, with zero broken-image icons when there's no signal).
const THUMB_PALETTE = ["#b91c1c", "#d97706", "#0f766e", "#7c3aed", "#0369a1", "#be185d", "#166534"];
export function colorFromId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return THUMB_PALETTE[h % THUMB_PALETTE.length];
}

export function ProductThumb({ id, className = "" }: { id: string; className?: string }) {
  const color = colorFromId(id);
  return (
    <div className={`flex items-center justify-center flex-shrink-0 ${className}`} style={{ background: `${color}20`, color }}>
      <Package className="w-1/2 h-1/2" strokeWidth={1.75} />
    </div>
  );
}

export function GlassCard({ children, className = "", onClick, glow, style }: { children: React.ReactNode; className?: string; onClick?: () => void; glow?: string; style?: React.CSSProperties }) {
  // Neumorphic surface: same color as the page, depth comes from the
  // light+dark shadow pair (see .neu in theme.css) instead of a border.
  return (
    <div
      onClick={onClick}
      className={`neu ${onClick ? "cursor-pointer active:scale-[0.98] transition-all duration-150" : ""} ${className}`}
      style={{
        borderRadius: "1.25rem",
        ...(glow ? { boxShadow: `0 8px 24px ${glow}22, -6px -6px 12px var(--neu-light), 6px 6px 12px var(--neu-dark)` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, change, icon: Icon, color }: { label: string; value: string; change?: number; icon: any; color: string }) {
  const up = (change ?? 0) >= 0;
  return (
    <GlassCard className="p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: color + "1f" }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <div>
        <div className="text-xl md:text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${up ? "text-emerald-500" : "text-red-500"}`}>
            {Math.abs(change)}% {up ? "↑" : "↓"} vs last week
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "success" | "warning" | "danger" | "primary" }) {
  const tones: Record<string, { bg: string; fg: string }> = {
    muted: { bg: "var(--muted)", fg: "var(--muted-foreground)" },
    success: { bg: "rgba(16,185,129,0.14)", fg: "var(--success)" },
    warning: { bg: "rgba(217,119,6,0.14)", fg: "var(--warning)" },
    danger: { bg: "rgba(220,38,38,0.12)", fg: "var(--destructive)" },
    primary: { bg: "var(--secondary)", fg: "var(--primary)" },
  };
  const t = tones[tone];
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center" style={{ background: t.bg, color: t.fg }}>
      {children}
    </span>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="font-bold text-sm md:text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
        {subtitle && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, variant = "solid", className = "" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: "solid" | "outline" | "ghost" | "danger"; className?: string }) {
  const base = "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] active:shadow-none disabled:opacity-60";
  // "solid" keeps the brand gradient but reads as a raised neumorphic key —
  // dual colored shadow instead of a flat drop shadow — and presses flush
  // (inset) on tap. The neutral variants sit on the page surface itself.
  const styles: Record<string, React.CSSProperties> = {
    solid: {
      background: "linear-gradient(135deg, var(--grad-primary-from), var(--grad-primary-to))",
      color: "white",
      boxShadow: "-4px -4px 10px rgba(255,255,255,0.2), 4px 4px 14px rgba(127,20,20,0.45)",
    },
    outline: { background: "var(--background)", color: "var(--primary)", boxShadow: "var(--neu-distance-sm) var(--neu-distance-sm) var(--neu-blur-sm) var(--neu-dark), calc(var(--neu-distance-sm) * -1) calc(var(--neu-distance-sm) * -1) var(--neu-blur-sm) var(--neu-light)" },
    ghost: { background: "var(--background)", color: "var(--foreground)", boxShadow: "var(--neu-distance-sm) var(--neu-distance-sm) var(--neu-blur-sm) var(--neu-dark), calc(var(--neu-distance-sm) * -1) calc(var(--neu-distance-sm) * -1) var(--neu-blur-sm) var(--neu-light)" },
    danger: { background: "var(--destructive)", color: "white", boxShadow: "-4px -4px 10px rgba(255,255,255,0.15), 4px 4px 14px rgba(0,0,0,0.35)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${className}`} style={styles[variant]}>
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{label}</label>
      {children}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  // Neumorphic fields read as pressed into the surface (inset shadow)
  // rather than boxed with a border.
  return (
    <input
      {...rest}
      className={`neu-pressed-sm w-full px-4 py-2.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]/40 transition-all ${className}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    />
  );
}

export function SelectInput({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className="neu-pressed-sm w-full px-4 py-2.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]/40 transition-all"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
    </select>
  );
}

export function ConfirmDialog({ open, title, message, onCancel, onConfirm, danger, t }: { open: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => void; danger?: boolean; t: (k: string) => string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ background: "var(--popover)", border: "1px solid var(--border)" }}>
        <h3 className="font-bold text-base mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
        <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>{message}</p>
        <div className="flex gap-3">
          <PrimaryButton variant="ghost" onClick={onCancel} className="flex-1">{t("cancel")}</PrimaryButton>
          <PrimaryButton variant={danger ? "danger" : "solid"} onClick={onConfirm} className="flex-1">{t("confirm")}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, action }: { icon: any; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      <div className="neu w-16 h-16 rounded-3xl flex items-center justify-center">
        <Icon size={26} style={{ color: "var(--muted-foreground)" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>{title}</p>
      {action}
    </div>
  );
}

export function ResponsiveTable({ columns, children }: { columns: string[]; children: React.ReactNode }) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--muted)" }}>
            {columns.map(c => (
              <th key={c} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
