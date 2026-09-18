export type Screen =
  | "splash" | "login"
  | "dashboard"
  | "billing" | "wholesale" | "payment" | "receipt" | "holdbills"
  | "items" | "itemform" | "itemtypes"
  | "customers" | "customerform" | "ledger" | "outstanding" | "receivepayment"
  | "reports" | "deletedbills"
  | "printer" | "settings" | "backup";

export type Lang = "en" | "ta";
export type ThemeMode = "light" | "dark";
export type PaymentMethod = "cash" | "upi" | "card" | "credit";

export interface ItemType {
  id: string;
  nameEn: string;
  nameTa: string;
  itemCount: number;
  active: boolean;
}

export interface Product {
  id: string;
  nameEn: string;
  nameTa: string;
  typeId: string;
  sku: string;
  barcode: string;
  purchasePrice: number;
  price: number; // selling price
  wholesalePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  gst: number; // percent
  image: string;
  active: boolean;
}

export interface CartItem {
  product: Product;
  qty: number;
  rate: number; // editable rate (wholesale)
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  gstNumber?: string;
  openingBalance: number;
  creditLimit: number;
  balance: number; // current outstanding
  lastPaymentDate?: string;
}

export interface LedgerEntry {
  id: string;
  customerId: string;
  date: string;
  billNo?: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface Bill {
  id: string;
  billNo: string;
  type: "retail" | "wholesale";
  customerId: string | null;
  customerName: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  received: number;
  balance: number;
  paymentMethod: PaymentMethod;
  gstEnabled: boolean;
  status: "paid" | "partial" | "credit";
}

export interface DeletedBill {
  id: string;
  billNo: string;
  date: string;
  customerName: string;
  amount: number;
  deletedBy: string;
  deletedDate: string;
  reason: string;
}

export interface HeldBill {
  id: string;
  billNo: string;
  customerName: string;
  items: CartItem[];
  total: number;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  titleEn: string;
  titleTa: string;
  time: string;
  read: boolean;
  kind: "stock" | "payment" | "backup" | "printer" | "bill";
}

export interface BusinessSettings {
  businessName: string;
  phone: string;
  address: string;
  gstNumber: string;
  invoiceFooter: string;
  logo: string;
  gstEnabledDefault: boolean;
  defaultPayment: PaymentMethod;
  invoicePrefix: string;
  invoiceNumber: number;
  decimals: number;
}

export interface PrinterSettings {
  thermalConnected: boolean;
  a4Connected: boolean;
  autoPrint: boolean;
  thermalName: string;
  a4Name: string;
  paperWidth: string;
  copies: number;
}

export interface SearchResult {
  id: string;
  label: string;
  sub: string;
  kind: "item" | "customer" | "bill";
}
