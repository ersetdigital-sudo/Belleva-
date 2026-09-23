import { productGroups } from "@/data/products";

/**
 * Marketplace-style operator detection: the visitor types their number first and
 * the operator is inferred from the MSISDN prefix (Indonesian numbering plan).
 * The prefix table lives on each vendor in `data/products.ts`.
 *
 * `digits` is what was typed after the "+62" prefix, with or without a leading
 * zero ("81234567890" and "081234567890" are both accepted).
 */
export function detectOperatorId(digits: string): string | null {
  const normalized = digits.startsWith("0") ? digits : `0${digits}`;
  if (normalized.length < 4) return null;

  const prefix = normalized.slice(0, 4);
  const pulsa = productGroups.find((group) => group.id === "pulsa");

  for (const vendor of pulsa?.vendors ?? []) {
    if (vendor.prefixes?.includes(prefix)) return vendor.id;
  }
  return null;
}

/** True when this catalogue infers the vendor from the customer number. */
export function supportsAutoDetect(groupId: string): boolean {
  return groupId === "pulsa" || groupId === "data";
}
