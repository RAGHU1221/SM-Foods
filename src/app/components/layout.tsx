import React, { useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Store, Package, Tag, Users, BookOpen, Wallet, Coins,
  BarChart3, Trash2, PauseCircle, Printer, Settings as SettingsIcon, HardDrive,
  Search, Bell, Sun, Moon, LogOut, Menu, X, Globe, ChevronLeft, ChevronRight, Zap,
  Wifi, WifiOff,
} from "lucide-react";
import type { Screen, Lang, AppNotification, SearchResult } from "../types";

export const NAV_ITEMS: { id: Screen; icon: any; labelKey: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
  { id: "billing", icon: ShoppingCart, labelKey: "billing" },
  { id: "wholesale", icon: Store, labelKey: "wholesaleBilling" },
  { id: "items", icon: Package, labelKey: "items" },
  { id: "items", icon: Package, labelKey: "wholesaleItems" },
  { id: "itemtypes", icon: Tag, labelKey: "itemTypes" },
  { id: "customers", icon: Users, labelKey: "customers" },
  { id: "ledger", icon: BookOpen, labelKey: "ledger" },
  { id: "outstanding", icon: Wallet, labelKey: "outstanding" },
  { id: "receivepayment", icon: Coins, labelKey: "receivePayment" },
  { id: "reports", icon: BarChart3, labelKey: "reports" },
  { id: "deletedbills", icon: Trash2, labelKey: "deletedBills" },
  { id: "holdbills", icon: PauseCircle, labelKey: "holdBills" },
  { id: "printer", icon: Printer, labelKey: "printer" },
  { id: "settings", icon: SettingsIcon, labelKey: "settings" },
  { id: "backup", icon: HardDrive, labelKey: "backup" },
];

const MOBILE_NAV = [
  { id: "dashboard" as Screen, icon: LayoutDashboard, labelKey: "home", clr: "var(--primary)" },
  { id: "billing" as Screen, icon: ShoppingCart, labelKey: "billing", clr: "#f59e0b" },
  { id: "reports" as Screen, icon: BarChart3, labelKey: "reports", clr: "#10b981" },
  { id: "settings" as Screen, icon: SettingsIcon, labelKey: "more", clr: "#8b5cf6" },
];

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="rounded-2xl flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: "linear-gradient(135deg, var(--grad-primary-from), var(--grad-primary-to))" }}>
      <Zap size={size * 0.5} color="white" strokeWidth={2} />
    </div>
  );
}

export function Sidebar({ screen, navigate, collapsed, setCollapsed, t }: { screen: Screen; navigate: (s: Screen) => void; collapsed: boolean; setCollapsed: (v: boolean) => void; t: (k: string) => string }) {
  const seen = new Set<string>();
  return (
    <aside className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 border-r transition-all duration-200" style={{ width: collapsed ? 76 : 248, background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}>
      <div className="flex items-center gap-3 px-4 py-5">
        <Logo size={38} />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-extrabold truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t("appName")}</p>
            <p className="text-[10px] truncate" style={{ color: "var(--muted-foreground)" }}>{t("appTag")}</p>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ id, icon: Icon, labelKey }, i) => {
          const dupKey = `${id}-${labelKey}`;
          if (seen.has(dupKey)) return null;
          seen.add(dupKey);
          const active = screen === id;
          return (
            <button
              key={i}
              onClick={() => navigate(id)}
              title={collapsed ? t(labelKey) : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${active ? "neu-pressed-sm" : ""}`}
              style={{ color: active ? "var(--primary)" : "var(--sidebar-foreground)" }}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{t(labelKey)}</span>}
            </button>
          );
        })}
      </nav>
      <button onClick={() => setCollapsed(!collapsed)} className="neu-sm flex items-center justify-center gap-2 mx-3 mb-4 py-2 rounded-xl text-xs font-semibold" style={{ color: "var(--sidebar-accent-foreground)" }}>
        {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Collapse</>}
      </button>
    </aside>
  );
}

export function DesktopHeader({ title, dark, toggleDark, lang, setLang, onSearch, onNotif, unread, onLogout, t }: {
  title: string; dark: boolean; toggleDark: () => void; lang: Lang; setLang: (l: Lang) => void;
  onSearch: () => void; onNotif: () => void; unread: number; onLogout: () => void; t: (k: string) => string;
}) {
  return (
    <header className="hidden md:flex items-center justify-between px-6 py-4 border-b sticky top-0 z-30 backdrop-blur-xl" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
      <h1 className="text-lg font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
      <div className="flex items-center gap-2.5">
        <button onClick={onSearch} className="neu-sm flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs" style={{ color: "var(--muted-foreground)" }}>
          <Search size={14} /> {t("search")}...
        </button>
        <button onClick={() => setLang(lang === "en" ? "ta" : "en")} className="neu-sm flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold">
          <Globe size={14} /> {lang === "en" ? "EN" : "TA"}
        </button>
        <button onClick={onNotif} className="neu-sm neu-circle w-9 h-9 flex items-center justify-center relative">
          <Bell size={16} />
          {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: "var(--destructive)" }}>{unread}</span>}
        </button>
        <button onClick={toggleDark} className={`neu-circle w-9 h-9 flex items-center justify-center ${dark ? "neu-pressed-sm" : "neu-sm"}`}>
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs text-white" style={{ background: "linear-gradient(135deg, var(--grad-primary-from), var(--grad-primary-to))", boxShadow: "-3px -3px 8px rgba(255,255,255,0.2), 3px 3px 10px rgba(127,20,20,0.4)" }}>AS</div>
        <button onClick={onLogout} className="neu-sm neu-circle w-9 h-9 flex items-center justify-center">
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}

export function MobileHeader({ title, dark, toggleDark, onMenu, onNotif, unread, back, onBack }: {
  title: string; dark: boolean; toggleDark: () => void; onMenu: () => void; onNotif: () => void; unread: number; back?: boolean; onBack?: () => void;
}) {
  return (
    <div className="flex md:hidden items-center justify-between px-4 pt-5 pb-3">
      <div className="flex items-center gap-2.5">
        {back ? (
          <button onClick={onBack} className="neu-sm neu-circle w-9 h-9 flex items-center justify-center"><ChevronLeft size={16} /></button>
        ) : (
          <button onClick={onMenu} className="neu-sm neu-circle w-9 h-9 flex items-center justify-center"><Menu size={16} /></button>
        )}
        <h1 className="text-lg font-extrabold truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
      </div>
      <div className="flex items-center gap-2.5">
        <button onClick={onNotif} className="neu-sm neu-circle w-9 h-9 flex items-center justify-center relative">
          <Bell size={15} />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--destructive)" }} />}
        </button>
        <button onClick={toggleDark} className={`neu-circle w-9 h-9 flex items-center justify-center ${dark ? "neu-pressed-sm" : "neu-sm"}`}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </div>
  );
}

export function BottomNav({ screen, navigate, onMenu }: { screen: Screen; navigate: (s: Screen) => void; onMenu: () => void }) {
  // "Bump" nav (magic-navigation style): the active tab's icon lifts up
  // above the bar, fills with its own color and glows; a same-color
  // indicator disc slides underneath it with a seamed double-bite join so
  // it reads as one continuous raised shape rather than a separate blob.
  // Resting tabs stay as plain neumorphic circles, matching the rest of the
  // soft-UI surfaces in the app.
  const activeIndex = Math.max(0, MOBILE_NAV.findIndex(m => m.id === screen || (m.id === "settings" && screen === "settings")));
  const activeClr = MOBILE_NAV[activeIndex]?.clr ?? "var(--primary)";
  return (
    <nav className="magic-nav md:hidden fixed bottom-0 left-0 right-0 z-40" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="magic-nav-list relative flex items-end justify-around px-3 pt-6 pb-3">
        <span
          className="magic-nav-indicator"
          style={{ left: 0, width: `${100 / MOBILE_NAV.length}%`, transform: `translateX(${activeIndex * 100}%)`, ["--tab-clr" as any]: activeClr }}
        />
        {MOBILE_NAV.map(({ id, icon: Icon, labelKey, clr }, i) => {
          const active = screen === id || (id === "settings" && screen === "settings");
          return (
            <button
              key={i}
              onClick={() => id === "settings" ? onMenu() : navigate(id)}
              className={`magic-nav-item-btn flex-1 flex flex-col items-center gap-1.5 transition-transform active:scale-95 ${active ? "active" : ""}`}
              style={{ ["--tab-clr" as any]: clr }}
            >
              <span className={`magic-nav-icon ${active ? "" : "neu"}`}>
                <Icon size={19} />
              </span>
              <span className="magic-nav-label" style={{ color: active ? clr : "var(--muted-foreground)" }}>
                {labelKey === "home" ? "Home" : labelKey === "billing" ? "Billing" : labelKey === "reports" ? "Reports" : "More"}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileMenuSheet({ open, onClose, screen, navigate, lang, setLang, onLogout, t }: {
  open: boolean; onClose: () => void; screen: Screen; navigate: (s: Screen) => void; lang: Lang; setLang: (l: Lang) => void; onLogout: () => void; t: (k: string) => string;
}) {
  if (!open) return null;
  const seen = new Set<string>();
  return (
    <div className="fixed inset-0 z-[90] md:hidden" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="absolute left-0 top-0 bottom-0 w-[78%] max-w-xs overflow-y-auto" style={{ background: "var(--sidebar)" }}>
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <div>
              <p className="text-sm font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t("appName")}</p>
            </div>
          </div>
          <button onClick={onClose} className="neu-sm w-8 h-8 rounded-xl flex items-center justify-center"><X size={15} /></button>
        </div>
        <div className="flex flex-col gap-1.5 px-3 py-2">
          {NAV_ITEMS.map(({ id, icon: Icon, labelKey }, i) => {
            const dupKey = `${id}-${labelKey}`;
            if (seen.has(dupKey)) return null;
            seen.add(dupKey);
            const active = screen === id;
            return (
              <button key={i} onClick={() => { navigate(id); onClose(); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold ${active ? "neu-pressed-sm" : ""}`} style={{ color: active ? "var(--primary)" : "var(--sidebar-foreground)" }}>
                <Icon size={17} /> {t(labelKey)}
              </button>
            );
          })}
          <button onClick={() => setLang(lang === "en" ? "ta" : "en")} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold" style={{ color: "var(--sidebar-foreground)" }}>
            <Globe size={17} /> {lang === "en" ? "தமிழுக்கு மாற்று" : "Switch to English"}
          </button>
          <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold" style={{ color: "var(--destructive)" }}>
            <LogOut size={17} /> {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPanel({ open, onClose, notifications, lang, markAllRead, markOneRead, t }: {
  open: boolean; onClose: () => void; notifications: AppNotification[]; lang: Lang; markAllRead: () => void; markOneRead: (id: string) => void; t: (k: string) => string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[95]" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="absolute right-0 top-0 bottom-0 w-full max-w-sm overflow-y-auto shadow-2xl" style={{ background: "var(--popover)" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t("notifications")}</h3>
          <button onClick={onClose} className="neu-sm w-8 h-8 rounded-xl flex items-center justify-center"><X size={15} /></button>
        </div>
        <button onClick={markAllRead} className="text-xs font-semibold px-5 py-2" style={{ color: "var(--primary)" }}>{t("markAllRead")}</button>
        <div className="flex flex-col gap-2 px-4 pb-6">
          {notifications.map(n => (
            <button key={n.id} onClick={() => markOneRead(n.id)} className="p-3.5 rounded-2xl border flex gap-3 text-left" style={{ borderColor: "var(--border)", background: n.read ? "transparent" : "var(--secondary)" }}>
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.read ? "transparent" : "var(--primary)" }} />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{lang === "ta" ? n.titleTa : n.titleEn}</p>
                <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{n.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SearchModal({ open, onClose, query, setQuery, results, onSelect, t }: {
  open: boolean; onClose: () => void; query: string; setQuery: (v: string) => void;
  results: SearchResult[]; onSelect: (r: SearchResult) => void; t: (k: string) => string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center pt-24 px-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden" style={{ background: "var(--popover)" }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <Search size={16} style={{ color: "var(--muted-foreground)" }} />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder={`${t("search")} items, bills, customers...`} className="flex-1 bg-transparent outline-none text-sm" />
          <button onClick={onClose} className="neu-sm w-7 h-7 rounded-lg flex items-center justify-center"><X size={13} /></button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <p className="text-center text-xs py-8" style={{ color: "var(--muted-foreground)" }}>{query ? "No results" : "Type to search items, bills or customers"}</p>}
          {results.map((r, i) => (
            <button key={i} onClick={() => onSelect(r)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--muted)] cursor-pointer text-left">
              <div>
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.sub}</p>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{r.kind}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div className="md:hidden flex items-center justify-between px-5 pt-2 pb-0.5">
      <span className="text-[11px] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--muted-foreground)" }}>
        {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
      </span>
      <div className="flex items-center gap-1">
        <Wifi size={11} style={{ color: "var(--muted-foreground)" }} />
      </div>
    </div>
  );
}

export { Wifi, WifiOff };
