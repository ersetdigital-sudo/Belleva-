import Link from "next/link";

import { HelpIcon } from "@/components/icons";

/**
 * Wave that carves the white content surface out of the coloured app bar.
 * Purely geometric, drawn in one path so it scales with the bar width.
 */
function WaveDivider() {
  return (
    <svg
      viewBox="0 0 390 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-px h-6 w-full text-white"
    >
      <path d="M0 14C65 2 130 26 195 14C260 2 325 26 390 14V24H0Z" fill="currentColor" />
    </svg>
  );
}

/**
 * The coloured app bar that replaces the site header on phones.
 *
 * The wireframe reserves 56px of top padding for the iOS status bar; a web page
 * has no status bar, so that band is dropped rather than reproduced. The
 * notification bell is replaced by help — Belleva has no notification system,
 * and a bell with an unread dot would advertise a feature that does not exist.
 */
export function MobileAppBar() {
  return (
    <div className="blue-grad relative pt-4 pb-9">
      <div className="relative z-10 flex items-center gap-2.5 px-4">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-lg leading-none font-extrabold text-brand"
          aria-hidden="true"
        >
          B
        </span>

        <span className="min-w-0">
          <span className="block text-[15px] leading-tight font-extrabold text-white">Belleva</span>
          <span className="block text-[10px] leading-tight font-bold tracking-[0.14em] text-white/70">
            INDONESIA
          </span>
        </span>

        <Link
          href="/#faq"
          aria-label="Pusat bantuan"
          className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-pill text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <HelpIcon />
        </Link>
      </div>

      <WaveDivider />
    </div>
  );
}
