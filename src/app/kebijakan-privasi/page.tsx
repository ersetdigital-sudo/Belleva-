import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { privacyDocument } from "@/data/legal";
import { getContacts } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

/** Contacts are editable in /admin, so the page is cached and refreshed. */
export const revalidate = 300;

const DESCRIPTION =
  "Data apa yang dikumpulkan Belleva, untuk apa dipakai, di mana disimpan, dan bagaimana kamu bisa mengendalikannya.";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: DESCRIPTION,
  alternates: { canonical: "/kebijakan-privasi" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/kebijakan-privasi",
    siteName: siteConfig.name,
    title: `Kebijakan Privasi | ${siteConfig.name}`,
    description: DESCRIPTION,
  },
};

export default async function KebijakanPrivasiPage() {
  const contacts = await getContacts();
  return <LegalDocumentView document={privacyDocument} contacts={contacts} />;
}
