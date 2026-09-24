import { ContactsForm } from "@/components/admin/ContactsForm";
import { PageHeader } from "@/components/admin/ui";
import { getContacts } from "@/lib/settings";

export default async function AdminKontakPage() {
  const contacts = await getContacts();

  return (
    <div>
      <PageHeader
        title="Kontak"
        description="Nomor WhatsApp dan tautan bantuan yang dipakai di header, footer, halaman bantuan, dan halaman legal."
      />

      <div className="mt-6">
        <ContactsForm initial={contacts} />
      </div>
    </div>
  );
}
