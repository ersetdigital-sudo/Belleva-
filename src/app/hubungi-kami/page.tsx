import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRightIcon, ChatIcon, HelpIcon, ReceiptIcon } from "@/components/icons";
import { getContacts } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Hubungi Kami — Belleva",
  description:
    "Hubungi tim Belleva lewat WhatsApp atau email. Untuk hal yang bisa diselesaikan sendiri, ada Pusat Bantuan dan Cek Transaksi.",
};

/**
 * Contact page.
 *
 * The channels are not written here: WhatsApp and email come from the admin
 * panel, so this page keeps working when the number changes. When neither is
 * filled in, it says so plainly and points at the self-serve routes instead of
 * showing buttons that go nowhere.
 */
export default async function HubungiKamiPage() {
  const contacts = await getContacts();
  /* wa.me wants the international form with no symbols. */
  const whatsapp = contacts.whatsapp.replace(/\D/g, "");
  const email = contacts.email.trim();

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-muted transition-colors hover:text-brand"
      >
        ← Kembali ke beranda
      </Link>

      <section className="blue-grad mt-4 rounded-3xl p-7 text-white sm:p-10">
        <p className="text-[11px] font-bold tracking-[0.16em] text-white/70 uppercase">Bantuan</p>
        <h1 className="h-display mt-3 text-3xl font-extrabold sm:text-4xl">Hubungi Kami</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85">
          Ada transaksi yang tidak sesuai, atau mau tanya dulu sebelum membeli? Pilih kanalnya di
          bawah ini.
        </p>
      </section>

      {/* ------------------------------ Channels ----------------------------- */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="card flex items-start gap-4 p-5 transition-colors hover:border-brand hover:shadow-soft"
          >
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-success-soft text-success"
            >
              <ChatIcon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-ink">WhatsApp</span>
              <span className="mt-0.5 block text-sm text-muted">
                Cara tercepat. Pesannya langsung masuk ke tim kami.
              </span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand">
                Buka WhatsApp
                <ArrowRightIcon />
              </span>
            </span>
          </a>
        )}

        {email && (
          <a
            href={`mailto:${email}`}
            className="card flex items-start gap-4 p-5 transition-colors hover:border-brand hover:shadow-soft"
          >
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft text-brand"
            >
              <ChatIcon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-ink">Email</span>
              <span className="mt-0.5 block break-words text-sm text-muted">
                Untuk lampiran, tangkapan layar, atau pertanyaan panjang.
              </span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand">
                Kirim email
                <ArrowRightIcon />
              </span>
            </span>
          </a>
        )}

        {!whatsapp && !email && (
          <div className="card p-6 sm:col-span-2">
            <p className="font-bold">Belum ada kanal kontak langsung</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Nomor WhatsApp dan email belum diisi, jadi tombolnya belum ditampilkan. Selama itu,
              pertanyaan soal transaksi bisa lewat <strong className="text-ink">Pusat Bantuan</strong>{" "}
              — di sana ada langkah-langkah yang biasanya menyelesaikannya.
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------ Self-serve ---------------------------- */}
      <h2 className="mt-10 text-lg font-extrabold">Yang bisa diselesaikan sendiri</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link
          href={contacts.helpCenter}
          className="card flex items-start gap-4 p-5 transition-colors hover:border-brand hover:shadow-soft"
        >
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft text-brand"
          >
            <HelpIcon size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-ink">Pusat Bantuan</span>
            <span className="mt-0.5 block text-sm text-muted">
              Cara beli, batas waktu 24 jam, biaya layanan, sampai arti tiap status transaksi.
            </span>
          </span>
        </Link>

        <Link
          href="/cek-transaksi"
          className="card flex items-start gap-4 p-5 transition-colors hover:border-brand hover:shadow-soft"
        >
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-soft text-brand"
          >
            <ReceiptIcon size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-ink">Cek Transaksi</span>
            <span className="mt-0.5 block text-sm text-muted">
              Lihat status dan nomor referensi transaksimu — bisa dari perangkat mana pun.
            </span>
          </span>
        </Link>
      </div>

      {/* -------------------------------- Tips ------------------------------- */}
      <section className="card mt-6 p-5">
        <p className="font-bold">Biar cepat ditangani</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>
            Siapkan <strong className="text-ink">nomor referensi</strong> (contoh BLV12345678) — itu
            yang paling cepat untuk menelusuri transaksimu.
          </li>
          <li>
            Sebutkan <strong className="text-ink">nomor tujuan atau ID pelanggan</strong> yang kamu
            pakai saat membeli.
          </li>
          <li>
            Kalau soal pembayaran, sertakan bukti transfer atau tangkapan layarnya.
          </li>
        </ul>
      </section>
    </div>
  );
}
