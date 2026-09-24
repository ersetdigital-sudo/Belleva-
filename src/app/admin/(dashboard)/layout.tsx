import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { AdminNav, AdminTopbar } from "@/components/admin/AdminChrome";
import { PrivacyShieldIcon } from "@/components/icons";
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
      <aside className="border-b border-line bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0">
        {/* Brand block, as the dashboard wireframe lays it out. */}
        <div className="flex h-16 items-center gap-2.5 px-4 lg:h-auto lg:border-b lg:border-line lg:py-4">
          <Image
            src="/images/logo-belleva-mark.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-lg border border-line object-contain p-0.5"
          />
          <span className="min-w-0">
            <span className="block text-[10px] font-bold tracking-[0.12em] text-muted">
              PANEL ADMIN
            </span>
            <span className="block text-sm font-bold text-ink">Belleva</span>
          </span>
        </div>

        <AdminNav />

        <div className="mt-auto border-t border-line p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-soft text-brand">
              <PrivacyShieldIcon size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-ink">Akses admin</span>
              <span className="block text-[10px] text-muted">Sesi berlaku 12 jam</span>
            </span>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-line text-sm font-semibold text-muted transition-colors hover:border-danger hover:bg-danger-soft hover:text-danger"
            >
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <div className="min-h-dvh min-w-0 flex-1 bg-soft lg:pl-64">
        <AdminTopbar />
        <div className="px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
