"use client";

import { useEffect, useRef, useState } from "react";

import { categoryGradient } from "@/data/categories";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { ProductGroup, ProductItem } from "@/types";

import { CategoryIcon } from "@/components/icons";

import { SlideOver } from "./SlideOver";
import { Button, RupiahInput, SelectField, TextInput } from "./ui";

interface Draft {
  name: string;
  headline: string;
  meta: string;
  badge: string;
  price: number;
}

const EMPTY: Draft = { name: "", headline: "", meta: "", badge: "", price: 0 };

/**
 * Adds one product to the catalogue.
 *
 * The form used to dump five fields on the reader at once, with no hint about
 * which ones actually mattered — which is exactly what made it confusing. Only
 * the two that are required are on screen now; the rest sit behind "Detail
 * tambahan" and the tile below updates as you type, so the result is visible
 * before anything is committed.
 *
 * Validation runs when a field is left (not on every keystroke, which flags
 * people mid-word), and the draft is not thrown away by an accidental close.
 */
export function NewProductPanel({
  open,
  onClose,
  groups,
  defaultGroupId,
  onAdd,
  onCreateCategory,
}: {
  open: boolean;
  onClose: () => void;
  groups: ProductGroup[];
  defaultGroupId: string;
  onAdd: (item: ProductItem, groupId: string, vendorId?: string) => void;
  onCreateCategory: () => void;
}) {
  const [groupId, setGroupId] = useState(defaultGroupId);
  const [vendorId, setVendorId] = useState<string | undefined>(undefined);

  /*
   * The category is chosen in here, not only on the page behind: "which tab was
   * I on?" is not something a form should make anyone remember. Opening the panel
   * adopts whichever tab is in view, and it can be changed without going back.
   */
  useEffect(() => {
    if (!open) return;
    setGroupId(defaultGroupId);
    setVendorId(undefined);
  }, [open, defaultGroupId]);

  const group = groups.find((entry) => entry.id === groupId) ?? groups[0];
  const vendors = group?.vendors ?? [];
  const activeVendorId = vendors.length
    ? (vendors.find((entry) => entry.id === vendorId)?.id ?? vendors[0].id)
    : undefined;
  const activeVendor = vendors.find((entry) => entry.id === activeVendorId);
  const gradient = categoryGradient(group?.icon ?? "pulsa");

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  /** Set on a failed submit, cleared once the focus has actually moved. */
  const focusPending = useRef(false);

  const nameError = !draft.name.trim() ? "Nama produk wajib diisi." : undefined;
  const priceError = draft.price <= 0 ? "Harga jual harus lebih dari 0." : undefined;
  const showNameError = (touched.name || submitted) && nameError;
  const showPriceError = (touched.price || submitted) && priceError;

  /*
   * Focusing from inside the submit handler loses a race with the browser's own
   * click handling, so it lands nowhere. Doing it after the errors have rendered
   * is what actually moves the caret to the field that needs attention.
   */
  useEffect(() => {
    if (!submitted || !focusPending.current) return;
    focusPending.current = false;
    const target = document.getElementById(nameError ? "new-product-name" : "new-product-price");
    target?.focus();
  }, [submitted, nameError]);

  const dirty =
    draft.name.trim() !== "" ||
    draft.headline.trim() !== "" ||
    draft.meta.trim() !== "" ||
    draft.badge.trim() !== "" ||
    draft.price > 0;

  function reset() {
    setDraft(EMPTY);
    setTouched({});
    setSubmitted(false);
    setShowMore(false);
    setConfirmingDiscard(false);
  }

  function requestClose() {
    if (dirty && !confirmingDiscard) {
      setConfirmingDiscard(true);
      return;
    }
    reset();
    onClose();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);

    if (nameError || priceError) {
      focusPending.current = true;
      return;
    }

    onAdd(
      {
        id: `c-${Date.now().toString(36)}`,
        name: draft.name.trim(),
        headline: draft.headline.trim() || undefined,
        meta: draft.meta.trim() || undefined,
        badge: draft.badge.trim() || undefined,
        price: draft.price,
      },
      group.id,
      activeVendorId,
    );
    reset();
    onClose();
  }

  return (
    <SlideOver
      open={open}
      onClose={requestClose}
      title="Tambah produk"
      description={`Masuk ke ${group?.label ?? "katalog"}${activeVendor ? ` · ${activeVendor.label}` : ""}`}
      footer={
        confirmingDiscard ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink">
              Isian belum ditambahkan. Tutup saja?
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Tutup tanpa menambah
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingDiscard(false)}>
                Lanjut isi
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" form="new-product-form" className="flex-1 sm:flex-none">
              Tambahkan
            </Button>
            <Button variant="ghost" onClick={requestClose}>
              Batal
            </Button>
          </div>
        )
      }
    >
      <form id="new-product-form" onSubmit={submit} noValidate className="space-y-5">
        {/* --------------------- Which catalogue this lands in -------------------- */}
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Kategori"
            required
            value={group?.id ?? ""}
            options={groups.map((entry) => ({ value: entry.id, label: entry.label }))}
            hint="Tempat produk ini muncul di katalog."
            onChange={(event) => {
              setGroupId(event.target.value);
              setVendorId(undefined);
            }}
          />
          {vendors.length > 0 && (
            <SelectField
              label={group?.vendorLabel ?? "Vendor"}
              value={activeVendorId ?? ""}
              options={vendors.map((entry) => ({ value: entry.id, label: entry.label }))}
              hint="Produk ini dijual di bawah vendor yang dipilih."
              onChange={(event) => setVendorId(event.target.value)}
            />
          )}
        </div>

        <button
          type="button"
          onClick={onCreateCategory}
          className="min-h-9 cursor-pointer text-xs font-bold text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
        >
          + Kategori belum ada? Buat kategori baru
        </button>

        {/* Live preview of the tile this becomes in the catalogue. */}
        <div>
          <p className="text-xs font-semibold text-muted">Pratinjau di katalog</p>
          <div className="card mt-2 flex items-center gap-3 p-3">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
              style={{ background: gradient }}
            >
              <CategoryIcon id={group?.icon ?? "pulsa"} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink">
                {draft.headline.trim() || draft.name.trim() || "Nama produk"}
              </span>
              <span className="block truncate text-xs text-muted">
                {activeVendor?.label ?? group?.label ?? "Kategori"}
              </span>
            </span>
            <span className="shrink-0 text-sm font-extrabold text-brand tabular-nums">
              {formatRupiah(draft.price)}
            </span>
          </div>
        </div>

        <TextInput
          id="new-product-name"
          label="Nama produk"
          required
          value={draft.name}
          placeholder="Pulsa 75.000"
          hint="Nama ini yang muncul di daftar dan di struk."
          error={showNameError ? nameError : undefined}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
        />

        <RupiahInput
          id="new-product-price"
          label="Harga jual"
          required
          value={draft.price}
          error={showPriceError ? priceError : undefined}
          hint={`Belum termasuk biaya layanan Rp 1.000 yang ditambahkan saat bayar.`}
          onChange={(price) => setDraft({ ...draft, price })}
        />

        {/* Progressive disclosure: the optional half stays out of the way. */}
        <div className="border-t border-line-2 pt-4">
          <button
            type="button"
            aria-expanded={showMore}
            onClick={() => setShowMore((value) => !value)}
            className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left"
          >
            <span>
              <span className="block text-sm font-bold">Detail tambahan</span>
              <span className="block text-xs text-muted">Opsional — bisa diisi nanti.</span>
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "text-lg leading-none text-muted transition-transform duration-200 motion-reduce:transition-none",
                showMore && "rotate-45",
              )}
            >
              +
            </span>
          </button>

          {showMore && (
            <div className="mt-4 space-y-4">
              <TextInput
                label="Nilai tampil"
                value={draft.headline}
                placeholder="75.000"
                hint="Angka besar di kartu. Kosongkan untuk memakai nama produk."
                onChange={(event) => setDraft({ ...draft, headline: event.target.value })}
              />
              <TextInput
                label="Keterangan"
                value={draft.meta}
                placeholder="Masa aktif 30 hari"
                hint="Baris kecil di bawah nama, misalnya masa aktif atau kuota."
                onChange={(event) => setDraft({ ...draft, meta: event.target.value })}
              />
              <TextInput
                label="Badge"
                value={draft.badge}
                placeholder="Terlaris"
                hint="Label pendek di kartu. Kosongkan kalau tidak perlu."
                onChange={(event) => setDraft({ ...draft, badge: event.target.value })}
              />
            </div>
          )}
        </div>
      </form>
    </SlideOver>
  );
}
