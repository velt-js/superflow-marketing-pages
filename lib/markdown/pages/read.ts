// Defensive readers for Sanity documents.
//
// The GROQ projections in sanity/lib/queries.ts are untyped, and a Markdown
// copy must never 500 because an editor left a field empty in the Studio.
// Every builder reads through these, so a missing field yields an empty
// section rather than a thrown TypeError.

/** A record with unknown values. */
export type Doc = Record<string, unknown>;

/** Narrows an unknown to a record, or {} when it is not one. */
export function rec(value: unknown): Doc {
  try {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Doc;
    }
    return {};
  } catch {
    return {};
  }
}

/** Narrows an unknown to an array of records, dropping non-objects. */
export function arr(value: unknown): Doc[] {
  try {
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is Doc => Boolean(item) && typeof item === "object" && !Array.isArray(item),
    );
  } catch {
    return [];
  }
}

/** Narrows an unknown to an array of strings, dropping everything else. */
export function strs(value: unknown): string[] {
  try {
    if (typeof value === "string") return value ? [value] : [];
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

/** Reads a string field, or "" when it is absent or another type. */
export function str(doc: Doc, key: string): string {
  try {
    const value = doc[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    return "";
  } catch {
    return "";
  }
}
