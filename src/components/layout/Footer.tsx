import { footerMenu } from "@/data/nav";
import { socialLinks } from "@/data/payment-methods";
import { externalLinks, siteConfig } from "@/lib/site";

import { SocialIcon } from "@/components/icons";
import { Logo } from "./Logo";

const helpMenu = [
  /** The mobile app home reaches this from its tab bar; desktop from here. */
  { label: "Cek Transaksi", href: "/cek-transaksi" },
  { label: "Pusat Bantuan", href: externalLinks.helpCenter },
  { label: "Hubungi Kami", href: externalLinks.contact },
  { label: "Syarat & Ketentuan", href: externalLinks.terms },
  { label: "Kebijakan Privasi", href: externalLinks.privacy },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    // The mobile app home floats a fixed tab bar over the bottom of the page.
    <footer className="bg-ink pb-20 text-white/70 lg:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="light" />
          <p className="mt-4">{siteConfig.shortDescription}</p>
          <p className="mt-2 text-xs">
            <a href={siteConfig.url} className="transition-colors hover:text-white">
              {siteConfig.domain}
            </a>
          </p>
        </div>

        <nav aria-label="Menu">
          <p className="mb-3 font-bold text-white">Menu</p>
          <ul className="space-y-2">
            {footerMenu.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Bantuan">
          <p className="mb-3 font-bold text-white">Bantuan</p>
          <ul className="space-y-2">
            {helpMenu.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-3 font-bold text-white">Ikuti Kami</p>
          <ul className="flex gap-3">
            {socialLinks.map((social) => (
              <li key={social.id}>
                <a
                  href={social.href}
                  aria-label={social.label}
                  className="grid h-9 w-9 place-items-center rounded-pill bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <SocialIcon id={social.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs">
          © {year} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
