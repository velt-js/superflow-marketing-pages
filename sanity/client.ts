import { createClient } from "@sanity/client";
import { projectId, dataset, apiVersion } from "./env";

// Local-only draft preview: set SANITY_PREVIEW_DRAFTS=1 in .env.local and
// restart `npm run dev` to render draft documents across the whole local
// site. The NODE_ENV guard means production builds always ignore the flag,
// and the token never ships to prod env anyway.
const previewDrafts =
  process.env.NODE_ENV === "development" &&
  process.env.SANITY_PREVIEW_DRAFTS === "1" &&
  Boolean(process.env.SANITY_API_TOKEN);

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: previewDrafts ? false : process.env.NODE_ENV === "production",
  ...(previewDrafts
    ? { token: process.env.SANITY_API_TOKEN, perspective: "drafts" as const }
    : {}),
});
