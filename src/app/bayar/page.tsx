import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentFlow } from "@/components/checkout/PaymentFlow";

/**
 * Payment step of the funnel — deliberately kept out of the sitemap and away
 * from search engines.
 */
export const metadata: Metadata = {
  title: { absolute: "Pembayaran — Belleva" },
  description: "Selesaikan pembayaran transaksi pulsa dan paket data kamu di Belleva.",
  robots: { index: false, follow: false },
};

export default function BayarPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-5 py-20 text-sm text-muted">Memuat pembayaran…</div>
      }
    >
      <PaymentFlow />
    </Suspense>
  );
}
