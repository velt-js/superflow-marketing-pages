# Truth block: Frame.io (verified July 2026, from frame.io)

Researched only from the vendor's own pages (frame.io, frame.io/pricing, frame.io/integrations)
and Adobe/Frame.io official docs (help.frame.io, updates.frame.io, blog.frame.io). Rules: facts
from the vendor's own pages only, dated. Unverified stays a dash. Aggregator review sites rejected.
Absence of evidence is "not yet verified".

ANGLE: Frame.io is a video and creative review, proofing, and delivery platform, now an Adobe
product. It plays a different primary game than website QA. You upload finished or in-progress
assets (video, images, audio, PDFs) to a cloud workspace, then collect frame-accurate feedback and
approvals on those assets. It does not review live websites. Recordings from the camera (Camera to
Cloud) and asset playback lead the product. Verified as such July 2026 (frame.io, help.frame.io).

## Strengths
- Camera to Cloud. Takes upload from the set the moment the director yells cut, so the team reviews footage without being at the shoot. Hardware partners include RED, Teradek, Panasonic LUMIX, Sound Devices, Atomos, FUJIFILM (frame.io/integrations, frame.io/pricing)
- Frame-accurate and range-based comments plus annotations, version stacks, and a comparison viewer on every plan; auto transcription, speaker labels, and captions (frame.io/pricing, frame.io)
- Clients review with no account. A Share for Review link lets external reviewers watch and comment free, entering name and email only on first comment. Reviewers are unlimited and free (help.frame.io "What is a User", help.frame.io review link docs)
- Deep NLE and Adobe integration. Frame-accurate notes land inside Premiere; Final Cut Pro integration and a Lightroom connection exist; plus API, webhooks, Zapier, Make, and Adobe Workfront Fusion (frame.io/integrations, frame.io/pricing)

## Limits
- No live-website or URL review. It reviews uploaded assets only (video, images, audio, PDFs, 3D). Nothing loads or checks a running site (frame.io/pricing, help.frame.io).
- Nothing checks the content on its own. A person leaves every comment. AI does not find issues in the footage; it organizes, summarizes feedback, and powers search (help.frame.io Frame.io Labs, checked July 2026).
- AI Assistant is experimental (opt-in Frame.io Labs), available to all account types with usage limits that vary by plan (help.frame.io Frame.io Labs).
- Internal comments are gated to the Team plan and up. Free and Pro have no team-only threads (frame.io/pricing).
- No memory concept in product. Media intelligence indexes assets for search, but nothing persists learned context across projects as a memory (checked July 2026).

## Open dashes (re-verify before rendering as fact)
- Behind-login / authenticated-site review: not applicable and not verified (it reviews uploaded assets, not live pages)
- Automatic per-comment or per-visit screenshots: not verified (no website screenshot capture; capture is footage from the camera, not the browser)
- Competitor migration / import tooling: not yet verified (bulk upload via Frame.io Drive and the Transfer app, and a Storage Connect Import API to register existing S3 objects; no competitor-specific importer described)
- Two-way status sync as a native named feature: not yet verified (approval status is settable via the public API `allow_approvals` and read via webhooks; a packaged two-way sync to a named tool is not stated)

## Pricing (verified July 2026, frame.io/pricing)
- Billed per member per month, plus tax. Annual billing saves 13%. External reviewers are free and unlimited.
- Free: $0. Up to 2 members, 2GB storage (2GB mounted), up to 2 projects, transcription and captions, Camera to Cloud.
- Pro: $15 per member/mo. Up to 5 members, 2TB included + 2TB per extra member, 250GB mounted, unlimited projects, custom-branded shares, passphrase and expiring shares, comment attachments, one static watermark template.
- Team: $25 per member/mo. Up to 15 members, 3TB included + 2TB per extra member, 500GB mounted, internal comments, restricted projects and folders.
- Enterprise: custom. Multiple workspaces, SSO (SAML2), session-based and forensic watermarking, DRM, Storage Connect (own AWS S3), asset lifecycle management, priority support.

## Stay line
If your work is video and creative assets, and you want frame-accurate review, approvals, and footage straight from the camera, Frame.io is a strong fit. Stay.

## Granted noun (vs-class H1)
video review tool

## Sources
- https://frame.io -> product framing (review and approval for videos, images, and docs), Camera to Cloud, frame-accurate feedback, Premiere integration, transcription and captions, sharing and presentations, plan snapshot
- https://frame.io/pricing -> tiers (Free/Pro/Team/Enterprise), prices ($15 and $25 per member/mo), member caps, storage and mounted-storage caps, annual saves 13%, internal comments gated to Team, restricted projects/folders on Team, version stacks, comparison viewer, transcription/captions, Document Markup, 3D Asset Viewer, watermarking, SSO, integrations matrix (Premiere, Final Cut Pro, Lightroom, iOS/tvOS/Transfer apps)
- https://frame.io/integrations -> integrations ecosystem: Premiere, Lightroom, Camera to Cloud hardware (RED, Teradek, Atomos, Panasonic LUMIX, Sound Devices, FUJIFILM), C2C apps, public API, webhooks and Actions, Zapier, Make, Pabbly, Adobe Workfront Fusion
- https://help.frame.io/en/articles/15305881-frame-io-labs -> AI Assistant scope (organize folders, rename assets, apply metadata, summarize feedback across revisions, generate placeholder images), experimental opt-in Labs, all account types with plan-based usage limits, web only
- https://updates.frame.io/ -> AI Assistant release notes (natural-language organize, summarize, generate images and video), full-screen AI search results
- https://blog.frame.io/2025/12/01/the-ultimate-guide-to-the-new-frame-io-search-experience/ -> media intelligence search: NLP query parsing, comments and transcription search, semantic/visual search (Teams and Enterprise beta), models never trained on your media
- https://help.frame.io/en/articles/9090642-getting-started-what-is-a-user -> Reviewer has no login, no account, 100% free; best use case is clients approving progress; Guest and Collaborator definitions
- https://help.frame.io/en/articles/414306-sharing-your-files-and-folders-for-review-legacy -> Share for Review link; reviews videos, images, audio, PDFs; no account to comment; name/email saved per session; approval permission; approvals mark Approved / In Progress / Needs Review
- https://help.frame.io/en/articles/1731442-the-difference-between-adding-a-user-to-your-project-and-sharing-for-review-legacy -> review-link permissions (approve clips, versions, downloading, comments, passphrase, expiry); comment without an account
- https://next.developer.frame.io/platform/v2/working-with-review-links.md -> public API creates review links with `allow_approvals`, `current_version_only`, `enable_downloading`, expiry, password
- https://help.frame.io/en/articles/14501614-getting-started-with-frame-io-drive-mounted-storage -> Frame.io Drive bulk transfers (files, folders, whole projects), replaces legacy Transfer app
- https://help.frame.io/en/articles/12356206-storage-connect-for-frame-io-registering-assets -> Storage Connect Import API registers existing S3 objects (Enterprise)

## Eight labels
1. Who checks the content: A person leaves every comment. No AI finds issues in the footage. AI (opt-in Frame.io Labs, all account types, plan-based usage limits) organizes projects, renames assets, summarizes feedback across revisions, and generates placeholder images; media intelligence powers NLP and semantic search; Content Credentials flag AI-made media (help.frame.io Frame.io Labs, blog.frame.io search guide).
2. How the client says yes: Share for Review links. Reviewers need no account and comment free, entering name and email on first comment (session only). If approvals are enabled on the link, reviewers set each clip to Approved, In Progress, or Needs Review, and the project is notified (help.frame.io review link docs).
3. Where you review: Uploaded assets only, in a cloud player: video, images, audio, PDFs (multipage viewer), plus a 3D Asset Viewer and Document Markup. No live-website review (frame.io/pricing, help.frame.io).
4. What stays private: Internal comments separate client threads from team threads, gated to the Team plan and up. Restricted projects and folders on Team; Enterprise adds private workspaces (frame.io/pricing).
5. What gets captured: Frame-accurate and range-based comments, annotations, custom metadata, version stacks, a comparison viewer, and transcription with speaker labels and captions. Camera to Cloud uploads takes straight from the camera. No website screenshot or browser-session capture (frame.io/pricing, frame.io).
6. What it remembers: No memory concept. Media intelligence indexes assets for search, but nothing persists learned context across projects (checked July 2026).
7. How it fits your stack: Premiere (frame-accurate notes in the panel), Final Cut Pro, Lightroom connection, iOS/tvOS/Transfer apps; Camera to Cloud hardware (RED, Teradek, Atomos, Panasonic LUMIX, Sound Devices, FUJIFILM); public API, webhooks, Actions, Zapier, Make, Adobe Workfront Fusion. Approval status is settable and readable via the API; a packaged two-way sync to a named tool is not yet verified (frame.io/integrations).
8. What it costs: Free $0 (2 members, 2GB, 2 projects). Pro $15/member/mo (5 members, 2TB+2TB per member, 250GB mounted). Team $25/member/mo (15 members, 3TB+2TB per member, 500GB mounted, internal comments). Enterprise custom. Annual saves 13%; reviewers free (frame.io/pricing, July 2026).
