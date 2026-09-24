import Link from "next/link";

import { PageHeader, Stat } from "@/components/admin/ui";
import { getCatalogueOverrides } from "@/lib/products";
import { getContacts, getPaymentSettings } from "@/lib/settings";
import { getOrders } from "@/lib/orders";

export default async function AdminHomePage() {
  const [payments, contacts, catalogue, orderSummary] = await Promise.all([
    getPaymentSettings(),
    getContacts(),
    getCatalogueOverrides(),
    getOrders({ status: "menunggu", limit: 1 }),
  ]);

  const qris = payments.find((method) => method.slug === "qris");
  const banks = payments.find((method) => method.slug === "transfer")?.channels.length ?? 0;
  const changedPrices = Object.keys(catalogue.prices).length;
  const addedItems = Object.values(catalogue.addedItems).flat().length;
  const hidden = catalogue.hiddenItems.length;
  const waiting = orderSummary.total;

  const cards = [
    {
      href: "/admin/pesanan",
      title: "Kelola pesanan",
      body:
        waiting > 0
          ? `${waiting} pesanan masih menunggu pembayaran`
          : "Tidak ada pesanan yang menunggu pembayaran",
      status: "Lihat, cari, dan ubah status pesanan",
      warn: waiting > 0,
    },
    {
      href: "/admin/produk",
      title: "Produk & harga",
      body: `${changedPrices} harga diubah · ${addedItems} produk tambahan${
        hidden > 0 ? ` · ${hidden} disembunyikan` : ""
      }`,
      status:
        changedPrices > 0 || addedItems > 0
          ? "Ada yang sudah disesuaikan dari bawaan"
          : "Masih semua harga bawaan",
      warn: false,
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
      <PageHeader
        title="Ringkasan"
        description="Yang kamu ubah di sini langsung dipakai situs. Nilai yang belum pernah diubah tetap memakai bawaan di kode."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Menunggu bayar"
          value={String(waiting)}
          hint={waiting > 0 ? "Perlu ditindak" : "Bersih"}
        />
        <Stat label="Produk tambahan" value={String(addedItems)} hint="Dibuat dari panel" />
        <Stat label="Harga diubah" value={String(changedPrices)} hint="Berbeda dari bawaan" />
        <Stat label="Metode bayar" value={String(payments.length)} hint={`${banks} rekening bank`} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="card flex flex-col p-5 transition-colors hover:border-brand hover:shadow-soft"
          >
            <p className="font-bold">{card.title}</p>
            <p className="mt-1 text-sm text-muted">{card.body}</p>
            <p className={`mt-4 text-xs font-semibold ${card.warn ? "text-warn" : "text-success"}`}>
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
