"use client";

import { createContext, useContext } from "react";

import type { ProductGroup } from "@/types";

/**
 * The effective catalogue (defaults with admin prices applied), provided by the
 * server page so client components read one source instead of the raw data
 * module. Consumers fall back to the default catalogue when no provider is
 * above them, which keeps them usable in isolation.
 */
const CatalogueContext = createContext<ProductGroup[] | null>(null);

export function CatalogueProvider({
  groups,
  children,
}: {
  groups: ProductGroup[];
  children: React.ReactNode;
}) {
  return <CatalogueContext.Provider value={groups}>{children}</CatalogueContext.Provider>;
}

export function useCatalogue(fallback: ProductGroup[]): ProductGroup[] {
  return useContext(CatalogueContext) ?? fallback;
}
