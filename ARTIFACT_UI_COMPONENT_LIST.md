# Artifact UI Component List

Reusable artifact primitives for the 2026 homepage and feature-page feature
groups. **Reuse these before writing new markup.** Every comment surface on the
marketing site is composed from the shared pieces below so a single change (e.g.
adding read receipts) instantly applies everywhere.

All paths are under `components/home-2026/`.

## Feature-Section Window (the outer frame)

- `FeatureSetBlock` (`FeatureSetBlock.tsx`) owns the outer feature card, the tab
  strip, the dark window frame, the caption band, and the white app-window
  screen. **Artifacts render their content _inside_ this existing white screen**
  — never recreate the browser/tab frame.
- The `MOCKS` map in `FeatureSetBlock.tsx` is the registry of selectable
  artifacts. `FeatureSetMockName` (a keyof that map) is the type used throughout
  (Sanity schema, `FeaturePageBody`, seeds).
- The white screen (`.panelScreen`) is `1204px` wide × `602px` tall and clips off
  the marketing card's right edge — so artifacts are **left-anchored** and may
  intentionally bleed content off the right.
- `FeatureSetMocks.tsx` exports `FeatureSetWorkflowMock` — the generic "New
  Website Workflow" mock registered under the `workflow` key. It is the
  block-level default for the non-AI homepage blocks, but every homepage /
  comments tab sets its own `mock`, so it renders only when a tab omits one.

## Hero Product-Window (the hero outer frame)

The homepage/feature **hero** has its own app window, separate from the Feature
Set window above. Its artifacts are logged here.

- `HeroWorkflowShowcase.tsx` owns the hero tab strip + the dark `.window` frame
  and an `.artifactFrame` slot. When the active tab id is in `HERO_ARTIFACTS`
  the matching artifact renders inside that slot; otherwise the showcase falls
  back to its **own inline** generic workflow canvas (`.windowInner` — the rail
  + "New Website Workflow" check graph, distinct from `FeatureSetWorkflowMock`).
- Tab presets pick which tabs sit above the window: `HOME_TABS` (homepage),
  `COMMENTS_TABS` (comments feature page), `REVIEW_AGENTS_TABS` (review-agents
  page); CMS `hero.tabs` override the preset. Only labels/icons change.
- `hero-artifacts/index.ts` (`HERO_ARTIFACTS`) is the tab-id → artifact registry:
  - Homepage (`HOME_TABS`): `qa-workflow` → `AgentsAtWorkArtifact`, `agents` →
    `BuildAgentsArtifact`, `anonymous-login` → `GuestModeArtifact`,
    `private-comment` → `PrivateCommentArtifact`, `integrations` →
    `IntegrationsArtifact`.
  - Comments page (`COMMENTS_TABS`): the five `CommentsHeroFit` wrappers (see
    below).
  - Review Agents page (`REVIEW_AGENTS_TABS`): `build-from-checklist` →
    `BuildAgentsArtifact`, `built-in-checks` → `BuiltInChecksArtifact`,
    `findings-as-comments` → `AgentsAtWorkArtifact`, `run-on-demand` →
    `RunOnDemandArtifact`, `human-signs-off` → `HeroTrackItArtifact`.

### Base hero artifacts (`hero-artifacts/*`)

Each owns a bespoke file + CSS module and renders on the white inner card (the
`.window` supplies the 2px black reveal). Several are reused verbatim as feature
mocks via `feature-artifacts/HeroArtifactFit.tsx` (see "Existing Reusable Mocks").

- `AgentsAtWorkArtifact.tsx` — home "Agents at Work" (`qa-workflow`). A reviewed
  website where labelled agent cursors fly in, select an element and drop a
  comment (CSS-only, replays on mount). Reuses `BrowserChrome` + `CommentPin`.
  Also feeds feature `review-agents` and hero `findings-as-comments`.
- `BuildAgentsArtifact.tsx` — home "Build Agents" (`agents`). Static
  "Extracting Agents from Checklist.xlsx" state: progress ring, rendered agent
  cards + faded skeletons. Also feeds review-agents `build-from-checklist`.
- `GuestModeArtifact.tsx` — home "Guest Mode" (`anonymous-login`). Guest browser
  window with dashed selection, the shared composer, a "You are a guest / Login"
  pill and the Superflow toolbar. **Also exports `FloatingToolbar`** — the shared
  Superflow floating toolbar reused by `CommentsHeroFit`. Feeds feature
  `guest-mode`.
- `PrivateCommentArtifact.tsx` — home "Private Comments" (`private-comment`). A
  team-only composer, dashed selection, a "Private Mode Enabled" pill and dark
  toolbar. Feeds feature `private-comments`.
- `IntegrationsArtifact.tsx` — home "2 Way Integrations" (`integrations`). A
  composer wired by a curved connector to a Kanban board whose integration-logo
  row bleeds off the right. Feeds feature `integrations`.
- `CommentComposer.tsx` (`HeroCommentComposer`) — **the single shared hero
  composer.** The floating "comment input box" reused by the Guest Mode, Private
  Comments and Integrations hero artifacts. Fully prop-driven: optional navy
  "Visible to → Team" header, `commentText` + purple `mention`, `avatar`
  (image / `INCOGNITO_AVATAR` spy disc / `null` gradient), `avatarSide`, and an
  `accent` (purple) variant. Exports the `INCOGNITO_AVATAR` sentinel.

## Shared Comments Primitives

- `feature-artifacts/CommentThreadCard.tsx` — **the single reusable comment
  dialog.** Every posted-comment popover on the site is this component. It is
  fully prop-driven (see props below) and is reused by `PinnedCommentScene`,
  `KanbanArtifact`, `AllDevicesArtifact`, and all seven comments-feature mocks.
- `feature-artifacts/AgentCommentCard.tsx` — **the single reusable agent-finding
  card** (Figma `894:1118`): the Superflow brand-mark avatar + agent name + time
  header, a bold title + muted description, and a footer whose right side holds
  the green approve (`#1a8f64`) and coral reject (`#fe7362`) actions. Use this
  for any AI-agent finding that offers an approve/reject rather than the threaded
  `CommentThreadCard`. Prop-driven: `agentName`, `timeAgo`, `title`,
  `description`, optional `avatarSrc` (defaults to the built-in dots-on-gradient
  brand mark), `avatarVariant` (`"brand"` six-dot default or `"agentDots"` for
  the four-dot multicolor agent mark), optional `replyLabel` (adds the left reply
  row), and `showActions` / `showMenu` toggles. Header type is Urbanist, body is Poppins;
  `className` sizes/positions it (fluid, capped at 360px). Dropped onto a page
  surface by `PinnedCommentScene`'s `agentCard` prop (see below) and shipped as
  the `agent-finding` mock.
- `feature-artifacts/CommentPin.tsx` — the purple teardrop avatar/anchor pin.
  Three avatar modes: an image (default `avatarSrc`), an arbitrary white glyph
  drawn directly on the tone teardrop (`glyph` — e.g. the `LegoFaceIcon` agent
  app icon used by both `RunOnDemandArtifact` and the agent-finding scene), or a
  single character on a white disc (`hasImage={false}`). Use this instead of
  hand-rolling pin badges; also used by the "Agents at Work" hero artifact.
- `feature-artifacts/LegoFaceIcon.tsx` — the shared Superflow agent app-icon
  glyph (a Lego minifigure head) as a `currentColor`-stroked `<svg>`. Single
  source of truth for the agent pin glyph, reused by `RunOnDemandArtifact` and
  `PinnedCommentScene` (drawn white inside `CommentPin`'s `glyph` mode) so the
  agent marker stays identical across the site.
- `feature-artifacts/SuperflowBrandMark.tsx` — the shared Superflow brand-mark
  glyph (six dots, Figma `895:1214`) as a transparent `<svg>`. Single source of
  truth for the dots geometry, used by the `AgentCommentCard` header avatar in
  its `avatarVariant="brand"` (default) mode; the caller supplies the tile/disc
  behind it and sizes the glyph via `className`.
- `feature-artifacts/SuperflowAgentDotsMark.tsx` — the shared four-dot multicolor
  agent mark (2×2 dots, Figma `896:1375`: `#D6D6FF` / `#9F84FF` / `#FFA5FF` /
  `#FFFFFF`) as a transparent `<svg>`. Rendered on the same purple-gradient tile
  as the brand mark; used by `AgentCommentCard`'s `avatarVariant="agentDots"`
  (the default for agent findings). Caller supplies the tile behind it and sizes
  the glyph via `className`.
- `feature-artifacts/PinScene.tsx` — draws the inner page chrome plus one of its
  page-body variants: the default dashed selected element + skeleton content, the
  Versioning left rail, the Live Site stale-copy ghost, the Robust Anchor
  List/Grid **reflow** (a stacked list that animates into a two-column grid when a
  fake pointer taps "Grid View", with the pinned card holding its place), or the
  Text Comments text-selection surface (a highlighted copy run + copy lines).
  Toggled via `live` / `versions` / `viewSwitcher` / `textSelect` props. The
  opt-in `textSelectAnimate` prop makes the run settle on a warm marker **yellow**
  and sweep in left→right (like dragging a text selection), driven by a
  `FakeCursor` that presses at the run's start and drags across it.
- `feature-artifacts/FakeCursor.tsx` — the shared arrow pointer glyph used by the
  animated artifacts. Position/animate it with a wrapping class (the SVG fills its
  box) to make a pointer glide onto a control and "press" it in a CSS-only
  timeline. Reused by `CommentThreadCard` (reactions, status change + attachment
  drop) and `PinScene` (robust anchor + text selection).
- `feature-artifacts/PinnedCommentScene.tsx` — composes `PinScene`, `CommentPin`
  and `CommentThreadCard` into one pinned-comment scene. This is the fastest way to
  build a "comment pinned on a page" artifact; pass `cardProps` to forward
  anything to the dialog. Pass the opt-in `agentCard` prop instead to swap the
  threaded dialog for the `AgentCommentCard` (agent finding + approve/reject) and
  flip the pin to the white `LegoFaceIcon` agent glyph (with the card avatar
  defaulting to the `agentDots` mark) — matching the "Run on Demand" hero
  artifact, keeping the same page surface (used by the `agent-finding` mock). Its
  opt-in `textSelectAnimation` prop (only with
  `threadVariant="text"`) plays the text-selection choreography: it forwards
  `textSelectAnimate` to `PinScene` and staggers the pin/card entrance so the
  comment drops onto the highlight **after** the yellow selection sweep finishes.
- `feature-artifacts/BrowserChrome.tsx` — the reusable inner browser bar
  (back/forward/reload/bookmark + address pill, optional green "Live" tag) used
  inside page-surface artifacts.

### `CommentThreadCard` props (pass these to enable each feature)

The card renders, in order, whatever the props enable:

- **Header** — `status` (+ `statusTone`) shows the status pill; `showFlag`,
  `resolvable` toggle the flag pill and resolve check; `statusOptions` renders the
  status dropdown (each option: `open` = circle, `progress` = clock, `done` =
  green check-circle; optional `target` marks the row the `"status"` choreography
  lands on).
- **Author row** — `avatarSrc` / `avatarInitial` / `avatarTone`, `author`,
  `timeAgo`, `edited`, and `showReadReceiptBadge` (the blue double-check).
- **Body** — `bodyText` with an optional purple `mention` chip
  (`mentionPlacement`).
- **Attachment** — `attachment` ({ fileName, sizeLabel, removable }) renders the
  styled PDF file chip (Figma `858:1307`): a purple Tabler `file-type-pdf` glyph,
  the truncated filename, a muted size subline and a red Tabler `x` remove button
  in a bordered rounded card.
- **Reactions** — `reactions` (emoji chips, `active` = purple outline) and
  `showAddReaction` (smiley button).
- **Screenshot** — `showScreenshot` (+ `screenshotSrc` / `screenshotHeight`).
- **Replies** — `replies[]` (nested author rows), then `composer`
  ({ text, placeholder, active, tools, `typing`, mentionSuggestions[] }), then
  `replyLabel` (the "N Reply" row). `composer.typing` reveals `text` with a
  left-to-right typing wipe + blinking caret (used by the animated choreographies).
  `composer.tools` renders the full action toolbar from Figma `859:1569`
  (text-format, @-mention, paperclip, microphone, video, screen-share) plus the
  purple send button.
- **Read receipts** — `readReceipts[]` + `showReadReceiptPanel` (floating panel).
- **Layout** — `className` positions/sizes the card; `flat` swaps the shadow for a
  border (board cards).
- **Animation** — `animation` opts the card into a CSS-only choreography that
  replays whenever the feature tab remounts (static consumers omit it and render
  unchanged):
  - `"mentions"` — types the composer draft, then opens the mention dropdown.
  - `"thread-reply"` — types a reply, then "posts" it (draft clears, the reply
    expands into the thread) with the composer staying put.
  - `"reactions"` — a `FakeCursor` taps the add-reaction smiley (👍 chip pops in),
    then taps the read-receipt double-check (the read-receipt panel opens).
  - `"attachment"` — a `FakeCursor` carries a small framed PDF card into the
    comment and drops it; the card settles onto the chip's glyph and fades as the
    styled PDF chip reveals in place.
  - `"status"` — a `FakeCursor` clicks the "Open" status pill (the dropdown
    opens), glides down to "Resolved" and selects it (the dropdown closes), and the
    header pill swaps from "Open" (purple) to "Resolved" (green). Needs
    `statusOptions` (with the `target` row) alongside `animation="status"`.

  Text Comments does **not** use a card `animation`; its choreography is
  scene-level, opted into via `PinnedCommentScene`'s `textSelectAnimation` prop
  (threaded to `PinScene` as `textSelectAnimate`). A warm **yellow** highlight
  sweeps across the target copy left→right like a dragged text selection (with a
  `FakeCursor`), and only after it settles does the pin drop onto the selection
  and the comment card unfold. All of these choreographies fall back to their
  settled state under `prefers-reduced-motion: reduce`.

## Comments Feature Artifact Mocks

All seven comments feature-group mocks live in
`feature-artifacts/CommentsFeatureArtifacts.tsx` and are thin configurations over
`PinnedCommentScene`. They render inside the existing `FeatureSetBlock` window.

Most are **animated** (CSS-only, replay on tab remount):

| Mock key | Export | What it shows |
| --- | --- | --- |
| `text-comments` | `TextCommentsArtifact` | Yellow highlight sweeps across the copy like a dragged selection (cursor), then the pin drops + comment card unfolds onto it (`textSelectAnimation`); card has `@Mark` + 1 Reply |
| `thread-comments` | `ThreadCommentsArtifact` | Milton + composer; types a reply, posts it, composer stays (`animation="thread-reply"`) |
| `tracking-task-management` | `TrackingTaskManagementArtifact` | Cursor opens the status dropdown (Open / In Progress / Resolved), picks **Resolved**, dropdown closes and the header pill swaps Open→Resolved (green) (`animation="status"`) |
| `robust-anchor` | `RobustAnchorArtifact` | List → pointer taps Grid View → cards reflow to a grid; the pinned card holds its place (`viewSwitcher`) |
| `comment-attachment` | `AttachmentCommentsArtifact` | A cursor carries a small framed PDF card in and drops it, then the styled PDF chip (glyph + name + size + remove ×) reveals in place (`animation="attachment"`) |
| `comment-mentions` | `MentionsCommentsArtifact` | Types `Any update @`, the @-mention dropdown opens, and the composer shows the full Figma action toolbar (`animation="mentions"`) |
| `reaction-read-receipt` | `ReactionReadReceiptArtifact` | Pointer taps smiley → 👍 chip, then taps double-check → read-receipt panel (`animation="reactions"`) |

Reply-row behaviour: `PinnedCommentScene` only defaults to a "1 Reply" row for the
durable-comment variant. The comments-feature variants end on their own trailing
element (composer / attachment / reactions) and show a reply row only when
`replyLabel` is passed explicitly (text-comments and robust-anchor do).

## Record Walkthrough (colorful animated recorder)

- `feature-artifacts/RecordWalkthroughArtifact.tsx` (mock key `record-walkthrough`)
  — a lively, colorful recorder scene on a flat white surface: a grey media
  placeholder + skeleton copy, plus a compact glowing indigo webcam bubble that
  plays a muted, looping clip (`/videos/home-2026/record-walkthrough.mp4`, poster
  fallback) so it feels live. One shared anchor swaps the white "Starting
  Recording in 3…" pill for a same-sized recording control bar (indigo
  screen-share badge, mm:ss timer, pause bars, coral stop square, grey "×"). The
  cursor + bubble + control bar sit in one `.recorderGroup` that drifts around the
  browser on a ~10s CSS loop (`rwRoam`) and then resets. Reduced motion holds the
  poster frame and parks the recorder at home. Reused verbatim on the homepage
  ("client approves from a link" group) and the comments feature page.
- `public/images/home-2026/record-walkthrough/cursor.svg` — the indigo (`#433DF3`)
  Superflow live-cursor (white outline + soft drop shadow) pinned to the bubble's
  top-left. Reuse this colorful pointer for any "someone is live here" moment
  instead of the monochrome `FakeCursor` glyph.

## Ask AI Feature Artifacts

- `feature-artifacts/AskAiArtifact.tsx` is a single **variant-driven** chat
  artifact: a Superflow browser window with a user question bubble, a blue
  assistant answer (the shared `AssistantAvatar` sphere + `StrokeGlyph` icons),
  an optional scope pill, a data-viz answer body, optional citation chips and a
  chat input. Everything (prompt, heading, scope, body, citations, placeholder)
  is chosen by the `variant` prop from the `VARIANTS` map. Pass the opt-in
  `hero` prop to widen / re-center it for the hero product window.
- Five answer-body renderers cover the Ask AI question types (picked by the
  variant's `body` discriminant, dispatched in `AnswerBody`): `StackedBarBody`
  (segmented breakdown bar + legend), `RankingBarsBody` (labelled ranking bars),
  `PatternListBody` (dot + label + meta rows), `SignalCardsBody` (accented
  signal cards) and `MiniBarChartBody` (mini column chart).
- Nine mock keys — each a thin zero-prop wrapper exported from the same file,
  registered in `MOCKS` (`FeatureSetBlock.tsx`) and `FEATURE_SET_MOCK_OPTIONS`:
  `ask-ai` (default, common client issues — stacked bar), `ask-ai-cited`,
  `ask-ai-per-client`, `ask-ai-copy-vs-bug`, `ask-ai-cross-project`,
  `ask-ai-load-by-team`, `ask-ai-delay-churn`, `ask-ai-ops-signals`,
  `ask-ai-analytics`.
- Hero reuse: `hero-artifacts/AskAiHeroFit.tsx` wraps the same artifact with
  `hero` + a `variant` for the Ask AI page hero tabs, registered in
  `HERO_ARTIFACTS` by tab id: `ask-the-review-history` (default — reuses
  `HeroAskAiArtifact` from `MemoryHeroFit`), `per-client`, `cross-project`,
  `analytics-on-demand`, `ops-signals`. The homepage `powers-ask-ai` hero tab
  also reuses `HeroAskAiArtifact`.
- Wiring: `FeaturePageBody` maps each Ask AI tab label to its variant mock via
  `ASK_AI_TAB_MOCKS` (client-side, so the per-tab variants render without a
  re-seed); the seed (`scripts/seed-feature-pages-batch.mjs`) carries the same
  per-tab mocks for anyone who re-seeds the dataset.

## Analytics Feature Artifacts

- `feature-artifacts/AnalyticsArtifact.tsx` is a single **variant-driven**
  dashboard artifact: a stylized Superflow Analytics window — an `AnalyticsChrome`
  app header ("Analytics" title + the real product tab row Overview / For me /
  People / Past Data with one active + a "Last 7 Days" range pill; the product's
  API-key / user-id inputs are intentionally omitted) over a per-`variant` body.
  Pass the opt-in `hero` prop to widen + center it for the hero product window.
  The **curated insight feed is the page star** (default variant).
- Shared primitives (all in the same file, composed by the variants): `LineChart`
  (multi-series smoothed SVG lines via `buildSmoothPath` + vertex dots +
  gridlines + axis labels + legend — the Status Graph, per-client trend, etc.),
  `StatCards` (big-number stat strip), `MetricRow` (the "Resolution Time" row),
  `RankedList` (`RankLead` globe / file / initials-avatar + label + right value —
  top projects / clients / awaiting-response), `RankingBars` (team-load bars),
  `InsightCard` (calm white card, Rox/Steep-inspired: a neutral **status chip**
  with a small severity dot → bold pattern → short "what it means"; the feed lays
  out horizontally as **insight | action**, the action a quiet ghost pill with an
  accent-tinted arrow so severity colour stays restrained (dot + arrow only). Its
  `mode` layers in `act` (cursor presses a solid button → flips to "Applied") and
  `interpretation` (stacked solo card with a highlighted "What it means" callout))
  and `MorningDoc` (the clean "morning
  view" **document** — a light sheet + a few one-line pinned insights the cursor
  pins). The `act` / morning-view choreographies reuse the shared `FakeCursor`.
  Numbers/titles use **Urbanist** (not a serif); the `LineChart` viewbox is a
  ~5:1 letterbox scaled uniformly (`height:auto`) so lines/dots never stretch.
- Nine mock keys — each a thin zero-prop wrapper exported from the same file,
  registered in `MOCKS` (`FeatureSetBlock.tsx`) and `FEATURE_SET_MOCK_OPTIONS`:
  `analytics-insights` (default, curated feed — the star), `analytics-overview`
  (Status Graph + stat cards + resolution row — the product Overview tab),
  `analytics-act`, `analytics-interpretation`, `analytics-customers` (per-client
  trend + rollup list), `analytics-team` (load bars, no per-person score),
  `analytics-for-me` (personal stats + awaiting-response — the product For me
  tab), `analytics-pin-dismiss` (the clean morning-view document), `analytics-filters`
  (filter chip bar over a compact Overview that re-curates). All motion (chart
  line-draw, bar-grow, feed stagger, cursor press, morning-view pin, filter
  re-curate) is gated behind `prefers-reduced-motion`, which holds the settled
  state (Applied shown, morning-view pin accented, cursors hidden).
- Hero reuse: `hero-artifacts/AnalyticsHeroFit.tsx` wraps the same artifact with
  `hero` + a `variant` for the Analytics page hero tabs, registered in
  `HERO_ARTIFACTS` by tab id: `the-week-s-insights` (default — the insight feed),
  `act-on-one`, `customers`, `team`, `for-me`. (These generic tab-slugs are only
  reachable from the Analytics page's own hero tabs, so they don't collide with
  other pages.)
- Wiring: `FeaturePageBody` maps each Analytics tab label to its variant mock via
  `ANALYTICS_TAB_MOCKS` and forces `solution.variant = "analytics"` for the
  `analytics` slug (both client-side, so the page renders without a re-seed); the
  seed (`scripts/seed-feature-pages-batch.mjs`) carries the same per-tab mocks +
  solution variant for anyone who re-seeds the dataset.

## Existing Reusable Mocks

- Durable comments (all `PinnedCommentScene` configs): `pinned-comments`,
  `auto-screenshot`, `versioning`, `live-site`.
- Hero artifacts reused verbatim via `feature-artifacts/HeroArtifactFit.tsx`:
  `review-agents`, `run-on-demand`, `built-in-checks`, `private-comments`,
  `guest-mode`, `integrations`, `applied-next-asset`. (`run-on-demand` /
  `built-in-checks` fill the panel directly like `review-agents`, while
  `built-in-checks` and the composer mocks are shifted left so their centred UI
  stays inside the visible frame.) `applied-next-asset` reuses the memory hero
  `AppliedToNextAssetArtifact` with its `showChrome={false}` prop (drops the
  `BrowserChrome` bar), scaled/left-anchored so the three project sheets, both
  "New Behaviour Learned" pills and the Superflow Memory card fit the panel; it
  exposes the distinct `data-artifact="applied-next-asset-feature"` root and is
  wired to the memory feature page's "Sharper every project" tab.
- Comments feature artifacts reused verbatim in the hero product window via
  `hero-artifacts/CommentsHeroFit.tsx` — the reverse of `HeroArtifactFit`. The
  `comments` hero showcase tabs map to a feature comment artifact, each rendered
  on its native 1204×602 feature canvas and scaled/centered into the hero
  `.artifactFrame`: `pin-an-element` → `pinned-comments`, `select-the-words` →
  `text-comments`, `thread-it` → `thread-comments`, `carry-the-context` →
  `comment-attachment`, `track-it` → `tracking-task-management`. Registered in
  `hero-artifacts/index.ts` (`HERO_ARTIFACTS`), keyed by the tab ids (which match
  both the `COMMENTS_TABS` preset and the CMS-derived hero-tab slugs). Each
  artifact is rendered with its opt-in `hero` prop (threaded
  `Comments*Artifact` → `PinnedCommentScene` → `PinScene`), which suppresses the
  panel's 676px left-anchored browser chrome; `CommentsHeroFit` instead paints
  its own full-width `BrowserChrome` band on top (matching the home hero
  `AgentsAtWorkArtifact` chrome — controls left, centered address, share + menu
  right). Feature-section usage omits `hero`, so that chrome is unchanged.
- Review Agents hero tabs (`review-agents` showcase / `REVIEW_AGENTS_TABS`) map in
  `HERO_ARTIFACTS`, keyed by tab id: `build-from-checklist` → `BuildAgentsArtifact`,
  `built-in-checks` → `BuiltInChecksArtifact` (bespoke), `findings-as-comments` →
  `AgentsAtWorkArtifact`, `run-on-demand` → `RunOnDemandArtifact` (bespoke),
  `human-signs-off` → `HeroTrackItArtifact`.
- `hero-artifacts/RunOnDemandArtifact.tsx` — the "Run on demand" hero tab: the
  Superflow Agents run screen inside the shared `BrowserChrome` window (address
  `YOUR-SITE.COM`) — a scrollable left list of ready-made QA agent cards (dotted
  app-icon tile, title/description, last-run + usage meta, run-history + black
  play button, reusing the Built-in checks card look) and the reviewed page on
  the right (media placeholder + skeleton copy). CSS-only choreography: a shared
  `FakeCursor` glides onto the Grammar Check agent's play button and presses it
  (ripple + selection ring), then travels across to the page where a warm
  highlight, a lego-face `CommentPin` (`glyph`) and the shared `AgentCommentCard`
  finding (four-dot `avatarVariant="agentDots"` avatar, approve / reject) drop in.
  Rests settled under reduced motion.
- `hero-artifacts/BuiltInChecksArtifact.tsx` — the "Built-in checks" hero tab: the
  Superflow Agents management screen (a text sidebar of agent groups + a
  two-column grid of ready-made QA agent cards with the dotted app-icon tile,
  title/description, last-run/usage meta and run controls) inside the shared
  `BrowserChrome` window (address `SUPERFLOW AGENTS`). CSS-only staggered
  entrance; rests settled under reduced motion.
- Other feature mocks: `custom-statuses`, `workflows`, `kanban`,
  `record-walkthrough`, `behind-login`, `all-devices`, `client-memory`.
  (`kanban` and `all-devices` also reuse `CommentThreadCard`.) The `ask-ai*`
  mock family has its own section above.
- `agent-finding` (`feature-artifacts/AgentFindingArtifact.tsx`) — the
  `PinnedCommentScene` surface with the `AgentCommentCard` popover (agent finding
  + approve/reject) instead of the threaded dialog. Wired to the review-agents
  feature page's **Findings** tab (`scripts/seed-feature-review-agents.mjs`).
- `custom-agent` (`feature-artifacts/CustomAgentArtifact.tsx`) — the Superflow
  custom-agent builder screen: the green 3×3 dotted app-icon tile + agent name
  ("SEO Agent") and a three-step wizard rail (Basics ✓ →
  Prompt → Test). Prop-driven via `variant`: `"prompt"` (default, the
  `custom-agent` mock) makes the **Prompt** step active — a focused prompt
  textarea (`Check for` + blinking caret, a white "Refine" pill) and the
  "Questions" block with its dashed "Add Question" button. Bespoke, left-anchored;
  the prompt box + add button intentionally bleed off the right of the ~631px
  visible frame. CSS-only staggered entrance; rests settled under reduced motion.
  Wired to the review-agents feature page's **Custom Agent** tab
  (`scripts/seed-feature-review-agents.mjs`), which is the block's default view.
- `custom-agent-test` (`CustomAgentTestArtifact`, same file) — the `"test"`
  variant of `CustomAgentArtifact`: the **Prompt** step is now complete and the
  **Test** step is active, showing a labelled test case ("Test Case #1 —
  Commented Out Metadata"), a code box of an HTML `<head>` whose commented-out
  `description` / `robots` meta tags are flagged, and an "Is this Correct?" answer
  bar (Yes / No). Registered as its own mock so a tab can select it directly;
  wired to the review-agents feature page's **Test Cases** tab
  (`scripts/seed-feature-review-agents.mjs`).

## Scoped Memory Feature Artifacts

Two static feature-section artifacts for the memory page's "What it holds" block
(`block-holds`). Both are built from one shared set of sub-components in
`feature-artifacts/MemoryScopeParts.tsx` (+ `.module.css`) so they stay in
visual lockstep. Geometry mirrors Figma node `925:2667`.

- `MemoryScopeParts.tsx` exports the shared pieces (with prop types):
  - `ClientCard` (`ClientCardProps`) — a rounded lavender pill: a coloured
    Tabler client glyph (`icon`: `"heart"` / `"mood-wink"`) + `accent` colour +
    a "Client NN" `label`. `ClientGlyph` draws the inline icon geometry.
  - `MemoryCard` (`MemoryCardProps`) — a thin-bordered white memory card with a
    lighter stacked sheet peeking below; its `label` + pink brain mark are the
    reused `MemoryPill` in its new `card` variant. Used for both the
    "32 Learnings in Memory" and "Organization Memory" cards.
  - `ClientColumn` (`ClientColumnProps`) — a full column: `ClientCard` → short
    connector → `MemoryCard`. Shared by both artifacts.
  - Shared string/colour constants (`LEARNINGS_LABEL`, `ORG_MEMORY_LABEL`,
    `AGENCY_RULES_LABEL`, `CLIENT_ONE_LABEL`/`CLIENT_TWO_LABEL`, accents, …).
- `memory-per-client` (`MemoryPerClientArtifact.tsx`,
  `data-artifact="memory-per-client"`) — a left-anchored row of `ClientColumn`s
  (Client 01 heart, Client 02 mood-wink), the second bleeding off the right
  edge. Wired to the memory page's **Per-client memory** tab.
- `memory-scoped-three` (`MemoryScopedThreeArtifact.tsx`,
  `data-artifact="memory-scoped-three"`) — the same two client columns, but both
  memory cards merge through an inverted-cup connector whose stem drops into an
  `MemoryCard label="Organization Memory"`; a dog-eared **Agency Rules** file
  (the reused `PdfFile` with a unique `idPrefix`) wires in from the left. Wired
  to the memory page's **Scoped three ways** tab.
- `MemoryPill` (`hero-artifacts/MemoryUploadArtifact.tsx`) gained a
  backward-compatible `card` prop: the rounded-rectangle memory-card look (thin
  border, tight shadow, 20px sentence label) used by `MemoryCard`. Existing
  `plain`/default consumers (hero "Upload once", `memory-upload-scan`) are
  unaffected.
- `PdfFile` (`hero-artifacts/MemoryUploadArtifact.tsx`) gained a
  backward-compatible `tint` prop (`PdfFileTint`: body/fold gradient stops,
  outline stroke, fold shadow; defaults to `DEFAULT_PDF_TINT`, the original
  blue/lavender), and its `label` now accepts a `ReactNode` so callers can pass
  a two-line wordmark. Existing consumers (hero "Upload once",
  `memory-upload-scan`, `memory-scoped-three`'s Agency Rules sheet) pass no
  `tint` and render exactly as before.

## Solution Section variants

- `SolutionSection.tsx` renders one of five illustrations keyed off
  `solution.variant`: `checklist` (default, shared), `comments`, the opt-in
  `memory-guidelines` (memory page), `ask-ai` (Ask AI page) and `analytics`
  (Analytics page). Adding a variant does NOT change what any other page renders.
- `memory-guidelines` (`SolutionGuidelinesFlow`, inside `SolutionSection.tsx`):
  a left stack of three tinted, dog-eared guideline sheets — the reused
  `PdfFile` with `DEFAULT_PDF_TINT` (Brand, blue), a pink tint (Agency), and a
  green tint (SEO), each two-line-labelled — feeds, through the shared dashed
  `SolutionConnector`, the pink `BrainGlyph` in a round white badge. Three
  text-only `.countPill`s ring the brain ("12 Agency Rules", "24 Client
  Projects", "8 SEO Checks"). Entrances use the section's `.revealItem`
  mechanism, so it is prefers-reduced-motion safe.
- `ask-ai` (`SolutionAskAiInsights.tsx`, a client component): a left column of
  three minimal graph tiles — a bar chart ("Rounds by client", red), a donut
  ("Copy vs bug", indigo) and a sparkline ("Review trend", green) — feeds,
  through the shared dashed `SolutionConnector` (carrying a looping data pulse),
  a single insight card styled like an Ask AI answer (blue sphere avatar +
  `INSIGHT` label + one plain-language takeaway). The card cycles one insight
  per graph and highlights the matching tile (accent ring + lift, others
  dimmed) so a chart visibly "becomes a sentence". The tile draw-ins reuse the
  section's `.revealItem` mechanism; all looping motion (cycling, pulse, chart
  draw) is gated behind `prefers-reduced-motion` (reduced motion holds tile 0 +
  its insight, no cycling/pulse). The Ask AI page forces this variant
  client-side in `FeaturePageBody` (mirroring `ASK_AI_TAB_MOCKS`) and the seed
  (`scripts/seed-feature-pages-batch.mjs`) carries `variant: "ask-ai"`.
- `analytics` (`SolutionAnalyticsInsights.tsx`, a client component): the same
  "minimal graphs → single insight" flow as `ask-ai`, **sharing one
  implementation** — both call the exported `SolutionInsightsFlow(specs,
  insightLabel)` from `SolutionAskAiInsights.tsx`. The analytics tiles are a
  status sparkline, rounds-by-client bars and a copy-vs-bug donut; they resolve
  into a card labelled `THIS WEEK` cycling one curated weekly takeaway per tile
  ("the week, already read"). Same `.revealItem` entrance + reduced-motion
  behavior as `ask-ai`. The Analytics page forces this variant client-side in
  `FeaturePageBody` and the seed carries `variant: "analytics"`.
- Header cue: the small icon row above the heading comes from the variant's
  built-in before→after pair, or a named `solution.icon` override. Variant
  defaults — checklist: `table → arrow → robot`; comments: `grain → arrow →
  message`; ask-ai: `chart → arrow → message` (`.headerIconChart` /
  `.headerIconArrow` / `.headerIconMessage`); analytics: `chart → arrow →
  sparkles` (`.headerIconChart` / `.headerIconArrow` / `.headerIconSparkles`, the
  indigo `SparklesIcon` cueing the curated-insight end). The
  `solution.icon = "sheet-brain"` override (memory page) instead renders a
  neutral document `SheetIcon` → gray gradient `ArrowRightIcon` → pink
  `BrainGlyph` (`.headerIconSheet` / `.headerIconArrow` / `.headerIconBrain`).

## Comments Feature Page Wiring

- `/preview/features/comments` is seeded by `scripts/seed-feature-comments.mjs`
  (run `node --env-file=.env.local scripts/seed-feature-comments.mjs`).
- `components/feature-2026/FeaturePageBody.tsx` maps a comments-page block/tab to
  the right mock — either the tab's explicit `mock` value or, as a fallback, its
  label via `COMMENTS_TAB_MOCKS` / `COMMENTS_BLOCK_MOCKS`.

## Adding Another Artifact

1. Reuse `PinnedCommentScene` (+ `cardProps`) first; drop to `PinScene` /
   `CommentThreadCard` / `CommentPin` / `BrowserChrome` only if you need bespoke
   layout. Add card features by extending `CommentThreadCardProps`, never by
   forking the card.
2. Export the artifact from a `feature-artifacts/*` file.
3. Register its key in `MOCKS` in `FeatureSetBlock.tsx`.
4. Add the key to `FEATURE_SET_MOCK_OPTIONS` in `sanity/schemas/featurePage.ts`.
5. Use the key in the relevant seed script or Sanity document.
