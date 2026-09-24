import Link from "next/link";

import { PageHeader, SectionCard, Stat } from "@/components/admin/ui";
import { AlertIcon, ArrowRightIcon, CheckIcon, ClipboardIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { ORDER_STATUS_STYLE, getOrders, orderStatusLabel, type Order } from "@/lib/orders";
import { getCatalogueOverrides } from "@/lib/products";
import { getContacts, getPaymentSettings } from "@/lib/settings";

/** One line of the site-readiness list. */
function ReadinessRow({
  ready,
  label,
  detail,
  href,
}: {
  ready: boolean;
  label: string;
  detail: string;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-soft"
      >
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
            ready ? "bg-success-soft text-success" : "bg-warn/15 text-warn",
          )}
        >
          {ready ? <CheckIcon stroke="currentColor" strokeWidth={3} /> : <AlertIcon size={13} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{label}</span>
          <span className="mt-0.5 block text-xs text-muted">{detail}</span>
        </span>
        <span className="sr-only">{ready ? "Sudah siap" : "Belum selesai"}</span>
      </Link>
    </li>
  );
}

/**
 * The admin landing page.
 *
 * It used to be four equal link cards, which told the reader nothing they could
 * not already see in the sidebar. A dashboard should answer two questions
 * instead: what needs attention right now, and is the site set up. So the
 * pending orders lead, the latest orders give the shop a pulse, and the links
 * are demoted to a readiness checklist.
 */
export default async function AdminHomePage() {
  const [pending, done, failed, all, recent, payments, contacts, catalogue] = await Promise.all([
    getOrders({ status: "menunggu", limit: 1 }),
    getOrders({ status: "berhasil", limit: 1 }),
    getOrders({ status: "gagal", limit: 1 }),
    getOrders({ limit: 1 }),
    getOrders({ limit: 6 }),
    getPaymentSettings(),
    getContacts(),
    getCatalogueOverrides(),
  ]);

  const qris = payments.find((method) => method.slug === "qris");
  const banks = payments.find((method) => method.slug === "transfer")?.channels.length ?? 0;
  const changedPrices = Object.keys(catalogue.prices).length;
  const addedItems = Object.values(catalogue.addedItems).flat().length;
  const addedGroups = catalogue.addedGroups.length;
  const customised = changedPrices > 0 || addedItems > 0 || addedGroups > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ringkasan"
        description="Kondisi toko hari ini. Yang kamu ubah di panel langsung dipakai situs; nilai yang belum pernah diubah tetap memakai bawaan di kode."
      />

      {/* ----------------------------- Figures ----------------------------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Menunggu bayar"
          value={String(pending.total)}
          hint={pending.total > 0 ? "Perlu ditindak" : "Tidak ada yang menggantung"}
        />
        <Stat label="Berhasil" value={String(done.total)} hint="Pesanan selesai" />
        <Stat label="Gagal" value={String(failed.total)} hint="Perlu dicek kalau ada" />
        <Stat label="Total pesanan" value={String(all.total)} hint="Semua status" />
      </div>

      {/* ------------------------- Needs attention ------------------------- */}
      {pending.total > 0 ? (
        <section className="card flex flex-wrap items-center gap-4 border-l-4 border-l-warn p-5">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-warn/15 text-warn"
          >
            <AlertIcon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{pending.total} pesanan menunggu pembayaran</p>
            <p className="mt-1 text-sm text-muted">
              Pastikan pembayarannya masuk, lalu tandai berhasil supaya pembeli melihat statusnya
              ikut berubah di halaman Cek Transaksi.
            </p>
          </div>
          <Link
            href="/admin/pesanan?status=menunggu"
            className="blue-grad inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill px-5 text-sm font-bold text-white shadow-soft"
          >
            Proses sekarang
            <ArrowRightIcon />
          </Link>
        </section>
      ) : (
        <section className="card flex flex-wrap items-center gap-4 p-5">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-success-soft text-success"
          >
            <CheckIcon stroke="currentColor" strokeWidth={3} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Tidak ada pesanan yang menggantung</p>
            <p className="mt-1 text-sm text-muted">
              Semua pesanan sudah punya status akhir. Pesanan baru muncul di sini begitu ada yang
              menyelesaikan checkout.
            </p>
          </div>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-start">
        {/* --------------------------- Latest orders -------------------------- */}
        <SectionCard
          title="Pesanan terbaru"
          description={all.total > 0 ? `Menampilkan ${recent.orders.length} dari ${all.total} pesanan.` : undefined}
          aside={
            all.total > 0 ? (
              <Link
                href="/admin/pesanan"
                className="inline-flex min-h-11 items-center text-xs font-bold text-brand hover:underline"
              >
                Kelola semua
              </Link>
            ) : undefined
          }
        >
          {recent.orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-2 p-6 text-center">
              <span
                aria-hidden="true"
                className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-soft text-muted"
              >
                <ClipboardIcon size={20} />
              </span>
              <p className="mt-3 font-bold">Belum ada pesanan</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                Pesanan muncul di sini begitu ada pembeli yang menyelesaikan checkout.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line-2">
              {recent.orders.map((order: Order) => (
                <li key={order.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{order.productName}</p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                      {order.reference} · {formatDateTime(new Date(order.createdAt).getTime())}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold whitespace-nowrap text-ink tabular-nums">
                    {formatRupiah(order.total)}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-bold whitespace-nowrap",
                      ORDER_STATUS_STYLE[order.status],
                    )}
                  >
                    {orderStatusLabel(order.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* --------------------------- Site readiness -------------------------- */}
        <SectionCard
          title="Kesiapan situs"
          description="Yang masih kosong berarti situs memakai nilai bawaan atau menyembunyikan bagiannya."
        >
          <ul className="-mx-2.5 space-y-0.5">
            <ReadinessRow
              ready={Boolean(qris?.qrUrl)}
              label="Gambar QRIS"
              detail={qris?.qrUrl ? "Sudah diunggah" : "Belum diunggah — pembeli tidak bisa scan"}
              href="/admin/pembayaran"
            />
            <ReadinessRow
              ready={Boolean(contacts.whatsapp)}
              label="Nomor WhatsApp"
              detail={contacts.whatsapp ? contacts.whatsapp : "Belum diisi — tombol kontak disembunyikan"}
              href="/admin/kontak"
            />
            <ReadinessRow
              ready={payments.length - (qris ? 1 : 0) > 0}
              label="Metode bayar"
              detail={`${payments.length} metode · ${banks} rekening bank`}
              href="/admin/pembayaran"
            />
            <ReadinessRow
              ready={customised}
              label="Katalog"
              detail={
                customised
                  ? `${changedPrices} harga diubah · ${addedItems} produk tambahan${
                      addedGroups > 0 ? ` · ${addedGroups} kategori sendiri` : ""
                    }`
                  : "Masih sepenuhnya harga bawaan"
              }
              href="/admin/produk"
            />
          </ul>
        </SectionCard>
      </div>

      {/* --------------------------- Not editable yet -------------------------- */}
      <SectionCard
        title="Belum bisa diatur dari panel"
        description="Hero, kategori layanan, promo, keunggulan, langkah, testimoni, FAQ, CTA, navigasi, footer, dan artikel Pusat Bantuan. Skema datanya sudah siap menampung semuanya, jadi tinggal ditambahkan halamannya."
      >
        <p className="text-sm text-muted">
          Sampai itu ada, bagian tersebut masih ikut kode dan berubah lewat deploy.
        </p>
      </SectionCard>
    </div>
  );
}
