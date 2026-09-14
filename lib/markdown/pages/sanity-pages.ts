// Builds an AgentDoc from each Sanity-backed page type.
//
// One builder per document type, because the types do not share a content
// model: a comparison page is a scorecard, a bug-book entry is an incident
// report, a feature page is a capability tour. Flattening all of them through
// one generic walker would produce a document that says nothing specific about
// any of them, which is the failure mode this whole feature exists to avoid.
//
// Every builder follows the same rule: keep what distinguishes this page,
// drop what every page repeats. Headline copy, CTA labels, image assets, tab
// icons, accent colours, and layout flags are dropped. Facts, verdicts,
// steps, limits, prices, and FAQ answers are kept.

import type { AgentDoc, AgentDocFaq, AgentDocSection } from "../types";
import { portableTextToMarkdown, portableTextToPlain } from "../portable-text";
import {
  clean,
  cleanMultiline,
  firstOf,
  isoDate,
  joinLines,
  titleFromSlug,
} from "../text";
import { type Doc, arr, rec, str, strs } from "./read";

/** Pulls `faq[]{question, answer}`, the shape most templates share. */
function faqOf(value: unknown): AgentDocFaq[] {
  try {
    return arr(value)
      .map((item) => ({
        question: clean(str(item, "question")),
        answer: cleanMultiline(str(item, "answer")),
      }))
      .filter((item) => item.question && item.answer);
  } catch {
    return [];
  }
}

/**
 * Renders one side of a comparison dimension.
 *
 * `leftFacts`/`rightFacts` are string ARRAYS (one claim per sentence), and the
 * matching `leftVerified`/`rightVerified` is a free-text note like
 * "verified July 2026" rather than a boolean - so an absent note means the
 * claim was not independently checked, and that is worth saying out loud on a
 * page whose whole value is that its facts are dated.
 */
function facts(value: unknown, verified: unknown): string {
  try {
    const claims = strs(value).map((claim) => clean(claim)).filter(Boolean);
    if (claims.length === 0) return "";
    const note = clean(verified);
    const suffix = note ? ` (${note})` : verified === false ? " (unverified)" : "";
    return `${claims.join(" ")}${suffix}`;
  } catch {
    return "";
  }
}

/** Drops empty sections so a sparsely-filled document stays readable. */
function sections(...candidates: (AgentDocSection | null)[]): AgentDocSection[] {
  return candidates.filter((section): section is AgentDocSection => {
    if (!section) return false;
    const hasBody = (section.body ?? []).some((text) => clean(text));
    const hasBullets = (section.bullets ?? []).some((text) => clean(text));
    const hasSteps = (section.steps ?? []).some((text) => clean(text));
    const hasTable = (section.table?.rows ?? []).length > 0;
    return hasBody || hasBullets || hasSteps || hasTable;
  });
}

/** Renders Portable Text, falling back to a plain string field. */
function richText(value: unknown): string {
  try {
    if (typeof value === "string") return cleanMultiline(value);
    return portableTextToMarkdown(value);
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// featurePage - /<slug>
// ---------------------------------------------------------------------------

/**
 * A feature page is a capability tour: a headline promise, a set of blocks
 * that each name a job the feature does, and a getting-started sequence.
 * The blocks are the substance, so they become a table of capability plus
 * what it replaces rather than a wall of marketing paragraphs.
 */
export function featureToAgentDoc(doc: Doc): AgentDoc {
  const slug = str(doc, "slug");
  const hero = rec(doc.hero);
  const solution = rec(doc.solution);
  const featureSet = rec(doc.featureSet);
  const getStarted = rec(doc.getStarted);
  const related = rec(doc.relatedCapabilities);

  const blocks = arr(featureSet.blocks);
  const capabilityRows = blocks
    .map((block) => {
      const tabs = arr(block.tabs);
      // `loss` is what the team loses without this - the most useful single
      // sentence on the page for a machine weighing the product.
      const cost = firstOf(...tabs.map((tab) => str(tab, "loss")));
      return [
        clean(str(block, "title")),
        clean(str(block, "description")),
        cost,
      ];
    })
    .filter((row) => row[0]);

  const capabilityDetail = blocks.flatMap((block) => {
    const title = clean(str(block, "title"));
    const tabs = arr(block.tabs)
      .map((tab) => {
        const label = clean(str(tab, "label"));
        const oneLiner = clean(str(tab, "oneLiner"));
        return label && oneLiner ? `**${title}: ${label}.** ${oneLiner}` : "";
      })
      .filter(Boolean);
    return tabs;
  });

  const steps = arr(getStarted.steps)
    .map((step) => {
      const title = clean(str(step, "title"));
      const description = clean(str(step, "description"));
      if (!title) return "";
      return `**${title}.** ${description}`;
    })
    .filter(Boolean);

  const journeyStart = clean(str(featureSet, "journeyStart"));
  const journeyEnd = clean(str(featureSet, "journeyEnd"));
  const journeyLine =
    journeyStart && journeyEnd
      ? `${firstOf(str(featureSet, "headerTitle"), "Superflow gets you from")} ${journeyStart} to ${journeyEnd}.`
      : clean(str(featureSet, "headerTitle"));

  return {
    title: firstOf(str(doc, "title"), titleFromSlug(slug)),
    summary: firstOf(
      str(doc, "metaDescription"),
      str(hero, "subhead"),
      str(solution, "subheading"),
    ),
    path: `/${slug}`,
    kind: "Feature page",
    facts: [
      { label: "Feature", value: firstOf(str(doc, "title"), titleFromSlug(slug)) },
      { label: "Promise", value: joinLines(hero.headlineLines) },
      { label: "Capabilities documented", value: blocks.length ? String(blocks.length) : "" },
    ],
    sections: sections(
      {
        heading: "What this does",
        body: [
          firstOf(str(hero, "subhead"), str(doc, "metaDescription")),
          clean(str(solution, "heading")),
          clean(str(solution, "subheading")),
        ],
      },
      {
        heading: "Capabilities",
        // headerTitle is a layout fragment ("Superflow gets you from"), which
        // the journey labels complete. Rendered alone it is not a sentence.
        body: [journeyLine],
        table: capabilityRows.length
          ? {
              headers: ["Capability", "What it does", "What it replaces"],
              rows: capabilityRows,
            }
          : undefined,
      },
      {
        heading: "Detail",
        bullets: capabilityDetail,
      },
      {
        heading: "How to start",
        body: [clean(str(getStarted, "subheading"))],
        steps,
      },
    ),
    faq: faqOf(rec(doc.faq).items),
    related: arr(related.items)
      .map((item) => ({
        title: clean(str(item, "title")),
        path: clean(str(item, "href")),
        note: clean(str(item, "description")),
      }))
      .filter((link) => link.title && link.path.startsWith("/")),
  };
}

// ---------------------------------------------------------------------------
// reviewPage - /<slug>
// ---------------------------------------------------------------------------

/**
 * A review page covers one asset type Superflow can review (images, video,
 * PDFs, websites). The useful facts are the asset type itself, what the
 * reviewer can do to it, and which tools the comments sync to.
 */
export function reviewToAgentDoc(doc: Doc): AgentDoc {
  const slug = str(doc, "slug");
  const hero = rec(doc.hero);
  const featureCards = rec(doc.featureCards);
  const websiteFuture = rec(doc.websiteFuture);
  const collaboration = rec(doc.collaborationTools);

  const capabilities = arr(featureCards.cards)
    .map((card) => {
      const title = firstOf(
        str(card, "title"),
        [clean(str(card, "titleLine1")), clean(str(card, "titleLine2"))]
          .filter(Boolean)
          .join(" "),
      );
      const subtitle = clean(str(card, "subtitle"));
      if (!title) return "";
      return subtitle ? `**${title}.** ${subtitle}` : `**${title}.**`;
    })
    .filter(Boolean);

  const surfaces = arr(websiteFuture.tabs)
    .map((tab) => clean(str(tab, "label")))
    .filter(Boolean);

  const integrations = arr(featureCards.integrationLogos)
    .map((logo) => clean(str(logo, "name")))
    .filter(Boolean);

  const collaborationRows = arr(collaboration.cards)
    .map((card) => [clean(str(card, "title")), clean(str(card, "body"))])
    .filter((row) => row[0]);

  return {
    title: firstOf(str(doc, "title"), titleFromSlug(slug)),
    summary: firstOf(str(doc, "metaDescription"), str(hero, "subheading")),
    path: `/${slug}`,
    kind: "Review surface page",
    facts: [
      { label: "Asset type reviewed", value: firstOf(str(doc, "feature"), titleFromSlug(slug)) },
      { label: "Promise", value: clean(str(hero, "headlineLine1")) },
      { label: "Surfaces covered", value: surfaces.join(", ") },
      { label: "Syncs with", value: integrations.join(", ") },
    ],
    sections: sections(
      {
        heading: "What this does",
        body: [firstOf(str(hero, "subheading"), str(doc, "metaDescription"))],
      },
      {
        heading: "What a reviewer can do",
        body: [clean(str(featureCards, "heading"))],
        bullets: capabilities,
      },
      {
        heading: "Where comments go",
        table: collaborationRows.length
          ? { headers: ["Destination", "What happens"], rows: collaborationRows }
          : undefined,
      },
      {
        heading: "Supported formats",
        body: [cleanMultiline(str(doc, "faqFormatsAnswer"))],
      },
    ),
  };
}

// ---------------------------------------------------------------------------
// checklistPage - /<slug>
// ---------------------------------------------------------------------------

/**
 * A checklist page is the one type where the page body IS the payload: the
 * checks themselves. They are kept in full, as a nested list, because a
 * summarised checklist is not a checklist.
 */
export function checklistToAgentDoc(doc: Doc): AgentDoc {
  const slug = str(doc, "slug");
  const checkSections = arr(doc.sections);

  const bullets: string[] = [];
  for (const section of checkSections) {
    const title = clean(str(section, "title"));
    if (title) bullets.push(`**${title}**`);
    const description = clean(str(section, "description"));
    if (description) bullets.push(`  ${description}`);
    for (const tip of arr(section.tips)) {
      const tipTitle = clean(str(tip, "title"));
      const tipBody = clean(str(tip, "description"));
      if (!tipTitle) continue;
      bullets.push(`  - ${tipTitle}${tipBody ? `: ${tipBody}` : ""}`);
    }
  }

  return {
    title: firstOf(str(doc, "title"), titleFromSlug(slug)),
    summary: firstOf(str(doc, "metaDescription"), str(doc, "description")),
    path: `/${slug}`,
    kind: "Checklist",
    facts: [
      { label: "Category", value: clean(str(doc, "category")) },
      { label: "Sections", value: checkSections.length ? String(checkSections.length) : "" },
    ],
    sections: sections(
      {
        heading: "What this covers",
        body: [
          cleanMultiline(str(doc, "description")),
          clean(str(doc, "whatDescription")),
        ],
      },
      { heading: "How to use it", body: [clean(str(doc, "howDescription"))] },
      { heading: "The checklist", bullets },
      { heading: "Notes", body: [richText(doc.endNote)] },
    ),
    related: arr(doc.suggestedChecklists)
      .map((item) => ({
        title: clean(str(item, "name")),
        path: clean(str(item, "href")),
      }))
      .filter((link) => link.title && link.path.startsWith("/")),
  };
}

// ---------------------------------------------------------------------------
// blogPost - /blog/<slug>
// ---------------------------------------------------------------------------

/**
 * A blog post is already prose written to be read, so this is the one type
 * that is transcribed close to whole. The rewrite is in the framing: an agent
 * is told it is opinion with a date and an author, not product documentation.
 */
export function blogToAgentDoc(doc: Doc): AgentDoc {
  const slug = str(doc, "slug");
  const author = rec(doc.author);
  const body = portableTextToMarkdown(doc.body);

  const summary = firstOf(str(doc, "metaDescription"), str(doc, "description"));
  const description = cleanMultiline(str(doc, "description"));
  // The blockquote under the H1 already carries this on most posts; repeating
  // it verbatim as a "Summary" section wastes the first thing a reader sees.
  const standalone = description && description !== clean(summary) ? description : "";

  return {
    title: firstOf(str(doc, "title"), titleFromSlug(slug)),
    summary,
    path: `/blog/${slug}`,
    kind: "Blog post",
    updatedAt: isoDate(str(doc, "_updatedAt")),
    facts: [
      { label: "Author", value: clean(str(author, "name")) },
      { label: "Author role", value: clean(str(author, "role")) },
      { label: "Published", value: isoDate(str(doc, "publishedAt")) },
      { label: "Category", value: firstOf(str(doc, "categoryLabel"), str(doc, "category")) },
      { label: "Read time", value: clean(str(doc, "readTime")) },
      { label: "Tags", value: strs(doc.tags).join(", ") },
    ],
    sections: sections(
      { heading: "Summary", body: [standalone] },
      { heading: "Full text", body: [body] },
    ),
    faq: faqOf(rec(doc.faqSchema).items ?? doc.faqSchema),
  };
}

// ---------------------------------------------------------------------------
// integrationPreviewPage - /integrations/<slug>
// ---------------------------------------------------------------------------

/**
 * An integration page answers one question: what moves between Superflow and
 * this tool, in which direction. That is the fact worth extracting.
 */
export function integrationToAgentDoc(doc: Doc): AgentDoc {
  const slug = str(doc, "slug");
  const hero = rec(doc.hero);
  const solution = rec(doc.solution);
  const featureSet = rec(doc.featureSet);
  const getStarted = rec(doc.getStarted);

  const behaviours = arr(featureSet.blocks)
    .map((block) => [clean(str(block, "title")), clean(str(block, "description"))])
    .filter((row) => row[0]);

  const steps = arr(getStarted.steps)
    .map((step) => {
      const title = clean(str(step, "title"));
      if (!title) return "";
      return `**${title}.** ${clean(str(step, "description"))}`;
    })
    .filter(Boolean);

  return {
    title: firstOf(str(doc, "title"), `${titleFromSlug(slug)} integration`),
    summary: firstOf(
      str(doc, "metaDescription"),
      str(doc, "cardBlurb"),
      str(hero, "subhead"),
    ),
    path: `/integrations/${slug}`,
    kind: "Integration page",
    facts: [
      { label: "Integrates with", value: titleFromSlug(slug) },
      { label: "Family", value: clean(str(doc, "family")) },
      { label: "Summary", value: clean(str(doc, "cardBlurb")) },
    ],
    sections: sections(
      {
        heading: "What this integration does",
        body: [
          firstOf(str(hero, "subhead"), str(doc, "cardBlurb")),
          clean(str(solution, "subheading")),
        ],
      },
      {
        heading: "Behaviour",
        table: behaviours.length
          ? { headers: ["Capability", "What it does"], rows: behaviours }
          : undefined,
      },
      { heading: "How to set it up", steps },
    ),
    faq: faqOf(rec(doc.faq).items),
  };
}

// ---------------------------------------------------------------------------
// useCasePage - /use-case/<slug>
// ---------------------------------------------------------------------------

/**
 * A use-case page is a problem/solution pair. Both halves are kept.
 *
 * Named against the `<thing>ToAgentDoc` pattern the rest of this file follows:
 * `useCaseToAgentDoc` reads as a React hook to eslint-plugin-react-hooks,
 * which keys purely on the `use` prefix, and this is a plain data mapper in a
 * module with no React in it.
 */
export function toUseCaseAgentDoc(doc: Doc): AgentDoc {
  const slug = str(doc, "slug");
  const problem = rec(doc.problemSection);
  const solution = rec(doc.solutionSection);

  const problems = arr(problem.items)
    .map((item) => clean(str(item, "title")))
    .filter(Boolean);

  const solutions = arr(solution.items)
    .map((item) => {
      const title = clean(str(item, "title"));
      const sub = clean(str(item, "subCopy"));
      if (!title) return "";
      return sub ? `**${title}.** ${sub}` : `**${title}.**`;
    })
    .filter(Boolean);

  return {
    title: firstOf(str(doc, "title"), titleFromSlug(slug)),
    summary: firstOf(str(doc, "metaDescription"), str(doc, "description")),
    path: `/use-case/${slug}`,
    kind: "Use case",
    facts: [
      { label: "Use case", value: firstOf(str(doc, "useCase"), str(doc, "title")) },
    ],
    sections: sections(
      { heading: "What this covers", body: [cleanMultiline(str(doc, "description"))] },
      {
        heading: "The problem",
        body: [
          [clean(str(problem, "title1")), clean(str(problem, "title2"))]
            .filter(Boolean)
            .join(" "),
        ],
        bullets: problems,
      },
      {
        heading: "How Superflow handles it",
        body: [
          [clean(str(solution, "title1")), clean(str(solution, "title2"))]
            .filter(Boolean)
            .join(" "),
        ],
        bullets: solutions,
      },
    ),
    faq: faqOf(doc.faq),
  };
}

// ---------------------------------------------------------------------------
// caseStudyPage - /case-study/<slug>
// ---------------------------------------------------------------------------

/**
 * A case study is evidence. The results are the evidence, so they lead and
 * are rendered as a metric table rather than buried in prose.
 */
export function caseStudyToAgentDoc(doc: Doc): AgentDoc {
  const slug = str(doc, "slug");
  const problem = rec(doc.problemSection);
  const solution = rec(doc.solutionSection);
  const results = rec(doc.resultsSection);
  const testimonial = rec(doc.testimonial);

  const resultRows = arr(results.items)
    .map((item) => [clean(str(item, "value")), clean(str(item, "text"))])
    .filter((row) => row[0] || row[1]);

  const quote = clean(str(testimonial, "subCopy")) || clean(str(testimonial, "title"));
  const attribution = [
    clean(str(testimonial, "name")),
    clean(str(testimonial, "role")),
    clean(str(testimonial, "company")),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    title: firstOf(str(doc, "title"), titleFromSlug(slug)),
    summary: firstOf(str(doc, "metaDescription"), str(doc, "description")),
    path: `/case-study/${slug}`,
    kind: "Case study",
    updatedAt: isoDate(str(doc, "_updatedAt")),
    facts: [
      { label: "Customer", value: clean(str(testimonial, "company")) },
      { label: "Published", value: clean(str(doc, "publishedDateText")) },
      { label: "Author", value: clean(str(doc, "author")) },
    ],
    sections: sections(
      {
        heading: "Results",
        body: [cleanMultiline(str(results, "description"))],
        table: resultRows.length
          ? { headers: ["Measure", "Result"], rows: resultRows }
          : undefined,
      },
      { heading: "Overview", body: [richText(doc.overview)] },
      {
        heading: "The problem",
        body: [cleanMultiline(str(problem, "description"))],
        bullets: arr(problem.items)
          .map((item) => clean(str(item, "text")))
          .filter(Boolean),
      },
      {
        heading: "What they did",
        body: [cleanMultiline(str(solution, "description"))],
        bullets: arr(solution.items)
          .map((item) => {
            const title = clean(str(item, "title"));
            const sub = clean(str(item, "subText"));
            if (!title) return "";
            return sub ? `**${title}.** ${sub}` : `**${title}.**`;
          })
          .filter(Boolean),
      },
      {
        heading: "In their words",
        body: quote ? [`> ${quote}`, attribution ? `- ${attribution}` : ""] : [],
      },
    ),
    faq: faqOf(doc.faq),
  };
}

// ---------------------------------------------------------------------------
// userPersonaPage - /user-persona/<slug>
// ---------------------------------------------------------------------------

/** A persona page maps a role to the jobs it does and what blocks them. */
export function personaToAgentDoc(doc: Doc): AgentDoc {
  const slug = str(doc, "slug");

  const jobs = arr(doc.jobs).flatMap((job) =>
    arr(job.features)
      .map((feature) => {
        const title = clean(str(feature, "highlightTitle"));
        const sub = clean(str(feature, "highlightSubText"));
        const barrier = clean(str(feature, "barrierText"));
        if (!title) return "";
        const parts = [sub, barrier ? `Without it: ${barrier}` : ""].filter(Boolean);
        return parts.length ? `**${title}.** ${parts.join(" ")}` : `**${title}.**`;
      })
      .filter(Boolean),
  );

  const featureRows = arr(doc.features)
    .map((feature) => [clean(str(feature, "title")), clean(str(feature, "subText"))])
    .filter((row) => row[0]);

  return {
    title: firstOf(str(doc, "title"), titleFromSlug(slug)),
    summary: firstOf(str(doc, "metaDescription"), str(doc, "outcomeOneLiner")),
    path: `/user-persona/${slug}`,
    kind: "Persona page",
    facts: [
      { label: "Role", value: firstOf(str(doc, "title"), titleFromSlug(slug)) },
      { label: "Outcome", value: clean(str(doc, "outcomeOneLiner")) },
    ],
    sections: sections(
      { heading: "Who this is for", body: [richText(doc.hero)] },
      { heading: "Jobs this role does", bullets: jobs },
      {
        heading: "What Superflow gives them",
        body: [
          [clean(str(doc, "solutionTitle1")), clean(str(doc, "solutionTitle2"))]
            .filter(Boolean)
            .join(" "),
        ],
        table: featureRows.length
          ? { headers: ["Capability", "What it does"], rows: featureRows }
          : undefined,
      },
    ),
    faq: faqOf(doc.faq),
  };
}

// ---------------------------------------------------------------------------
// alternativePage / comparisonPage (legacy) - /alternative|/comparisons/<slug>
// ---------------------------------------------------------------------------

/**
 * A head-to-head page. The criteria table is the whole document as far as a
 * machine is concerned: two named tools, one row per dimension, one verdict.
 */
export function headToHeadToAgentDoc(doc: Doc, basePath: string, kind: string): AgentDoc {
  const slug = str(doc, "slug");
  const left = firstOf(str(doc, "competitor1Name"), "Tool 1");
  const right = firstOf(str(doc, "competitor2Name"), "Tool 2");

  const criteriaRows = arr(doc.criteria)
    .map((item) => {
      const winner = item.winnerC1;
      const verdict =
        typeof winner === "boolean" ? (winner ? left : right) : clean(str(item, "result"));
      return [
        clean(str(item, "title")),
        clean(str(item, "description")),
        verdict,
      ];
    })
    .filter((row) => row[0]);

  const featureRows = arr(doc.features)
    .map((item) => [
      clean(str(item, "title")),
      clean(str(item, "c1Text")),
      clean(str(item, "c2Text")),
    ])
    .filter((row) => row[0]);

  const pricingRows = arr(doc.pricing)
    .map((item) => [
      clean(str(item, "c1Name")),
      [clean(str(item, "c1Price")), clean(str(item, "c1Users"))].filter(Boolean).join(" / "),
      clean(str(item, "c2Name")),
      [clean(str(item, "c2Price")), clean(str(item, "c2Users"))].filter(Boolean).join(" / "),
    ])
    .filter((row) => row[0] || row[2]);

  return {
    title: firstOf(str(doc, "title"), titleFromSlug(slug)),
    summary: firstOf(str(doc, "metaDescription"), str(doc, "description")),
    path: `${basePath}/${slug}`,
    kind,
    facts: [
      { label: "Compares", value: [left, right].filter(Boolean).join(" vs ") },
      { label: "Published", value: clean(str(doc, "publishedDateText")) },
      { label: "Author", value: clean(str(doc, "author")) },
      {
        label: "Disclosure",
        value: "Published by Superflow. Superflow is one of the tools compared.",
      },
    ],
    sections: sections(
      { heading: "Overview", body: [richText(doc.overview)] },
      {
        heading: "Summary",
        bullets: strs(doc.summaryPointers),
      },
      {
        heading: "Verdict by criterion",
        table: criteriaRows.length
          ? { headers: ["Criterion", "What was assessed", "Winner"], rows: criteriaRows }
          : undefined,
      },
      {
        heading: "Feature comparison",
        table: featureRows.length
          ? { headers: ["Feature", left, right], rows: featureRows }
          : undefined,
      },
      {
        heading: "Pricing",
        table: pricingRows.length
          ? { headers: ["Plan", "Price", "Plan", "Price"], rows: pricingRows }
          : undefined,
      },
    ),
    faq: faqOf(doc.faq),
  };
}

// ---------------------------------------------------------------------------
// comparisonPreview* (2026 classes) - /comparisons|/alternative/<slug>
// ---------------------------------------------------------------------------

/**
 * The 2026 comparison classes. All three carry `dimensions` (a researched
 * claim per side, each flagged verified or not) and a scorecard, which is the
 * most machine-useful content on the site: sourced, dated, and attributed.
 * The verification flags and the fact-check date are preserved verbatim,
 * because a comparison an agent cannot date is a comparison it should not
 * repeat.
 */
export function comparisonPreviewToAgentDoc(doc: Doc, basePath: string): AgentDoc {
  const slug = str(doc, "slug");
  const type = str(doc, "_type");

  const isAlternatives = type === "comparisonPreviewAlternativesPage";
  const isArbiter = type === "comparisonPreviewArbiterPage";

  // COLUMN ORIENTATION IS NOT THE SAME IN BOTH TABLES.
  //
  // On a `vs` page the dimension cards put Superflow on the left and the
  // competitor on the right, while the scorecard table puts the competitor
  // left and Superflow right (see ComparisonVsPageBody.tsx, which passes
  // leftName/rightName the opposite way round to each component). Labelling
  // both tables from one pair of names would attribute every scorecard claim
  // to the wrong tool - the single worst thing a machine-readable copy of a
  // comparison page could do.
  const competitor = clean(str(doc, "competitorName"));
  const anchor = clean(str(doc, "anchorName"));
  const toolLeft = clean(str(doc, "toolLeftName"));
  const toolRight = clean(str(doc, "toolRightName"));

  const dimensionLeft = isArbiter ? toolLeft : "Superflow";
  const dimensionRight = isArbiter ? toolRight : competitor;

  const scorecardLeft = isArbiter ? toolLeft : isAlternatives ? anchor : competitor;
  const scorecardRight = isArbiter ? toolRight : "Superflow";

  // The pair named in the summary, for the key-facts table.
  const left = isArbiter ? toolLeft : isAlternatives ? anchor : "Superflow";
  const right = isArbiter ? toolRight : isAlternatives ? "Alternatives" : competitor;

  const dimensionRows = arr(doc.dimensions)
    .map((item) => [
      clean(str(item, "label")),
      facts(item.leftFacts, item.leftVerified),
      facts(item.rightFacts, item.rightVerified),
      clean(str(item, "verdict")),
    ])
    .filter((row) => row[0]);

  // Alternatives pages carry the scorecard under a different field name.
  const scorecard = arr(doc.scorecard).length
    ? arr(doc.scorecard)
    : arr(doc.superflowScorecard);
  const scorecardRows = scorecard
    .map((item) => [
      clean(str(item, "label")),
      clean(str(item, "leftCell")),
      clean(str(item, "rightCell")),
    ])
    .filter((row) => row[0]);

  const entryRows = arr(doc.entries)
    .map((item) => [
      clean(str(item, "name")),
      clean(str(item, "bestFor")),
      clean(str(item, "standout")),
      clean(str(item, "limits")),
    ])
    .filter((row) => row[0]);

  const criteria = arr(doc.criteria)
    .map((item) => {
      const label = clean(str(item, "label"));
      const line = clean(str(item, "line"));
      if (!label) return "";
      return line ? `**${label}.** ${line}` : `**${label}.**`;
    })
    .filter(Boolean);

  const checkedAt = isoDate(str(doc, "factsCheckedAt"));
  const sourceUrls = strs(doc.sourceUrls);

  return {
    title: firstOf(str(doc, "title"), str(doc, "headline"), titleFromSlug(slug)),
    summary: firstOf(
      str(doc, "metaDescription"),
      str(doc, "standfirst"),
      str(doc, "heroCaption"),
    ),
    path: `${basePath}/${slug}`,
    kind: isAlternatives
      ? "Alternatives listicle"
      : isArbiter
        ? "Third-party style comparison"
        : "Head-to-head comparison",
    updatedAt: checkedAt,
    facts: [
      { label: "Compares", value: [left, right].filter(Boolean).join(" vs ") },
      { label: "Facts checked on", value: checkedAt },
      { label: "Dateline", value: clean(str(doc, "dateline")) },
      {
        label: "Disclosure",
        value: firstOf(
          str(doc, "disclosure"),
          "Published by Superflow. Superflow is one of the tools compared.",
        ),
      },
    ],
    sections: sections(
      {
        heading: "Short answer",
        bullets: [
          clean(str(doc, "shortAnswerPickLeft")),
          clean(str(doc, "shortAnswerPickRight")),
          clean(str(doc, "shortAnswerShared")),
          clean(str(doc, "standfirst")),
        ].filter(Boolean),
      },
      { heading: "How these were judged", bullets: criteria },
      {
        heading: "Dimension by dimension",
        table: dimensionRows.length
          ? {
              headers: [
                "Dimension",
                dimensionLeft || "Left",
                dimensionRight || "Right",
                "Verdict",
              ],
              rows: dimensionRows,
            }
          : undefined,
      },
      {
        heading: "Scorecard",
        table: scorecardRows.length
          ? {
              headers: ["Measure", scorecardLeft || "Left", scorecardRight || "Right"],
              rows: scorecardRows,
            }
          : undefined,
      },
      {
        heading: "The alternatives",
        table: entryRows.length
          ? { headers: ["Tool", "Best for", "Standout", "Limits"], rows: entryRows }
          : undefined,
      },
      {
        heading: "Where Superflow fits",
        body: [
          clean(str(doc, "superflowHeadline")),
          cleanMultiline(str(doc, "superflowBody")),
          clean(str(doc, "superflowBestFor")),
          clean(str(doc, "superflowHonestLimit")),
          cleanMultiline(str(doc, "honestCloseStrengths")),
          cleanMultiline(str(doc, "thirdOptionBody")),
        ],
      },
      {
        heading: "Pricing",
        body: [
          cleanMultiline(str(doc, "pricingCompetitor")),
          cleanMultiline(str(doc, "pricingSuperflow")),
          cleanMultiline(str(doc, "pricingNote")),
        ],
      },
      { heading: "Sources", bullets: sourceUrls },
    ),
    faq: faqOf(doc.faq),
    related: arr(doc.related)
      .map((item) => ({
        title: clean(str(item, "label")),
        path: clean(str(item, "href")),
      }))
      .filter((link) => link.title && link.path.startsWith("/")),
  };
}

// ---------------------------------------------------------------------------
// bugBookEntry - /bug-book/<slug>
// ---------------------------------------------------------------------------

/**
 * A bug-book entry is an incident report: a real bug an agent found on a real
 * site, what it was, and why it mattered. Rendered as the report it is.
 */
export function bugBookToAgentDoc(doc: Doc): AgentDoc {
  const slug = str(doc, "slug");
  const finding = rec(doc.finding);
  const site = rec(doc.site);
  const captured = rec(doc.captured);

  const thread = arr(doc.thread)
    .map((turn) => {
      const speaker = clean(str(turn, "speaker"));
      const text = clean(str(turn, "text"));
      if (!text) return "";
      return speaker ? `**${speaker}:** ${text}` : text;
    })
    .filter(Boolean);

  return {
    title: firstOf(str(doc, "headline"), titleFromSlug(slug)),
    summary: firstOf(str(doc, "hook"), str(finding, "description")),
    path: `/bug-book/${slug}`,
    kind: "Bug Book entry",
    facts: [
      { label: "Agent", value: clean(str(doc, "agentName")) },
      { label: "Issue type", value: firstOf(str(finding, "issueType"), str(doc, "category")) },
      { label: "Severity", value: clean(str(doc, "severity")) },
      { label: "Confidence", value: clean(str(finding, "confidence")) },
      { label: "Status", value: clean(str(doc, "status")) },
      { label: "Site", value: firstOf(str(site, "descriptor"), str(doc, "siteDescriptor")) },
      { label: "Platform", value: firstOf(str(site, "platform"), str(doc, "sitePlatform")) },
      {
        label: "Captured on",
        value: [clean(str(captured, "browser")), clean(str(captured, "os")), clean(str(captured, "device"))]
          .filter(Boolean)
          .join(", "),
      },
      { label: "Date", value: isoDate(str(doc, "date")) },
    ],
    sections: sections(
      {
        heading: "The finding",
        body: [
          clean(str(finding, "title")),
          cleanMultiline(str(finding, "description")),
        ],
      },
      { heading: "Suggested fix", body: [cleanMultiline(str(finding, "suggestion"))] },
      { heading: "Why it matters", body: [cleanMultiline(str(doc, "whyItMatters"))] },
      { heading: "Outcome", body: [cleanMultiline(str(doc, "outcome"))] },
      { heading: "The thread", bullets: thread },
    ),
  };
}

// ---------------------------------------------------------------------------
// legacy integrationPage - /integrations/<slug> fallback
// ---------------------------------------------------------------------------

/** The pre-2026 integration template, still serving some slugs. */
export function legacyIntegrationToAgentDoc(doc: Doc): AgentDoc {
  const slug = str(doc, "slug");
  const steps = arr(doc.steps)
    .map((step) => {
      const title = clean(str(step, "title"));
      const body = portableTextToPlain(step.body) || clean(str(step, "body"));
      if (!title) return "";
      return `**${title}.** ${body}`;
    })
    .filter(Boolean);

  return {
    title: firstOf(str(doc, "title"), `${titleFromSlug(slug)} integration`),
    summary: firstOf(str(doc, "metaDescription"), str(doc, "description")),
    path: `/integrations/${slug}`,
    kind: "Integration page",
    facts: [
      { label: "Integrates with", value: firstOf(str(doc, "appName"), titleFromSlug(slug)) },
      { label: "App URL", value: clean(str(doc, "linkToApp")) },
      { label: "Task app", value: doc.isTaskApp === true ? "Yes" : "" },
    ],
    sections: sections(
      { heading: "What this integration does", body: [richText(doc.description)] },
      { heading: "Overview", body: [richText(doc.overview)] },
      { heading: "How to set it up", steps },
    ),
  };
}
