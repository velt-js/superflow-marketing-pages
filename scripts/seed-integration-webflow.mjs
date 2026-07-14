#!/usr/bin/env node
/**
 * Seed the "Webflow" `integrationPreviewPage` document in Sanity.
 *
 * Serves at /preview/integrations/webflow. Reuses the 2026 homepage sections as
 * a fixed template (no asset uploads). Copy is verbatim from
 * ~/Downloads/superflow-website-6/integrations/webflow/superflow-page-integration-webflow.md
 * (a v3 "home replica" page: hero + the four home bands + the plugin install).
 * [bracketed] and *italic* build/VERIFY/FLAG notes are dropped; the shared
 * trust strip and logo strip map to hard-coded chrome and are not seeded.
 * Band-2 link targets use /comments (the shipped page) per the source's own
 * "/website-review vs /comments — one ruling" note.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-integration-webflow.mjs
 *   DRY_RUN=1 node scripts/seed-integration-webflow.mjs
 */
import { createClient } from "@sanity/client";

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

const client = DRY_RUN
  ? null
  : createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    });

const ACCENT_PLUM = "#da53b9";
const ACCENT_BLUE = "#433df3";
const ACCENT_GREEN = "#109534";
const ACCENT_UMBER = "#e17a14";
const ACCENT_PINK = "#d43f8d";

// The four "home bands", home-verbatim (this v3 page replicates the homepage
// arc, then adds the Webflow plugin install). Shared across the platform pages.
const HOME_BANDS = [
  {
    _key: "band-agents",
    title: "Build Agents That Review, Comment, and Remember",
    description:
      "Superflow builds them from your checklist. They check every site and leave findings as comments. Every review teaches Memory more. The next project starts already knowing the client.",
    icon: "sparkles",
    accent: ACCENT_PLUM,
    mock: "agent-gallery",
    tabs: [
      {
        _key: "agents-review",
        label: "AI Review Agents",
        icon: "robot",
        oneLiner:
          "Your checklist, run by agents on every site, findings posted as comments.",
        loss: "Without them, senior people burn billable hours catching broken links and typos by hand.",
        href: "/ai-review-agents",
      },
      {
        _key: "agents-memory",
        label: "Memory",
        icon: "database",
        oneLiner:
          "Every client's brand and past decisions, remembered and fed to the agents.",
        loss: "Without it, every project restarts from zero and you re-explain the brand each round.",
        href: "/memory",
      },
      {
        _key: "agents-ask",
        label: "Ask AI",
        icon: "message-chatbot",
        oneLiner:
          "Ask the review history anything, per client or across every project.",
        loss: "Without it, institutional knowledge stays buried in old threads and walks out when people leave.",
        href: "/ask-ai",
      },
    ],
  },
  {
    _key: "band-comments",
    title: "Pin Comments That Capture, Survive, and Stay Private",
    description:
      "Comments pin to the element, on the live site. Each one carries a screenshot of what the reviewer saw. The page changes; the proof stays. Internal notes stay internal.",
    icon: "message-circle",
    accent: ACCENT_BLUE,
    mock: "workflow",
    tabs: [
      {
        _key: "comments-pinned",
        label: "Pinned Comments",
        icon: "pin",
        oneLiner: "Pinned to the element, holding through edits and redeploys.",
        loss: "Without them, feedback scatters across email, Slack, and screenshots.",
        href: "/comments",
      },
      {
        _key: "comments-screenshot",
        label: "Automatic Screenshots",
        icon: "camera",
        oneLiner:
          "Every comment captures the page as it looked, so context never gets lost.",
        loss: "Without it, there is no record of what the reviewer saw once the page changes.",
        href: "/screenshots",
        collapsesFirstTab: true,
      },
      {
        _key: "comments-private",
        label: "Private Comments",
        icon: "lock",
        oneLiner: "Internal-only notes your team sees and the client never does.",
        loss: "Without them, your internal back-and-forth happens in front of the client.",
        href: "/private-comments",
        collapsesFirstTab: true,
      },
      {
        _key: "comments-live",
        label: "Live Site",
        icon: "world",
        oneLiner: "Comment on the real site, not a stale copy of it.",
        loss: "Without it, comments live on screenshots of a site that has already changed.",
        href: "/comments",
        collapsesFirstTab: true,
      },
      {
        _key: "comments-versioning",
        label: "Versioning",
        icon: "history",
        oneLiner: "Every thread keeps the page versions it spanned.",
        loss: "Without it, nobody can tell which version a comment was about.",
        collapsesFirstTab: true,
      },
    ],
  },
  {
    _key: "band-approve",
    title: "Your Client Approves From a Link. Even Behind SSO.",
    description:
      "Send your client a link. No account, no login, no app, from their phone. They tap Approve. Behind passwords, Okta, and SSO too: Superflow lives on the site itself. Review on desktop or phone, in text or on video.",
    icon: "send",
    accent: ACCENT_GREEN,
    mock: "workflow",
    tabs: [
      {
        _key: "approve-guest",
        label: "Guest Mode",
        icon: "user-check",
        oneLiner:
          "Your client reviews from a link: no account, no login, from their phone.",
        loss: "Without it, you lose a week waiting for a client to log in and take a look.",
        href: "/client-review",
      },
      {
        _key: "approve-login",
        label: "Behind Login",
        icon: "lock",
        oneLiner:
          "Comment on dashboards, portals, and any page that needs an account.",
        loss: "Without it, the gated, logged-in half of the work cannot be reviewed in context.",
        href: "/authenticated-pages",
      },
      {
        _key: "approve-devices",
        label: "Mobile and Desktop",
        icon: "devices",
        oneLiner: "Both views, findings tagged by device.",
        loss: "Without it, mobile feedback turns into screenshots texted around.",
        href: "/cross-device-review",
      },
      {
        _key: "approve-record",
        label: "Record Walkthrough",
        icon: "video",
        oneLiner:
          "Screen-record feedback right where you review, no separate Loom link.",
        loss: "Without them, nuanced feedback becomes paragraphs nobody reads.",
        href: "/recordings",
      },
    ],
  },
  {
    _key: "band-tasks",
    title: "Every Comment Becomes a Task",
    description:
      "A finding becomes a task. Statuses track it. Approvals run team first, then the client gate. One board across every client, or sync to Asana, Monday, ClickUp. Nothing dies in an email thread.",
    icon: "list-check",
    accent: ACCENT_UMBER,
    mock: "workflow",
    tabs: [
      {
        _key: "tasks-statuses",
        label: "Custom Statuses",
        icon: "circle-check",
        oneLiner: "Built-in review statuses, plus your own custom ones.",
        loss: "Without them, review state lives in people's heads.",
        href: "/review-workflows",
      },
      {
        _key: "tasks-workflows",
        label: "Workflows",
        icon: "route",
        oneLiner: "Multi-step review flows with client gates and escalation rules.",
        loss: "Without them, approvals run from memory and steps get skipped.",
        href: "/review-workflows",
      },
      {
        _key: "tasks-kanban",
        label: "Kanban",
        icon: "layout-kanban",
        oneLiner: "A built-in kanban board, or sync with the one you already run.",
        loss: "Without it, you run the studio from a spreadsheet and your memory.",
        href: "/kanban-board",
      },
      {
        _key: "tasks-integrations",
        label: "Integrations",
        icon: "plug",
        oneLiner:
          "One-click installs (Webflow, WordPress, Google Tag Manager); tasks sync two-way to Asana, Monday, ClickUp, with Slack notifications.",
        loss: "Without them, Superflow becomes one more silo to copy tasks out of.",
        href: "/preview/integrations",
      },
    ],
  },
];

const doc = {
  _id: "integrationPreviewPage-webflow",
  _type: "integrationPreviewPage",
  title: "Webflow",
  slug: { _type: "slug", current: "webflow" },
  family: "Install",
  cardBlurb: "A built-in install for Webflow sites.",
  hero: {
    kicker: "· WEBFLOW · THE AI QA REVIEWER FOR AGENCIES",
    headlineLines: ["Watch AI review", "your Webflow sites."],
    subhead:
      "Paste your agency's QA checklist. AI agents check every Webflow site change. Then your team approves. Then your client. No client login required. Installed in one click.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-agents", label: "Agents at Work", icon: "robot" },
      { _key: "ht-build", label: "Build Agents", icon: "wand" },
      { _key: "ht-install", label: "One-Click Install", icon: "plug" },
      { _key: "ht-guest", label: "Guest Mode", icon: "user-check" },
      { _key: "ht-private", label: "Private Comments", icon: "lock" },
    ],
  },
  solution: {
    heading: "Turn your QA process into a team of agents.",
    subheading: "Built from your checklist. They check, you decide.",
    variant: "checklist",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "First Draft",
    journeyEnd: "Client Approved",
    blocks: [
      ...HOME_BANDS,
      {
        _key: "block-install",
        title: "What the plugin does",
        description:
          "Superflow ships as a plugin in the Webflow Marketplace. Install it, authorize, pick your sites — the script is placed for you.",
        icon: "plug",
        accent: ACCENT_BLUE,
        mock: "workflow",
        tabs: [
          {
            _key: "install-snippet",
            label: "Placed for you",
            icon: "code-asterisk",
            oneLiner:
              "The plugin adds the Superflow snippet through Webflow's own custom-code surface. No copy-paste, no developer, nothing else touched.",
          },
          {
            _key: "install-verify",
            label: "Verified first",
            icon: "circle-check",
            oneLiner: "The verifier confirms the script before any review link goes out.",
          },
          {
            _key: "install-updates",
            label: "Auto-updates",
            icon: "refresh",
            oneLiner:
              "The plugin keeps the script current when Superflow updates it. No re-paste, ever.",
          },
          {
            _key: "install-uninstall",
            label: "Uninstall removes it",
            icon: "lock-open",
            oneLiner: "Uninstalling the plugin removes the script.",
          },
          {
            _key: "install-scope",
            label: "Minimal access",
            icon: "lock",
            oneLiner: "Requests custom-code access only, not full site admin.",
          },
          {
            _key: "install-cta",
            label: "Get the plugin on the Webflow Marketplace",
            icon: "plug",
            oneLiner: "Get the plugin on the Webflow Marketplace.",
            href: "https://webflow.com/apps/detail/superflow",
            listOnly: true,
          },
        ],
      },
      {
        _key: "block-behaves",
        title: "How the Webflow install behaves",
        description:
          "The guarantees behind the install, so any website still takes the snippet.",
        icon: "settings",
        accent: ACCENT_UMBER,
        mock: "workflow",
        tabs: [
          {
            _key: "behave-staging",
            label: "Staging and published",
            icon: "world",
            oneLiner: "Works on staging and published Webflow sites.",
          },
          {
            _key: "behave-sites",
            label: "Only the sites you pick",
            icon: "circle-check",
            oneLiner:
              "One connection covers the sites you pick, not your whole account.",
          },
          {
            _key: "behave-any",
            label: "Any website floor",
            icon: "code-asterisk",
            oneLiner: "Any website takes the snippet. Webflow just makes it one click.",
          },
          {
            _key: "behave-drop",
            label: "Resilient to drops",
            icon: "refresh",
            oneLiner:
              "If the connection drops, the site keeps its script. Reviews keep working.",
          },
          {
            _key: "behave-health",
            label: "Health in settings",
            icon: "history",
            oneLiner: "Connection health lives in settings.",
          },
          {
            _key: "behave-remove",
            label: "Remove removes it",
            icon: "lock-open",
            oneLiner: "Removing the integration removes the script.",
          },
        ],
      },
      {
        _key: "block-related",
        title: "Part of the integrations catalog",
        description:
          "Webflow is one connector in the catalog. Explore the other install paths.",
        icon: "plug",
        accent: ACCENT_PINK,
        mock: "workflow",
        tabs: [
          {
            _key: "related-lead",
            label: "Every tool, one review",
            icon: "plug",
            oneLiner:
              "Every tool, one review. Superflow connects to the tools your agency already runs.",
          },
          {
            _key: "related-wordpress",
            label: "WordPress",
            icon: "world",
            oneLiner: "A built-in install for WordPress sites.",
            href: "/preview/integrations/wordpress",
            listOnly: true,
          },
          {
            _key: "related-gtm",
            label: "Google Tag Manager",
            icon: "code-asterisk",
            oneLiner: "One tag covers any site that runs GTM.",
            href: "/preview/integrations/google-tag-manager",
            listOnly: true,
          },
          {
            _key: "related-hub",
            label: "All integrations",
            icon: "plug",
            oneLiner: "Every tool, one review.",
            href: "/preview/integrations",
            listOnly: true,
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Connect once. Agents check every launch.",
    steps: [
      {
        _key: "gs-connect",
        accent: ACCENT_BLUE,
        title: "Connect",
        description:
          "Install the Superflow plugin from the Webflow Marketplace and pick the site. One click, no developer, verified before anything goes out.",
      },
      {
        _key: "gs-build",
        accent: ACCENT_PLUM,
        title: "Build",
        description:
          "Paste your QA checklist and upload brand guides. Superflow assembles your named agents.",
      },
      {
        _key: "gs-review",
        accent: ACCENT_GREEN,
        title: "Review",
        description:
          "Agents check the site the moment it changes, desktop and mobile. Findings land as pinned comments. Your team decides.",
      },
      {
        _key: "gs-signoff",
        accent: ACCENT_UMBER,
        title: "Sign off",
        description:
          "Your client approves from a link. Superflow remembers for next time.",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-replace",
        question: "Does the AI replace my reviewers?",
        answer:
          "No. Agents run the first pass. A person on your team, or your client, always signs off. Nothing ships on an agent's say-so.",
      },
      {
        _key: "faq-check",
        question: "What can the agents check on a Webflow site?",
        answer:
          "Broken links, brand colors and fonts, spelling, placeholder text, and your own rules, on desktop and mobile, the moment the site changes.",
      },
      {
        _key: "faq-developer",
        question: "Do I need my developer for this?",
        answer:
          "No. Connect, pick the site, done. The developer path still exists for teams that prefer it.",
      },
      {
        _key: "faq-changes",
        question: "What exactly does Superflow change on my site?",
        answer:
          "One script, placed through Webflow's own custom-code surface. Nothing else.",
      },
      {
        _key: "faq-other-clients",
        question: "My other clients aren't on Webflow.",
        answer:
          "Any website takes the snippet, five minutes, yours or your developer's. Webflow is the one-click path, not the boundary.",
      },
      {
        _key: "faq-staging",
        question: "Does this work on a staging site?",
        answer: "Yes, staging and published both.",
      },
      {
        _key: "faq-cost",
        question: "What does it cost?",
        answer: "Included from the Growth plan. See /pricing for the breakdown.",
      },
    ],
  },
  metaTitle: "Webflow Integration: AI QA Review in One Click | Superflow",
  metaDescription:
    "AI agents review your Webflow sites the moment they change. Your team approves, your client signs off from a link. Installed in one click.",
};

async function main() {
  if (DRY_RUN) {
    console.log(JSON.stringify(doc, null, 2));
    return;
  }
  const res = await client.createOrReplace(doc);
  console.log("Seeded:", res._id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
