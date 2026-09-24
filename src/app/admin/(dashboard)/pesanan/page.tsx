import { updateOrderStatusAction } from "@/lib/admin/actions";
import { formatRupiah } from "@/lib/format";
import { ORDER_STATUSES, getOrders } from "@/lib/orders";
import { formatTransactionDate } from "@/lib/transactions";

const STATUS_STYLE: Record<string, string> = {
  menunggu: "bg-warn/15 text-warn",
  berhasil: "bg-success-soft text-success",
  gagal: "bg-danger-soft text-danger",
};

const FIELD =
  "min-h-10 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold outline-none transition focus:border-brand";

export default async function AdminPesananPage({ searchParams }: PageProps<"/admin/pesanan">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "semua";

  const { orders, total } = await getOrders({ query, status });

  return (
    <div>
      {/* ------------------------------ Title row ------------------------------ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="h-display text-xl font-extrabold">Kelola pesanan</h2>
          <p className="mt-1 text-sm text-muted">
            Menampilkan {orders.length} dari {total} pesanan
          </p>
        </div>

        <form className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Cari nomor referensi atau nomor HP…"
            aria-label="Cari pesanan"
            className={`${FIELD} w-64`}
          />
          <select name="status" defaultValue={status} aria-label="Status" className={FIELD}>
            <option value="semua">Semua status</option>
            {ORDER_STATUSES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="blue-grad inline-flex min-h-10 items-center rounded-pill px-5 text-sm font-bold text-white"
          >
            Cari
          </button>
        </form>
      </div>

      {/* -------------------------------- Table -------------------------------- */}
      {orders.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="font-bold">
            {total === 0 && !query && status === "semua"
              ? "Belum ada pesanan"
              : "Tidak ada pesanan yang cocok"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {total === 0 && !query && status === "semua"
              ? "Pesanan muncul di sini begitu ada yang menyelesaikan checkout. Sebelumnya riwayat transaksi hanya tersimpan di browser pembeli, jadi merchant tidak bisa melihatnya."
              : "Coba kata kunci lain, atau ubah filternya."}
          </p>
        </div>
      ) : (
        <div className="card mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-3 font-semibold">Referensi</th>
                  <th className="px-5 py-3 font-semibold">Pelanggan</th>
                  <th className="px-5 py-3 font-semibold">Produk</th>
                  <th className="px-5 py-3 font-semibold">Metode</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Waktu</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-soft">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink">
                      {order.reference}
                    </td>
                    <td className="px-5 py-3.5 font-semibold">{order.customer}</td>
                    <td className="px-5 py-3.5">
                      <span className="block font-semibold">{order.productName}</span>
                      <span className="block text-xs text-muted">
                        {order.groupLabel}
                        {order.vendorLabel ? ` · ${order.vendorLabel}` : ""}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted">{order.method}</td>
                    <td className="px-5 py-3.5 text-right font-bold whitespace-nowrap text-brand">
                      {formatRupiah(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-pill px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${
                          STATUS_STYLE[order.status] ?? STATUS_STYLE.menunggu
                        }`}
                      >
                        {ORDER_STATUSES.find((entry) => entry.value === order.status)?.label ??
                          order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap text-muted">
                      {formatTransactionDate(new Date(order.createdAt).getTime())}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        {ORDER_STATUSES.filter((entry) => entry.value !== order.status).map(
                          (entry) => (
                            <form key={entry.value} action={updateOrderStatusAction}>
                              <input type="hidden" name="id" value={order.id} />
                              <input type="hidden" name="status" value={entry.value} />
                              <button
                                type="submit"
                                className="min-h-9 rounded-pill border border-line px-3 text-xs font-semibold whitespace-nowrap text-muted transition-colors hover:border-brand hover:text-brand"
                              >
                                {entry.value === "berhasil" ? "Tandai berhasil" : entry.value === "gagal" ? "Tandai gagal" : "Kembali menunggu"}
                              </button>
                            </form>
                          ),
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
