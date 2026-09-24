import type { MobileNavItem, MobileProduct, MobilePromo, ProductGroup } from "@/types";

import { categoryGradient } from "./categories";

/**
 * Promo slides for the mobile app home. Every claim is lifted from copy the
 * site already makes (the cashback banner, the "Proses Instan" feature, the
 * catalogue range) — no new offer is invented here.
 */
export const mobilePromos: MobilePromo[] = [
  {
    id: "cashback",
    title: "Cashback hingga 50%",
    subtitle: "Untuk transaksi pilihan di Belleva",
    cta: "Lihat Produk",
    gradient:
      "radial-gradient(120% 90% at 88% 8%, rgba(22,104,245,.20) 0%, rgba(22,104,245,0) 62%), linear-gradient(135deg,#eef4ff,#dbe8ff)",
    href: "/#produk",
  },
  {
    id: "instan",
    title: "Pulsa & paket data instan",
    subtitle: "Transaksi masuk dalam hitungan detik",
    cta: "Isi Sekarang",
    gradient:
      "radial-gradient(120% 90% at 88% 8%, rgba(245,165,36,.24) 0%, rgba(245,165,36,0) 62%), linear-gradient(135deg,#fff6e6,#ffe9c4)",
    href: "/#produk",
  },
  {
    id: "tagihan",
    title: "Bayar tagihan bulanan",
    subtitle: "Listrik, PDAM, BPJS, internet dalam satu aplikasi",
    cta: "Cek Tagihan",
    gradient:
      "radial-gradient(120% 90% at 88% 8%, rgba(23,164,95,.20) 0%, rgba(23,164,95,0) 62%), linear-gradient(135deg,#eefaf3,#d6f2e4)",
    href: "/#produk",
  },
];

/**
 * Bottom tab-bar slots. The last one replaces the wireframe's "Account"
 * position with the transaction lookup — Belleva has no account area, and
 * "Cek Transaksi" is the thing visitors actually come back for.
 *
 * The tab reads "Transaksi" rather than "Cek Transaksi": five tabs on a 360px
 * screen leave 68px each, and the longer label needs ~71px, so it wrapped to
 * two lines and pushed its icon out of line with the rest. The page it opens is
 * still titled "Cek Transaksi".
 */
export const mobileNav: MobileNavItem[] = [
  { id: "beranda", label: "Beranda", href: "/" },
  { id: "produk", label: "Produk", href: "/#produk" },
  { id: "promo", label: "Promo", href: "/#promo" },
  { id: "transaksi", label: "Transaksi", href: "/cek-transaksi" },
];

function itemsOf(group: ProductGroup) {
  return group.items ?? group.vendors?.[0]?.items ?? [];
}

/**
 * Every prepaid nominal, flattened and tagged with its group. The first vendor
 * of each group stands in for the group so the list stays readable — this is
 * what the mobile search filters.
 *
 * Takes the catalogue rather than importing it, so the prices the admin sets in
 * /admin/produk are the ones the mobile home shows.
 */
export function buildMobileCatalogue(groups: ProductGroup[]): MobileProduct[] {
  return groups
    .filter((group) => group.flow === "prepaid")
    .flatMap((group) =>
      itemsOf(group).map((item) => ({
        key: `${group.id}-${item.id}`,
        groupId: group.id,
        groupLabel: group.label,
        icon: group.icon,
        gradient: categoryGradient(group.icon),
        item,
      })),
    );
}

/** Paket data tiles read best in the two-column grid: kuota, masa aktif, harga. */
export function buildMobileRecommendations(groups: ProductGroup[]): MobileProduct[] {
  return buildMobileCatalogue(groups)
    .filter((entry) => entry.groupId === "data")
    .slice(0, 4);
}
