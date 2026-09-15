// Cost lines for the solutions "What it costs" section (spec S7).
//
// Every number comes from the pricing source of truth,
// components/pricing-2026/ai-credits-data.ts, and is filled into the line
// templates at render time. Nothing here types a price. `fillCostTokens` is
// a pure string helper with no imports of its own, so a test can check the
// interpolation without the pricing module.

import {
  CREDIT_PACKS,
  SCAN_RATE_CARD,
  SIGNUP_BONUS_CREDITS,
} from "@/components/pricing-2026/ai-credits-data";

/** A token value. Rendered with `String()`. */
export type CostTokenValue = string | number;

/** Token name to value, e.g. `{ smallScanCredits: 5 }`. */
export type CostTokens = Readonly<Record<string, CostTokenValue>>;

/**
 * The default three lines. Tokens in braces are filled by
 * {@link buildCostLines}. A page's `cost` field can override the templates
 * and use the same tokens.
 */
export const DEFAULT_COST_LINES: readonly string[] = [
  "A full scan of a small site (up to {smallScanPages} pages) is {smallScanCredits} credits. A rescan after fixes is {rescanCredits} credit, any size.",
  "Credits start at ${packPrice} for {packCredits}. Seats are free to add.",
  "Your first full site scan is on us.",
];

/** Matches `{tokenName}` placeholders. */
const TOKEN_PATTERN = /\{([A-Za-z0-9_]+)\}/g;

/**
 * Fill `{token}` placeholders in a template from a token map. A token with no
 * value is left as written, so a typo shows up in review instead of going
 * blank. Pure: no imports, no side effects.
 *
 * @param template - A line with `{token}` placeholders.
 * @param tokens - Token name to value.
 * @returns The line with every known token filled.
 */
export function fillCostTokens(template: string, tokens: CostTokens): string {
  try {
    return template.replace(TOKEN_PATTERN, (match, key: string) => {
      const value = tokens?.[key];
      return value === undefined || value === null ? match : String(value);
    });
  } catch {
    return template;
  }
}

/**
 * Read the page count out of a rate-card scope label such as "Up to 30 pages".
 * Fallback for a scope that carries no `maxPages`; the number is parsed from
 * the label rather than typed here.
 *
 * @param sublabel - The scope's sublabel.
 * @returns The first number in the label, or undefined when there is none.
 */
function pagesFromScope(sublabel?: string): string | undefined {
  try {
    const match = /\d+/.exec(sublabel ?? "");
    return match ? match[0] : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Build the token map from the pricing constants. Only tokens with a real
 * value are set, so a missing constant leaves its placeholder visible.
 *
 * @returns The tokens the cost lines can use.
 */
export function getCostTokens(): CostTokens {
  try {
    const small = SCAN_RATE_CARD.find((scope) => scope.id === "small");
    const rescan = SCAN_RATE_CARD.find((scope) => scope.id === "rescan");
    const pack = CREDIT_PACKS[0];
    const tokens: Record<string, CostTokenValue> = {};
    const smallScanPages =
      small?.maxPages !== undefined
        ? String(small.maxPages)
        : pagesFromScope(small?.sublabel);
    if (smallScanPages !== undefined) {
      tokens.smallScanPages = smallScanPages;
    }
    if (small?.credits !== undefined) {
      tokens.smallScanCredits = small.credits;
    }
    if (rescan?.credits !== undefined) {
      tokens.rescanCredits = rescan.credits;
    }
    if (pack?.priceUsd !== undefined) {
      tokens.packPrice = pack.priceUsd;
    }
    if (pack?.credits !== undefined) {
      tokens.packCredits = pack.credits;
    }
    tokens.signupBonusCredits = SIGNUP_BONUS_CREDITS;
    return tokens;
  } catch {
    return {};
  }
}

/**
 * The cost lines for a page: the page's own templates when it sets `cost`,
 * else the defaults, with every token filled from the pricing data.
 *
 * @param overrides - Optional per-page templates (the `cost` field).
 * @returns The lines to render, in order.
 */
export function buildCostLines(overrides?: readonly string[] | null): string[] {
  try {
    const templates =
      overrides && overrides.length > 0 ? overrides : DEFAULT_COST_LINES;
    const tokens = getCostTokens();
    return templates
      .filter(
        (line): line is string =>
          typeof line === "string" && line.trim().length > 0,
      )
      .map((line) => fillCostTokens(line, tokens));
  } catch {
    return [];
  }
}
