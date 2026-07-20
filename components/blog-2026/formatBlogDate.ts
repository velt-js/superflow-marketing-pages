// Shared date formatting for the 2026 blog listing + post templates.

/**
 * Formats an ISO date string into the short "Jan 1, 2026" style used across
 * the blog listing and post header. Returns `null` when the input is
 * missing or unparsable so callers can conditionally skip rendering a
 * `<time>` element instead of showing "Invalid Date".
 *
 * @param isoDate - An ISO-8601 date string (e.g. a Sanity `publishedAt`).
 * @returns The formatted label, or `null` when `isoDate` is empty/invalid.
 */
export function formatBlogDate(isoDate?: string | null): string | null {
  try {
    if (!isoDate) return null;
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}
