"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import AgentsAtWorkArtifact from "@/components/home-2026/hero-artifacts/AgentsAtWorkArtifact";
import BuildAgentsArtifact from "@/components/home-2026/hero-artifacts/BuildAgentsArtifact";
import IntegrationsArtifact from "@/components/home-2026/hero-artifacts/IntegrationsArtifact";
import { HeroAuthBehindPasswordArtifact } from "@/components/home-2026/hero-artifacts/AuthenticatedPagesHeroFit";
import { HeroClientReviewMagicLinkArtifact } from "@/components/home-2026/hero-artifacts/ClientReviewHeroFit";
import { HeroClientMemoryArtifact } from "@/components/home-2026/hero-artifacts/MemoryHeroFit";
import { HeroPrivateTeamThreadArtifact } from "@/components/home-2026/hero-artifacts/PrivateCommentsHeroFit";
import { HeroScreenshotCaptureArtifact } from "@/components/home-2026/hero-artifacts/ScreenshotsHeroFit";

import styles from "./ComparisonArtifact.module.css";
import type { ComparisonArtifactName } from "./comparisonArtifactMap";

/** Native canvas width the hero artifacts are authored for (px). */
const CANVAS_WIDTH = 1200;
/** Native canvas height the hero artifacts are authored for (px). */
const CANVAS_HEIGHT = 578;
/** Pre-measure scale guess (~1032px content column) to minimize any flash. */
const DEFAULT_SCALE = 0.86;

/** One renderable artifact: the reused hero component + a default caption. */
type ComparisonArtifactEntry = {
  component: ComponentType;
  caption: string;
};

/**
 * Registry of comparison-page artifacts, keyed by
 * {@link ComparisonArtifactName}. Captions are honest, sitewide-true product
 * lines; page bodies can override them (e.g. the vs-page heroCaption).
 */
const COMPARISON_ARTIFACTS: Readonly<
  Record<ComparisonArtifactName, ComparisonArtifactEntry>
> = {
  "agents-at-work": {
    component: AgentsAtWorkArtifact,
    caption:
      "AI agents run your checklist on every change and pin what they find.",
  },
  "agents-from-checklist": {
    component: BuildAgentsArtifact,
    caption:
      "Paste the QA checklist you already have; agents assemble from it.",
  },
  "client-approves": {
    component: HeroClientReviewMagicLinkArtifact,
    caption:
      "Your client opens a link and taps Approve. No account, from their phone.",
  },
  "behind-login": {
    component: HeroAuthBehindPasswordArtifact,
    caption:
      "Review the live site itself - behind passwords, Okta, and SSO.",
  },
  "private-thread": {
    component: HeroPrivateTeamThreadArtifact,
    caption:
      "The team debate stays private. The client sees one settled answer.",
  },
  "captured-context": {
    component: HeroScreenshotCaptureArtifact,
    caption: "A screenshot attaches to every comment automatically.",
  },
  "client-memory": {
    component: HeroClientMemoryArtifact,
    caption:
      "Brand rules and past decisions, remembered per client for the next project.",
  },
  integrations: {
    component: IntegrationsArtifact,
    caption:
      "Two-way sync with Asana, Monday, and ClickUp. Slack built in.",
  },
};

/**
 * A framed, responsive product-artifact window for the comparison pages.
 *
 * Reuses an existing hero-window artifact on its native 1200 × 578 canvas
 * inside a black 2px reveal frame (matching the homepage hero window), scaled
 * uniformly to the container width so the artifact never reflows — the same
 * fit strategy as the FeatureSet mobile scale, but continuous via a
 * ResizeObserver.
 *
 * @param name - Which registered artifact to render.
 * @param caption - Optional caption overriding the artifact's default line.
 * @returns The framed artifact figure, or `null` for unknown names.
 */
export default function ComparisonArtifactWindow({
  name,
  caption,
}: {
  name: ComparisonArtifactName;
  caption?: string;
}): ReactNode {
  const screenRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(DEFAULT_SCALE);

  useLayoutEffect(() => {
    try {
      const screenElement = screenRef?.current;
      if (!screenElement || typeof ResizeObserver === "undefined") {
        return undefined;
      }
      /**
       * Recompute the uniform canvas scale from the screen's current width.
       */
      const applyScale = () => {
        try {
          const width = screenElement?.clientWidth ?? 0;
          if (width > 0) {
            setScale(width / CANVAS_WIDTH);
          }
        } catch {
          // Keep the previous scale on measurement failure.
        }
      };
      applyScale();
      const observer = new ResizeObserver(applyScale);
      observer.observe(screenElement);
      return () => {
        try {
          observer.disconnect();
        } catch {
          // Ignore teardown failures.
        }
      };
    } catch {
      return undefined;
    }
  }, []);

  const entry = COMPARISON_ARTIFACTS?.[name];
  if (!entry) {
    return null;
  }
  const ArtifactComponent = entry.component;
  const captionText = caption ?? entry.caption;

  return (
    <figure className={styles.artifact}>
      <div className={styles.frame}>
        <div ref={screenRef} className={styles.screen}>
          <div
            className={styles.canvas}
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${scale})`,
            }}
          >
            <ArtifactComponent />
          </div>
        </div>
      </div>
      {captionText ? (
        <figcaption className={styles.caption}>{captionText}</figcaption>
      ) : null}
    </figure>
  );
}
