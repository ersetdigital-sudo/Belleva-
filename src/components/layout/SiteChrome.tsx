"use client";

import { usePathname } from "next/navigation";

/**
 * The public site's header and footer belong to the site, not to the admin
 * panel. The admin has its own chrome (a fixed sidebar and a top bar), so both
 * are dropped on every `/admin` route.
 *
 * The header and footer are passed in as children so they stay server-rendered
 * for the pages that do show them.
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
