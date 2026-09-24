"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";

import { mobileNav } from "@/data/mobile-home";
import { cn } from "@/lib/cn";
import { useActiveSection } from "@/lib/use-active-section";
import type { MobileNavId, MobileNavItem } from "@/types";

import { BoltIcon, GridIcon, HomeIcon, ReceiptIcon, TagIcon } from "@/components/icons";

import { useProductTab } from "../product-tab-context";

const NAV_ICONS: Record<MobileNavId, (props: { className?: string }) => React.ReactElement> = {
  beranda: HomeIcon,
  produk: GridIcon,
  promo: TagIcon,
  transaksi: ReceiptIcon,
};

/** Section ids the tab bar spies on — "beranda" is handled by the scroll position. */
const SPY_IDS = ["produk", "promo"] as const;

/** Home is "active" while the page is still at the top. */
const TOP_THRESHOLD = 120;

const itemClass = (active: boolean) =>
  cn(
    "flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 transition-colors",
    active ? "text-brand" : "text-muted hover:text-brand",
  );

function Slot({
  item,
  active,
  onHome,
}: {
  item: MobileNavItem;
  active: boolean;
  onHome: () => void;
}) {
  const Icon = NAV_ICONS[item.id];
  const content = (
    <>
      <Icon />
      <span className="text-[10px] leading-none font-bold">{item.label}</span>
    </>
  );

  // Beranda scrolls to the top of the page instead of re-navigating to "/".
  if (item.id === "beranda") {
    return (
      <button
        type="button"
        onClick={onHome}
        aria-current={active ? "true" : undefined}
        className={itemClass(active)}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={item.href} aria-current={active ? "true" : undefined} className={itemClass(active)}>
      {content}
    </Link>
  );
}

/**
 * Fixed bottom tab bar for the mobile app home.
 *
 * There is no account slot: Belleva has no account area, so the wireframe's
 * "Account" position is taken by the sign-up CTA — the one destination the
 * desktop header offers that the mobile app bar would otherwise drop.
 */
export function MobileBottomNav() {
  const { setActiveGroup } = useProductTab();
  const reduceMotion = useReducedMotion();

  const sectionIds = useMemo(() => [...SPY_IDS], []);
  const activeSection = useActiveSection(sectionIds);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    function onScroll() {
      setAtTop(window.scrollY < TOP_THRESHOLD);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active: string = atTop ? "beranda" : activeSection;

  function handleHome() {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function handleTopUp() {
    setActiveGroup("pulsa");
    document.getElementById("produk")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <nav aria-label="Navigasi aplikasi" className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      {/*
        The bar itself spans the viewport so it lines up with the content above
        it; only the items row is capped, so the tabs stay grouped on tablets
        instead of drifting to the far edges.
      */}
      <div className="w-full rounded-t-3xl bg-white px-2 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-18px_rgba(13,27,57,0.30)]">
        <div className="mx-auto flex w-full max-w-2xl items-end gap-1">
          {mobileNav.slice(0, 2).map((item) => (
            <Slot key={item.id} item={item} active={active === item.id} onHome={handleHome} />
          ))}

          <button
            type="button"
            onClick={handleTopUp}
            aria-label="Top up pulsa"
            className="blue-grad -translate-y-8 grid h-14 w-14 shrink-0 place-items-center rounded-pill text-white ring-4 ring-white shadow-hover transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <BoltIcon />
          </button>

          {mobileNav.slice(2).map((item) => (
            <Slot key={item.id} item={item} active={active === item.id} onHome={handleHome} />
          ))}
        </div>
      </div>
    </nav>
  );
}
