import Link from "next/link";

import { ChevronRightIcon, TagIcon } from "@/components/icons";

/**
 * The wireframe's discount row.
 *
 * It carries the cashback claim the promo banner already makes rather than a
 * coupon code: Belleva has no coupon system, and printing a code the checkout
 * cannot accept would be a claim the product cannot honour.
 */
export function MobilePromoCode() {
  return (
    <section aria-label="Promo spesial" className="mt-4 px-5">
      <Link
        href="/#produk"
        className="flex items-center gap-3 rounded-2xl bg-warn/15 px-4 py-3.5 transition-colors hover:bg-warn/20"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-warn text-white">
          <TagIcon />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-ink">Promo Spesial</span>
          <span className="block truncate text-xs text-muted">Cashback transaksi pilihan</span>
        </span>

        <span className="shrink-0 text-right">
          <span className="block text-sm leading-tight font-extrabold text-brand">s.d. 50%</span>
          <span className="block text-[11px] leading-tight text-muted">cashback</span>
        </span>

        <ChevronRightIcon className="shrink-0 text-muted" />
      </Link>
    </section>
  );
}
