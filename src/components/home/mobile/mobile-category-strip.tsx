"use client";

import Link from "next/link";

import { categories } from "@/data/categories";
import { cn } from "@/lib/cn";

import { CategoryIcon } from "@/components/icons";

import { useProductTab } from "../product-tab-context";

/**
 * Service grid. Same `categories` source as the desktop strip, so tapping a
 * tile opens the matching catalogue tab here too.
 *
 * The wireframe asked for a horizontal rail, but that clipped the last
 * services on a phone — 4 columns × 2 rows shows all eight with nothing cut.
 */
export function MobileCategoryStrip() {
  const { activeGroup, setActiveGroup } = useProductTab();

  return (
    <nav aria-label="Layanan" className="mt-6">
      <ul className="grid grid-cols-4 gap-x-2 gap-y-3 px-5">
        {categories.map((category) => {
          const selected = category.productGroup === activeGroup;
          return (
            <li key={category.id}>
              <Link
                href={category.href}
                onClick={() => {
                  if (category.productGroup) setActiveGroup(category.productGroup);
                }}
                className="block text-center"
              >
                <span
                  className={cn(
                    "ico mx-auto h-12 w-12 rounded-2xl transition",
                    selected && "ring-2 ring-brand ring-offset-2",
                  )}
                  style={{ background: category.gradient }}
                >
                  <CategoryIcon id={category.id} />
                </span>
                <span
                  className={cn(
                    "mt-2 block text-[11px] leading-tight font-semibold",
                    selected ? "text-brand" : "text-muted",
                  )}
                >
                  {category.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
