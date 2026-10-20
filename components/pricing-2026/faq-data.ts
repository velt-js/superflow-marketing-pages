// /pricing FAQ content — plain-text entries, verbatim from
// usesuperflow.com/pricing, except the QA agents answers, which read the
// per-site price from ./site-agents-data.ts, and the security answer, which
// follows the completed SOC 2 Type II audits rather than the old
// "going through certification" line.
// Kept in a server-safe module (no "use client") so the page can build the
// FAQPage JSON-LD from the same array the client <FaqSection> renders —
// one source of truth for both.

import type { FaqItem } from "@/components/home-2026/faq-data";
import {
  SITE_AGENTS_AVAILABILITY,
  SITE_AGENTS_CAPABILITIES_SENTENCE,
  SITE_AGENTS_PRICE_LABEL,
} from "./site-agents-data";

export const PRICING_FAQ_ITEMS: FaqItem[] = [
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
      "Your team member (also called Team user) that you invite to Superflow will be counted as a seat. Guest users are free.",
  },
  {
    question: "What is the difference between Team & Guest users?",
    answer:
      "Team user: Your team members should be added as team users. They have full access to the admin panel and get access to all features in your account, and they are the seats you pay for. Guest user: Your clients and external reviewers should be added as guest users. They can read or write comments, they are free, and they are not counted towards your seats. Guests who sign in are available on all plans; guests who comment without signing in are available on Scale and Enterprise plans.",
  },
  {
    question: "How are QA agents priced?",
    answer: `QA agents and always-on monitoring are ${SITE_AGENTS_PRICE_LABEL}. Each site you add gets ${SITE_AGENTS_CAPABILITIES_SENTENCE}, at one flat price. ${SITE_AGENTS_AVAILABILITY} It is not available on the free Starter plan.`,
  },
  {
    question: "What do the QA agents and monitoring do?",
    answer:
      "Every change to the site is captured as a new version, with no set up needed. Monitoring stays on and detects changes as they ship. You can compare versions side by side to see exactly what changed, and QA agents check each change and flag any issue they find, so review starts from a list of findings rather than a blank page.",
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
      "Superflow is SOC 2 Type II compliant and is audited by an independent firm every year. It supports isolated dedicated storage and encrypts data in transit and at rest using industry standards.",
  },
  {
    question: "How reliable and scalable is Superflow?",
    answer:
      "We guarantee at least 99.9% uptime and provide highly scalable infrastructure.",
  },
];
