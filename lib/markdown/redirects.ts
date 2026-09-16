// Markdown copies whose page has been retired.
//
// Every page publishes a copy at its own path plus `.md` (see AGENTS.md), so
// retiring a page retires two URLs, not one - and the HTML half is the only
// one `redirects` in next.config.ts can reach, because proxy.ts rewrites the
// `.md` form into the API route before those redirects run.
//
// Left unhandled, an agent holding a `.md` URL gets a 404 where its HTML
// twin gets a 308. This is the small table that keeps the two halves in
// step.

import { DIRECTORY_BASE_PATH, DIRECTORY_CATEGORIES } from "@/lib/directory/constants";

/**
 * Resolves the page a retired Markdown copy should redirect to.
 *
 * The directory's four category routes are the only entries today: they are
 * a filter on one list now rather than four pages (see
 * app/directory/README.md), and their copies fold into the list's own, which
 * covers all four categories in one document.
 *
 * @param path - The requested path, without the `.md` suffix.
 * @returns The path to redirect to, or null when nothing is retired here.
 */
export function resolveMarkdownRedirect(path: string): string | null {
  try {
    const retiredCategory = DIRECTORY_CATEGORIES.some(
      (category) => path === `${DIRECTORY_BASE_PATH}/${category.slug}`,
    );
    return retiredCategory ? DIRECTORY_BASE_PATH : null;
  } catch {
    return null;
  }
}
