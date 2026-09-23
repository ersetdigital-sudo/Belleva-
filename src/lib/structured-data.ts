import { faqItems } from "@/data/faq";

import { siteConfig } from "./site";

/**
 * schema.org graph for the landing page: the brand, the site itself and the
 * FAQ (which is eligible for a Google rich result).
 *
 * Only facts present in the page are emitted — no invented addresses, phone
 * numbers or `sameAs` profile links.
 */
export function buildStructuredData() {
  const organizationId = `${siteConfig.url}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/images/logo-belleva.png`,
          width: 1064,
          height: 328,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: "id-ID",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteConfig.url}/#faq`,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
}
