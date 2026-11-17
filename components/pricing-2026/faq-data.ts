// /pricing FAQ content: short plain-text answers in literal product
// language (no internal plan codenames), with the per-site price read from
// ./site-agents-data.ts. Like the comparison table, the answers name only
// what the product has today; see components/pricing/pricing-data.ts.
// Version history is included on every plan, free sites too (the window is
// set by plan: the table's "Version history" row), so it is never sold as
// part of the paid per-site upgrade.
// Kept in a server-safe module (no "use client") so the page can build the
// FAQPage JSON-LD from the same array the client <FaqSection> renders: one
// source of truth for both.

import type { FaqItem } from "@/components/home-2026/faq-data";
import { TIERS } from "@/components/pricing/pricing-data";
import { CARE_SITES_INCLUDED, SITE_AGENTS_PRICE_USD } from "./site-agents-data";

/** "Growth is $24 ($29 monthly) and Scale is $32 ($39 monthly)". */
const YEARLY_PRICES = TIERS.filter((tier) => !tier.customPrice && tier.monthlyPrice !== "0")
  .map((tier) => `${tier.name} is $${tier.annualPrice} ($${tier.monthlyPrice} monthly)`)
  .join(" and ");

export const PRICING_FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is counted as a seat?",
    answer:
      "Only internal team members you invite to manage projects count as paid Team seats. Clients and external reviewers join as Guests for free.",
  },
  {
    question: "How does site monitoring and version control pricing work?",
    answer:
      `Every site includes basic monitoring and version history for free on all accounts. You can upgrade individual sites to full monitoring and version control for $${SITE_AGENTS_PRICE_USD} per site per month (custom pricing on Enterprise).`,
  },
  {
    question: "What is included in full monitoring and version control?",
    answer:
      `While free basic monitoring gives every site baseline tracking and version history, full monitoring and version control ($${SITE_AGENTS_PRICE_USD}/site/month) monitors changes continuously as they ship, lets you compare versions side by side, and runs automated QA checks.`,
  },
  {
    question: "How many sites with full monitoring are included?",
    answer:
      `Growth includes ${CARE_SITES_INCLUDED.growth} and Scale includes ${CARE_SITES_INCLUDED.scale}. Each extra site is $${SITE_AGENTS_PRICE_USD} a month.`,
  },
  {
    question: "Can I switch a site between basic and full monitoring?",
    answer: "Yes. Upgrading a site is instant. Moving a site back to basic monitoring takes effect at the end of your billing cycle.",
  },
  {
    question: "Are there usage limits?",
    answer: "No. Monitoring covers up to 250 pages per site on Growth and up to 500 on Scale, raised on request.",
  },
  {
    question: "What counts as a site?",
    answer: "One domain with its www, staging and preview addresses. PDFs, videos and images are not sites.",
  },
  {
    question: "Is yearly billing cheaper?",
    answer: `Yes, two months free. Per seat per month, ${YEARLY_PRICES}.`,
  },
  {
    question: "How secure is Superflow?",
    answer: "SOC 2 Type II, audited every year, with data encrypted in transit and at rest.",
  },
];
