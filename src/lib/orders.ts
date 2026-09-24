import { normalizePhone } from "@/lib/format";
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

function toOrder(row: OrderRow): Order {
  return {
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
  };
}

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
      orders: (data as OrderRow[]).map(toOrder),
      total: count ?? data.length,
    };
  } catch {
    return { orders: [] as Order[], total: 0 };
  }
}

export type LookupScope = "reference" | "customer" | "none";

/**
 * The public lookup behind /cek-transaksi.
 *
 * Accepts either a reference code or a phone number. A code is generated per
 * payment attempt, so holding one is proof of ownership and it can be looked up
 * on its own. A number is not proof of anything, so a number search requires a
 * full number (8+ digits) and returns at most 10 orders.
 *
 * Runs on the service role like the admin list, because `orders` deliberately
 * has no public read policy — every row carries a customer number.
 */
export async function lookupOrders(
  rawQuery: string,
): Promise<{ orders: Order[]; scope: LookupScope }> {
  // Wildcards are stripped, not escaped: `%` on its own would otherwise match
  // every order and hand a stranger the whole table.
  const term = rawQuery.trim().replace(/[%_\\]/g, "").slice(0, 40);
  if (term.length < 3) return { orders: [], scope: "none" };

  // A reference contains letters; anything else is a number, because a
  // reference's trailing digits can sit inside an unrelated phone number.
  const isReference = /[a-z]/i.test(term);
  const scope: LookupScope = isReference ? "reference" : "customer";

  try {
    const supabase = createAdminClient();
    let request = supabase
      .from("orders")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(10);

    if (isReference) {
      request = request.ilike("reference", term);
    } else {
      const core = normalizePhone(term);
      if (core.length < 8) return { orders: [], scope };
      // Matched on the tail: the stored value may keep its leading 0 or use the
      // 62 country code, so only the digits after that are common to all forms.
      request = request.ilike("customer", `%${core.slice(-9)}%`);
    }

    const { data, error } = await request;
    if (error || !data) return { orders: [], scope };
    return { orders: (data as OrderRow[]).map(toOrder), scope };
  } catch {
    return { orders: [], scope };
  }
}
