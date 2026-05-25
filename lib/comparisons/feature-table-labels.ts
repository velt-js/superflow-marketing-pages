// Static label map for the /comparisons feature-availability table.
//
// Framer's CSV ships only numeric row keys per group (A/B/C/D/E). The
// human-readable group titles and per-row feature labels live in the
// Framer design, not the CMS. Until we pull the ground-truth labels
// from the live site (or have an editor write them in here), we render
// placeholder strings like "A.1" so the page renders without crashing
// and editors know exactly which row to populate.
//
// To finalize: replace the placeholder values with the labels visible
// on https://usesuperflow.com/comparisons/<slug>.

export interface FeatureTableLabels {
  [groupKey: string]: {
    groupLabel: string;
    rows: Record<string, string>;
  };
}

export const FEATURE_TABLE_LABELS: FeatureTableLabels = {
  A: { groupLabel: "Commenting", rows: {} },
  B: { groupLabel: "Compatibility", rows: {} },
  C: { groupLabel: "Integrations", rows: {} },
  D: { groupLabel: "Client management", rows: {} },
  E: { groupLabel: "Team workflow", rows: {} },
};

export function labelForRow(groupKey: string, rowKey: string): string {
  const group = FEATURE_TABLE_LABELS[groupKey];
  return group?.rows[rowKey] ?? `${groupKey}.${rowKey}`;
}

export function labelForGroup(groupKey: string): string {
  return FEATURE_TABLE_LABELS[groupKey]?.groupLabel ?? `Group ${groupKey}`;
}
