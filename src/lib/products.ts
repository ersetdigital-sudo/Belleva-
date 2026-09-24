import { productGroups } from "@/data/products";
import { createReadClient } from "@/lib/admin/supabase";
import type { ProductGroup, ProductItem } from "@/types";

/**
 * Product prices, editable from /admin/produk.
 *
 * Only the prices live in the database; the catalogue's shape (groups, vendors,
 * items, names, kuota) stays in `src/data/products.ts`. That keeps the override
 * small and means a group added in code shows up in the admin automatically —
 * it just starts on its default price.
 *
 * The effective catalogue produced here is what both the catalogue display and
 * the checkout use, so the price shown and the price charged cannot disagree.
 */

export interface PriceOverrides {
  /** "group/vendor/item" -> price. Vendor is "-" for groups without vendors. */
  [key: string]: number;
}

export function priceKey(groupId: string, vendorId: string | undefined, itemId: string): string {
  return `${groupId}/${vendorId ?? "-"}/${itemId}`;
}

export function defaultPrices(): PriceOverrides {
  const prices: PriceOverrides = {};
  for (const group of productGroups) {
    for (const vendor of group.vendors ?? []) {
      for (const item of vendor.items ?? []) prices[priceKey(group.id, vendor.id, item.id)] = item.price;
    }
    for (const item of group.items ?? []) prices[priceKey(group.id, undefined, item.id)] = item.price;
  }
  return prices;
}

export async function getPriceOverrides(): Promise<PriceOverrides> {
  try {
    const supabase = createReadClient();
    const { data } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", "product_prices")
      .maybeSingle();
    const stored = (data?.data ?? {}) as { prices?: PriceOverrides };
    return stored.prices ?? {};
  } catch {
    return {};
  }
}

function withPrice(item: ProductItem, key: string, prices: PriceOverrides): ProductItem {
  const price = prices[key];
  if (typeof price !== "number" || price === item.price) return item;
  // The struck-through list price keeps its distance from the new price, so a
  // discount stays a discount instead of turning into a negative.
  const discount = item.originalPrice ? item.originalPrice - item.price : 0;
  return { ...item, price, originalPrice: discount > 0 ? price + discount : undefined };
}

/** The catalogue with admin prices applied. Unchanged rows are returned as-is. */
export function applyPrices(prices: PriceOverrides): ProductGroup[] {
  return productGroups.map((group) => ({
    ...group,
    items: group.items?.map((item) =>
      withPrice(item, priceKey(group.id, undefined, item.id), prices),
    ),
    vendors: group.vendors?.map((vendor) => ({
      ...vendor,
      items: vendor.items?.map((item) => withPrice(item, priceKey(group.id, vendor.id, item.id), prices)),
    })),
  }));
}

export async function getCatalogue(): Promise<ProductGroup[]> {
  return applyPrices(await getPriceOverrides());
}
