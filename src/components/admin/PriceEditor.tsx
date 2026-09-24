"use client";

import { useMemo, useState } from "react";

import { categoryGradient } from "@/data/categories";
import { saveCatalogueAction } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { bucketKey, priceKey, type CatalogueOverrides, type PriceOverrides } from "@/lib/products";
import type { CategoryIconId, ProductGroup, ProductItem } from "@/types";

import { CategoryIcon, GridIcon, MenuIcon, PlusIcon, SearchIcon } from "@/components/icons";

import { RupiahInput } from "./RupiahInput";

interface Card {
  key: string;
  item: ProductItem;
  groupLabel: string;
  vendorLabel?: string;
  icon: CategoryIconId;
  gradient: string;
  shipped: boolean;
}

const PILL = (active: boolean) =>
  cn(
    "flex min-h-10 shrink-0 items-center gap-2 rounded-pill px-4 text-sm font-semibold whitespace-nowrap transition",
    active ? "blue-grad text-white shadow-soft" : "card text-muted hover:border-line-2 hover:text-brand",
  );

const FIELD =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-semibold outline-none transition focus:border-brand";

const EMPTY_DRAFT = { name: "", headline: "", meta: "", badge: "", price: 0 };

/**
 * Catalogue editor.
 *
 * Laid out like the products-catalog dashboard wireframe: a title row with the
 * grid/list switch, a sort and the add action; pills per catalogue group with
 * their item count; a filter rail; and the catalogue itself as cards.
 *
 * Money fields use `RupiahInput`, so prices read as Rp 1.234.567 while typing.
 *
 * What the wireframe shows that this deliberately does not: product photos,
 * ratings, sold counts and stock levels. Belleva sells nominals, not stocked
 * goods, so there is nothing real for those slots — the card carries the
 * catalogue's own gradient and icon instead.
 */
export function PriceEditor({
  groups,
  defaults,
  overrides,
}: {
  groups: ProductGroup[];
  defaults: PriceOverrides;
  overrides: CatalogueOverrides;
}) {
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [vendorId, setVendorId] = useState<string | undefined>(groups[0]?.vendors?.[0]?.id);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("catalog");
  const [search, setSearch] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [prices, setPrices] = useState<PriceOverrides>({ ...defaults });
  const [addedItems, setAddedItems] = useState(overrides.addedItems);
  const [hiddenItems, setHiddenItems] = useState<string[]>(overrides.hiddenItems);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const group = groups.find((entry) => entry.id === groupId) ?? groups[0];
  const vendors = group.vendors ?? [];
  const activeVendorId = vendors.length
    ? (vendors.find((entry) => entry.id === vendorId)?.id ?? vendors[0].id)
    : undefined;
  const bucket = bucketKey(group.id, activeVendorId);

  const countsFor = (entry: ProductGroup) => {
    const vendor = entry.vendors?.[0];
    const own = entry.items ?? vendor?.items ?? [];
    return own.length;
  };

  const cards = useMemo<Card[]>(() => {
    const vendor = vendors.find((entry) => entry.id === activeVendorId);
    const shipped: ProductItem[] = vendors.length ? (vendor?.items ?? []) : (group.items ?? []);

    const fromShipped = shipped.map((item) => {
      const key = priceKey(group.id, activeVendorId, item.id);
      const shippedPrice = defaults[key] ?? item.price;
      return {
        key,
        item: { ...item, price: prices[key] ?? item.price },
        groupLabel: group.label,
        vendorLabel: vendor?.label,
        icon: group.icon,
        gradient: categoryGradient(group.icon),
        shipped: true,
      };
    });

    const fromAdded = (addedItems[bucket] ?? []).map((item) => ({
      key: priceKey(group.id, activeVendorId, item.id),
      item: { ...item, price: prices[priceKey(group.id, activeVendorId, item.id)] ?? item.price },
      groupLabel: group.label,
      vendorLabel: vendor?.label,
      icon: group.icon,
      gradient: categoryGradient(group.icon),
      // An added item's own price is its baseline, so it is never "overridden".
      shipped: false,
    }));

    const term = search.trim().toLowerCase();
    const visible = [...fromShipped, ...fromAdded].filter((card) => {
      if (hiddenItems.includes(card.key)) return false;
      if (onlyChanged && card.shipped && card.item.price === (defaults[card.key] ?? card.item.price)) {
        return false;
      }
      if (!term) return true;
      return `${card.item.name} ${card.item.headline ?? ""} ${card.vendorLabel ?? ""} ${card.groupLabel}`
        .toLowerCase()
        .includes(term);
    });

    if (sort === "name") return [...visible].sort((a, b) => a.item.name.localeCompare(b.item.name));
    if (sort === "price") return [...visible].sort((a, b) => b.item.price - a.item.price);
    if (sort === "changed") {
      return [...visible].sort(
        (a, b) => Number(b.item.price !== (defaults[b.key] ?? b.item.price)) -
          Number(a.item.price !== (defaults[a.key] ?? a.item.price)),
      );
    }
    return visible;
  }, [group, vendors, activeVendorId, groupId, prices, defaults, addedItems, hiddenItems, search, onlyChanged, sort, bucket]);

  const totalItems = groups.reduce((sum, entry) => sum + countsFor(entry), 0);
  const changedTotal = Object.keys(prices).filter((key) => prices[key] !== (defaults[key] ?? prices[key])).length;
  const addedTotal = Object.values(addedItems).flat().length;

  function setPrice(key: string, value: number) {
    setPrices((prev) => ({ ...prev, [key]: value }));
  }

  function addItem() {
    if (!draft.name.trim() || draft.price <= 0) {
      setMessage({ ok: false, text: "Nama produk dan harga wajib diisi." });
      return;
    }
    const item: ProductItem = {
      id: `c-${Date.now().toString(36)}`,
      name: draft.name.trim(),
      headline: draft.headline.trim() || undefined,
      meta: draft.meta.trim() || undefined,
      badge: draft.badge.trim() || undefined,
      price: draft.price,
    };
    setAddedItems((prev) => ({ ...prev, [bucket]: [...(prev[bucket] ?? []), item] }));
    setDraft(EMPTY_DRAFT);
    setAdding(false);
    setMessage({ ok: true, text: `“${item.name}” ditambahkan — jangan lupa Simpan.` });
  }

  function removeItem(key: string, shipped: boolean) {
    if (shipped) {
      setHiddenItems((prev) => [...prev, key]);
      setMessage({ ok: true, text: "Produk bawaan disembunyikan — jangan lupa Simpan." });
      return;
    }
    setAddedItems((prev) => ({
      ...prev,
      [bucket]: (prev[bucket] ?? []).filter((item) => priceKey(group.id, activeVendorId, item.id) !== key),
    }));
    setPrices((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setMessage({ ok: true, text: "Produk dihapus — jangan lupa Simpan." });
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    const result = await saveCatalogueAction({ prices, addedItems, hiddenItems });
    setBusy(false);
    setMessage(
      result.ok
        ? {
            ok: true,
            text: `Tersimpan — ${result.changed ?? 0} harga diubah, ${result.added ?? 0} produk tambahan, ${result.hidden ?? 0} disembunyikan. Situs langsung memakainya.`,
          }
        : { ok: false, text: result.message ?? "Gagal menyimpan." },
    );
  }

  return (
    <div className="space-y-6">
      {/* ---------------------------- Title row ---------------------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="h-display text-xl font-extrabold">Katalog produk</h3>
          <p className="mt-1 text-sm text-muted">
            Menampilkan {cards.length} dari {totalItems} produk bawaan
            {addedTotal > 0 ? ` + ${addedTotal} tambahan` : ""}
            {changedTotal > 0 ? ` · ${changedTotal} harga diubah` : ""}
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
            onClick={() => setAdding((open) => !open)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-line px-4 text-sm font-bold text-brand transition hover:border-brand hover:bg-soft"
          >
            <PlusIcon />
            Tambah produk
          </button>

          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="blue-grad inline-flex min-h-10 items-center rounded-pill px-5 text-sm font-bold text-white disabled:opacity-70"
          >
            {busy ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>

      {/* ------------------------- Add product form ------------------------- */}
      {adding && (
        <section className="card p-5">
          <p className="font-bold">Produk baru</p>
          <p className="mt-1 text-xs text-muted">
            Ditambahkan ke <strong className="text-ink">{group.label}</strong>
            {vendors.length > 0 ? ` · ${vendors.find((e) => e.id === activeVendorId)?.label}` : ""}.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-xs font-semibold text-muted">Nama produk</span>
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="mis. Pulsa 75.000"
                className={cn(FIELD, "mt-1.5")}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">Nilai tampil (opsional)</span>
              <input
                value={draft.headline}
                onChange={(event) => setDraft({ ...draft, headline: event.target.value })}
                placeholder="mis. 75.000 atau 10 GB"
                className={cn(FIELD, "mt-1.5")}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">Keterangan (opsional)</span>
              <input
                value={draft.meta}
                onChange={(event) => setDraft({ ...draft, meta: event.target.value })}
                placeholder="mis. Masa aktif 30 hari"
                className={cn(FIELD, "mt-1.5")}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">Badge (opsional)</span>
              <input
                value={draft.badge}
                onChange={(event) => setDraft({ ...draft, badge: event.target.value })}
                placeholder="mis. Terlaris"
                className={cn(FIELD, "mt-1.5")}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="block w-52">
              <span className="text-xs font-semibold text-muted">Harga jual</span>
              <RupiahInput
                label="Harga produk baru"
                value={draft.price}
                onChange={(price) => setDraft({ ...draft, price })}
                placeholder="0"
                className="mt-1.5"
              />
            </label>
            <button
              type="button"
              onClick={addItem}
              className="blue-grad inline-flex min-h-11 items-center rounded-pill px-6 text-sm font-bold text-white"
            >
              Tambahkan
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setDraft(EMPTY_DRAFT);
              }}
              className="inline-flex min-h-11 items-center rounded-pill border border-line px-5 text-sm font-semibold text-muted"
            >
              Batal
            </button>
          </div>
        </section>
      )}

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
            <span
              className={cn(
                "rounded-pill px-1.5 text-[10px]",
                entry.id === group.id ? "bg-white/20" : "bg-soft",
              )}
            >
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
              aria-label="Cari produk"
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
            <p className="font-bold">Tidak ada produk yang cocok</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Longgarkan filternya, atau tambah produk baru lewat tombol di atas.
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
              const baseline = card.shipped ? (defaults[card.key] ?? card.item.price) : card.item.price;
              const changed = card.item.price !== baseline;
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
                      <span className="block truncate text-sm font-bold text-ink">
                        {card.item.headline ?? card.item.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {card.item.headline ? `${card.item.name} · ` : ""}
                        {card.vendorLabel ?? card.groupLabel}
                      </span>
                    </span>

                    {!card.shipped && (
                      <span className="shrink-0 rounded-pill bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                        baru
                      </span>
                    )}
                    {changed && card.shipped && (
                      <span className="shrink-0 rounded-pill bg-warn/15 px-2 py-0.5 text-[10px] font-bold text-warn">
                        diubah
                      </span>
                    )}
                  </div>

                  {card.item.badge && (
                    <span className="mt-3 inline-block self-start rounded-pill bg-warn px-2 py-0.5 text-[10px] font-bold text-white">
                      {card.item.badge}
                    </span>
                  )}
                  {card.item.meta && <p className="mt-2 truncate text-xs text-muted">{card.item.meta}</p>}

                  <div className="mt-auto pt-4">
                    <span className="text-[11px] font-semibold text-muted">Harga jual</span>
                    <RupiahInput
                      label={`Harga ${card.item.name}`}
                      value={card.item.price}
                      onChange={(value) => setPrice(card.key, value)}
                      placeholder="0"
                      className={cn("mt-1", changed && "border-brand")}
                    />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted">
                        {card.shipped ? `bawaan ${formatRupiah(baseline)}` : "produk tambahan"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(card.key, card.shipped)}
                        className="text-[11px] font-semibold text-danger transition hover:underline"
                      >
                        {card.shipped ? "Sembunyikan" : "Hapus"}
                      </button>
                    </div>
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
          {busy ? "Menyimpan…" : "Simpan perubahan"}
        </button>
        <span className="text-xs text-muted">
          {changedTotal} harga diubah · {addedTotal} produk tambahan · {hiddenItems.length} disembunyikan
        </span>
        {message && (
          <p
            role="status"
            className={cn("text-sm font-semibold", message.ok ? "text-success" : "text-danger")}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
