import type { ProductItem } from "@/types";

import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";

interface ProductItemCardProps {
  item: ProductItem;
  /** Compact nominal grid (pulsa, e-money), rich kuota tile, or money tile. */
  style: "row" | "tile" | "money";
  onBuy: () => void;
}

function DiscountLabel({ item }: { item: ProductItem }) {
  if (!item.originalPrice || item.originalPrice <= item.price) return null;
  const percent = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  return (
    <span className="rounded-pill bg-danger-soft px-2 py-0.5 text-[10px] leading-none font-bold text-danger">
      -{percent}%
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-pill bg-warn px-2 py-0.5 text-[10px] leading-none font-bold text-white">
      {children}
    </span>
  );
}

/** Outline "Beli" pill: fills with brand colour when the tile is hovered. */
const CTA =
  "mt-3 grid min-h-10 w-full place-items-center rounded-pill border border-line text-sm font-bold text-brand transition group-hover:border-brand group-hover:bg-brand group-hover:text-white";

/**
 * Marketplace catalogue tile. The whole tile is the button, so the tap target
 * spans the card on mobile — the "Beli" pill is a visual affordance, not a
 * nested interactive element (which is why every child is a <span>).
 */
export function ProductItemCard({ item, style, onBuy }: ProductItemCardProps) {
  const surface = cn(
    "card group flex h-full w-full flex-col p-4 text-left",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  );

  if (style === "row") {
    return (
      <li className="h-full">
        <button
          type="button"
          onClick={onBuy}
          className={cn(
            surface,
            "justify-between gap-2 transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-hover",
          )}
        >
          <span className="text-xs font-semibold text-muted transition-colors group-hover:text-brand">
            {item.name}
          </span>
          <span className="h-display text-lg font-extrabold text-ink">
            {formatRupiah(item.price)}
          </span>
        </button>
      </li>
    );
  }

  if (style === "money") {
    return (
      <li className="h-full">
        <button
          type="button"
          onClick={onBuy}
          className={cn(surface, "feat relative overflow-hidden")}
        >
          {item.badge && (
            <span className="absolute top-0 right-0 rounded-bl-2xl bg-warn px-3 py-1 text-[10px] leading-none font-bold text-white">
              {item.badge}
            </span>
          )}

          <span className="text-xs font-semibold text-muted">{item.name}</span>
          <span className="h-display mt-1 text-2xl font-extrabold text-ink">{item.headline}</span>
          {item.meta && <span className="mt-1 text-xs text-muted">{item.meta}</span>}

          <span className="mt-auto block pt-4">
            <span className="flex items-baseline justify-between gap-2 border-t border-line-2 pt-3">
              <span className="text-[11px] text-muted">Harga</span>
              <span className="text-base font-extrabold whitespace-nowrap text-brand">
                {formatRupiah(item.price)}
              </span>
            </span>
            {item.originalPrice && (
              <span className="mt-1 flex items-center justify-between gap-2">
                <span className="text-xs text-muted line-through">
                  {formatRupiah(item.originalPrice)}
                </span>
                <DiscountLabel item={item} />
              </span>
            )}
            <span className={CTA}>Beli</span>
          </span>
        </button>
      </li>
    );
  }

  return (
    <li className="h-full">
      <button type="button" onClick={onBuy} className={cn(surface, "feat")}>
        <span className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs font-semibold text-muted">{item.name}</span>
          {item.badge && <Badge>{item.badge}</Badge>}
        </span>

        <span className="h-display mt-1.5 text-2xl font-extrabold text-ink">{item.headline}</span>
        {item.meta && <span className="mt-1 text-xs text-muted">{item.meta}</span>}

        <span className="mt-auto block pt-3">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-extrabold whitespace-nowrap text-brand">
              {formatRupiah(item.price)}
            </span>
            {item.originalPrice && (
              <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-[11px] text-muted line-through">
                  {formatRupiah(item.originalPrice)}
                </span>
                <DiscountLabel item={item} />
              </span>
            )}
          </span>
          <span className={CTA}>Beli</span>
        </span>
      </button>
    </li>
  );
}
