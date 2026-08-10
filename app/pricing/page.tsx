// /pricing — 2026 light redesign. Static page (no Sanity); tier copy +
// comparison-table content live in components/pricing/pricing-data.ts and
// FAQ copy in components/pricing-2026/faq-data.ts.

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import FaqSection from "@/components/home-2026/FaqSection";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "@/components/listing-2026/ListingHero";
import PricingTiers from "@/components/pricing-2026/PricingTiers";
import PricingComparisonTable from "@/components/pricing-2026/PricingComparisonTable";
import { CREDIT_PACKS } from "@/components/pricing-2026/ai-credits-data";
import { PRICING_FAQ_ITEMS } from "@/components/pricing-2026/faq-data";
import { BillingProvider } from "@/components/pricing/BillingContext";
import { TIERS } from "@/components/pricing/pricing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PAGE_OG_IMAGES } from "@/app/_seo/og-images";
import { JsonLd } from "@/app/_seo/JsonLd";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import {
  ORG_ID,
  SITE_URL,
  buildBreadcrumbList,
  buildFaqPageSchema,
} from "@/app/_seo/schema";

export const revalidate = 60;

const HERO_HEADING = "Ship Creative Assets Impossibly Fast";
const HERO_SUBHEADING =
  "Transparent per-seat pricing with a free 10-day trial. Start free and upgrade whenever your team is ready.";

// Product schema with one Offer per pricing tier. Starter is free (price
// "0"), Growth/Scale carry the annual-per-month price, Enterprise is
// custom — we use `priceSpecification` with a free-text description for
// the latter (Google permits this for B2B tiers).
const PRICING_PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Superflow",
  description:
    "Superflow plans - Starter (free), Growth, Scale, and Enterprise. A collaboration platform for agencies and marketers to review, proof, and deliver creative assets fast.",
  brand: { "@id": ORG_ID },
  url: `${SITE_URL}/pricing`,
  offers: TIERS.map((tier) => {
    const offerUrl = tier.cta.href.startsWith("http")
      ? tier.cta.href
      : `${SITE_URL}${tier.cta.href}`;
    const base: Record<string, unknown> = {
      "@type": "Offer",
      name: tier.name,
      url: offerUrl,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    };
    if (tier.customPrice) {
      base.priceSpecification = {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        valueAddedTaxIncluded: false,
        description: "Custom - contact sales for a quote",
      };
    } else {
      base.price = tier.annualPrice;
      base.priceSpecification = {
        "@type": "UnitPriceSpecification",
        price: tier.annualPrice,
        priceCurrency: "USD",
        unitText: "per seat per month, billed yearly",
      };
    }
    return base;
  }),
};

// Separate Product schema for the one-time AI credit packs (from the AI
// Credits rate card; pack details also surface in the pricing FAQ).
const AI_CREDITS_PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Superflow AI Credits",
  description:
    "AI credits for Superflow agent reviews. Every agent review costs a flat 10 credits. One-time add-on packs top up any plan, and pack credits roll over month to month.",
  brand: { "@id": ORG_ID },
  url: `${SITE_URL}/pricing`,
  offers: CREDIT_PACKS.map((pack) => ({
    "@type": "Offer",
    name: `${pack.name} pack: ${pack.credits.toLocaleString("en-US")} AI credits`,
    url: `${SITE_URL}/pricing`,
    price: pack.priceUsd,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  })),
};

const PRICING_BREADCRUMB = buildBreadcrumbList([
  { name: "Home", url: SITE_URL },
  { name: "Pricing", url: `${SITE_URL}/pricing` },
]);

const PRICING_FAQ_SCHEMA = buildFaqPageSchema(PRICING_FAQ_ITEMS);

export const metadata = buildPageMetadata({
  title: "Pricing - Ship Creative Assets Impossibly Fast",
  description:
    "Per-seat pricing with a free trial, plus flat-rate AI credits: every agent review is a flat 10 credits. Starter, Growth, Scale & Enterprise plans.",
  path: "/pricing",
  ogImage: PAGE_OG_IMAGES.pricing,
  noBrandSuffix: true,
});

export default function PricingPage() {
  return (
    <main>
      {/* Breadcrumb emitted by the hand-rolled PRICING_BREADCRUMB block
          below, so PageJsonLd is called without a trail to avoid a
          duplicate BreadcrumbList. */}
      <PageJsonLd
        name="Pricing - Ship Creative Assets Impossibly Fast"
        description="Per-seat pricing with a free trial, plus flat-rate AI credits: every agent review is a flat 10 credits. Starter, Growth, Scale & Enterprise plans."
        path="/pricing"
      />
      <JsonLd id="ld-pricing-product" data={PRICING_PRODUCT_SCHEMA} />
      <JsonLd id="ld-pricing-ai-credits" data={AI_CREDITS_PRODUCT_SCHEMA} />
      <JsonLd id="ld-pricing-faq" data={PRICING_FAQ_SCHEMA} />
      <JsonLd id="ld-pricing-breadcrumb" data={PRICING_BREADCRUMB} />

      <SiteNav />
      <ListingHero heading={HERO_HEADING} subheading={HERO_SUBHEADING} hideCta />

      <BillingProvider>
        <PricingTiers />
        <PricingComparisonTable />
      </BillingProvider>

      <TestimonialsSection />
      <FaqSection items={PRICING_FAQ_ITEMS} />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
