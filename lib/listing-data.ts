import type { ListingHeroProps } from "@/components/listing/ListingHero";
import type { ListingItem, ListingVariant } from "@/components/listing/ListingGrid";

export interface ListingPageConfig {
  hero: Omit<ListingHeroProps, "showLogoBar">;
  grid: {
    variant: ListingVariant;
    items: ListingItem[];
  };
}

export const useCaseListing: ListingPageConfig = {
  hero: {
    heading: "See if Superflow is right for you and your team",
    subheading:
      "Get faster bug feedback across testing, staging and production. End communication breakdowns. Stop bugs before they even happen",
  },
  grid: {
    variant: "icon-vertical",
    items: [
      {
        title: "UAT & QA testing",
        subtitle: "Launch flawlessly with better QA.",
        icon: "/images/hero/icon-world.svg",
        href: "/use-case/uat-qa-testing",
      },
      {
        title: "Client feedback",
        subtitle: "Collect approvals in one place.",
        icon: "/images/hero/icon-world.svg",
        href: "/use-case/client-feedback",
      },
      {
        title: "Conversion optimization",
        subtitle: "Iterate landing pages faster.",
        icon: "/images/hero/icon-world.svg",
        href: "/use-case/conversion-optimization",
      },
      {
        title: "Reporting bugs",
        subtitle: "Capture context with every report.",
        icon: "/images/hero/icon-world.svg",
        href: "/use-case/reporting-bugs",
      },
      {
        title: "UX/UI optimization",
        subtitle: "Polish interactions with shared notes.",
        icon: "/images/hero/icon-world.svg",
        href: "/use-case/ux-ui-optimization",
      },
      {
        title: "Design reviews",
        subtitle: "Pin feedback right on the canvas.",
        icon: "/images/hero/icon-world.svg",
        href: "/use-case/design-reviews",
      },
      {
        title: "Marketing handoffs",
        subtitle: "Ship campaigns without long threads.",
        icon: "/images/hero/icon-world.svg",
        href: "/use-case/marketing-handoffs",
      },
      {
        title: "Stakeholder reviews",
        subtitle: "Loop in execs without screenshots.",
        icon: "/images/hero/icon-world.svg",
        href: "/use-case/stakeholder-reviews",
      },
    ],
  },
};

export const userPersonaListing: ListingPageConfig = {
  hero: {
    heading: "Built for every role on the team",
    subheading:
      "Whoever owns the work, Superflow keeps feedback grounded in the asset itself — fewer threads, faster approvals, no context lost between tools.",
  },
  grid: {
    variant: "text-only",
    items: [
      {
        title: "QA Team",
        subtitle:
          "Get faster bug feedback across testing, staging and production. End communication breakdowns. Stop bugs before they even happen.",
        href: "/user-persona/qa-teams",
      },
      {
        title: "Project Managers",
        subtitle: "Keep every review on track without chasing status updates.",
        href: "/user-persona/project-managers",
      },
      {
        title: "Founders",
        subtitle: "Give precise feedback without slowing your team down.",
        href: "/user-persona/founders",
      },
      {
        title: "Developers",
        subtitle: "Resolve issues directly in the code context they live in.",
        href: "/user-persona/developers",
      },
      {
        title: "Designers",
        subtitle: "Collect contextual feedback right on the canvas.",
        href: "/user-persona/designers",
      },
      {
        title: "Product Managers",
        subtitle: "Track every comment from spec to ship in one place.",
        href: "/user-persona/product-managers",
      },
      {
        title: "Marketers",
        subtitle: "Review landing pages and creatives without screenshots.",
        href: "/user-persona/marketers",
      },
      {
        title: "Marketing Agencies",
        subtitle: "Give clients a frictionless way to approve work.",
        href: "/user-persona/marketing-agencies",
      },
      {
        title: "Product Companies",
        subtitle: "Ship features faster with feedback baked into every review.",
        href: "/user-persona/product-companies",
      },
    ],
  },
};

export const integrationsListing: ListingPageConfig = {
  hero: {
    heading: "Superflow integrations",
    subheading:
      "Plug Superflow into the tools your team already lives in. Push tasks, sync threads, and keep every conversation in context.",
  },
  grid: {
    variant: "icon-horizontal",
    items: [
      {
        title: "Asana",
        icon: "/images/hero/icon-world.svg",
        href: "/integrations/asana",
      },
      {
        title: "ClickUp",
        icon: "/images/hero/icon-world.svg",
        href: "/integrations/clickup",
      },
      {
        title: "Slack",
        icon: "/images/hero/icon-world.svg",
        href: "/integrations/slack",
      },
      {
        title: "Webflow",
        icon: "/images/hero/icon-world.svg",
        href: "/integrations/webflow",
      },
      {
        title: "Monday.com",
        icon: "/images/hero/icon-world.svg",
        href: "/integrations/monday",
      },
      {
        title: "Google Tag Manager",
        icon: "/images/hero/icon-world.svg",
        href: "/integrations/google-tag-manager",
      },
    ],
  },
};

// alternativeListing moved to Sanity (see app/alternative/page.tsx).

export const comparisonListing: ListingPageConfig = {
  hero: {
    heading: "How Superflow stacks up",
    subheading:
      "See how Superflow compares to other review and feedback tools — pricing, integrations, and where each one fits best.",
  },
  grid: {
    variant: "text-only",
    items: [
      {
        title: "Markup vs Pastel",
        subtitle: "Compare workflows, integrations, and pricing.",
        href: "/comparisons/markup-vs-pastel",
      },
      {
        title: "Markup vs Ruttl",
        subtitle: "Side-by-side: features, speed, and team fit.",
        href: "/comparisons/markup-vs-ruttl",
      },
      {
        title: "Pastel vs BugHerd",
        subtitle: "Which one fits your QA team better?",
        href: "/comparisons/pastel-vs-bugherd",
      },
    ],
  },
};
