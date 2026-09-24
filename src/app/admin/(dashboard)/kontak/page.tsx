import { ContactsForm } from "@/components/admin/ContactsForm";
import { getContacts } from "@/lib/settings";

export default async function AdminKontakPage() {
  const contacts = await getContacts();

  return (
    <div>
      <h2 className="h-display text-xl font-extrabold">Kontak</h2>
      <p className="mt-1.5 text-sm text-muted">
        Nomor WhatsApp dan tautan bantuan yang dipakai di header, footer, halaman bantuan, dan
        halaman legal.
      </p>

      <div className="mt-6">
        <ContactsForm initial={contacts} />
      </div>
    </div>
  );
}
