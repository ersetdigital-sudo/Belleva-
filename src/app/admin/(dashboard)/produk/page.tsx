import { PriceEditor } from "@/components/admin/PriceEditor";
import { defaultPrices, getCatalogue, getCatalogueOverrides } from "@/lib/products";

export default async function AdminProdukPage() {
  const [groups, overrides] = await Promise.all([getCatalogue(), getCatalogueOverrides()]);

  return (
    <div>
      <h2 className="h-display text-xl font-extrabold">Produk &amp; harga</h2>
      <p className="mt-1.5 text-sm text-muted">
        Ubah harga, tambah produk sendiri, atau sembunyikan produk bawaan. Katalog di beranda dan
        halaman pembayaran membaca nilai yang sama, jadi harga yang tampil dan yang ditagih tidak
        bisa berbeda.
      </p>

      <div className="mt-6">
        <PriceEditor groups={groups} defaults={defaultPrices()} overrides={overrides} />
      </div>
    </div>
  );
}
