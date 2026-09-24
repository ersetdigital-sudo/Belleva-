"use client";

import { useMemo, useState } from "react";

import { categoryGradient } from "@/data/categories";
import { saveProductPricesAction } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { priceKey, type PriceOverrides } from "@/lib/products";
import type { CategoryIconId, ProductGroup, ProductItem } from "@/types";

import { CategoryIcon, GridIcon, MenuIcon, SearchIcon } from "@/components/icons";

interface Card {
  key: string;
  name: string;
  meta?: string;
  groupId: string;
  groupLabel: string;
  vendorLabel?: string;
  icon: CategoryIconId;
  gradient: string;
  price: number;
  shipped: number;
  original?: number;
}

const PILL = (active: boolean) =>
  cn(
    "flex min-h-10 shrink-0 items-center gap-2 rounded-pill px-4 text-sm font-semibold whitespace-nowrap transition",
    active ? "blue-grad text-white shadow-soft" : "card text-muted hover:border-line-2 hover:text-brand",
  );

const FIELD =
  "w-full rounded-xl border border-line px-3.5 py-2.5 text-sm font-semibold outline-none transition focus:border-brand";

function buildCards(group: ProductGroup, vendorId: string | undefined, prices: PriceOverrides, defaults: PriceOverrides): Card[] {
  const vendors = group.vendors ?? [];
  const vendor = vendors.length ? (vendors.find((entry) => entry.id === vendorId) ?? vendors[0]) : undefined;
  const items: ProductItem[] = vendors.length ? (vendor?.items ?? []) : (group.items ?? []);

  return items.map((item) => {
    const key = priceKey(group.id, vendor?.id, item.id);
    return {
      key,
      name: `${item.name}${item.headline ? ` ${item.headline}` : ""}`.trim(),
      meta: item.meta,
      groupId: group.id,
      groupLabel: group.label,
      vendorLabel: vendor?.label,
      icon: group.icon,
      gradient: categoryGradient(group.icon),
      price: prices[key] ?? item.price,
      shipped: defaults[key] ?? item.price,
      original: item.originalPrice,
    };
  });
}

/**
 * Product catalogue editor.
 *
 * Laid out like the products-catalog dashboard wireframe: a title row with a
 * grid/list switch and a sort, pills per catalogue group carrying their item
 * count, a filter rail, and the prices themselves as cards.
 *
 * What the wireframe shows that this deliberately does not: product photos,
 * ratings, sold counts and stock levels. Belleva sells nominals, not stocked
 * goods, so there is nothing real to put in those slots — the card shows the
 * catalogue's own gradient and icon instead, the same treatment the mobile
 * recommendations use.
 */
export function PriceEditor({
  groups,
  defaults,
  overriddenCount,
}: {
  groups: ProductGroup[];
  defaults: PriceOverrides;
  overriddenCount: number;
}) {
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [vendorId, setVendorId] = useState<string | undefined>(groups[0]?.vendors?.[0]?.id);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("catalog");
  const [search, setSearch] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [prices, setPrices] = useState<PriceOverrides>(() => {
    const effective: PriceOverrides = { ...defaults };
    for (const group of groups) {
      for (const vendor of group.vendors ?? []) {
        for (const item of vendor.items ?? []) effective[priceKey(group.id, vendor.id, item.id)] = item.price;
      }
      for (const item of group.items ?? []) effective[priceKey(group.id, undefined, item.id)] = item.price;
    }
    return effective;
  });

  const group = groups.find((entry) => entry.id === groupId) ?? groups[0];
  const vendors = group.vendors ?? [];
  const activeVendorId = vendors.length
    ? (vendors.find((entry) => entry.id === vendorId)?.id ?? vendors[0].id)
    : undefined;

  const countsFor = (entry: ProductGroup) =>
    (entry.items ?? entry.vendors?.[0]?.items ?? []).length;

  const cards = useMemo(() => {
    const base = buildCards(group, activeVendorId, prices, defaults);
    const term = search.trim().toLowerCase();
    const filtered = base.filter((card) => {
      if (onlyChanged && card.price === card.shipped) return false;
      if (!term) return true;
      return `${card.name} ${card.vendorLabel ?? ""} ${card.groupLabel}`.toLowerCase().includes(term);
    });
    if (sort === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price") return [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "changed") {
      return [...filtered].sort((a, b) => Number(b.price !== b.shipped) - Number(a.price !== a.shipped));
    }
    return filtered;
  }, [group, activeVendorId, prices, defaults, search, onlyChanged, sort]);

  const totalItems = groups.reduce((sum, entry) => sum + countsFor(entry), 0);
  const changedTotal = Object.keys(prices).filter((key) => prices[key] !== (defaults[key] ?? prices[key])).length;
  const changedHere = cards.filter((card) => card.price !== card.shipped).length;

  async function save() {
    setBusy(true);
    setMessage(null);
    const result = await saveProductPricesAction(prices);
    setBusy(false);
    setMessage(
      result.ok
        ? { ok: true, text: `Tersimpan — ${result.changed ?? 0} harga di luar bawaan, dan situs langsung memakainya.` }
        : { ok: false, text: result.message ?? "Gagal menyimpan." },
    );
  }

  function setPrice(key: string, value: string) {
    const next = Number(value.replace(/\D/g, "")) || 0;
    setPrices((prev) => ({ ...prev, [key]: next }));
  }

  return (
    <div className="space-y-6">
      {/* ---------------------------- Title row ---------------------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="h-display text-xl font-extrabold">Katalog produk</h3>
          <p className="mt-1 text-sm text-muted">
            Menampilkan {cards.length} dari {totalItems} harga
            {changedTotal > 0 ? ` · ${changedTotal} di luar bawaan` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Tampilan" className="card flex overflow-hidden rounded-pill">
            {(["grid", "list"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
                aria-label={option === "grid" ? "Tampilan grid" : "Tampilan daftar"}
                className={cn(
                  "grid h-10 w-10 place-items-center transition-colors",
                  view === option ? "bg-soft text-brand" : "text-muted hover:text-brand",
                )}
              >
                {option === "grid" ? <GridIcon size={18} /> : <MenuIcon />}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Urutkan"
            className="card min-h-10 rounded-pill px-4 text-sm font-semibold text-ink outline-none"
          >
            <option value="catalog">Urutan katalog</option>
            <option value="name">Nama A–Z</option>
            <option value="price">Harga tertinggi</option>
            <option value="changed">Yang diubah dulu</option>
          </select>

          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="blue-grad inline-flex min-h-10 items-center rounded-pill px-5 text-sm font-bold text-white disabled:opacity-70"
          >
            {busy ? "Menyimpan…" : "Simpan harga"}
          </button>
        </div>
      </div>

      {/* --------------------------- Group pills --------------------------- */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {groups.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={entry.id === group.id}
            onClick={() => {
              setGroupId(entry.id);
              setVendorId(entry.vendors?.[0]?.id);
            }}
            className={PILL(entry.id === group.id)}
          >
            {entry.label}
            <span className={cn("rounded-pill px-1.5 text-[10px]", entry.id === group.id ? "bg-white/20" : "bg-soft")}>
              {countsFor(entry)}
            </span>
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:items-start lg:gap-6">
        {/* --------------------------- Filter rail -------------------------- */}
        <aside className="card mb-6 p-5 lg:mb-0">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold">Filter</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setOnlyChanged(false);
                setVendorId(vendors[0]?.id);
              }}
              className="text-xs font-semibold text-brand"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-soft px-3">
            <SearchIcon size={16} className="shrink-0 text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari di katalog…"
              aria-label="Cari harga"
              className="w-full min-w-0 bg-transparent py-2.5 text-sm font-semibold outline-none"
            />
          </div>

          {vendors.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold tracking-wider text-muted uppercase">
                {group.vendorLabel ?? "Vendor"}
              </p>
              <ul className="mt-2 space-y-0.5">
                {vendors.map((vendor) => (
                  <li key={vendor.id}>
                    <button
                      type="button"
                      aria-pressed={vendor.id === activeVendorId}
                      onClick={() => setVendorId(vendor.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        vendor.id === activeVendorId
                          ? "bg-soft font-semibold text-brand"
                          : "text-muted hover:bg-soft hover:text-brand",
                      )}
                    >
                      <span className="truncate">{vendor.label}</span>
                      <span className="text-[10px] text-muted">{(vendor.items ?? []).length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="mt-5 flex cursor-pointer items-center gap-2.5 border-t border-line-2 pt-4 text-sm font-semibold">
            <input
              type="checkbox"
              checked={onlyChanged}
              onChange={(event) => setOnlyChanged(event.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-line accent-[var(--color-brand)]"
            />
            Hanya yang diubah
          </label>
        </aside>

        {/* --------------------------- Price cards -------------------------- */}
        {cards.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-bold">Tidak ada harga yang cocok</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Longgarkan filternya, atau kosongkan kolom pencarian.
            </p>
          </div>
        ) : (
          <ul
            className={cn(
              "gap-4",
              view === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3" : "grid grid-cols-1",
            )}
          >
            {cards.map((card) => {
              const changed = card.price !== card.shipped;
              return (
                <li key={card.key} className="card flex h-full flex-col p-4">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                      style={{ background: card.gradient }}
                    >
                      <CategoryIcon id={card.icon} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink">{card.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {card.groupLabel}
                        {card.vendorLabel ? ` · ${card.vendorLabel}` : ""}
                      </span>
                    </span>

                    {changed && (
                      <span className="shrink-0 rounded-pill bg-warn/15 px-2 py-0.5 text-[10px] font-bold text-warn">
                        diubah
                      </span>
                    )}
                  </div>

                  {card.meta && <p className="mt-3 truncate text-xs text-muted">{card.meta}</p>}

                  <div className="mt-auto pt-4">
                    <label className="block">
                      <span className="text-[11px] font-semibold text-muted">Harga jual</span>
                      <span className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted">Rp</span>
                        <input
                          inputMode="numeric"
                          value={card.price}
                          onChange={(event) => setPrice(card.key, event.target.value)}
                          aria-label={`Harga ${card.name}`}
                          className={cn(FIELD, "text-right font-bold", changed && "border-brand")}
                        />
                      </span>
                    </label>
                    <p className="mt-2 text-[11px] text-muted">
                      bawaan {formatRupiah(card.shipped)}
                      {card.original ? ` · harga coret ${formatRupiah(card.original)}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="blue-grad inline-flex min-h-11 items-center rounded-pill px-6 text-sm font-bold text-white disabled:opacity-70"
        >
          {busy ? "Menyimpan…" : "Simpan harga"}
        </button>
        <span className="text-xs text-muted">{changedHere} harga di tampilan ini berbeda dari bawaan</span>
        {message && (
          <p role="status" className={cn("text-sm font-semibold", message.ok ? "text-success" : "text-danger")}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
