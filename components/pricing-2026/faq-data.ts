// /pricing FAQ content — plain-text entries, verbatim from
// usesuperflow.com/pricing, except the AI credits answers, which follow
// the AI Credits rate card (v4, scan-based) in ./ai-credits-data.ts.
// Kept in a server-safe module (no "use client") so the page can build the
// FAQPage JSON-LD from the same array the client <FaqSection> renders —
// one source of truth for both.

import type { FaqItem } from "@/components/home-2026/faq-data";

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
    question: "What are AI credits?",
    answer:
      "AI credits pay for Superflow's AI agent scans. One credit is $0.40, and you buy a scan, not a token: one scan checks your whole site with every agent. Scans are priced by scope, so there is no per-agent multiplier and no per-page arithmetic, and you always see the credit cost before you start a run.",
  },
  {
    question: "How much does a scan cost?",
    answer:
      "A single page or asset is 1 credit. A small site (up to 30 pages) is 5 credits, a medium site (31 to 100 pages) is 10, a large site (100 to 250 pages) is 15, and an XL site (250+ pages) is 30. Every agent runs on every scan at that price. Most sites are 10 credits or less, which is $4 at list price.",
  },
  {
    question: "What does a rescan cost?",
    answer:
      "A rescan is 1 credit at any site size, because only the pages that changed get reviewed. Projects go through four to six review rounds before sign-off, so a typical project is one medium-site scan plus four rescans: 14 credits, or about $5.60 against a three to four hour manual QA pass. If more than half the site changed, the run is billed as a fresh scan.",
  },
  {
    question: "How many AI credits are included in my plan?",
    answer:
      "Starter includes 5 credits per month (one small-site scan), Growth includes 30 (two full projects with rescans, or one project plus ongoing monitoring), Scale includes 60 (four projects, or portfolio monitoring), and Enterprise plans include a custom amount. Included credits reset with each billing cycle. Every new workspace also gets a one-time signup bonus of 30 credits, so your first full scan is free at any site size.",
  },
  {
    question: "What happens when I run out of AI credits?",
    answer:
      "You can top up with a one-time add-on pack at any time: $10 buys 25 credits, $25 buys 70 credits, and $49 buys 145 credits. Bigger packs cost less per credit, pack credits roll over month to month until you use them, and auto-refill can top you up $10 at a time so a run never stalls. You can switch auto-refill off.",
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
