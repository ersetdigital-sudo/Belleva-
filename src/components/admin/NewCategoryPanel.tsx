"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { CUSTOM_CARD_STYLES } from "@/lib/products";
import type { CategoryIconId, ProductGroup } from "@/types";

import { CategoryIcon } from "@/components/icons";

import { SlideOver } from "./SlideOver";
import { Button, SelectField, TextInput } from "./ui";

const ICONS: { id: CategoryIconId; label: string }[] = [
  { id: "pulsa", label: "Pulsa" },
  { id: "paket-data", label: "Paket Data" },
  { id: "pln", label: "Listrik" },
  { id: "pdam", label: "PDAM" },
  { id: "bpjs", label: "BPJS" },
  { id: "internet", label: "Internet" },
  { id: "e-money", label: "E-Money" },
  { id: "multifinance", label: "Angsuran" },
];

interface Draft {
  label: string;
  icon: CategoryIconId;
  fieldLabel: string;
  placeholder: string;
  subtitle: string;
  card: string;
}

const EMPTY: Draft = {
  label: "",
  icon: "pulsa",
  fieldLabel: "",
  placeholder: "",
  subtitle: "",
  card: "row",
};

/**
 * Creates a whole category, not just a product.
 *
 * A category has to be a working catalogue entry rather than a label: the
 * catalogue needs to know what to call the customer's number field and how to
 * lay its products out, so those are asked for here instead of being guessed.
 *
 * Only the prepaid flow is offered. A postpaid category would promise a bill
 * inquiry for a bill that does not exist anywhere but this panel.
 */
export function NewCategoryPanel({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (group: ProductGroup) => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const labelError = !draft.label.trim() ? "Nama kategori wajib diisi." : undefined;
  const fieldError = !draft.fieldLabel.trim()
    ? "Kolom nomor pelanggan wajib diisi."
    : undefined;
  const showLabelError = (touched.label || submitted) && labelError;
  const showFieldError = (touched.field || submitted) && fieldError;

  const dirty =
    draft.label.trim() !== "" ||
    draft.fieldLabel.trim() !== "" ||
    draft.placeholder.trim() !== "" ||
    draft.subtitle.trim() !== "";

  function reset() {
    setDraft(EMPTY);
    setTouched({});
    setSubmitted(false);
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
    if (labelError || fieldError) return;

    const label = draft.label.trim();
    onCreate({
      id: `cat-${Date.now().toString(36)}`,
      icon: draft.icon,
      label,
      title: label,
      subtitle: draft.subtitle.trim(),
      flow: "prepaid",
      customer: {
        label: draft.fieldLabel.trim(),
        placeholder: draft.placeholder.trim() || draft.fieldLabel.trim(),
        minLength: 4,
        maxLength: 24,
        hint: `Pastikan ${draft.fieldLabel.trim()} benar sebelum membayar.`,
      },
      card: (draft.card as ProductGroup["card"]) ?? "row",
      items: [],
    });
    reset();
    onClose();
  }

  return (
    <SlideOver
      open={open}
      onClose={requestClose}
      title="Kategori baru"
      description="Kategori buatan sendiri, di luar bawaan aplikasi."
      footer={
        confirmingDiscard ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink">Isian belum dibuat. Tutup saja?</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Tutup tanpa membuat
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingDiscard(false)}>
                Lanjut isi
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" form="new-category-form" className="flex-1 sm:flex-none">
              Buat kategori
            </Button>
            <Button variant="ghost" onClick={requestClose}>
              Batal
            </Button>
          </div>
        )
      }
    >
      <form id="new-category-form" onSubmit={submit} noValidate className="space-y-5">
        <TextInput
          id="new-category-label"
          label="Nama kategori"
          required
          value={draft.label}
          placeholder="Top Up Game"
          hint="Nama ini yang jadi tab di katalog dan di beranda."
          error={showLabelError ? labelError : undefined}
          onChange={(event) => setDraft({ ...draft, label: event.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, label: true }))}
        />

        <fieldset>
          <legend className="text-xs font-semibold text-ink">Ikon kategori</legend>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon.id}
                type="button"
                aria-pressed={draft.icon === icon.id}
                onClick={() => setDraft({ ...draft, icon: icon.id })}
                className={cn(
                  "flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 py-2 text-[10px] font-semibold transition-colors",
                  draft.icon === icon.id
                    ? "border-brand bg-soft text-brand"
                    : "border-line text-muted hover:border-line-2 hover:text-brand",
                )}
              >
                <CategoryIcon id={icon.id} />
                {icon.label}
              </button>
            ))}
          </div>
        </fieldset>

        <TextInput
          id="new-category-field"
          label="Kolom nomor pelanggan"
          required
          value={draft.fieldLabel}
          placeholder="ID pemain"
          hint="Nama kolom yang diisi pembeli, misalnya Nomor HP, ID pelanggan, atau ID pemain."
          error={showFieldError ? fieldError : undefined}
          onChange={(event) => setDraft({ ...draft, fieldLabel: event.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, field: true }))}
        />

        <TextInput
          label="Contoh isian"
          value={draft.placeholder}
          placeholder="Contoh: 123456789"
          hint="Tulisan samar di dalam kolom. Kosongkan untuk memakai nama kolomnya."
          onChange={(event) => setDraft({ ...draft, placeholder: event.target.value })}
        />

        <TextInput
          label="Keterangan kategori"
          value={draft.subtitle}
          placeholder="Isi saldo game favoritmu"
          hint="Baris kecil di bawah judul kategori di beranda. Opsional."
          onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })}
        />

        <SelectField
          label="Tampilan produk"
          value={draft.card}
          options={CUSTOM_CARD_STYLES.map((style) => ({ value: style.value, label: style.label }))}
          hint={CUSTOM_CARD_STYLES.find((style) => style.value === draft.card)?.hint}
          onChange={(event) => setDraft({ ...draft, card: event.target.value })}
        />

        <p className="rounded-2xl bg-soft p-3.5 text-xs leading-relaxed text-muted">
          Kategori baru memakai alur <strong className="text-ink">prabayar</strong>: pembeli pilih
          nominal lalu bayar. Tagihan bulanan (PDAM, BPJS, dan sejenisnya) belum bisa ditambah dari
          sini karena tidak ada tagihan yang bisa ditanyakan.
        </p>
      </form>
    </SlideOver>
  );
}
