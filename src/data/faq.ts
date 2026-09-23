import type { FaqItem } from "@/types";

export const faqItems: FaqItem[] = [
  {
    id: "durasi",
    question: "Berapa lama proses transaksi di Belleva?",
    answer:
      "Sebagian besar transaksi diproses otomatis dalam hitungan detik setelah pembayaran berhasil.",
  },
  {
    id: "metode",
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Transfer bank, virtual account, e-wallet, kartu kredit, serta saldo Belleva.",
  },
  {
    id: "keamanan",
    question: "Apakah transaksi saya aman?",
    answer:
      "Ya. Semua transaksi dienkripsi dan dipantau sistem keamanan berlapis 24 jam.",
  },
  {
    id: "gagal",
    question: "Bagaimana jika transaksi gagal?",
    answer:
      "Dana akan dikembalikan otomatis ke saldo Anda, atau hubungi Customer Support kami kapan saja.",
  },
];
