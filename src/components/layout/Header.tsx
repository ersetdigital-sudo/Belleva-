"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/cn";
import { navLinks, sectionIdOf } from "@/data/nav";
import { externalLinks } from "@/lib/site";
import { useActiveSection } from "@/lib/use-active-section";

import { Logo } from "./Logo";
import { CloseIcon, MenuIcon } from "@/components/icons";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const sectionIds = useMemo(() => navLinks.map((link) => sectionIdOf(link.href)), []);
  const activeSection = useActiveSection(sectionIds);

  /*
   * The home page replaces this header with the app bar and bottom tab bar on
   * phones, so the header only renders from `lg` up there. Every other route
   * (e.g. /bayar) keeps the normal mobile header.
   */
  const isAppHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur",
        isAppHome && "hidden lg:block",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
        <Link href="/" className="block shrink-0" aria-label="Belleva — kembali ke beranda">
          <Logo priority />
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-7 text-sm font-medium text-muted lg:flex"
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
          <a
            href={externalLinks.login}
            className="hidden px-3 py-2 text-sm font-semibold text-muted sm:inline"
          >
            Masuk
          </a>
          <Link
            href={externalLinks.register}
            className="blue-grad rounded-pill px-5 py-2.5 text-sm font-bold text-white shadow-soft"
          >
            Daftar
          </Link>
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
              <li className="sm:hidden">
                <a
                  href={externalLinks.login}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-3 font-semibold text-muted transition-colors hover:bg-soft hover:text-brand"
                >
                  Masuk
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
