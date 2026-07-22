#!/usr/bin/env node
/**
 * Seed the "Google Tag Manager" `integrationPreviewPage` document in Sanity.
 *
 * Serves at /integrations/google-tag-manager. Reuses the 2026 homepage
 * sections as a fixed template (no asset uploads). Copy is verbatim from
 * ~/Downloads/superflow-website-6/integrations/gtm/superflow-page-integration-google-tag-manager-v3.md
 * (a v3 "home replica" page: hero + the four home bands + the one-tag install).
 * [bracketed] and *italic* notes are dropped; the shared trust strip and logo
 * strip map to hard-coded chrome and are not seeded. Band-2 link targets use
 * /comments (the shipped page) per the source's "one ruling" note. GTM ships no
 * public marketplace listing, so the install CTA points at the setup guide.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-integration-google-tag-manager.mjs
 *   DRY_RUN=1 node scripts/seed-integration-google-tag-manager.mjs
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

// The four "home bands", home-verbatim. Band-4 Integrations one-liner leads
// with Google Tag Manager per this page's verified-scope casting.
const HOME_BANDS = [
  {
    _key: "band-agents",
    title: "Build Agents That Review, Comment, and Remember",
    description:
      "Superflow builds them from your checklist. They check every site and leave findings as comments. Every review teaches Memory more. The next project starts already knowing the client.",
    icon: "sparkles",
    accent: ACCENT_PLUM,
    mock: "review-agents",
    tabs: [
      {
        _key: "agents-review",
        mock: "review-agents",
        label: "AI Review Agents",
        icon: "robot",
        oneLiner:
          "Your checklist, run by agents on every site, findings posted as comments.",
        loss: "Without them, senior people burn billable hours catching broken links and typos by hand.",
        href: "/ai-review-agents",
      },
      {
        _key: "agents-memory",
        mock: "client-memory",
        label: "Memory",
        icon: "database",
        oneLiner:
          "Every client's brand and past decisions, remembered and fed to the agents.",
        loss: "Without it, every project restarts from zero and you re-explain the brand each round.",
        href: "/memory",
      },
      {
        _key: "agents-ask",
        mock: "ask-ai",
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
        mock: "pinned-comments",
        label: "Pinned Comments",
        icon: "pin",
        oneLiner: "Pinned to the element, holding through edits and redeploys.",
        loss: "Without them, feedback scatters across email, Slack, and screenshots.",
        href: "/comments",
      },
      {
        _key: "comments-screenshot",
        mock: "auto-screenshot",
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
        mock: "private-comments",
        label: "Private Comments",
        icon: "lock",
        oneLiner: "Internal-only notes your team sees and the client never does.",
        loss: "Without them, your internal back-and-forth happens in front of the client.",
        href: "/private-comments",
        collapsesFirstTab: true,
      },
      {
        _key: "comments-live",
        mock: "live-site",
        label: "Live Site",
        icon: "world",
        oneLiner: "Comment on the real site, not a stale copy of it.",
        loss: "Without it, comments live on screenshots of a site that has already changed.",
        href: "/comments",
        collapsesFirstTab: true,
      },
      {
        _key: "comments-versioning",
        mock: "versioning",
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
        mock: "guest-mode",
        label: "Guest Mode",
        icon: "user-check",
        oneLiner:
          "Your client reviews from a link: no account, no login, from their phone.",
        loss: "Without it, you lose a week waiting for a client to log in and take a look.",
        href: "/client-review",
      },
      {
        _key: "approve-login",
        mock: "behind-login",
        label: "Behind Login",
        icon: "lock",
        oneLiner:
          "Comment on dashboards, portals, and any page that needs an account.",
        loss: "Without it, the gated, logged-in half of the work cannot be reviewed in context.",
        href: "/authenticated-pages",
      },
      {
        _key: "approve-devices",
        mock: "all-devices",
        label: "Mobile and Desktop",
        icon: "devices",
        oneLiner: "Both views, findings tagged by device.",
        loss: "Without it, mobile feedback turns into screenshots texted around.",
        href: "/cross-device-review",
      },
      {
        _key: "approve-record",
        mock: "record-walkthrough",
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
        mock: "custom-statuses",
        label: "Custom Statuses",
        icon: "circle-check",
        oneLiner: "Built-in review statuses, plus your own custom ones.",
        loss: "Without them, review state lives in people's heads.",
        href: "/review-workflows",
      },
      {
        _key: "tasks-workflows",
        mock: "workflows",
        label: "Workflows",
        icon: "route",
        oneLiner: "Multi-step review flows with client gates and escalation rules.",
        loss: "Without them, approvals run from memory and steps get skipped.",
        href: "/review-workflows",
      },
      {
        _key: "tasks-kanban",
        mock: "kanban",
        label: "Kanban",
        icon: "layout-kanban",
        oneLiner: "A built-in kanban board, or sync with the one you already run.",
        loss: "Without it, you run the studio from a spreadsheet and your memory.",
        href: "/kanban-board",
      },
      {
        _key: "tasks-integrations",
        mock: "integrations",
        label: "Integrations",
        icon: "plug",
        oneLiner:
          "One-tag or one-click installs (Google Tag Manager, WordPress, Webflow); tasks sync two-way to Asana, Monday, ClickUp, with Slack notifications.",
        loss: "Without them, Superflow becomes one more silo to copy tasks out of.",
        href: "/integrations",
      },
    ],
  },
];

const doc = {
  _id: "integrationPreviewPage-google-tag-manager",
  _type: "integrationPreviewPage",
  title: "Google Tag Manager",
  slug: { _type: "slug", current: "google-tag-manager" },
  family: "Install",
  cardBlurb: "One tag covers any site that runs GTM.",
  hero: {
    kicker: "GOOGLE TAG MANAGER · THE AI QA REVIEWER FOR AGENCIES",
    headlineLines: ["Watch AI review every", "site in your container."],
    subhead:
      "Paste your agency's QA checklist. AI agents check every site your container runs on. Then your team approves. Then your client. No client login required. One tag.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-agents", label: "Agents at Work", icon: "robot" },
      { _key: "ht-build", label: "Build Agents", icon: "wand" },
      { _key: "ht-install", label: "One-Tag Install", icon: "plug" },
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
    // The four home bands only. The former "What the tag does" /
    // "How the GTM install behaves" / catalog blocks now render as the
    // bespoke InstallSections (components/integration-2026/InstallSections.tsx).
    blocks: [...HOME_BANDS],
  },
  getStarted: {
    heading: "One tag in. Agents on every site.",
    steps: [
      {
        _key: "gs-add",
        accent: ACCENT_BLUE,
        title: "Add",
        description:
          "Drop the Superflow tag into your container and publish. The verifier confirms the script.",
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
          "Agents check each site the moment it changes, desktop and mobile. Findings land as pinned comments. Your team decides.",
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
        question: "What can the agents check?",
        answer:
          "Broken links, brand colors and fonts, spelling, placeholder text, and your own rules, on desktop and mobile, the moment a site changes.",
      },
      {
        _key: "faq-platforms",
        question: "Which platforms does this cover?",
        answer:
          "Any site the container fires on. The platform underneath doesn't matter.",
      },
      {
        _key: "faq-code",
        question: "Do I need code access?",
        answer: "No. If you can edit the container, you can install Superflow.",
      },
      {
        _key: "faq-native",
        question: "Is a tag manager install as good as the native one?",
        answer:
          "For review, yes. The native apps add convenience, like updates inside the platform's own surface. The tag covers everything else.",
      },
      {
        _key: "faq-changes",
        question: "What does the tag change on my site?",
        answer:
          "It loads the review script. Nothing else. Remove the tag, and it's gone.",
      },
      {
        _key: "faq-cost",
        question: "What does it cost?",
        answer: "Included from the Growth plan. See /pricing for the breakdown.",
      },
    ],
  },
  metaTitle: "GTM Integration: AI QA Review with One Tag | Superflow",
  metaDescription:
    "Add one tag to your GTM container and AI agents review every site it runs on, the moment they change. Your team approves, your client signs off from a link.",
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
