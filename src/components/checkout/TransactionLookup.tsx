"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { lookupOrdersAction } from "@/app/actions/orders";
import { categoryGradient } from "@/data/categories";
import { cn } from "@/lib/cn";
import { formatDateTime, formatRupiah } from "@/lib/format";
import {
  ORDER_STATUS_STYLE,
  orderStatusLabel,
  type LookupScope,
  type Order,
  type OrderStatus,
} from "@/lib/orders";

import {
  AlertIcon,
  ArrowRightIcon,
  CategoryIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  CopyIcon,
  ReceiptIcon,
  SearchIcon,
} from "@/components/icons";
import type { CategoryIconId } from "@/types";

/**
 * What the status means for the person reading it, in one line.
 *
 * The card reports a status; this says what to do about it, which is the part a
 * customer actually needs — especially when money has already moved.
 */
const STATUS_NOTE: Record<OrderStatus, string> = {
  menunggu:
    "Selesaikan pembayaran dalam 24 jam. Kalau sudah dibayar tapi statusnya masih ini, hubungi dukungan dengan nomor referensi di samping.",
  berhasil: "Pembayaran diterima dan pesanannya sudah diproses.",
  gagal: "Pembayaran tidak selesai, jadi pesanannya hangus. Baris ini hanya catatan.",
};

/**
 * Rebuilds the checkout link for an order that was never paid.
 *
 * Orders saved before the catalogue ids were stored do not have them, and those
 * rows get no button rather than a link to a page that cannot resolve them.
 */
function canResume(order: Order): boolean {
  return (
    order.status === "menunggu" && Boolean(order.groupId) && Boolean(order.itemId ?? order.choiceId)
  );
}

function resumeHref(order: Order): string {
  const params = new URLSearchParams({
    group: order.groupId ?? "",
    customer: order.customer,
    ref: order.reference,
  });
  if (order.vendorId) params.set("vendor", order.vendorId);
  if (order.itemId) params.set("item", order.itemId);
  if (order.choiceId) params.set("choice", order.choiceId);
  return `/bayar?${params.toString()}`;
}

function StatusChip({ status }: { status: OrderStatus }) {
  const Icon = status === "berhasil" ? CheckIcon : status === "gagal" ? CloseIcon : ClockIcon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] leading-none font-bold whitespace-nowrap",
        ORDER_STATUS_STYLE[status],
      )}
    >
      {status === "berhasil" ? (
        <CheckIcon size={11} stroke="currentColor" strokeWidth={3.4} />
      ) : (
        <Icon size={12} />
      )}
      {orderStatusLabel(status)}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-bold tracking-wider text-muted uppercase">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

/**
 * One order, laid out like a receipt: who and what it was at the top, the total
 * as the figure worth reading, and the reference details underneath.
 *
 * The reference gets a copy button because the first thing anyone does with a
 * reference code is paste it into a complaint.
 */
function TransactionCard({ entry }: { entry: Order }) {
  const [copied, setCopied] = useState<"ok" | "failed" | null>(null);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(entry.reference);
      setCopied("ok");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied(null), 2200);
  }

  return (
    <li className="card overflow-hidden">
      <div className="flex items-start gap-3.5 p-5">
        {GROUP_ICON[entry.groupLabel] ? (
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
            style={{ background: categoryGradient(GROUP_ICON[entry.groupLabel]) }}
          >
            <CategoryIcon id={GROUP_ICON[entry.groupLabel]} />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft text-muted"
          >
            <ReceiptIcon size={20} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{entry.productName}</p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {entry.vendorLabel ? `${entry.vendorLabel} · ` : ""}
            {formatDateTime(new Date(entry.createdAt).getTime())}
          </p>
        </div>

        <StatusChip status={entry.status} />
      </div>

      <div className="border-t border-line-2 px-5 py-4">
        <dl className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
          <Detail label="Nomor tujuan" value={entry.customer} />
          <Detail label="Jenis" value={entry.groupLabel} />
          <Detail label="Metode bayar" value={entry.method} />
        </dl>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-soft px-3.5 py-2.5">
          <span className="min-w-0">
            <span className="block text-[11px] font-bold tracking-wider text-muted uppercase">
              No. referensi
            </span>
            <span className="mt-0.5 block truncate font-mono text-sm font-bold text-ink">
              {entry.reference}
            </span>
          </span>
          <button
            type="button"
            onClick={copyReference}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-pill border border-line bg-white px-3.5 text-xs font-bold text-brand transition-colors hover:border-brand"
          >
            <CopyIcon />
            {copied === "ok" ? "Tersalin" : "Salin"}
          </button>
          <span aria-live="polite" className="sr-only">
            {copied === "ok"
              ? "Nomor referensi tersalin."
              : copied === "failed"
                ? "Gagal menyalin, salin manual saja."
                : ""}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line-2 bg-white px-5 py-4">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-muted uppercase">Total bayar</p>
          <p className="mt-1 text-2xl leading-none font-extrabold text-brand tabular-nums">
            {formatRupiah(entry.total)}
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-end">
          {canResume(entry) && (
            <Link
              href={resumeHref(entry)}
              className="blue-grad inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-soft"
            >
              Lanjutkan pembayaran
              <ArrowRightIcon />
            </Link>
          )}
          <p className="max-w-[20rem] text-[11px] leading-relaxed text-muted sm:text-right">
            {STATUS_NOTE[entry.status]}
          </p>
        </div>
      </div>
    </li>
  );
}

/*
 * An order only carries the group's label, so the tile's icon is matched back by
 * name. Categories created in the admin are not in this map — they get a neutral
 * receipt tile rather than an icon borrowed from a different category.
 */
const GROUP_ICON: Record<string, CategoryIconId> = {
  Pulsa: "pulsa",
  "Paket Data": "paket-data",
  "Token Listrik": "pln",
  "Tagihan Listrik": "pln",
  "E-Money": "e-money",
  PDAM: "pdam",
  BPJS: "bpjs",
  Internet: "internet",
  Angsuran: "multifinance",
};

export function TransactionLookup() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [result, setResult] = useState<{ orders: Order[]; scope: LookupScope } | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function search(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();

    if (term.length < 3) {
      setSubmitted(term);
      setResult({ orders: [], scope: "none" });
      setError(false);
      return;
    }

    startTransition(async () => {
      const response = await lookupOrdersAction(term);
      setSubmitted(term);
      setResult({ orders: response.orders, scope: response.scope });
      setError(!response.ok);
    });
  }

  const orders = result?.orders ?? [];
  const scope = result?.scope ?? "none";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-muted transition-colors hover:text-brand"
      >
        ← Kembali ke beranda
      </Link>

      <h1 className="h-display mt-4 text-3xl font-extrabold sm:text-4xl">Cek Transaksi</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Masukkan nomor HP / ID pelanggan atau nomor referensi untuk melihat status transaksi.
        Riwayatnya tersimpan di server, jadi bisa dicek dari perangkat mana pun.
      </p>

      <form
        onSubmit={search}
        className="card mt-6 flex flex-col gap-3 p-3 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-soft px-3.5 focus-within:ring-2 focus-within:ring-brand/30">
          <SearchIcon size={18} className="shrink-0 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="81234567890 atau BLV12345678"
            aria-label="Nomor HP atau nomor referensi"
            className="w-full min-w-0 bg-transparent py-3 text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="blue-grad inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-8 text-sm font-bold text-white shadow-soft transition-opacity disabled:opacity-70"
        >
          {pending ? "Mencari…" : "Cek"}
        </button>
      </form>

      <div className="mt-8" aria-live="polite">
        {result === null ? (
          <div className="card p-8 text-center">
            <span
              aria-hidden="true"
              className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-soft text-brand"
            >
              <SearchIcon size={22} />
            </span>
            <p className="mt-4 font-bold">Belum ada yang dicari</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
              Isi nomor tujuan atau nomor referensi di atas, lalu tekan Cek.
            </p>
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <span
              aria-hidden="true"
              className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-danger-soft text-danger"
            >
              <AlertIcon size={20} />
            </span>
            <p className="mt-4 font-bold">Pencarian gagal</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
              Koneksi ke server sedang bermasalah. Coba tekan Cek sekali lagi.
            </p>
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-sm font-bold">
                {scope === "reference"
                  ? "Transaksi dengan referensi ini"
                  : "Transaksi untuk nomor ini"}
              </h2>
              <span className="rounded-pill bg-soft px-2.5 py-1 text-[11px] font-bold text-muted">
                {orders.length} transaksi
              </span>
            </div>
            <ul className="mt-4 space-y-4">
              {orders.map((entry) => (
                <TransactionCard key={entry.id} entry={entry} />
              ))}
            </ul>
          </>
        ) : (
          <div className="card p-8 text-center">
            <span
              aria-hidden="true"
              className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-warn/15 text-warn"
            >
              <AlertIcon size={20} />
            </span>
            <p className="mt-4 font-bold">
              {scope === "none" ? "Nomor belum lengkap" : `Tidak ada transaksi untuk “${submitted}”`}
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
              {scope === "none"
                ? "Masukkan nomor HP / ID pelanggan minimal 8 digit, atau nomor referensi lengkap yang diawali BLV."
                : "Pastikan nomornya benar. Nomor referensi ada di halaman pembayaran dan di struk transaksimu."}
            </p>
            <Link
              href="/#produk"
              className="blue-grad mt-6 inline-flex min-h-12 items-center rounded-xl px-7 text-sm font-bold text-white shadow-soft"
            >
              Mulai Transaksi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
