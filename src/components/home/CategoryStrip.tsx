"use client";

import Link from "next/link";

import { categories } from "@/data/categories";

import { CategoryIcon } from "@/components/icons";

import { useProductTab } from "./product-tab-context";

/**
 * The 8-service shortcut strip. Sits inside the hero section so it shares the
 * hero's gradient backdrop. Every shortcut now opens a real catalogue tab.
 */
export function CategoryStrip() {
  const { setActiveGroup } = useProductTab();

  return (
    <div className="mx-auto max-w-6xl px-5 pb-14">
      <div className="card p-5 shadow-soft sm:p-7">
        <ul className="grid grid-cols-4 gap-4 text-center md:grid-cols-8">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={category.href}
                onClick={() => {
                  if (category.productGroup) setActiveGroup(category.productGroup);
                }}
                className="feat block"
              >
                <span
                  className="ico mx-auto h-[54px] w-[54px] rounded-[18px]"
                  style={{ background: category.gradient }}
                >
                  <CategoryIcon id={category.id} />
                </span>
                <span className="mt-2.5 block text-xs font-semibold">{category.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
