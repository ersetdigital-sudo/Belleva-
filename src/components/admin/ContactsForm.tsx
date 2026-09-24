"use client";

import { useMemo, useState } from "react";

import { saveContactsAction } from "@/lib/admin/actions";
import type { SiteContacts } from "@/lib/settings";

import { useToast } from "./Toast";
import { SaveBar, SectionCard, TextInput } from "./ui";

/**
 * The page links (help centre, legal documents, catalogue) used to be editable
 * here too. They are real routes now, so there is nothing left to configure —
 * only the two channels a customer can actually reach a person through.
 */
const FIELDS: { key: keyof SiteContacts; label: string; hint?: string; placeholder?: string }[] = [
  {
    key: "whatsapp",
    label: "Nomor WhatsApp",
    hint: "Format internasional tanpa tanda +. Kosongkan untuk menyembunyikan tombol WhatsApp di seluruh situs, termasuk halaman Hubungi Kami.",
    placeholder: "6281234567890",
  },
  {
    key: "email",
    label: "Email",
    hint: "Kosongkan untuk menyembunyikan tombol Email. Dipakai sebagai tautan mailto.",
    placeholder: "hello@belleva.net",
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
        description="Yang diisi di sini muncul sebagai tombol di halaman Hubungi Kami dan di footer. Dikosongkan berarti tombolnya tidak dirender sama sekali."
      >
        <div className="space-y-4">
          {FIELDS.map((field) => (
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
