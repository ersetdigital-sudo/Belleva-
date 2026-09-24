import type { Metadata } from "next";

import { CtaBanner } from "@/components/home/CtaBanner";
import { CatalogueProvider } from "@/components/home/catalogue-context";
import { Faq } from "@/components/home/Faq";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { MobileHome } from "@/components/home/mobile/mobile-home";
import { ProductSection } from "@/components/home/ProductSection";
import { ProductTabProvider } from "@/components/home/product-tab-context";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Steps } from "@/components/home/Steps";
import { Testimonials } from "@/components/home/Testimonials";
import { StructuredData } from "@/components/seo/StructuredData";
import { getCatalogue } from "@/lib/products";
import { homeMetadata } from "@/lib/seo";

export const metadata: Metadata = homeMetadata;

/** Prices are editable in /admin/produk, so the page is cached and refreshed. */
export const revalidate = 60;

export default async function HomePage() {
  const catalogue = await getCatalogue();

  return (
    <>
      <StructuredData />
      <CatalogueProvider groups={catalogue}>
        <ProductTabProvider>
          {/*
            Phones get the app-style home; the landing hero and promo banner stay
            desktop-only so exactly one composition is laid out at any width.
          */}
          <MobileHome />
          <div className="hidden lg:block">
            <Hero />
            <PromoBanner />
          </div>
          <ProductSection />
        </ProductTabProvider>
      </CatalogueProvider>
      <Features />
      <Steps />
      <Testimonials />
      <Faq />
      <CtaBanner />
    </>
  );
}
