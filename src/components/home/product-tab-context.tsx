"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { ProductGroupId } from "@/types";

interface ProductTabContextValue {
  activeGroup: ProductGroupId;
  setActiveGroup: (group: ProductGroupId) => void;
}

const ProductTabContext = createContext<ProductTabContextValue | null>(null);

export function useProductTab(): ProductTabContextValue {
  const context = useContext(ProductTabContext);
  if (!context) {
    throw new Error("useProductTab() must be used inside <ProductTabProvider>");
  }
  return context;
}

/**
 * Shared catalogue tab state. The hero's service shortcuts set the tab ("PLN"
 * opens Token Listrik, "PDAM" opens Air PDAM, …) and the product section reads
 * it, so the two work as one marketplace flow.
 */
export function ProductTabProvider({ children }: { children: React.ReactNode }) {
  const [activeGroup, setActiveGroup] = useState<ProductGroupId>("pulsa");
  const value = useMemo(() => ({ activeGroup, setActiveGroup }), [activeGroup]);
  return <ProductTabContext.Provider value={value}>{children}</ProductTabContext.Provider>;
}
