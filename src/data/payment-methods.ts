import type { PaymentMethod, SocialLink } from "@/types";

export const paymentMethods: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS",
    description: "Scan dari semua bank & e-wallet",
    icon: "qris",
    tintClass: "bg-soft",
    stroke: "#1668f5",
    // No channel — a single QR covers every bank and e-wallet.
    instructions: [
      "Kode QR akan tampil setelah kamu klik Bayar Sekarang",
      "Buka aplikasi bank atau e-wallet apa pun yang mendukung QRIS",
      "Pilih menu Bayar / Scan QR, lalu pindai kode QR-nya",
      "Pastikan nama merchant Belleva dan nominalnya sudah sesuai",
      "Selesaikan transaksi, status akan diperbarui otomatis",
    ],
  },
  {
    id: "transfer",
    name: "Transfer Bank",
    description: "BCA, BNI, Mandiri, BRI",
    icon: "bank",
    tintClass: "bg-white",
    stroke: "#6b4df6",
    // TODO(content): demo account numbers — replace with the real company
    // accounts (or the ones issued by the payment gateway) before go-live.
    channels: [
      {
        id: "bca",
        label: "BCA",
        account: { number: "8270119933", holder: "PT BELLEVA INDONESIA" },
      },
      {
        id: "bni",
        label: "BNI",
        account: { number: "0912774455", holder: "PT BELLEVA INDONESIA" },
      },
      {
        id: "mandiri",
        label: "Mandiri",
        account: { number: "1470022334455", holder: "PT BELLEVA INDONESIA" },
      },
      {
        id: "bri",
        label: "BRI",
        account: { number: "321701000999553", holder: "PT BELLEVA INDONESIA" },
      },
    ],
    instructions: [
      "Buka aplikasi m-banking, internet banking, atau ATM {channel}",
      "Pilih menu Transfer → Rekening Bank Lain / Sesama {channel}",
      "Transfer ke nomor rekening yang tampil di halaman ini",
      "Gunakan nominal persis sama dengan tagihan supaya cepat terverifikasi",
      "Simpan bukti transfer, lalu klik Saya Sudah Bayar",
    ],
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    description: "GoPay, OVO, DANA, ShopeePay",
    icon: "ewallet",
    tintClass: "bg-soft",
    stroke: "#12a5e0",
    channels: [
      { id: "gopay", label: "GoPay", codePrefix: "8999", codeLength: 10 },
      { id: "ovo", label: "OVO", codePrefix: "8858", codeLength: 10 },
      { id: "dana", label: "DANA", codePrefix: "8958", codeLength: 10 },
      { id: "shopeepay", label: "ShopeePay", codePrefix: "8990", codeLength: 10 },
    ],
    instructions: [
      "Buka aplikasi {channel} kamu",
      "Pilih menu Bayar / Pay",
      "Masukkan kode pembayaran yang tampil di halaman ini",
      "Pastikan nominal pembayaran persis sama dengan tagihan",
      "Selesaikan transaksi, status akan diperbarui otomatis",
    ],
  },
  {
    id: "saldo",
    name: "Saldo Belleva",
    // TODO(content): replace with the signed-in user's real balance.
    description: "Sisa saldo Rp 250.000",
    icon: "balance",
    tintClass: "bg-success-soft",
    stroke: "#17a45f",
    // Balance payments settle immediately — nothing to transfer to.
    instructions: [],
  },
];

export const socialLinks: SocialLink[] = [
  { id: "instagram", label: "Instagram", href: "#" },
  { id: "tiktok", label: "TikTok", href: "#" },
  { id: "x", label: "X", href: "#" },
  { id: "facebook", label: "Facebook", href: "#" },
];
