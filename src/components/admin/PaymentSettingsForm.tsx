"use client";

import { useMemo, useState } from "react";

import { savePaymentSettingsAction } from "@/lib/admin/actions";
import type { PaymentChannelSetting, PaymentMethodSetting } from "@/lib/settings";

import { ImageUploadField } from "./ImageUploadField";
import { useToast } from "./Toast";
import { SaveBar, SectionCard, TextArea, TextInput } from "./ui";

export function PaymentSettingsForm({ initial }: { initial: PaymentMethodSetting[] }) {
  const toast = useToast();
  const [methods, setMethods] = useState(initial);
  const [busy, setBusy] = useState(false);

  const saved = useMemo(() => JSON.stringify(initial), [initial]);
  const dirty = JSON.stringify(methods) !== saved;

  function patchMethod(index: number, next: Partial<PaymentMethodSetting>) {
    setMethods((prev) => prev.map((entry, i) => (i === index ? { ...entry, ...next } : entry)));
  }

  function patchChannel(
    methodIndex: number,
    channelIndex: number,
    next: Partial<PaymentChannelSetting>,
  ) {
    setMethods((prev) =>
      prev.map((entry, i) =>
        i === methodIndex
          ? {
              ...entry,
              channels: entry.channels.map((channel, ci) =>
                ci === channelIndex ? { ...channel, ...next } : channel,
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
    <div className="space-y-5">
      {methods.map((method, methodIndex) => (
        <SectionCard
          key={method.slug}
          title={method.name}
          description={method.description || undefined}
          aside={
            <span className="rounded-pill bg-soft px-2.5 py-1 font-mono text-[11px] text-muted">
              {method.slug}
            </span>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Nama tampil"
              value={method.name}
              onChange={(event) => patchMethod(methodIndex, { name: event.target.value })}
            />
            <TextInput
              label="Keterangan singkat"
              value={method.description}
              hint="Baris kecil di bawah nama, tampil di daftar metode bayar."
              onChange={(event) => patchMethod(methodIndex, { description: event.target.value })}
            />
          </div>

          <div className="mt-4">
            <TextArea
              label="Langkah pembayaran"
              hint="Satu langkah per baris. Pakai {channel} untuk nama bank atau e-wallet yang dipilih pembeli."
              value={method.instructions.join("\n")}
              rows={Math.max(3, method.instructions.length)}
              onChange={(event) =>
                patchMethod(methodIndex, {
                  instructions: event.target.value.split("\n").filter((line) => line.trim()),
                })
              }
            />
          </div>

          {method.slug === "qris" && (
            <div className="mt-5 border-t border-line-2 pt-5">
              <ImageUploadField
                label="Gambar QRIS"
                hint="Gambar ini yang tampil di halaman pembayaran saat pembeli memilih QRIS."
                value={method.qrUrl}
                publicId={method.qrPublicId}
                subfolder="qris"
                onChange={({ url, publicId }) =>
                  patchMethod(methodIndex, { qrUrl: url, qrPublicId: publicId })
                }
              />
            </div>
          )}

          {method.channels.length > 0 && (
            <div className="mt-5 border-t border-line-2 pt-5">
              <p className="text-sm font-bold">
                {method.slug === "transfer" ? "Rekening tujuan" : "Kode pembayaran per channel"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {method.slug === "transfer"
                  ? "Nomor dan atas nama ini yang ditampilkan ke pembeli setelah memilih banknya."
                  : "Prefix dan panjang kode dipakai untuk membuat kode bayar yang harus ditransfer persis."}
              </p>

              <div className="mt-4 space-y-4">
                {method.channels.map((channel, channelIndex) => (
                  <div key={channel.slug} className="rounded-2xl border border-line p-4">
                    <p className="text-xs font-bold text-muted">
                      {method.slug === "transfer" ? "Bank" : "Channel"} · {channel.slug}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <TextInput
                        label="Nama"
                        value={channel.label}
                        onChange={(event) =>
                          patchChannel(methodIndex, channelIndex, { label: event.target.value })
                        }
                      />
                      {method.slug === "transfer" ? (
                        <>
                          <TextInput
                            label="Nomor rekening"
                            value={channel.accountNo ?? ""}
                            className="font-mono"
                            onChange={(event) =>
                              patchChannel(methodIndex, channelIndex, {
                                accountNo: event.target.value,
                              })
                            }
                          />
                          <TextInput
                            label="Atas nama"
                            value={channel.accountName ?? ""}
                            onChange={(event) =>
                              patchChannel(methodIndex, channelIndex, {
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
                              patchChannel(methodIndex, channelIndex, {
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
                              patchChannel(methodIndex, channelIndex, {
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
            </div>
          )}
        </SectionCard>
      ))}

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
