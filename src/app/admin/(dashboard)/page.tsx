import Link from "next/link";

import { getContacts, getPaymentSettings } from "@/lib/settings";

export default async function AdminHomePage() {
  const [payments, contacts] = await Promise.all([getPaymentSettings(), getContacts()]);

  const qris = payments.find((method) => method.slug === "qris");
  const banks = payments.find((method) => method.slug === "transfer")?.channels.length ?? 0;

  const cards = [
    {
      href: "/admin/pembayaran",
      title: "Pembayaran",
      body: `${payments.length} metode · ${banks} rekening bank`,
      status: qris?.qrUrl ? "Gambar QRIS sudah diunggah" : "Gambar QRIS belum diunggah",
      warn: !qris?.qrUrl,
    },
    {
      href: "/admin/kontak",
      title: "Kontak",
      body: "Nomor WhatsApp, email, dan tautan bantuan",
      status: contacts.whatsapp ? `WhatsApp: ${contacts.whatsapp}` : "Nomor WhatsApp belum diisi",
      warn: !contacts.whatsapp,
    },
  ];

  return (
    <div>
      <h2 className="h-display text-xl font-extrabold">Ringkasan</h2>
      <p className="mt-1.5 text-sm text-muted">
        Yang kamu ubah di sini langsung dipakai situs. Kalau sebuah nilai belum pernah diubah, situs
        memakai nilai bawaan di kode.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="card p-5 transition hover:border-brand">
            <p className="font-bold">{card.title}</p>
            <p className="mt-1 text-sm text-muted">{card.body}</p>
            <p
              className={`mt-3 text-xs font-semibold ${card.warn ? "text-warn" : "text-success"}`}
            >
              {card.status}
            </p>
          </Link>
        ))}
      </div>

      <div className="card mt-6 p-5">
        <p className="font-bold">Belum bisa diatur dari sini</p>
        <p className="mt-1.5 text-sm text-muted">
          Tahap berikutnya: hero, kategori layanan, promo, keunggulan, langkah, testimoni, FAQ, CTA,
          navigasi, footer, artikel Pusat Bantuan, dan katalog produk. Skema datanya sudah siap
          menampung semuanya sejak awal, jadi tinggal ditambahkan halamannya.
        </p>
      </div>
    </div>
  );
}
