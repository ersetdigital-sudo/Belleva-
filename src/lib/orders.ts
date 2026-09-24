import { normalizePhone } from "@/lib/format";
import { createAdminClient } from "@/lib/admin/supabase";

/** Order statuses the admin can set, with the label each one shows. */
export const ORDER_STATUSES = [
  { value: "menunggu", label: "Menunggu pembayaran" },
  { value: "berhasil", label: "Berhasil" },
  { value: "gagal", label: "Gagal" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];

/**
 * Badge styling per status. It lives beside the labels so the two cannot drift —
 * a status that reads "Berhasil" must never be shown in the pending colour.
 */
export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  menunggu: "bg-warn/15 text-warn",
  berhasil: "bg-success-soft text-success",
  gagal: "bg-danger-soft text-danger",
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUSES.find((entry) => entry.value === status)?.label ?? status;
}

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
  /** Catalogue ids, so an unpaid order can be reopened in the checkout. */
  groupId: string | null;
  vendorId: string | null;
  itemId: string | null;
  choiceId: string | null;
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
  group_id: string | null;
  vendor_id: string | null;
  item_id: string | null;
  choice_id: string | null;
}

const SELECT =
  "id, reference, customer, product_name, group_label, vendor_label, method, total, status, created_at, group_id, vendor_id, item_id, choice_id";

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
    groupId: row.group_id,
    vendorId: row.vendor_id,
    itemId: row.item_id,
    choiceId: row.choice_id,
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

  await sweepIfDue();

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

/** How long a customer has to pay before the order is written off. */
export const PAYMENT_WINDOW_HOURS = 24;

/**
 * Writes off unpaid orders that are past their payment window.
 *
 * The checkout tells the customer "setelah itu transaksi dibatalkan otomatis",
 * and this is the thing that actually does it — without it that sentence is a
 * promise nobody keeps and the pending list only ever grows.
 *
 * Expired orders are marked `gagal` rather than given a status of their own:
 * from the shop's side, an abandoned order and a payment that did not complete
 * both mean no money arrived.
 */
export async function expireStaleOrders(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const cutoff = new Date(Date.now() - PAYMENT_WINDOW_HOURS * 3_600_000).toISOString();

    const { data, error } = await supabase
      .from("orders")
      .update({ status: "gagal" })
      .eq("status", "menunggu")
      .lt("created_at", cutoff)
      .select("id");

    if (error) return 0;
    return data?.length ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Runs the sweep at most once a minute per server process.
 *
 * It hangs off the read paths so nobody is ever shown a stale answer, but every
 * read firing its own UPDATE would be wasteful. The cron route calls
 * `expireStaleOrders` directly when it wants to be certain.
 */
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

async function sweepIfDue(): Promise<void> {
  if (Date.now() - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = Date.now();
  await expireStaleOrders();
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

  // The customer should never be told to pay an order that has already lapsed.
  await sweepIfDue();

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
