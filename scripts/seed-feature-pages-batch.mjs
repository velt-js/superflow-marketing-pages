#!/usr/bin/env node
/**
 * Batch-seed ten `featurePage` documents in Sanity.
 *
 * Each page serves at /<slug> and reuses the 2026 homepage
 * sections (components/home-2026/*) as a fixed template — only the hero copy,
 * the hero tab strip, the "solution" intro, the FeatureSet blocks, the FAQ and
 * SEO vary per page, so this seed is pure text/config with NO asset uploads.
 *
 * Copy is authored from the per-page markdown specs in
 * ~/Downloads/superflow-website-4/features-*. Production tags ([VERIFY],
 * [ASSET], [FLAG]) and any held/parked placeholder content are stripped; no
 * metrics, KPIs or testimonials the specs mark unavailable are invented.
 *
 * Every page's `hero.tabs` supplies its OWN tab labels for the shared white
 * "New Website Workflow" hero window; icon names come from the canonical
 * hero-tab registry (HERO_TAB_ICONS in components/home-2026/HeroIcons.tsx).
 * FeatureSet block/tab icon names come from FEATURE_SET_ICON_NAMES
 * (sanity/schemas/featurePage.ts).
 *
 * This script only ever `createOrReplace`s the ten documents below; it never
 * deletes any other document.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-feature-pages-batch.mjs
 *   DRY_RUN=1 node scripts/seed-feature-pages-batch.mjs
 */
import { createClient } from "@sanity/client";

const DRY_RUN = process.env.DRY_RUN === "1";
const token = process.env.SANITY_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error("Set SANITY_API_TOKEN env var, or DRY_RUN=1.");
  process.exit(1);
}

/** Shared "Install" get-started step, canonical across every feature page. */
const INSTALL_STEP = {
  _key: "gs-install",
  accent: "#d43f8d",
  title: "Add the snippet in 30 seconds",
  description:
    "Or upload a file. One click for WordPress, Webflow, Framer, Shopify.",
};

const client = DRY_RUN
  ? null
  : createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sckr62cw",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    });

const memory = {
  _id: "featurePage-memory",
  _type: "featurePage",
  title: "Memory",
  slug: { _type: "slug", current: "memory" },
  hero: {
    headlineLines: ["Superflow remembers", "every client"],
    subhead:
      "Upload brand guides and checklists once. Memory learns the rest from every review: rules, taste, past decisions. Agents check against it. Ask AI answers from it.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-upload", label: "Upload once", icon: "share" },
      { _key: "ht-learned", label: "Learned from reviews", icon: "history" },
      { _key: "ht-applied", label: "Applied to the next asset", icon: "robot" },
      { _key: "ht-suggest", label: "Proactive suggestions", icon: "sparkles" },
      { _key: "ht-askai", label: "Powers Ask AI", icon: "message" },
    ],
  },
  solution: {
    heading: "Every client, remembered",
    subheading:
      "Memory is Superflow's per-client brain: it stores what you upload and learns what every review teaches.",
    variant: "memory-guidelines",
    icon: "sheet-brain",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "First Upload",
    journeyEnd: "Sharper Reviews",
    blocks: [
      {
        _key: "block-in",
        title: "What goes in",
        description:
          "Brand guides, guidelines, and checklists go in once, and every review teaches Memory more about each client.",
        icon: "database",
        accent: "#433df3",
        mock: "client-memory",
        tabs: [
          {
            _key: "one-time-uploads",
            label: "One-time uploads",
            icon: "share",
            oneLiner:
              "Brand guides, guidelines, and review checklists go in at setup, per client.",
            mock: "memory-upload-scan",
          },
          {
            _key: "learning-from-reviews",
            label: "Learning from reviews",
            icon: "history",
            oneLiner:
              "Every accept or reject teaches Memory more about that client.",
            mock: "memory-learning",
          },
        ],
      },
      {
        _key: "block-holds",
        title: "What it holds",
        description:
          "Everything Memory keeps is scoped to one client — rules, taste, and decisions, held apart from every other account.",
        icon: "database",
        accent: "#109534",
        mock: "client-memory",
        tabs: [
          {
            _key: "per-client-memory",
            label: "Per-client memory",
            icon: "lock",
            oneLiner:
              "Rules, taste, and decisions stay scoped to one client, never bleeding into another.",
            mock: "memory-per-client",
          },
          {
            _key: "scoped-three-ways",
            label: "Scoped three ways",
            icon: "layout-dashboard",
            oneLiner:
              "Agency-wide standards, per-client rules, and any knowledge base you upload.",
            mock: "memory-scoped-three",
          },
        ],
      },
      {
        _key: "block-feeds",
        title: "What it feeds",
        description:
          "Memory grounds the agents, powers Ask AI, and surfaces suggestions before mistakes ship.",
        icon: "sparkles",
        accent: "#e0820a",
        mock: "client-memory",
        tabs: [
          {
            _key: "agent-grounding",
            label: "Agent grounding",
            icon: "robot",
            oneLiner:
              "Agents check every new asset against that client's memory, not just generic rules.",
            mock: "review-agents-memory",
          },
          {
            _key: "proactive-suggestions",
            label: "Proactive suggestions",
            icon: "sparkles",
            oneLiner:
              "Memory flags a likely miss before review starts, from what this client rejected before.",
          },
          {
            _key: "ask-ai-source",
            label: "Ask AI's source",
            icon: "message-chatbot",
            oneLiner:
              "Every answer Ask AI gives is grounded in what Memory holds.",
            mock: "ask-ai",
          },
        ],
      },
      {
        _key: "block-compounds",
        title: "Why it compounds",
        description:
          "The more a client reviews, the more their next review starts already knowing.",
        icon: "refresh",
        accent: "#a21caf",
        mock: "client-memory",
        tabs: [
          {
            _key: "sharper-every-project",
            label: "Sharper every project",
            icon: "brain",
            oneLiner:
              "Project ten starts already knowing what project one had to learn.",
            mock: "applied-next-asset",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with Memory in a minute",
    subheading: "Four steps, no engineer required.",
    steps: [
      INSTALL_STEP,
      {
        _key: "gs-teach",
        accent: "#433df3",
        title: "Teach it once per client",
        description:
          "Upload brand guides, guidelines, and checklists. Memory loads them for every review.",
      },
      {
        _key: "gs-review",
        accent: "#109534",
        title: "Review against that client's memory",
        description:
          "Agents check every asset against it, and every human comment teaches it more.",
      },
      {
        _key: "gs-signoff",
        accent: "#e0820a",
        title: "Sign off, and it remembers",
        description:
          "What your client approves becomes the rule next time, so your team doesn't have to.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-review-agents",
        title: "AI review agents",
        description: "The checks Memory makes client-specific.",
        href: "/ai-review-agents",
        icon: "robot",
      },
      {
        _key: "rc-ask-ai",
        title: "Ask AI",
        description: "The questions Memory makes answerable.",
        href: "/ask-ai",
        icon: "message-chatbot",
      },
      {
        _key: "rc-client-review",
        title: "Client review",
        description: "The approvals that teach Memory what each client accepts.",
        href: "/client-review",
        icon: "circle-check",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-store",
        question: "What does Memory actually store?",
        answer:
          "Two things: what you upload — brand guides, guidelines, and checklists — and what reviews teach it: each client's rules, taste, and decisions, scoped per client.",
      },
      {
        _key: "faq-training",
        question: "Is my data used to train models for other customers?",
        answer:
          "No. One client's memory never informs another client, and one customer's data never trains another's.",
      },
      {
        _key: "faq-edit",
        question: "Can I see and edit what it remembers?",
        answer:
          "Yes. Every entry is inspectable, editable, and deletable, and cites the upload or review that taught it.",
      },
      {
        _key: "faq-same-upload",
        question: "Is this the same brand guide I upload when building an agent?",
        answer:
          "Yes — one upload, one record. Teach it in Memory settings or during agent creation; both feed the same client memory.",
      },
      {
        _key: "faq-day-one",
        question: "Does Memory work from day one, or does it need history?",
        answer:
          "Day one: uploads apply immediately. The learning half compounds from your first review onward.",
      },
      {
        _key: "faq-rebrand",
        question: "What happens when a client rebrands?",
        answer:
          "Replace the upload. New decisions supersede old entries, and agents check against the current record.",
      },
      {
        _key: "faq-vs-drive",
        question: "How is this different from a shared drive of brand guides?",
        answer:
          "A drive stores documents. Memory applies them: agents check against it, Ask AI answers from it, and every review adds to it.",
      },
      {
        _key: "faq-cost",
        question: "What does Memory cost?",
        answer:
          "It's included on every paid plan — it powers the agents and Ask AI rather than billing separately.",
      },
    ],
  },
  metaTitle: "AI Client Memory for Agencies | Superflow",
  metaDescription:
    "Upload brand guides and checklists once. Memory learns each client from every review, feeds the QA agents, and powers Ask AI. Your team decides.",
};

const kanbanBoard = {
  _id: "featurePage-kanban-board",
  _type: "featurePage",
  title: "Kanban Board",
  slug: { _type: "slug", current: "kanban-board" },
  hero: {
    headlineLines: ["Every review on one board.", "Yours or ours."],
    subhead:
      "Everything awaiting review, revision, or sign-off, across every client. Use the built-in kanban, or keep your own: webhooks, and two-way sync with Asana, Monday, ClickUp.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-board", label: "The board", icon: "layout-kanban" },
      { _key: "ht-moves", label: "It moves itself", icon: "bolt" },
      { _key: "ht-statuses", label: "Custom statuses", icon: "settings" },
      { _key: "ht-yours", label: "Yours, not ours", icon: "plug" },
      { _key: "ht-filters", label: "Filters", icon: "list-check" },
    ],
  },
  solution: {
    heading: "The pipeline, finally visible",
    subheading:
      "Every review, across every client, on one board that updates itself from review activity.",
    variant: "kanban",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Feedback",
    journeyEnd: "Shipped",
    blocks: [
      {
        _key: "block-one-board",
        title: "One board, every client",
        description:
          "Every client's queue on a single board, filtered to one account or project in a click.",
        icon: "layout-kanban",
        accent: "#433df3",
        mock: "kanban-cross-client",
        tabs: [
          {
            _key: "cross-client-board",
            label: "Cross-client board",
            icon: "layout-kanban",
            oneLiner:
              "Every client's queue on one board: awaiting review, in revision, ready to ship.",
            mock: "kanban-cross-client",
          },
          {
            _key: "filters",
            label: "Filters by client and project",
            icon: "list-check",
            oneLiner:
              "Cut the board to one client or one project in a click.",
            mock: "kanban-filters",
          },
        ],
      },
      {
        _key: "block-moves",
        title: "It moves itself",
        description:
          "Review activity drives the status, and the columns match how your team already works.",
        icon: "bolt",
        accent: "#109534",
        mock: "kanban-self-moving",
        tabs: [
          {
            _key: "self-moving-cards",
            label: "Self-moving cards",
            icon: "refresh",
            oneLiner:
              "A resolved thread, a fresh finding, or a client approval each moves the card.",
            mock: "kanban-self-moving",
          },
          {
            _key: "custom-statuses",
            label: "Custom statuses as columns",
            icon: "settings",
            oneLiner:
              "Add the statuses your team already uses and each becomes a column.",
            mock: "custom-statuses",
          },
        ],
      },
      {
        _key: "block-yours",
        title: "Yours, connected",
        description:
          "Keep the board you already run: two-way sync, webhooks out, and the REST API in.",
        icon: "plug",
        accent: "#e0820a",
        mock: "integrations",
        tabs: [
          {
            _key: "two-way-sync",
            label: "Two-way Asana, Monday, ClickUp",
            icon: "refresh",
            oneLiner:
              "Pre-built integrations sync cards both directions: close it there, it closes here.",
          },
          {
            _key: "webhooks-out",
            label: "Webhooks out",
            icon: "bolt",
            oneLiner:
              "Every review event can fire a webhook into any system you run.",
          },
          {
            _key: "rest-api-in",
            label: "REST API in",
            icon: "code-asterisk",
            oneLiner:
              "Push updates back into Superflow from your own tools.",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with the board in a minute",
    subheading: "Three steps, no engineer required.",
    steps: [
      INSTALL_STEP,
      {
        _key: "gs-review",
        accent: "#433df3",
        title: "Run reviews as usual",
        description:
          "Every comment, finding, status, and approval writes the board.",
      },
      {
        _key: "gs-track",
        accent: "#109534",
        title: "Watch the board",
        description:
          "Filter by client or project, or work from Asana, Monday, and ClickUp.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-review-workflows",
        title: "Review workflows",
        description: "Where statuses, gates, and escalation rules get defined.",
        href: "/review-workflows",
        icon: "route",
      },
      {
        _key: "rc-integrations",
        title: "Integrations",
        description: "The full hub behind the two-way sync, webhooks, and the API.",
        href: "/integrations",
        icon: "plug",
      },
      {
        _key: "rc-review-agents",
        title: "AI review agents",
        description: "The first pass whose findings move cards before anyone looks.",
        href: "/ai-review-agents",
        icon: "robot",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-move",
        question: "Do I have to move the cards myself?",
        answer:
          "No. Review activity moves them: a resolved thread, a new finding, a client approval. You can still drag any card by hand.",
      },
      {
        _key: "faq-statuses",
        question: "Can I use my own statuses?",
        answer:
          "Yes. Add the statuses your team already uses and each becomes a column, so the board matches your process instead of replacing it.",
      },
      {
        _key: "faq-asana",
        question: "We live in Asana. Do we have to switch?",
        answer:
          "No. The pre-built Asana, Monday, and ClickUp integrations sync two-way: work where you already work, and both boards stay true.",
      },
      {
        _key: "faq-other-tools",
        question: "What about tools you don't integrate with?",
        answer:
          "Webhooks fire out to any system on every review event, and the REST API pushes updates back in.",
      },
      {
        _key: "faq-two-way",
        question: "Is the sync really two-way?",
        answer:
          "For Asana, Monday, and ClickUp, yes. Webhooks are one direction, out; the API is the way back in.",
      },
      {
        _key: "faq-client-board",
        question: "Can my client see the board?",
        answer:
          "Clients review from a link: no account, no login, no app, from their phone.",
      },
      {
        _key: "faq-cost",
        question: "What does the kanban board cost?",
        answer:
          "Included on every plan; the board is how Superflow shows review state, not an add-on.",
      },
    ],
  },
  metaTitle: "Kanban Board for Client Reviews | Superflow",
  metaDescription:
    "Every review, every client, one kanban board that updates itself from review activity. Use the built-in board, or sync Asana, Monday, ClickUp two-way.",
};

const authenticatedPages = {
  _id: "featurePage-authenticated-pages",
  _type: "featurePage",
  title: "Authenticated Pages",
  slug: { _type: "slug", current: "authenticated-pages" },
  hero: {
    headlineLines: ["Review every page", "behind a login"],
    subhead:
      "Superflow is installed on your site, not a proxy. Review works wherever the viewer is logged in: password, Okta, SSO. Client portals, member areas, and staging included.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-password", label: "Behind a password", icon: "lock" },
      { _key: "ht-okta", label: "Behind Okta", icon: "key" },
      { _key: "ht-sso", label: "Behind SSO", icon: "lock-open" },
      { _key: "ht-portal", label: "The client's own portal", icon: "user-check" },
    ],
  },
  solution: {
    heading: "Both halves of the work, reviewed",
    subheading:
      "Superflow installs on the site itself, so review runs behind passwords, Okta, and SSO — wherever the viewer is logged in.",
    variant: "authenticated-pages",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Locked Out",
    journeyEnd: "Signed Off",
    blocks: [
      {
        _key: "block-on-site",
        title: "On the site, not a proxy",
        description:
          "Superflow loads with the page inside the viewer's own session, so the login never blocks a review.",
        icon: "lock-open",
        accent: "#433df3",
        mock: "auth-behind-password",
        tabs: [
          {
            _key: "review-inside-login",
            label: "Review inside the login",
            icon: "lock",
            oneLiner:
              "Superflow loads with the page, inside the viewer's own session.",
            mock: "auth-behind-password",
          },
          {
            _key: "one-snippet-for-it",
            label: "One snippet for IT",
            icon: "code-asterisk",
            oneLiner:
              "IT approves one snippet once — no browser extensions, no proxy fetching your page.",
            mock: "auth-on-site",
          },
          {
            _key: "credential-free",
            label: "Credential-free review",
            icon: "checks",
            oneLiner:
              "Superflow never sees or stores a password; the viewer's own session authenticates.",
            mock: "auth-behind-password",
          },
        ],
      },
      {
        _key: "block-auth-types",
        title: "Password, Okta, SSO",
        description:
          "If your users can log in, review works there — on staging, portals, member areas, and intranets.",
        icon: "lock",
        accent: "#109534",
        mock: "auth-types",
        tabs: [
          {
            _key: "auth-types",
            label: "Password, Okta, SSO",
            icon: "lock",
            oneLiner: "If your users can log in, review works there.",
            mock: "auth-types",
          },
          {
            _key: "staging-basic-auth",
            label: "Staging behind basic auth",
            icon: "code-asterisk",
            oneLiner:
              "Password-protected staging gets the same review as the live site.",
            mock: "auth-behind-password",
          },
          {
            _key: "portals-intranets",
            label: "Portals, member areas, intranets",
            icon: "layout-dashboard",
            oneLiner:
              "The pages only logged-in users see, reviewed in place.",
            mock: "auth-client-portal",
          },
        ],
      },
      {
        _key: "block-client",
        title: "Your client, logged in",
        description:
          "Your enterprise client reviews their gated dashboard from inside their own system.",
        icon: "user-check",
        accent: "#e0820a",
        mock: "auth-client-portal",
        tabs: [
          {
            _key: "client-own-portal",
            label: "Client review on their own portal",
            icon: "user-check",
            oneLiner:
              "Your client opens their gated dashboard logged into their own system and approves — no Superflow account.",
            mock: "auth-client-portal",
          },
        ],
      },
      {
        _key: "block-parity",
        title: "Full parity",
        description:
          "Gated pages get the same review process, audit trail, and snapshots as public ones.",
        icon: "checks",
        accent: "#a21caf",
        mock: "auth-types",
        tabs: [
          {
            _key: "one-process",
            label: "One review process, everywhere",
            icon: "checks",
            oneLiner:
              "Comments, threads, approvals, and the audit trail behave identically on gated and public pages.",
            mock: "auth-types",
          },
          {
            _key: "snapshots-behind-login",
            label: "Snapshots behind the login",
            icon: "camera",
            oneLiner:
              "Automatic screenshots capture gated pages too, from inside the session, so every comment keeps its proof.",
            mock: "auto-screenshot",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started behind your login in a minute",
    subheading: "Three steps, no engineer required.",
    steps: [
      {
        _key: "gs-install",
        accent: "#d43f8d",
        title: "One snippet on the site, in 30 seconds",
        description:
          "That's why auth works: review runs in the viewer's session.",
      },
      {
        _key: "gs-review",
        accent: "#433df3",
        title: "Open the gated page logged in, and comment",
        description: "Invite your team and your client — no account needed.",
      },
      {
        _key: "gs-signoff",
        accent: "#109534",
        title: "Your client approves from inside their portal",
        description: "No Superflow account, and the decision is recorded.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-screenshots",
        title: "Automatic screenshots",
        description:
          "The capture that backs every comment, behind the login included.",
        href: "/screenshots",
        icon: "camera",
      },
      {
        _key: "rc-client-review",
        title: "Client review",
        description:
          "The no-account link; here the client is logged into their own system.",
        href: "/client-review",
        icon: "circle-check",
      },
      {
        _key: "rc-trust",
        title: "Trust",
        description: "Where credentials, SOC 2, and HIPAA get their full answers.",
        href: "/trust",
        icon: "checks",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-credentials",
        question: "Does Superflow see or store my users' credentials?",
        answer:
          "No. The login happens between your user and your site, the same as when Superflow is not there. Review runs where the viewer is already logged in, and no password passes through Superflow.",
      },
      {
        _key: "faq-auth-types",
        question: "Which auth types does it work behind?",
        answer:
          "Password-protected sites, Okta, and SSO. Because Superflow is installed on the site itself, the login in front of it does not change how review works.",
      },
      {
        _key: "faq-staging",
        question: "Does it work on staging behind basic auth?",
        answer:
          "Yes. A password-protected staging site gets the same review as production: comments in place, approvals, the full audit trail.",
      },
      {
        _key: "faq-client-account",
        question:
          "Can my enterprise client review their gated portal without a Superflow account?",
        answer:
          "Yes. They stay logged into their own system, not ours, and review from a link: no account, no login, no app, from their phone.",
      },
      {
        _key: "faq-proxy",
        question: "Why do proxy or snapshot tools break behind my login?",
        answer:
          "They load your page through a proxy or a snapshot, and their servers are not logged in to your site. Superflow runs on the site itself, so there's nothing between the viewer and the page.",
      },
      {
        _key: "faq-it",
        question: "What does IT need to approve?",
        answer:
          "One snippet on the site, the same class of install as an analytics tag. No reviewer extensions, no proxy in the network path.",
      },
      {
        _key: "faq-compliance",
        question: "Is this SOC 2 and HIPAA relevant?",
        answer:
          "If your gated pages carry patient, member, or financial data, yes. Superflow's controls, SOC 2 Type II, and HIPAA with a BAA are documented on the trust page.",
      },
      {
        _key: "faq-cost",
        question: "What does authenticated-pages review cost?",
        answer:
          "Nothing separate. It's how the product works: one install covers the public and gated halves of a site.",
      },
    ],
  },
  metaTitle: "Authenticated-Pages Review for Agencies | Superflow",
  metaDescription:
    "Superflow is installed on your site, so review works behind passwords, Okta, and SSO. Your client reviews their gated portal with no Superflow account.",
};

const screenshots = {
  _id: "featurePage-screenshots",
  _type: "featurePage",
  title: "Screenshots",
  slug: { _type: "slug", current: "screenshots" },
  hero: {
    headlineLines: ["Every comment", "captures the page"],
    subhead:
      "Superflow snapshots the page the moment you comment. Public or password protected, no extension. The page changes, the snapshot stays.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-saved", label: "Comment, snapshot saved", icon: "camera" },
      { _key: "ht-changed", label: "The page changed", icon: "history" },
      { _key: "ht-password", label: "Behind a password", icon: "lock" },
      { _key: "ht-client", label: "The client's view", icon: "eye" },
    ],
  },
  solution: {
    heading: "Proof that outlives the page",
    subheading:
      "Every comment captures the page as the reviewer saw it — so the fix never starts from a guess.",
    variant: "screenshots",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Comment",
    journeyEnd: "Proof",
    blocks: [
      {
        _key: "block-captured",
        title: "Captured automatically",
        description:
          "Every comment saves the page as the reviewer saw it, on public and gated sites, no extension.",
        icon: "camera",
        accent: "#a21caf",
        mock: "screenshot-capture",
        tabs: [
          {
            _key: "comment-time-capture",
            label: "Comment-time capture",
            icon: "camera",
            oneLiner:
              "Every comment saves the page as the reviewer saw it, automatically.",
            mock: "screenshot-capture",
          },
          {
            _key: "no-extension",
            label: "No browser extension",
            icon: "checks",
            oneLiner:
              "Capture runs from the site install itself; reviewers and clients add nothing.",
            mock: "screenshot-no-extension",
          },
          {
            _key: "password-capture",
            label: "Password-protected capture",
            icon: "lock",
            oneLiner:
              "Works behind a login the same as on public pages.",
            mock: "behind-login",
          },
        ],
      },
      {
        _key: "block-changes",
        title: "When the page changes",
        description:
          "When an edit costs a comment its anchor, the snapshot still shows the original page.",
        icon: "history",
        accent: "#433df3",
        mock: "screenshot-then-and-now",
        tabs: [
          {
            _key: "lost-anchor",
            label: "Lost-anchor fallback",
            icon: "pin",
            oneLiner:
              "When an element is edited away, the comment keeps its snapshot.",
            mock: "screenshot-then-and-now",
          },
          {
            _key: "then-and-now",
            label: "Then-and-now view",
            icon: "devices",
            oneLiner:
              "Open a comment and see the captured page beside the live one.",
            mock: "screenshot-then-and-now",
          },
        ],
      },
      {
        _key: "block-shared",
        title: "Shared proof",
        description:
          "You and your client look at the same full page, from any device.",
        icon: "share",
        accent: "#109534",
        mock: "screenshot-client-view",
        tabs: [
          {
            _key: "client-snapshots",
            label: "Client-visible snapshots",
            icon: "user-check",
            oneLiner:
              "Your client sees the same snapshot from their link — no account, from their phone.",
            mock: "screenshot-client-view",
          },
          {
            _key: "full-page-context",
            label: "Full-page context",
            icon: "layout-dashboard",
            oneLiner:
              "The capture holds the whole page, not a cropped fragment.",
            mock: "screenshot-full-page",
          },
        ],
      },
      {
        _key: "block-record",
        title: "On the record",
        description:
          "The review record keeps the pages as reviewers saw them, comment by comment.",
        icon: "checks",
        accent: "#e0820a",
        mock: "screenshot-record",
        tabs: [
          {
            _key: "approvals-context",
            label: "Approvals with context",
            icon: "circle-check",
            oneLiner:
              "The review record keeps the pages as reviewers saw them, comment by comment.",
            mock: "screenshot-record",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with Screenshots in a minute",
    subheading: "Three steps, no engineer required.",
    steps: [
      INSTALL_STEP,
      {
        _key: "gs-review",
        accent: "#433df3",
        title: "Leave comments as usual",
        description:
          "Each one snapshots the page, behind logins too, no extension.",
      },
      {
        _key: "gs-signoff",
        accent: "#109534",
        title: "Fix from the snapshot",
        description:
          "Your team fixes from proof, and your client approves from the link.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-authenticated-pages",
        title: "Authenticated pages",
        description: "The full behind-login review story.",
        href: "/authenticated-pages",
        icon: "lock",
      },
      {
        _key: "rc-review-agents",
        title: "AI review agents",
        description:
          "Agents leave findings as comments on the same pages your team snapshots.",
        href: "/ai-review-agents",
        icon: "robot",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-extension",
        question: "Do reviewers need a browser extension?",
        answer:
          "No. Nothing to install for reviewers or clients. Capture runs from the Superflow install on the site itself.",
      },
      {
        _key: "faq-password",
        question: "Does it work on password-protected pages?",
        answer:
          "Yes. Gated pages capture the same as public ones.",
      },
      {
        _key: "faq-anchor",
        question:
          "What happens when the page changes and the comment's anchor is lost?",
        answer:
          "The snapshot remains. The comment still opens to the page as it was, so the fix never starts from a guess.",
      },
      {
        _key: "faq-retention",
        question: "How long are snapshots kept?",
        answer:
          "They stay with their comments for the life of the project.",
      },
      {
        _key: "faq-client-view",
        question: "Does my client see the snapshot too?",
        answer:
          "Yes. Your client opens the same snapshot from their review link, on their phone, nothing to install.",
      },
      {
        _key: "faq-remember",
        question: "Do I have to remember to capture anything?",
        answer:
          "No. Capture is automatic with every comment. There's no button to forget.",
      },
      {
        _key: "faq-vs-paste",
        question: "How is this different from pasting screenshots into a comment?",
        answer:
          "Pasted screenshots are optional, stale, and scattered across Slack and email. Here every comment carries one, taken automatically at that moment.",
      },
      {
        _key: "faq-cost",
        question: "What do automatic screenshots cost?",
        answer:
          "Included on every plan; capture is part of commenting, not an add-on.",
      },
    ],
  },
  metaTitle: "Automatic Screenshots for Agencies | Superflow",
  metaDescription:
    "Every comment captures the page as the reviewer saw it. Public or password-protected sites, no extension. When the page changes, the snapshot remains.",
};

const reviewWorkflows = {
  _id: "featurePage-review-workflows",
  _type: "featurePage",
  title: "Review Workflows",
  slug: { _type: "slug", current: "review-workflows" },
  hero: {
    headlineLines: ["Humans and agents", "in one workflow"],
    subhead:
      "Arrange your reviewers and AI agents in a visual flow. It starts the moment the site changes. Conditions move work forward. The client gate comes last.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-sample", label: "The sample flow", icon: "route" },
      { _key: "ht-push", label: "Triggered by a push", icon: "bolt" },
      { _key: "ht-build", label: "Build a step", icon: "layout-dashboard" },
      { _key: "ht-condition", label: "Set a condition", icon: "check" },
      { _key: "ht-gate", label: "The client gate", icon: "user-check" },
    ],
  },
  solution: {
    heading: "The process, out of your head",
    subheading:
      "Put your reviewers and AI agents in a visual flow, with conditions that move work forward and the client gate last.",
    variant: "review-workflows",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "First Draft",
    journeyEnd: "Client Approved",
    blocks: [
      {
        _key: "block-steps",
        title: "The steps",
        description:
          "Drag agents, reviewers, and the client gate into order — and let a push start the flow.",
        icon: "route",
        accent: "#433df3",
        mock: "flow-build",
        tabs: [
          {
            _key: "visual-builder",
            label: "Visual builder",
            icon: "layout-dashboard",
            oneLiner:
              "Drag steps into order: agents, reviewers, the client gate — no engineer, no config file.",
            mock: "flow-build",
          },
          {
            _key: "human-agent-steps",
            label: "Human and agent steps",
            icon: "robot",
            oneLiner:
              "AI agents and your reviewers sit in the same flow: agents run the first pass, people own the calls.",
            mock: "flow-sample",
          },
          {
            _key: "push-triggered",
            label: "Push-triggered runs",
            icon: "bolt",
            oneLiner:
              "A new deploy starts the flow on its own: GitHub, Vercel, or any change to the live site.",
            mock: "flow-push",
          },
        ],
      },
      {
        _key: "block-rules",
        title: "The rules",
        description:
          "Conditions, parallel steps, and escalation decide when and how work moves.",
        icon: "settings",
        accent: "#109534",
        mock: "flow-condition",
        tabs: [
          {
            _key: "conditions",
            label: "Conditions",
            icon: "circle-check",
            oneLiner:
              "Work moves forward only when the condition is met: zero criticals, all findings resolved, approved.",
            mock: "flow-condition",
          },
          {
            _key: "parallel-steps",
            label: "Parallel steps",
            icon: "route",
            oneLiner:
              "Design review and copy review run at the same time, and the flow waits for both.",
            mock: "flow-parallel",
          },
          {
            _key: "escalation",
            label: "Escalation",
            icon: "history",
            oneLiner:
              "A step that sits too long escalates to a senior reviewer, or nudges a quiet client.",
            mock: "flow-escalation",
          },
        ],
      },
      {
        _key: "block-finish",
        title: "The finish",
        description:
          "The client gate closes the flow, notifications fire, and every project follows the same path.",
        icon: "user-check",
        accent: "#e0820a",
        mock: "flow-gate",
        tabs: [
          {
            _key: "client-gate",
            label: "The client gate",
            icon: "user-check",
            oneLiner:
              "The last node: your client approves from a link, no account, from their phone.",
            mock: "flow-gate",
          },
          {
            _key: "notifications",
            label: "Step and flow notifications",
            icon: "send",
            oneLiner:
              "Slack or email fires when a node clears, and when the whole flow completes.",
            mock: "flow-notifications",
          },
          {
            _key: "one-flow",
            label: "One flow, every project",
            icon: "refresh",
            oneLiner:
              "Apply a workflow across projects and clients, and every build takes the same path.",
            mock: "flow-one-flow",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with workflows in a minute",
    subheading: "Three steps, no engineer required.",
    steps: [
      INSTALL_STEP,
      {
        _key: "gs-design",
        accent: "#433df3",
        title: "Drag reviewers, agents, and conditions into a flow",
        description: "Put the client gate last.",
      },
      {
        _key: "gs-run",
        accent: "#109534",
        title: "Work enters and the flow routes it",
        description: "Slack or email fires as each step clears.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-kanban-board",
        title: "Kanban board",
        description: "The flow's statuses become the board's columns.",
        href: "/kanban-board",
        icon: "layout-kanban",
      },
      {
        _key: "rc-review-agents",
        title: "AI review agents",
        description: "The agent packs your flow's machine steps run.",
        href: "/ai-review-agents",
        icon: "robot",
      },
      {
        _key: "rc-client-review",
        title: "Client review",
        description: "The gate at the end of every flow — the no-account link.",
        href: "/client-review",
        icon: "circle-check",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-agents-steps",
        question: "Can AI agents be steps in the flow?",
        answer:
          "Yes. Agent passes are nodes like any reviewer: the flow decides when they run, people decide what their findings mean.",
      },
      {
        _key: "faq-conditions",
        question: "What conditions can move work forward?",
        answer:
          "Findings thresholds, resolution states, and approvals, set per transition.",
      },
      {
        _key: "faq-quiet-client",
        question: "What happens when a client goes quiet?",
        answer:
          "Escalation rules: a nudge after quiet days, or a hand-off to whoever owns the account.",
      },
      {
        _key: "faq-slack",
        question: "Do notifications work with Slack?",
        answer:
          "Yes. Slack or email, per node and per flow: the channel hears when a step clears, the owner hears when the flow completes.",
      },
      {
        _key: "faq-trigger",
        question: "Can a flow start on its own when we ship a change?",
        answer:
          "Yes. Connect GitHub or Vercel and a push or deploy triggers the flow; any change to the live site does too.",
      },
      {
        _key: "faq-cicd",
        question: "Is this like CI/CD, but for reviews?",
        answer:
          "If you know CI/CD, yes: push-triggered runs, steps, conditions, and notifications, for review instead of deployment. If you don't, better — it's a visual flow, and there's no YAML.",
      },
      {
        _key: "faq-engineer",
        question: "Do I need an engineer to build one?",
        answer:
          "No. The builder is visual: drag steps, set conditions, done. The one technical moment in Superflow is the install snippet.",
      },
      {
        _key: "faq-cost",
        question: "What do review workflows cost?",
        answer:
          "Included on every plan; the flow is how reviews run, not an add-on.",
      },
    ],
  },
  metaTitle: "Review Workflows for Agencies | Superflow",
  metaDescription:
    "Arrange your reviewers and AI agents in a visual flow. Conditions move work forward, Slack or email fires at every step, and the client gate comes last.",
};

const privateComments = {
  _id: "featurePage-private-comments",
  _type: "featurePage",
  title: "Private Comments",
  slug: { _type: "slug", current: "private-comments" },
  hero: {
    headlineLines: ["Your client sees decisions,", "not debates"],
    subhead:
      "Scope any comment to just you, or your team. It sits beside the client thread, on the same element. The back-and-forth stays inside. One answer goes out.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-team", label: "Team-private thread", icon: "lock" },
      { _key: "ht-just-you", label: "Just-you notes", icon: "eye-off" },
      { _key: "ht-client", label: "The client's view", icon: "eye" },
    ],
  },
  solution: {
    heading: "Your side of the review",
    subheading:
      "Private comments are comments the client never sees — debate, correct, and decide in a thread beside the client's.",
    variant: "private-comments",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Debate",
    journeyEnd: "One Answer",
    blocks: [
      {
        _key: "block-scopes",
        title: "Two private scopes",
        description:
          "Scope a comment to just you, or to your whole team, pinned where it applies.",
        icon: "lock",
        accent: "#a21caf",
        mock: "private-comments",
        tabs: [
          {
            _key: "team-private",
            label: "Team-private threads",
            icon: "lock",
            oneLiner:
              "A thread only your team can see, replies included, pinned to the element.",
            mock: "private-team-thread",
          },
          {
            _key: "just-you",
            label: "Just-you comments",
            icon: "message-pin",
            oneLiner:
              "Scope a comment to just you: a draft, a doubt, a reminder, pinned where it applies.",
            mock: "private-just-you",
          },
        ],
      },
      {
        _key: "block-beside",
        title: "Beside the client thread",
        description:
          "Private and client-visible threads share one element, marked so nobody mistakes the scope.",
        icon: "message-circle",
        accent: "#433df3",
        mock: "private-comments",
        tabs: [
          {
            _key: "side-by-side",
            label: "Side-by-side threads",
            icon: "message-circle",
            oneLiner:
              "Private and client-visible threads sit on the same element, one context.",
            mock: "private-side-by-side",
          },
          {
            _key: "scope-marks",
            label: "Unmistakable scope marks",
            icon: "checks",
            oneLiner:
              "A private thread looks nothing like a client thread, so no reply lands in the wrong place.",
            mock: "private-scope-marks",
          },
        ],
      },
      {
        _key: "block-client-sees",
        title: "What the client sees",
        description:
          "The client's link carries one clean thread and one settled answer — nothing private.",
        icon: "user-check",
        accent: "#109534",
        mock: "private-comments",
        tabs: [
          {
            _key: "clean-view",
            label: "A clean client view",
            icon: "user-check",
            oneLiner:
              "The client's link carries client-visible threads only; nothing private travels with it.",
            mock: "private-client-view",
          },
          {
            _key: "one-answer",
            label: "One settled answer",
            icon: "circle-check",
            oneLiner:
              "Debate in the private thread, then post the decision on the client's.",
            mock: "private-one-answer",
          },
        ],
      },
      {
        _key: "block-nothing-leaks",
        title: "Nothing leaks",
        description:
          "Even the alerts respect the scope, so nothing private reaches the client by accident.",
        icon: "lock",
        accent: "#e0820a",
        mock: "private-comments",
        tabs: [
          {
            _key: "scope-notifications",
            label: "Scope-aware notifications",
            icon: "send",
            oneLiner:
              "Alerts about a private thread go only to people inside its scope.",
            mock: "private-scope-notifications",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with private comments in a minute",
    subheading: "Three steps, no engineer required.",
    steps: [
      INSTALL_STEP,
      {
        _key: "gs-review",
        accent: "#433df3",
        title: "Handle findings in private threads",
        description:
          "Agents check the moment work lands; your team debates beside the client-visible thread.",
      },
      {
        _key: "gs-signoff",
        accent: "#109534",
        title: "Send one settled answer",
        description:
          "Your client approves from a link, and the private threads stay behind.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-client-review",
        title: "Client review",
        description:
          "The client's half — the magic-link path through the clean view private comments protect.",
        href: "/client-review",
        icon: "circle-check",
      },
      {
        _key: "rc-review-agents",
        title: "AI review agents",
        description:
          "The first pass. Findings land as comments on the same elements your threads sit on.",
        href: "/ai-review-agents",
        icon: "robot",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-client-see",
        question: "Can my client ever see a private comment?",
        answer:
          "No, by design. The client's view never renders private threads. On your side, a private thread looks nothing like a client thread, so nobody mistakes which one they're typing into.",
      },
      {
        _key: "faq-scopes",
        question:
          "Who can see a team-scoped comment versus a just-you comment?",
        answer:
          "Team scope: your workspace teammates on that project, never client-side guests. Just-you scope: only you.",
      },
      {
        _key: "faq-convert",
        question: "Can a private comment become client-visible later?",
        answer:
          "The flow Superflow expects: debate in private, then post the settled answer on the client thread.",
      },
      {
        _key: "faq-exports",
        question: "Do private comments appear in the audit trail or exports?",
        answer:
          "Client-facing exports never carry them; that's the point of the scope. The record itself lives in the audit trail.",
      },
      {
        _key: "faq-findings",
        question: "Do agent findings start private?",
        answer:
          "Findings post as comments your team works first, so by the time your client opens their link the work is cleaned up.",
      },
      {
        _key: "faq-vs-slack",
        question: "Why not just keep the internal debate in Slack?",
        answer:
          "Slack loses the element. A private thread sits on the exact button under debate, beside the client thread, one reply from the decision.",
      },
      {
        _key: "faq-cost",
        question: "What do private comments cost?",
        answer: "Included wherever comments are, on every plan.",
      },
    ],
  },
  metaTitle: "Private Comments for Agencies | Superflow",
  metaDescription:
    "Scope comments to just you or your team, beside client threads on the same element. The client never sees internal debate. You decide what they see.",
};

const recordings = {
  _id: "featurePage-recordings",
  _type: "featurePage",
  title: "Recordings",
  slug: { _type: "slug", current: "recordings" },
  hero: {
    headlineLines: ["Record feedback", "right where you review"],
    subhead:
      "Screen, camera, or voice. The recording lands as a comment, pinned where it applies. No separate app, no link to paste. Your client watches from their link.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-screen", label: "Record the screen", icon: "video" },
      { _key: "ht-voice", label: "Say it in voice", icon: "message" },
      { _key: "ht-camera", label: "On camera", icon: "camera" },
      { _key: "ht-comment", label: "It's a comment", icon: "pin" },
      { _key: "ht-client", label: "The client watches", icon: "eye" },
    ],
  },
  solution: {
    heading: "Some feedback has to be shown",
    subheading:
      "Record your screen, camera, or voice right where you review — and it lands as a pinned comment.",
    variant: "recordings",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Show It",
    journeyEnd: "Sign Off",
    blocks: [
      {
        _key: "block-ways",
        title: "Three ways to say it",
        description:
          "Screen, camera, or voice — record whichever carries the feedback text can't.",
        icon: "video",
        accent: "#a21caf",
        mock: "recordings-screen",
        tabs: [
          {
            _key: "screen-recordings",
            label: "Screen recordings",
            icon: "video",
            mock: "recordings-screen",
            oneLiner:
              "Record the screen and talk over it: the stutter, the flow, the thing text can't carry.",
          },
          {
            _key: "camera-video",
            label: "Camera video",
            icon: "camera",
            mock: "recordings-camera",
            oneLiner:
              "Turn the camera on when tone matters, so hard feedback lands the way you meant it.",
          },
          {
            _key: "voice-notes",
            label: "Voice notes",
            icon: "message-circle",
            mock: "recordings-voice",
            oneLiner:
              "Say the feedback and skip the keyboard, so spoken nuance isn't flattened into text.",
          },
        ],
      },
      {
        _key: "block-on-work",
        title: "On the work",
        description:
          "The clip lands as a pinned comment, recorded straight from the review toolbar.",
        icon: "pin",
        accent: "#433df3",
        mock: "recordings-pinned",
        tabs: [
          {
            _key: "pinned-comment",
            label: "A pinned comment",
            icon: "message-pin",
            mock: "recordings-pinned",
            oneLiner:
              "The recording is a comment: pinned to the element, in a thread, with a status and an assignee.",
          },
          {
            _key: "no-separate-app",
            label: "No separate app",
            icon: "checks",
            mock: "recordings-composer",
            oneLiner:
              "Record from the review toolbar: no extension, no app switch, no upload.",
          },
        ],
      },
      {
        _key: "block-everyone",
        title: "For everyone",
        description:
          "Your client plays it from a link, and every recording lives in a thread.",
        icon: "user-check",
        accent: "#109534",
        mock: "recordings-client",
        tabs: [
          {
            _key: "client-playback",
            label: "Client playback from the link",
            icon: "user-check",
            mock: "recordings-client",
            oneLiner:
              "Your client watches from their link: no account, no login, no app, from their phone.",
          },
          {
            _key: "recordings-in-threads",
            label: "Recordings in threads",
            icon: "message-circle",
            mock: "recordings-thread",
            oneLiner:
              "Reply to a recording with text, or with another recording.",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with Recordings in a minute",
    subheading: "Three steps, no engineer required.",
    steps: [
      INSTALL_STEP,
      {
        _key: "gs-record",
        accent: "#433df3",
        title: "Hit record on the toolbar",
        description: "Screen, camera, or voice — talk through what you see.",
      },
      {
        _key: "gs-signoff",
        accent: "#109534",
        title: "The clip lands as a pinned comment",
        description:
          "Your team replies, and your client watches and approves from their link.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-comments",
        title: "Comments",
        description:
          "The primitive every recording lands as — pinning, threads, statuses.",
        href: "/comments",
        icon: "message-circle",
      },
      {
        _key: "rc-private-comments",
        title: "Private comments",
        description: "Record for your team only; the client's view never shows it.",
        href: "/private-comments",
        icon: "eye-off",
      },
      {
        _key: "rc-client-review",
        title: "Client review",
        description: "The link your client plays it from, no account.",
        href: "/client-review",
        icon: "circle-check",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-what-record",
        question: "What can I record?",
        answer:
          "Your screen, your camera, or just your voice, from the review toolbar.",
      },
      {
        _key: "faq-loom",
        question: "Do I need Loom or a browser extension?",
        answer:
          "No. Recording lives in the review itself: no extension, no separate app, no link to paste.",
      },
      {
        _key: "faq-client-watch",
        question: "Can my client watch without an account?",
        answer:
          "Yes. The recording plays from their link: no account, no login, no app, from their phone.",
      },
      {
        _key: "faq-client-record",
        question: "Can my client record feedback back to us?",
        answer:
          "Clients reply from their link with comments; recording lives on your reviewing side.",
      },
      {
        _key: "faq-where-live",
        question: "Where do recordings live?",
        answer:
          "They're comments: pinned to the element, in a thread, with a status and an assignee. Everything a comment can do, a recording can.",
      },
      {
        _key: "faq-internal",
        question: "Can a recording be internal-only?",
        answer:
          "Yes, comment scopes apply: record for just you or your team, and the client's view never shows it.",
      },
      {
        _key: "faq-vs-loom",
        question: "How is this different from Loom?",
        answer:
          "A Loom lives at a link, away from the work. A Superflow recording lives on the element it's about, in the review, with a status.",
      },
      {
        _key: "faq-cost",
        question: "What do recordings cost?",
        answer: "Included wherever comments are, on every plan.",
      },
    ],
  },
  metaTitle: "Video, Screen, and Voice Feedback | Superflow",
  metaDescription:
    "Record your screen, camera, or voice right where you review. The recording lands as a pinned comment, and your client watches from a link. No separate app.",
};

const whiteLabel = {
  _id: "featurePage-white-label",
  _type: "featurePage",
  title: "White Label",
  slug: { _type: "slug", current: "white-label" },
  hero: {
    headlineLines: ["White-label the toolbar.", "And the admin panel."],
    subhead:
      "Your logo on the review toolbar your client sees, and on the admin panel your team runs. One upload, every project.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-client", label: "The client's view", icon: "eye" },
      { _key: "ht-admin", label: "The admin panel", icon: "layout-dashboard" },
      { _key: "ht-upload", label: "One upload", icon: "palette" },
    ],
  },
  solution: {
    heading: "Where your logo lives",
    subheading:
      "One logo in settings — the client's toolbar carries it, and your team's admin panel carries it, every project.",
    variant: "white-label",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Your Brand",
    journeyEnd: "Client Approved",
    blocks: [
      {
        _key: "block-surfaces",
        title: "The surfaces your logo lands on",
        description:
          "Your logo on the review toolbar the client sees, and on the admin panel your team runs.",
        icon: "palette",
        accent: "#433df3",
        mock: "white-label-toolbar",
        tabs: [
          {
            _key: "client-toolbar",
            label: "The toolbar your client sees",
            icon: "devices",
            oneLiner:
              "Every review a client opens carries your logo, on every project.",
            mock: "white-label-toolbar",
          },
          {
            _key: "admin-panel",
            label: "The admin panel your team runs",
            icon: "layout-dashboard",
            oneLiner:
              "Your logo on the panel itself, so contractors and new hires work inside your operation, not a vendor's.",
            mock: "white-label-portal",
          },
        ],
      },
      {
        _key: "block-one-upload",
        title: "One upload, everywhere",
        description:
          "Set the logo once, and every project — plus every agent finding — wears it.",
        icon: "checks",
        accent: "#109534",
        mock: "white-label-settings",
        tabs: [
          {
            _key: "one-upload",
            label: "One upload, every project",
            icon: "refresh",
            oneLiner:
              "Set the logo once in settings, and every current and future project carries it.",
            mock: "white-label-settings",
          },
          {
            _key: "agent-findings-brand",
            label: "Agent findings under your brand",
            icon: "robot",
            oneLiner:
              "When AI reviews and comments, the toolbar carrying those comments is yours.",
            mock: "white-label-agent-findings",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with white-label in a minute",
    subheading: "Three steps, no engineer required.",
    steps: [
      {
        _key: "gs-brand",
        accent: "#d43f8d",
        title: "Upload your logo in settings",
        description: "Toolbar and admin panel carry it everywhere.",
      },
      {
        _key: "gs-review",
        accent: "#433df3",
        title: "AI agents check, your team decides",
        description: "On surfaces that look like yours.",
      },
      {
        _key: "gs-signoff",
        accent: "#109534",
        title: "Your client approves under your brand",
        description: "No account, no login, no app, from their phone.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-client-review",
        title: "Client review",
        description: "The sign-off moment this page brands.",
        href: "/client-review",
        icon: "circle-check",
      },
      {
        _key: "rc-kanban-board",
        title: "Kanban board",
        description: "One of the admin surfaces that carries your logo.",
        href: "/kanban-board",
        icon: "layout-kanban",
      },
      {
        _key: "rc-trust",
        title: "Trust",
        description: "SSO, SOC 2, and the rest of looking like a serious operation.",
        href: "/trust",
        icon: "checks",
      },
    ],
    boundaryLine:
      "White-label covers how Superflow looks. Client review covers how your client gets in.",
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-what-gets-logo",
        question: "What exactly gets my logo?",
        answer:
          "Two surfaces: the review toolbar your client sees on their site, and the admin panel your team works in. One upload covers both.",
      },
      {
        _key: "faq-custom-domain",
        question: "Can I use a custom domain?",
        answer:
          "No. White-label covers the toolbar and admin panel logos. Reviews run on Superflow links.",
      },
      {
        _key: "faq-colors",
        question: "Can I change the colors too?",
        answer: "Today it's your logo. Colors stay Superflow's defaults.",
      },
      {
        _key: "faq-plan",
        question: "Which plan includes white-label?",
        answer: "White-label is included on the Scale plan.",
      },
      {
        _key: "faq-contractors",
        question: "Do freelancers and contractors on my team see my brand?",
        answer:
          "Yes. The admin panel carries your logo, so everyone working inside it, staff or contract, sees your operation.",
      },
    ],
  },
  metaTitle: "White-Label Client Review for Agencies | Superflow",
  metaDescription:
    "Put your logo on the review toolbar your clients see and the admin panel your team runs. One upload, every project. Included on the Scale plan.",
};

const analytics = {
  _id: "featurePage-analytics",
  _type: "featurePage",
  title: "Analytics",
  slug: { _type: "slug", current: "analytics" },
  hero: {
    headlineLines: ["Insights every week.", "Actions in one click."],
    subhead:
      "Each insight carries the pattern, what it means, and the next step. Tabs for strategy, customers, team, and you. Three to five a week, from your own review data.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-week", label: "The week's insights", icon: "chart-bar" },
      { _key: "ht-act", label: "Act on one", icon: "bolt" },
      { _key: "ht-customers", label: "Customers", icon: "world" },
      { _key: "ht-team", label: "Team", icon: "user-check" },
      { _key: "ht-for-me", label: "For Me", icon: "eye" },
    ],
  },
  solution: {
    heading: "The week, already read",
    subheading:
      "Analytics leads with insights — three to five a week, each with the pattern, what it means, and a one-click action.",
    variant: "analytics",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "Review Data",
    journeyEnd: "One-Click Action",
    blocks: [
      {
        _key: "block-insights",
        title: "The insights",
        description:
          "Three to five a week, each carrying the pattern, what it means, and its next step.",
        icon: "sparkles",
        accent: "#433df3",
        mock: "analytics-insights",
        tabs: [
          {
            _key: "insights-week",
            label: "Insights of the week",
            icon: "sparkles",
            mock: "analytics-insights",
            oneLiner:
              "Three to five a week, auto-curated: the patterns worth your attention, nothing else.",
          },
          {
            _key: "interpretation",
            label: "Interpretation included",
            icon: "message-chatbot",
            mock: "analytics-interpretation",
            oneLiner:
              "Every insight says what the number means, not just the number.",
          },
          {
            _key: "one-click-actions",
            label: "One-click actions",
            icon: "bolt",
            mock: "analytics-act",
            oneLiner:
              "Each insight carries its next step: add the agent, nudge the account, rebalance the load.",
          },
        ],
      },
      {
        _key: "block-tabs",
        title: "The tabs",
        description:
          "Four views: agency strategy, per-client rollups, team load, and your own slice.",
        icon: "layout-dashboard",
        accent: "#109534",
        mock: "analytics-overview",
        tabs: [
          {
            _key: "strategic-overview",
            label: "Strategic Overview",
            icon: "layout-dashboard",
            mock: "analytics-overview",
            oneLiner:
              "The agency-level patterns: volume, rounds, where reviews heat up.",
          },
          {
            _key: "customers",
            label: "Customers",
            icon: "world",
            mock: "analytics-customers",
            oneLiner:
              "Per-client rollups: who draws rounds, who approves fast, who cooled off.",
          },
          {
            _key: "team",
            label: "Team",
            icon: "user-check",
            mock: "analytics-team",
            oneLiner:
              "Review load by team and account, for allocation and pairing — no per-person score.",
          },
          {
            _key: "for-me",
            label: "For Me",
            icon: "circle-check",
            mock: "analytics-for-me",
            oneLiner: "Your own slice: your approvals, your queues, your week.",
          },
        ],
      },
      {
        _key: "block-your-move",
        title: "Your move",
        description:
          "Pin what matters, dismiss what doesn't, and change the filters to re-curate on the spot.",
        icon: "settings",
        accent: "#e0820a",
        mock: "analytics-pin-dismiss",
        tabs: [
          {
            _key: "pin-dismiss",
            label: "Pin or dismiss",
            icon: "pin",
            mock: "analytics-pin-dismiss",
            oneLiner:
              "Pin an insight to your morning view, or dismiss it for thirty days.",
          },
          {
            _key: "filters-recurate",
            label: "Filters that re-curate",
            icon: "refresh",
            mock: "analytics-filters",
            oneLiner:
              "Change the range, vertical, or comparison and the insights re-curate on the spot.",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with Analytics in a minute",
    subheading: "Three steps, no analyst required.",
    steps: [
      INSTALL_STEP,
      {
        _key: "gs-review",
        accent: "#433df3",
        title: "Run reviews as usual",
        description:
          "Every comment, finding, round, and approval writes the data.",
      },
      {
        _key: "gs-act",
        accent: "#109534",
        title: "The week's insights arrive curated",
        description:
          "Read the pattern, take the one-click action, pin or dismiss.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-ask-ai",
        title: "Ask AI",
        description:
          "Analytics curates the week; Ask AI answers the question you just thought of.",
        href: "/ask-ai",
        icon: "message-chatbot",
      },
      {
        _key: "rc-kanban-board",
        title: "Kanban board",
        description:
          "The board shows today's state; Analytics says what the states add up to.",
        href: "/kanban-board",
        icon: "layout-kanban",
      },
      {
        _key: "rc-review-agents",
        title: "AI review agents",
        description:
          "The most common one-click action is adding an agent to catch the pattern next time.",
        href: "/ai-review-agents",
        icon: "robot",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-insight",
        question: "What exactly is an insight?",
        answer:
          "A pattern from your review data, what it means, and a one-click action, in one card. Three to five arrive each week.",
      },
      {
        _key: "faq-vs-ask-ai",
        question: "How is this different from Ask AI?",
        answer:
          "Analytics curates what the week surfaced on its own; Ask AI answers the question you have right now. They read the same data.",
      },
      {
        _key: "faq-score",
        question: "Does it rank or score my people?",
        answer:
          "No. Team analytics stop at team and account load, for allocation and pairing. There's no per-person score, and every staffing call stays a human call.",
      },
      {
        _key: "faq-clients-see",
        question: "Can my clients see Analytics?",
        answer:
          "No. Analytics is internal only; your operation's numbers never render on a client surface.",
      },
      {
        _key: "faq-revenue",
        question: "Where's revenue?",
        answer:
          "Not here, by design. Superflow tracks the thing it owns — the sign-off; revenue lives in the tools built for it.",
      },
      {
        _key: "faq-actions",
        question: "What can the one-click actions do?",
        answer:
          "Answer the pattern where work happens: add an agent, nudge an account, rebalance a queue.",
      },
      {
        _key: "faq-quiet-week",
        question: "What if a week is quiet?",
        answer:
          "Then it says so. Fewer, better insights beat five forced ones.",
      },
      {
        _key: "faq-cost",
        question: "What does Analytics cost?",
        answer:
          "Included on every plan; the insights are how Superflow reports, not an add-on.",
      },
    ],
  },
  metaTitle: "Weekly Review Insights for Agencies | Superflow",
  metaDescription:
    "Analytics that leads with insights: three to five a week, each with the pattern, what it means, and a one-click action. Curated from your own review data.",
};

const askAi = {
  _id: "featurePage-ask-ai",
  _type: "featurePage",
  title: "Ask AI",
  slug: { _type: "slug", current: "ask-ai" },
  hero: {
    headlineLines: ["Ask your review", "history anything"],
    subhead:
      "Ask in plain language. Which client draws the most rounds. Whether reviews are catching copy or bugs. Where delays and churn risk hide. Answers come from your own reviews.",
    showcase: "workflow",
    tabs: [
      { _key: "ht-history", label: "Ask the review history", icon: "message" },
      { _key: "ht-per-client", label: "Per-client", icon: "world" },
      { _key: "ht-cross-project", label: "Cross-project", icon: "route" },
      { _key: "ht-on-demand", label: "Analytics on demand", icon: "chart-bar" },
      { _key: "ht-ops", label: "Ops signals", icon: "bolt" },
    ],
  },
  solution: {
    heading: "See where the rounds go",
    subheading:
      "Ask plain-language questions across every review — and every answer is grounded in your own data, cited.",
    variant: "ask-ai",
  },
  featureSet: {
    headerTitle: "Superflow gets you from",
    journeyStart: "A Question",
    journeyEnd: "An Answer",
    blocks: [
      {
        _key: "block-how-ask",
        title: "How you ask",
        description:
          "Ask in plain language, and every answer cites the comments and decisions behind it.",
        icon: "message-chatbot",
        accent: "#433df3",
        mock: "ask-ai",
        tabs: [
          {
            _key: "plain-language",
            label: "Plain-language questions",
            icon: "message-circle",
            mock: "ask-ai",
            oneLiner:
              "Ask the way you'd ask a person: which client, which pattern, which quarter.",
          },
          {
            _key: "cited-answers",
            label: "Cited answers",
            icon: "link",
            mock: "ask-ai-cited",
            oneLiner:
              "Every answer names the comments and decisions it came from, one click from the original thread.",
          },
        ],
      },
      {
        _key: "block-learn",
        title: "What you learn",
        description:
          "See which clients cost the most rounds, what's copy versus bugs, and the patterns across every project.",
        icon: "brain",
        accent: "#109534",
        mock: "ask-ai",
        tabs: [
          {
            _key: "per-client-answers",
            label: "Per-client answers",
            icon: "world",
            mock: "ask-ai-per-client",
            oneLiner:
              "See which clients draw the most review and what each one keeps rejecting.",
          },
          {
            _key: "copy-vs-bug",
            label: "Copy-versus-bug mix",
            icon: "code-asterisk",
            mock: "ask-ai-copy-vs-bug",
            oneLiner:
              "See whether reviews mostly catch writing problems or build problems, per client or across the agency.",
          },
          {
            _key: "cross-project",
            label: "Cross-project patterns",
            icon: "route",
            mock: "ask-ai-cross-project",
            oneLiner:
              "One question spans every client, project, and thread you've ever reviewed.",
          },
        ],
      },
      {
        _key: "block-flags",
        title: "What it flags",
        description:
          "Surface where review load piles up, and catch stalled reviews and early churn signals.",
        icon: "history",
        accent: "#e0820a",
        mock: "ask-ai",
        tabs: [
          {
            _key: "load-by-team",
            label: "Review load by team",
            icon: "user-check",
            mock: "ask-ai-load-by-team",
            oneLiner:
              "See where review load piles up, by team, account, or work type, and pair support where it's needed.",
          },
          {
            _key: "delay-churn",
            label: "Delay and churn signals",
            icon: "refresh",
            mock: "ask-ai-delay-churn",
            oneLiner:
              "Flags stalled reviews and early churn signals in the pattern of a client's rounds.",
          },
        ],
      },
      {
        _key: "block-generates",
        title: "What it generates",
        description:
          "Ask for a breakdown and get it generated from live review data — no dashboard to build.",
        icon: "sparkles",
        accent: "#a21caf",
        mock: "ask-ai",
        tabs: [
          {
            _key: "analytics-on-demand",
            label: "Analytics on demand",
            icon: "layout-dashboard",
            mock: "ask-ai-analytics",
            oneLiner:
              "Ask for a breakdown and get it generated from live review data — no dashboard to build.",
          },
        ],
      },
    ],
  },
  getStarted: {
    heading: "Get started with Ask AI in a minute",
    subheading: "Three steps, no analyst required.",
    steps: [
      INSTALL_STEP,
      {
        _key: "gs-review",
        accent: "#433df3",
        title: "Run reviews as usual",
        description:
          "Agents check the moment work lands, your team comments, your client approves.",
      },
      {
        _key: "gs-ask",
        accent: "#109534",
        title: "Type a question in plain language",
        description:
          "The answer comes back grounded in Memory, citing the comments behind it.",
      },
    ],
  },
  relatedCapabilities: {
    heading: "Related capabilities",
    items: [
      {
        _key: "rc-memory",
        title: "Memory",
        description:
          "The source of every answer — what you upload and what reviews teach it.",
        href: "/memory",
        icon: "brain",
      },
      {
        _key: "rc-review-agents",
        title: "AI review agents",
        description: "The checks that write much of the data.",
        href: "/ai-review-agents",
        icon: "robot",
      },
    ],
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        _key: "faq-what-ask",
        question: "What can I actually ask?",
        answer:
          "What reviews keep catching, which clients take the most rounds, whether the work is mostly copy fixes or bug fixes, where review load sits by team or account, which projects have stalled, and early churn signals. Or ask for a breakdown and it gets generated.",
      },
      {
        _key: "faq-source",
        question: "Where do the answers come from?",
        answer:
          "Your own review data, held in Memory: every comment, finding, decision, and upload. Each answer cites the sources behind it.",
      },
      {
        _key: "faq-score",
        question: "Does it rank or score my people?",
        answer:
          "No. It shows where review load piles up so you can pair support and coach early. There's no per-person score, and every staffing call stays a human call.",
      },
      {
        _key: "faq-day-one",
        question: "Does it work from day one, or does it need history?",
        answer:
          "Ask from day one: what you upload into Memory answers immediately. Pattern questions sharpen as reviews accumulate.",
      },
      {
        _key: "faq-training",
        question: "Is my data used to train models for other customers?",
        answer:
          "No. One client's memory never informs another client, and one customer's data never trains another's.",
      },
      {
        _key: "faq-clients-see",
        question: "Can my clients see Ask AI?",
        answer:
          "No. Clients review from a magic link: no account, no login, no app, from their phone. Ask AI and its answers stay on your side.",
      },
      {
        _key: "faq-vs-dashboard",
        question: "How is this different from a reporting dashboard?",
        answer:
          "A dashboard answers the questions somebody predicted last quarter. Ask AI answers the question you have right now, from the raw reviews, with citations.",
      },
      {
        _key: "faq-cost",
        question: "What does Ask AI cost?",
        answer:
          "Included on every paid plan alongside Memory, which powers it.",
      },
    ],
  },
  metaTitle: "Ask AI Review Analytics for Agencies | Superflow",
  metaDescription:
    "Ask plain-language questions across every review: client cost, copy vs bugs, delays, churn signals. Answers come from your review data, cited. You decide.",
};

/** Every feature-page document this batch owns. */
const docs = [
  memory,
  kanbanBoard,
  authenticatedPages,
  screenshots,
  reviewWorkflows,
  privateComments,
  recordings,
  whiteLabel,
  analytics,
  askAi,
];

/**
 * Seed (or dry-run) every document in {@link docs}. Uses `createOrReplace`, so
 * it never deletes any other document.
 */
async function main() {
  if (DRY_RUN) {
    console.log(JSON.stringify(docs, null, 2));
    console.log(`\nDRY_RUN: ${docs.length} documents ready (nothing written).`);
    return;
  }
  const seededIds = [];
  for (const doc of docs) {
    const res = await client.createOrReplace(doc);
    seededIds.push(res._id);
    console.log("Seeded:", res._id);
  }
  console.log(`\nSeeded ${seededIds.length} documents:`);
  console.log(seededIds.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
