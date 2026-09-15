// Resolves a site path to its AgentDoc.
//
// The route order here MIRRORS the app router, and has to stay that way. In
// particular the root namespace (/<slug>) is shared by three Sanity document
// types and is resolved review -> checklist -> feature, exactly as
// app/(features)/[slug]/page.tsx resolves it. Any other order would serve one
// document's Markdown under another document's URL.

import type { AgentDoc } from "./types";
import { STATIC_AGENT_DOCS } from "./pages/static-pages";
import {
  blogToAgentDoc,
  bugBookToAgentDoc,
  caseStudyToAgentDoc,
  checklistToAgentDoc,
  comparisonPreviewToAgentDoc,
  featureToAgentDoc,
  headToHeadToAgentDoc,
  integrationToAgentDoc,
  legacyIntegrationToAgentDoc,
  personaToAgentDoc,
  reviewToAgentDoc,
  toUseCaseAgentDoc,
} from "./pages/sanity-pages";
import {
  agencyToAgentDocWithRelated,
  directoryCategoryToAgentDoc,
  directoryHubToAgentDoc,
} from "./pages/directory-pages";
import { type Doc, arr, rec, str } from "./pages/read";
import { shouldIndexAgency } from "@/lib/directory/agencies";
import { getEnrichedAgency } from "@/lib/directory/listing";
import {
  DIRECTORY_BASE_PATH,
  DIRECTORY_CATEGORIES,
} from "@/lib/directory/constants";
import { clean, titleFromSlug } from "./text";
import { isHeldIntegrationSlug } from "@/lib/integration-holds";
import {
  getAlternativePageBySlug,
  getAllBlogPosts,
  getAllBugBookEntries,
  getAllCaseStudyListItems,
  getAllChecklistListItems,
  getAllComparisonPreviewsForHub,
  getAllIntegrationPreviewsForHub,
  getAllUseCaseListItems,
  getAllUserPersonaPages,
  getBlogPostBySlug,
  getBugBookEntryBySlug,
  getCaseStudyPageBySlug,
  getChecklistPageBySlug,
  getComparisonPageBySlug,
  getComparisonPreviewBySlug,
  getFeaturePageBySlug,
  getIntegrationPageBySlug,
  getIntegrationPreviewPageBySlug,
  getReviewPageBySlug,
  getUseCasePageBySlug,
  getUserPersonaPageBySlug,
} from "@/sanity/lib/queries";

/** Runs a Sanity fetch, returning null rather than throwing. */
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

/** True when a GROQ `[0]` projection actually matched a document. */
function found(doc: unknown): doc is Doc {
  return Boolean(doc && typeof doc === "object" && !Array.isArray(doc));
}

/**
 * Normalises a request path: leading slash, no trailing slash, no query.
 * Returns null for anything that is not a plain site path.
 */
export function normalisePath(input: string): string | null {
  try {
    let path = input.split("?")[0].split("#")[0];
    if (!path.startsWith("/")) path = `/${path}`;
    path = path.replace(/\/+$/, "");
    if (path === "") path = "/";
    // Reject traversal and encoded separators outright rather than trying to
    // sanitise them: every legitimate path here is a plain slug.
    if (path.includes("..") || path.includes("%2F") || path.includes("%2f")) return null;
    if (!/^\/[A-Za-z0-9\-_/.]*$/.test(path)) return null;
    return path;
  } catch {
    return null;
  }
}

/** Builds a hub document: a short framing plus one line per child page. */
function hubDoc(input: {
  title: string;
  summary: string;
  path: string;
  kind: string;
  itemLabel: string;
  items: { title: string; path: string; note?: string }[];
}): AgentDoc {
  return {
    title: input.title,
    summary: input.summary,
    path: input.path,
    kind: input.kind,
    facts: [{ label: input.itemLabel, value: String(input.items.length) }],
    sections: [
      {
        heading: "What this index contains",
        body: [
          `Every entry below is a page on usesuperflow.ai. Each one also publishes a Markdown copy at its own path plus \`.md\`.`,
        ],
      },
    ],
    related: input.items,
  };
}

/** /blog */
async function blogHub(): Promise<AgentDoc> {
  const posts = arr(await safe(getAllBlogPosts));
  return hubDoc({
    title: "Superflow blog",
    summary:
      "Writing from the Superflow team on website QA, agency review workflows, and shipping web work faster.",
    path: "/blog",
    kind: "Blog index",
    itemLabel: "Posts",
    items: posts
      .map((post) => ({
        title: clean(str(post, "title")),
        path: `/blog/${str(post, "slug")}`,
        note: clean(str(post, "description")),
      }))
      .filter((item) => item.title && !item.path.endsWith("/")),
  });
}

/** /bug-book */
async function bugBookHub(): Promise<AgentDoc> {
  const entries = arr(await safe(getAllBugBookEntries));
  return hubDoc({
    title: "The Bug Book",
    summary:
      "Real bugs Superflow agents found on real sites, written up one incident at a time: what the agent saw, why it mattered, and what happened next.",
    path: "/bug-book",
    kind: "Collection index",
    itemLabel: "Entries",
    items: entries
      .map((entry) => ({
        title: clean(str(entry, "headline")),
        path: `/bug-book/${str(entry, "slug")}`,
        note: clean(str(entry, "hook")),
      }))
      .filter((item) => item.title && !item.path.endsWith("/")),
  });
}

/** /integrations */
async function integrationsHub(): Promise<AgentDoc> {
  const items = arr(await safe(getAllIntegrationPreviewsForHub));
  return hubDoc({
    title: "Superflow integrations",
    summary:
      "What Superflow connects to, and what moves in each direction. Comments and approvals sync two-way with the tools a team already runs.",
    path: "/integrations",
    kind: "Integration index",
    itemLabel: "Integrations",
    items: items
      .map((item) => ({
        title: clean(str(item, "title")),
        path: `/integrations/${str(item, "slug")}`,
        note: clean(str(item, "cardBlurb")),
      }))
      .filter((item) => item.title && !isHeldIntegrationSlug(item.path.split("/").pop() ?? "")),
  });
}

/** /case-study */
async function caseStudyHub(): Promise<AgentDoc> {
  const items = arr(await safe(getAllCaseStudyListItems));
  return hubDoc({
    title: "Superflow case studies",
    summary: "Teams using Superflow, and what changed in their review process.",
    path: "/case-study",
    kind: "Case study index",
    itemLabel: "Case studies",
    items: items
      .map((item) => ({
        title: clean(str(item, "title")),
        path: `/case-study/${str(item, "slug")}`,
        note: clean(str(item, "description")),
      }))
      .filter((item) => item.title),
  });
}

/** /checklist */
async function checklistHub(): Promise<AgentDoc> {
  const items = arr(await safe(getAllChecklistListItems));
  return hubDoc({
    title: "Superflow checklists",
    summary:
      "Checklists for shipping web work: what to verify before a page goes live, written so each item can become an agent.",
    path: "/checklist",
    kind: "Checklist index",
    itemLabel: "Checklists",
    items: items
      .map((item) => ({
        title: clean(str(item, "title")),
        // Checklists serve at the root, not under /checklist.
        path: `/${str(item, "slug")}`,
        note: clean(str(item, "description")),
      }))
      .filter((item) => item.title),
  });
}

/** /alternative and /comparisons share one catalog. */
async function comparisonHub(basePath: "/alternative" | "/comparisons"): Promise<AgentDoc> {
  const catalog = arr(await safe(getAllComparisonPreviewsForHub));
  const isAlternatives = basePath === "/alternative";
  const items = catalog
    .filter((item) =>
      isAlternatives
        ? str(item, "_type") === "comparisonPreviewAlternativesPage"
        : str(item, "_type") !== "comparisonPreviewAlternativesPage",
    )
    .map((item) => ({
      title: clean(str(item, "title")) || titleFromSlug(str(item, "slug")),
      path: `${basePath}/${str(item, "slug")}`,
    }))
    .filter((item) => item.title);

  return hubDoc({
    title: isAlternatives ? "Superflow alternatives" : "Superflow comparisons",
    summary: isAlternatives
      ? "Round-ups of tools in the website and creative review category, including where Superflow fits and where it does not."
      : "Head-to-head comparisons between Superflow and other review tools, with the facts dated and the sources listed.",
    path: basePath,
    kind: "Comparison index",
    itemLabel: "Pages",
    items,
  });
}

/** /use-case */
async function useCaseHub(): Promise<AgentDoc> {
  const items = arr(await safe(getAllUseCaseListItems));
  return hubDoc({
    title: "Superflow use cases",
    summary: "The jobs teams bring Superflow in to do, one page each.",
    path: "/use-case",
    kind: "Use case index",
    itemLabel: "Use cases",
    items: items
      .map((item) => ({
        title: clean(str(item, "title")),
        path: `/use-case/${str(item, "slug")}`,
        note: clean(str(item, "description")),
      }))
      .filter((item) => item.title),
  });
}

/** /user-persona */
async function personaHub(): Promise<AgentDoc> {
  const items = arr(await safe(getAllUserPersonaPages));
  return hubDoc({
    title: "Superflow by role",
    summary:
      "What Superflow does for each role on a web team: designers, developers, founders, QA, and the people who run the review.",
    path: "/user-persona",
    kind: "Persona index",
    itemLabel: "Roles",
    items: items
      .map((item) => ({
        title: clean(str(item, "title")),
        path: `/user-persona/${str(item, "slug")}`,
      }))
      .filter((item) => item.title),
  });
}

/** Hub paths that are generated rather than hand-authored. */
const HUBS: Record<string, () => Promise<AgentDoc>> = {
  "/blog": blogHub,
  "/bug-book": bugBookHub,
  "/integrations": integrationsHub,
  "/case-study": caseStudyHub,
  "/checklist": checklistHub,
  "/alternative": () => comparisonHub("/alternative"),
  "/comparisons": () => comparisonHub("/comparisons"),
  "/use-case": useCaseHub,
  "/user-persona": personaHub,
};

/** Resolves a two-segment path like /blog/<slug>. */
async function resolveNested(base: string, slug: string): Promise<AgentDoc | null> {
  switch (base) {
    case "blog": {
      const doc = await safe(() => getBlogPostBySlug(slug));
      return found(doc) ? blogToAgentDoc(doc) : null;
    }

    case "integrations": {
      if (isHeldIntegrationSlug(slug)) return null;
      const preview = await safe(() => getIntegrationPreviewPageBySlug(slug));
      if (found(preview)) return integrationToAgentDoc(preview);
      // The pre-2026 template still serves some slugs.
      const legacy = await safe(() => getIntegrationPageBySlug(slug));
      return found(legacy) ? legacyIntegrationToAgentDoc(legacy) : null;
    }

    case "use-case": {
      const doc = await safe(() => getUseCasePageBySlug(slug));
      return found(doc) ? toUseCaseAgentDoc(doc) : null;
    }

    case "case-study": {
      const doc = await safe(() => getCaseStudyPageBySlug(slug));
      return found(doc) ? caseStudyToAgentDoc(doc) : null;
    }

    case "user-persona": {
      const doc = await safe(() => getUserPersonaPageBySlug(slug));
      return found(doc) ? personaToAgentDoc(doc) : null;
    }

    case "bug-book": {
      const doc = await safe(() => getBugBookEntryBySlug(slug));
      return found(doc) ? bugBookToAgentDoc(doc) : null;
    }

    case "alternative":
    case "comparisons": {
      // 2026 classes first: both roots serve the new documents alongside the
      // legacy ones, and the new document wins where a slug exists in both.
      const preview = await safe(() => getComparisonPreviewBySlug(slug));
      if (found(preview)) return comparisonPreviewToAgentDoc(preview, `/${base}`);

      if (base === "alternative") {
        const legacy = await safe(() => getAlternativePageBySlug(slug));
        return found(legacy)
          ? headToHeadToAgentDoc(legacy, "/alternative", "Alternatives comparison")
          : null;
      }
      const legacy = await safe(() => getComparisonPageBySlug(slug));
      return found(legacy)
        ? headToHeadToAgentDoc(legacy, "/comparisons", "Head-to-head comparison")
        : null;
    }

    default:
      return null;
  }
}

/**
 * Resolves the directory routes, which are file-backed rather than CMS-backed:
 * /directory, /directory/<category>, and /directory/agency/<slug>.
 *
 * `shouldIndexAgency` gates the profiles, exactly as the HTML route does - a
 * record thin enough to be excluded from the sitemap has no business acquiring
 * a second published URL here.
 */
async function resolveDirectory(path: string): Promise<AgentDoc | null> {
  try {
    if (path !== DIRECTORY_BASE_PATH && !path.startsWith(`${DIRECTORY_BASE_PATH}/`)) {
      return null;
    }
    if (path === DIRECTORY_BASE_PATH) return directoryHubToAgentDoc();

    const rest = path.slice(DIRECTORY_BASE_PATH.length + 1).split("/");

    if (rest.length === 2 && rest[0] === "agency") {
      // The ENRICHED record, so the Markdown copy carries the same
      // budget, timeline and platforms the HTML page does. Async only for
      // the related-agency block, which reads the live claim layer.
      const agency = await getEnrichedAgency(rest[1]);
      if (!agency || !shouldIndexAgency(agency)) return null;
      return await agencyToAgentDocWithRelated(agency);
    }

    if (rest.length === 1) {
      const category = DIRECTORY_CATEGORIES.find((entry) => entry.slug === rest[0]);
      return category ? directoryCategoryToAgentDoc(category) : null;
    }

    return null;
  } catch {
    return null;
  }
}

/** Resolves a root-level slug: review, then checklist, then feature. */
async function resolveRootSlug(slug: string): Promise<AgentDoc | null> {
  const review = await safe(() => getReviewPageBySlug(slug));
  if (found(review)) return reviewToAgentDoc(review);

  const checklist = await safe(() => getChecklistPageBySlug(slug));
  if (found(checklist)) return checklistToAgentDoc(checklist);

  const feature = await safe(() => getFeaturePageBySlug(slug));
  if (found(feature)) return featureToAgentDoc(feature);

  return null;
}

/**
 * Resolves one site path to its Markdown document.
 *
 * @param rawPath - The HTML page's path, without the `.md` suffix.
 * @returns The document, or null when the path has no Markdown copy.
 */
export async function resolveAgentDoc(rawPath: string): Promise<AgentDoc | null> {
  try {
    const path = normalisePath(rawPath);
    if (!path) return null;

    const staticDoc = STATIC_AGENT_DOCS[path];
    if (staticDoc) return staticDoc();

    const hub = HUBS[path];
    if (hub) return await hub();

    const directory = await resolveDirectory(path);
    if (directory) return directory;

    const segments = path.split("/").filter(Boolean);
    if (segments.length === 1) return await resolveRootSlug(segments[0]);
    if (segments.length === 2) return await resolveNested(segments[0], segments[1]);

    return null;
  } catch {
    return null;
  }
}

/** Re-exported so callers do not have to reach into two modules. */
export { rec };
