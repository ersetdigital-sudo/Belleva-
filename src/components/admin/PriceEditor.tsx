"use client";

import { useMemo, useState } from "react";

import { categoryGradient } from "@/data/categories";
import { saveCatalogueAction } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { bucketKey, priceKey, type CatalogueOverrides, type PriceOverrides } from "@/lib/products";
import type { CategoryIconId, ProductGroup, ProductItem } from "@/types";

import {
  CategoryIcon,
  EyeOffIcon,
  GridIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UndoIcon,
} from "@/components/icons";

import { NewCategoryPanel } from "./NewCategoryPanel";
import { NewProductPanel } from "./NewProductPanel";
import { useToast } from "./Toast";
import { Button, RupiahInput, SaveBar, Stat } from "./ui";

interface Card {
  key: string;
  item: ProductItem;
  vendorLabel?: string;
  shipped: boolean;
}

const PILL = (active: boolean) =>
  cn(
    "flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-pill px-4 text-sm font-semibold whitespace-nowrap transition-colors",
    active ? "blue-grad text-white shadow-soft" : "card text-muted hover:border-line-2 hover:text-brand",
  );

/**
 * Catalogue editor.
 *
 * Laid out like the products-catalog dashboard wireframe: a title row with the
 * grid/list switch, a sort and the add action; pills per catalogue group with
 * their item count; a filter rail; and the catalogue itself as cards.
 *
 * Three things the wireframe shows that this deliberately leaves out: product
 * photos, ratings and stock levels. Belleva sells nominals, not stocked goods,
 * so there is nothing real to put in those slots.
 *
 * Nothing here touches the server until "Simpan", which is what makes the undo
 * in the toast honest — hiding a product is a local change until it is saved.
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
  const toast = useToast();

  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [vendorId, setVendorId] = useState<string | undefined>(groups[0]?.vendors?.[0]?.id);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("catalog");
  const [search, setSearch] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [busy, setBusy] = useState(false);

  const [prices, setPrices] = useState<PriceOverrides>({ ...defaults });
  const [addedItems, setAddedItems] = useState(overrides.addedItems);
  const [hiddenItems, setHiddenItems] = useState<string[]>(overrides.hiddenItems);
  const [addedGroups, setAddedGroups] = useState(overrides.addedGroups);
  const [panelOpen, setPanelOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  /*
   * The server sends the shipped catalogue plus whatever was saved last time; a
   * category created in this session only exists here until it is saved, so the
   * two lists are merged for display without double-counting one that is in both.
   */
  const allGroups = useMemo(
    () => [
      ...groups,
      ...addedGroups.filter((entry) => !groups.some((saved) => saved.id === entry.id)),
    ],
    [groups, addedGroups],
  );

  /** Snapshot of what is on the server, so "dirty" and "batal" have a target. */
  const saved = useMemo(
    () =>
      JSON.stringify({
        prices: { ...defaults },
        addedItems: overrides.addedItems,
        hiddenItems: overrides.hiddenItems,
        addedGroups: overrides.addedGroups,
      }),
    [defaults, overrides],
  );
  const current = JSON.stringify({ prices, addedItems, hiddenItems, addedGroups });
  const dirty = current !== saved;

  const group = allGroups.find((entry) => entry.id === groupId) ?? allGroups[0];
  const vendors = group.vendors ?? [];
  const activeVendorId = vendors.length
    ? (vendors.find((entry) => entry.id === vendorId)?.id ?? vendors[0].id)
    : undefined;
  const activeVendor = vendors.find((entry) => entry.id === activeVendorId);
  const bucket = bucketKey(group.id, activeVendorId);

  const cards = useMemo<Card[]>(() => {
    const shipped: ProductItem[] = vendors.length ? (activeVendor?.items ?? []) : (group.items ?? []);

    const all: Card[] = [
      ...shipped.map((item) => ({
        key: priceKey(group.id, activeVendorId, item.id),
        item: { ...item, price: prices[priceKey(group.id, activeVendorId, item.id)] ?? item.price },
        vendorLabel: activeVendor?.label,
        shipped: true,
      })),
      ...(addedItems[bucket] ?? []).map((item) => ({
        key: priceKey(group.id, activeVendorId, item.id),
        item: { ...item, price: prices[priceKey(group.id, activeVendorId, item.id)] ?? item.price },
        vendorLabel: activeVendor?.label,
        shipped: false,
      })),
    ];

    const term = search.trim().toLowerCase();
    const visible = all.filter((card) => {
      if (hiddenItems.includes(card.key)) return false;
      if (onlyChanged && card.item.price === (defaults[card.key] ?? card.item.price)) return false;
      if (!term) return true;
      return `${card.item.name} ${card.item.headline ?? ""} ${card.item.meta ?? ""} ${card.vendorLabel ?? ""}`
        .toLowerCase()
        .includes(term);
    });

    const changed = (card: Card) => Number(card.item.price !== (defaults[card.key] ?? card.item.price));
    if (sort === "name") return [...visible].sort((a, b) => a.item.name.localeCompare(b.item.name));
    if (sort === "price") return [...visible].sort((a, b) => b.item.price - a.item.price);
    if (sort === "changed") return [...visible].sort((a, b) => changed(b) - changed(a));
    return visible;
  }, [group, vendors, activeVendor, activeVendorId, prices, defaults, addedItems, hiddenItems, search, onlyChanged, sort, bucket]);

  const baselineTotal = groups.reduce((sum, entry) => {
    const vendor = entry.vendors?.[0];
    return sum + (entry.items ?? vendor?.items ?? []).length;
  }, 0);
  const changedTotal = Object.keys(prices).filter((key) => prices[key] !== (defaults[key] ?? prices[key])).length;
  const addedTotal = Object.values(addedItems).flat().length;

  function restore() {
    setPrices({ ...defaults });
    setAddedItems(overrides.addedItems);
    setHiddenItems(overrides.hiddenItems);
    setAddedGroups(overrides.addedGroups);
  }

  function setPrice(key: string, value: number) {
    setPrices((prev) => ({ ...prev, [key]: value }));
  }

  function labelOf(groupId: string) {
    return allGroups.find((entry) => entry.id === groupId)?.label ?? "katalog";
  }

  /**
   * The panel reports which category the product was meant for, so adding one
   * while looking at a different tab still lands where the form said it would.
   */
  function addItem(item: ProductItem, targetGroupId: string, targetVendorId?: string) {
    const key = bucketKey(targetGroupId, targetVendorId);
    setAddedItems((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), item] }));
    toast.success(`${item.name} ditambahkan ke ${labelOf(targetGroupId)}`, {
      description: "Belum tersimpan — produknya sudah ada di daftar.",
      action: { label: "Simpan sekarang", onClick: () => void save() },
    });
  }

  function createCategory(category: ProductGroup) {
    setAddedGroups((prev) => [...prev, category]);
    setGroupId(category.id);
    setVendorId(undefined);
    toast.success(`Kategori ${category.label} dibuat`, {
      description: "Belum tersimpan, dan masih kosong. Tambahkan produknya sekarang.",
      action: { label: "Tambah produk", onClick: () => setPanelOpen(true) },
    });
  }

  function removeCategory(id: string) {
    const removed = addedGroups.find((entry) => entry.id === id);
    if (!removed) return;

    setAddedGroups((prev) => prev.filter((entry) => entry.id !== id));
    setAddedItems((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) if (key.startsWith(`${id}/`)) delete next[key];
      return next;
    });
    setGroupId(allGroups.find((entry) => entry.id !== id)?.id ?? "");
    setVendorId(undefined);

    toast.info(`Kategori ${removed.label} dihapus`, {
      description: "Beserta produk di dalamnya. Belum tersimpan selama belum di-Simpan.",
      action: { label: "Urungkan", onClick: () => setAddedGroups((prev) => [...prev, removed]) },
    });
  }

  /**
   * Hides a shipped item, or removes one that was added here. Nothing reaches the
   * server until save, which is what makes the undo in the toast truthful.
   *
   * The clicked button disappears with the card, so focus is moved to the button
   * that took its place — otherwise a keyboard user is dropped back to the top of
   * the document.
   */
  function hideItem(card: Card, index: number) {
    const before = hiddenItems;
    const removing = (addedItems[bucket] ?? []).find(
      (item) => priceKey(group.id, activeVendorId, item.id) === card.key,
    );

    if (card.shipped) {
      setHiddenItems((prev) => [...prev, card.key]);
    } else {
      setAddedItems((prev) => ({
        ...prev,
        [bucket]: (prev[bucket] ?? []).filter(
          (item) => priceKey(group.id, activeVendorId, item.id) !== card.key,
        ),
      }));
    }

    requestAnimationFrame(() => {
      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-card-action]"));
      (buttons[Math.min(index, buttons.length - 1)] ?? document.getElementById("katalog-cari"))?.focus();
    });

    toast.info(card.shipped ? `${card.item.name} disembunyikan` : `${card.item.name} dihapus`, {
      description: "Belum tersimpan selama belum di-Simpan.",
      action: {
        label: "Urungkan",
        onClick: () => {
          if (removing) {
            setAddedItems((prev) => ({ ...prev, [bucket]: [...(prev[bucket] ?? []), removing] }));
            return;
          }
          setHiddenItems(before);
        },
      },
    });
  }

  async function save() {
    setBusy(true);
    const result = await saveCatalogueAction({ prices, addedItems, hiddenItems, addedGroups });
    setBusy(false);

    if (!result.ok) {
      toast.error("Gagal menyimpan", {
        description: result.message ?? "Coba lagi sebentar lagi.",
      });
      return;
    }

    toast.success("Katalog tersimpan", {
      description:
        `${result.changed ?? 0} harga diubah · ${result.added ?? 0} produk tambahan · ${result.groups ?? 0} kategori buatan sendiri` +
        (result.hidden ? ` · ${result.hidden} disembunyikan` : "") +
        ". Situs dan halaman bayar langsung memakainya.",
    });
  }

  async function saveWithUndoHint() {
    await save();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Produk bawaan" value={String(baselineTotal)} />
        <Stat
          label="Harga diubah"
          value={String(changedTotal)}
          hint={changedTotal === 0 ? "Masih semua harga bawaan" : "Berbeda dari bawaan"}
        />
        <Stat
          label="Produk tambahan"
          value={String(addedTotal)}
          hint={hiddenItems.length > 0 ? `${hiddenItems.length} bawaan disembunyikan` : undefined}
        />
      </div>

      {/* ---------------------------- Toolbar ---------------------------- */}
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
                "grid h-11 w-11 cursor-pointer place-items-center transition-colors",
                view === option ? "bg-soft text-brand" : "text-muted hover:text-brand",
              )}
            >
              {option === "grid" ? <GridIcon size={18} /> : <MenuIcon />}
            </button>
          ))}
        </div>

        <label className="sr-only" htmlFor="katalog-urutkan">
          Urutkan katalog
        </label>
        <select
          id="katalog-urutkan"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="card min-h-11 cursor-pointer rounded-pill px-4 text-sm font-semibold text-ink outline-none focus:border-brand"
        >
          <option value="catalog">Urutan katalog</option>
          <option value="name">Nama A–Z</option>
          <option value="price">Harga tertinggi</option>
          <option value="changed">Yang diubah dulu</option>
        </select>

        <Button
          variant="secondary"
          onClick={() => setPanelOpen(true)}
          className={cn("ml-auto", addedTotal > 0 && dirty && "border-brand text-brand")}
        >
          <PlusIcon />
          Tambah produk
        </Button>
      </div>

      {/* --------------------------- Group pills --------------------------- */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {allGroups.map((entry) => {
          const vendor = entry.vendors?.[0];
          const count = (entry.items ?? vendor?.items ?? []).length;
          const active = entry.id === group.id;
          return (
            <button
              key={entry.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setGroupId(entry.id);
                setVendorId(entry.vendors?.[0]?.id);
              }}
              className={PILL(active)}
            >
              {entry.label}
              <span className={cn("rounded-pill px-1.5 text-[10px]", active ? "bg-white/20" : "bg-soft")}>
                {count}
              </span>
            </button>
          );
        })}
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
              className="min-h-9 cursor-pointer text-xs font-semibold text-brand"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-soft px-3 focus-within:border-brand">
            <SearchIcon size={16} className="shrink-0 text-muted" />
            <input
              id="katalog-cari"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari di katalog…"
              aria-label="Cari produk"
              className="min-h-11 w-full min-w-0 bg-transparent text-sm font-semibold outline-none"
            />
          </div>

          {vendors.length > 0 && (
            <fieldset className="mt-5">
              <legend className="text-[11px] font-bold tracking-wider text-muted uppercase">
                {group.vendorLabel ?? "Vendor"}
              </legend>
              <ul className="mt-2 space-y-0.5">
                {vendors.map((vendor) => (
                  <li key={vendor.id}>
                    <button
                      type="button"
                      aria-pressed={vendor.id === activeVendorId}
                      onClick={() => setVendorId(vendor.id)}
                      className={cn(
                        "flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 text-sm transition-colors",
                        vendor.id === activeVendorId
                          ? "bg-soft font-semibold text-brand"
                          : "text-muted hover:bg-soft hover:text-brand",
                      )}
                    >
                      <span className="truncate">{vendor.label}</span>
                      <span className="text-[10px] text-muted tabular-nums">
                        {(vendor.items ?? []).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}

          {addedGroups.some((entry) => entry.id === group.id) && (
            <div className="mt-5 border-t border-line-2 pt-4">
              <button
                type="button"
                onClick={() => removeCategory(group.id)}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line text-xs font-semibold text-danger transition-colors hover:border-danger hover:bg-danger-soft"
              >
                <TrashIcon />
                Hapus kategori ini
              </button>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                {group.label} dibuat dari panel ini, jadi menghapusnya sekaligus menghapus produk di
                dalamnya.
              </p>
            </div>
          )}

          <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-2.5 border-t border-line-2 pt-4 text-sm font-semibold">
            <input
              type="checkbox"
              checked={onlyChanged}
              onChange={(event) => setOnlyChanged(event.target.checked)}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-line accent-[var(--color-brand)]"
            />
            Hanya yang diubah
          </label>
        </aside>

        {/* --------------------------- Price cards -------------------------- */}
        {cards.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-bold">Tidak ada produk yang cocok</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Longgarkan filternya, atau tambahkan produk baru untuk grup ini.
            </p>
            <Button variant="secondary" className="mt-5" onClick={() => setPanelOpen(true)}>
              <PlusIcon />
              Tambah produk
            </Button>
          </div>
        ) : (
          <ul
            className={cn(
              "gap-4",
              view === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3" : "grid grid-cols-1",
            )}
          >
            {cards.map((card, cardIndex) => {
              const baseline = card.shipped ? (defaults[card.key] ?? card.item.price) : card.item.price;
              const changed = card.item.price !== baseline;
              return (
                <li key={card.key} className="card flex h-full flex-col p-4">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                      style={{ background: categoryGradient(group.icon as CategoryIconId) }}
                    >
                      <CategoryIcon id={group.icon} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink">
                        {card.item.headline ?? card.item.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {card.item.headline ? `${card.item.name} · ` : ""}
                        {card.vendorLabel ?? group.label}
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

                  {(card.item.badge || card.item.meta) && (
                    <p className="mt-3 flex flex-wrap items-center gap-2">
                      {card.item.badge && (
                        <span className="rounded-pill bg-warn px-2 py-0.5 text-[10px] font-bold text-white">
                          {card.item.badge}
                        </span>
                      )}
                      {card.item.meta && (
                        <span className="truncate text-xs text-muted">{card.item.meta}</span>
                      )}
                    </p>
                  )}

                  <div className="mt-auto pt-4">
                    <RupiahInput
                      label="Harga jual"
                      value={card.item.price}
                      onChange={(value) => setPrice(card.key, value)}
                      className={cn(changed && "border-brand")}
                    />
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted tabular-nums">
                        {card.shipped ? `bawaan ${formatRupiah(baseline)}` : "produk tambahan"}
                      </span>
                      <button
                        type="button"
                        data-card-action
                        onClick={() => hideItem(card, cardIndex)}
                        className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-pill px-2 text-[11px] font-semibold text-muted transition-colors hover:bg-soft hover:text-danger"
                      >
                        {card.shipped ? <EyeOffIcon /> : <TrashIcon />}
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

      <SaveBar
        dirty={dirty}
        busy={busy}
        onSave={() => void saveWithUndoHint()}
        onReset={restore}
        label="Simpan katalog"
      />

      <NewProductPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        groups={allGroups}
        defaultGroupId={group.id}
        onAdd={addItem}
        onCreateCategory={() => {
          setPanelOpen(false);
          setCategoryOpen(true);
        }}
      />

      <NewCategoryPanel
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        onCreate={createCategory}
      />

      {hiddenItems.length > 0 && (
        <p className="flex items-start gap-2 text-xs text-muted">
          <UndoIcon className="mt-0.5 shrink-0" />
          {hiddenItems.length} produk bawaan sedang disembunyikan — tekan Simpan katalog untuk
          menerapkannya.
        </p>
      )}
    </div>
  );
}
