// Shared props used across library page sections.

import type { ReactNode } from "react";

export type CtaLink = {
  label?: string;
  href?: string;
  newTab?: boolean;
  /** Optional leading icon rendered to the left of the label
   *  (e.g. a play glyph on /customization's "Sneak Peek" CTA). */
  leadingIcon?: ReactNode;
};
