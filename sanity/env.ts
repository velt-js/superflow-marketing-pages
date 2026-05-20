// Hardcoded fallbacks are required for the deployed Studio bundle:
// `sanity deploy` builds the static Studio assets with the Sanity CLI,
// which does NOT load Next.js's `.env.local` (Next-specific) and only
// reads `SANITY_STUDIO_*` vars from `.env`/`.env.production`. Without
// a literal projectId here the bundled Studio crashes with
// "Configuration must contain `projectId`" at runtime. The fallbacks
// match the canonical Superflow project; env vars still win when set
// (e.g. for a future second dataset or a staging project).
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  "sckr62cw";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  "production";
export const apiVersion = "2024-01-01";
