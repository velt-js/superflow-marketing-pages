// /pricing — 2026 light redesign. Static page (no Sanity); tier copy +
// comparison-table content live in components/pricing/pricing-data.ts,
// the per-site monitoring price and wording in
// components/pricing-2026/site-agents-data.ts, and FAQ copy in
// components/pricing-2026/faq-data.ts.

import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import FaqSection from "@/components/home-2026/FaqSection";
import IntercomButton from "@/components/home/IntercomButton";
import ListingHero from "@/components/listing-2026/ListingHero";
import PricingTiers from "@/components/pricing-2026/PricingTiers";
import PricingComparisonTable from "@/components/pricing-2026/PricingComparisonTable";
import SiteAgentsSection from "@/components/pricing-2026/SiteAgentsSection";
import {
  SITE_AGENTS_AVAILABILITY,
  SITE_AGENTS_CAPABILITIES_SENTENCE,
  SITE_AGENTS_NAME,
  SITE_AGENTS_PRICE_LABEL,
  SITE_AGENTS_PRICE_USD,
} from "@/components/pricing-2026/site-agents-data";
import { PRICING_FAQ_ITEMS } from "@/components/pricing-2026/faq-data";
import { BillingProvider } from "@/components/pricing/BillingContext";
import { TIERS } from "@/components/pricing/pricing-data";
import { buildPageMetadata, stripEmDashes } from "@/app/_seo/page-metadata";
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

// The headline and its paragraph: the whole pricing model in plain words.
const HERO_HEADING = "Simple, predictable pricing";
const HERO_SUBHEADING =
  `Pay per team seat. Guests and clients review for free. Basic monitoring and version snapshots are free on every site — unlock full monitoring and version control for $${SITE_AGENTS_PRICE_USD}/site/month.`;

const PAGE_TITLE = "Pricing — Simple Seat & Site Pricing | Superflow";
const PAGE_DESCRIPTION = `Pay per team seat with unlimited free guests. Every site includes basic monitoring and version snapshots for free, or unlock full monitoring and version control for $${SITE_AGENTS_PRICE_USD}/site/month.`;

/**
 * Images for the two Product nodes below.
 *
 * `image` is REQUIRED on Product: without it Search Console reports the item
 * invalid and drops it from rich results entirely, which is what happened to
 * both of these between 2026-08-08 and 2026-09-17. Google also asks for more
 * than one aspect ratio, so this is the wide card and the square mark rather
 * than either alone.
 *
 * `/brand/logo.png` is the square one on purpose, not `/logo.png`: the brand
 * file carries an opaque background plate and literal hex fills, built for
 * renderers outside this site (see README.md). The other one is transparent
 * and disappears on a dark surface.
 *
 * Absolute URLs, because a consumer of this JSON-LD has no base to resolve a
 * relative path against.
 */
const PRODUCT_IMAGES = [
  `${SITE_URL}${PAGE_OG_IMAGES.pricing}`, // 1200x630
  `${SITE_URL}/brand/logo.png`, // 512x512
];

// Only tiers with published numeric prices qualify as Product offers.
// Enterprise remains visible in the pricing cards as a custom quote.
const PRICING_PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Superflow",
  description:
    "Superflow plans - Starter (free), Growth, Scale, and Enterprise. Pay per team seat; guests are free. Every site includes basic monitoring and version snapshots for free.",
  brand: { "@id": ORG_ID },
  image: PRODUCT_IMAGES,
  url: `${SITE_URL}/pricing`,
  offers: TIERS.filter((tier) => !tier.customPrice).map((tier) => {
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
    base.price = tier.annualPrice;
    base.priceSpecification = {
      "@type": "UnitPriceSpecification",
      price: tier.annualPrice,
      priceCurrency: "USD",
      unitText: "per seat per month, billed yearly",
    };
    return base;
  }),
};

// Separate Product schema for full monitoring and version control, the
// per-site price (in components/pricing-2026/site-agents-data.ts, also shown
// in the monitoring section, the comparison table and the pricing FAQ).
const SITE_AGENTS_PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: `Superflow ${SITE_AGENTS_NAME}`,
  description: `Full monitoring and version control for a site in Superflow, at ${SITE_AGENTS_PRICE_LABEL}. ${SITE_AGENTS_AVAILABILITY} Includes ${SITE_AGENTS_CAPABILITIES_SENTENCE}.`,
  brand: { "@id": ORG_ID },
  // The agents are sold on this page and have no artwork of their own, so
  // they carry the same pair rather than an invented image.
  image: PRODUCT_IMAGES,
  url: `${SITE_URL}/pricing`,
  offers: [
    {
      "@type": "Offer",
      name: SITE_AGENTS_NAME,
      url: `${SITE_URL}/pricing`,
      price: SITE_AGENTS_PRICE_USD,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: SITE_AGENTS_PRICE_USD,
        priceCurrency: "USD",
        unitText: "per site per month",
      },
    },
  ],
};

const PRICING_BREADCRUMB = buildBreadcrumbList([
  { name: "Home", url: SITE_URL },
  { name: "Pricing", url: `${SITE_URL}/pricing` },
]);

const PRICING_FAQ_SCHEMA = buildFaqPageSchema(PRICING_FAQ_ITEMS);

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
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
        name={stripEmDashes(PAGE_TITLE)}
        description={PAGE_DESCRIPTION}
        path="/pricing"
      />
      <JsonLd id="ld-pricing-product" data={PRICING_PRODUCT_SCHEMA} />
      <JsonLd id="ld-pricing-site-agents" data={SITE_AGENTS_PRODUCT_SCHEMA} />
      <JsonLd id="ld-pricing-faq" data={PRICING_FAQ_SCHEMA} />
      <JsonLd id="ld-pricing-breadcrumb" data={PRICING_BREADCRUMB} />

      <SiteNav />
      <ListingHero heading={HERO_HEADING} subheading={HERO_SUBHEADING} hideCta />

      <BillingProvider>
        <PricingTiers />
        <SiteAgentsSection />
        <PricingComparisonTable />
      </BillingProvider>

      <TestimonialsSection />
      <FaqSection items={PRICING_FAQ_ITEMS} />
      <SiteFooter />
      <IntercomButton />
    </main>
  );
}
