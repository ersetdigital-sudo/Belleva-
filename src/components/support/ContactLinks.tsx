import { externalLinks } from "@/lib/site";

const OUTLINE =
  "inline-flex min-h-11 items-center rounded-pill border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/15";

/**
 * The contact buttons shown alongside the help and legal pages' closing calls
 * to action.
 *
 * They only render when `externalLinks.whatsapp` / `.email` are filled in, so an
 * unconfigured channel hides its button instead of shipping one that goes
 * nowhere.
 */
export function ContactLinks() {
  return (
    <>
      {externalLinks.whatsapp && (
        <a href={`https://wa.me/${externalLinks.whatsapp}`} className={OUTLINE}>
          WhatsApp
        </a>
      )}
      {externalLinks.email && (
        <a href={`mailto:${externalLinks.email}`} className={OUTLINE}>
          Email
        </a>
      )}
    </>
  );
}
