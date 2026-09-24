"use client";

import { useMemo, useState } from "react";

import { saveContactsAction } from "@/lib/admin/actions";
import type { SiteContacts } from "@/lib/settings";

import { useToast } from "./Toast";
import { SaveBar, SectionCard, TextInput } from "./ui";

const FIELDS: {
  key: keyof SiteContacts;
  label: string;
  hint?: string;
  placeholder?: string;
  group: "kontak" | "tautan";
}[] = [
  {
    key: "whatsapp",
    label: "Nomor WhatsApp",
    hint: "Format internasional tanpa tanda +. Kosongkan untuk menyembunyikan tombol WhatsApp di seluruh situs.",
    placeholder: "6281234567890",
    group: "kontak",
  },
  {
    key: "email",
    label: "Email",
    hint: "Kosongkan untuk menyembunyikan tombol Email. Dipakai sebagai tautan mailto.",
    placeholder: "hello@belleva.net",
    group: "kontak",
  },
  {
    key: "helpCenter",
    label: "Tautan Pusat Bantuan",
    placeholder: "/pusat-bantuan",
    group: "tautan",
  },
  {
    key: "contact",
    label: "Tautan Hubungi Kami",
    hint: "Masih kosong — isi kalau halaman kontaknya sudah ada.",
    group: "tautan",
  },
  {
    key: "terms",
    label: "Tautan Syarat & Ketentuan",
    placeholder: "/syarat-ketentuan",
    group: "tautan",
  },
  {
    key: "privacy",
    label: "Tautan Kebijakan Privasi",
    placeholder: "/kebijakan-privasi",
    group: "tautan",
  },
  {
    key: "allProducts",
    label: "Tautan “Lihat Semua Produk”",
    hint: "Tombol di section produk pada beranda.",
    group: "tautan",
  },
];

export function ContactsForm({ initial }: { initial: SiteContacts }) {
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);

  const saved = useMemo(() => JSON.stringify(initial), [initial]);
  const dirty = JSON.stringify(values) !== saved;

  async function save() {
    setBusy(true);
    const result = await saveContactsAction(values);
    setBusy(false);

    if (!result.ok) {
      toast.error("Gagal menyimpan kontak", {
        description: result.message ?? "Coba lagi sebentar lagi.",
      });
      return;
    }
    toast.success("Kontak tersimpan", {
      description: "Tombol WhatsApp dan Email di situs ikut menyesuaikan.",
    });
  }

  return (
    <div className="space-y-5">
      <SectionCard
        title="Kontak yang bisa dihubungi"
        description="Dikosongkan berarti tombolnya tidak dirender sama sekali — bukan tombol yang tidak ke mana-mana."
      >
        <div className="space-y-4">
          {FIELDS.filter((field) => field.group === "kontak").map((field) => (
            <TextInput
              key={field.key}
              label={field.label}
              hint={field.hint}
              placeholder={field.placeholder}
              value={values[field.key]}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
              }
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Tautan halaman"
        description="Alamat yang dipakai footer, dropdown Bantuan, dan tombol di beranda."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.filter((field) => field.group === "tautan").map((field) => (
            <TextInput
              key={field.key}
              label={field.label}
              hint={field.hint}
              placeholder={field.placeholder}
              value={values[field.key]}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
              }
            />
          ))}
        </div>
      </SectionCard>

      <SaveBar
        dirty={dirty}
        busy={busy}
        onSave={() => void save()}
        onReset={() => setValues(initial)}
        label="Simpan kontak"
      />
    </div>
  );
}
