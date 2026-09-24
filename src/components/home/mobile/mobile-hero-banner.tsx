import Link from "next/link";

import { formatRupiah } from "@/lib/format";
import { siteConfig } from "@/lib/site";

import { ArrowRightIcon } from "@/components/icons";

/**
 * The mobile home's hero banner.
 *
 * Desktop leads with the hero artwork, so phones have to state the same thing
 * in text: what Belleva is, before the promo rail and the service grid take
 * over. It inherits the established brand surface (the same gradient as the app
 * bar and the primary buttons, the display type, the hero radius) rather than
 * introducing a second visual language alongside it.
 */
export function MobileHeroBanner() {
  return (
    <section aria-label="Tentang Belleva" className="mt-5 px-5">
      <div className="blue-grad rounded-hero p-5 shadow-soft">
        <h2 className="h-display text-xl font-extrabold text-white">
          Semua pembayaran dalam satu aplikasi
        </h2>
        <p className="mt-2 text-sm text-white/90">
          Pulsa, paket data, token listrik, PDAM, BPJS, internet, sampai uang elektronik.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Link
            href="/#produk"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-pill bg-white px-5 text-sm font-bold text-brand transition-transform active:scale-[0.98]"
          >
            Mulai Transaksi
            <ArrowRightIcon />
          </Link>
          <Link
            href="/cek-transaksi"
            className="min-h-11 content-center text-sm font-semibold text-white/90 underline underline-offset-4 transition-colors hover:text-white"
          >
            Cek Transaksi
          </Link>
        </div>

        {/* A real figure from the site config, not a decorative badge. */}
        <p className="mt-4 border-t border-white/20 pt-3.5 text-xs font-semibold text-white/90">
          Biaya layanan {formatRupiah(siteConfig.serviceFee)} per transaksi.
        </p>
      </div>
    </section>
  );
}
