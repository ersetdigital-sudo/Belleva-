"use client";

import Link from "next/link";

import { productGroups } from "@/data/products";
import { buildMobileCatalogue, buildMobileRecommendations } from "@/data/mobile-home";
import { formatRupiah } from "@/lib/format";

import { CategoryIcon, PlusIcon } from "@/components/icons";

import { useCatalogue } from "../catalogue-context";
import { useProductTab } from "../product-tab-context";

const MAX_RESULTS = 8;

interface MobileRecommendationsProps {
  /** Live value from the search field above. */
  query: string;
}

/**
 * Two-column product grid. The wireframe's card art is a product photo; Belleva
 * ships no product photography, so the media slot carries the category's own
 * gradient and icon instead of a stand-in image.
 */
export function MobileRecommendations({ query }: MobileRecommendationsProps) {
  const { setActiveGroup } = useProductTab();
  /** The catalogue with the admin's prices applied, from the server page. */
  const catalogue = useCatalogue(productGroups);
  const mobileCatalogue = buildMobileCatalogue(catalogue);
  const mobileRecommendations = buildMobileRecommendations(catalogue);
  const term = query.trim().toLowerCase();

  const results = term
    ? mobileCatalogue
        .filter((entry) =>
          [
            entry.groupLabel,
            entry.item.name,
            entry.item.headline ?? "",
            entry.item.meta ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(term),
        )
        .slice(0, MAX_RESULTS)
    : mobileRecommendations;

  /** Prices are never carried in the URL — the catalogue resolves them. */
  function openCatalogue(groupId: (typeof mobileCatalogue)[number]["groupId"]) {
    setActiveGroup(groupId);
    document.getElementById("produk")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section aria-label="Rekomendasi produk" className="mt-6 px-5 pb-6">
      <div className="flex items-end justify-between gap-3">
        <h3 className="h-display text-lg font-extrabold text-ink">
          {term ? "Hasil pencarian" : "Rekomendasi"}
        </h3>
        <Link href="/#produk" className="shrink-0 text-xs font-bold text-brand">
          Lihat semua
        </Link>
      </div>

      {results.length === 0 ? (
        <p className="card mt-3 p-5 text-center text-sm text-muted">
          Tidak ada produk yang cocok dengan “{query.trim()}”. Coba kata lain seperti “pulsa”,
          “kuota”, atau “token”.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {results.map((entry) => (
            <li key={entry.key}>
              <button
                type="button"
                onClick={() => openCatalogue(entry.groupId)}
                className="card group relative flex h-full w-full flex-col overflow-hidden p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {entry.item.badge && (
                  <span className="absolute top-0 left-0 rounded-br-xl bg-warn px-2.5 py-1 text-[10px] leading-none font-bold text-white">
                    {entry.item.badge}
                  </span>
                )}

                <span
                  className="grid h-24 w-full place-items-center rounded-xl"
                  style={{ background: entry.gradient }}
                >
                  <CategoryIcon id={entry.icon} className="h-8 w-8" />
                </span>

                <span className="mt-2.5 block min-w-0">
                  <span className="block truncate text-[11px] font-semibold text-muted">
                    {entry.groupLabel}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-extrabold text-ink">
                    {entry.item.headline ?? entry.item.name}
                  </span>
                  {entry.item.meta && (
                    <span className="mt-0.5 block truncate text-[11px] text-muted">
                      {entry.item.meta}
                    </span>
                  )}
                </span>

                <span className="mt-auto flex items-end justify-between gap-2 pt-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-brand">
                      {formatRupiah(entry.item.price)}
                    </span>
                    {entry.item.originalPrice && (
                      <span className="block text-[11px] text-muted line-through">
                        {formatRupiah(entry.item.originalPrice)}
                      </span>
                    )}
                  </span>
                  {/* Visual affordance only — the whole tile is the button. */}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-pill bg-brand text-white transition-colors group-hover:bg-brand-dark">
                    <PlusIcon />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
