// /pricing FAQ entries — copied verbatim from velt.dev/pricing's Framer
// JS bundle (BMzeplFm…CY9NNqmn.mjs). Order, question text, and answer
// copy match the live site exactly. Three entries carry inline links
// (Apply here, Contact us, Learn More) — those use the `paragraphs`
// field on FaqEntry so the link can render as an <a> instead of plain
// text.

import { Fragment } from "react";
import Link from "next/link";

import type { FaqEntry } from "@/components/library/LibraryFAQ";

const linkStyle: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.7)",
  textDecoration: "underline",
};

export const pricingFAQ: FaqEntry[] = [
  {
    question: "What is a MAD (Monthly Active Document)?",
    answer:
      "An active document is a unique document which has CRUD operations by any Velt Feature during the month.\n\nNote: This excludes documents which were merely initiated without performing CRUD operations on features like comments, notifications, CRDT, etc.",
  },
  {
    question:
      "What is the difference between MAR and MAD, and why does it matter for my bill?",
    answer:
      "MAR (Monthly Active Room): A room (document) counts as active when a user connects to it during the billing month. A room is also considered active when its content is updated: comments, realtime data storage, etc.\n\nMAD (Monthly Active Document): We use this. A more specific metric representing documents where users actively utilize Velt's collaboration features within your application during a month.\n\nMAD is a subset of MAR. Typically, about 20% of MARs perform meaningful collaboration actions on average. This varies by product category, with some higher or lower.\n\nVelt's MAD-based pricing ensures you're billed only for users who derive value from our collaboration features, offering a more cost-effective and transparent alternative to MAR-based models.",
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
    paragraphs: [
      <Fragment key="startup">
        Yes, we offer special deals for early-stage startups.{" "}
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSe3IubfjaQC3nIUqV9lq1XB6MbuW97XD3ryairNzvnML7v5Ag/viewform"
          target="_blank"
          rel="noopener"
          style={linkStyle}
        >
          Apply here
        </a>
        .
      </Fragment>,
    ],
  },
  {
    question: "Do you offer any volume discounts?",
    paragraphs: [
      <Fragment key="volume">
        Yes, we offer volume discounts.{" "}
        <Link href="/book-demo" style={linkStyle}>
          Contact us
        </Link>{" "}
        to discuss.
      </Fragment>,
    ],
  },
  {
    question: "How secure is Velt SDK?",
    paragraphs: [
      <Fragment key="security">
        Velt provides enterprise grade security. Our products are SOC 2 Type II
        and HIPAA Compliant.{" "}
        <a href="https://trust.velt.dev/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Learn More
        </a>
      </Fragment>,
    ],
  },
  {
    question: "How reliable and scalable is Velt SDK?",
    answer:
      "We provide a 99.999% uptime and highly scaleable infrastructure for our growth and enterprise plans.",
  },
];
