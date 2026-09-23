import type { Metadata } from "next";

import { siteConfig } from "./site";

export const SITE_TITLE = `${siteConfig.name} — ${siteConfig.tagline}`;
export const OG_IMAGE = {
  url: "/images/og-belleva.png",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} — ${siteConfig.tagline}`,
} as const;

const KEYWORDS = [
  "Belleva",
  "pulsa",
  "paket data",
  "token PLN",
  "PDAM",
  "BPJS",
  "pembayaran internet",
  "uang elektronik",
  "multifinance",
  "top up online",
  "aplikasi pembayaran digital",
];

/** Root defaults — inherited by every route. */
export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: SITE_TITLE,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: KEYWORDS,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "finance",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: SITE_TITLE,
    description: siteConfig.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: siteConfig.description,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/**
 * Page-level metadata for `/`. `absolute` deliberately bypasses the layout's
 * title template so the brand is not appended twice.
 */
export const homeMetadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};
