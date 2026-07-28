// /pricing FAQ content — plain-text entries, verbatim from
// usesuperflow.com/pricing. Kept in a server-safe module (no "use client")
// so the page can build the FAQPage JSON-LD from the same array the client
// <FaqSection> renders — one source of truth for both.

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
      "Your team member (also called Admin user) that you invite to Superflow will be counted as a seat. Commenter User & Guest users are free.",
  },
  {
    question: "What is the difference between Admin, Commenter & Guest users?",
    answer:
      "Admin or team user: Your team members should be added as an admin user. They have full access to the admin panel and get access to all features in your account. Commenter user: Commenter Users can read or write comments but they need to authenticate or sign in to Superflow. You should add external users or your clients as commenters. This is available for all plans. These are free and not counted towards your seats. Guest user: Guest users can read or write comments without authenticating or signing in. You should add external users or your clients as guest users. This is only available on Scale and Enterprise plans. These are free and not counted towards your seats.",
  },
  {
    question: "What are AI credits?",
    answer:
      "AI credits pay for Superflow's AI agent reviews. Every agent review — one agent reviewing one page — costs a flat 10 credits ($0.40, since 1 credit = $0.04). Running three agents on a page is three reviews, or 30 credits. There are no tiers and no token math, and you always see the estimated credit cost before you start a run.",
  },
  {
    question: "How many AI credits are included in my plan?",
    answer:
      "Starter includes 60 credits per month, Growth includes 300, Scale includes 600, and Enterprise plans include a custom amount. Included credits reset with each billing cycle and don't roll over. Every new workspace also gets a one-time signup bonus of 500 credits.",
  },
  {
    question: "What happens when I run out of AI credits?",
    answer:
      "You can top up with a one-time add-on pack at any time: $20 buys 500 credits (50 more agent reviews), $90 buys 2,500 credits, and $340 buys 10,000 credits — larger packs cost less per credit. Pack credits roll over month to month until you use them.",
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
