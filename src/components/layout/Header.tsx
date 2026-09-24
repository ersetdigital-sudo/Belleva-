"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/cn";
import { helpLinks, navLinks, sectionIdOf } from "@/data/nav";
import { useActiveSection } from "@/lib/use-active-section";

import { Logo } from "./Logo";
import { ChevronDownIcon, CloseIcon, HelpLinkIcon, MenuIcon } from "@/components/icons";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const sectionIds = useMemo(() => navLinks.map((link) => sectionIdOf(link.href)), []);
  const activeSection = useActiveSection(sectionIds);

  /*
   * The home page replaces this header with the app bar and bottom tab bar on
   * phones, so the header only renders from `lg` up there. Every other route
   * (e.g. /bayar) keeps the normal mobile header.
   */
  const isAppHome = pathname === "/";

  /*
   * The help panel is a disclosure, so it closes on the two things people
   * expect from one: a press outside it, and Escape.
   */
  useEffect(() => {
    if (!helpOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!helpRef.current?.contains(event.target as Node)) setHelpOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setHelpOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [helpOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur",
        isAppHome && "hidden lg:block",
      )}
    >
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
        <Link href="/" className="block shrink-0" aria-label="Belleva — kembali ke beranda">
          <Logo priority />
        </Link>

        {/*
          Pinned to the centre of the bar rather than laid out after the logo, so
          the menu sits on the true middle of the header whatever the logo and
          the buttons happen to measure. Only rendered from `lg`, where there is
          room for it to clear both sides.
        */}
        <nav
          aria-label="Navigasi utama"
          className="absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center gap-7 text-sm font-medium text-muted lg:flex"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === sectionIdOf(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative transition-colors hover:text-brand",
                  isActive && "font-semibold text-brand",
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-1.5 h-[3px] rounded-full bg-brand" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/*
            Support and legal links sit behind a disclosure rather than in the
            bar: the four of them need ~426px, and the room beside a centred
            menu inside this max-w-6xl bar tops out around 381px even on a wide
            screen — laid out flat they would collide with the menu.
          */}
          <div ref={helpRef} className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setHelpOpen((open) => !open)}
              aria-expanded={helpOpen}
              aria-controls="header-help"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-brand hover:bg-soft hover:text-brand"
            >
              Bantuan
              <ChevronDownIcon
                className={cn("transition-transform duration-200", helpOpen && "rotate-180")}
              />
            </button>

            <AnimatePresence>
              {helpOpen && (
                /*
                 * The panel is positioned against the wrapper, which is only as
                 * tall as the button — so `mt-4` is what clears the 64px bar
                 * rather than letting the panel cover its bottom border.
                 */
                <motion.div
                  id="header-help"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-full right-0 z-50 mt-4 w-60 rounded-2xl bg-white p-2 shadow-soft"
                >
                  {helpLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setHelpOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-soft hover:text-brand"
                    >
                      <HelpLinkIcon id={link.icon} className="shrink-0" />
                      {link.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            className="grid h-10 w-10 place-items-center rounded-pill text-ink transition-colors hover:bg-soft lg:hidden"
          >
            {menuOpen ? <CloseIcon size={20} /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Navigasi seluler"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <ul className="mx-auto max-w-6xl space-y-1 px-5 py-4 text-sm font-medium">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-3 text-muted transition-colors hover:bg-soft hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
