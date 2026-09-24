import { PriceEditor } from "@/components/admin/PriceEditor";
import { defaultPrices, getCatalogue, getPriceOverrides } from "@/lib/products";

export default async function AdminProdukPage() {
  const [groups, saved] = await Promise.all([getCatalogue(), getPriceOverrides()]);

  return (
    <div>
      <h2 className="h-display text-xl font-extrabold">Harga produk</h2>
      <p className="mt-1.5 text-sm text-muted">
        Harga di sini yang dipakai katalog dan halaman pembayaran — keduanya membaca nilai yang sama,
        jadi harga yang tampil dan yang ditagih tidak bisa berbeda. Yang tidak kamu ubah tetap ikut
        nilai bawaan di kode.
      </p>

      <div className="mt-6">
        <PriceEditor
          groups={groups}
          defaults={defaultPrices()}
          overriddenCount={Object.keys(saved).length}
        />
      </div>
    </div>
  );
}
