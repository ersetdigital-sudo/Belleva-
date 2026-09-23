import Image from "next/image";
import Link from "next/link";

const PROMO_SIZE = { width: 1967, height: 799 };

export function PromoBanner() {
  return (
    <section aria-label="Promo spesial" className="mx-auto max-w-6xl px-5 pb-14">
      <Link href="/#produk" className="block">
        <Image
          src="/images/promo-cashback.webp"
          alt="Promo spesial cashback sampai 50 persen untuk berbagai transaksi pilihan di Belleva"
          width={PROMO_SIZE.width}
          height={PROMO_SIZE.height}
          sizes="(min-width: 1192px) 1112px, calc(100vw - 40px)"
          className="h-auto w-full rounded-hero"
        />
      </Link>
    </section>
  );
}
