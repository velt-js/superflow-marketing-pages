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
        href: "/user-persona/qa-team",
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
        title: "Agencies",
        subtitle: "Give clients a frictionless way to approve work.",
        href: "/user-persona/agencies",
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
      {
        title: "Jira",
        icon: "/images/hero/icon-world.svg",
        href: "/integrations/jira",
      },
      {
        title: "Linear",
        icon: "/images/hero/icon-world.svg",
        href: "/integrations/linear",
      },
      {
        title: "GitHub",
        icon: "/images/hero/icon-world.svg",
        href: "/integrations/github",
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
      { title: "Google Docs", icon: "/images/hero/icon-world.svg", href: "/alternative/google-docs" },
      { title: "Markup", icon: "/images/hero/icon-world.svg", href: "/alternative/markup" },
      { title: "Pastel", icon: "/images/hero/icon-world.svg", href: "/alternative/pastel" },
      { title: "BugHerd", icon: "/images/hero/icon-world.svg", href: "/alternative/bugherd" },
      { title: "Ruttl", icon: "/images/hero/icon-world.svg", href: "/alternative/ruttl" },
      { title: "Userback", icon: "/images/hero/icon-world.svg", href: "/alternative/userback" },
      { title: "Marker.io", icon: "/images/hero/icon-world.svg", href: "/alternative/marker-io" },
      { title: "Writesonic", icon: "/images/hero/icon-world.svg", href: "/alternative/writesonic" },
      { title: "Filestage", icon: "/images/hero/icon-world.svg", href: "/alternative/filestage" },
      { title: "ReviewStudio", icon: "/images/hero/icon-world.svg", href: "/alternative/reviewstudio" },
      { title: "Frame.io", icon: "/images/hero/icon-world.svg", href: "/alternative/frame-io" },
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
        title: "Superflow vs Markup",
        subtitle: "Real-time review on websites and creatives, side by side.",
        href: "/comparison/superflow-vs-markup",
      },
      {
        title: "Superflow vs Pastel",
        subtitle: "Compare workflows, integrations, and pricing.",
        href: "/comparison/superflow-vs-pastel",
      },
      {
        title: "Superflow vs BugHerd",
        subtitle: "Which one fits your QA team better?",
        href: "/comparison/superflow-vs-bugherd",
      },
      {
        title: "Superflow vs Ruttl",
        subtitle: "Side-by-side: features, speed, and team fit.",
        href: "/comparison/superflow-vs-ruttl",
      },
      {
        title: "Superflow vs Marker.io",
        subtitle: "Pick the right tool for visual feedback.",
        href: "/comparison/superflow-vs-marker-io",
      },
      {
        title: "Superflow vs Userback",
        subtitle: "How they differ for client feedback flows.",
        href: "/comparison/superflow-vs-userback",
      },
    ],
  },
};
