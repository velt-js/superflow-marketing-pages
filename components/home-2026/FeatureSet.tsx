import styles from "./FeatureSet.module.css";
import type { FeatureSetBlockData } from "./FeatureSetBlock";
import FeatureSetJourney from "./FeatureSetJourney";
import FeatureSetStack from "./FeatureSetStack";

const HEADING_ID = "feature-set-heading";
const HEADER_TITLE = "Superflow gets you from";
const JOURNEY_START = "First Draft";
const JOURNEY_END = "Client Approved";

/**
 * Feature blocks in the exact top-to-bottom order of the 2026 homepage frame.
 * Colours and copy are taken verbatim from Figma (node 582:4616). Each tab
 * carries its own `oneLiner` (the view's statement) and `loss` ("Without it…")
 * line; the active tab's pair renders in the window header and swaps on click.
 */
const FEATURE_BLOCKS: FeatureSetBlockData[] = [
  {
    id: "ai-clients",
    accent: "#da53b9",
    tint: "rgba(218, 83, 184, 0.06)",
    icon: "sparkles",
    title: "Build Agents That Review, Comment, and Remember",
    description:
      "Superflow builds them from your checklist. They check every site and leave findings as comments. Every review teaches Memory more. The next project starts already knowing the client.",
    tabs: [
      {
        label: "AI Review Agents",
        icon: "robot",
        oneLiner:
          "Your checklist, run by agents on every site, findings posted as comments.",
        loss: "Without them, senior people burn billable hours catching broken links and typos by hand.",
        mock: "review-agents",
        href: "/ai-review-agents",
      },
      {
        label: "Memory",
        icon: "database",
        oneLiner:
          "Every client's brand and past decisions, remembered and fed to the agents.",
        loss: "Without it, every project restarts from zero and you re-explain the brand each round.",
        mock: "client-memory",
        href: "/memory",
      },
      {
        label: "Ask AI",
        icon: "message-chatbot",
        oneLiner:
          "Ask the review history anything, per client or across every project.",
        loss: "Without it, institutional knowledge stays buried in old threads and walks out when people leave.",
        mock: "ask-ai",
        href: "/ask-ai",
      },
    ],
    mock: "review-agents",
  },
  {
    id: "durable-comments",
    accent: "#433df3",
    tint: "rgba(67, 61, 243, 0.06)",
    icon: "message-circle",
    title: "Pin Comments That Capture, Survive, and Stay Private",
    description:
      "Comments pin to the element, on the live site. Each one carries a screenshot of what the reviewer saw. The page changes; the proof stays. Internal notes stay internal.",
    tabs: [
      {
        label: "Pinned Comments",
        icon: "pin",
        oneLiner: "Pinned to the element, holding through edits and redeploys.",
        loss: "Without them, feedback scatters across email, Slack, and screenshots.",
        mock: "pinned-comments",
        href: "/comments",
      },
      {
        label: "Auto Screenshot",
        icon: "camera",
        oneLiner:
          "Every comment captures the page as it looked, so context never gets lost.",
        loss: "Without it, there is no record of what the reviewer saw once the page changes.",
        collapsesFirstTab: true,
        mock: "auto-screenshot",
        href: "/screenshots",
      },
      {
        label: "Private",
        icon: "lock",
        oneLiner: "Internal-only notes your team sees and the client never does.",
        loss: "Without them, your internal back-and-forth happens in front of the client.",
        collapsesFirstTab: true,
        mock: "private-comments",
        href: "/private-comments",
      },
      {
        label: "Versioning",
        icon: "history",
        oneLiner: "Every thread keeps the page versions it spanned.",
        loss: "Without it, nobody can tell which version a comment was about.",
        collapsesFirstTab: true,
        mock: "versioning",
      },
      {
        label: "Live Site",
        icon: "world",
        oneLiner: "Comment on the real site, not a stale copy of it.",
        loss: "Without it, comments live on screenshots of a site that has already changed.",
        collapsesFirstTab: true,
        mock: "live-site",
      },
    ],
    mock: "workflow",
  },
  {
    id: "no-friction",
    accent: "#109534",
    tint: "rgba(16, 149, 52, 0.06)",
    icon: "send",
    title: "Your Client Approves From a Link. Even Behind SSO.",
    description:
      "Send your client a link. No account, no login, no app, from their phone. They tap Approve. Behind passwords, Okta, and SSO too: Superflow lives on the site itself. Review on desktop or phone, in text or on video.",
    tabs: [
      {
        label: "Guest Mode",
        icon: "user-check",
        oneLiner:
          "Your client reviews from a link: no account, no login, from their phone.",
        loss: "Without it, you lose a week waiting for a client to log in and take a look.",
        mock: "guest-mode",
        href: "/client-review",
      },
      {
        label: "Behind Login",
        icon: "lock",
        oneLiner:
          "Comment on dashboards, portals, and any page that needs an account.",
        loss: "Without it, the gated, logged-in half of the work cannot be reviewed in context.",
        mock: "behind-login",
        href: "/authenticated-pages",
      },
      {
        label: "All Devices",
        icon: "devices",
        oneLiner: "Both views, findings tagged by device.",
        loss: "Without it, mobile feedback turns into screenshots texted around.",
        mock: "all-devices",
        href: "/cross-device-review",
      },
      {
        label: "Record Walkthrough",
        icon: "video",
        oneLiner:
          "Screen-record feedback right where you review, no separate Loom link.",
        loss: "Without them, nuanced feedback becomes paragraphs nobody reads.",
        mock: "record-walkthrough",
        href: "/recordings",
      },
    ],
    mock: "workflow",
  },
  {
    id: "real-work",
    accent: "#e17a14",
    tint: "rgba(225, 122, 20, 0.06)",
    icon: "list-check",
    title: "Every Comment Becomes a Task",
    description:
      "A finding becomes a task. Statuses track it. Approvals run team first, then the client gate. One board across every client, or sync to Asana, Monday, ClickUp. Nothing dies in an email thread.",
    tabs: [
      {
        label: "Custom Statuses",
        icon: "circle-check",
        oneLiner: "Built-in review statuses, plus your own custom ones.",
        loss: "Without them, review state lives in people's heads.",
        mock: "custom-statuses",
      },
      {
        label: "Workflows",
        icon: "route",
        oneLiner: "Multi-step review flows with client gates and escalation rules.",
        loss: "Without them, approvals run from memory and steps get skipped.",
        mock: "workflows",
        href: "/review-workflows",
      },
      {
        label: "Kanban",
        icon: "layout-kanban",
        oneLiner: "A built-in kanban board, or sync with the one you already run.",
        loss: "Without it, you run the studio from a spreadsheet and your memory.",
        mock: "kanban",
        href: "/kanban-board",
      },
      {
        label: "Integrations",
        icon: "plug",
        oneLiner:
          "One-click installs (WordPress, Webflow, Framer, Shopify); tasks sync to Slack, Asana, Monday, ClickUp.",
        loss: "Without them, Superflow becomes one more silo to copy tasks out of.",
        mock: "integrations",
        href: "/integrations",
      },
    ],
    mock: "workflow",
  },
];

/**
 * Per-page overrides for the Feature Set section. Omit any field to fall back
 * to the homepage default (so /home-preview renders unchanged).
 */
export interface FeatureSetProps {
  headerTitle?: string;
  journeyStart?: string;
  journeyEnd?: string;
  blocks?: FeatureSetBlockData[];
}

/**
 * "04 / Feature Set" — the 2026 homepage feature showcase. Renders an intro
 * headline with a "First Draft → Client Approved" journey, then four feature
 * blocks whose tabbed app windows bleed off the card edges as in Figma. The
 * AI block shows the agent-gallery mock (Spell Check card + skeletons); the
 * other three show the "New Website Workflow" mock. On desktop the cards
 * pin and stack over each other on scroll (see FeatureSetStack).
 *
 * @param props - Optional per-page overrides; defaults reproduce the
 *   /home-preview homepage exactly.
 */
export default function FeatureSet({
  headerTitle,
  journeyStart,
  journeyEnd,
  blocks,
}: FeatureSetProps = {}) {
  const resolvedHeaderTitle = headerTitle ?? HEADER_TITLE;
  const resolvedJourneyStart = journeyStart ?? JOURNEY_START;
  const resolvedJourneyEnd = journeyEnd ?? JOURNEY_END;
  const resolvedBlocks = blocks && blocks.length > 0 ? blocks : FEATURE_BLOCKS;

  return (
    <section className={styles.section} aria-labelledby={HEADING_ID}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id={HEADING_ID} className={styles.headerTitle}>
            {resolvedHeaderTitle}
          </h2>
          <FeatureSetJourney
            startLabel={resolvedJourneyStart}
            endLabel={resolvedJourneyEnd}
          />
        </header>

        <FeatureSetStack blocks={resolvedBlocks} />
      </div>
    </section>
  );
}
