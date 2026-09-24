import type { Metadata } from "next";

import { TransactionLookup } from "@/components/checkout/TransactionLookup";

/**
 * A client-side tool page: it reads the visitor's own browser history and has
 * no crawlable content, so it stays out of the index like /bayar.
 */
export const metadata: Metadata = {
  title: { absolute: "Cek Transaksi — Belleva" },
  description: "Cek status transaksi Belleva dengan nomor HP atau nomor referensi.",
  robots: { index: false, follow: false },
};

export default function CekTransaksiPage() {
  return <TransactionLookup />;
}
