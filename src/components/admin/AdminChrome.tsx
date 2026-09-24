"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import {
  ChatIcon,
  ChevronRightIcon,
  HomeIcon,
  ReceiptIcon,
  TagIcon,
} from "@/components/icons";

type AdminIcon = (props: { size?: number; className?: string }) => React.ReactElement;

/**
 * Navigation, grouped the way the dashboard wireframe groups it. Each item
 * carries an icon so the rail is scannable without reading every label.
 */
export const ADMIN_NAV: { group: string; items: { href: string; label: string; icon: AdminIcon }[] }[] = [
  {
    group: "Konten",
    items: [
      { href: "/admin", label: "Ringkasan", icon: HomeIcon },
      { href: "/admin/produk", label: "Harga produk", icon: TagIcon },
    ],
  },
  {
    group: "Pengaturan",
    items: [
      { href: "/admin/pembayaran", label: "Pembayaran", icon: ReceiptIcon },
      { href: "/admin/kontak", label: "Kontak", icon: ChatIcon },
    ],
  },
];

const ALL_ITEMS = ADMIN_NAV.flatMap((group) => group.items);

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi admin" className="px-3 py-3 lg:py-4">
      {ADMIN_NAV.map((section) => (
        <div key={section.group} className="mb-4 last:mb-0">
          <p className="hidden px-3 pb-1.5 text-[10px] font-bold tracking-[0.12em] text-muted uppercase lg:block">
            {section.group}
          </p>
          <ul className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
            {section.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                      active ? "bg-soft text-brand" : "text-muted hover:bg-soft hover:text-brand",
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Sticky top bar: where you are, plus the way back to the live site. */
export function AdminTopbar() {
  const pathname = usePathname();
  const current = ALL_ITEMS.find((item) => item.href === pathname)?.label ?? "Ringkasan";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-5 sm:px-8">
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
