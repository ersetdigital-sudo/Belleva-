import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { termsDocument } from "@/data/legal";
import { siteConfig } from "@/lib/site";

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

export default function SyaratKetentuanPage() {
  return <LegalDocumentView document={termsDocument} />;
}
