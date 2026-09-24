import type { HelpLink, NavLink } from "@/types";

import { externalLinks } from "@/lib/site";

/**
 * Hash links are absolute (`/#produk`) so they work from every route — from
 * `/bayar` a bare `#produk` would silently do nothing.
 */
export const navLinks: NavLink[] = [
  { label: "Beranda", href: "/#beranda" },
  { label: "Produk", href: "/#produk" },
  { label: "Keunggulan", href: "/#keunggulan" },
  { label: "Testimoni", href: "/#testimoni" },
  { label: "FAQ", href: "/#faq" },
];

export const footerMenu: NavLink[] = [
  { label: "Beranda", href: "/#beranda" },
  { label: "Produk", href: "/#produk" },
  { label: "Keunggulan", href: "/#keunggulan" },
  { label: "FAQ", href: "/#faq" },
];

/**
 * Support and legal links. Single source for the desktop header's "Bantuan"
 * dropdown and the footer's "Bantuan" column — the two must not drift apart.
 */
export const helpLinks: HelpLink[] = [
  { label: "Pusat Bantuan", href: externalLinks.helpCenter, icon: "help" },
  { label: "Hubungi Kami", href: externalLinks.contact, icon: "chat" },
  { label: "Syarat & Ketentuan", href: externalLinks.terms, icon: "doc" },
  { label: "Kebijakan Privasi", href: externalLinks.privacy, icon: "shield" },
];

/** " /#produk " -> "produk" */
export function sectionIdOf(href: string): string {
  return href.split("#")[1] ?? "";
}
