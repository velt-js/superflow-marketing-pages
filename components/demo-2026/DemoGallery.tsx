import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./DemoGallery.module.css";

/** Names of the Tabler glyphs used by the demo asset cards. */
type DemoGlyphName = "world" | "video" | "ease-in-out" | "file-text" | "photo";

/**
 * Tabler path data per glyph (24 × 24 viewBox, stroke geometry) — the same
 * inline-path idiom as components/shared-2026/CategoryGlyph.tsx, so there is
 * no icon-library dependency.
 */
const GLYPH_PATHS: Record<DemoGlyphName, readonly string[]> = {
  world: [
    "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    "M3.6 9h16.8",
    "M3.6 15h16.8",
    "M11.5 3a17 17 0 0 0 0 18",
    "M12.5 3a17 17 0 0 1 0 18",
  ],
  video: [
    "M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z",
    "M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z",
  ],
  "ease-in-out": ["M3 20c8 0 10 -16 18 -16"],
  "file-text": [
    "M14 3v4a1 1 0 0 0 1 1h4",
    "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z",
    "M9 9l1 0",
    "M9 13l6 0",
    "M9 17l6 0",
  ],
  photo: [
    "M15 8h.01",
    "M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z",
    "M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5",
    "M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3",
  ],
};

/** A live demo destination rendered as one gallery card. */
interface DemoAsset {
  id: string;
  /** Card title — the asset type being reviewed in the demo. */
  label: string;
  /** One-line benefit blurb shown under the title. */
  description: string;
  /** Live demo destination (external Superflow drive/demo app). */
  href: string;
  /** Screenshot of the demo, from /public/images/demo. */
  image: string;
  imageAlt: string;
  glyph: DemoGlyphName;
  /** Accent hex for the glyph, aligned with the 2026 accent palette. */
  accent: string;
  /** Featured cards span the full grid width on desktop. */
  featured?: boolean;
}

/** Label of the CTA row at the bottom of every card. */
const CARD_CTA_LABEL = "Open live demo";

const DEMO_ASSETS: readonly DemoAsset[] = [
  {
    id: "websites",
    label: "Websites",
    description:
      "Pin comments directly on a live client site and collaborate in context.",
    href: "https://demo.usesuperflow.com",
    image: "/images/demo/website.png",
    imageAlt: "Website demo",
    glyph: "world",
    accent: "#4c7ef3",
    featured: true,
  },
  {
    id: "video",
    label: "Video",
    description:
      "Leave frame-accurate feedback on video cuts without exporting stills.",
    href: "https://drive.usesuperflow.com/video?id=YVUxTXhLUDByY2EyVVh3S2k4YmxfXzhlYWExNjc5NWQ5YWJlYjBlOGNhZmE1NjdjMTg3ZTI2X192aWRlbw%3D%3D&version=v1",
    image: "/images/demo/video.png",
    imageAlt: "Video demo",
    glyph: "video",
    accent: "#e5484d",
  },
  {
    id: "lottie",
    label: "Lottie",
    description:
      "Review animations in motion and comment on the exact frame.",
    href: "https://drive.usesuperflow.com/lottie?id=YVUxTXhLUDByY2EyVVh3S2k4YmxfXzQ2MTIxN2NlYTAxZDJkOTk0YjMwMmQwZjllMTA4YjMyX19sb3R0aWU%3D&version=v1",
    image: "/images/demo/lottie.png",
    imageAlt: "Lottie demo",
    glyph: "ease-in-out",
    accent: "#17b26a",
  },
  {
    id: "pdf",
    label: "PDF",
    description:
      "Mark up proposals, decks, and print proofs page by page.",
    href: "https://drive.usesuperflow.com/pdf?id=YVUxTXhLUDByY2EyVVh3S2k4YmxfXzRkYjdiZGU1MzQ5NjNjOWQ0NDRmZGUyODgxYWFiMjE4X19wZGY%3D&review=true&version=v1",
    image: "/images/demo/pdf.png",
    imageAlt: "PDF demo",
    glyph: "file-text",
    accent: "#e16e34",
  },
  {
    id: "image",
    label: "Image",
    description:
      "Annotate mockups and creatives with precise, pixel-pinned notes.",
    href: "https://drive.usesuperflow.com/image?id=YVUxTXhLUDByY2EyVVh3S2k4YmxfX2JjYzYwZjFiM2NkZDVlMzNmYjRlOGQ3NTlmMDhkMmVlX19pbWFnZQ%3D%3D&review=true&version=v1",
    image: "/images/demo/image.png",
    imageAlt: "Image demo",
    glyph: "photo",
    accent: "#7c5cfc",
  },
];

/**
 * A coloured Tabler stroke glyph for a demo card. Decorative: hidden from the
 * accessibility tree.
 *
 * @param props - The glyph name, its accent colour and the render size.
 * @returns The coloured glyph, or `null` on failure.
 */
function DemoGlyph({
  glyph,
  accent,
  size = 24,
}: {
  glyph: DemoGlyphName;
  accent: string;
  size?: number;
}): ReactNode {
  try {
    const paths = GLYPH_PATHS[glyph];
    if (!paths) {
      return null;
    }
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths.map((pathData) => (
          <path key={pathData} d={pathData} />
        ))}
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * A single demo card: the demo screenshot on top, then the asset glyph,
 * title, blurb and a CTA row. The whole card is one external link to the
 * live demo, opened in a new tab so the marketing page stays open.
 *
 * @param props - The demo asset to render.
 * @returns The card list item, or `null` on failure.
 */
function DemoCard({ asset }: { asset: DemoAsset }): ReactNode {
  try {
    const itemClassName = asset?.featured
      ? `${styles.item} ${styles.itemFeatured}`
      : styles.item;
    const cardClassName = asset?.featured
      ? `${styles.card} ${styles.cardFeatured}`
      : styles.card;

    return (
      <li className={itemClassName}>
        <a
          className={cardClassName}
          href={asset?.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={styles.imageFrame}>
            <Image
              className={styles.image}
              src={asset?.image}
              alt={asset?.imageAlt}
              width={720}
              height={450}
              sizes="(max-width: 900px) 100vw, 600px"
            />
          </span>
          <span className={styles.cardBody}>
            <span className={styles.cardTitleRow}>
              <DemoGlyph glyph={asset?.glyph} accent={asset?.accent} />
              <span className={styles.cardTitle}>{asset?.label}</span>
            </span>
            <span className={styles.cardDesc}>{asset?.description}</span>
            <span className={styles.cardCta}>
              {CARD_CTA_LABEL}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={styles.cardCtaArrow}
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6l-6 6" />
              </svg>
            </span>
          </span>
        </a>
      </li>
    );
  } catch {
    return null;
  }
}

/**
 * Demo gallery — 2026 light redesign of the /demo page body. Renders the five
 * live-demo destinations (website, video, Lottie, PDF, image) as cards in the
 * canonical 2026 card idiom (light card, hairline border, accent hover lift),
 * on a white section that the gradient hero above fades into.
 *
 * @returns The gallery section, or `null` on failure.
 */
export default function DemoGallery(): ReactNode {
  try {
    return (
      <section className={styles.section} data-section="demo-gallery">
        <div className={styles.inner}>
          <ul className={styles.grid}>
            {DEMO_ASSETS.map((asset) => (
              <DemoCard key={asset?.id} asset={asset} />
            ))}
          </ul>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
