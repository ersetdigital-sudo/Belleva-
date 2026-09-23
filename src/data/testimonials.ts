import type { Stat, Testimonial } from "@/types";

export const stats: Stat[] = [
  { id: "users", value: "100K+", label: "Pengguna Aktif" },
  { id: "trx", value: "1Jt+", label: "Transaksi Berhasil" },
  { id: "rating", value: "4.9/5", label: "Rating Pengguna" },
];

/**
 * TODO(content): the source HTML ships a single hard-coded review. Add more
 * entries here and the slider/rotation picks them up automatically.
 */
export const testimonials: Testimonial[] = [
  {
    id: "rizky-maulana",
    quote:
      "Transaksi selalu cepat dan mudah. Belleva jadi solusi utama untuk semua pembayaran saya. Highly recommended!",
    name: "Rizky Maulana",
    role: "Pengguna Setia",
    initials: "RM",
    rating: 5,
  },
];
