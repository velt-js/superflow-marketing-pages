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

  // Free tools (/tools/*). The funnel the brief measures weekly: views,
  // runs, results, then the three things a visitor can do with a result.
  TOOL_VIEW: "toolView",
  TOOL_RUN: "toolRun",
  TOOL_RESULT: "toolResult",
  TOOL_ERROR: "toolError",
  SHARE_CLICK: "shareClick",
  DOWNLOAD: "download",
  CTA_CLICK: "ctaClick",

  // Agency directory (/directory/*). Two funnels, measured separately:
  // agencies claiming and enriching their listing, and founders asking to
  // be matched. The first 30 days are read as claims completed / agencies
  // emailed, match requests submitted, and the share of matches landing
  // on at least two claimed agencies - which is why MATCH_ROUTED carries
  // the routed slugs rather than only a count.
  //
  // These are snake_case where everything above is camelCase, and that is
  // deliberate rather than an oversight: they are new names being created
  // in Amplitude by this work, and they were specified in that form. Do
  // not "fix" one of them in isolation - a renamed event is a broken
  // chart, and half a convention is worse than either whole one.
  DIRECTORY_VIEWED: "directory_viewed",
  DIRECTORY_FILTER_APPLIED: "directory_filter_applied",
  PROFILE_VIEWED: "profile_viewed",
  CLAIM_STARTED: "claim_started",
  CLAIM_EMAIL_SENT: "claim_email_sent",
  CLAIM_COMPLETED: "claim_completed",
  MATCH_STARTED: "match_started",
  MATCH_SUBMITTED: "match_submitted",
  MATCH_ROUTED: "match_routed",
  REQUEST_INTRO_CLICKED: "request_intro_clicked",
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
