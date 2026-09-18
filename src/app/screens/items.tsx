import React, { useRef, useState } from "react";
import { Search, Plus, Edit3, Trash2, Filter, Download, Upload, Eye, Tag, ToggleLeft, ToggleRight, ArrowLeft, ImagePlus } from "lucide-react";
import { GlassCard, PrimaryButton, Badge, TextInput, SelectInput, Field, SectionHeader, ResponsiveTable, ConfirmDialog, EmptyState, ProductThumb } from "../components/shared";
import { ITEM_TYPES, fmt, genId } from "../data";
import type { Product, ItemType, Screen, Lang } from "../types";

// CSV columns used by both Export and Import — keep these two in sync.
const CSV_COLUMNS: (keyof Product)[] = [
  "id", "nameEn", "nameTa", "typeId", "sku", "barcode",
  "purchasePrice", "price", "wholesalePrice", "stock", "minStock", "unit", "gst", "active",
];

function productsToCsv(products: Product[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = products.map(p => CSV_COLUMNS.map(col => {
    const v = (p as any)[col];
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(","));
  return [header, ...rows].join("\n");
}

// Small, dependency-free CSV line splitter that understands quoted fields
// (so item names containing a comma don't break the columns).
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { cur += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { out.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function csvToProducts(text: string): Product[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map(h => h.trim());
  const rows = lines.slice(1);
  return rows.map(line => {
    const cells = splitCsvLine(line);
    const rec: any = {};
    header.forEach((col, i) => { rec[col] = cells[i]; });
    return {
      id: genId(), // always assign a fresh id so imports never collide with existing items
      nameEn: rec.nameEn || "Unnamed Item",
      nameTa: rec.nameTa || rec.nameEn || "Unnamed Item",
      typeId: rec.typeId || ITEM_TYPES[0].id,
      sku: rec.sku || `SKU-${genId().toUpperCase()}`,
      barcode: rec.barcode || "",
      purchasePrice: Number(rec.purchasePrice) || 0,
      price: Number(rec.price) || 0,
      wholesalePrice: Number(rec.wholesalePrice) || 0,
      stock: Number(rec.stock) || 0,
      minStock: Number(rec.minStock) || 0,
      unit: rec.unit || "pcs",
      gst: Number(rec.gst) || 0,
      image: "",
      active: String(rec.active ?? "true").trim().toLowerCase() !== "false",
    } as Product;
  });
}

function downloadTextFile(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function ItemsScreen({ navigate, t, lang, products, setProducts, onAdd, onEdit }: {
  navigate: (s: Screen) => void; t: (k: string) => string; lang: Lang;
  products: Product[]; setProducts: (p: Product[]) => void;
  onAdd: () => void; onEdit: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const filtered = products.filter(p =>
    (typeFilter === "All" || p.typeId === typeFilter) &&
    (p.nameEn.toLowerCase().includes(search.toLowerCase()) || p.nameTa.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );
  const typeName = (id: string) => { const it = ITEM_TYPES.find(x => x.id === id); return it ? (lang === "ta" ? it.nameTa : it.nameEn) : id; };

  const handleExport = () => {
    const csv = productsToCsv(products);
    downloadTextFile(csv, `items-export-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = csvToProducts(String(reader.result || ""));
        if (imported.length === 0) {
          alert(lang === "ta" ? "இறக்குமதி செய்ய பொருட்கள் இல்லை. CSV வடிவமைப்பை சரிபார்க்கவும்." : "No items found to import. Please check the CSV format.");
          return;
        }
        setProducts([...products, ...imported]);
        alert(lang === "ta" ? `${imported.length} பொருட்கள் இறக்குமதி செய்யப்பட்டன.` : `${imported.length} item(s) imported successfully.`);
      } catch (err) {
        console.error(err);
        alert(lang === "ta" ? "இறக்குமதி தோல்வியடைந்தது." : "Import failed — please check the file and try again.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-1" style={{ background: "var(--input-background)", border: "1.5px solid var(--border)" }}>
          <Search size={16} style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search") + "..."} className="flex-1 text-sm bg-transparent outline-none" />
        </div>
        <SelectInput value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="md:!w-48">
          <option value="All">{t("all")}</option>
          {ITEM_TYPES.map(it => <option key={it.id} value={it.id}>{lang === "ta" ? it.nameTa : it.nameEn}</option>)}
        </SelectInput>
        <div className="flex gap-2">
          <input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ""; }} />
          <PrimaryButton variant="ghost" className="!py-2.5" onClick={() => importInputRef.current?.click()}><Upload size={14} /> {t("import")}</PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5" onClick={handleExport}><Download size={14} /> {t("export")}</PrimaryButton>
          <PrimaryButton onClick={onAdd} className="!py-2.5"><Plus size={14} /> {t("add")}</PrimaryButton>
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Tag} title="No items found" /> : (
        <>
          <ResponsiveTable columns={["", t("itemName"), t("itemType"), t("purchasePrice"), t("sellingPrice"), t("wholesalePrice"), t("stock"), t("gst"), t("status"), t("actions")]}>
            {filtered.map(p => (
              <tr key={p.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-2.5"><ProductThumb id={p.id} className="w-9 h-9 rounded-lg" /></td>
                <td className="px-4 py-2.5">
                  <p className="font-semibold">{lang === "ta" ? p.nameTa : p.nameEn}</p>
                  <p className="text-[11px]" style={{ color: "var(--muted-foreground)", fontFamily: "'JetBrains Mono', monospace" }}>{p.sku}</p>
                </td>
                <td className="px-4 py-2.5">{typeName(p.typeId)}</td>
                <td className="px-4 py-2.5">{fmt(p.purchasePrice)}</td>
                <td className="px-4 py-2.5 font-semibold">{fmt(p.price)}</td>
                <td className="px-4 py-2.5">{fmt(p.wholesalePrice)}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={p.stock <= p.minStock ? "danger" : "success"}>{p.stock} {p.unit}</Badge>
                </td>
                <td className="px-4 py-2.5">{p.gst}%</td>
                <td className="px-4 py-2.5"><Badge tone={p.active ? "success" : "muted"}>{p.active ? t("active") : t("inactive")}</Badge></td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-500"><Eye size={14} /></button>
                    <button onClick={() => onEdit(p.id)} className="text-amber-500"><Edit3 size={14} /></button>
                    <button onClick={() => setToDelete(p.id)} className="text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </ResponsiveTable>

          <div className="md:hidden flex flex-col gap-2">
            {filtered.map(p => (
              <GlassCard key={p.id} className="p-3 flex items-center gap-3">
                <ProductThumb id={p.id} className="w-12 h-12 rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{lang === "ta" ? p.nameTa : p.nameEn}</p>
                  <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{typeName(p.typeId)} · {fmt(p.price)}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge tone={p.stock <= p.minStock ? "danger" : "success"}>{p.stock} {p.unit}</Badge>
                    <Badge tone={p.active ? "success" : "muted"}>{p.active ? t("active") : t("inactive")}</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => onEdit(p.id)} className="text-amber-500"><Edit3 size={15} /></button>
                  <button onClick={() => setToDelete(p.id)} className="text-red-500"><Trash2 size={15} /></button>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog open={!!toDelete} title={t("areYouSure")} message={t("delete") + " " + t("item") + "?"} onCancel={() => setToDelete(null)} onConfirm={() => { setProducts(products.filter(p => p.id !== toDelete)); setToDelete(null); }} danger t={t} />
    </div>
  );
}

const UNIT_OPTIONS = ["kg", "ltr", "pack", "bottle", "pcs"];
const GST_OPTIONS = [0, 5, 12, 18];

function emptyProduct(): Product {
  return {
    id: genId(), nameEn: "", nameTa: "", typeId: ITEM_TYPES[0].id, sku: "", barcode: "",
    purchasePrice: 0, price: 0, wholesalePrice: 0, stock: 0, minStock: 0,
    unit: UNIT_OPTIONS[0], gst: 0, image: "", active: true,
  };
}

export function ItemFormScreen({ navigate, t, lang, products, setProducts, editingProductId }: {
  navigate: (s: Screen) => void; t: (k: string) => string; lang: Lang;
  products: Product[]; setProducts: (p: Product[]) => void; editingProductId: string | null;
}) {
  const existing = editingProductId ? products.find(p => p.id === editingProductId) : null;
  const [form, setForm] = useState<Product>(existing ? { ...existing } : emptyProduct());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!existing;
  const isTa = lang === "ta";

  const update = <K extends keyof Product>(key: K, value: Product[K]) => setForm(f => ({ ...f, [key]: value }));

  const handleImagePick = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => update("image", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.nameEn.trim()) {
      alert(isTa ? "பொருள் பெயரை உள்ளிடவும்." : "Please enter the item name.");
      return;
    }
    const cleaned: Product = {
      ...form,
      nameEn: form.nameEn.trim(),
      nameTa: form.nameTa.trim() || form.nameEn.trim(),
      sku: form.sku.trim() || `SKU-${form.id.toUpperCase()}`,
    };
    if (isEditing) {
      setProducts(products.map(p => p.id === cleaned.id ? cleaned : p));
    } else {
      setProducts([...products, cleaned]);
    }
    navigate("items");
  };

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <button onClick={() => navigate("items")} className="flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft size={14} /> {t("itemManagement")}
      </button>
      <GlassCard className="p-5 md:p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("itemName")}><TextInput value={form.nameEn} onChange={e => update("nameEn", e.target.value)} placeholder="e.g. Sambar Masala Powder" /></Field>
          <Field label={t("tamilItemName")}><TextInput value={form.nameTa} onChange={e => update("nameTa", e.target.value)} placeholder="எ.கா. சாம்பார் மசாலா தூள்" /></Field>
          <Field label={t("itemType")}>
            <SelectInput value={form.typeId} onChange={e => update("typeId", e.target.value)}>
              {ITEM_TYPES.map(it => <option key={it.id} value={it.id}>{it.nameEn}</option>)}
            </SelectInput>
          </Field>
          <Field label={t("unit")}>
            <SelectInput value={form.unit} onChange={e => update("unit", e.target.value)}>
              {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
            </SelectInput>
          </Field>
          <Field label={t("skuCode")}><TextInput value={form.sku} onChange={e => update("sku", e.target.value)} placeholder="MS-007" /></Field>
          <Field label={t("barcode")}><TextInput value={form.barcode} onChange={e => update("barcode", e.target.value)} placeholder="8901030800" /></Field>
          <Field label={t("purchasePrice")}><TextInput type="number" value={form.purchasePrice || ""} onChange={e => update("purchasePrice", Number(e.target.value) || 0)} placeholder="0" /></Field>
          <Field label={t("sellingPrice")}><TextInput type="number" value={form.price || ""} onChange={e => update("price", Number(e.target.value) || 0)} placeholder="0" /></Field>
          <Field label={t("wholesalePrice")}><TextInput type="number" value={form.wholesalePrice || ""} onChange={e => update("wholesalePrice", Number(e.target.value) || 0)} placeholder="0" /></Field>
          <Field label={t("gst")}>
            <SelectInput value={String(form.gst)} onChange={e => update("gst", Number(e.target.value))}>
              {GST_OPTIONS.map(g => <option key={g} value={g}>{g}%</option>)}
            </SelectInput>
          </Field>
          <Field label={t("openingStock")}><TextInput type="number" value={form.stock || ""} onChange={e => update("stock", Number(e.target.value) || 0)} placeholder="0" /></Field>
          <Field label={t("minimumStock")}><TextInput type="number" value={form.minStock || ""} onChange={e => update("minStock", Number(e.target.value) || 0)} placeholder="0" /></Field>
        </div>

        <div className="mt-4">
          <Field label={t("itemImage")}>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImagePick(f); e.target.value = ""; }} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center h-28 w-full rounded-2xl border-2 border-dashed text-xs overflow-hidden"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              {form.image ? (
                <img src={form.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex items-center gap-1.5"><ImagePlus size={14} /> {t("itemImage")} — {t("add")}</span>
              )}
            </button>
          </Field>
        </div>

        <div className="flex items-center justify-between mt-4 py-2">
          <span className="text-sm font-semibold">{form.active ? t("active") : t("inactive")}</span>
          <button onClick={() => update("active", !form.active)} className="w-11 h-6 rounded-full relative" style={{ background: form.active ? "var(--success)" : "var(--muted)" }}>
            <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: form.active ? 22 : 2 }} />
          </button>
        </div>

        <div className="flex gap-3 mt-4">
          <PrimaryButton variant="ghost" onClick={() => navigate("items")} className="flex-1">{t("cancel")}</PrimaryButton>
          <PrimaryButton onClick={handleSave} className="flex-1">{t("save")}</PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}

export function ItemTypesScreen({ t, lang }: { t: (k: string) => string; lang: Lang }) {
  const [types, setTypes] = useState<ItemType[]>(ITEM_TYPES);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <div className="flex justify-end mb-3">
        <PrimaryButton onClick={() => setAdding(!adding)}><Plus size={15} /> {t("add")}</PrimaryButton>
      </div>
      {adding && (
        <GlassCard className="p-4 mb-4 flex gap-2 items-end max-w-md">
          <div className="flex-1"><Field label={t("itemType")}><TextInput value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Dry Fruits" /></Field></div>
          <PrimaryButton onClick={() => { if (newName.trim()) { setTypes([...types, { id: genId(), nameEn: newName, nameTa: newName, itemCount: 0, active: true }]); setNewName(""); setAdding(false); } }}>{t("save")}</PrimaryButton>
        </GlassCard>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {types.map(it => (
          <GlassCard key={it.id} className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--secondary)" }}><Tag size={16} style={{ color: "var(--primary)" }} /></div>
              <button onClick={() => setTypes(types.map(x => x.id === it.id ? { ...x, active: !x.active } : x))}>
                {it.active ? <ToggleRight size={22} style={{ color: "var(--success)" }} /> : <ToggleLeft size={22} style={{ color: "var(--muted-foreground)" }} />}
              </button>
            </div>
            <p className="text-sm font-bold">{lang === "ta" ? it.nameTa : it.nameEn}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{it.itemCount} {t("items")}</p>
            <div className="flex gap-2 mt-1">
              <button className="flex-1 text-xs font-semibold py-1.5 rounded-xl" style={{ background: "var(--muted)" }}><Edit3 size={12} className="inline mr-1" />{t("edit")}</button>
              <button onClick={() => setToDelete(it.id)} className="flex-1 text-xs font-semibold py-1.5 rounded-xl" style={{ background: "rgba(220,38,38,0.1)", color: "var(--destructive)" }}><Trash2 size={12} className="inline mr-1" />{t("delete")}</button>
            </div>
          </GlassCard>
        ))}
      </div>
      <ConfirmDialog open={!!toDelete} title={t("areYouSure")} message={t("delete") + "?"} onCancel={() => setToDelete(null)} onConfirm={() => { setTypes(types.filter(x => x.id !== toDelete)); setToDelete(null); }} danger t={t} />
    </div>
  );
}
