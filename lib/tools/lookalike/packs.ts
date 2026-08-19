// The benchmark packs offered in the Lookalike Test's dropdown.
//
// MIRRORS the backend's `built-in/lookalike/packs/index.ts`, which is the
// authority: it holds the measurements, and this file holds only what the
// picker needs to render. A separate list rather than a fetch, because the
// dropdown must render before any request is made.
//
// ADDING A PACK MEANS EDITING BOTH. A pack listed here but missing from the
// backend silently falls back to the backend's default, so the visitor gets a
// comparison against something they did not choose. The reverse — a backend
// pack missing here — is harmless: it simply is not offered.

export type BenchmarkPack = {
  /** Must match the backend pack id exactly. */
  id: string;
  /** What appears in the dropdown. */
  label: string;
  /** The sites in the pack, for reference. */
  sites: string;
};

export const BENCHMARK_PACKS: readonly BenchmarkPack[] = [
  {
    id: "developer-tools",
    label: "Modern developer tools — Linear, Stripe, Vercel",
    sites: "linear.app, stripe.com, vercel.com",
  },
  {
    id: "saas-marketing",
    label: "SaaS marketing pages — Notion, Figma, Loom",
    sites: "notion.com, figma.com, loom.com",
  },
];
