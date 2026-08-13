// Shared types + display helpers for the Bug Book (/bug-book).
// Content lives in Sanity as `bugBookEntry` docs (seeded from
// scripts/bug-book-import/bug-book-data.json); everything here is
// presentation-side vocabulary: category accents, severity colors,
// rage bands, date formatting.

export type BugBookSource = "human" | "agent";

/** The fourth filter axis. `sass` is the data value; the UI says "Sassy". */
export type BugBookVibe = "rage" | "sass" | "comedy" | "story";

export const BUG_BOOK_VIBES: {
  value: BugBookVibe;
  label: string;
  emoji: string;
}[] = [
  { value: "rage", label: "Rage", emoji: "🔥" },
  { value: "sass", label: "Sassy", emoji: "😏" },
  { value: "comedy", label: "Comedy", emoji: "😂" },
  { value: "story", label: "War story", emoji: "📖" },
];

/** Sassy sub-types - funnier than the vibe label, so cards show these. */
export const SASS_TYPE_LABELS: Record<string, string> = {
  clapback: "Clapback",
  "passive-aggression": "Passive-aggression",
  deadpan: "Deadpan",
  refusal: "Refusal",
  "self-roast": "Self-roast",
  receipts: "Receipts",
};

export function vibeMeta(vibe?: string) {
  return BUG_BOOK_VIBES.find((entry) => entry.value === vibe);
}

/**
 * Badge text for a card: sassy entries show their sub-type ("Clapback",
 * "Receipts"), everything else shows the vibe label.
 */
export function vibeBadgeLabel(vibe?: string, sassType?: string): string | null {
  const meta = vibeMeta(vibe);
  if (!meta) return null;
  if (vibe === "sass" && sassType && SASS_TYPE_LABELS[sassType]) {
    return SASS_TYPE_LABELS[sassType];
  }
  return meta.label;
}

export type BugThreadComment = {
  speaker: string;
  text: string;
  attachment?: "screenshot" | "screen recording" | null;
};

export type BugFinding = {
  title?: string;
  description?: string;
  suggestion?: string;
  issueType?: string;
  confidence?: number;
};

export type BugBookListEntry = {
  _id: string;
  slug: string;
  source: BugBookSource;
  sourceLabel?: string;
  agentName?: string;
  category: string;
  severity: string;
  rageLevel: number;
  status?: string;
  date: string;
  vibe?: BugBookVibe;
  sassType?: string;
  pullQuote?: string;
  pullQuoteSpeaker?: string;
  siteDescriptor?: string;
  sitePlatform?: string;
  siteIndustry?: string;
  headline: string;
  hook?: string;
  flags?: string[];
  curatedRank?: number;
};

export type BugBookEntryDetail = BugBookListEntry & {
  site?: { descriptor?: string; platform?: string; industry?: string };
  captured?: { browser?: string; os?: string; device?: string };
  thread?: BugThreadComment[];
  finding?: BugFinding | null;
  whyItMatters?: string;
  outcome?: string;
};

/** Accent + soft tint per category — shared by chips and thumbnails. */
export const CATEGORY_COLORS: Record<string, { accent: string; tint: string }> =
  {
    "UI/UX": { accent: "#433df3", tint: "#eeedfe" },
    Copy: { accent: "#2d7ff3", tint: "#e9f2fe" },
    Content: { accent: "#8455f6", tint: "#f1ebfe" },
    Links: { accent: "#0d9488", tint: "#e6f7f4" },
    Mobile: { accent: "#db2777", tint: "#fdeaf3" },
    Interactions: { accent: "#7c3aed", tint: "#f2ebfd" },
    Checkout: { accent: "#ea580c", tint: "#fdefe6" },
    Pricing: { accent: "#16a34a", tint: "#e8f7ed" },
    Performance: { accent: "#dc2626", tint: "#fdeaea" },
    "Feature Request": { accent: "#0284c7", tint: "#e6f4fb" },
    Security: { accent: "#b91c1c", tint: "#fbeaea" },
    SEO: { accent: "#b45309", tint: "#fbf1e3" },
  };

const FALLBACK_CATEGORY_COLOR = { accent: "#433df3", tint: "#eeedfe" };

export function categoryColor(category?: string) {
  return CATEGORY_COLORS[category ?? ""] ?? FALLBACK_CATEGORY_COLOR;
}

/** Severity chip colors — Spur's scale: Critical red → Mild slate. */
export const SEVERITY_COLORS: Record<string, { accent: string; tint: string }> =
  {
    Critical: { accent: "#c22030", tint: "#fceaec" },
    High: { accent: "#d55b11", tint: "#fdefe4" },
    Medium: { accent: "#a16207", tint: "#fbf3e0" },
    Mild: { accent: "#5b6472", tint: "#eef0f3" },
  };

export function severityColor(severity?: string) {
  return SEVERITY_COLORS[severity ?? ""] ?? SEVERITY_COLORS.Mild;
}

/** Rage bands per the data taxonomy: 0–2 Calm … 9–10 Volcanic. */
export function rageBand(level: number): string {
  if (level >= 9) return "Volcanic";
  if (level >= 6) return "Heated";
  if (level >= 3) return "Annoyed";
  return "Calm";
}

/** The meter renders only from 6 up — scarcity keeps it funny. */
export const RAGE_METER_MIN = 6;

/** "2024-08" → "Aug 2024". Returns the raw value if it doesn't parse. */
export function formatBugDate(date?: string): string {
  if (!date) return "";
  const match = /^(\d{4})-(\d{2})$/.exec(date);
  if (!match) return date;
  const [, year, month] = match;
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const name = names[Number(month) - 1];
  return name ? `${name} ${year}` : date;
}

/** Card CTA per the spec: thread for humans, report for agents. */
export function cardCtaLabel(source: BugBookSource): string {
  return source === "agent" ? "Read the bug report" : "Read the full thread";
}

export const BUG_BOOK_SORTS = [
  { value: "curated", label: "Curated" },
  { value: "rage", label: "Rage level" },
  { value: "newest", label: "Newest" },
] as const;

export type BugBookSort = (typeof BUG_BOOK_SORTS)[number]["value"];

export function sortEntries<T extends BugBookListEntry>(
  entries: T[],
  sort: BugBookSort,
): T[] {
  const sorted = [...entries];
  if (sort === "rage") {
    sorted.sort((a, b) => (b.rageLevel ?? 0) - (a.rageLevel ?? 0));
  } else if (sort === "newest") {
    // date is YYYY-MM, so string compare is chronological.
    sorted.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  } else {
    sorted.sort((a, b) => (a.curatedRank ?? 0) - (b.curatedRank ?? 0));
  }
  return sorted;
}

/**
 * Flags that get a visible label in the meta bar. Curation cut the
 * planted-demo, satire, and about-Superflow threads, so `own-site` - a
 * real bug on our own property, and the best trust content on the page -
 * is the only flag that still earns a badge.
 */
export function metaBarFlagLabels(flags?: string[]): string[] {
  if (!flags?.length) return [];
  return flags.includes("own-site") ? ["Our own site 😳"] : [];
}

/** Agent whose checks come from a checklist the agency wrote itself. */
export const CUSTOM_CHECKLIST_AGENT_PREFIX = "Custom Checklist Agent";

export const CUSTOM_CHECKLIST_NOTE =
  "This agent runs a checklist this agency wrote for its own launches.";

export function isCustomChecklistAgent(agentName?: string): boolean {
  return Boolean(agentName?.startsWith(CUSTOM_CHECKLIST_AGENT_PREFIX));
}

/** One illustrative agent report in the samples band (never routed). */
export type BugBookSample = {
  _id: string;
  slug: string;
  sourceLabel?: string;
  agentName: string;
  category: string;
  severity: string;
  headline: string;
  hook?: string;
  finding: BugFinding;
  whyItMatters?: string;
  note?: string;
};
