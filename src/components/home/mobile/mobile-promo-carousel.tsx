"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { mobilePromos } from "@/data/mobile-home";
import { cn } from "@/lib/cn";

import { ArrowRightIcon } from "@/components/icons";

/** Distance between two snap points, measured rather than assumed. */
function stepOf(track: HTMLUListElement): number {
  const first = track.children[0] as HTMLElement | undefined;
  const second = track.children[1] as HTMLElement | undefined;
  if (!first || !second) return 0;
  return second.offsetLeft - first.offsetLeft;
}

/**
 * Swipeable promo rail with synced pagination dots.
 *
 * The wireframe bleeds an illustration off the right edge of the card. Belleva
 * has no illustration asset, and the craft floor is "real illustration or none"
 * — so the slide carries the promo gradient alone instead of a stand-in graphic.
 */
export function MobilePromoCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const step = stepOf(track);
    if (step === 0) return;
    const next = Math.round(track.scrollLeft / step);
    setActive(Math.min(mobilePromos.length - 1, Math.max(0, next)));
  }

  function showSlide(index: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * stepOf(track), behavior: "smooth" });
  }

  return (
    <section id="promo" aria-label="Promo Belleva" className="mt-6">
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5"
      >
        {mobilePromos.map((promo) => (
          <li key={promo.id} className="w-full shrink-0 snap-center">
            <Link
              href={promo.href}
              className="block rounded-hero p-5 transition-transform active:scale-[0.99]"
              style={{ background: promo.gradient }}
            >
              <span className="block max-w-[72%]">
                <span className="h-display block text-xl font-extrabold text-ink">{promo.title}</span>
                <span className="mt-1.5 block text-xs font-medium text-muted">{promo.subtitle}</span>
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white">
                {promo.cta}
                <ArrowRightIcon />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex justify-center">
        {mobilePromos.map((promo, index) => (
          <button
            key={promo.id}
            type="button"
            onClick={() => showSlide(index)}
            aria-label={`Tampilkan promo ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            className="grid h-6 w-6 place-items-center rounded-pill"
          >
            {/* The dot stays 8px; the button is 24px so it clears the target floor. */}
            <span
              className={cn(
                "h-2 w-2 rounded-pill transition-colors",
                index === active ? "bg-brand" : "bg-line-2",
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
