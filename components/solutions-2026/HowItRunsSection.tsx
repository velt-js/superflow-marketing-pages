import type { ReactNode } from "react";
import GetStarted, {
  type GetStartedNumberedStep,
} from "@/components/home-2026/GetStarted";

/** Heading and subheading from the agents page (brief appendix). */
const HEADING = "Get started with Agents in a minute";
const SUBHEADING = "Four steps, no engineer required.";

/**
 * The four steps every solutions page shows (spec S5). Same on every page;
 * only the platform strip order changes, from page data.
 */
export const HOW_IT_RUNS_STEPS: readonly GetStartedNumberedStep[] = [
  {
    title: "Add the snippet in 30 seconds",
    description:
      "Or upload a file. One click for WordPress, Webflow, Framer, Shopify.",
    accent: "#d43f8d",
  },
  {
    title: "Paste your checklist, upload brand guides",
    description: "Superflow assembles your named agents.",
    accent: "#433df3",
  },
  {
    title: "Agents check it the moment it lands",
    description:
      "They post findings as comments. Invite your team and your client to see them, no account needed.",
    accent: "#109534",
  },
  {
    title: "Your team fixes what matters",
    description:
      "Your client approves from the link. Superflow remembers for next time.",
    accent: "#e0820a",
  },
];

/** Props for {@link HowItRunsSection}. */
export interface HowItRunsSectionProps {
  /** Platform ids to show first in the logo strip, from page data. */
  platformsFirst?: readonly string[] | null;
}

/**
 * S5, how it runs: the shared "Get started" block with the four agent steps
 * and the platform strip reordered for this page.
 *
 * @param props - The page's platform order.
 * @returns The section.
 */
export default function HowItRunsSection({
  platformsFirst,
}: HowItRunsSectionProps): ReactNode {
  return (
    <GetStarted
      heading={HEADING}
      subheading={SUBHEADING}
      steps={HOW_IT_RUNS_STEPS}
      platformsFirst={platformsFirst ?? undefined}
    />
  );
}
