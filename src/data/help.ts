import type { HelpArticle, HelpTopic } from "@/types";

import { faqItems } from "./faq";

/**
 * Content for the Pusat Bantuan page.
 *
 * Every answer here describes what the app actually does — the buy flow, the
 * 24-hour payment window, the flat service fee, operator detection, the 20-digit
 * stroom code, the server-side transaction history. The "Umum" section reuses the
 * landing page's `faqItems` so the two surfaces cannot say different things.
 *
 * TODO(content): these are the questions the product itself answers. Add the
 * ones only the business can answer (refunds, account, partnership) once the
 * support team has signed off on the wording.
 */
export const helpTopics: HelpTopic[] = [
  {
    id: "umum",
    label: "Umum",
    description: "Pertanyaan yang paling sering ditanyakan.",
  },
  {
    id: "pembayaran",
    label: "Transaksi & Pembayaran",
    description: "Cara bayar, batas waktu, dan biaya layanannya.",
  },
  {
    id: "produk",
    label: "Produk & Layanan",
    description: "Pulsa, paket data, token listrik, dan tagihan bulanan.",
  },
  {
    id: "kendala",
    label: "Status & Kendala",
    description: "Cek status transaksi dan langkah kalau ada yang tidak sesuai.",
  },
];

export const helpArticles: HelpArticle[] = [
  /* The landing page answers these four; one source, two surfaces. */
  ...faqItems.map((item) => ({ ...item, topic: "umum" as const })),

  /* --------------------------- Transaksi & Pembayaran -------------------- */
  {
    id: "cara-beli",
    topic: "pembayaran",
    question: "Bagaimana cara melakukan pembelian?",
    answer:
      "Masukkan nomor HP atau ID pelanggan di section Produk, pilih nominal atau paketnya, lalu tekan Beli. Kamu akan diarahkan ke halaman pembayaran untuk memilih metode bayar.",
  },
  {
    id: "biaya-layanan",
    topic: "pembayaran",
    question: "Berapa biaya layanannya?",
    answer:
      "Biaya layanan Rp 1.000 per transaksi prabayar, ditambahkan di atas harga produknya. Untuk tagihan pascabayar, biaya adminnya mengikuti jenis tagihannya dan sudah ditampilkan sebelum kamu membayar.",
  },
  {
    id: "batas-waktu",
    topic: "pembayaran",
    question: "Berapa lama batas waktu pembayarannya?",
    answer:
      "Setelah memilih metode bayar, kamu punya waktu 24 jam untuk menyelesaikannya. Lewat dari itu transaksinya dibatalkan otomatis, dan kamu bisa mengulang pesanannya tanpa biaya tambahan.",
  },
  {
    id: "nominal-persis",
    topic: "pembayaran",
    question: "Kenapa nominal transfernya harus persis?",
    answer:
      "Untuk transfer bank, kirim dana dengan nominal tepat seperti yang tertera di halaman pembayaran. Nominal yang berbeda membuat pembayaran sulit dicocokkan dengan pesananmu.",
  },

  /* ------------------------------ Produk & Layanan ----------------------- */
  {
    id: "operator-tidak-terdeteksi",
    topic: "produk",
    question: "Operatornya tidak terdeteksi otomatis, kenapa?",
    answer:
      "Operator dideteksi dari prefix nomor HP-nya. Kalau nomor itu belum dikenali, pilih operatornya secara manual di langkah Operator. Operator yang terdeteksi otomatis diberi tanda auto.",
  },
  {
    id: "angka-nol-hilang",
    topic: "produk",
    question: "Kenapa angka 0 di depan nomor saya hilang?",
    answer:
      "Nomor disimpan dengan awalan +62, jadi angka 0 di depan otomatis dibuang saat kamu mengetiknya. Nomor 08123… dan 8123… sama saja di sistem kami.",
  },
  {
    id: "token-listrik",
    topic: "produk",
    question: "Bagaimana cara beli token listrik?",
    answer:
      "Masukkan ID pelanggan atau nomor meter (11–12 digit), pilih nominal tokennya, lalu bayar. Setelah pembayaran berhasil, nomor stroom 20 digit muncul di halaman sukses dan bisa langsung disalin.",
  },
  {
    id: "cek-tagihan",
    topic: "produk",
    question: "Apa itu Cek Tagihan?",
    answer:
      "Untuk produk pascabayar — listrik, PDAM, BPJS, internet, dan angsuran — isi nomornya dulu lalu tekan Cek Tagihan. Rincian tagihannya muncul sebelum kamu membayar, jadi kamu bisa cek dulu apakah sudah sesuai.",
  },

  /* ------------------------------ Status & Kendala ----------------------- */
  {
    id: "cara-cek-status",
    topic: "kendala",
    question: "Bagaimana cara cek status transaksi?",
    answer:
      "Buka halaman Cek Transaksi, lalu masukkan nomor HP atau nomor referensinya. Status transaksinya muncul di situ.",
  },
  {
    id: "riwayat-tidak-muncul",
    topic: "kendala",
    question: "Kenapa riwayat transaksi saya tidak muncul?",
    answer:
      "Riwayat transaksi tersimpan di server kami, bukan di perangkatmu, jadi transaksi yang dibuat dari HP tetap bisa dibuka dari laptop. Masukkan nomor referensinya, atau nomor tujuan yang kamu pakai saat bertransaksi.",
  },
  {
    id: "sudah-bayar-belum-berubah",
    topic: "kendala",
    question: "Sudah bayar tapi statusnya belum berubah, bagaimana?",
    answer:
      "Tunggu sebentar, lalu buka lagi halaman Cek Transaksi dan masukkan nomor referensinya. Statusnya diperbarui begitu pembayaran dikonfirmasi. Kalau setelah beberapa saat masih belum berubah, catat nomor referensinya untuk ditanyakan ke Customer Support.",
  },
];
