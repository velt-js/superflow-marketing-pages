// Shared types for the /solutions pages.
//
// The pages are CMS-backed (Sanity `solutionPage`, see
// sanity/schemas/solutionPage.ts) and render through one template
// (components/solutions-2026/SolutionPageBody.tsx). The seed content in
// content/solutions/*.json uses this exact shape, so the Sanity document,
// the GROQ projection in sanity/lib/queries.ts and the local fallback all
// agree on one contract. Keep this file React-free: the Sanity schema
// (studio bundle) imports the category list from ./agent-library.

import type { AgentCategory } from "./agent-library";

export type { AgentCategory } from "./agent-library";

/** Which nav column and index group a solution belongs to. */
export type SolutionKind = "agency" | "job";

/**
 * Which testimonial the proof section shows. Agency pages use the Wonderist
 * review-and-approval story only; job pages use the Headway or Harvey quotes
 * from the home page; "metrics-only" renders the metric strip alone.
 */
export type SolutionProof =
  | "wonderist-review"
  | "headway"
  | "harvey"
  | "metrics-only";

/** One agent card in the pack grid. Every card carries a sample finding. */
export interface SolutionAgent {
  /** Agent name, e.g. "Booking Link Check". */
  name: string;
  /** One line: what it checks. */
  checks: string;
  /** The sample finding, written as the comment a customer would see. */
  finding: string;
  /** Shared taxonomy bucket (see lib/solutions/agent-library.ts). */
  category: AgentCategory;
}

/** The "Build your own" card under the pack grid. */
export interface SolutionBuildYourOwn {
  /** The plain sentence the customer types. */
  input: string;
  /** The agent Superflow builds from it. */
  agentName: string;
  /** The finding that agent posts. */
  finding: string;
}

/** Optional extra section (site care only in batch 1): "Resell it." */
export interface SolutionResellSection {
  heading: string;
  lines: string[];
  ctaLabel: string;
  ctaHref: string;
}

/** One solutions page. Mirrors the `solutionPage` Sanity document. */
export interface SolutionPage {
  slug: string;
  kind: SolutionKind;
  /** Short label used in the nav, footer and index cards. */
  navLabel: string;
  /** One-line descriptor under the nav label. Under 60 characters. */
  navDescriptor: string;
  /** Sort position inside its kind group (nav, footer, index). */
  order?: number;
  seo: {
    title: string;
    description: string;
    ogTitle?: string;
  };
  hero: {
    /** The pain in the customer's words. Max 8 words. */
    h1: string;
    /** Two sentences: what agents check, what the human decides. */
    sub: string;
    /** One-line intro for the client sign-off block. */
    clientLine: string;
  };
  pack: {
    /** e.g. "Dental Launch Pack". */
    name: string;
    /** e.g. "dental-launch". Also the `?pack=` query value on signup. */
    slug: string;
    /** One line: these run on every page, desktop and phone, post as comments. */
    intro: string;
    /** Exactly eight agents. */
    agents: SolutionAgent[];
    buildYourOwn: SolutionBuildYourOwn;
  };
  human: {
    /** Four bullets. */
    agentsCheck: string[];
    /** Four bullets. */
    youDecide: string[];
  };
  /** Platform ids to show first in the logo strip, e.g. ["wordpress", "webflow"]. */
  platformsFirst: string[];
  proof: SolutionProof;
  /**
   * Optional override of the three cost lines. Tokens in braces are filled
   * from the pricing source of truth (components/pricing-2026/ai-credits-data.ts):
   * {smallScanPages} {smallScanCredits} {rescanCredits} {packPrice} {packCredits}.
   * Omit to render the default three lines.
   */
  cost?: string[];
  /** Three page-specific questions. Three shared ones are appended by the template. */
  faq: Array<{ q: string; a: string }>;
  /** Slugs of two other solution pages. */
  related: string[];
  resell?: SolutionResellSection;
}

/** Lightweight shape for the /solutions index, nav and footer. */
export interface SolutionSummary {
  slug: string;
  kind: SolutionKind;
  navLabel: string;
  navDescriptor: string;
  order?: number;
  packName: string;
  /** First three agent names in the pack. */
  agentNames: string[];
}
