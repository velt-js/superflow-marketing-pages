// /pricing FAQ content: plain-text entries from the pricing v8 spec
// (section 5, "FAQ"), with the per-site Care price read from
// ./site-agents-data.ts. Like the comparison table, the answers name only
// what the product has today (no Linear or Jira, no live client request tab,
// no form testing, no dedicated scanner IPs); see
// components/pricing/pricing-data.ts.
// Kept in a server-safe module (no "use client") so the page can build the
// FAQPage JSON-LD from the same array the client <FaqSection> renders: one
// source of truth for both.

import type { FaqItem } from "@/components/home-2026/faq-data";
import { TIERS } from "@/components/pricing/pricing-data";
import {
  CARE_SITES_INCLUDED,
  SITE_AGENTS_PRICE_LABEL,
  SITE_AGENTS_PRICE_USD,
} from "./site-agents-data";

export const PRICING_FAQ_ITEMS: FaqItem[] = [
  {
    question: "Who is a seat, and who is a guest?",
    answer:
      "A seat runs the work: creates projects, manages sites, triages findings, sends reports. A guest reviews, comments and approves on a shared link. Guests are always free. Developers who only work issues inside Asana, ClickUp or Monday don't need seats on any paid plan. Your clients and their one-off approvers are free guests.",
  },
  {
    question: "What does Watch show me for free?",
    answer:
      `Your first site scan in a new workspace (up to 100 pages) unlocks every finding so you can see the full engine. After that, Watch gives you 5-minute uptime, a live Site Score, your top 2 issues in full, and the version history for your plan's window. When a page changes and breaks something, Watch tells you. Care (${SITE_AGENTS_PRICE_LABEL}) unlocks every issue, side-by-side diffs and the monthly client report.`,
  },
  {
    question: "What does Care add?",
    answer:
      "Every finding, pinned on the page. Side-by-side diffs for every version in your plan's history window. Weekly full-site checks and a rescan on deploy, plus a rescan that confirms each fix before it counts. The monthly client report with your branding and the Machine Work Ledger. Scale adds white-label reports with no Superflow footer and 1 custom QA rule per Care site. No usage limits.",
  },
  {
    question: "How many Care sites are included?",
    answer:
      `Growth includes ${CARE_SITES_INCLUDED.growth} Care site and Scale includes ${CARE_SITES_INCLUDED.scale}. Every Care site after that is $${SITE_AGENTS_PRICE_USD} a month. Enterprise sites are priced on the contract. Starter has no Care sites.`,
  },
  {
    question: "Can I run QA on a site before it launches?",
    answer:
      "Yes. Add the staging URL as a site and put it on Care. Set the staging password if there is one (every paid plan has one per site). Rescan on every deploy. When the site goes live, tell us the live domain and it stays the same site. Drop it back to Watch when the project ends.",
  },
  {
    question: "Are there usage limits?",
    answer:
      "No. A Care site can change as often as it changes. Growth covers sites up to 250 pages and Scale up to 500. Over 500 on Scale, request a raise in the app and we'll unlock it within a day.",
  },
  {
    question: "What is a prospect audit?",
    answer:
      "A one-time snapshot of a prospect's site before a pitch. One per domain, for domains not already in your workspace. You get a dated PDF with the Site Score and the issues caught. Branded audits are free and unlimited on Growth and Scale. On Scale, 10 white-label audits a month are free, with your logo and no Superflow footer, then $5 each. When you win the client, one click turns it into a Care site.",
  },
  {
    question: "What counts as a site?",
    answer:
      "One domain family: the root domain, www, and its staging or preview subdomains. A site can start as a staging URL and pick up the live domain later. Review projects for PDFs, video, images and design files are not sites.",
  },
  {
    question: "Can I move sites between Watch and Care?",
    answer:
      "Yes. Watch to Care is instant. Care to Watch takes effect at the end of your billing cycle.",
  },
  {
    question: "How does this work for a large brand?",
    answer:
      "Your web and brand managers take seats. External agencies and one-off stakeholders join as free guests. Enterprise adds automated QA behind logins, private staging and VPNs, unlimited custom QA rules, 365-day immutable history, SSO and SCIM. Talk to sales.",
  },
  {
    question: "Is yearly billing cheaper?",
    answer:
      `Yes. Yearly billing is two months free: ${TIERS.filter((tier) => !tier.customPrice && tier.monthlyPrice !== "0")
        .map((tier) => `${tier.name} is $${tier.annualPrice} per seat per month billed yearly ($${tier.monthlyPrice} monthly)`)
        .join(" and ")}.`,
  },
  {
    question: "How secure is Superflow?",
    answer:
      "Superflow is SOC 2 Type II compliant and is audited by an independent firm every year. It supports isolated dedicated storage and encrypts data in transit and at rest using industry standards.",
  },
  {
    question: "How reliable and scalable is Superflow?",
    answer:
      "We guarantee at least 99.9% uptime and provide highly scalable infrastructure.",
  },
];
