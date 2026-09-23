import type { Category } from "@/types";

/**
 * The 8 service shortcuts from the original landing page. Each one now opens a
 * real catalogue tab — nothing here is a dead link any more.
 */
export const categories: Category[] = [
  {
    id: "pulsa",
    label: "Pulsa",
    href: "/#produk",
    gradient: "linear-gradient(135deg,#ffe8e8,#ffd4d4)",
    productGroup: "pulsa",
  },
  {
    id: "paket-data",
    label: "Paket Data",
    href: "/#produk",
    gradient: "linear-gradient(135deg,#e4efff,#cfe2ff)",
    productGroup: "data",
  },
  {
    id: "pln",
    label: "PLN",
    href: "/#produk",
    gradient: "linear-gradient(135deg,#fff1d8,#ffe2ad)",
    productGroup: "pln-token",
  },
  {
    id: "pdam",
    label: "PDAM",
    href: "/#produk",
    gradient: "linear-gradient(135deg,#e2f3ff,#c7e7fb)",
    productGroup: "pdam",
  },
  {
    id: "bpjs",
    label: "BPJS",
    href: "/#produk",
    gradient: "linear-gradient(135deg,#e2f7ec,#c8efdb)",
    productGroup: "bpjs",
  },
  {
    id: "internet",
    label: "Pembayaran Internet",
    href: "/#produk",
    gradient: "linear-gradient(135deg,#ece6ff,#dbd0ff)",
    productGroup: "internet",
  },
  {
    id: "e-money",
    label: "Uang Elektronik",
    href: "/#produk",
    gradient: "linear-gradient(135deg,#ffe7f3,#ffd2e8)",
    productGroup: "emoney",
  },
  {
    id: "multifinance",
    label: "Multifinance",
    href: "/#produk",
    gradient: "linear-gradient(135deg,#e4edff,#d3e0ff)",
    productGroup: "multifinance",
  },
];

export function categoryGradient(iconId: string): string {
  return categories.find((entry) => entry.id === iconId)?.gradient ?? "linear-gradient(135deg,#e4edff,#d3e0ff)";
}
