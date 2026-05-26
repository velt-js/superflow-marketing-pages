import type { ListingHeroProps } from "@/components/listing/ListingHero";
import type { ListingItem, ListingVariant } from "@/components/listing/ListingGrid";

export interface ListingPageConfig {
  hero: Omit<ListingHeroProps, "showLogoBar">;
  grid: {
    variant: ListingVariant;
    items: ListingItem[];
  };
}

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

export const alternativeListing: ListingPageConfig = {
  hero: {
    heading: "Superflow alternatives",
    subheading:
      "Superflow, while being an excellent way to give feedback, just like with any software, for some, there can be a better fit due to their needs or specific issues.",
  },
  grid: {
    variant: "icon-centered",
    items: [
      { title: "Google Docs", icon: "/images/hero/icon-world.svg", href: "/alternative/google-docs-alternative" },
      { title: "Loom", icon: "/images/hero/icon-world.svg", href: "/alternative/loom-alternative" },
      { title: "Markup", icon: "/images/hero/icon-world.svg", href: "/alternative/markup-alternative" },
      { title: "Pastel", icon: "/images/hero/icon-world.svg", href: "/alternative/pastel-alternative" },
      { title: "BugHerd", icon: "/images/hero/icon-world.svg", href: "/alternative/bugherd-alternative" },
      { title: "Ruttl", icon: "/images/hero/icon-world.svg", href: "/alternative/ruttl-alternative" },
      { title: "Marker.io", icon: "/images/hero/icon-world.svg", href: "/alternative/marker-io-alternative" },
      { title: "ReviewStudio", icon: "/images/hero/icon-world.svg", href: "/alternative/reviewstudio-alternative" },
      { title: "Use Bubbles", icon: "/images/hero/icon-world.svg", href: "/alternative/use-bubbles-alternative" },
      { title: "Vercel Comments", icon: "/images/hero/icon-world.svg", href: "/alternative/vercel-comments-alternative" },
      { title: "Webflow Comments", icon: "/images/hero/icon-world.svg", href: "/alternative/webflow-comments-alternative" },
    ],
  },
};

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
