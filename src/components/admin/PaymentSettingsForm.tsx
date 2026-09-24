"use client";

import { useMemo, useState } from "react";

import { savePaymentSettingsAction } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import type { PaymentChannelSetting, PaymentMethodSetting } from "@/lib/settings";
import type { PaymentIconId } from "@/types";

import { AlertIcon, ChevronDownIcon, PaymentIcon } from "@/components/icons";

import { ImageUploadField } from "./ImageUploadField";
import { useToast } from "./Toast";
import { SaveBar, TextArea, TextInput } from "./ui";

/** The method slugs and the icon set spell two of these differently. */
const METHOD_ICON: Record<string, PaymentIconId> = {
  qris: "qris",
  transfer: "bank",
  ewallet: "ewallet",
  saldo: "balance",
};

/** One line describing what the method actually holds. */
function summaryFor(method: PaymentMethodSetting): string {
  if (method.slug === "transfer") return `${method.channels.length} bank · ${method.channels.length} rekening`;
  if (method.channels.length > 0) return `${method.channels.length} channel · ${method.instructions.length} langkah`;
  return `${method.instructions.length} langkah pembayaran`;
}

/**
 * What still needs filling in for this method to work for a buyer.
 *
 * Surfaced on the collapsed card so the state of the setup is readable without
 * opening four sections to find the one that is half done.
 */
function gapsFor(method: PaymentMethodSetting): string[] {
  const gaps: string[] = [];
  if (!method.name.trim()) gaps.push("nama tampil");
  if (method.instructions.length === 0) gaps.push("langkah pembayaran");
  if (method.slug === "qris" && !method.qrUrl) gaps.push("gambar QRIS");
  if (method.slug === "transfer") {
    const incomplete = method.channels.filter(
      (channel) => !channel.accountNo?.trim() || !channel.accountName?.trim(),
    );
    if (incomplete.length > 0) gaps.push(`${incomplete.length} rekening belum lengkap`);
  }
  return gaps;
}

function FieldGroup({
  legend,
  description,
  children,
}: {
  legend: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-t border-line-2 pt-5">
      <legend className="text-[11px] font-bold tracking-wider text-muted uppercase">
        {legend}
      </legend>
      {description && <p className="mt-1 text-xs text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}

/**
 * Payment settings, as a list of methods that open one at a time.
 *
 * It used to be every field of every method in one long column, which made it
 * impossible to see what was configured and what was still blank. Each method is
 * a card now: the collapsed state carries its summary and what is missing, and
 * the fields only appear once you open the one you came for.
 */
export function PaymentSettingsForm({ initial }: { initial: PaymentMethodSetting[] }) {
  const toast = useToast();
  const [methods, setMethods] = useState(initial);
  const [busy, setBusy] = useState(false);
  /** The first method that still needs work is the one worth opening. */
  const [openSlug, setOpenSlug] = useState<string | null>(
    () => initial.find((method) => gapsFor(method).length > 0)?.slug ?? initial[0]?.slug ?? null,
  );

  const saved = useMemo(() => JSON.stringify(initial), [initial]);
  const dirty = JSON.stringify(methods) !== saved;

  function patchMethod(slug: string, next: Partial<PaymentMethodSetting>) {
    setMethods((prev) => prev.map((entry) => (entry.slug === slug ? { ...entry, ...next } : entry)));
  }

  function patchChannel(
    slug: string,
    channelSlug: string,
    next: Partial<PaymentChannelSetting>,
  ) {
    setMethods((prev) =>
      prev.map((entry) =>
        entry.slug === slug
          ? {
              ...entry,
              channels: entry.channels.map((channel) =>
                channel.slug === channelSlug ? { ...channel, ...next } : channel,
              ),
            }
          : entry,
      ),
    );
  }

  async function save() {
    setBusy(true);
    const result = await savePaymentSettingsAction(methods);
    setBusy(false);

    if (!result.ok) {
      toast.error("Gagal menyimpan pembayaran", {
        description: result.message ?? "Coba lagi sebentar lagi.",
      });
      return;
    }
    toast.success("Pengaturan pembayaran tersimpan", {
      description: "Halaman pembayaran langsung memakai nama, langkah, dan nomor yang baru.",
    });
  }

  return (
    <div className="space-y-4">
      {methods.map((method) => {
        const open = openSlug === method.slug;
        const gaps = gapsFor(method);
        const ready = gaps.length === 0;

        return (
          <section key={method.slug} className="card overflow-hidden">
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`metode-${method.slug}`}
                onClick={() => setOpenSlug(open ? null : method.slug)}
                className="flex w-full cursor-pointer items-center gap-4 p-5 text-left transition-colors hover:bg-soft"
              >
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft"
                >
                  <PaymentIcon id={METHOD_ICON[method.slug] ?? "qris"} stroke="#1668f5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="truncate font-bold text-ink">{method.name || method.slug}</span>
                    <span className="rounded-pill bg-soft px-2 py-0.5 font-mono text-[10px] text-muted">
                      {method.slug}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted">
                    {summaryFor(method)}
                  </span>
                </span>

                <span
                  className={cn(
                    "hidden shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-bold whitespace-nowrap sm:inline-flex",
                    ready ? "bg-success-soft text-success" : "bg-warn/15 text-warn",
                  )}
                >
                  {!ready && <AlertIcon size={12} />}
                  {ready ? "Siap" : `${gaps.length} perlu diisi`}
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-transform duration-200 motion-reduce:transition-none",
                    open && "rotate-180",
                  )}
                >
                  <ChevronDownIcon size={18} />
                </span>
              </button>
            </h3>

            {/* The gaps are worth naming even when the card is shut. */}
            {!open && !ready && (
              <p className="border-t border-line-2 px-5 py-3 text-xs text-muted">
                Belum lengkap: {gaps.join(", ")}.
              </p>
            )}

            {open && (
              <div id={`metode-${method.slug}`} className="space-y-5 border-t border-line-2 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Nama tampil"
                    value={method.name}
                    hint="Nama ini yang dibaca pembeli di daftar metode bayar."
                    onChange={(event) => patchMethod(method.slug, { name: event.target.value })}
                  />
                  <TextInput
                    label="Keterangan singkat"
                    value={method.description}
                    hint="Baris kecil di bawah namanya."
                    onChange={(event) =>
                      patchMethod(method.slug, { description: event.target.value })
                    }
                  />
                </div>

                <TextArea
                  label="Langkah pembayaran"
                  hint="Satu langkah per baris, urut dari atas. Pakai {channel} untuk nama bank atau e-wallet yang dipilih pembeli."
                  value={method.instructions.join("\n")}
                  rows={Math.max(3, method.instructions.length)}
                  onChange={(event) =>
                    patchMethod(method.slug, {
                      instructions: event.target.value.split("\n").filter((line) => line.trim()),
                    })
                  }
                />

                {method.slug === "qris" && (
                  <ImageUploadField
                    label="Gambar QRIS"
                    hint="Gambar ini yang dipindai pembeli. Menggantinya berarti gambar lama dihapus dari Cloudinary."
                    value={method.qrUrl}
                    publicId={method.qrPublicId}
                    subfolder="qris"
                    onChange={({ url, publicId }) =>
                      patchMethod(method.slug, { qrUrl: url, qrPublicId: publicId })
                    }
                  />
                )}

                {method.channels.length > 0 && (
                  <FieldGroup
                    legend={method.slug === "transfer" ? "Rekening tujuan" : "Kode per channel"}
                    description={
                      method.slug === "transfer"
                        ? "Nomor dan atas nama ini yang ditampilkan ke pembeli setelah memilih banknya."
                        : "Prefix dan panjang kode dipakai untuk membuat kode bayar yang harus ditransfer persis."
                    }
                  >
                    <div className="space-y-4">
                      {method.channels.map((channel) => (
                        <div key={channel.slug} className="rounded-2xl bg-soft p-4">
                          <p className="text-xs font-bold text-muted">
                            {method.slug === "transfer" ? "Bank" : "Channel"} · {channel.slug}
                          </p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <TextInput
                              label="Nama"
                              value={channel.label}
                              onChange={(event) =>
                                patchChannel(method.slug, channel.slug, {
                                  label: event.target.value,
                                })
                              }
                            />
                            {method.slug === "transfer" ? (
                              <>
                                <TextInput
                                  label="Nomor rekening"
                                  value={channel.accountNo ?? ""}
                                  className="font-mono"
                                  error={
                                    !channel.accountNo?.trim() ? "Belum diisi." : undefined
                                  }
                                  onChange={(event) =>
                                    patchChannel(method.slug, channel.slug, {
                                      accountNo: event.target.value,
                                    })
                                  }
                                />
                                <TextInput
                                  label="Atas nama"
                                  value={channel.accountName ?? ""}
                                  error={
                                    !channel.accountName?.trim() ? "Belum diisi." : undefined
                                  }
                                  onChange={(event) =>
                                    patchChannel(method.slug, channel.slug, {
                                      accountName: event.target.value,
                                    })
                                  }
                                />
                              </>
                            ) : (
                              <>
                                <TextInput
                                  label="Prefix kode"
                                  value={channel.codePrefix ?? ""}
                                  className="font-mono"
                                  onChange={(event) =>
                                    patchChannel(method.slug, channel.slug, {
                                      codePrefix: event.target.value,
                                    })
                                  }
                                />
                                <TextInput
                                  label="Panjang kode"
                                  inputMode="numeric"
                                  value={channel.codeLength ?? ""}
                                  className="font-mono"
                                  onChange={(event) =>
                                    patchChannel(method.slug, channel.slug, {
                                      codeLength: Number(event.target.value) || undefined,
                                    })
                                  }
                                />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FieldGroup>
                )}
              </div>
            )}
          </section>
        );
      })}

      <SaveBar
        dirty={dirty}
        busy={busy}
        onSave={() => void save()}
        onReset={() => setMethods(initial)}
        label="Simpan pengaturan"
      />
    </div>
  );
}
