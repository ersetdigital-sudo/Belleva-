"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";

import { paymentMethods } from "@/data/payment-methods";
import { groupStroomCode, inquireBill, makeStroomCode } from "@/lib/billing";
import { resolvePostpaid, resolvePrepaid } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { saveTransaction } from "@/lib/transactions";
import type { PaymentChannel, PaymentMethod, PaymentMethodId } from "@/types";

import { CheckIcon, PaymentIcon } from "@/components/icons";

const PROCESSING_MS = 1400;
/** How long the QR / account details stay valid before the order is cancelled. */
const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000;
const STEPS = ["Data", "Metode", "Bayar", "Selesai"];

type Status = "form" | "awaiting" | "processing" | "done";

interface PaymentRef {
  /** QR payload, bank account number, or e-wallet code depending on the method. */
  code: string;
  deadline: number;
}

/* ---------------------------------------------------------------------------
   Impure helpers live at module scope (random ids, wall clock) so they never
   run as part of render.
--------------------------------------------------------------------------- */

function makeReference() {
  return `BLV${String(Date.now()).slice(-8)}`;
}

function createPaymentRef(
  method: PaymentMethod,
  channel: PaymentChannel | undefined,
  reference: string,
  total: number,
  customer: string,
): PaymentRef {
  const deadline = Date.now() + PAYMENT_WINDOW_MS;

  // QRIS: one QR payload covers every bank and e-wallet.
  if (method.id === "qris") {
    return { code: `QRIS|${siteConfig.name}|${reference}|${total}|${customer}`, deadline };
  }

  // Transfer bank: show the destination account as-is.
  if (channel?.account) {
    return { code: channel.account.number, deadline };
  }

  // E-wallet: a generated payment code.
  let tail = "";
  const length = channel?.codeLength ?? 8;
  for (let index = 0; index < length; index += 1) {
    tail += Math.floor(Math.random() * 10);
  }
  return { code: `${channel?.codePrefix ?? ""}${tail}`, deadline };
}

/** Groups a long code in blocks of four so it is readable: "8999 1234 5678". */
function groupCode(code: string): string {
  return code.replace(/(.{4})/g, "$1 ").trim();
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function formatClock(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("text-right", strong ? "font-bold text-ink" : "font-semibold")}>{value}</dd>
    </div>
  );
}

/** Ticking countdown for the payment deadline. */
function useCountdown(deadline: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  return deadline ? Math.max(0, deadline - now) : 0;
}

function CopyButton({ value, label = "Salin" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the value stays visible on screen */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "min-h-11 shrink-0 rounded-pill px-5 text-sm font-bold transition",
        copied ? "bg-success-soft text-success" : "bg-soft text-brand hover:bg-line",
      )}
    >
      {copied ? "Tersalin ✓" : label}
    </button>
  );
}

export function PaymentFlow() {
  const params = useSearchParams();
  const reduceMotion = useReducedMotion();

  const groupId = params.get("group");
  const vendorId = params.get("vendor");
  const customer = params.get("customer") ?? "";

  const prepaid = useMemo(
    () => resolvePrepaid({ groupId, vendorId, itemId: params.get("item") }),
    [groupId, vendorId, params],
  );
  const postpaid = useMemo(
    () =>
      resolvePostpaid({ groupId, vendorId, choiceId: params.get("choice"), customer }),
    [groupId, vendorId, customer, params],
  );
  const order = prepaid ?? postpaid;

  // The payment page re-runs the inquiry rather than trusting an amount from
  // the query string — the same thing a real biller integration does.
  const bill = useMemo(
    () => (postpaid ? inquireBill(postpaid.group, postpaid.vendor, customer, postpaid.choice) : null),
    [postpaid, customer],
  );

  const [method, setMethod] = useState<PaymentMethodId>("qris");
  const [channelId, setChannelId] = useState("bca");
  const [status, setStatus] = useState<Status>("form");
  const [payment, setPayment] = useState<PaymentRef | null>(null);
  const [reference, setReference] = useState(makeReference);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const activeMethod = paymentMethods.find((entry) => entry.id === method) ?? paymentMethods[0];
  const activeChannel =
    activeMethod.channels?.find((entry) => entry.id === channelId) ?? activeMethod.channels?.[0];
  const paymentLabel = activeChannel
    ? `${activeMethod.name} · ${activeChannel.label}`
    : activeMethod.name;

  const remaining = useCountdown(payment?.deadline ?? null);
  const isProcessing = status === "processing";
  const isDone = status === "done";
  const isAwaiting = status === "awaiting";
  const currentStep = isDone ? 3 : status === "form" ? 1 : 2;

  const price = order?.kind === "prepaid" ? (order.price ?? 0) : 0;
  const total = order?.kind === "prepaid" ? price + siteConfig.serviceFee : (bill?.total ?? 0);

  /**
   * Mirror the order into this browser's history as soon as it is created, then
   * again when it settles. That store is what the "Cek Transaksi" page reads —
   * the simulation has no server-side record to query.
   */
  useEffect(() => {
    if (!order) return;
    if (status !== "awaiting" && status !== "done") return;
    saveTransaction({
      reference,
      customer,
      productName: order.name,
      groupLabel: order.group.label,
      method: paymentLabel,
      total,
      status: status === "done" ? "berhasil" : "menunggu",
    });
  }, [order, status, reference, customer, paymentLabel, total]);

  function startProcessing() {
    setStatus("processing");
    timerRef.current = window.setTimeout(() => {
      setStatus("done");
      timerRef.current = null;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }, PROCESSING_MS);
  }

  /**
   * "Bayar Sekarang" hands over the payment details (QR / account number /
   * e-wallet code) and waits for the transfer — it never claims success.
   */
  function handlePay() {
    if (status !== "form") return;
    // Balance payments settle instantly — there is nothing to transfer to.
    if (activeMethod.id === "saldo") {
      startProcessing();
      return;
    }
    setPayment(createPaymentRef(activeMethod, activeChannel, reference, total, customer));
    setStatus("awaiting");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function handleConfirmPaid() {
    if (status !== "awaiting") return;
    startProcessing();
  }

  function handleRestart() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPayment(null);
    setReference(makeReference());
    setStatus("form");
  }

  /* ------------------------------- Not found ------------------------------ */
  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <p className="text-xs font-bold tracking-widest text-brand">TRANSAKSI</p>
        <h1 className="h-display mt-3 text-2xl font-extrabold sm:text-3xl">
          Transaksi tidak ditemukan
        </h1>
        <p className="mt-3 text-sm text-muted">
          Produk yang kamu pilih sudah tidak tersedia atau tautannya belum lengkap.
        </p>
        <Link
          href="/#produk"
          className="blue-grad mt-7 inline-flex min-h-12 items-center rounded-pill px-7 text-sm font-bold text-white"
        >
          Pilih Produk Lagi
        </Link>
      </div>
    );
  }

  const group = order.group;
  const discount = order.originalPrice ? order.originalPrice - order.price : 0;
  const stroom = group.issueStroomCode ? groupStroomCode(makeStroomCode(reference)) : null;

  const detailsTitle =
    activeMethod.id === "qris"
      ? "Scan QRIS di bawah ini"
      : activeMethod.id === "transfer"
        ? `Nomor Rekening ${activeChannel?.label}`
        : `Kode Pembayaran ${activeChannel?.label}`;

  const instructions = activeMethod.instructions.map((line) =>
    line.replaceAll("{channel}", activeChannel?.label ?? ""),
  );

  /* --------------------------- Payment breakdown -------------------------- */
  const breakdown = (
    <dl className="mt-4 space-y-2 text-sm">
      {order.kind === "prepaid" ? (
        <>
          <Row label="Harga produk" value={formatRupiah(price)} />
          {discount > 0 && <Row label="Diskon" value={`-${formatRupiah(discount)}`} />}
          <Row label="Biaya layanan" value={formatRupiah(siteConfig.serviceFee)} />
        </>
      ) : (
        bill && (
          <>
            <Row label="Tagihan" value={formatRupiah(bill.base)} />
            {bill.penalty > 0 && <Row label="Denda" value={formatRupiah(bill.penalty)} />}
            <Row label="Biaya admin" value={formatRupiah(bill.adminFee)} />
          </>
        )
      )}
    </dl>
  );

  /* -------------------------------- Success ------------------------------- */
  if (isDone) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 lg:py-24">
        <div className="card p-7 text-center shadow-soft sm:p-9">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-pill bg-success-soft">
            <CheckIcon size={30} stroke="#17a45f" strokeWidth={2.6} />
          </span>
          <h1 className="h-display mt-5 text-2xl font-extrabold sm:text-3xl">Transaksi Berhasil!</h1>
          <p className="mt-2 text-sm text-muted">
            {group.id === "pln-token"
              ? "Token listrik sudah terbit. Masukkan nomor stroom di bawah ke meter prabayar kamu."
              : group.flow === "postpaid"
                ? "Tagihan sudah lunas. Bukti pembayaran bisa diunduh dari riwayat transaksi."
                : group.id === "data"
                  ? "Paket data sedang diproses ke nomor tujuan, biasanya kurang dari 1 menit."
                  : "Pulsa sedang dikirim ke nomor tujuan, biasanya kurang dari 1 menit."}
          </p>

          {stroom && (
            <div className="mt-6 rounded-2xl border border-line bg-white p-4">
              <p className="text-xs font-semibold text-muted">Nomor Stroom (20 digit)</p>
              <p className="h-display mt-2 text-lg font-extrabold tracking-wider break-all text-ink tabular-nums">
                {stroom}
              </p>
              <div className="mt-3">
                <CopyButton value={makeStroomCode(reference)} label="Salin Nomor Stroom" />
              </div>
            </div>
          )}

          <dl className="mt-7 space-y-2 rounded-2xl bg-soft p-4 text-left text-sm">
            <Row label="Produk" value={order.name} />
            <Row label={group.customer.label} value={customer} strong />
            <Row label="Metode" value={paymentLabel} />
            <Row label="No. Referensi" value={reference} />
            <div className="flex items-center justify-between gap-4 border-t border-line-2 pt-2">
              <dt className="font-semibold">Total Bayar</dt>
              <dd className="font-extrabold text-brand">{formatRupiah(total)}</dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="card flex min-h-12 flex-1 items-center justify-center rounded-pill text-sm font-semibold"
            >
              Kembali ke Beranda
            </Link>
            <button
              type="button"
              onClick={handleRestart}
              className="blue-grad flex min-h-12 flex-1 items-center justify-center rounded-pill text-sm font-bold text-white"
            >
              Transaksi Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------- Menunggu pembayaran ------------------------ */
  if (isAwaiting || (isProcessing && payment)) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-32 lg:pt-12 lg:pb-16">
        <button
          type="button"
          onClick={() => setStatus("form")}
          className="text-sm font-semibold text-muted transition-colors hover:text-brand"
        >
          ← Ganti metode pembayaran
        </button>

        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-warn/10 p-4 sm:items-center">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-pill bg-warn/20">
            <span className="h-3 w-3 animate-pulse rounded-full bg-warn" />
          </span>
          <div className="min-w-0">
            <p className="font-bold">Menunggu Pembayaran</p>
            <p className="text-sm text-muted">
              Selesaikan dalam{" "}
              <span className="font-bold text-ink tabular-nums">{formatRemaining(remaining)}</span>{" "}
              lagi (sebelum {formatClock(payment!.deadline)} WIB), setelah itu transaksi dibatalkan
              otomatis.
            </p>
          </div>
        </div>

        <section className="card mt-5 p-5 sm:p-6">
          <h2 className="text-sm font-bold">{detailsTitle}</h2>

          {activeMethod.id === "qris" ? (
            <div className="mt-4 grid place-items-center rounded-2xl border border-line bg-white p-5">
              <QRCodeSVG
                value={payment!.code}
                size={176}
                level="M"
                bgColor="#ffffff"
                fgColor="#0d1b39"
              />
              <p className="mt-3 text-center text-xs text-muted">
                Berlaku sampai {formatClock(payment!.deadline)} WIB
              </p>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">
                  {activeMethod.id === "transfer"
                    ? `Rekening ${activeChannel?.label}`
                    : "Kode pembayaran"}
                </p>
                <p className="h-display text-xl font-extrabold tracking-wider break-all text-ink tabular-nums sm:text-2xl">
                  {activeMethod.id === "transfer" ? payment!.code : groupCode(payment!.code)}
                </p>
              </div>
              <CopyButton value={payment!.code} />
            </div>
          )}

          {activeChannel?.account && (
            <p className="mt-3 rounded-xl bg-soft px-4 py-3 text-sm">
              <span className="text-muted">Atas nama</span>{" "}
              <strong className="text-ink">{activeChannel.account.holder}</strong>
            </p>
          )}

          <dl className="mt-5 space-y-2 border-t border-line-2 pt-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Jumlah Bayar</dt>
              <dd className="flex items-center gap-3">
                <span className="text-base font-extrabold text-brand tabular-nums">
                  {formatRupiah(total)}
                </span>
                <CopyButton value={String(total)} />
              </dd>
            </div>
            <Row label="No. Referensi" value={reference} />
            <Row label="Metode" value={paymentLabel} />
            <Row label={group.customer.label} value={customer} />
          </dl>

          <p className="mt-4 rounded-xl bg-soft px-4 py-3 text-xs leading-relaxed text-muted">
            {activeMethod.id === "qris"
              ? "Cukup scan sekali, nominal sudah terkunci di QR-nya."
              : `Transfer dengan nominal persis ${formatRupiah(total)} supaya pembayaran terverifikasi otomatis.`}
          </p>
        </section>

        <section className="card mt-5 p-5 sm:p-6">
          <h2 className="text-sm font-bold">Cara Pembayaran</h2>
          <ol className="mt-4 space-y-3">
            {instructions.map((line, index) => (
              <li key={line} className="flex gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-soft text-xs font-bold text-brand">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-muted">{line}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-6 hidden gap-3 sm:flex">
          <button
            type="button"
            onClick={() => setStatus("form")}
            disabled={isProcessing}
            className="card flex min-h-12 flex-1 items-center justify-center rounded-pill text-sm font-semibold"
          >
            Ganti Metode Pembayaran
          </button>
          <button
            type="button"
            onClick={handleConfirmPaid}
            disabled={isProcessing}
            className="blue-grad flex min-h-12 flex-1 items-center justify-center rounded-pill text-sm font-bold text-white shadow-soft"
          >
            {isProcessing ? "Memeriksa…" : "Saya Sudah Bayar"}
          </button>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-5 py-3 backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted">Sisa waktu</p>
              <p className="truncate text-lg font-extrabold text-warn tabular-nums">
                {formatRemaining(remaining)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirmPaid}
              disabled={isProcessing}
              className="blue-grad ml-auto min-h-12 flex-1 rounded-pill px-4 text-sm font-bold text-white"
            >
              {isProcessing ? "Memeriksa…" : "Saya Sudah Bayar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------- Form --------------------------------- */
  return (
    <div className="mx-auto w-full max-w-5xl px-5 pt-8 pb-32 lg:pt-12 lg:pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/#produk"
          className="text-sm font-semibold text-muted transition-colors hover:text-brand"
        >
          ← Kembali belanja
        </Link>
        <span className="inline-flex items-center gap-2 rounded-pill bg-success-soft px-3 py-1.5 text-xs font-semibold text-success">
          <CheckIcon size={11} stroke="#17a45f" strokeWidth={3} />
          Pembayaran Aman
        </span>
      </div>

      <h1 className="h-display mt-5 text-2xl font-extrabold sm:text-3xl">Selesaikan Pembayaran</h1>
      <p className="mt-1.5 text-sm text-muted">Cek rincian transaksi sebelum melanjutkan.</p>

      <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        {STEPS.map((label, index) => {
          const isDoneStep = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                  isDoneStep
                    ? "blue-grad text-white"
                    : isCurrent
                      ? "border-2 border-brand text-brand"
                      : "bg-soft text-muted",
                )}
              >
                {isDoneStep ? <CheckIcon size={11} /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold sm:text-sm",
                  isCurrent ? "text-ink" : "text-muted",
                )}
              >
                {label}
              </span>
              {index < STEPS.length - 1 && <span className="ml-1 h-px w-6 bg-line sm:w-10" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-5">
          <section className="card p-5 sm:p-6">
            <h2 className="text-sm font-bold">Detail Transaksi</h2>
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-soft p-4">
              <div className="min-w-0">
                <p className="font-bold">{order.name}</p>
                <p className="text-xs text-muted">{order.subtitle}</p>
              </div>
              <p className="ml-auto text-right font-extrabold text-brand">
                {formatRupiah(order.kind === "prepaid" ? price : total)}
              </p>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <Row label={group.customer.label} value={customer} strong />
              {order.vendor && <Row label={group.vendorLabel ?? "Penyedia"} value={order.vendor.label} />}
              <Row label="Jenis" value={group.flow === "prepaid" ? "Prabayar" : "Pascabayar"} />
              {bill && <Row label="Periode" value={bill.period} />}
              {bill?.extras.map((extra) => <Row key={extra.label} label={extra.label} value={extra.value} />)}
            </dl>
          </section>

          <section className="card overflow-hidden">
            <h2 className="border-b border-line px-5 py-4 text-sm font-bold sm:px-6">
              Metode Pembayaran
            </h2>
            <div className="divide-y divide-line">
              {paymentMethods.map((entry) => {
                const selected = entry.id === method;
                const picked =
                  entry.channels?.find((c) => c.id === channelId) ?? entry.channels?.[0];
                return (
                  <div key={entry.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-5 py-4 transition sm:px-6",
                        "has-[:focus-visible]:bg-soft",
                        selected && "bg-soft",
                      )}
                    >
                      <input
                        type="radio"
                        name="pay-method"
                        checked={selected}
                        onChange={() => setMethod(entry.id)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                          selected ? "border-brand bg-brand" : "border-line-2",
                        )}
                      >
                        {selected && <CheckIcon />}
                      </span>
                      <span
                        className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-pill",
                          entry.tintClass,
                        )}
                      >
                        <PaymentIcon id={entry.icon} stroke={entry.stroke} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{entry.name}</span>
                        <span className="block text-xs text-muted">{entry.description}</span>
                      </span>
                    </label>

                    {selected && entry.channels && (
                      <div
                        role="group"
                        aria-label={`Pilih ${entry.name}`}
                        className="grid gap-2 px-5 pb-5 sm:grid-cols-2 sm:px-6"
                      >
                        {entry.channels.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={picked?.id === option.id}
                            onClick={() => setChannelId(option.id)}
                            className={cn(
                              "min-h-12 rounded-2xl border px-4 text-sm font-semibold transition",
                              picked?.id === option.id
                                ? "border-brand bg-white text-brand"
                                : "border-line text-muted hover:border-line-2 hover:text-brand",
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <section className="card p-5 sm:p-6">
            <h2 className="text-sm font-bold">Rincian Pembayaran</h2>
            {breakdown}
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-line-2 pt-4">
              <span className="font-semibold">Total Bayar</span>
              <span className="text-xl font-extrabold text-brand">{formatRupiah(total)}</span>
            </div>

            <button
              type="button"
              onClick={handlePay}
              className="blue-grad mt-5 hidden min-h-12 w-full items-center justify-center rounded-pill font-bold text-white shadow-soft lg:flex"
            >
              {activeMethod.id === "saldo" ? "Bayar dengan Saldo" : "Bayar Sekarang"}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted">
              Transaksi dilindungi enkripsi {siteConfig.name}. Pastikan nomor sudah benar.
            </p>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-5 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted">Total Bayar</p>
            <p className="truncate text-lg font-extrabold text-brand">{formatRupiah(total)}</p>
          </div>
          <button
            type="button"
            onClick={handlePay}
            className="blue-grad ml-auto min-h-12 flex-1 rounded-pill px-4 text-sm font-bold text-white"
          >
            {activeMethod.id === "saldo" ? "Bayar dengan Saldo" : "Bayar Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
