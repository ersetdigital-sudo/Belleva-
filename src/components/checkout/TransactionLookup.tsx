"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { lookupOrdersAction } from "@/app/actions/orders";
import { cn } from "@/lib/cn";
import { formatDateTime, formatRupiah } from "@/lib/format";
import type { LookupScope, Order, OrderStatus } from "@/lib/orders";

import { SearchIcon } from "@/components/icons";

const STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu: "Menunggu pembayaran",
  berhasil: "Berhasil",
  gagal: "Gagal",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  menunggu: "bg-warn/15 text-warn",
  berhasil: "bg-success-soft text-success",
  gagal: "bg-danger-soft text-danger",
};

function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-pill px-3 py-1 text-[11px] leading-none font-bold",
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

function TransactionCard({ entry }: { entry: Order }) {
  return (
    <li className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold">{entry.productName}</p>
          <p className="mt-0.5 text-xs text-muted">
            {entry.vendorLabel ? `${entry.vendorLabel} · ` : ""}
            {formatDateTime(new Date(entry.createdAt).getTime())}
          </p>
        </div>
        <StatusPill status={entry.status} />
      </div>

      <dl className="mt-4 space-y-2 border-t border-line-2 pt-4 text-sm">
        <DetailRow label="Nomor tujuan" value={entry.customer} />
        <DetailRow label="Jenis" value={entry.groupLabel} />
        <DetailRow label="Metode" value={entry.method} />
        <DetailRow label="No. referensi" value={entry.reference} />
        <div className="flex items-center justify-between gap-4 border-t border-line-2 pt-2">
          <dt className="font-semibold">Total</dt>
          <dd className="font-extrabold text-brand">{formatRupiah(entry.total)}</dd>
        </div>
      </dl>
    </li>
  );
}

/**
 * Looks up a transaction on the server, by reference code or customer number.
 *
 * This used to read a history kept in the visitor's own browser, which meant an
 * order placed on a phone was invisible on a laptop. It now queries the same
 * `orders` rows the admin panel manages, so a customer can check from anywhere.
 *
 * A lookup is a network round trip, so it runs on submit rather than on every
 * keystroke.
 */
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
    <div className="mx-auto w-full max-w-3xl px-5 py-12">
      <Link href="/" className="text-sm font-semibold text-muted transition-colors hover:text-brand">
        ← Kembali ke beranda
      </Link>

      <h1 className="h-display mt-5 text-2xl font-extrabold sm:text-3xl">Cek Transaksi</h1>
      <p className="mt-1.5 text-sm text-muted">
        Masukkan nomor HP atau nomor referensi untuk melihat status transaksi.
      </p>

      <form className="mt-6" onSubmit={search}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-line bg-white px-4 transition-colors focus-within:border-brand">
            <SearchIcon className="shrink-0 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: 81234567890 atau BLV12345678"
              aria-label="Nomor HP atau nomor referensi"
              className="w-full min-w-0 bg-transparent py-3.5 text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="blue-grad inline-flex min-h-12 items-center justify-center rounded-2xl px-7 text-sm font-bold text-white shadow-soft disabled:opacity-70"
          >
            {pending ? "Mencari…" : "Cek"}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Nomor HP bisa ditulis <span className="font-semibold">0812…</span>,{" "}
          <span className="font-semibold">812…</span>, atau{" "}
          <span className="font-semibold">+62 812…</span> — semuanya terbaca sama.
        </p>
      </form>

      <div className="mt-8" aria-live="polite">
        {result === null ? (
          <div className="card p-6 text-center">
            <p className="font-bold">Belum ada yang dicari</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Masukkan nomor HP / ID pelanggan atau nomor referensi di atas, lalu tekan Cek.
              Riwayat transaksi tersimpan di server Belleva, jadi bisa dicek dari perangkat mana
              pun.
            </p>
          </div>
        ) : error ? (
          <div className="card p-6 text-center">
            <p className="font-bold">Pencarian gagal</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Koneksi ke server sedang bermasalah. Coba tekan Cek sekali lagi.
            </p>
          </div>
        ) : orders.length > 0 ? (
          <>
            <h2 className="text-sm font-bold">
              {scope === "reference"
                ? "Transaksi dengan referensi ini"
                : "Transaksi untuk nomor ini"}
            </h2>
            {orders.length > 1 && (
              <p className="mt-1 text-xs text-muted">Menampilkan {orders.length} transaksi terbaru.</p>
            )}
            <ul className="mt-4 space-y-3">
              {orders.map((entry) => (
                <TransactionCard key={entry.id} entry={entry} />
              ))}
            </ul>
          </>
        ) : (
          <div className="card p-6 text-center">
            <p className="font-bold">
              {scope === "none"
                ? "Nomor belum lengkap"
                : `Tidak ada transaksi untuk “${submitted}”`}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              {scope === "none"
                ? "Masukkan nomor HP / ID pelanggan minimal 8 digit, atau nomor referensi lengkap yang diawali BLV."
                : "Pastikan nomor HP / ID pelanggan atau nomor referensinya benar. Nomor referensi ada di halaman pembayaran dan di struk transaksimu."}
            </p>
            <Link
              href="/#produk"
              className="blue-grad mt-6 inline-flex min-h-12 items-center rounded-pill px-7 text-sm font-bold text-white"
            >
              Mulai Transaksi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
