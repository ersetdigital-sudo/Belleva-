import type { Metadata } from "next";

import { HelpCenter } from "@/components/support/HelpCenter";
import { siteConfig } from "@/lib/site";

const TITLE = "Pusat Bantuan";
const DESCRIPTION =
  "Panduan transaksi, produk, dan status pesanan di Belleva. Cari jawabannya, atau cek langsung status transaksimu.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pusat-bantuan" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/pusat-bantuan",
    siteName: siteConfig.name,
    title: `${TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
  },
};

export default function PusatBantuanPage() {
  return <HelpCenter />;
}
