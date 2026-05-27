// /pricing — composition mirrors the live usesuperflow.com/pricing page.
// Static page (no Sanity); tier copy + comparison-table content live in
// components/pricing/pricing-data.ts.

import Footer from "@/components/home/Footer";
import LogoBar from "@/components/home/LogoBar";
import CustomerLoveCarousel from "@/components/home/CustomerLoveCarousel";
import DarkSection from "@/components/home/DarkSection";
import { PageHero } from "@/components/library/PageHero";
import { PricingTiers } from "@/components/pricing/PricingTiers";
import { PricingComparisonTable } from "@/components/pricing/PricingComparisonTable";
import { BillingProvider } from "@/components/pricing/BillingContext";
import { pricingFAQ } from "@/components/pricing/pricing-faq";
import { TIERS, APP_URL } from "@/components/pricing/pricing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { JsonLd } from "@/app/_seo/JsonLd";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import {
  ORG_ID,
  SITE_URL,
  buildBreadcrumbList,
  buildFaqPageSchema,
} from "@/app/_seo/schema";

export const revalidate = 60;

// Plain-text FAQ answers for the JSON-LD payload. Source of truth for
// the rendered UI is components/pricing/pricing-faq.tsx, but two of
// those entries embed inline links via JSX (`paragraphs`). We mirror
// the prose verbatim here so the FAQPage schema submitted to Google is
// plain text.
const PRICING_FAQ_FOR_SCHEMA: Array<{ question: string; answer: string }> = [
  {
    question: "What is Superflow?",
    answer:
      "Superflow is a collaboration platform for agencies & marketers to review, proof and deliver creative assets fast. Superflow supports websites, videos, lottie animations, PDF and images. With Superflow agencies & marketers deliver more high quality creative assets fast.",
  },
  {
    question: "What formats are supported in Superflow?",
    answer:
      "Superflow supports all types of Websites, Videos, Lottie, Images and PDFs.",
  },
  {
    question: "What is counted as a seat?",
    answer:
      "Your team member (also called Admin user) that you invite to Superflow will be counted as a seat. Commenter User & Guest users are free.",
  },
  {
    question:
      "What is the difference between Admin, Commenter & Guest users?",
    answer:
      "Admin or team user: Your team members should be added as an admin user. They have full access to the admin panel and get access to all features in your account. Commenter user: Commenter Users can read or write comments but they need to authenticate or sign in to Superflow. You should add external users or your clients as commenters. This is available for all plans. These are free and not counted towards your seats. Guest user: Guest users can read or write comments without authenticating or signing in. You should add external users or your clients as guest users. This is only available on Scale and Enterprise plans. These are free and not counted towards your seats.",
  },
  {
    question: "Does Superflow offer a free plan?",
    answer:
      "Superflow offers a free 10-day trial to new users, no credit card needed. During the trial period, you get full access to all features. We also offer a free forever Starter plan that becomes available after your trial has ended.",
  },
  {
    question: "Do you offer any volume discounts?",
    answer: "Yes, we offer volume discounts. Contact us to get started.",
  },
  {
    question: "Do you offer any discounts for startups or education?",
    answer:
      "Yes, we offer discounts for early-stage startups. Contact us to get started.",
  },
  {
    question: "How secure is Superflow?",
    answer:
      "Superflow supports Isolated dedicated storage and encrypts data in transit and at rest using industry standards. We are currently going through SOC2 certification.",
  },
  {
    question: "How reliable and scalable is Superflow?",
    answer:
      "We guarantee at least 99.9% uptime and provide highly scalable infrastructure.",
  },
];

// Product schema with one Offer per pricing tier. Starter is free (price
// "0"), Growth/Scale carry the annual-per-month price, Enterprise is
// custom — we use `priceSpecification` with a free-text description for
// the latter (Google permits this for B2B tiers).
const PRICING_PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Superflow",
  description:
    "Superflow plans — Starter (free), Growth, Scale, and Enterprise. A collaboration platform for agencies and marketers to review, proof, and deliver creative assets fast.",
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
        description: "Custom — contact sales for a quote",
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

const PRICING_BREADCRUMB = buildBreadcrumbList([
  { name: "Home", url: SITE_URL },
  { name: "Pricing", url: `${SITE_URL}/pricing` },
]);

const PRICING_FAQ_SCHEMA = buildFaqPageSchema(PRICING_FAQ_FOR_SCHEMA);

export const metadata = buildPageMetadata({
  title: "Pricing — Ship Creative Assets Impossibly Fast",
  description:
    "Transparent per-seat pricing with a free trial. Starter (free), Growth, Scale, and Enterprise plans for agencies and marketers using Superflow.",
  path: "/pricing",
  // Live usesuperflow.com/pricing reuses the homepage OG image — set
  // explicitly here so the override is visible at the call-site, even
  // though it matches DEFAULT_OG_IMAGE.
  ogImage: "/opengraph-image.png",
  noBrandSuffix: true,
});

export default function PricingPage() {
  return (
    <>
      {/* Breadcrumb emitted by the hand-rolled PRICING_BREADCRUMB block
          below, so PageJsonLd is called without a trail to avoid a
          duplicate BreadcrumbList. */}
      <PageJsonLd
        name="Pricing — Ship Creative Assets Impossibly Fast"
        description="Transparent per-seat pricing with a free trial. Starter (free), Growth, Scale, and Enterprise plans for agencies and marketers using Superflow."
        path="/pricing"
      />
      <JsonLd id="ld-pricing-product" data={PRICING_PRODUCT_SCHEMA} />
      <JsonLd id="ld-pricing-faq" data={PRICING_FAQ_SCHEMA} />
      <JsonLd id="ld-pricing-breadcrumb" data={PRICING_BREADCRUMB} />
      <div
        className="relative bg-black text-white font-urbanist w-full overflow-x-hidden"
      >
        <PageHero
          decorated
          heading="Ship Creative Assets Impossibly Fast"
          primaryCta={{
            label: "Start Free Trial",
            href: APP_URL,
            newTab: true,
          }}
          secondaryCta={{ label: "Book Demo", href: "/book-demo" }}
        />

        <BillingProvider>
          <PricingTiers />

          <LogoBar />

          <PricingComparisonTable />
        </BillingProvider>

        <CustomerLoveCarousel />

        <DarkSection faqItems={pricingFAQ} />

        <Footer />
      </div>
    </>
  );
}
