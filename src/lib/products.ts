import { productGroups } from "@/data/products";
import { createReadClient } from "@/lib/admin/supabase";
import type { ProductGroup, ProductItem } from "@/types";

/**
 * Catalogue overrides, editable from /admin/produk.
 *
 * The catalogue's shape still ships in `src/data/products.ts`, and the admin
 * layers three things on top: new prices, items added by hand, and shipped items
 * hidden from the storefront. That keeps the code as the baseline (so a group
 * added there shows up automatically) while letting the catalogue actually grow
 * without a deploy.
 *
 * The effective catalogue produced here is what both the catalogue display and
 * the checkout use, so the price shown and the price charged cannot disagree.
 */

export interface PriceOverrides {
  /** "group/vendor/item" -> price. Vendor is "-" for groups without vendors. */
  [key: string]: number;
}

export interface CatalogueOverrides {
  prices: PriceOverrides;
  /** Items added from the admin, keyed by "group/vendor". */
  addedItems: Record<string, ProductItem[]>;
  /** Keys of shipped items the admin removed. */
  hiddenItems: string[];
}

export const emptyOverrides: CatalogueOverrides = { prices: {}, addedItems: {}, hiddenItems: [] };

export function priceKey(groupId: string, vendorId: string | undefined, itemId: string): string {
  return `${groupId}/${vendorId ?? "-"}/${itemId}`;
}

/** "group/vendor" — the bucket an added item belongs to. */
export function bucketKey(groupId: string, vendorId: string | undefined): string {
  return `${groupId}/${vendorId ?? "-"}`;
}

/** Shipped prices, used to show what a row costs by default. */
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

export async function getCatalogueOverrides(): Promise<CatalogueOverrides> {
  try {
    const supabase = createReadClient();
    const { data } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", "product_catalogue")
      .maybeSingle();

    const stored = (data?.data ?? {}) as Partial<CatalogueOverrides>;
    return {
      prices: stored.prices ?? {},
      addedItems: stored.addedItems ?? {},
      hiddenItems: stored.hiddenItems ?? [],
    };
  } catch {
    return emptyOverrides;
  }
}

function withPrice(item: ProductItem, key: string, prices: PriceOverrides): ProductItem {
  const price = prices[key];
  if (typeof price !== "number" || price === item.price) return item;
  // A struck-through list price keeps its distance, so a discount stays a
  // discount instead of turning into a negative.
  const discount = item.originalPrice ? item.originalPrice - item.price : 0;
  return { ...item, price, originalPrice: discount > 0 ? price + discount : undefined };
}

function build(groupId: string, vendorId: string | undefined, shipped: ProductItem[], o: CatalogueOverrides) {
  const added = o.addedItems[bucketKey(groupId, vendorId)] ?? [];
  return [...shipped, ...added]
    .filter((item) => !o.hiddenItems.includes(priceKey(groupId, vendorId, item.id)))
    .map((item) => withPrice(item, priceKey(groupId, vendorId, item.id), o.prices));
}

/** The shipped catalogue with prices, additions and removals applied. */
export function applyCatalogue(overrides: CatalogueOverrides = emptyOverrides): ProductGroup[] {
  return productGroups.map((group) => {
    const vendors = group.vendors?.map((vendor) => ({
      ...vendor,
      items: vendor.items ? build(group.id, vendor.id, vendor.items, overrides) : vendor.items,
    }));

    // A group whose first vendor ends up empty after removals should not offer
    // an empty catalogue, so fall back to whatever is left.
    const items = group.items ? build(group.id, undefined, group.items, overrides) : group.items;

    return { ...group, items, vendors };
  });
}

export async function getCatalogue(): Promise<ProductGroup[]> {
  return applyCatalogue(await getCatalogueOverrides());
}
