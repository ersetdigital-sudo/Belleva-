import type { Metadata } from "next";

import { TransactionLookup } from "@/components/checkout/TransactionLookup";

/**
 * Looks up an order on the server by reference or customer number, so a
 * customer can check from any device. The search itself has no crawlable
 * content, so the page stays out of the index like /bayar.
 */
export const metadata: Metadata = {
  title: { absolute: "Cek Transaksi — Belleva" },
  description: "Cek status transaksi Belleva dengan nomor HP atau nomor referensi.",
  robots: { index: false, follow: false },
};

export default function CekTransaksiPage() {
  return <TransactionLookup />;
}
