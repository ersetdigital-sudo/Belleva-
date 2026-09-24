import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { termsDocument } from "@/data/legal";
import { getContacts } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

/** Contacts are editable in /admin, so the page is cached and refreshed. */
export const revalidate = 300;

const DESCRIPTION =
  "Aturan pemakaian layanan Belleva: ruang lingkup layanan, transaksi dan pembayaran, biaya, pembatalan, dan batasan tanggung jawab.";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: DESCRIPTION,
  alternates: { canonical: "/syarat-ketentuan" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/syarat-ketentuan",
    siteName: siteConfig.name,
    title: `Syarat & Ketentuan | ${siteConfig.name}`,
    description: DESCRIPTION,
  },
};

export default async function SyaratKetentuanPage() {
  const contacts = await getContacts();
  return <LegalDocumentView document={termsDocument} contacts={contacts} />;
}
