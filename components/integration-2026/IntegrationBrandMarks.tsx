import type { ReactNode } from "react";

/**
 * Shared brand-mark glyphs for the Monday integration page's bespoke sections.
 *
 * Both marks are inline SVGs (no asset dependency, no client boundary) so they
 * can be reused by the server-rendered "What crosses" and "Link once" sections.
 * The Superflow flower geometry mirrors `SuperflowFlowerMark` in
 * `components/home-2026/feature-artifacts/WhiteLabelArtifact.tsx`, and the
 * Monday geometry mirrors the `MondayLogo`/`MondayMark` used by the hero
 * integration artifacts, so the marks stay identical across the site.
 */

/** Props shared by every brand-mark glyph. */
interface BrandMarkProps {
  /** Rendered width/height in pixels (marks are square). */
  size?: number;
  /** Optional class applied to the root `<svg>`. */
  className?: string;
}

/** Default rendered size (px) when a caller omits one. */
const DEFAULT_MARK_SIZE = 26;

/**
 * The multi-color Superflow flower mark (yellow / coral / green / indigo
 * petals), matching the exact Figma petals used elsewhere on the site.
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline Superflow flower SVG, or `null` on failure.
 */
export function SuperflowFlowerMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path
          d="M13.4316 3.51909C12.6958 3.20466 11.8819 3.11989 11.0969 3.2759C10.312 3.43192 9.59255 3.82142 9.03308 4.3933C8.46157 4.95285 8.07233 5.67168 7.91623 6.45582C7.76014 7.23996 7.84447 8.05291 8.15818 8.7884C8.45708 9.52946 8.97285 10.1631 9.63803 10.6065C10.3032 11.05 11.0868 11.2825 11.8864 11.2736H15.9223V7.24436C15.9311 6.44498 15.698 5.66158 15.2535 4.99684C14.8091 4.33209 14.1741 3.81701 13.4316 3.51909Z"
          fill="#FFCD2E"
        />
        <path
          d="M28.1321 8.52565C27.188 7.58307 25.9855 6.94115 24.6765 6.68096C23.3675 6.42076 22.0107 6.55396 20.7774 7.06372C19.5441 7.57348 18.4896 8.43695 17.7471 9.54511C17.0046 10.6533 16.6073 11.9564 16.6055 13.29V20.0329H23.3675C24.706 20.0471 26.0176 19.657 27.1306 18.9139C28.2436 18.1707 29.1061 17.1091 29.6052 15.868C30.1269 14.638 30.2654 13.2795 30.0027 11.9697C29.7399 10.6599 29.088 9.45962 28.1321 8.52565Z"
          fill="#FF7162"
        />
        <path
          d="M24.3715 23.2142C24.0727 22.4723 23.5569 21.8378 22.8914 21.3935C22.226 20.9492 21.4419 20.7158 20.6416 20.7238H16.6057V24.7565C16.5973 25.5561 16.8307 26.3395 17.2754 27.0042C17.7201 27.6689 18.3554 28.184 19.098 28.4818C19.5949 28.6906 20.1283 28.7986 20.6674 28.7995C21.3289 28.7928 21.9788 28.6243 22.5601 28.3085C23.1414 27.9928 23.6365 27.5396 24.0019 26.9885C24.3674 26.4374 24.5922 25.8053 24.6566 25.1473C24.721 24.4893 24.6231 23.8256 24.3715 23.2142Z"
          fill="#0DCF82"
        />
        <path
          d="M2.93155 16.1289C2.40623 17.3593 2.26498 18.7195 2.52629 20.0315C2.7876 21.3434 3.43928 22.5459 4.39601 23.4816C5.01327 24.11 5.74925 24.6096 6.56125 24.9516C7.37325 25.2936 8.24513 25.4712 9.12631 25.4739C10.0283 25.4719 10.9209 25.2915 11.7527 24.9432C12.995 24.4447 14.0576 23.5829 14.8013 22.4708C15.5451 21.3586 15.9353 20.0479 15.921 18.7104V11.9606H9.16929C7.83035 11.9467 6.51844 12.3373 5.4054 13.081C4.29236 13.8248 3.4301 14.8872 2.93155 16.1289Z"
          fill="#625DF5"
        />
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The Monday.com mark — three diagonal red / yellow / green strokes.
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline Monday SVG, or `null` on failure.
 */
export function MondayMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="259.188 11.938 39.188 39.188"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path
          fill="#F62B54"
          d="M263.942 43.2761C262.264 43.2761 260.587 42.345 259.656 40.8552C258.724 39.3654 258.91 37.5032 259.842 36.0134L268.6 22.2329C269.532 20.7431 271.209 19.812 272.887 19.812C274.564 19.812 276.241 20.9294 277.173 22.4191C277.918 23.9089 277.918 25.7711 276.986 27.2609L268.228 41.0414C267.296 42.345 265.619 43.2761 263.942 43.2761Z"
        />
        <path
          fill="#FFCC00"
          d="M279.039 43.2763C277.175 43.2763 275.684 42.3452 274.753 40.8554C274.007 39.1794 274.007 37.3172 274.939 35.8274L283.697 22.0469C284.629 20.5571 286.306 19.626 287.984 19.626C289.847 19.626 291.338 20.7433 292.27 22.2331C293.015 23.7229 293.015 25.5851 291.897 27.0749L283.138 40.8554C282.207 42.3452 280.716 43.2763 279.039 43.2763Z"
        />
        <path
          fill="#00CA72"
          d="M293.758 43.4624C296.228 43.4624 298.23 41.4614 298.23 38.993C298.23 36.5247 296.228 34.5237 293.758 34.5237C291.288 34.5237 289.285 36.5247 289.285 38.993C289.285 41.4614 291.288 43.4624 293.758 43.4624Z"
        />
      </svg>
    );
  } catch {
    return null;
  }
}
