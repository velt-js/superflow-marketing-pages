import type { ReactNode } from "react";

/**
 * Shared brand/integration logo marks for the feature-section artifacts
 * (Kanban / Integrations). Each is an exact multi-colour vector; gradient and
 * mask IDs are prefixed with `bl-` so they never collide with the hero
 * "Integrations" artifact if both render on the same page.
 */

/** Props accepted by every brand logo. */
export interface BrandLogoProps {
  /** Rendered width/height in pixels. */
  size?: number;
}

/** Asana — three coral dots masked from a warm radial gradient. */
export function AsanaLogo({ size = 26 }: BrandLogoProps): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="38.586 17.925 35.081 35.021" fill="none" aria-hidden="true">
        <defs>
          <radialGradient
            id="bl-asana"
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
          <mask id="bl-asana-mask" maskUnits="userSpaceOnUse" x="38" y="17" width="36" height="36">
            <path fill="#ffffff" d="M63.0922 25.2028C63.0922 29.0331 59.9678 32.1521 56.1308 32.1521C52.2938 32.1521 49.1694 29.0331 49.1694 25.2028C49.1694 21.3724 52.2938 18.2534 56.1308 18.2534C60.0226 18.2534 63.0922 21.3177 63.0922 25.2028ZM47.0864 33.8484C43.2494 33.8484 40.125 36.9674 40.125 40.7978C40.125 44.6282 43.2494 47.7472 47.0864 47.7472C50.9234 47.7472 54.0479 44.6282 54.0479 40.7978C54.0479 36.9674 50.9782 33.8484 47.0864 33.8484ZM65.1752 33.8484C61.3382 33.8484 58.2137 36.9674 58.2137 40.7978C58.2137 44.6282 61.3382 47.7472 65.1752 47.7472C69.0122 47.7472 72.1366 44.6282 72.1366 40.7978C72.1366 36.9674 69.067 33.8484 65.1752 33.8484Z" />
          </mask>
        </defs>
        <g mask="url(#bl-asana-mask)">
          <path fill="url(#bl-asana)" d="M56.1265 17.9255C65.8287 17.9255 73.6671 25.7504 73.6671 35.4357C73.6671 45.1211 65.8287 52.9459 56.1265 52.9459C46.4244 52.9459 38.5859 45.1211 38.5859 35.4357C38.6408 25.7504 46.4792 17.9255 56.1265 17.9255Z" />
        </g>
      </svg>
    );
  } catch {
    return null;
  }
}

/** Trello — blue rounded card with two columns. */
export function TrelloLogo({ size = 24 }: BrandLogoProps): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="158.422 18.672 25.756 25.713" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="bl-trello" gradientUnits="userSpaceOnUse" x1="171.308" y1="44.4446" x2="171.308" y2="18.6719">
            <stop stopColor="#0052CC" />
            <stop offset="1" stopColor="#2684FF" />
          </linearGradient>
        </defs>
        <path fillRule="evenodd" clipRule="evenodd" fill="url(#bl-trello)" d="M181.133 18.6719H161.467C159.775 18.6719 158.422 20.0252 158.422 21.7169V41.3404C158.422 43.032 159.775 44.3854 161.467 44.3854H181.09C182.782 44.3854 184.135 43.032 184.135 41.3404V21.7592C184.178 20.0252 182.824 18.6719 181.133 18.6719ZM169.502 37.2381C169.502 37.7878 169.037 38.2531 168.487 38.2531H164.216C163.666 38.2531 163.201 37.7878 163.201 37.2381V24.4659C163.201 23.9161 163.666 23.4509 164.216 23.4509H168.53C169.079 23.4509 169.545 23.9161 169.545 24.4659V37.2381H169.502ZM179.441 31.3595C179.441 31.9093 179.018 32.3745 178.426 32.4168C178.426 32.4168 178.426 32.4168 178.384 32.4168H174.112C173.562 32.4168 173.097 31.9516 173.097 31.4018V24.4659C173.097 23.9161 173.562 23.4509 174.112 23.4509H178.426C178.976 23.4509 179.441 23.9161 179.441 24.4659V31.3595Z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Monday.com — three diagonal red / yellow / green marks. */
export function MondayLogo({ size = 26 }: BrandLogoProps): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="259.188 11.938 39.188 39.188" fill="none" aria-hidden="true">
        <path fill="#F62B54" d="M263.942 43.2761C262.264 43.2761 260.587 42.345 259.656 40.8552C258.724 39.3654 258.91 37.5032 259.842 36.0134L268.6 22.2329C269.532 20.7431 271.209 19.812 272.887 19.812C274.564 19.812 276.241 20.9294 277.173 22.4191C277.918 23.9089 277.918 25.7711 276.986 27.2609L268.228 41.0414C267.296 42.345 265.619 43.2761 263.942 43.2761Z" />
        <path fill="#FFCC00" d="M279.039 43.2763C277.175 43.2763 275.684 42.3452 274.753 40.8554C274.007 39.1794 274.007 37.3172 274.939 35.8274L283.697 22.0469C284.629 20.5571 286.306 19.626 287.984 19.626C289.847 19.626 291.338 20.7433 292.27 22.2331C293.015 23.7229 293.015 25.5851 291.897 27.0749L283.138 40.8554C282.207 42.3452 280.716 43.2763 279.039 43.2763Z" />
        <path fill="#00CA72" d="M293.758 43.4624C296.228 43.4624 298.23 41.4614 298.23 38.993C298.23 36.5247 296.228 34.5237 293.758 34.5237C291.288 34.5237 289.285 36.5247 289.285 38.993C289.285 41.4614 291.288 43.4624 293.758 43.4624Z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** ClickUp — two-tone gradient peaks mark. */
export function ClickUpLogo({ size = 26 }: BrandLogoProps): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="362 12.25 37.125 37.125" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="bl-clickup-a" gradientUnits="userSpaceOnUse" x1="370.578" y1="39.9558" x2="392.252" y2="39.9558">
            <stop stopColor="#8930FD" />
            <stop offset="1" stopColor="#49CCF9" />
          </linearGradient>
          <linearGradient id="bl-clickup-b" gradientUnits="userSpaceOnUse" x1="371.049" y1="24.9023" x2="391.816" y2="24.9023">
            <stop stopColor="#FF02F0" />
            <stop offset="1" stopColor="#FFC800" />
          </linearGradient>
        </defs>
        <path fillRule="evenodd" clipRule="evenodd" fill="url(#bl-clickup-a)" d="M370.578 38.49L374.57 35.4094C376.704 38.1741 378.956 39.4774 381.446 39.4774C383.936 39.4774 386.149 38.2136 388.164 35.4489L392.234 38.4505C389.31 42.4 385.674 44.4932 381.446 44.4932C377.257 44.4932 373.582 42.4 370.578 38.49Z" />
        <path fillRule="evenodd" clipRule="evenodd" fill="url(#bl-clickup-b)" d="M381.444 25.181L374.331 31.3027L371.051 27.4717L381.484 18.5063L391.838 27.4717L388.518 31.2632L381.444 25.181Z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Linear — indigo app tile with the layered mark. */
export function LinearLogo({ size = 24 }: BrandLogoProps): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="466.887 19.635 23.667 23.667" fill="none" aria-hidden="true">
        <path fill="#1868DB" d="M466.887 25.5518C466.887 22.284 469.536 19.635 472.804 19.635H484.637C487.905 19.635 490.554 22.284 490.554 25.5518V37.3854C490.554 40.6531 487.905 43.3022 484.637 43.3022H472.804C469.536 43.3022 466.887 40.6531 466.887 37.3854V25.5518Z" />
        <path fill="#ffffff" d="M475.737 34.9435H474.403C472.392 34.9435 470.949 33.7116 470.949 31.9077H478.12C478.491 31.9077 478.732 32.1716 478.732 32.5456V39.7612C476.939 39.7612 475.737 38.3092 475.737 36.2854V34.9435ZM479.278 31.3577H477.945C475.934 31.3577 474.491 30.1478 474.491 28.3439H481.661C482.033 28.3439 482.295 28.5858 482.295 28.9598V36.1754C480.503 36.1754 479.278 34.7235 479.278 32.6996V31.3577ZM482.842 27.7939H481.508C479.497 27.7939 478.054 26.562 478.054 24.7581H485.225C485.596 24.7581 485.837 25.022 485.837 25.374V32.5896C484.044 32.5896 482.842 31.1377 482.842 29.1138V27.7939Z" />
      </svg>
    );
  } catch {
    return null;
  }
}

/** Slack — the four-colour hashtag mark (official geometry). */
export function SlackLogo({ size = 24 }: BrandLogoProps): ReactNode {
  try {
    return (
      <svg width={size} height={size} viewBox="0 0 122.8 122.8" fill="none" aria-hidden="true">
        <path fill="#E01E5A" d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zM32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" />
        <path fill="#36C5F0" d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zM45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" />
        <path fill="#2EB67D" d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zM90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" />
        <path fill="#ECB22E" d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zM77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" />
      </svg>
    );
  } catch {
    return null;
  }
}
