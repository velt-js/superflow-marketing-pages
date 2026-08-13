import { client } from "../client";
import type {
  BugBookEntryDetail,
  BugBookListEntry,
  BugBookSample,
} from "@/lib/bug-book";

export type BlogPostListItem = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  publishedAt?: string;
  category?: string;
  tags?: string[];
  author?: { name: string; role?: string };
  featuredImage?: string;
};

export async function getAllBlogPosts(): Promise<BlogPostListItem[]> {
  return client.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      description,
      publishedAt,
      category,
      categoryLabel,
      readTime,
      featured,
      tags,
      "author": author->{ name, role },
      "featuredImage": featuredImage.asset->url
    }
  `);
}

export async function getAllBlogSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "blogPost" && defined(slug.current)].slug.current`
  );
}

export async function getBlogPostBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "blogPost" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      description,
      publishedAt,
      _updatedAt,
      category,
      categoryLabel,
      readTime,
      tags,
      "author": author->{ name, role, "avatar": avatar.asset->url },
      "featuredImage": featuredImage.asset->url,
      body,
      metaTitle,
      metaDescription,
      "ogImage": ogImage.asset->url,
      faqSchema,
      blogPostingSchema
    }
  `,
    { slug }
  );
}

// Integration page queries
export type IntegrationListItem = {
  _id: string;
  slug: string;
  title: string;
  appName?: string;
  appLogo?: string;
  metaDescription?: string;
};

export async function getAllIntegrationSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "integrationPage" && defined(slug.current)].slug.current`
  );
}

export async function getAllIntegrationListItems(): Promise<
  IntegrationListItem[]
> {
  return client.fetch(
    `*[_type == "integrationPage" && defined(slug.current)] | order(appName asc) {
      _id,
      "slug": slug.current,
      title,
      appName,
      "appLogo": appLogo.asset->url,
      metaDescription
    }`
  );
}

export async function getIntegrationPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "integrationPage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, metaTitle, metaDescription,
      authorName, publishedDateText,
      "thumbnail": thumbnail.asset->url,
      appName, "appLogo": appLogo.asset->url, linkToApp, isTaskApp,
      installationVideoLink, "installationVideoFile": installationVideoFile.asset->url,
      description, overview,
      steps[]{ title, body }
    }`,
    { slug }
  );
}

// Use case page queries
export type UseCaseListItem = {
  _id: string;
  slug: string;
  title: string;
  useCase?: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
};

export async function getAllUseCaseSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "useCasePage" && defined(slug.current)].slug.current`
  );
}

export async function getAllUseCaseListItems(): Promise<UseCaseListItem[]> {
  return client.fetch(
    `*[_type == "useCasePage" && defined(slug.current) && hidden != true] | order(title asc) {
      _id,
      "slug": slug.current,
      title,
      "useCase": hero.useCase,
      description,
      "icon": icon.asset->url,
      "thumbnail": thumbnail.asset->url
    }`
  );
}
export async function getUseCasePageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "useCasePage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, hidden,
      "thumbnail": thumbnail.asset->url, "icon": icon.asset->url,
      hero, explanationTitle,
      problemSection{ title1, title2, items[]{ title, artifact, "image": image.asset->url } },
      solutionSection{ title1, title2, items[]{ title, subCopy, artifact, "image": image.asset->url } },
      featureText1, featureText2,
      testimonials[]{ name, role, company, title, subCopy, "image": image.asset->url },
      footerCtaTitle, faq[]{ question, answer },
      metaTitle, metaDescription, noIndex
    }`,
    { slug }
  );
}

// Case study page queries
export type CaseStudyListItem = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  logo?: string;
  thumbnail?: string;
};

export async function getAllCaseStudySlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "caseStudyPage" && defined(slug.current)].slug.current`
  );
}

export async function getAllCaseStudyListItems(): Promise<CaseStudyListItem[]> {
  return client.fetch(
    `*[_type == "caseStudyPage" && defined(slug.current)] | order(title asc) {
      _id,
      "slug": slug.current,
      title,
      description,
      "logo": logo.asset->url,
      "thumbnail": thumbnail.asset->url
    }`
  );
}
export async function getCaseStudyPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "caseStudyPage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, author, publishedDateText,
      _updatedAt,
      "thumbnail": thumbnail.asset->url, "logo": logo.asset->url,
      hero, overview,
      problemSection{ description, items[]{ text, "image": image.asset->url } },
      solutionSection{ description, items[]{ tag, title, subText, "video": video.asset->url } },
      resultsSection{ description, items[]{ value, text } },
      testimonial{ name, role, company, title, subText, "profileImage": profileImage.asset->url },
      showFaq, faq[]{ question, answer },
      metaTitle, metaDescription
    }`,
    { slug }
  );
}

// User persona page queries
export async function getAllUserPersonaSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "userPersonaPage" && defined(slug.current)].slug.current`
  );
}
export async function getAllUserPersonaPages() {
  return client.fetch(
    `*[_type == "userPersonaPage" && hidden != true] | order(title asc){
      _id, title, "slug": slug.current,
      "role": hero.role,
      "description": hero.description,
      "thumbnail": thumbnail.asset->url,
      "icon": icon.asset->url
    }`
  );
}
export async function getUserPersonaPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "userPersonaPage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, hidden,
      "thumbnail": thumbnail.asset->url, "icon": icon.asset->url,
      hero,
      jobs[]{ title1, title2, features[]{ highlightTitle, highlightSubText, "highlightImage": highlightImage.asset->url, barrierText, artifact } },
      solutionTitle1, solutionTitle2, featureText1, featureText2,
      features[]{ title, subText, artifact, "image": image.asset->url },
      othersTitle1, othersTitle2, outcomeOneLiner,
      testimonials[]{ name, role, company, title, subCopy, "image": image.asset->url },
      faq[]{ question, answer },
      finalCta, metaTitle, metaDescription, noIndex
    }`,
    { slug }
  );
}

// Alternative page queries
export async function getAllAlternativeSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "alternativePage" && defined(slug.current)].slug.current`
  );
}
export async function getAllAlternativePages() {
  return client.fetch(
    `*[_type == "alternativePage" && hidden != true] | order(publishedDate desc, title asc){
      _id, title, "slug": slug.current, description,
      competitor1Name, competitor2Name,
      "thumbnail": thumbnail.asset->url,
      "competitor2Logo": competitor2Logo.asset->url
    }`
  );
}
export async function getAlternativePageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "alternativePage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, hidden, author,
      publishedDate, publishedDateText, enableLayout2,
      "thumbnail": thumbnail.asset->url,
      competitor1Name, "competitor1Logo": competitor1Logo.asset->url,
      competitor2Name, "competitor2Logo": competitor2Logo.asset->url,
      criteria[]{
        _key, title, description, winnerC1, result,
        competitor1{
          score, title, "video": video.asset->url, youtubeUrl,
          tags[]{ label, color }
        },
        competitor2{
          score, title, "video": video.asset->url, youtubeUrl,
          tags[]{ label, color }
        }
      },
      pricing[]{ c1Name, c1Price, c1Users, c2Name, c2Price, c2Users },
      showOverview, overview, summaryPointers,
      testimonial{ name, role, company, title, subCopy, "profileImage": profileImage.asset->url },
      faq[]{ question, answer },
      choices[]{
        title, subText, "image": image.asset->url,
        videoLink, "videoFile": videoFile.asset->url
      },
      features[]{ title, c1Text, c2Text },
      highlights[]{
        title, subText, "image": image.asset->url,
        videoLink, "videoFile": videoFile.asset->url
      },
      caseStudy{ title, challenges, link },
      layout2Testimonial{ name, role, company, title, subCopy, "profileImage": profileImage.asset->url },
      metaTitle, metaDescription
    }`,
    { slug }
  );
}

// Comparison page queries
export async function getAllComparisonSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "comparisonPage" && defined(slug.current)].slug.current`
  );
}
export async function getAllComparisonPages() {
  return client.fetch(
    `*[_type == "comparisonPage" && hidden != true] | order(title asc){
      _id, title, "slug": slug.current,
      competitor1Name, competitor2Name,
      "thumbnail": thumbnail.asset->url,
      "competitor1Logo": competitor1Logo.asset->url,
      "competitor2Logo": competitor2Logo.asset->url
    }`
  );
}
export async function getComparisonPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "comparisonPage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, hidden, author,
      publishedDate, publishedDateText, enableLayout2,
      "thumbnail": thumbnail.asset->url,
      competitor1Name, "competitor1Logo": competitor1Logo.asset->url,
      competitor2Name, "competitor2Logo": competitor2Logo.asset->url,
      criteria[]{
        _key, title, description, winnerC1, result,
        competitor1{
          score, title, "video": video.asset->url, youtubeUrl,
          tags[]{ label, color }
        },
        competitor2{
          score, title, "video": video.asset->url, youtubeUrl,
          tags[]{ label, color }
        }
      },
      pricing[]{ c1Name, c1Price, c1Users, c2Name, c2Price, c2Users },
      overview, summaryPointers,
      testimonial{ name, role, company, title, subCopy, "profileImage": profileImage.asset->url },
      faq[]{ question, answer },
      highlights[]{
        title, subText, "image": image.asset->url,
        videoLink, "videoFile": videoFile.asset->url
      },
      caseStudy{ title, challenges, link },
      layout2Testimonial{ name, role, company, title, subCopy, "profileImage": profileImage.asset->url },
      metaTitle, metaDescription, noIndex
    }`,
    { slug }
  );
}

// Checklist page queries (root-level /[slug], handled by app/(features)/[slug])
export type ChecklistListItem = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
};

export async function getAllChecklistSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "checklistPage" && defined(slug.current)].slug.current`
  );
}

export async function getAllChecklistListItems(): Promise<ChecklistListItem[]> {
  return client.fetch(
    `*[_type == "checklistPage" && defined(slug.current) && hidden != true] | order(title asc) {
      _id,
      "slug": slug.current,
      title,
      description,
      category,
      "thumbnail": thumbnail.asset->url
    }`
  );
}

export async function getChecklistPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "checklistPage" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, category, hidden,
      "thumbnail": thumbnail.asset->url,
      hero,
      mainSection{ "image": image.asset->url, subText, caption },
      whatTitle, whatDescription, howTitle, howDescription,
      sections[]{ title, description, buttonText, buttonAction, tips[]{ title, description } },
      endNote,
      // NOTE: href is CMS-authored and may be relative; any future renderer
      // MUST normalize it via toInternalHref (see lib/links.ts).
      suggestedChecklists[]{ name, bgColor, href },
      metaTitle, metaDescription, noIndex
    }`,
    { slug }
  );
}

// Review page queries (/<feature>-review)
export async function getAllReviewSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "reviewPage" && defined(slug.current)].slug.current`
  );
}

export async function getReviewPageBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "reviewPage" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      feature,
      hero {
        headlineLine1,
        subheading,
        personaLeft { label, color },
        personaRight { label, color },
        primaryCta,
        secondaryCta,
        "heroMediaSrc": heroMedia.asset->url
      },
      featureCards {
        eyebrow,
        heading,
        cards[] {
          "type": cardType,
          iconType,
          title,
          titleLine1,
          titleLine2,
          subtitle,
          "imageSrc": image.asset->url,
          imageAspectRatio,
          cursors[] {
            side,
            label,
            color,
            textColor,
            topPct
          }
        },
        integrationLogos[] {
          name,
          href,
          "logoSrc": logo.asset->url
        },
        integrationsCtaLabel,
        integrationsCtaHref
      },
      websiteFuture {
        headingLine1,
        subheading,
        tabs[] {
          label,
          iconName,
          "imageSrc": image.asset->url
        }
      },
      websiteInstall {
        headingLine1,
        headingLine2,
        subheading,
        "logosSrc": logos.asset->url
      },
      collaborationTools {
        headingLine1,
        headingLine2,
        cards[] {
          title,
          body,
          "iconSrc": icon.asset->url,
          "previewSrc": preview.asset->url
        },
        ctaLabel,
        ctaHref
      },
      faqFormatsAnswer,
      metaTitle,
      metaDescription,
      "ogImage": ogImage.asset->url
    }
  `,
    { slug }
  );
}

// Feature page queries (/preview/features/<slug>) — new 2026 template that
// reuses the home-2026 sections. Separate from reviewPage; legacy pages are
// left untouched.
export async function getAllFeatureSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "featurePage" && defined(slug.current)].slug.current`
  );
}

export async function getFeaturePageBySlug(slug: string) {
  return client.fetch(
    `
    *[_type == "featurePage" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      hero {
        headlineLines,
        subhead,
        showcase,
        tabs[]{ label, icon }
      },
      solution {
        heading,
        subheading,
        variant,
        icon
      },
      featureSet {
        headerTitle,
        journeyStart,
        journeyEnd,
        blocks[] {
          "id": _key,
          title,
          description,
          icon,
          accent,
          mock,
          initialTabIndex,
          tabs[] {
            label,
            icon,
            oneLiner,
            loss,
            href,
            listOnly,
            collapsesFirstTab,
            mock
          }
        }
      },
      getStarted {
        heading,
        subheading,
        steps[] {
          title,
          description,
          accent
        }
      },
      relatedCapabilities {
        heading,
        boundaryLine,
        items[] {
          title,
          description,
          href,
          icon
        }
      },
      faq {
        heading,
        items[] {
          question,
          answer
        }
      },
      metaTitle,
      metaDescription,
      "ogImage": ogImage.asset->url
    }
  `,
    { slug }
  );
}

// Integration preview page queries (/preview/integrations + /preview/integrations/<slug>)
// New 2026 template that reuses the home-2026 sections, mirroring the feature
// pages. Deliberately separate from the legacy `integrationPage` type and its
// getIntegrationPageBySlug / getAllIntegrationSlugs helpers above, which are
// left untouched.

/**
 * Integration preview pages that are seeded in Sanity but not yet shipped, so
 * they must not be reachable (the catalog rule: "omit until shipped"). Every
 * integration-preview query filters these out: the detail route 404s, the
 * hub's ItemList JSON-LD skips them, and generateStaticParams never emits
 * them. Ship one by deleting its slug from this list.
 */
const OMITTED_INTEGRATION_SLUGS: readonly string[] = [
  "figma",
  "api",
  "webhooks",
  "rest-api",
];

/** Shared projection for an integration preview detail document. */
const INTEGRATION_PREVIEW_PAGE_PROJECTION = `
  _id,
  title,
  "slug": slug.current,
  family,
  cardBlurb,
  hero {
    kicker,
    headlineLines,
    subhead,
    showcase,
    tabs[]{ label, icon }
  },
  solution {
    heading,
    subheading,
    variant
  },
  featureSet {
    headerTitle,
    journeyStart,
    journeyEnd,
    blocks[] {
      "id": _key,
      title,
      description,
      icon,
      accent,
      mock,
      initialTabIndex,
      tabs[] {
        label,
        icon,
        oneLiner,
        loss,
        href,
        listOnly,
        collapsesFirstTab,
        mock
      }
    }
  },
  getStarted {
    heading,
    subheading,
    steps[] {
      title,
      description,
      accent
    }
  },
  faq {
    heading,
    items[] {
      question,
      answer
    }
  },
  metaTitle,
  metaDescription,
  "ogImage": ogImage.asset->url
`;

export async function getAllIntegrationPreviewSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "integrationPreviewPage" && defined(slug.current)
        && !(slug.current in $omitted)].slug.current`,
    { omitted: OMITTED_INTEGRATION_SLUGS }
  );
}

export async function getIntegrationPreviewPageBySlug(slug: string) {
  return client.fetch(
    `*[_type == "integrationPreviewPage" && slug.current == $slug
        && !(slug.current in $omitted)][0] {
      ${INTEGRATION_PREVIEW_PAGE_PROJECTION}
    }`,
    { slug, omitted: OMITTED_INTEGRATION_SLUGS }
  );
}

/** Lightweight catalog entries for the hub, ordered by title. */
export async function getAllIntegrationPreviewsForHub() {
  return client.fetch(
    `*[_type == "integrationPreviewPage" && defined(slug.current)
        && !(slug.current in $omitted)] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      family,
      cardBlurb
    }`,
    { omitted: OMITTED_INTEGRATION_SLUGS }
  );
}

/** The single hub document that drives /preview/integrations. */
export async function getIntegrationPreviewHub() {
  return client.fetch(
    `*[_type == "integrationPreviewHub"][0] {
      _id,
      title,
      hero {
        kicker,
        headlineLines,
        subhead,
        showcase,
        tabs[]{ label, icon }
      },
      solution {
        heading,
        subheading,
        variant
      },
      catalog {
        headerTitle,
        journeyStart,
        journeyEnd,
        blocks[] {
          "id": _key,
          title,
          description,
          icon,
          accent,
          mock,
          initialTabIndex,
          tabs[] {
            label,
            icon,
            oneLiner,
            loss,
            href,
            listOnly,
            collapsesFirstTab,
            mock
          }
        }
      },
      faq {
        heading,
        items[] {
          question,
          answer
        }
      },
      metaTitle,
      metaDescription,
      "ogImage": ogImage.asset->url
    }`
  );
}

// ---------------------------------------------------------------------------
// comparisonPreview* — the /preview/comparison pages (three new 2026 classes).
// Isolated from the legacy comparisonPage/alternativePage queries above.
// ---------------------------------------------------------------------------

const COMPARISON_PREVIEW_TYPES = [
  "comparisonPreviewVsPage",
  "comparisonPreviewArbiterPage",
  "comparisonPreviewAlternativesPage",
] as const;

const COMPARISON_PREVIEW_SHARED_FIELDS = `
  _id,
  _type,
  title,
  "slug": slug.current,
  kicker,
  headline,
  faq[]{ question, answer },
  related[]{ label, href },
  factsCheckedAt,
  sourceUrls,
  metaTitle,
  metaDescription
`;

const COMPARISON_PREVIEW_DIMENSION_FIELDS = `
  number,
  label,
  framing,
  leftFacts,
  rightFacts,
  leftVerified,
  rightVerified,
  verdict
`;

const COMPARISON_PREVIEW_SCORECARD_FIELDS = `
  label,
  leftCell,
  rightCell
`;

/** All published preview-comparison slugs across the three class types. */
export async function getAllComparisonPreviewSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type in $types && defined(slug.current)].slug.current`,
    { types: [...COMPARISON_PREVIEW_TYPES] }
  );
}

/** Lightweight entries for the /preview/comparison hub, grouped client-side. */
export async function getAllComparisonPreviewsForHub() {
  return client.fetch(
    `*[_type in $types && defined(slug.current)] | order(title asc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      metaDescription
    }`,
    { types: [...COMPARISON_PREVIEW_TYPES] }
  );
}

/**
 * One preview-comparison document by slug, whichever of the three class
 * types owns it. The `_type` field tells the route which body to render.
 */
export async function getComparisonPreviewBySlug(slug: string) {
  return client.fetch(
    `*[_type in $types && slug.current == $slug][0] {
      ${COMPARISON_PREVIEW_SHARED_FIELDS},
      _type == "comparisonPreviewVsPage" => {
        competitorName,
        grantedNoun,
        secondary,
        prevents,
        qualifier,
        heroCaption,
        dimensions[]{ ${COMPARISON_PREVIEW_DIMENSION_FIELDS} },
        scorecardKicker,
        scorecard[]{ ${COMPARISON_PREVIEW_SCORECARD_FIELDS} },
        pricingCompetitor,
        pricingSuperflow,
        switchingLines,
        honestCloseStrengths,
        stayLine,
        fieldLink{ label, href }
      },
      _type == "comparisonPreviewArbiterPage" => {
        toolLeftName,
        toolRightName,
        standfirst,
        disclosure,
        dateline,
        shortAnswerPickLeft,
        shortAnswerPickRight,
        shortAnswerShared,
        dimensions[]{ ${COMPARISON_PREVIEW_DIMENSION_FIELDS} },
        scorecard[]{ ${COMPARISON_PREVIEW_SCORECARD_FIELDS} },
        pricingNote,
        thirdOptionBody,
        thirdOptionLinks[]{ label, href }
      },
      _type == "comparisonPreviewAlternativesPage" => {
        anchorName,
        standfirst,
        dateline,
        criteria[]{ label, line },
        superflowHeadline,
        superflowBody,
        superflowBestFor,
        superflowScorecard[]{ ${COMPARISON_PREVIEW_SCORECARD_FIELDS} },
        superflowHonestLimit,
        superflowLinks[]{ label, href },
        entries[]{ name, bestFor, standout, limits, vsAnchor },
        stayHeading,
        stayBody,
        stayLine,
        finalCtaHeadline
      }
    }`,
    { slug, types: [...COMPARISON_PREVIEW_TYPES] }
  );
}

/** The single hub document that drives /preview/comparison. */
export async function getComparisonPreviewHub() {
  return client.fetch(
    `*[_type == "comparisonPreviewHub"][0] {
      _id,
      title,
      kicker,
      headline,
      subhead,
      metaTitle,
      metaDescription
    }`
  );
}

// ---------------------------------------------------------------- Bug Book


const BUG_BOOK_LIST_FIELDS = `
  _id,
  "slug": slug.current,
  source,
  sourceLabel,
  agentName,
  vibe,
  sassType,
  pullQuote,
  pullQuoteSpeaker,
  category,
  severity,
  rageLevel,
  status,
  date,
  "siteDescriptor": site.descriptor,
  "sitePlatform": site.platform,
  headline,
  hook,
  flags,
  curatedRank
`;

/** Every live (`tier == "page"`) entry, in curated order. */
export async function getAllBugBookEntries(): Promise<BugBookListEntry[]> {
  return client.fetch(`
    *[_type == "bugBookEntry" && tier == "page"] | order(curatedRank asc) {
      ${BUG_BOOK_LIST_FIELDS}
    }
  `);
}

export async function getAllBugBookSlugs(): Promise<string[]> {
  return client.fetch(
    `*[_type == "bugBookEntry" && tier == "page" && defined(slug.current)].slug.current`
  );
}

/**
 * One live entry with the full thread/finding payload. Bench entries
 * intentionally return null — the route redirects misses to /bug-book.
 */
export async function getBugBookEntryBySlug(
  slug: string
): Promise<BugBookEntryDetail | null> {
  return client.fetch(
    `
    *[_type == "bugBookEntry" && tier == "page" && slug.current == $slug][0] {
      ${BUG_BOOK_LIST_FIELDS},
      site{ descriptor, platform },
      captured{ browser, os, device },
      thread[]{ speaker, text, attachment },
      finding{ title, description, suggestion, issueType, confidence },
      whyItMatters,
      outcome
    }
  `,
    { slug }
  );
}

/**
 * Illustrative agent reports for the "New agents on the beat" band.
 * Kept out of the entry queries on purpose - they are never routed,
 * indexed, or mixed into the collection grid.
 */
export async function getBugBookSamples(): Promise<BugBookSample[]> {
  return client.fetch(`
    *[_type == "bugBookSample"] | order(order asc) {
      _id,
      "slug": slug.current,
      sourceLabel,
      agentName,
      category,
      severity,
      headline,
      hook,
      finding{ title, description, suggestion, issueType, confidence },
      whyItMatters,
      note
    }
  `);
}
