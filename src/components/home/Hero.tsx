import Image from "next/image";

import { siteConfig } from "@/lib/site";

import { CategoryStrip } from "./CategoryStrip";

/** Intrinsic size of the trimmed hero artwork (2560x1039 after optimisation). */
const HERO_SIZE = { width: 2560, height: 1039 };

export function Hero() {
  return (
    <section id="beranda" className="hero-bg">
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-10 lg:pt-12">
        {/*
          The headline is baked into the artwork, so the page would otherwise
          ship with no <h1>. This keeps the visual design intact while giving
          search engines and assistive tech a real top-level heading.
        */}
        <h1 className="sr-only">
          {siteConfig.name} — {siteConfig.tagline}
        </h1>

        <Image
          src="/images/hero-belleva.webp"
          alt="Aplikasi Belleva untuk isi pulsa, paket data, token PLN, PDAM, BPJS, internet, dan uang elektronik dalam satu aplikasi"
          width={HERO_SIZE.width}
          height={HERO_SIZE.height}
          priority
          sizes="(min-width: 1192px) 1112px, calc(100vw - 40px)"
          className="h-auto w-full rounded-hero"
        />
      </div>

      <CategoryStrip />
    </section>
  );
}
