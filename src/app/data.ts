import type { ItemType, Product, Customer, LedgerEntry, Bill, DeletedBill, HeldBill, AppNotification } from "./types";

const img = (seed: string) => `https://images.unsplash.com/${seed}?w=160&h=160&fit=crop&auto=format`;

export const ITEM_TYPES: ItemType[] = [
  { id: "t1", nameEn: "Masala Items", nameTa: "மசாலா பொருட்கள்", itemCount: 6, active: true },
  { id: "t2", nameEn: "Nuts Items", nameTa: "நட்ஸ் பொருட்கள்", itemCount: 4, active: true },
  { id: "t3", nameEn: "Rice & Grains", nameTa: "அரிசி & தானியங்கள்", itemCount: 3, active: true },
  { id: "t4", nameEn: "Sweets & Snacks", nameTa: "இனிப்பு & சிற்றுண்டி", itemCount: 3, active: true },
  { id: "t5", nameEn: "Oil & Ghee", nameTa: "எண்ணெய் & நெய்", itemCount: 2, active: true },
];

export const PRODUCTS: Product[] = [
  { id: "p1", nameEn: "Sambar Masala Powder", nameTa: "சாம்பார் மசாலா தூள்", typeId: "t1", sku: "MS-001", barcode: "8901030811", purchasePrice: 180, price: 240, wholesalePrice: 210, stock: 8, minStock: 15, unit: "kg", gst: 5, image: img("photo-1596040033229-a9821ebd058d"), active: true },
  { id: "p2", nameEn: "Turmeric Powder", nameTa: "மஞ்சள் தூள்", typeId: "t1", sku: "MS-002", barcode: "8901030812", purchasePrice: 140, price: 190, wholesalePrice: 165, stock: 42, minStock: 15, unit: "kg", gst: 5, image: img("photo-1615485500834-bc10199bc727"), active: true },
  { id: "p3", nameEn: "Chilli Powder", nameTa: "மிளகாய் தூள்", typeId: "t1", sku: "MS-003", barcode: "8901030813", purchasePrice: 210, price: 280, wholesalePrice: 245, stock: 27, minStock: 15, unit: "kg", gst: 5, image: img("photo-1583119912267-cc97c911e416"), active: true },
  { id: "p4", nameEn: "Garam Masala", nameTa: "கரம் மசாலா", typeId: "t1", sku: "MS-004", barcode: "8901030814", purchasePrice: 260, price: 340, wholesalePrice: 300, stock: 19, minStock: 10, unit: "kg", gst: 5, image: img("photo-1599909533144-b062d3c56613"), active: true },
  { id: "p5", nameEn: "Coriander Powder", nameTa: "மல்லி தூள்", typeId: "t1", sku: "MS-005", barcode: "8901030815", purchasePrice: 120, price: 165, wholesalePrice: 145, stock: 33, minStock: 15, unit: "kg", gst: 5, image: img("photo-1599940824399-b87987ceb72a"), active: true },
  { id: "p6", nameEn: "Rasam Powder", nameTa: "ரசம் தூள்", typeId: "t1", sku: "MS-006", barcode: "8901030816", purchasePrice: 190, price: 250, wholesalePrice: 220, stock: 12, minStock: 15, unit: "kg", gst: 5, image: img("photo-1608571423902-eed4a5ad8108"), active: true },

  { id: "p7", nameEn: "Cashew Nuts (W240)", nameTa: "முந்திரி பருப்பு", typeId: "t2", sku: "NT-001", barcode: "8901030821", purchasePrice: 620, price: 780, wholesalePrice: 720, stock: 6, minStock: 10, unit: "kg", gst: 12, image: img("photo-1563412885-e335dc95c69e"), active: true },
  { id: "p8", nameEn: "Almonds", nameTa: "பாதாம்", typeId: "t2", sku: "NT-002", barcode: "8901030822", purchasePrice: 560, price: 700, wholesalePrice: 650, stock: 21, minStock: 10, unit: "kg", gst: 12, image: img("photo-1508061253366-f7da158b6d46"), active: true },
  { id: "p9", nameEn: "Pistachios", nameTa: "பிஸ்தா", typeId: "t2", sku: "NT-003", barcode: "8901030823", purchasePrice: 780, price: 950, wholesalePrice: 890, stock: 14, minStock: 8, unit: "kg", gst: 12, image: img("photo-1590080876359-4a2eb9026cea"), active: true },
  { id: "p10", nameEn: "Groundnuts", nameTa: "வேர்க்கடலை", typeId: "t2", sku: "NT-004", barcode: "8901030824", purchasePrice: 95, price: 130, wholesalePrice: 115, stock: 58, minStock: 20, unit: "kg", gst: 5, image: img("photo-1567892737950-30c4db37cd89"), active: true },

  { id: "p11", nameEn: "Ponni Boiled Rice", nameTa: "பொன்னி புழுங்கல் அரிசி", typeId: "t3", sku: "RG-001", barcode: "8901030831", purchasePrice: 42, price: 52, wholesalePrice: 47, stock: 340, minStock: 100, unit: "kg", gst: 0, image: img("photo-1586201375761-83865001e31c"), active: true },
  { id: "p12", nameEn: "Idli Rice", nameTa: "இட்லி அரிசி", typeId: "t3", sku: "RG-002", barcode: "8901030832", purchasePrice: 45, price: 56, wholesalePrice: 50, stock: 210, minStock: 100, unit: "kg", gst: 0, image: img("photo-1516684732162-798a0062be99"), active: true },
  { id: "p13", nameEn: "Toor Dal", nameTa: "துவரம் பருப்பு", typeId: "t3", sku: "RG-003", barcode: "8901030833", purchasePrice: 110, price: 145, wholesalePrice: 128, stock: 9, minStock: 20, unit: "kg", gst: 0, image: img("photo-1615485925600-97237c4fc1ec"), active: true },

  { id: "p14", nameEn: "Murukku (500g)", nameTa: "முறுக்கு (500g)", typeId: "t4", sku: "SW-001", barcode: "8901030841", purchasePrice: 75, price: 110, wholesalePrice: 95, stock: 4, minStock: 10, unit: "pack", gst: 5, image: img("photo-1601050690597-df0568f70950"), active: true },
  { id: "p15", nameEn: "Mysore Pak (500g)", nameTa: "மைசூர் பாகு (500g)", typeId: "t4", sku: "SW-002", barcode: "8901030842", purchasePrice: 120, price: 170, wholesalePrice: 150, stock: 16, minStock: 10, unit: "pack", gst: 5, image: img("photo-1606471191009-63994c53433b"), active: true },
  { id: "p16", nameEn: "Thattai (500g)", nameTa: "தட்டை (500g)", typeId: "t4", sku: "SW-003", barcode: "8901030843", purchasePrice: 68, price: 98, wholesalePrice: 85, stock: 22, minStock: 10, unit: "pack", gst: 5, image: img("photo-1621939514649-280e2ee25f60"), active: true },

  { id: "p17", nameEn: "Groundnut Oil (1L)", nameTa: "வேர்க்கடலை எண்ணெய் (1L)", typeId: "t5", sku: "OL-001", barcode: "8901030851", purchasePrice: 165, price: 205, wholesalePrice: 188, stock: 3, minStock: 15, unit: "ltr", gst: 5, image: img("photo-1474979266404-7eaacbcd87c5"), active: true },
  { id: "p18", nameEn: "Pure Ghee (500ml)", nameTa: "தூய நெய் (500ml)", typeId: "t5", sku: "OL-002", barcode: "8901030852", purchasePrice: 320, price: 410, wholesalePrice: 375, stock: 25, minStock: 10, unit: "bottle", gst: 12, image: img("photo-1631206753348-db44968fd440"), active: true },
];

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Arjun Stores", mobile: "+91 98765 43210", address: "Anna Nagar, Chennai", gstNumber: "33ABCDE1234F1Z5", openingBalance: 5000, creditLimit: 50000, balance: 18450, lastPaymentDate: "2026-09-10" },
  { id: "c2", name: "Priya Traders", mobile: "+91 87654 32109", address: "Gandhipuram, Coimbatore", gstNumber: "33PQRST5678G1Z2", openingBalance: 0, creditLimit: 30000, balance: 6200, lastPaymentDate: "2026-09-12" },
  { id: "c3", name: "Rohit Supermarket", mobile: "+91 76543 21098", address: "T. Nagar, Chennai", openingBalance: 2000, creditLimit: 75000, balance: 32800, lastPaymentDate: "2026-09-05" },
  { id: "c4", name: "Sneha General Store", mobile: "+91 65432 10987", address: "Salem Main Road", openingBalance: 0, creditLimit: 20000, balance: 0, lastPaymentDate: "2026-09-14" },
  { id: "c5", name: "Vikram Wholesale Mart", mobile: "+91 54321 09876", address: "Madurai Bypass", gstNumber: "33VIKRM9012H1Z9", openingBalance: 8000, creditLimit: 100000, balance: 54700, lastPaymentDate: "2026-08-28" },
  { id: "c6", name: "Lakshmi Kirana", mobile: "+91 90000 11122", address: "Trichy Road, Erode", openingBalance: 0, creditLimit: 25000, balance: 4100, lastPaymentDate: "2026-09-13" },
];

export const LEDGER: LedgerEntry[] = [
  { id: "l1", customerId: "c1", date: "2026-09-01", billNo: "SMF-1042", description: "Sale (Credit)", debit: 12400, credit: 0, balance: 12400 },
  { id: "l2", customerId: "c1", date: "2026-09-04", billNo: "SMF-1058", description: "Sale (Credit)", debit: 8200, credit: 0, balance: 20600 },
  { id: "l3", customerId: "c1", date: "2026-09-10", description: "Payment Received (UPI)", debit: 0, credit: 2150, balance: 18450 },
  { id: "l4", customerId: "c2", date: "2026-09-06", billNo: "SMF-1065", description: "Sale (Credit)", debit: 6200, credit: 0, balance: 6200 },
  { id: "l5", customerId: "c3", date: "2026-08-29", billNo: "SMF-1011", description: "Sale (Credit)", debit: 21800, credit: 0, balance: 21800 },
  { id: "l6", customerId: "c3", date: "2026-09-02", billNo: "SMF-1039", description: "Sale (Credit)", debit: 15000, credit: 0, balance: 36800 },
  { id: "l7", customerId: "c3", date: "2026-09-05", description: "Payment Received (Cash)", debit: 0, credit: 4000, balance: 32800 },
];

export const BILLS: Bill[] = [
  { id: "b1", billNo: "SMF-1102", type: "retail", customerId: "c4", customerName: "Sneha General Store", date: "2026-09-16 09:20", items: [], subtotal: 3400, discount: 0, gst: 170, total: 3570, received: 3570, balance: 0, paymentMethod: "upi", gstEnabled: true, status: "paid" },
  { id: "b2", billNo: "SMF-1101", type: "retail", customerId: null, customerName: "Walk-in Customer", date: "2026-09-16 08:55", items: [], subtotal: 890, discount: 40, gst: 42, total: 892, received: 900, balance: 0, paymentMethod: "cash", gstEnabled: true, status: "paid" },
  { id: "b3", billNo: "SMF-1100", type: "wholesale", customerId: "c5", customerName: "Vikram Wholesale Mart", date: "2026-09-15 18:10", items: [], subtotal: 24500, discount: 500, gst: 0, total: 24000, received: 10000, balance: 14000, paymentMethod: "credit", gstEnabled: false, status: "partial" },
  { id: "b4", billNo: "SMF-1099", type: "retail", customerId: "c6", customerName: "Lakshmi Kirana", date: "2026-09-15 16:40", items: [], subtotal: 4100, discount: 0, gst: 205, total: 4305, received: 0, balance: 4305, paymentMethod: "credit", gstEnabled: true, status: "credit" },
  { id: "b5", billNo: "SMF-1098", type: "retail", customerId: "c2", customerName: "Priya Traders", date: "2026-09-15 14:05", items: [], subtotal: 6200, discount: 0, gst: 0, total: 6200, received: 0, balance: 6200, paymentMethod: "credit", gstEnabled: false, status: "credit" },
];

export const DELETED_BILLS: DeletedBill[] = [
  { id: "d1", billNo: "SMF-1087", date: "2026-09-13", customerName: "Walk-in Customer", amount: 560, deletedBy: "Raghu (Admin)", deletedDate: "2026-09-13 19:22", reason: "Duplicate entry" },
  { id: "d2", billNo: "SMF-1072", date: "2026-09-11", customerName: "Rohit Supermarket", amount: 8900, deletedBy: "Billing Operator", deletedDate: "2026-09-11 12:05", reason: "Wrong customer selected" },
];

export const HELD_BILLS: HeldBill[] = [
  { id: "h1", billNo: "HOLD-014", customerName: "Walk-in Customer", items: [], total: 1240, createdAt: "2026-09-16 10:05" },
  { id: "h2", billNo: "HOLD-013", customerName: "Arjun Stores", items: [], total: 5680, createdAt: "2026-09-16 09:40" },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", titleEn: "Cashew Nuts stock critically low (6 kg left)", titleTa: "முந்திரி பருப்பு கையிருப்பு மிகக் குறைவு (6 கிலோ)", time: "10 min ago", read: false, kind: "stock" },
  { id: "n2", titleEn: "Payment of ₹2,150 received from Arjun Stores", titleTa: "Arjun Stores இடமிருந்து ₹2,150 பணம் பெறப்பட்டது", time: "1 hr ago", read: false, kind: "payment" },
  { id: "n3", titleEn: "Backup completed successfully", titleTa: "காப்புப்பிரதி வெற்றிகரமாக முடிந்தது", time: "3 hr ago", read: true, kind: "backup" },
  { id: "n4", titleEn: "Thermal printer disconnected", titleTa: "தெர்மல் பிரிண்டர் துண்டிக்கப்பட்டது", time: "5 hr ago", read: true, kind: "printer" },
  { id: "n5", titleEn: "New wholesale bill SMF-1100 created", titleTa: "புதிய மொத்த விற்பனை பில் SMF-1100 உருவாக்கப்பட்டது", time: "Yesterday", read: true, kind: "bill" },
];

export const DAILY_SALES = [
  { day: "Mon", revenue: 18400, bills: 34 },
  { day: "Tue", revenue: 22200, bills: 42 },
  { day: "Wed", revenue: 19600, bills: 38 },
  { day: "Thu", revenue: 26800, bills: 51 },
  { day: "Fri", revenue: 34200, bills: 64 },
  { day: "Sat", revenue: 41900, bills: 78 },
  { day: "Sun", revenue: 30400, bills: 55 },
];

export const MONTHLY_SALES = [
  { month: "Feb", revenue: 512000 }, { month: "Mar", revenue: 489000 },
  { month: "Apr", revenue: 598000 }, { month: "May", revenue: 621000 },
  { month: "Jun", revenue: 587000 }, { month: "Jul", revenue: 645000 },
  { month: "Aug", revenue: 712000 }, { month: "Sep", revenue: 388000 },
];

export const PAYMENT_SPLIT = [
  { name: "Cash", value: 38, color: "var(--chart-1)" },
  { name: "UPI", value: 34, color: "var(--chart-2)" },
  { name: "Card", value: 12, color: "var(--chart-3)" },
  { name: "Credit", value: 16, color: "var(--chart-4)" },
];

export const TOP_ITEMS = [
  { name: "Ponni Boiled Rice", units: 420 },
  { name: "Turmeric Powder", units: 310 },
  { name: "Chilli Powder", units: 265 },
  { name: "Groundnuts", units: 240 },
  { name: "Pure Ghee (500ml)", units: 198 },
];

export const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const fmtK = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;
export const genId = () => Math.random().toString(36).slice(2, 10);
