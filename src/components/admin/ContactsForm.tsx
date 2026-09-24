"use client";

import { useState } from "react";

import { saveContactsAction } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import type { SiteContacts } from "@/lib/settings";

const FIELD =
  "w-full rounded-xl border border-line px-3.5 py-2.5 text-sm font-semibold outline-none transition focus:border-brand";

const FIELDS: { key: keyof SiteContacts; label: string; hint?: string; placeholder?: string }[] = [
  {
    key: "whatsapp",
    label: "Nomor WhatsApp",
    hint: "Format internasional tanpa tanda +, contoh 6281234567890. Kosongkan untuk menyembunyikan tombol WhatsApp di seluruh situs.",
    placeholder: "6281234567890",
  },
  {
    key: "email",
    label: "Email",
    hint: "Kosongkan untuk menyembunyikan tombol Email. Dipakai tombol mailto, jadi cukup alamatnya saja.",
    placeholder: "hello@belleva.net",
  },
  { key: "helpCenter", label: "Tautan Pusat Bantuan", placeholder: "/pusat-bantuan" },
  { key: "contact", label: "Tautan Hubungi Kami", hint: "Masih kosong — isi kalau halaman kontaknya sudah ada." },
  { key: "terms", label: "Tautan Syarat & Ketentuan", placeholder: "/syarat-ketentuan" },
  { key: "privacy", label: "Tautan Kebijakan Privasi", placeholder: "/kebijakan-privasi" },
  { key: "allProducts", label: "Tautan “Lihat Semua Produk”", hint: "Tombol di section produk." },
];

export function ContactsForm({ initial }: { initial: SiteContacts }) {
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setBusy(true);
    setMessage(null);
    const result = await saveContactsAction(values);
    setBusy(false);
    setMessage(
      result.ok
        ? { ok: true, text: "Tersimpan. Tombol di situs ikut menyesuaikan." }
        : { ok: false, text: result.message ?? "Gagal menyimpan." },
    );
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="space-y-4">
          {FIELDS.map((field) => (
            <label key={field.key} className="block">
              <span className="text-sm font-semibold">{field.label}</span>
              <input
                value={values[field.key]}
                placeholder={field.placeholder}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                }
                className={cn(FIELD, "mt-1.5")}
              />
              {field.hint && <span className="mt-1 block text-xs text-muted">{field.hint}</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="blue-grad inline-flex min-h-11 items-center rounded-pill px-6 text-sm font-bold text-white disabled:opacity-70"
        >
          {busy ? "Menyimpan…" : "Simpan kontak"}
        </button>
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
