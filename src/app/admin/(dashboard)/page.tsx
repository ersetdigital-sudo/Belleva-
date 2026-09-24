import Link from "next/link";

import { getContacts, getPaymentSettings } from "@/lib/settings";
import { getPriceOverrides } from "@/lib/products";

export default async function AdminHomePage() {
  const [payments, contacts, prices] = await Promise.all([
    getPaymentSettings(),
    getContacts(),
    getPriceOverrides(),
  ]);

  const qris = payments.find((method) => method.slug === "qris");
  const banks = payments.find((method) => method.slug === "transfer")?.channels.length ?? 0;
  const changedPrices = Object.keys(prices).length;

  const cards = [
    {
      href: "/admin/produk",
      title: "Harga produk",
      body: `${changedPrices} harga di luar bawaan`,
      status: changedPrices > 0 ? "Ada harga yang sudah diubah" : "Masih semua harga bawaan",
      warn: changedPrices === 0,
    },
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
        Yang kamu ubah di sini langsung dipakai situs. Nilai yang belum pernah diubah tetap memakai
        bawaan di kode.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="card flex flex-col p-5 transition hover:border-brand hover:shadow-soft"
          >
            <p className="font-bold">{card.title}</p>
            <p className="mt-1 text-sm text-muted">{card.body}</p>
            <p
              className={`mt-4 text-xs font-semibold ${card.warn ? "text-warn" : "text-success"}`}
            >
              {card.status}
            </p>
          </Link>
        ))}
      </div>

      <div className="card mt-6 p-5">
        <p className="font-bold">Belum bisa diatur dari sini</p>
        <p className="mt-1.5 text-sm text-muted">
          Hero, kategori layanan, promo, keunggulan, langkah, testimoni, FAQ, CTA, navigasi, footer,
          dan artikel Pusat Bantuan. Skema datanya sudah siap menampung semuanya, jadi tinggal
          ditambahkan halamannya.
        </p>
      </div>
    </div>
  );
}
