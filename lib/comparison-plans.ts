import { TIERS } from "@/components/pricing/pricing-data";

/**
 * The plan a Superflow claim on a comparison page needs, as the reader sees
 * it: "Every plan", "Scale plan and up", "Enterprise plan". Names and order
 * come from the TIERS module that renders /pricing, so a renamed or
 * reordered tier changes both pages at once.
 *
 * The comparison schema stores the tier id (see `superflowPlan` on
 * comparisonPreviewDimension); an id TIERS does not know renders no label
 * rather than a guessed one.
 *
 * @param planId - A TIERS id, e.g. "scale".
 * @returns The label, or an empty string when unset or unknown.
 */
export function superflowPlanLabel(planId?: string): string {
  try {
    const index = TIERS.findIndex((tier) => tier.id === planId);
    if (index < 0) return "";
    if (index === 0) return "Every plan";
    const name = TIERS[index]?.name ?? "";
    return index === TIERS.length - 1 ? `${name} plan` : `${name} plan and up`;
  } catch {
    return "";
  }
}
