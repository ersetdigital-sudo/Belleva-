"use server";

import { revalidatePath } from "next/cache";

import { inquireBill } from "@/lib/billing";
import { resolvePostpaid, resolvePrepaid } from "@/lib/catalog";
import { createAdminClient } from "@/lib/admin/supabase";
import { getCatalogue } from "@/lib/products";
import { siteConfig } from "@/lib/site";

/**
 * Records a checkout on the server so the order can actually be managed.
 *
 * Called from the checkout, which is a client component — so nothing it sends
 * is trusted. The price is resolved again here from the catalogue and the ids
 * that arrived are checked against it; the only values taken from the client
 * are the reference, the customer number and the payment method label, and even
 * those are shape-checked.
 *
 * `ignoreDuplicates` makes it idempotent: refreshing the payment page does not
 * insert a second row, and does not overwrite a status the admin already set.
 */
export async function recordOrderAction(input: {
  reference: string;
  groupId: string;
  vendorId?: string;
  itemId?: string;
  choiceId?: string;
  customer: string;
  method: string;
}): Promise<{ ok: boolean }> {
  if (!/^BLV\d{6,10}$/.test(input.reference)) return { ok: false };
  if (!input.customer || input.customer.length > 24) return { ok: false };
  if (!input.method || input.method.length > 60) return { ok: false };

  try {
    const groups = await getCatalogue();

    const prepaid = resolvePrepaid(
      { groupId: input.groupId, vendorId: input.vendorId ?? null, itemId: input.itemId ?? null },
      groups,
    );
    const postpaid = resolvePostpaid(
      {
        groupId: input.groupId,
        vendorId: input.vendorId ?? null,
        choiceId: input.choiceId ?? null,
        customer: input.customer,
      },
      groups,
    );

    const order = prepaid ?? postpaid;
    if (!order) return { ok: false };

    const total =
      order.kind === "prepaid"
        ? order.price + siteConfig.serviceFee
        : inquireBill(order.group, order.vendor, input.customer, order.choice).total;

    const supabase = createAdminClient();
    const { error } = await supabase.from("orders").upsert(
      {
        reference: input.reference,
        customer: input.customer,
        product_name: order.name,
        group_label: order.group.label,
        vendor_label: order.vendor?.label ?? null,
        method: input.method,
        total,
        status: "menunggu",
      },
      { onConflict: "reference", ignoreDuplicates: true },
    );

    if (error) return { ok: false };
    revalidatePath("/admin/pesanan");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/** Marks the order the customer just confirmed as settled. */
export async function settleOrderAction(reference: string): Promise<{ ok: boolean }> {
  if (!/^BLV\d{6,10}$/.test(reference)) return { ok: false };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: "berhasil" })
      .eq("reference", reference)
      .eq("status", "menunggu");

    if (error) return { ok: false };
    revalidatePath("/admin/pesanan");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
