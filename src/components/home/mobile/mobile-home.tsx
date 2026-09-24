"use client";

import { useState } from "react";

import { MobileAppBar } from "./mobile-app-bar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileCategoryStrip } from "./mobile-category-strip";
import { MobilePromoCarousel } from "./mobile-promo-carousel";
import { MobilePromoCode } from "./mobile-promo-code";
import { MobileRecommendations } from "./mobile-recommendations";
import { MobileSearchHero } from "./mobile-search-hero";

/**
 * The app-style home for phones, following the mobile app-home wireframe:
 * coloured app bar → greeting + search → promo rail → service rail → promo row
 * → two-column recommendations → fixed bottom tab bar.
 *
 * Desktop keeps the landing-page composition untouched; this block is
 * `lg:hidden` and the landing hero/promo are `hidden lg:block`, so exactly one
 * of the two trees is laid out at any width.
 */
export function MobileHome() {
  const [query, setQuery] = useState("");

  return (
    <div className="lg:hidden">
      <MobileAppBar />
      <MobileSearchHero query={query} onQueryChange={setQuery} />
      <MobilePromoCarousel />
      <MobileCategoryStrip />
      <MobilePromoCode />
      <MobileRecommendations query={query} />
      <MobileBottomNav />
    </div>
  );
}
