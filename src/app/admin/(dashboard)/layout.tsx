import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/lib/admin/actions";
import { isSignedIn } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "Panel Admin",
  robots: { index: false, follow: false },
};

const ADMIN_NAV = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/pembayaran", label: "Pembayaran" },
  { href: "/admin/kontak", label: "Kontak" },
];

/**
 * Shell for every signed-in admin page, and the guard for the whole group.
 * The login route sits outside this group, so it is never blocked by it.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!(await isSignedIn())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-brand">PANEL ADMIN</p>
          <h1 className="h-display mt-1 text-2xl font-extrabold">Belleva</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center rounded-pill border border-line px-4 text-sm font-semibold transition hover:border-brand hover:text-brand"
          >
            Lihat situs
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center rounded-pill border border-line px-4 text-sm font-semibold text-muted transition hover:border-danger hover:text-danger"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <nav aria-label="Navigasi admin" className="mb-6 lg:mb-0">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
            {ADMIN_NAV.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-muted transition-colors hover:bg-soft hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
