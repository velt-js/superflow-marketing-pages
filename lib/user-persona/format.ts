// Framer's persona `Role` strings are inconsistent ("QA team",
// "marketing agency", "Project Managers", "Designer"…). Normalize to
// Title Case so listing + related cards read consistently.
export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
