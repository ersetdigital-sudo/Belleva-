import { PaymentSettingsForm } from "@/components/admin/PaymentSettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { getPaymentSettings } from "@/lib/settings";

export default async function AdminPembayaranPage() {
  const settings = await getPaymentSettings();

  return (
    <div>
      <PageHeader
        title="Pembayaran"
        description="Metode bayar, langkah pembayarannya, nomor rekening, dan gambar QRIS. Yang kosong di sini berarti situs masih memakai nilai bawaan."
      />

      <div className="mt-6">
        <PaymentSettingsForm initial={settings} />
      </div>
    </div>
  );
}
