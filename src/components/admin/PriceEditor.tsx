"use client";

import { useState } from "react";

import { saveProductPricesAction } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { priceKey, type PriceOverrides } from "@/lib/products";
import type { ProductGroup } from "@/types";

const INPUT =
  "w-32 rounded-xl border border-line px-3 py-2 text-right text-sm font-bold text-ink outline-none transition focus:border-brand";

interface PriceEditorProps {
  /** The catalogue with the currently saved prices applied. */
  groups: ProductGroup[];
  /** Shipped prices, used to show what a row costs by default. */
  defaults: PriceOverrides;
  /** How many rows are already overridden — shown in the header. */
  overriddenCount: number;
}

function chip(active: boolean) {
  return cn(
    "flex min-h-10 shrink-0 items-center rounded-pill px-4 text-sm font-semibold whitespace-nowrap transition",
    active
      ? "blue-grad text-white shadow-soft"
      : "border border-line bg-white text-muted hover:border-brand hover:text-brand",
  );
}

/**
 * Price editor.
 *
 * Only prices are editable — the catalogue's shape stays in code, so a group or
 * an item added there appears here automatically. Each row shows the shipped
 * price underneath, so it is obvious which ones have been changed.
 */
export function PriceEditor({ groups, defaults, overriddenCount }: PriceEditorProps) {
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [vendorId, setVendorId] = useState<string | undefined>(groups[0]?.vendors?.[0]?.id);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [prices, setPrices] = useState<PriceOverrides>(() => {
    const effective: PriceOverrides = { ...defaults };
    for (const group of groups) {
      for (const vendor of group.vendors ?? []) {
        for (const item of vendor.items ?? []) {
          effective[priceKey(group.id, vendor.id, item.id)] = item.price;
        }
      }
      for (const item of group.items ?? []) {
        effective[priceKey(group.id, undefined, item.id)] = item.price;
      }
    }
    return effective;
  });

  const group = groups.find((entry) => entry.id === groupId) ?? groups[0];
  const vendors = group.vendors ?? [];
  const activeVendorId = vendors.length
    ? (vendors.find((entry) => entry.id === vendorId)?.id ?? vendors[0].id)
    : undefined;
  const items = vendors.length
    ? (vendors.find((entry) => entry.id === activeVendorId)?.items ?? [])
    : (group.items ?? []);

  const rows = items.map((item) => {
    const key = priceKey(group.id, activeVendorId, item.id);
    return {
      key,
      label: `${item.name}${item.headline ? ` ${item.headline}` : ""}`.trim(),
      meta: item.meta,
      original: item.originalPrice,
      price: prices[key] ?? item.price,
      shipped: defaults[key] ?? item.price,
    };
  });

  const changedHere = rows.filter((row) => row.price !== row.shipped).length;
  const totalChanged = Object.keys(prices).filter(
    (key) => prices[key] !== (defaults[key] ?? prices[key]),
  ).length;

  async function save() {
    setBusy(true);
    setMessage(null);
    const result = await saveProductPricesAction(prices);
    setBusy(false);
    setMessage(
      result.ok
        ? {
            ok: true,
            text: `Tersimpan. ${result.changed ?? 0} harga berbeda dari bawaan, dan situs langsung memakainya.`,
          }
        : { ok: false, text: result.message ?? "Gagal menyimpan." },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {groups.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => {
              setGroupId(entry.id);
              setVendorId(entry.vendors?.[0]?.id);
            }}
            className={chip(entry.id === group.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {vendors.length > 0 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {vendors.map((vendor) => (
            <button
              key={vendor.id}
              type="button"
              onClick={() => setVendorId(vendor.id)}
              className={chip(vendor.id === activeVendorId)}
            >
              {vendor.label}
            </button>
          ))}
        </div>
      )}

      <section className="card overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <div>
            <p className="font-bold">
              {group.label}
              {vendors.length > 0
                ? ` · ${vendors.find((entry) => entry.id === activeVendorId)?.label}`
                : ""}
            </p>
            <p className="text-xs text-muted">
              {rows.length} item
              {changedHere > 0 ? ` · ${changedHere} diubah` : ""}
            </p>
          </div>
          {overriddenCount > 0 && (
            <span className="rounded-pill bg-warn/15 px-3 py-1 text-[11px] font-bold text-warn">
              {overriddenCount} harga di luar bawaan
            </span>
          )}
        </header>

        <div className="divide-y divide-line">
          {rows.map((row) => {
            const changed = row.price !== row.shipped;
            return (
              <div key={row.key} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{row.label}</p>
                  <p className="truncate text-xs text-muted">
                    {row.meta ? `${row.meta} · ` : ""}
                    bawaan {formatRupiah(row.shipped)}
                    {row.original && ` · coret ${formatRupiah(row.original)}`}
                  </p>
                </div>

                {changed && (
                  <span className="rounded-pill bg-brand/10 px-2.5 py-1 text-[10px] font-bold text-brand">
                    diubah
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted">Rp</span>
                  <input
                    inputMode="numeric"
                    value={row.price}
                    onChange={(event) => {
                      const next = Number(event.target.value.replace(/\D/g, "")) || 0;
                      setPrices((prev) => ({ ...prev, [row.key]: next }));
                    }}
                    className={cn(INPUT, changed && "border-brand")}
                    aria-label={`Harga ${row.label}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="blue-grad inline-flex min-h-11 items-center rounded-pill px-6 text-sm font-bold text-white disabled:opacity-70"
        >
          {busy ? "Menyimpan…" : "Simpan harga"}
        </button>
        <span className="text-xs text-muted">{totalChanged} harga berbeda dari bawaan</span>
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
