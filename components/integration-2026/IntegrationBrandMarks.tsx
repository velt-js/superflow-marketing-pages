import type { ReactNode } from "react";

/**
 * Shared brand-mark glyphs for the task-management integration pages' bespoke
 * sections (Monday, Asana, ClickUp).
 *
 * All marks are inline SVGs (no asset dependency, no client boundary) so they
 * can be reused by the server-rendered "What crosses" and "Link once" sections.
 * The Superflow flower geometry mirrors `SuperflowFlowerMark` in
 * `components/home-2026/feature-artifacts/WhiteLabelArtifact.tsx`, and the
 * tool geometries mirror the logos used by the hero integration artifacts
 * (`components/home-2026/hero-artifacts/IntegrationsArtifact.tsx`), so the
 * marks stay identical across the site.
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

/**
 * The Asana mark — three coral dots masked from a warm radial gradient,
 * mirroring the `AsanaLogo` used by the hero integration artifacts.
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline Asana SVG, or `null` on failure.
 */
export function AsanaMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="38.586 17.925 35.081 35.021"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <defs>
          <radialGradient
            id="brandmark-asana"
            gradientUnits="userSpaceOnUse"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="translate(56.1473 35.4204) rotate(-90) scale(17.5032 17.5336)"
          >
            <stop stopColor="#FFB900" />
            <stop offset="0.6" stopColor="#F95D8F" />
            <stop offset="0.9991" stopColor="#F95353" />
          </radialGradient>
          <mask
            id="brandmark-asana-mask"
            maskUnits="userSpaceOnUse"
            x="38"
            y="17"
            width="36"
            height="36"
          >
            <path fill="#ffffff" d="M63.0922 25.2028C63.0922 29.0331 59.9678 32.1521 56.1308 32.1521C52.2938 32.1521 49.1694 29.0331 49.1694 25.2028C49.1694 21.3724 52.2938 18.2534 56.1308 18.2534C60.0226 18.2534 63.0922 21.3177 63.0922 25.2028ZM47.0864 33.8484C43.2494 33.8484 40.125 36.9674 40.125 40.7978C40.125 44.6282 43.2494 47.7472 47.0864 47.7472C50.9234 47.7472 54.0479 44.6282 54.0479 40.7978C54.0479 36.9674 50.9782 33.8484 47.0864 33.8484ZM65.1752 33.8484C61.3382 33.8484 58.2137 36.9674 58.2137 40.7978C58.2137 44.6282 61.3382 47.7472 65.1752 47.7472C69.0122 47.7472 72.1366 44.6282 72.1366 40.7978C72.1366 36.9674 69.067 33.8484 65.1752 33.8484Z" />
          </mask>
        </defs>
        <g mask="url(#brandmark-asana-mask)">
          <path fill="url(#brandmark-asana)" d="M56.1265 17.9255C65.8287 17.9255 73.6671 25.7504 73.6671 35.4357C73.6671 45.1211 65.8287 52.9459 56.1265 52.9459C46.4244 52.9459 38.5859 45.1211 38.5859 35.4357C38.6408 25.7504 46.4792 17.9255 56.1265 17.9255Z" />
        </g>
      </svg>
    );
  } catch {
    return null;
  }
}

/**
 * The ClickUp mark — gradient chevron over gradient base strokes, mirroring
 * the `ClickUpLogo` used by the hero integration artifacts.
 *
 * @param props - Rendered size and optional class name.
 * @returns The inline ClickUp SVG, or `null` on failure.
 */
export function ClickUpMark({
  size = DEFAULT_MARK_SIZE,
  className,
}: BrandMarkProps): ReactNode {
  try {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="362 12.25 37.125 37.125"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <defs>
          <linearGradient
            id="brandmark-clickup-a"
            gradientUnits="userSpaceOnUse"
            x1="370.578"
            y1="39.9558"
            x2="392.252"
            y2="39.9558"
          >
            <stop stopColor="#8930FD" />
            <stop offset="1" stopColor="#49CCF9" />
          </linearGradient>
          <linearGradient
            id="brandmark-clickup-b"
            gradientUnits="userSpaceOnUse"
            x1="371.049"
            y1="24.9023"
            x2="391.816"
            y2="24.9023"
          >
            <stop stopColor="#FF02F0" />
            <stop offset="1" stopColor="#FFC800" />
          </linearGradient>
        </defs>
        <path fillRule="evenodd" clipRule="evenodd" fill="url(#brandmark-clickup-a)" d="M370.578 38.49L374.57 35.4094C376.704 38.1741 378.956 39.4774 381.446 39.4774C383.936 39.4774 386.149 38.2136 388.164 35.4489L392.234 38.4505C389.31 42.4 385.674 44.4932 381.446 44.4932C377.257 44.4932 373.582 42.4 370.578 38.49Z" />
        <path fillRule="evenodd" clipRule="evenodd" fill="url(#brandmark-clickup-b)" d="M381.444 25.181L374.331 31.3027L371.051 27.4717L381.484 18.5063L391.838 27.4717L388.518 31.2632L381.444 25.181Z" />
      </svg>
    );
  } catch {
    return null;
  }
}
