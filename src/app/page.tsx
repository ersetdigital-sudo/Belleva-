import type { Metadata } from "next";

import { CtaBanner } from "@/components/home/CtaBanner";
import { Faq } from "@/components/home/Faq";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { ProductSection } from "@/components/home/ProductSection";
import { ProductTabProvider } from "@/components/home/product-tab-context";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Steps } from "@/components/home/Steps";
import { Testimonials } from "@/components/home/Testimonials";
import { StructuredData } from "@/components/seo/StructuredData";
import { homeMetadata } from "@/lib/seo";

export const metadata: Metadata = homeMetadata;

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <ProductTabProvider>
        <Hero />
        <PromoBanner />
        <ProductSection />
      </ProductTabProvider>
      <Features />
      <Steps />
      <Testimonials />
      <Faq />
      <CtaBanner />
    </>
  );
}
