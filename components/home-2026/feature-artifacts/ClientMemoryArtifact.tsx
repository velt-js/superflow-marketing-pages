import type { CSSProperties } from "react";
import Image from "next/image";
import styles from "./ClientMemoryArtifact.module.css";

/**
 * Feature-section tab artifact — "Client Memory".
 * Figma: node 775:2901 (file aVubXS2jMWMDlRK42zvgoy).
 *
 * Static recreation of the "Memory" state: a dashed purple branch that fans in
 * from the top edge and drops a single connector into a centered white memory
 * card. The card shows a stacked trio of client avatars, a mono "FROM 13 CLIENT
 * INTERACTIONS" caption, and the remembered fact "Client Acme always want their
 * primary CTAs capitalized".
 *
 * The dashed branch vector is inlined 1:1 from the Figma export (node 778:3183,
 * including its purple→grey gradient stroke). The two photo avatars are the
 * exported Figma raster assets; the third avatar is a pure gradient sphere in
 * the design and is reproduced here with CSS so no extra asset is needed.
 *
 * The root fills its container (the shared `.panelScreen` white rounded screen)
 * and clips; the composition keeps the design's real pixel proportions so the
 * branch reads as bleeding in from the top edge exactly as in Figma.
 */

const CAPTION_TEXT = "From 13 Client interactions";
const MEMORY_TEXT = "Client Acme always want their primary CTAs capitalized";

const AVATAR_ONE_SRC = "/images/home-2026/feature-set/client-memory-avatar-1.png";
const AVATAR_TWO_SRC = "/images/home-2026/feature-set/client-memory-avatar-2.png";

/** Descriptor for a single stacked client avatar. */
type ClientAvatar = {
  id: string;
  /** Raster source, or `undefined` for the CSS gradient sphere. */
  src?: string;
  /** Overlap stacking order — higher renders on top (leftmost avatar). */
  layer: number;
};

/**
 * The three stacked avatars, left-to-right. The first two are photo exports;
 * the third is the design's blue gradient sphere (rendered via CSS).
 */
const CLIENT_AVATARS: readonly ClientAvatar[] = [
  { id: "avatar-1", src: AVATAR_ONE_SRC, layer: 3 },
  { id: "avatar-2", src: AVATAR_TWO_SRC, layer: 2 },
  { id: "avatar-3", src: undefined, layer: 1 },
];

/**
 * Dashed branch vector — exact export of Figma node 778:3183. A gradient-stroked
 * path (purple #625CF4 at the bottom fading to #F4F4F4 at the top) that splits
 * into two rounded shoulders and drops a vertical connector to the card.
 *
 * @returns The dashed branch `<svg>` element.
 */
function BranchVector() {
  return (
    <svg
      className={styles.branch}
      viewBox="0 0 367 184"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 0V69.3454C1 87.0185 15.3269 101.345 33 101.345H183.5M183.5 101.345V184M183.5 101.345H334C351.673 101.345 366 87.0185 366 69.3454V0M183.5 101.345V0"
        stroke="url(#clientMemoryBranch)"
        strokeWidth="2"
        strokeDasharray="12 12"
      />
      <defs>
        <linearGradient
          id="clientMemoryBranch"
          x1="184"
          y1="184.415"
          x2="184"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#625CF4" />
          <stop offset="0.95" stopColor="#F4F4F4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Render a single stacked client avatar, resolving either a photo source or the
 * CSS gradient-sphere fallback used for the design's third avatar.
 *
 * @param avatar - The avatar descriptor (source and stacking layer).
 * @returns The avatar element.
 */
function ClientAvatarView({ avatar }: { avatar: ClientAvatar }) {
  const avatarStyle: CSSProperties = { zIndex: avatar?.layer };
  const avatarSrc = avatar?.src;

  if (avatarSrc) {
    return (
      <span className={styles.avatar} style={avatarStyle}>
        <Image
          className={styles.avatarImage}
          src={avatarSrc}
          alt=""
          width={40}
          height={40}
        />
      </span>
    );
  }

  return (
    <span
      className={`${styles.avatar} ${styles.avatarSphere}`}
      style={avatarStyle}
      aria-hidden="true"
    />
  );
}

/**
 * Render the "Client Memory" feature artifact.
 *
 * @returns The Client Memory window contents.
 */
export default function ClientMemoryArtifact() {
  return (
    <div className={styles.root} data-artifact="client-memory">
      <div className={styles.scene}>
        <BranchVector />

        <article className={styles.card}>
          <div className={styles.avatars}>
            {CLIENT_AVATARS.map((avatar) => (
              <ClientAvatarView key={avatar?.id} avatar={avatar} />
            ))}
          </div>

          <div className={styles.copy}>
            <p className={styles.caption}>{CAPTION_TEXT}</p>
            <p className={styles.memory}>{MEMORY_TEXT}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
