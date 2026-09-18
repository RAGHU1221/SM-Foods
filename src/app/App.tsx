import React, { useState, useMemo } from "react";
import { useIsMobile } from "./components/ui/use-mobile";
import { Sidebar, DesktopHeader, MobileHeader, BottomNav, MobileMenuSheet, NotificationsPanel, SearchModal } from "./components/layout";
import { SplashScreen, LoginScreen } from "./screens/auth";
import { DashboardScreen } from "./screens/dashboard";
import { BillingScreen, WholesaleBillingScreen, HoldBillsScreen } from "./screens/billing";
import { BillPreviewScreen } from "./screens/receipt";
import { ItemsScreen, ItemFormScreen, ItemTypesScreen } from "./screens/items";
import { CustomersScreen, CustomerFormScreen, CustomerLedgerScreen, OutstandingScreen, ReceivePaymentScreen } from "./screens/customers";
import { ReportsScreen, DeletedBillsScreen } from "./screens/reports";
import { PrinterScreen, SettingsScreen, BackupScreen } from "./screens/admin";
import { makeT } from "./i18n";
import { usePersistentState, useOnlineStatus } from "./storage";
import { PRODUCTS, CUSTOMERS, BILLS, NOTIFICATIONS, HELD_BILLS, LEDGER, DELETED_BILLS, DEFAULT_SETTINGS, DEFAULT_PRINTER_SETTINGS, fmt } from "./data";
import type { Screen, Lang, CartItem, HeldBill, Bill, AppNotification, Product, Customer, LedgerEntry, DeletedBill, BusinessSettings, PrinterSettings, SearchResult } from "./types";
import { WifiOff } from "lucide-react";

const TITLE_KEY: Record<Screen, string> = {
  splash: "appName", login: "appName",
  dashboard: "dashboard", billing: "posBilling", wholesale: "wholesaleBilling",
  payment: "posBilling", receipt: "billPreview", holdbills: "holdBills",
  items: "itemManagement", itemform: "itemManagement", itemtypes: "itemTypes",
  customers: "customers", customerform: "customers", ledger: "customerLedger",
  outstanding: "outstanding", receivepayment: "receivePayment",
  reports: "reports", deletedbills: "deletedBills",
  printer: "printerSettings", settings: "settings", backup: "backupManagement",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");

  // Everything below is persisted to this device's localStorage, so the app
  // keeps its data — cart, held bills, saved bills, settings — with zero
  // network calls, including a full offline restart of the app/PWA.
  const [authed, setAuthed] = usePersistentState("authed", false);
  const [dark, setDark] = usePersistentState("dark", false);
  const [lang, setLang] = usePersistentState<Lang>("lang", "en");
  const [cart, setCart] = usePersistentState<CartItem[]>("cart", []);
  const [heldBills, setHeldBills] = usePersistentState<HeldBill[]>("heldBills", HELD_BILLS);
  const [bills, setBills] = usePersistentState<Bill[]>("bills", BILLS);
  const [lastBill, setLastBill] = usePersistentState<Bill | null>("lastBill", null);
  const [notifications, setNotifications] = usePersistentState<AppNotification[]>("notifications", NOTIFICATIONS);
  // Products are persisted too, so items added/edited/deleted in Items
  // Management survive offline restarts and stay in sync everywhere the
  // catalog is used (search, dashboard stats, billing screens).
  const [products, setProducts] = usePersistentState<Product[]>("products", PRODUCTS);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  // Same for customers, their ledger, deleted bills, and business/printer
  // settings — every screen that lets you add/edit/delete something now
  // reads from and writes to one of these instead of a static demo array.
  const [customers, setCustomers] = usePersistentState<Customer[]>("customers", CUSTOMERS);
  const [ledgerEntries, setLedgerEntries] = usePersistentState<LedgerEntry[]>("ledger", LEDGER);
  const [deletedBills, setDeletedBills] = usePersistentState<DeletedBill[]>("deletedBills", DELETED_BILLS);
  const [settings, setSettings] = usePersistentState<BusinessSettings>("settings", DEFAULT_SETTINGS);
  const [printerSettings, setPrinterSettings] = usePersistentState<PrinterSettings>("printerSettings", DEFAULT_PRINTER_SETTINGS);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const [ledgerCustomer, setLedgerCustomer] = useState<string | null>(CUSTOMERS[0].id);
  const [receiveCustomer, setReceiveCustomer] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isMobile = useIsMobile();
  const online = useOnlineStatus();
  const t = useMemo(() => makeT(lang), [lang]);
  const unread = notifications.filter(n => !n.read).length;

  const navigate = (s: Screen) => { setScreen(s); window.scrollTo(0, 0); };
  const onSaveBill = (bill: Bill, _print?: "thermal" | "a4" | "whatsapp") => {
    setLastBill(bill);
    setBills(prev => [bill, ...prev]);
  };
  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const markOneRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  const handleLogin = () => { setAuthed(true); navigate("dashboard"); };
  const handleLogout = () => { setAuthed(false); navigate("login"); };
  const startAddItem = () => { setEditingProductId(null); navigate("itemform"); };
  const startEditItem = (id: string) => { setEditingProductId(id); navigate("itemform"); };
  const startAddCustomer = () => { setEditingCustomerId(null); navigate("customerform"); };
  const startEditCustomer = (id: string) => { setEditingCustomerId(id); navigate("customerform"); };

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const items = products.filter(p => p.nameEn.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 4).map(p => ({ id: p.id, label: p.nameEn, sub: `${p.sku} · ${fmt(p.price)}`, kind: "item" as const }));
    const custs = customers.filter(c => c.name.toLowerCase().includes(q) || c.mobile.includes(q)).slice(0, 4).map(c => ({ id: c.id, label: c.name, sub: c.mobile, kind: "customer" as const }));
    const billMatches = bills.filter(b => b.billNo.toLowerCase().includes(q) || b.customerName.toLowerCase().includes(q)).slice(0, 4).map(b => ({ id: b.id, label: b.billNo, sub: `${b.customerName} · ${fmt(b.total)}`, kind: "bill" as const }));
    return [...items, ...custs, ...billMatches];
  }, [searchQuery, bills, products, customers]);

  const handleSearchSelect = (r: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery("");
    if (r.kind === "item") navigate("items");
    else if (r.kind === "customer") { setLedgerCustomer(r.id); navigate("ledger"); }
    else navigate("reports");
  };

  if (screen === "splash") {
    return <div className={dark ? "dark" : ""}><div className="h-screen w-screen" style={{ background: "var(--background)" }}><SplashScreen onDone={() => navigate(authed ? "dashboard" : "login")} t={t} /></div></div>;
  }
  if (screen === "login") {
    return <div className={dark ? "dark" : ""}><div className="h-screen w-screen overflow-y-auto" style={{ background: "var(--background)" }}><LoginScreen onLogin={handleLogin} t={t} lang={lang} /></div></div>;
  }

  const title = t(TITLE_KEY[screen] || "dashboard");

  const renderScreen = () => {
    switch (screen) {
      case "dashboard": return <DashboardScreen dark={dark} navigate={navigate} t={t} lang={lang} bills={bills} products={products} />;
      case "billing": return <BillingScreen cart={cart} setCart={setCart} navigate={navigate} t={t} lang={lang} onSaveBill={onSaveBill} heldBills={heldBills} setHeldBills={setHeldBills} products={products} />;
      case "wholesale": return <WholesaleBillingScreen cart={cart} setCart={setCart} navigate={navigate} t={t} lang={lang} onSaveBill={onSaveBill} heldBills={heldBills} setHeldBills={setHeldBills} products={products} />;
      case "receipt": return <BillPreviewScreen bill={lastBill} navigate={navigate} t={t} />;
      case "holdbills": return <HoldBillsScreen heldBills={heldBills} setHeldBills={setHeldBills} setCart={setCart} navigate={navigate} t={t} />;
      case "items": return <ItemsScreen navigate={navigate} t={t} lang={lang} products={products} setProducts={setProducts} onAdd={startAddItem} onEdit={startEditItem} />;
      case "itemform": return <ItemFormScreen navigate={navigate} t={t} lang={lang} products={products} setProducts={setProducts} editingProductId={editingProductId} />;
      case "itemtypes": return <ItemTypesScreen t={t} lang={lang} />;
      case "customers": return <CustomersScreen navigate={navigate} t={t} customers={customers} setCustomers={setCustomers} setLedgerCustomer={setLedgerCustomer} onAdd={startAddCustomer} onEdit={startEditCustomer} />;
      case "customerform": return <CustomerFormScreen navigate={navigate} t={t} customers={customers} setCustomers={setCustomers} editingCustomerId={editingCustomerId} />;
      case "ledger": return <CustomerLedgerScreen customerId={ledgerCustomer} t={t} customers={customers} ledgerEntries={ledgerEntries} />;
      case "outstanding": return <OutstandingScreen navigate={navigate} t={t} customers={customers} setReceiveCustomer={setReceiveCustomer} />;
      case "receivepayment": return <ReceivePaymentScreen customerId={receiveCustomer} navigate={navigate} t={t} customers={customers} setCustomers={setCustomers} ledgerEntries={ledgerEntries} setLedgerEntries={setLedgerEntries} />;
      case "reports": return <ReportsScreen t={t} />;
      case "deletedbills": return <DeletedBillsScreen t={t} deletedBills={deletedBills} setDeletedBills={setDeletedBills} setBills={setBills} />;
      case "printer": return <PrinterScreen t={t} printerSettings={printerSettings} setPrinterSettings={setPrinterSettings} />;
      case "settings": return <SettingsScreen dark={dark} setDark={setDark} lang={lang} setLang={setLang} t={t} settings={settings} setSettings={setSettings} />;
      case "backup": return <BackupScreen t={t} />;
      default: return <DashboardScreen dark={dark} navigate={navigate} t={t} lang={lang} bills={bills} products={products} />;
    }
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen w-full flex" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <Sidebar screen={screen} navigate={navigate} collapsed={collapsed} setCollapsed={setCollapsed} t={t} />

        <div className="flex-1 min-w-0 flex flex-col">
          {!online && (
            <div className="flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-white" style={{ background: "var(--destructive)" }}>
              <WifiOff size={12} /> {t("offline")} — {lang === "ta" ? "இந்த சாதனத்தில் தரவு சேமிக்கப்படுகிறது" : "working offline, data is saved on this device"}
            </div>
          )}
          <DesktopHeader title={title} dark={dark} toggleDark={() => setDark(!dark)} lang={lang} setLang={setLang} onSearch={() => setSearchOpen(true)} onNotif={() => setNotifOpen(true)} unread={unread} onLogout={handleLogout} t={t} />
          <MobileHeader title={title} dark={dark} toggleDark={() => setDark(!dark)} onMenu={() => setMenuOpen(true)} onNotif={() => setNotifOpen(true)} unread={unread} />

          <main className="flex-1 min-w-0 app-main-pad">
            {renderScreen()}
          </main>
        </div>

        <BottomNav screen={screen} navigate={navigate} onMenu={() => setMenuOpen(true)} />
        <MobileMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} screen={screen} navigate={navigate} lang={lang} setLang={setLang} onLogout={handleLogout} t={t} />
        <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications} lang={lang} markAllRead={markAllRead} markOneRead={markOneRead} t={t} />
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} query={searchQuery} setQuery={setSearchQuery} results={searchResults} onSelect={handleSearchSelect} t={t} />
      </div>
    </div>
  );
}
