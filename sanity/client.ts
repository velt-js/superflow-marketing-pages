import { createClient } from "@sanity/client";
import { projectId, dataset, apiVersion } from "./env";

// Draft preview: set SANITY_PREVIEW_DRAFTS=1 (plus SANITY_API_TOKEN) to
// render draft documents across the whole site — local dev or a branch
// deploy. Never set the flag in the production environment, or drafts go
// public.
const previewDrafts =
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
