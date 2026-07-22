// Server-safe artifact naming for the comparison pages. Kept out of
// ComparisonArtifact.tsx (a "use client" module) so server page bodies can
// reference artifact names without crossing the client boundary.

/**
 * Product artifacts reusable on the comparison / alternative pages. Each one
 * is an existing hero-window artifact (see ARTIFACT_UI_COMPONENT_LIST.md)
 * reused verbatim — single source of truth — and framed by
 * `ComparisonArtifactWindow`.
 */
export type ComparisonArtifactName =
  | "agents-at-work"
  | "agents-from-checklist"
  | "client-approves"
  | "behind-login"
  | "private-thread"
  | "captured-context"
  | "client-memory"
  | "integrations";
