"use client";

import { useState } from "react";

import { savePaymentSettingsAction } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import type { PaymentChannelSetting, PaymentMethodSetting } from "@/lib/settings";

import { ImageUploadField } from "./ImageUploadField";

const FIELD =
  "w-full rounded-xl border border-line px-3.5 py-2.5 text-sm font-semibold outline-none transition focus:border-brand";

export function PaymentSettingsForm({ initial }: { initial: PaymentMethodSetting[] }) {
  const [methods, setMethods] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

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
    setMessage(null);
    const result = await savePaymentSettingsAction(methods);
    setBusy(false);
    setMessage(
      result.ok
        ? { ok: true, text: "Tersimpan. Situs sudah memakai nilai baru." }
        : { ok: false, text: result.message ?? "Gagal menyimpan." },
    );
  }

  return (
    <div className="space-y-5">
      {methods.map((method, methodIndex) => (
        <section key={method.slug} className="card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{method.name}</h3>
            <span className="rounded-pill bg-soft px-2.5 py-1 font-mono text-[11px] text-muted">
              {method.slug}
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-muted">Nama tampil</span>
              <input
                value={method.name}
                onChange={(event) => patchMethod(methodIndex, { name: event.target.value })}
                className={cn(FIELD, "mt-1.5")}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">Keterangan singkat</span>
              <input
                value={method.description}
                onChange={(event) => patchMethod(methodIndex, { description: event.target.value })}
                className={cn(FIELD, "mt-1.5")}
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-semibold text-muted">
              Langkah pembayaran — satu langkah per baris. Pakai {"{channel}"} untuk nama
              bank/e-wallet yang dipilih.
            </span>
            <textarea
              value={method.instructions.join("\n")}
              onChange={(event) =>
                patchMethod(methodIndex, {
                  instructions: event.target.value.split("\n").filter((line) => line.trim()),
                })
              }
              rows={Math.max(3, method.instructions.length)}
              className={cn(FIELD, "mt-1.5 leading-relaxed")}
            />
          </label>

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
              <p className="text-xs font-semibold text-muted">
                {method.slug === "transfer"
                  ? "Nomor rekening tujuan"
                  : "Kode pembayaran tiap channel"}
              </p>

              <div className="mt-3 space-y-3">
                {method.channels.map((channel, channelIndex) => (
                  <div
                    key={channel.slug}
                    className="grid gap-2 sm:grid-cols-[minmax(0,120px)_minmax(0,1fr)_minmax(0,1fr)]"
                  >
                    <input
                      value={channel.label}
                      placeholder="Nama"
                      onChange={(event) =>
                        patchChannel(methodIndex, channelIndex, { label: event.target.value })
                      }
                      className={FIELD}
                    />
                    {method.slug === "transfer" ? (
                      <>
                        <input
                          value={channel.accountNo ?? ""}
                          placeholder="Nomor rekening"
                          onChange={(event) =>
                            patchChannel(methodIndex, channelIndex, {
                              accountNo: event.target.value,
                            })
                          }
                          className={cn(FIELD, "font-mono")}
                        />
                        <input
                          value={channel.accountName ?? ""}
                          placeholder="Atas nama"
                          onChange={(event) =>
                            patchChannel(methodIndex, channelIndex, {
                              accountName: event.target.value,
                            })
                          }
                          className={FIELD}
                        />
                      </>
                    ) : (
                      <>
                        <input
                          value={channel.codePrefix ?? ""}
                          placeholder="Prefix kode"
                          onChange={(event) =>
                            patchChannel(methodIndex, channelIndex, {
                              codePrefix: event.target.value,
                            })
                          }
                          className={cn(FIELD, "font-mono")}
                        />
                        <input
                          value={channel.codeLength ?? ""}
                          placeholder="Panjang kode"
                          inputMode="numeric"
                          onChange={(event) =>
                            patchChannel(methodIndex, channelIndex, {
                              codeLength: Number(event.target.value) || undefined,
                            })
                          }
                          className={cn(FIELD, "font-mono")}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="blue-grad inline-flex min-h-11 items-center rounded-pill px-6 text-sm font-bold text-white disabled:opacity-70"
        >
          {busy ? "Menyimpan…" : "Simpan pengaturan"}
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
