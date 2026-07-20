const LOGO_BASE_PATH = "/logos/comparison";

/**
 * Tool display name (lowercased) -> logo file in /public/logos/comparison.
 * Sourced from each vendor's own favicon, July 2026. SureFeedback covers the
 * ProjectHuddle rename; slug tokens (marker-io, frame-io) are included so hub
 * slugs resolve through the same table.
 */
const TOOL_LOGO_FILES: Record<string, string> = {
  superflow: "superflow.png",
  bugherd: "bugherd.png",
  "markup.io": "markup.png",
  markup: "markup.png",
  "marker.io": "marker-io.png",
  "marker-io": "marker-io.png",
  filestage: "filestage.png",
  usersnap: "usersnap.png",
  userback: "userback.png",
  pastel: "pastel.png",
  ruttl: "ruttl.png",
  "frame.io": "frame-io.png",
  "frame-io": "frame-io.png",
  surefeedback: "surefeedback.png",
  projecthuddle: "surefeedback.png",
  atarim: "atarim.png",
};

/**
 * Resolves a tool display name (or slug token) to its logo path.
 *
 * @param toolName - A display name like "Marker.io" or a slug token like
 * "marker-io".
 * @returns The public path to the logo, or null when the tool is unknown.
 */
export function getToolLogoSrc(toolName?: string): string | null {
  try {
    const key = (toolName ?? "").toLowerCase().trim();
    const file = TOOL_LOGO_FILES[key];
    return file ? `${LOGO_BASE_PATH}/${file}` : null;
  } catch {
    return null;
  }
}

/**
 * Derives the logos referenced by a comparison page slug, in display order.
 * "superflow-vs-marker-io" yields both contestants; "ruttl-alternative"
 * yields the anchor tool.
 *
 * @param slug - The page slug, e.g. "markup-vs-bugherd".
 * @returns Logo paths for every tool the slug names, unknown tools omitted.
 */
export function getToolLogosFromSlug(slug?: string): string[] {
  try {
    const cleaned = (slug ?? "").replace(/-alternative$/, "");
    const tokens = cleaned.split("-vs-");
    return tokens
      .map((token) => getToolLogoSrc(token))
      .filter((src): src is string => Boolean(src));
  } catch {
    return [];
  }
}
