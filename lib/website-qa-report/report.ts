// The State of Website QA 2026: every number and every line of report copy
// the site publishes about it, in one place.
//
// The page, its Markdown copy, the lead email and the JSON-LD all read from
// here, so a number cannot say one thing on the page and another to an agent.
//
// NUMBERS RULE. Every figure below comes from the approved table in the
// report brief (section 10). Do not round them, do not derive new ones (the
// round buckets sum to 99 because each was rounded on its own; that is
// correct, leave it), and do not add a figure that is not in that table.
// Copy rule: no em dashes, anywhere.

import { SITE_URL } from "@/app/_seo/schema";

/** Where this year's edition lives. */
export const REPORT_PATH = "/state-of-website-qa";

/** Absolute URL of the page, for share links, citations and the email. */
export const REPORT_URL = `${SITE_URL}${REPORT_PATH}`;

export const REPORT_TITLE = "The State of Website QA 2026";
export const REPORT_SUBTITLE = "What 505,857 review comments say about how agencies ship websites.";

/** Tag stored on every lead this page produces. */
export const LEAD_MAGNET = "state-of-website-qa-2026";

/** Lead form's value for the `page` hidden field. */
export const LEAD_PAGE = REPORT_PATH;

/** First publication date, for the Report JSON-LD. */
export const DATE_PUBLISHED = "2026-10-06";

/**
 * Report files. Placeholders until the final ones are supplied: replace the
 * files in /public/reports in place (same names, same 5.5 x 8.5 portrait
 * ratio) and nothing in code needs to change. See
 * scripts/state-of-website-qa/README.md.
 */
export const REPORT_FILES = {
  pdf: "/reports/state-of-website-qa-2026.pdf",
  cover: "/reports/state-of-website-qa-2026-cover.png",
  previews: [
    { src: "/reports/preview-1.png", label: "Cover" },
    { src: "/reports/preview-2.png", label: "What reviewers flag" },
    { src: "/reports/preview-3.png", label: "Review rounds" },
  ],
  /** Social card: the cover beside the title. */
  og: "/og/pages/state-of-website-qa.png",
} as const;

/** Pixel size of the cover and every page preview (5.5 x 8.5 at 200 dpi). */
export const PAGE_IMAGE_SIZE = { width: 1100, height: 1700 } as const;

/**
 * The download link the email carries. It goes through a route rather than
 * straight to the PDF so the download can be counted (location "email").
 */
export const EMAIL_DOWNLOAD_PATH = `${REPORT_PATH}/download`;

/** `source` value carried by every link in the lead email. */
export const EMAIL_SOURCE = "state-of-website-qa-email";

/** `ref` value carried into app signup. */
export const SIGNUP_REF = "state-of-website-qa";

export const SIGNUP_URL = "https://app.usesuperflow.com/signup";

export const REPORT_FORMAT_LINE = "12 pages · 5-minute read · Free";

/** The data strip under the hero. */
export const DATA_STRIP = [
  { value: "505,857", label: "review comments and replies" },
  { value: "63,000+", label: "pages reviewed" },
  { value: "1,200+", label: "agency teams" },
  { value: "4 years", label: "of launches, 2022 to 2026" },
] as const;

export const DATA_SOURCE_LINE = "Source: Superflow review data, 2022 to 2026";

/** The three benchmark answers, in the order they are offered. */
export const BENCHMARK_BUCKETS = [
  {
    id: "1-2",
    label: "1 to 2",
    share: 34,
    result: "Faster than most. Only about 1 in 3 sites ships in 1 or 2 rounds.",
  },
  {
    id: "3-4",
    label: "3 to 4",
    share: 22,
    result: "Right in the middle. The typical site takes 4 rounds.",
  },
  {
    id: "5+",
    label: "5 or more",
    share: 43,
    result: "You're not alone. 43% of sites take 5 or more rounds.",
  },
] as const;

export type BenchmarkAnswer = (typeof BENCHMARK_BUCKETS)[number]["id"];

/** True when a value is one of the benchmark answers. */
export function isBenchmarkAnswer(value: unknown): value is BenchmarkAnswer {
  return BENCHMARK_BUCKETS.some((bucket) => bucket.id === value);
}

/** The words a person picked, for "You said your sites take ... rounds". */
export function benchmarkLabel(answer: BenchmarkAnswer): string {
  return BENCHMARK_BUCKETS.find((bucket) => bucket.id === answer)?.label ?? answer;
}

export type Finding = {
  /** 1 to 6. Also the anchor: #finding-N. */
  n: number;
  headline: string;
  meaning: string;
  /** What a LinkedIn post about this finding says before the link. */
  shareText: string;
};

export const FINDINGS: readonly Finding[] = [
  {
    n: 1,
    headline: "4 review rounds per site. 43% take 5 or more.",
    meaning: "Rounds barely shrink. Round 6 still turns up 6 new issues.",
    shareText:
      "The typical website takes 4 review rounds before launch, and 43% take 5 or more. Round 6 still turns up 6 new issues. From The State of Website QA 2026, built on 505,857 real review comments.",
  },
  {
    n: 2,
    headline: "1 in 9 review comments is a copy-paste.",
    meaning: "Your team is typing the same note on page after page.",
    shareText:
      "1 in 9 website review comments is a copy-paste of one left on another page of the same site. From The State of Website QA 2026, built on 505,857 real review comments.",
  },
  {
    n: 3,
    headline: "Typos are just 1% of comments.",
    meaning: "Most QA checklists are aimed at the wrong thing.",
    shareText:
      "Typos are just 1% of website review comments. Most QA checklists are aimed at the wrong thing. From The State of Website QA 2026, built on 505,857 real review comments.",
  },
  {
    n: 4,
    headline: "Missing links beat broken links, 5 to 1.",
    meaning: "The problem isn't links that break. It's buttons that go nowhere.",
    shareText:
      "In website reviews, missing links beat broken links 5 to 1. The problem isn't links that break. It's buttons that go nowhere. From The State of Website QA 2026.",
  },
  {
    n: 5,
    headline: "Half of all copy edits are tiny.",
    meaning: "Swap a word, fix a price, delete a line. Mechanical work done at strategist rates.",
    shareText:
      "Half of all copy edits in website reviews are tiny. Swap a word, fix a price, delete a line. From The State of Website QA 2026, built on 505,857 real review comments.",
  },
  {
    n: 6,
    headline: "3 of 4 agencies keep fixing image problems.",
    meaning: "It's the most common issue there is.",
    shareText:
      "3 of 4 agencies keep fixing image problems on the websites they ship. From The State of Website QA 2026, built on 505,857 real review comments.",
  },
];

/** Anchor id for a finding. */
export function findingAnchor(n: number): string {
  return `finding-${n}`;
}

export const CONTENTS = [
  "The data",
  "What reviewers really flag",
  "Same problems, every agency",
  "The copy-paste problem",
  "Missing links",
  "Copy edits and typos",
  "Review rounds",
  "Where AI QA fits",
  "Memory and brand rules",
  "The pre-launch checklist (tear-out)",
] as const;

export const METHODOLOGY = [
  {
    term: "Source",
    detail:
      "Every review comment and reply left by people in Superflow between 2022 and 2026. Comments from our own team and from AI agents are excluded.",
  },
  {
    term: "Scale",
    detail: "505,857 comments and replies, 63,000+ pages, 1,200+ agency teams.",
  },
  {
    term: "How we counted",
    detail: "Comments were grouped by topic. One comment can count in more than one topic.",
  },
  {
    term: "Review round",
    detail: "A burst of comments on a site, followed by 3 or more quiet days.",
  },
  {
    term: "Privacy",
    detail:
      "Everything is reported in aggregate. No client names, sites or private content appear in the report.",
  },
] as const;

export const CITATION = `Source: ${REPORT_TITLE}, Superflow (usesuperflow.ai${REPORT_PATH})`;

export const FAQ = [
  {
    question: "Is it free?",
    answer: "Yes. Leave your email and it downloads right away.",
  },
  {
    question: "Is this a survey?",
    answer: "No. It's built from real review comments, not from what people say they do.",
  },
  {
    question: "Can I share the findings?",
    answer: "Yes. Please cite the report and link back.",
  },
  {
    question: "Who is Superflow?",
    answer:
      "Agencies use Superflow to review websites with their clients. Our AI QA agents leave the first round of comments, so the team starts at round two.",
  },
  {
    question: "Will you spam me?",
    answer: "No. You get the report. If you want more, you can sign up.",
  },
] as const;

export const ROLE_OPTIONS = [
  { value: "owner-founder", label: "Owner or founder" },
  { value: "ops-delivery-lead", label: "Ops or delivery lead" },
  { value: "project-manager", label: "Project manager" },
  { value: "designer-developer", label: "Designer or developer" },
  { value: "other", label: "Other" },
] as const;

export type RoleValue = (typeof ROLE_OPTIONS)[number]["value"];

/** True when a value is one of the role options. */
export function isRoleValue(value: unknown): value is RoleValue {
  return ROLE_OPTIONS.some((option) => option.value === value);
}

/** The three numbers the email leads with. */
export const EMAIL_HIGHLIGHTS = [
  "The typical site takes 4 review rounds. 43% take 5 or more.",
  "1 in 9 review comments is a copy-paste of one left on another page.",
  "Typos are just 1% of comments. Most checklists aim at the wrong thing.",
] as const;

/**
 * App signup link for "Scan your website", carrying the attribution through.
 *
 * @param params - `source` plus any UTM values to pass along.
 */
export function signupUrl(params: Record<string, string | undefined>): string {
  try {
    const url = new URL(SIGNUP_URL);
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
    url.searchParams.set("ref", SIGNUP_REF);
    return url.toString();
  } catch {
    return `${SIGNUP_URL}?ref=${SIGNUP_REF}`;
  }
}
