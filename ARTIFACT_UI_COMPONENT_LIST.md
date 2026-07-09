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

## Shared Comments Primitives

- `feature-artifacts/CommentThreadCard.tsx` — **the single reusable comment
  dialog.** Every posted-comment popover on the site is this component. It is
  fully prop-driven (see props below) and is reused by `PinnedCommentScene`,
  `KanbanArtifact`, `AllDevicesArtifact`, and all seven comments-feature mocks.
- `feature-artifacts/CommentPin.tsx` — the purple teardrop avatar/anchor pin
  (image or single-character mode). Use this instead of hand-rolling pin badges;
  also used by the "Agents at Work" hero artifact.
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
  anything to the dialog. Its opt-in `textSelectAnimation` prop (only with
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

## Existing Reusable Mocks

- Durable comments (all `PinnedCommentScene` configs): `pinned-comments`,
  `auto-screenshot`, `versioning`, `live-site`.
- Hero artifacts reused verbatim via `feature-artifacts/HeroArtifactFit.tsx`:
  `review-agents`, `private-comments`, `guest-mode`, `integrations`.
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
- Other feature mocks: `custom-statuses`, `workflows`, `kanban`,
  `record-walkthrough`, `behind-login`, `all-devices`, `ask-ai`,
  `client-memory`. (`kanban` and `all-devices` also reuse `CommentThreadCard`.)

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
