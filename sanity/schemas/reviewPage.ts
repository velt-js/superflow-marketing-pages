import { defineType, defineField } from "sanity";

// Inlined CTA shape (this repo doesn't have a top-level `ctaLink` type).
export const reviewCta = defineType({
  name: "reviewCta",
  title: "CTA Link",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string" }),
    defineField({ name: "href", title: "URL", type: "string" }),
    defineField({ name: "newTab", title: "Open in new tab", type: "boolean" }),
  ],
});

// reviewPage — drives /<feature>-review marketing pages (Image, Video,
// Lottie, PDF, Website). All 5 share an identical template; only the hero
// copy + persona pills + hero media, the FeatureCards 4-card grid, the
// CollaborationTools 6-card grid, and the "formats supported" FAQ answer
// vary per feature. Everything else is hard-coded shared chrome.

export const reviewPersona = defineType({
  name: "reviewPersona",
  title: "Hero Persona Badge",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      description: 'e.g. "Photographer", "Designer", "Animator".',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "color",
      title: "Cursor / pill color (hex)",
      description:
        'Use brand accents. Image page: "#3DB7E4" + "#E934BF". Video: "#FF7162" + "#FFCD2E".',
      type: "string",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "color" } },
});

export const reviewHero = defineType({
  name: "reviewHero",
  title: "Review Hero",
  type: "object",
  fields: [
    defineField({
      name: "headlineLine1",
      title: "Headline line 1",
      description: 'e.g. "Ship Image Assets". Line 2 ("Impossibly Fast") is fixed across all review pages.',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "text",
      rows: 2,
      initialValue: "Get approved with fewer rounds of reviews",
    }),
    defineField({ name: "personaLeft", title: "Persona badge — left", type: "reviewPersona" }),
    defineField({ name: "personaRight", title: "Persona badge — right", type: "reviewPersona" }),
    defineField({ name: "primaryCta", title: "Primary CTA", type: "reviewCta" }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "reviewCta" }),
    defineField({
      name: "heroMedia",
      title: "Hero media",
      type: "image",
      options: { hotspot: false },
    }),
  ],
});

// ---- FeatureCards (4-card capability grid, Figma 18:3443) ----

export const reviewFeatureCard = defineType({
  name: "reviewFeatureCard",
  title: "Feature card",
  type: "object",
  fields: [
    defineField({
      name: "titleLine1",
      title: "Title — line 1",
      description: 'e.g. "Review pixels"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleLine2",
      title: "Title — line 2",
      description: 'e.g. "with precision"',
      type: "string",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Card hero image",
      type: "image",
      options: { hotspot: false },
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "titleLine1", subtitle: "titleLine2", media: "image" },
  },
});

export const reviewIntegrationLogo = defineType({
  name: "reviewIntegrationLogo",
  title: "Integration logo",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: false },
      validation: (r) => r.required(),
    }),
    defineField({ name: "href", title: "URL", type: "url" }),
  ],
  preview: { select: { title: "name", media: "logo" } },
});

export const reviewFeatureCards = defineType({
  name: "reviewFeatureCards",
  title: "Feature Cards section",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "heading",
      title: "Section heading (H2)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "cards",
      title: "Cards (exactly 4)",
      type: "array",
      of: [{ type: "reviewFeatureCard" }],
      validation: (r) => r.required().length(4),
    }),
    defineField({
      name: "integrationLogos",
      title: "Integrations footer — logos",
      description: "Rendered below card 4. Suggested set: Asana, Slack, ClickUp, Monday.com.",
      type: "array",
      of: [{ type: "reviewIntegrationLogo" }],
    }),
    defineField({
      name: "integrationsCtaLabel",
      title: "Integrations CTA label",
      type: "string",
      initialValue: "View Integrations",
    }),
    defineField({ name: "integrationsCtaHref", title: "Integrations CTA URL", type: "url" }),
    defineField({
      name: "firstCardVariants",
      title: "First card — tabbed variants (website only)",
      description:
        "When populated, the first FeatureCard renders an interactive pill row that swaps the inner mock between variants. Used only on /website-review.",
      type: "array",
      of: [{ type: "reviewWebsiteFirstCardVariant" }],
    }),
  ],
});

export const reviewWebsiteFirstCardVariant = defineType({
  name: "reviewWebsiteFirstCardVariant",
  title: "Website first-card variant",
  type: "object",
  fields: [
    defineField({ name: "pillLabel", title: "Pill label", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "image",
      title: "Variant mock image",
      type: "image",
      options: { hotspot: false },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "pillLabel", media: "image" } },
});

// ---- CollaborationTools (6-card grid, Figma 18:3783) ----

export const reviewCollabCard = defineType({
  name: "reviewCollabCard",
  title: "Collaboration tools card",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "body",
      title: "Body",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon (40×40)",
      type: "image",
      options: { hotspot: false },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "preview",
      title: "Preview image (~490×260)",
      type: "image",
      options: { hotspot: false },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "title", subtitle: "body", media: "icon" } },
});

export const reviewCollabTools = defineType({
  name: "reviewCollabTools",
  title: "Collaboration Tools section",
  type: "object",
  fields: [
    defineField({
      name: "headingLine1",
      title: "Heading — line 1",
      type: "string",
      initialValue: "Collaboration tools",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headingLine2",
      title: "Heading — line 2 (gradient)",
      type: "string",
      initialValue: "for faster teamwork",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "cards",
      title: "Cards (exactly 6)",
      type: "array",
      of: [{ type: "reviewCollabCard" }],
      validation: (r) => r.required().length(6),
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA label",
      type: "string",
      initialValue: "Try Now For Free",
    }),
    defineField({ name: "ctaHref", title: "CTA URL", type: "url" }),
  ],
});

// ---- Website-only sections (rendered only on /website-review) ----

export const reviewWebsiteFutureTab = defineType({
  name: "reviewWebsiteFutureTab",
  title: "Website Future Tab",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Tab label",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "iconName",
      title: "Tabler icon name",
      description: 'e.g. "grid-dots", "app-window", "devices", "lock-password".',
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Tab content image",
      type: "image",
      options: { hotspot: false },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "iconName", media: "image" } },
});

export const reviewWebsiteFuture = defineType({
  name: "reviewWebsiteFuture",
  title: "Website Future section",
  type: "object",
  fields: [
    defineField({
      name: "headingLine1",
      title: "Heading line 1",
      type: "string",
      initialValue: "Superflow is built for the future",
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "string",
      initialValue: "Built using bleeding edge technology to deliver only the best",
    }),
    defineField({
      name: "tabs",
      title: "Tabs",
      type: "array",
      of: [{ type: "reviewWebsiteFutureTab" }],
      validation: (r) => r.min(2).max(6),
    }),
  ],
});

export const reviewWebsiteInstall = defineType({
  name: "reviewWebsiteInstall",
  title: "Website Install section",
  type: "object",
  fields: [
    defineField({
      name: "headingLine1",
      title: "Heading line 1",
      type: "string",
      initialValue: "Install Anywhere.",
    }),
    defineField({
      name: "headingLine2",
      title: "Heading line 2 (gradient)",
      type: "string",
      initialValue: "In Seconds.",
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "string",
      initialValue: "Works on all web based platforms",
    }),
    defineField({
      name: "logos",
      title: "Logo strip image (1547×80)",
      type: "image",
      description: "Single horizontal strip of platform logos. Will scroll as a marquee at 12s.",
      options: { hotspot: false },
    }),
  ],
});

// ---- reviewPage document ----

export const reviewPage = defineType({
  name: "reviewPage",
  title: "Review Page",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "hero", title: "Hero" },
    { name: "featureCards", title: "Feature Cards" },
    { name: "collabTools", title: "Collaboration Tools" },
    { name: "faq", title: "FAQ" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: 'e.g. "Image Review". Used in nav/listing and meta defaults.',
      type: "string",
      group: "identity",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "identity",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "feature",
      title: "Feature",
      type: "string",
      group: "identity",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
          { title: "Lottie", value: "lottie" },
          { title: "PDF", value: "pdf" },
          { title: "Website", value: "website" },
        ],
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: "hero",
      title: "Hero",
      type: "reviewHero",
      group: "hero",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "featureCards",
      title: "Feature Cards (4-card capability grid)",
      type: "reviewFeatureCards",
      group: "featureCards",
    }),

    defineField({
      name: "collaborationTools",
      title: "Collaboration Tools (6-card grid)",
      type: "reviewCollabTools",
      group: "collabTools",
    }),

    defineField({
      name: "websiteFuture",
      title: "Website-only — \"Built for the future\" tabbed section",
      type: "reviewWebsiteFuture",
      group: "collabTools",
      description: "Renders only on /website-review. Leave empty for other feature pages.",
    }),

    defineField({
      name: "websiteInstall",
      title: "Website-only — \"Install Anywhere\" section",
      type: "reviewWebsiteInstall",
      group: "collabTools",
      description: "Renders only on /website-review. Leave empty for other feature pages.",
    }),

    defineField({
      name: "faqFormatsAnswer",
      title: 'FAQ: "What formats are supported?" answer',
      description: "Per-feature override for the formats-supported FAQ row.",
      type: "text",
      rows: 3,
      group: "faq",
    }),

    defineField({ name: "metaTitle", title: "Meta Title", type: "string", group: "seo" }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 2,
      group: "seo",
    }),
    defineField({ name: "ogImage", title: "OG Image", type: "image", group: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "feature", media: "hero.heroMedia" },
  },
});
