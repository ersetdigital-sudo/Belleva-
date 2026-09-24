import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentFlow } from "@/components/checkout/PaymentFlow";
import { getPaymentSettings, toPaymentMethods } from "@/lib/settings";

/**
 * Payment step of the funnel — deliberately kept out of the sitemap and away
 * from search engines. It reads the payment settings on every request so a
 * QRIS image or account number changed in the admin shows up immediately.
 */
export const metadata: Metadata = {
  title: { absolute: "Pembayaran — Belleva" },
  description: "Selesaikan pembayaran transaksi pulsa dan paket data kamu di Belleva.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BayarPage() {
  const methods = toPaymentMethods(await getPaymentSettings());

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-5 py-20 text-sm text-muted">Memuat pembayaran…</div>
      }
    >
      <PaymentFlow methods={methods} />
    </Suspense>
  );
}
