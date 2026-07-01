// Centralized Amplitude event + property name constants. Keeping every
// event name in one place (mirroring the source Angular app's
// `src/app/utils/constants.ts`) avoids magic strings scattered across
// components and keeps naming consistent in the Amplitude dashboard.

/** Named Amplitude events fired across the Superflow marketing site. */
export const AnalyticsEvents = {
  // Page-level
  PAGE_VIEWED: "pageViewed",

  // CTAs
  HERO_CTA_CLICKED: "heroCtaClicked",
  NAV_CTA_CLICKED: "navCtaClicked",
  SIGNUP_CTA_CLICKED: "signupCtaClicked",
  BOOK_DEMO_CLICKED: "bookDemoClicked",
  PRICING_CTA_CLICKED: "pricingCtaClicked",

  // Forms
  DEMO_FORM_SUBMITTED: "demoFormSubmitted",
  DEMO_FORM_FAILED: "demoFormFailed",
  CONTACT_FORM_SUBMITTED: "contactFormSubmitted",

  // Navigation
  NAV_LINK_CLICKED: "navLinkClicked",
  FOOTER_LINK_CLICKED: "footerLinkClicked",
} as const;

/** Where in the UI an event originated, attached as an event property. */
export const AnalyticsSource = {
  HERO: "hero",
  NAVBAR: "navbar",
  FOOTER: "footer",
  PRICING_SECTION: "pricingSection",
  CTA_BANNER: "ctaBanner",
} as const;

/** Union of all valid event names. */
export type AnalyticsEvent =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/** Union of all valid source values. */
export type AnalyticsSourceValue =
  (typeof AnalyticsSource)[keyof typeof AnalyticsSource];
