// Reading and writing agency claims.
//
// TWO LAYERS, AND THE SPLIT IS THE POINT
//
//   1. COMMITTED - lib/directory/data/claims.json, imported at build time.
//      Survives everything: a wiped Redis, a moved host, a lost env var.
//      This is where a claim belongs once it has settled, and it is the
//      only layer a hand-entered campaign reply ever touches.
//   2. LIVE - the KV store (lib/toolkit/kv.ts). Written by the claim form
//      the moment an agency submits, so the profile shows its new budget
//      inside the page's 60-second revalidate window rather than waiting
//      for a deploy. Wins over the committed layer for the same slug.
//
// The live layer is a CACHE OF RECORD, not a database: it is where fresh
// claims land so the site can show them today, and they are periodically
// exported into claims.json (see `exportLiveClaims`, and the runbook in
// app/directory/README.md). Losing it loses at most the claims taken since
// the last export - which is why the confirmation email an agency gets
// carries the values it submitted.
//
// This is the same reasoning that keeps partners.json out of
// agencies.json: the importers under scripts/directory-import/ overwrite
// their data files wholesale, so nothing an agency tells us can live in
// one.

import { kvGet, kvSet, isDistributed } from "@/lib/toolkit/kv";
import { normalizeClaim } from "./enrich";
import type { AgencyClaim } from "./types";
import claimsData from "./data/claims.json";

/** Shape of lib/directory/data/claims.json. */
interface ClaimsFile {
  /** Free-text note on where this file's contents came from. */
  source: string;
  /** ISO date the file was last reconciled against the live layer. */
  updatedAt: string | null;
  /** Sparse claim records - every field except `slug` is optional, and
   *  `normalizeClaim` fills the rest in on read. */
  claims: Array<Partial<AgencyClaim> & { slug: string }>;
}

/**
 * Key the whole live claim set is stored under.
 *
 * ONE key holding a map, not one key per agency. Every category page
 * needs the claims for its entire listing to sort and filter it, which
 * under a key-per-agency scheme is 60+ round trips per render. The
 * trade-off is that a write is a read-modify-write and two claims
 * submitted in the same instant could lose one; at the volume this runs
 * at (a few claims a day against a 323-record directory) that has never
 * been worth a second store, and `saveLiveClaim` re-reads immediately
 * before writing to keep the window as small as it can be without one.
 *
 * Versioned so a future shape change can land without reading stale
 * records written against the old one.
 */
const LIVE_CLAIMS_KEY = "directory:claims:v1";

/**
 * TTL on the live claim set, in seconds. Five years.
 *
 * The KV helper always sets an expiry, so "forever" has to be spelled as
 * a number. Five years is far past the point where a claim should have
 * been exported into claims.json, so if this ever actually expires the
 * real failure happened years earlier.
 */
const LIVE_CLAIMS_TTL_SECONDS = 5 * 365 * 24 * 60 * 60;

/**
 * Committed claims, keyed by slug and normalised on the way in.
 *
 * Built once at module load. Reading it costs nothing at request time,
 * which is what lets the synchronous read paths (the sitemap,
 * `generateStaticParams`, the Markdown copies) see editorial corrections
 * without becoming async.
 */
const COMMITTED_CLAIMS: Record<string, AgencyClaim> = (() => {
  try {
    const file = claimsData as ClaimsFile;
    const bySlug: Record<string, AgencyClaim> = {};
    for (const record of file?.claims ?? []) {
      const slug = record?.slug?.trim();
      if (!slug) continue;
      bySlug[slug] = normalizeClaim(slug, record);
    }
    return bySlug;
  } catch {
    return {};
  }
})();

/**
 * Every committed claim, keyed by agency slug.
 *
 * Synchronous, so build-time paths can use it. Does NOT include claims
 * taken through the form since the last export - use `getClaimMap` on any
 * path that renders a page.
 *
 * @returns The committed claim map. Never null.
 */
export function getCommittedClaims(): Record<string, AgencyClaim> {
  try {
    return COMMITTED_CLAIMS;
  } catch {
    return {};
  }
}

/**
 * One committed claim.
 *
 * @param slug - The agency slug.
 * @returns The claim, or null when the agency has none.
 */
export function getCommittedClaim(slug: string | null | undefined): AgencyClaim | null {
  try {
    if (!slug) return null;
    return COMMITTED_CLAIMS[slug] ?? null;
  } catch {
    return null;
  }
}

/**
 * Cache tag on the page-render read below.
 *
 * The claim submit route revalidates it the moment a claim lands, so a
 * new listing is live on the next request rather than up to
 * CLAIMS_REVALIDATE_SECONDS later.
 */
export const CLAIMS_CACHE_TAG = "directory-claims";

/**
 * How long a page-render read of the live claim set may be reused.
 *
 * Matches the `revalidate` on the directory routes, so the claim read and
 * the page it feeds expire together instead of the page regenerating
 * around a read that has not.
 */
const CLAIMS_REVALIDATE_SECONDS = 60;

/**
 * Parses a stored claim map.
 *
 * @param raw - The stored JSON, or null.
 * @returns Claims keyed by slug, normalised. Empty on anything
 *          unparseable - a corrupt blob degrades the site to the
 *          committed layer rather than failing a render.
 */
function parseClaimMap(raw: string | null): Record<string, AgencyClaim> {
  try {
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<AgencyClaim>>;
    if (!parsed || typeof parsed !== "object") return {};
    const bySlug: Record<string, AgencyClaim> = {};
    for (const [slug, record] of Object.entries(parsed)) {
      if (!slug) continue;
      bySlug[slug] = normalizeClaim(slug, record);
    }
    return bySlug;
  } catch {
    return {};
  }
}

/**
 * Reads the live claim set for a PAGE RENDER.
 *
 * WHY THIS DOES NOT GO THROUGH `kvGet`, WHICH IS OTHERWISE THE WHOLE
 * POINT OF lib/toolkit/kv.ts
 *
 * `kvGet` issues its fetch with `cache: "no-store"`, which is exactly
 * right for a rate limiter and fatal here. A `no-store` fetch inside a
 * statically-rendered route opts that route into dynamic rendering, and
 * Next refuses to complete an ISR regeneration for a page that changes
 * from static to dynamic at runtime - it logs
 * "Page changed from static to dynamic at runtime" and goes on serving
 * the build-time HTML. The symptom is the worst possible one: an agency
 * claims its listing, the write succeeds, and the profile never changes.
 *
 * It would also cost the directory its static rendering, which the
 * category listing's SEO contract depends on (see
 * components/directory/AgencyExplorer.tsx).
 *
 * So this read talks to Upstash directly, with Next's own cache
 * semantics: one shared entry, revalidated on the same clock as the pages
 * and invalidated by tag the moment a claim is written. Writes still go
 * through `kvSet`, where `no-store` is correct and where nothing is being
 * prerendered.
 *
 * @returns Claims keyed by slug. Empty when Upstash is unconfigured or
 *          unreachable.
 */
async function readLiveClaimsCached(): Promise<Record<string, AgencyClaim>> {
  try {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL ?? "";
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
    if (!restUrl || !restToken) return {};

    const response = await fetch(`${restUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${restToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([["GET", LIVE_CLAIMS_KEY]]),
      signal: AbortSignal.timeout(KV_READ_TIMEOUT_MS),
      next: { revalidate: CLAIMS_REVALIDATE_SECONDS, tags: [CLAIMS_CACHE_TAG] },
    });
    if (!response.ok) return {};

    const payload = (await response.json()) as Array<{ result?: unknown; error?: string }>;
    const value = Array.isArray(payload) && !payload[0]?.error ? payload[0]?.result : null;
    return parseClaimMap(typeof value === "string" ? value : null);
  } catch {
    return {};
  }
}

/**
 * Reads the live claim set WITHOUT the cache, for the write path and for
 * the dynamic claim routes.
 *
 * `saveLiveClaim` must see the newest map or it would clobber a claim
 * submitted seconds earlier, and the enrich form must prefill from what
 * the agency actually last saved rather than from a minute-old copy.
 * Both callers are on `force-dynamic` routes, so `no-store` costs nothing
 * there.
 *
 * @returns Claims keyed by slug.
 */
async function readLiveClaimsFresh(): Promise<Record<string, AgencyClaim>> {
  try {
    return parseClaimMap(await kvGet(LIVE_CLAIMS_KEY));
  } catch {
    return {};
  }
}

/** How long the page-render read may take. Matches `kv.ts`'s own budget:
 *  past this, rendering without the live layer beats blocking the page. */
const KV_READ_TIMEOUT_MS = 2500;

/**
 * Every claim the site should render: committed, with live claims layered
 * over the top.
 *
 * The live layer wins per slug rather than per field. A claim is one
 * agency's answers submitted together, and merging field by field would
 * produce a record that is half last month's answers and half this
 * week's, attributable to neither submission.
 *
 * @returns Claims keyed by agency slug.
 */
export async function getClaimMap(): Promise<Record<string, AgencyClaim>> {
  try {
    const live = await readLiveClaimsCached();
    return { ...COMMITTED_CLAIMS, ...live };
  } catch {
    return COMMITTED_CLAIMS;
  }
}

/**
 * One agency's claim, read straight from the store with no cache.
 *
 * For the dynamic claim routes only - the enrich form has to prefill from
 * what the agency last saved, not from a copy that may be a minute old.
 * Page renders should go through `getClaimMap`, which is the cached read
 * that keeps those routes static.
 *
 * @param slug - The agency slug.
 * @returns The claim, or null when the agency has none.
 */
export async function getClaim(slug: string | null | undefined): Promise<AgencyClaim | null> {
  try {
    if (!slug) return null;
    const live = await readLiveClaimsFresh();
    return live[slug] ?? COMMITTED_CLAIMS[slug] ?? null;
  } catch {
    return null;
  }
}

/**
 * Writes a claim to the live layer.
 *
 * Re-reads the whole set immediately before writing so a claim submitted
 * seconds earlier is not clobbered - see `LIVE_CLAIMS_KEY` for why this
 * is a read-modify-write rather than a per-key set.
 *
 * @param claim - The complete claim to store.
 * @returns True when the write landed. False means the store is
 *          unreachable or unconfigured, which the caller MUST surface:
 *          an agency told "your listing is updated" over a failed write
 *          will not come back a second time.
 */
export async function saveLiveClaim(claim: AgencyClaim): Promise<boolean> {
  try {
    const slug = claim?.slug?.trim();
    if (!slug) return false;
    const live = await readLiveClaimsFresh();
    const next = { ...live, [slug]: claim };
    return await kvSet(LIVE_CLAIMS_KEY, JSON.stringify(next), LIVE_CLAIMS_TTL_SECONDS);
  } catch {
    return false;
  }
}

/**
 * The live layer on its own, for the export runbook.
 *
 * Deliberately separate from `getClaimMap`: what gets pasted into
 * claims.json is the claims taken since the last export, not those
 * already in the file.
 *
 * @returns Live claims keyed by slug.
 */
export async function exportLiveClaims(): Promise<Record<string, AgencyClaim>> {
  return readLiveClaimsFresh();
}

/**
 * Whether claims written now will outlive this process.
 *
 * `kv.ts` falls back to a per-instance in-memory Map when Upstash is not
 * configured, which is right for a rate limiter and wrong for a claim: on
 * serverless the next request hits a different instance and the agency's
 * work is gone. The claim API route refuses to accept a submission it
 * cannot store rather than showing a success page over a write into a Map
 * that is about to be garbage collected.
 *
 * @returns True when a shared store is configured.
 */
export function claimsArePersistent(): boolean {
  try {
    return isDistributed();
  } catch {
    return false;
  }
}
