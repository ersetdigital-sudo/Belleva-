"use client";

import { SearchIcon } from "@/components/icons";

interface MobileSearchHeroProps {
  query: string;
  onQueryChange: (value: string) => void;
}

/**
 * Greeting + search block that opens the mobile app home. The search field is
 * live — it filters the recommendation grid below rather than being decoration.
 */
export function MobileSearchHero({ query, onQueryChange }: MobileSearchHeroProps) {
  return (
    <section className="px-5 pt-3">
      <p className="text-xs font-semibold text-muted">Halo,</p>
      <h2 className="h-display mt-0.5 text-2xl font-extrabold text-ink">
        Mau isi pulsa atau bayar tagihan?
      </h2>

      <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-line bg-white px-4 transition-colors focus-within:border-brand">
        <SearchIcon className="shrink-0 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Cari pulsa, paket data, token listrik…"
          aria-label="Cari produk"
          className="w-full min-w-0 bg-transparent py-3.5 text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
        />
      </div>
    </section>
  );
}
