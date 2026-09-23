import type { NavLink } from "@/types";

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

/** " /#produk " -> "produk" */
export function sectionIdOf(href: string): string {
  return href.split("#")[1] ?? "";
}
