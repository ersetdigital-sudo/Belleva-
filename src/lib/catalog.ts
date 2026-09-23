import { productGroups } from "@/data/products";
import type { ChoiceOption, ProductGroup, ProductItem, Vendor } from "@/types";

export interface ResolvedOrder {
  group: ProductGroup;
  vendor?: Vendor;
  /** Prepaid only. */
  item?: ProductItem;
  /** Postpaid only. */
  choice?: ChoiceOption;
  /** What the customer typed (phone / customer id / contract number). */
  customer: string;
  /** Prepaid: the selling price. Postpaid: unused — see `inquireBill`. */
  price: number;
  /** Human label shown on the payment page. */
  name: string;
  subtitle: string;
  kind: "prepaid" | "postpaid";
  originalPrice?: number;
}

export function findProductGroup(id: string | null | undefined): ProductGroup | null {
  return productGroups.find((group) => group.id === id) ?? null;
}

export function findVendor(group: ProductGroup, id: string | null | undefined): Vendor | undefined {
  return group.vendors?.find((vendor) => vendor.id === id) ?? group.vendors?.[0];
}

export function findChoice(
  group: ProductGroup,
  id: string | null | undefined,
): ChoiceOption | undefined {
  return group.choice?.options.find((entry) => entry.id === id) ?? group.choice?.options[0];
}

/**
 * Resolves a prepaid order from its ids. Only the catalogue id travels in the
 * URL, so the price always comes from the data layer rather than the client.
 */
export function resolvePrepaid(params: {
  groupId: string | null;
  vendorId: string | null;
  itemId: string | null;
}): ResolvedOrder | null {
  const group = findProductGroup(params.groupId);
  if (!group || group.flow !== "prepaid") return null;

  const vendor = findVendor(group, params.vendorId);
  const pool = vendor?.items ?? group.items ?? [];
  const item = pool.find((entry) => entry.id === params.itemId);
  if (!item) return null;

  const operatorNote = vendor ? `${vendor.label} · ` : "";

  return {
    group,
    vendor,
    item,
    customer: "",
    price: item.price,
    originalPrice: item.originalPrice,
    name: `${item.name} ${item.headline}`.trim(),
    subtitle: `${operatorNote}${item.meta ?? "Proses instan"}`,
    kind: "prepaid",
  };
}

/** Resolves a postpaid order (the bill itself is fetched via `inquireBill`). */
export function resolvePostpaid(params: {
  groupId: string | null;
  vendorId: string | null;
  choiceId: string | null;
  customer: string;
}): ResolvedOrder | null {
  const group = findProductGroup(params.groupId);
  if (!group || group.flow !== "postpaid") return null;

  const vendor = findVendor(group, params.vendorId);
  const choice = findChoice(group, params.choiceId);
  const operatorNote = vendor ? `${vendor.label}` : group.label;

  return {
    group,
    vendor,
    choice,
    customer: params.customer,
    price: 0,
    name: group.title,
    subtitle: `${operatorNote} · ${group.customer.label} ${params.customer}`,
    kind: "postpaid",
  };
}
