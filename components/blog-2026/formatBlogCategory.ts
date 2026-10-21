/**
 * Display titles for the `blogPost.category` dropdown values in
 * `sanity/schemas/blogPost.ts`. Keep this in step with that list.
 */
const CATEGORY_TITLES: Record<string, string> = {
  guide: "Guide",
  comparison: "Comparison",
  tutorial: "Tutorial",
  "case-study": "Case Study",
  "product-update": "Product Update",
  "thought-leadership": "Thought Leadership",
};

/**
 * Pick the kicker text for a post: the free-text `categoryLabel` when an
 * editor set one, else the dropdown's display title, else the raw value so
 * an unknown category still shows something rather than nothing.
 */
export function formatBlogCategory(post?: {
  category?: string | null;
  categoryLabel?: string | null;
}): string | undefined {
  const label = post?.categoryLabel?.trim();
  if (label) return label;
  const value = post?.category?.trim();
  if (!value) return undefined;
  return CATEGORY_TITLES[value] ?? value;
}
