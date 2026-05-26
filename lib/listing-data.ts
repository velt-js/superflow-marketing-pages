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

// userPersonaListing moved to Sanity (see app/user-persona/page.tsx).

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

// comparisonListing moved to Sanity (see app/comparisons/page.tsx).
