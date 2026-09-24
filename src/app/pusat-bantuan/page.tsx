import type { Metadata } from "next";

import { HelpCenter } from "@/components/support/HelpCenter";
import { getContacts } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

/** Contacts are editable in /admin, so the page is cached and refreshed. */
export const revalidate = 300;

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

export default async function PusatBantuanPage() {
  const contacts = await getContacts();
  return <HelpCenter contacts={contacts} />;
}
