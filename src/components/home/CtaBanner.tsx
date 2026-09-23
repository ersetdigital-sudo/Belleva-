import { externalLinks } from "@/lib/site";

import { Reveal } from "@/components/ui/Reveal";

export function CtaBanner() {
  return (
    <section id="daftar" className="mx-auto max-w-6xl px-5 pb-16">
      <Reveal>
        <div className="blue-grad flex flex-col items-start gap-6 rounded-hero px-7 py-9 text-white sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="h-display text-2xl font-extrabold sm:text-3xl">
              Mulai Transaksi Sekarang
            </h2>
            <p className="mt-2 opacity-85">Nikmati kemudahan pembayaran dalam satu aplikasi.</p>
          </div>
          <a
            href={externalLinks.signUp}
            className="rounded-pill bg-white px-7 py-3.5 text-sm font-bold whitespace-nowrap text-brand-dark sm:ml-auto"
          >
            Daftar Sekarang
          </a>
        </div>
      </Reveal>
    </section>
  );
}
