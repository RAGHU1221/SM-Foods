import React, { useState } from "react";
import { Search, Plus, Edit3, Trash2, Filter, Download, Upload, Eye, Tag, ToggleLeft, ToggleRight, ArrowLeft } from "lucide-react";
import { GlassCard, PrimaryButton, Badge, TextInput, SelectInput, Field, SectionHeader, ResponsiveTable, ConfirmDialog, EmptyState, ProductThumb } from "../components/shared";
import { PRODUCTS, ITEM_TYPES, fmt, genId } from "../data";
import type { Product, ItemType, Screen, Lang } from "../types";

export function ItemsScreen({ navigate, t, lang }: { navigate: (s: Screen) => void; t: (k: string) => string; lang: Lang }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const filtered = products.filter(p =>
    (typeFilter === "All" || p.typeId === typeFilter) &&
    (p.nameEn.toLowerCase().includes(search.toLowerCase()) || p.nameTa.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );
  const typeName = (id: string) => { const it = ITEM_TYPES.find(x => x.id === id); return it ? (lang === "ta" ? it.nameTa : it.nameEn) : id; };

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
          <PrimaryButton variant="ghost" className="!py-2.5"><Upload size={14} /> {t("import")}</PrimaryButton>
          <PrimaryButton variant="ghost" className="!py-2.5"><Download size={14} /> {t("export")}</PrimaryButton>
          <PrimaryButton onClick={() => navigate("itemform")} className="!py-2.5"><Plus size={14} /> {t("add")}</PrimaryButton>
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
                    <button className="text-amber-500"><Edit3 size={14} /></button>
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
                  <button className="text-amber-500"><Edit3 size={15} /></button>
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

export function ItemFormScreen({ navigate, t }: { navigate: (s: Screen) => void; t: (k: string) => string }) {
  const [active, setActive] = useState(true);
  return (
    <div className="flex flex-col pb-24 md:pb-8 px-4 md:px-6 pt-4 md:pt-5">
      <GlassCard className="p-5 md:p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("itemName")}><TextInput placeholder="e.g. Sambar Masala Powder" /></Field>
          <Field label={t("tamilItemName")}><TextInput placeholder="எ.கா. சாம்பார் மசாலா தூள்" /></Field>
          <Field label={t("itemType")}>
            <SelectInput>{ITEM_TYPES.map(it => <option key={it.id}>{it.nameEn}</option>)}</SelectInput>
          </Field>
          <Field label={t("unit")}>
            <SelectInput>{["kg", "ltr", "pack", "bottle", "pcs"].map(u => <option key={u}>{u}</option>)}</SelectInput>
          </Field>
          <Field label={t("skuCode")}><TextInput placeholder="MS-007" /></Field>
          <Field label={t("barcode")}><TextInput placeholder="8901030800" /></Field>
          <Field label={t("purchasePrice")}><TextInput type="number" placeholder="0" /></Field>
          <Field label={t("sellingPrice")}><TextInput type="number" placeholder="0" /></Field>
          <Field label={t("wholesalePrice")}><TextInput type="number" placeholder="0" /></Field>
          <Field label={t("gst")}>
            <SelectInput>{[0, 5, 12, 18].map(g => <option key={g}>{g}%</option>)}</SelectInput>
          </Field>
          <Field label={t("openingStock")}><TextInput type="number" placeholder="0" /></Field>
          <Field label={t("minimumStock")}><TextInput type="number" placeholder="0" /></Field>
        </div>

        <div className="mt-4">
          <Field label={t("itemImage")}>
            <div className="flex items-center justify-center h-28 rounded-2xl border-2 border-dashed text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              {t("itemImage")} — drag & drop or click to upload
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-between mt-4 py-2">
          <span className="text-sm font-semibold">{active ? t("active") : t("inactive")}</span>
          <button onClick={() => setActive(!active)} className="w-11 h-6 rounded-full relative" style={{ background: active ? "var(--success)" : "var(--muted)" }}>
            <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: active ? 22 : 2 }} />
          </button>
        </div>

        <div className="flex gap-3 mt-4">
          <PrimaryButton variant="ghost" onClick={() => navigate("items")} className="flex-1">{t("cancel")}</PrimaryButton>
          <PrimaryButton onClick={() => navigate("items")} className="flex-1">{t("save")}</PrimaryButton>
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
