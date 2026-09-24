import type { StoreLink } from "@/types";

/**
 * Single source of truth for site-wide values used by metadata, JSON-LD,
 * the header/footer and the checkout modal.
 */
export const siteConfig = {
  name: "Belleva",
  /** Used for canonical URLs, sitemap.xml and robots.txt. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://belleva.net").replace(/\/$/, ""),
  domain: "belleva.net",
  locale: "id_ID",
  lang: "id",
  tagline: "Semua Pembayaran dalam Satu Aplikasi",
  description:
    "Belleva adalah aplikasi pembayaran digital untuk isi pulsa, paket data, token PLN, PDAM, BPJS, internet, uang elektronik, dan multifinance dalam satu aplikasi. Proses instan, aman, dan penuh promo.",
  shortDescription: "Solusi pembayaran digital untuk semua kebutuhan harian Anda.",
  /** Flat service fee applied on top of every product price. */
  serviceFee: 1000,
} as const;

/**
 * TODO(content): every value below is still a dead "#" in the source HTML.
 * Fill these in once the real URLs / numbers exist — nothing else needs editing.
 */
export const externalLinks = {
  /** TODO(content): real registration destination for the CTA button. */
  signUp: "#",
  allProducts: "#",
  /** The help centre is a real route, so this one is wired up. */
  helpCenter: "/pusat-bantuan",
  contact: "#",
  terms: "#",
  privacy: "#",
  /** e.g. "6281234567890" — leave empty to hide WhatsApp CTAs. */
  whatsapp: "",
  /** e.g. "hello@belleva.net" */
  email: "",
} as const;

export const appStoreLinks: StoreLink[] = [
  { label: "Google Play", href: "#" },
  { label: "App Store", href: "#" },
];
