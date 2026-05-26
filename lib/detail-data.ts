import type { ListingHeroBadge } from "@/components/listing/ListingHero";

export interface DetailHeroData {
  eyebrow?: string;
  heading: string;
  ctaText?: string;
  ctaHref?: string;
  leftBadge?: ListingHeroBadge;
  rightBadge?: ListingHeroBadge;
  showLogoBar?: boolean;
  roundedBottom?: boolean;
}

export interface ProblemCard {
  title: string;
  description: string;
  image: string;
}

export interface ProblemSectionData {
  heading: string;
  highlight?: string;
  cards: ProblemCard[];
}

export interface ShowcaseMediaData {
  heading: string;
  highlight?: string;
  image: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export interface FeatureRowData {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export interface RelatedWayItem {
  title: string;
  description?: string;
  icon?: string;
  iconNode?: import("react").ReactNode;
  href: string;
}

export interface RelatedWaysData {
  heading: string;
  highlight?: string;
  items: RelatedWayItem[];
}

export interface DetailPageConfig {
  hero: DetailHeroData;
  problem: ProblemSectionData;
  showcase: ShowcaseMediaData;
  features: FeatureRowData[];
  related: RelatedWaysData;
  /** Render the body sections dark (cards/wells/text) to match live persona pages. Defaults to light. */
  theme?: "light" | "dark";
}

export interface ReasonItem {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

export interface ReasonsGridData {
  heading: string;
  highlight?: string;
  subtitle?: string;
  items: ReasonItem[];
}

export type ComparisonBulletTone = "good" | "warn" | "bad";

export interface ComparisonBullet {
  text: string;
  tone: ComparisonBulletTone;
}

export interface ComparisonProductCard {
  name: string;
  logo?: string;
  score: string;
  image: string;
  imageAlt?: string;
  video?: string;
  summary?: string;
  bullets: ComparisonBullet[];
}

export interface ComparisonCriterionData {
  id: string;
  icon?: string;
  title: string;
  description: string;
  superflow: ComparisonProductCard;
  competitor: ComparisonProductCard;
}

export type OverviewIconKey =
  | "commenting"
  | "compatibility"
  | "integrations"
  | "client-management"
  | "team-workflow"
  | "ai-copilot";

export interface OverviewRow {
  criterion: string;
  iconKey: OverviewIconKey;
  superflowScore: string;
  competitorScore: string;
}

export interface OverviewTableData {
  heading: string;
  highlight?: string;
  competitorName: string;
  /** Label for the c1 column. Defaults to "Superflow" for alternative pages. */
  superflowName?: string;
  superflowLogo?: string;
  competitorLogo?: string;
  rows: OverviewRow[];
  ctaText?: string;
  ctaHref?: string;
}

export interface PricingTier {
  planName: string;
  price: string;
  billing?: string;
}

export interface PricingProduct {
  name: string;
  logo?: string;
  tiers: PricingTier[];
}

export interface PricingComparisonData {
  heading: string;
  highlight?: string;
  description?: string;
  products: PricingProduct[];
}

export interface WhyChooseQuote {
  headline?: string;
  quote: string;
  authorName: string;
  authorRole: string;
  avatar: string;
}

export interface WhyChooseCompliance {
  prefix?: string;
  highlight: string;
  suffix?: string;
}

export interface WhyChooseData {
  heading: string;
  highlight?: string;
  bullets: string[];
  ctaText: string;
  ctaHref: string;
  competitorLogo?: string;
  compliance?: WhyChooseCompliance;
  quote: WhyChooseQuote;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ComparisonDetailConfig {
  hero: DetailHeroData;
  reasons: ReasonsGridData;
  criteria: ComparisonCriterionData[];
  overview: OverviewTableData;
  pricing: PricingComparisonData;
  whyChoose: WhyChooseData;
  faq: FAQItem[];
}


const SHARED_SHOWCASE: ShowcaseMediaData = {
  heading: "Is finding feedback a guessing game",
  highlight: "between Slack, Gmail and Jira?",
  image: "/images/showcase/orange-bg.png",
  imageAlt: "Superflow review session",
  imageWidth: 1176,
  imageHeight: 700,
};

const SHARED_PROBLEM: ProblemSectionData = {
  heading: "Is finding feedback a guessing game",
  highlight: "between Slack, Gmail and Jira?",
  cards: [
    {
      title: "Multiple feedback channels",
      description: "Bug reports get lost across Slack threads, Gmail and stand-ups.",
      image: "/images/sections/collaboration/comments-in-context.png",
    },
    {
      title: "Missing context",
      description: "Vague screenshots make every bug a hunting expedition.",
      image: "/images/sections/collaboration/record-richer-feedback.png",
    },
    {
      title: "Slow back-and-forth",
      description: "Approvals stall while everyone waits for the right answer.",
      image: "/images/sections/collaboration/whos-doing-what.png",
    },
  ],
};

const SHARED_FEATURES: FeatureRowData[] = [
  {
    title: "In-line commenting on live web apps",
    description:
      "Comment directly on live websites and apps so feedback lands in the exact spot it belongs.",
    image: "/images/sections/collaboration/comments-in-context.png",
    imageWidth: 560,
    imageHeight: 360,
  },
  {
    title: "Integrated screen and voice recording for clear bug replication",
    description:
      "Capture context with screen + voice recordings so developers can reproduce issues in one watch.",
    image: "/images/sections/collaboration/record-richer-feedback.png",
    imageWidth: 560,
    imageHeight: 360,
  },
  {
    title: "Test across all mobile and desktops",
    description:
      "Review on phones, tablets and desktops without losing the comment thread or the version history.",
    image: "/images/sections/collaboration/review-from-wherever.png",
    imageWidth: 560,
    imageHeight: 360,
  },
];

export const useCaseDetails: Record<string, DetailPageConfig> = {
  "uat-qa-testing": {
    hero: {
      eyebrow: "Use Case",
      heading: "Faster QA bug fixing collaboration. Ship EOD instead of EOW, EOM or EOY",
      ctaText: "Try Superflow for Free",
      ctaHref: "https://app.usesuperflow.com/signup",
      leftBadge: { label: "QA Lead", color: "#4dd5ff" },
      rightBadge: { label: "Developer", color: "#fc6cba" },
    },
    problem: SHARED_PROBLEM,
    showcase: SHARED_SHOWCASE,
    features: SHARED_FEATURES,
    related: {
      heading: "Other ways in which",
      highlight: "Superflow can help",
      items: [
        {
          title: "Client feedback",
          description: "Collect approvals in one place.",
          icon: "/images/hero/icon-world.svg",
          href: "/use-case/client-feedback",
        },
        {
          title: "Design reviews",
          description: "Pin feedback right on the canvas.",
          icon: "/images/hero/icon-world.svg",
          href: "/use-case/design-reviews",
        },
        {
          title: "Reporting bugs",
          description: "Capture context with every report.",
          icon: "/images/hero/icon-world.svg",
          href: "/use-case/reporting-bugs",
        },
      ],
    },
  },
};

// userPersonaDetails moved to Sanity (see app/user-persona/[slug]/page.tsx).

export const SHARED_REASONS: ReasonsGridData = {
  heading: "Choosing an annotation tool:",
  highlight: "6 key factors",
  subtitle:
    "Wondering how to decide which web feedback tool is best for you and your teams? Consider the following six criteria…",
  items: [
    {
      id: "commenting",
      label: "Commenting",
      icon: "/images/sections/reasons/commenting.svg",
      description: "will this help us iterate the site lightening fast?",
    },
    {
      id: "compatibility",
      label: "Compatibility",
      icon: "/images/sections/reasons/compatibility.svg",
      description: "Does this work on real phones and browsers?",
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: "/images/sections/reasons/integrations.svg",
      description: "Does this connect to my existing tools and workflows?",
    },
    {
      id: "client-management",
      label: "Client management",
      icon: "/images/sections/reasons/client-management.svg",
      description: "How easy is it for my team and clients to use",
    },
    {
      id: "team-workflow",
      label: "Team Workflow",
      icon: "/images/sections/reasons/team-workflow.svg",
      description: "Will this 10X my team's productivity",
    },
    {
      id: "ai-copilot",
      label: "AI Copilot",
      icon: "/images/sections/reasons/ai-copilot.svg",
      description: "Can it assist you in improving web project's quality?",
    },
  ],
};

function buildCriteria(competitor: string): ComparisonCriterionData[] {
  const previewImage = "/images/sections/collaboration/comments-in-context.png";
  return [
    {
      id: "commenting",
      icon: "/images/sections/reasons/commenting.svg",
      title: "Commenting",
      description:
        "Stop leaving vague feedback that confuses your teams even more. Drop text, audio, and video comments at all the right places with Superflow.",
      superflow: {
        name: "Superflow",
        score: "3/3",
        image: previewImage,
        imageAlt: "Superflow commenting",
        summary: "Consistent & clear feedback",
        bullets: [
          { text: "Comment on an area", tone: "good" },
          { text: "Native video recording", tone: "good" },
          { text: "Live huddles & discussions", tone: "good" },
        ],
      },
      competitor: {
        name: competitor,
        score: "1/3",
        image: previewImage,
        imageAlt: `${competitor} commenting`,
        summary: "Shuffled & confusing feedback",
        bullets: [
          { text: "Comment on a point", tone: "bad" },
          { text: "Loom recording (requires subscription)", tone: "warn" },
          { text: "Offline discussions only", tone: "bad" },
        ],
      },
    },
    {
      id: "compatibility",
      icon: "/images/sections/reasons/compatibility.svg",
      title: "Compatibility",
      description:
        "Your feedback tool should fit into whatever environments you already use — websites, staging, PDFs and images.",
      superflow: {
        name: "Superflow",
        score: "3/3",
        image: previewImage,
        summary: "Works wherever your team works",
        bullets: [
          { text: "Live websites and staging", tone: "good" },
          { text: "PDFs and images", tone: "good" },
          { text: "Authenticated pages", tone: "good" },
        ],
      },
      competitor: {
        name: competitor,
        score: "2/3",
        image: previewImage,
        summary: "Limited surfaces supported",
        bullets: [
          { text: "Live websites only", tone: "warn" },
          { text: "Images supported", tone: "good" },
          { text: "No authenticated pages", tone: "bad" },
        ],
      },
    },
    {
      id: "integrations",
      icon: "/images/sections/reasons/integrations.svg",
      title: "Integrations",
      description:
        "Push tasks and threads into the project management tools your team already lives in.",
      superflow: {
        name: "Superflow",
        score: "3/3",
        image: previewImage,
        summary: "Deep two-way sync",
        bullets: [
          { text: "Jira, Linear, Asana, ClickUp", tone: "good" },
          { text: "Slack and email notifications", tone: "good" },
          { text: "Two-way sync with task status", tone: "good" },
        ],
      },
      competitor: {
        name: competitor,
        score: "1/3",
        image: previewImage,
        summary: "Notifications only",
        bullets: [
          { text: "Slack only", tone: "warn" },
          { text: "No two-way sync", tone: "bad" },
          { text: "Limited PM tool support", tone: "bad" },
        ],
      },
    },
    {
      id: "client-management",
      icon: "/images/sections/reasons/client-management.svg",
      title: "Client Management",
      description:
        "Give clients a frictionless way to leave feedback and approve work without learning a new tool.",
      superflow: {
        name: "Superflow",
        score: "3/3",
        image: previewImage,
        summary: "Built for client review",
        bullets: [
          { text: "Guest reviewer access", tone: "good" },
          { text: "Approval workflows", tone: "good" },
          { text: "Branded review portals", tone: "good" },
        ],
      },
      competitor: {
        name: competitor,
        score: "2/3",
        image: previewImage,
        summary: "Basic guest access",
        bullets: [
          { text: "Guest reviewer access", tone: "good" },
          { text: "Basic approvals", tone: "warn" },
          { text: "No branded portals", tone: "bad" },
        ],
      },
    },
    {
      id: "team-workflow",
      icon: "/images/sections/reasons/team-workflow.svg",
      title: "Team Workflow",
      description:
        "Will it considerably increase productivity for your design, engineering and QA teams?",
      superflow: {
        name: "Superflow",
        score: "3/3",
        image: previewImage,
        summary: "Tasks, assignees, exports",
        bullets: [
          { text: "In-built task manager", tone: "good" },
          { text: "Assignees and statuses", tone: "good" },
          { text: "Export feedback in a click", tone: "good" },
        ],
      },
      competitor: {
        name: competitor,
        score: "1/3",
        image: previewImage,
        summary: "Manual handoffs",
        bullets: [
          { text: "No in-built task manager", tone: "bad" },
          { text: "Manual handoffs to PM tools", tone: "warn" },
          { text: "No bulk export", tone: "bad" },
        ],
      },
    },
    {
      id: "ai-copilot",
      icon: "/images/sections/reasons/ai-copilot.svg",
      title: "AI Copilot",
      description:
        "Let AI summarise threads, draft replies and triage comments so your team stays in flow.",
      superflow: {
        name: "Superflow",
        score: "3/3",
        image: previewImage,
        summary: "AI keeps your team in flow",
        bullets: [
          { text: "AI thread summaries", tone: "good" },
          { text: "Smart reply drafts", tone: "good" },
          { text: "Auto-triage by priority", tone: "good" },
        ],
      },
      competitor: {
        name: competitor,
        score: "0/3",
        image: previewImage,
        summary: "No AI assistance",
        bullets: [
          { text: "No AI summaries", tone: "bad" },
          { text: "No reply drafts", tone: "bad" },
          { text: "No auto-triage", tone: "bad" },
        ],
      },
    },
  ];
}

function buildOverview(competitor: string): OverviewTableData {
  return {
    heading: `Superflow vs ${competitor}:`,
    highlight: "An overview",
    competitorName: competitor,
    rows: [
      { criterion: "Commenting", iconKey: "commenting", superflowScore: "3/3", competitorScore: "1/3" },
      { criterion: "Compatibility", iconKey: "compatibility", superflowScore: "3/3", competitorScore: "1/3" },
      { criterion: "Integrations", iconKey: "integrations", superflowScore: "3/3", competitorScore: "1/3" },
      { criterion: "Client management", iconKey: "client-management", superflowScore: "3/3", competitorScore: "2/3" },
      { criterion: "Team Workflow", iconKey: "team-workflow", superflowScore: "3/3", competitorScore: "2/3" },
      { criterion: "AI Copilot", iconKey: "ai-copilot", superflowScore: "3/3", competitorScore: "0/3" },
    ],
    ctaText: "Try Superflow now",
    ctaHref: "https://app.usesuperflow.com/signup",
  };
}

function buildPricing(competitor: string): PricingComparisonData {
  return {
    heading: "Pricing Comparison",
    description: `Let's have a look at the pricing plans offered by ${competitor} and Superflow.`,
    products: [
      {
        name: "Superflow",
        tiers: [
          { planName: "Free", price: "$0", billing: "forever" },
          { planName: "Starter", price: "$15", billing: "per user / mo" },
          { planName: "Pro", price: "$29", billing: "per user / mo" },
          { planName: "Enterprise", price: "Custom", billing: "contact sales" },
        ],
      },
      {
        name: competitor,
        tiers: [
          { planName: "Free", price: "$0", billing: "limited" },
          { planName: "Pro", price: "$24", billing: "per user / mo" },
          { planName: "Business", price: "$49", billing: "per user / mo" },
          { planName: "Enterprise", price: "Custom", billing: "contact sales" },
        ],
      },
    ],
  };
}

function buildWhyChoose(competitor: string): WhyChooseData {
  return {
    heading: "So why choose",
    highlight: `Superflow over ${competitor}?`,
    bullets: [
      "Collaborate on live websites",
      "Review smoothly on mobile",
      "Access authenticated pages",
      "In-built video recorder",
    ],
    ctaText: "Ready to try Superflow?",
    ctaHref: "https://app.usesuperflow.com/signup",
    compliance: {
      prefix: "Superflow is ",
      highlight: "SOC II Type I compliant",
      suffix: " with dedicated data storage",
    },
    quote: {
      headline: "It's everything I've wanted",
      quote:
        "Superflow is the fastest, easiest way to iterate on our apps and marketing pages. The UX is easy, the tech is brilliant, the team is like lightning — it's everything I've wanted and tried to build into our websites myself for 15 years. Finally!",
      authorName: "Nick Winter",
      authorRole: "CEO @CodeCombat",
      avatar: "/images/hero/icon-world.svg",
    },
  };
}

function buildFAQ(competitor: string): FAQItem[] {
  return [
    {
      q: "What is a website feedback tool?",
      a: `A website feedback tool lets your team and clients leave contextual comments, screenshots, and recordings directly on a live website or app. Superflow and ${competitor} are both examples — but they take very different approaches to how feedback is captured and routed.`,
    },
    {
      q: `Which is the best alternative to ${competitor}?`,
      a: `If you need real-time review on live websites with built-in video recording, task management and AI triage, Superflow is the strongest alternative to ${competitor} for product, design and QA teams in 2025.`,
    },
    {
      q: `Is there a website feedback tool better than ${competitor}?`,
      a: `Superflow beats ${competitor} on commenting depth, integrations, client workflows and AI assistance — see the scorecard above for a side-by-side breakdown.`,
    },
    {
      q: "Does Superflow offer a free plan?",
      a: "Yes — Superflow has a 10-day free trial with full feature access, plus a free forever tier for individuals and small teams.",
    },
    {
      q: "Can I use Superflow on authenticated pages?",
      a: "Yes. Superflow works behind logins, on staging environments, and on password-protected pages — so you can review real user flows, not just marketing pages.",
    },
    {
      q: "Does Superflow integrate with Jira and Linear?",
      a: "Yes. Comments and bug reports can sync two-way with Jira, Linear, Asana, ClickUp and more. Status changes flow back into the Superflow thread automatically.",
    },
  ];
}

// alternativeDetails moved to Sanity (see app/alternative/[slug]/page.tsx
// + lib/sanity-adapters/alternative.ts). The hardcoded shape lived here
// previously; removed during the Framer → Sanity migration.

// comparisonDetails moved to Sanity (see app/comparisons/[slug]/page.tsx
// + components/comparisons/ComparisonsPage.tsx). The hardcoded stub lived
// here previously; removed during the Framer → Sanity migration.

