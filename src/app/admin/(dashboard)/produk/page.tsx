import { PriceEditor } from "@/components/admin/PriceEditor";
import { PageHeader } from "@/components/admin/ui";
import { defaultPrices, getCatalogue, getCatalogueOverrides } from "@/lib/products";

export default async function AdminProdukPage() {
  const [groups, overrides] = await Promise.all([getCatalogue(), getCatalogueOverrides()]);

  return (
    <div>
      <PageHeader
        title="Produk & harga"
        description="Ubah harga, tambah produk sendiri, atau sembunyikan produk bawaan. Katalog di beranda dan halaman pembayaran membaca nilai yang sama, jadi harga yang tampil dan yang ditagih tidak bisa berbeda."
      />

      <div className="mt-6">
        <PriceEditor groups={groups} defaults={defaultPrices()} overrides={overrides} />
      </div>
    </div>
  );
}
