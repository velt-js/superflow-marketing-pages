// /pricing — Figma node 217:5662 in HqWIZdR6ISJmaG2n4o3gr8.
// Static page (no Sanity); composition mirrors the live velt.dev/pricing
// page. Tier copy + comparison-table content live in
// components/pricing/pricing-data.ts.

import Footer from "@/components/home/Footer";
import { TrustedLogos } from "@/components/home/TrustedLogos";
import { PageHero } from "@/components/library/PageHero";
import { LibraryFAQ } from "@/components/library/LibraryFAQ";
import { FeatureCustomerCarousel } from "@/components/feature/FeatureCustomerCarousel";
import { PricingTiers } from "@/components/pricing/PricingTiers";
import { PricingYCCallout } from "@/components/pricing/PricingYCCallout";
import { PricingComparisonTable } from "@/components/pricing/PricingComparisonTable";
import { pricingFAQ } from "@/components/pricing/pricing-faq";
import { TIERS } from "@/components/pricing/pricing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
  ORG_ID,
  SITE_URL,
  buildBreadcrumbList,
  buildFaqPageSchema,
} from "@/app/_seo/schema";

export const revalidate = 60;

// Plain-text FAQ answers for the JSON-LD payload. Source of truth for
// the rendered UI is components/pricing/pricing-faq.tsx, but three of
// those entries embed inline links via JSX (`paragraphs`) and a fourth
// uses literal "\n\n" line breaks. We mirror the prose verbatim here
// so the FAQPage schema submitted to Google is plain text.
const PRICING_FAQ_FOR_SCHEMA: Array<{ question: string; answer: string }> = [
  {
    question: "What is a MAD (Monthly Active Document)?",
    answer:
      "An active document is a unique document which has CRUD operations by any Velt Feature during the month. Note: This excludes documents which were merely initiated without performing CRUD operations on features like comments, notifications, CRDT, etc.",
  },
  {
    question:
      "What is the difference between MAR and MAD, and why does it matter for my bill?",
    answer:
      "MAR (Monthly Active Room): A room (document) counts as active when a user connects to it during the billing month. A room is also considered active when its content is updated: comments, realtime data storage, etc. MAD (Monthly Active Document): We use this. A more specific metric representing documents where users actively utilize Velt's collaboration features within your application during a month. MAD is a subset of MAR. Typically, about 20% of MARs perform meaningful collaboration actions on average. This varies by product category, with some higher or lower. Velt's MAD-based pricing ensures you're billed only for users who derive value from our collaboration features, offering a more cost-effective and transparent alternative to MAR-based models.",
  },
  {
    question: "Do we charge for just connecting to Velt?",
    answer:
      "No. Billing applies only to Velt SDK CRUD operation usage. You are not billed for users that just connect to Velt.",
  },
  {
    question: "How long does it take to integrate with Velt SDK?",
    answer:
      "On average, customers integrate with Velt SDK in under 30 minutes.",
  },
  {
    question: "Which frameworks do you support?",
    answer: "Velt SDK supports React, Angular, Vanilla JS, Vue, and NextJS.",
  },
  {
    question: "Do you offer any discounts for Startups?",
    answer:
      "Yes, we offer special deals for early-stage startups. Apply via our startup discount form.",
  },
  {
    question: "Do you offer any volume discounts?",
    answer:
      "Yes, we offer volume discounts. Contact us via /book-demo to discuss.",
  },
  {
    question: "How secure is Velt SDK?",
    answer:
      "Velt provides enterprise grade security. Our products are SOC 2 Type II and HIPAA Compliant. Learn more at https://trust.velt.dev/.",
  },
  {
    question: "How reliable and scalable is Velt SDK?",
    answer:
      "We provide a 99.999% uptime and highly scaleable infrastructure for our growth and enterprise plans.",
  },
];

// Product schema with one Offer per pricing tier. `Hacker` is free
// (price "0"), Growth and Enterprise are contract-based so we use
// `priceSpecification` with a free-text description rather than a
// numeric price (Google permits this for B2B tiers).
const PRICING_PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Velt Collaboration SDK",
  description:
    "Collaboration SDK plans for Velt — Hacker (free), Growth, and Enterprise. Pay only for meaningful collaboration usage.",
  brand: { "@id": ORG_ID },
  url: `${SITE_URL}/pricing`,
  offers: TIERS.map((tier) => {
    const offerUrl = tier.cta.href.startsWith("http")
      ? tier.cta.href
      : `${SITE_URL}${tier.cta.href}`;
    const isFree = tier.id === "hacker";
    const base: Record<string, unknown> = {
      "@type": "Offer",
      name: tier.name,
      description: tier.blurb,
      url: offerUrl,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    };
    if (isFree) {
      base.price = "0";
    } else {
      // Contract-based tier: omit the numeric `price` entirely (Google
      // accepts an Offer without a literal price when a
      // priceSpecification provides the human-readable detail).
      base.priceSpecification = {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        valueAddedTaxIncluded: false,
        description: "Contract-based — contact sales for a quote",
      };
    }
    return base;
  }),
};

const PRICING_BREADCRUMB = buildBreadcrumbList([
  { name: "Home", url: SITE_URL },
  { name: "Pricing", url: `${SITE_URL}/pricing` },
]);

const PRICING_FAQ_SCHEMA = buildFaqPageSchema(PRICING_FAQ_FOR_SCHEMA);

export const metadata = buildPageMetadata({
  title: "Velt Pricing: Collaboration SDK Plans",
  description:
    "Pay only for meaningful collaboration usage. Hacker (free), Growth, and Enterprise plans for Velt's collaboration SDK.",
  path: "/pricing",
  ogImage: "/og/pricing.png",
});

export default function PricingPage() {
  return (
    <>
      <JsonLd id="ld-pricing-product" data={PRICING_PRODUCT_SCHEMA} />
      <JsonLd id="ld-pricing-faq" data={PRICING_FAQ_SCHEMA} />
      <JsonLd id="ld-pricing-breadcrumb" data={PRICING_BREADCRUMB} />
      <div
        className="relative bg-black text-white font-urbanist w-full overflow-x-hidden"
      >
        <PageHero
          decorated
          heading="Choose your plan"
          subheading="Pay only for meaningful collaboration usage."
          primaryCta={{
            label: "Get Free API Key",
            href: "https://console.velt.dev/",
            newTab: true,
          }}
          secondaryCta={{ label: "Book Demo", href: "/book-demo" }}
        />

        <PricingTiers />

        <PricingYCCallout />

        <TrustedLogos />

        <PricingComparisonTable />

        <FeatureCustomerCarousel />

        <LibraryFAQ items={pricingFAQ} />

        <Footer />
      </div>
    </>
  );
}
