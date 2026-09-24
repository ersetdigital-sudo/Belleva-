import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminNav, AdminTopbar } from "@/components/admin/AdminChrome";
import { Logo } from "@/components/layout/Logo";
import { logoutAction } from "@/lib/admin/actions";
import { isSignedIn } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "Panel Admin",
  robots: { index: false, follow: false },
};

/**
 * Shell for every signed-in admin page, and the guard for the whole group.
 *
 * It carries its own chrome — a fixed sidebar and a sticky top bar — and the
 * public site's header and footer are dropped on `/admin` by `SiteChrome`, so
 * the panel never renders the marketing navigation. The login route sits
 * outside this group, so it is never blocked by the guard.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!(await isSignedIn())) redirect("/admin/login");

  return (
    <div className="lg:flex">
      <aside className="border-b border-line bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center px-5 lg:border-b lg:border-line">
          <Logo priority />
        </div>

        <AdminNav />

        <div className="border-t border-line p-3 lg:absolute lg:inset-x-0 lg:bottom-0 lg:p-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center rounded-xl px-3.5 text-sm font-semibold text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            >
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-64">
        <AdminTopbar />
        <div className="px-5 py-8">{children}</div>
      </div>
    </div>
  );
}
