import type { SiteContacts } from "@/lib/settings";

const OUTLINE =
  "inline-flex min-h-11 items-center rounded-pill border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/15";

/**
 * The contact buttons shown alongside the help and legal pages' closing calls
 * to action. The contacts come from the database (editable in /admin/kontak);
 * an empty channel hides its button instead of shipping one that goes nowhere.
 */
export function ContactLinks({ contacts }: { contacts: SiteContacts }) {
  return (
    <>
      {contacts.whatsapp && (
        <a href={`https://wa.me/${contacts.whatsapp}`} className={OUTLINE}>
          WhatsApp
        </a>
      )}
      {contacts.email && (
        <a href={`mailto:${contacts.email}`} className={OUTLINE}>
          Email
        </a>
      )}
    </>
  );
}
