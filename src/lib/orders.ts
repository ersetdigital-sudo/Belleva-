import { createAdminClient } from "@/lib/admin/supabase";

/** Order statuses the admin can set, with the label each one shows. */
export const ORDER_STATUSES = [
  { value: "menunggu", label: "Menunggu pembayaran" },
  { value: "berhasil", label: "Berhasil" },
  { value: "gagal", label: "Gagal" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];

export interface Order {
  id: string;
  reference: string;
  customer: string;
  productName: string;
  groupLabel: string;
  vendorLabel: string | null;
  method: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

interface OrderRow {
  id: string;
  reference: string;
  customer: string;
  product_name: string;
  group_label: string;
  vendor_label: string | null;
  method: string;
  total: number;
  status: string;
  created_at: string;
}

const SELECT = "id, reference, customer, product_name, group_label, vendor_label, method, total, status, created_at";

/**
 * The order list for the admin panel.
 *
 * Orders are only readable with the service role — the table deliberately has no
 * public read policy, because every row carries a customer number.
 */
export async function getOrders(options: { query?: string; status?: string; limit?: number } = {}) {
  const { query = "", status = "semua", limit = 100 } = options;

  try {
    const supabase = createAdminClient();
    let request = supabase
      .from("orders")
      .select(SELECT, { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status !== "semua") request = request.eq("status", status);

    const term = query.trim();
    if (term) {
      // Matches the reference or the customer number; digits are compared as
      // typed, so "0812…" and "812…" both find the same order.
      const digits = term.replace(/\D/g, "");
      const filters = [`reference.ilike.%${term}%`, `customer.ilike.%${term}%`];
      if (digits && digits !== term) filters.push(`customer.ilike.%${digits}%`);
      request = request.or(filters.join(","));
    }

    const { data, error, count } = await request;
    if (error || !data) return { orders: [] as Order[], total: 0 };

    return {
      orders: (data as OrderRow[]).map((row) => ({
        id: row.id,
        reference: row.reference,
        customer: row.customer,
        productName: row.product_name,
        groupLabel: row.group_label,
        vendorLabel: row.vendor_label,
        method: row.method,
        total: row.total,
        status: (ORDER_STATUSES.some((entry) => entry.value === row.status)
          ? row.status
          : "menunggu") as OrderStatus,
        createdAt: row.created_at,
      })),
      total: count ?? data.length,
    };
  } catch {
    return { orders: [] as Order[], total: 0 };
  }
}
