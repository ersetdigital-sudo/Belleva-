"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import {
  findTransactions,
  formatTransactionDate,
  getTransactionsServerSnapshot,
  getTransactionsSnapshot,
  subscribeTransactions,
  type StoredTransaction,
} from "@/lib/transactions";

import { SearchIcon } from "@/components/icons";

function StatusPill({ status }: { status: StoredTransaction["status"] }) {
  const isDone = status === "berhasil";
  return (
    <span
      className={cn(
        "shrink-0 rounded-pill px-3 py-1 text-[11px] leading-none font-bold",
        isDone ? "bg-success-soft text-success" : "bg-warn/15 text-warn",
      )}
    >
      {isDone ? "Berhasil" : "Menunggu pembayaran"}
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

function TransactionCard({ entry }: { entry: StoredTransaction }) {
  return (
    <li className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold">{entry.productName}</p>
          <p className="mt-0.5 text-xs text-muted">
            {entry.groupLabel} · {formatTransactionDate(entry.createdAt)}
          </p>
        </div>
        <StatusPill status={entry.status} />
      </div>

      <dl className="mt-4 space-y-2 border-t border-line-2 pt-4 text-sm">
        <DetailRow label="Nomor tujuan" value={entry.customer} />
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
 * Looks up a transaction by customer number or reference code.
 *
 * The history lives in this browser, so the copy says so plainly — an app with
 * no backend cannot look up an order placed on someone else's device, and
 * pretending otherwise would be the worse product.
 */
export function TransactionLookup() {
  const [query, setQuery] = useState("");
  /**
   * The history is an external store (localStorage) and React reads it as one.
   * SSR renders the empty snapshot, so the first client render matches it.
   */
  const entries = useSyncExternalStore(
    subscribeTransactions,
    getTransactionsSnapshot,
    getTransactionsServerSnapshot,
  );

  const results = useMemo(() => findTransactions(query, entries), [entries, query]);
  const hasQuery = query.trim().length > 0;
  const storedCount = entries.length;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12">
      <Link
        href="/"
        className="text-sm font-semibold text-muted transition-colors hover:text-brand"
      >
        ← Kembali ke beranda
      </Link>

      <h1 className="h-display mt-5 text-2xl font-extrabold sm:text-3xl">Cek Transaksi</h1>
      <p className="mt-1.5 text-sm text-muted">
        Masukkan nomor HP atau nomor referensi untuk melihat status transaksi.
      </p>

      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => event.preventDefault()}
      >
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
      </form>

      <div className="mt-8">
        {results.length > 0 ? (
          <>
            <h2 className="text-sm font-bold">
              {hasQuery ? "Hasil pencarian" : "Transaksi di perangkat ini"}
            </h2>
            <ul className="mt-4 space-y-3">
              {results.map((entry) => (
                <TransactionCard key={entry.reference} entry={entry} />
              ))}
            </ul>
          </>
        ) : (
          /* Empty and not-found share a shell but say different things. */
          <div className="card p-6 text-center">
            <p className="font-bold">
              {hasQuery
                ? `Tidak ada transaksi untuk “${query.trim()}”`
                : "Belum ada transaksi di perangkat ini"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              {hasQuery
                ? storedCount > 0
                  ? `Ada ${storedCount} transaksi tersimpan di perangkat ini, tapi tidak ada yang cocok. Periksa lagi nomor HP atau nomor referensinya.`
                  : "Riwayat transaksi hanya tersimpan di perangkat yang dipakai untuk bertransaksi, jadi transaksi dari HP atau browser lain tidak muncul di sini."
                : "Riwayat transaksi hanya tersimpan di perangkat ini dan belum ada yang tercatat. Setiap transaksi yang kamu selesaikan di Belleva akan muncul di sini."}
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

      {storedCount > 0 && (
        <p className="mt-6 text-center text-[11px] text-muted">
          Riwayat tersimpan di perangkat ini saja, maksimal 20 transaksi terakhir.
        </p>
      )}
    </div>
  );
}
