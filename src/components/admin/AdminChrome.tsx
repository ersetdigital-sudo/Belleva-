"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { ChevronRightIcon } from "@/components/icons";

export const ADMIN_NAV = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/pembayaran", label: "Pembayaran" },
  { href: "/admin/kontak", label: "Kontak" },
];

/**
 * Sidebar navigation. Horizontal and scrollable on phones, a vertical list from
 * `lg` up — the same links, laid out for the space available.
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi admin" className="px-3 py-3 lg:py-4">
      <p className="hidden px-3 pb-2 text-[11px] font-bold tracking-widest text-muted lg:block">
        KELOLA
      </p>
      <ul className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
        {ADMIN_NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-xl px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "bg-soft text-brand"
                    : "text-muted hover:bg-soft hover:text-brand",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Sticky top bar: where you are, plus the way back to the live site. */
export function AdminTopbar() {
  const pathname = usePathname();
  const current = ADMIN_NAV.find((item) => item.href === pathname)?.label ?? "Ringkasan";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-5">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
          <Link
            href="/admin"
            className="font-semibold text-muted transition-colors hover:text-brand"
          >
            Panel Admin
          </Link>
          <ChevronRightIcon size={14} className="shrink-0 text-muted" />
          <span className="truncate font-bold text-ink">{current}</span>
        </nav>

        <Link
          href="/"
          className="ml-auto inline-flex min-h-10 shrink-0 items-center rounded-pill border border-line px-4 text-sm font-semibold transition hover:border-brand hover:text-brand"
        >
          Lihat situs
        </Link>
      </div>
    </header>
  );
}
