import { PaymentSettingsForm } from "@/components/admin/PaymentSettingsForm";
import { getPaymentSettings } from "@/lib/settings";

export default async function AdminPembayaranPage() {
  const settings = await getPaymentSettings();

  return (
    <div>
      <h2 className="h-display text-xl font-extrabold">Pembayaran</h2>
      <p className="mt-1.5 text-sm text-muted">
        Metode bayar, langkah pembayarannya, nomor rekening, dan gambar QRIS. Yang kosong di sini
        berarti situs masih memakai nilai bawaan.
      </p>

      <div className="mt-6">
        <PaymentSettingsForm initial={settings} />
      </div>
    </div>
  );
}
