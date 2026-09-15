"use client";

import Link from "next/link";
import { createContext, useContext, type ReactNode } from "react";
import {
  SOLUTIONS_BASE_PATH,
  SOLUTION_SUMMARIES,
  solutionPath,
} from "@/lib/solutions/seed";
import type { SolutionKind, SolutionSummary } from "@/lib/solutions/types";

// The solution pages the site chrome links to: the nav mega menu and the
// footers. The root layout resolves them once per request (CMS merged over
// the seed, hidden documents removed) and hands them down through this
// context, so a page added or hidden in Sanity shows up or disappears
// everywhere without a code change. Outside the provider, and before the
// layout has run, the seed summaries stand in.

/** Label of the link to the index, shared by the nav and both footers. */
export const ALL_SOLUTIONS_LABEL = "All solutions";

const SolutionSummariesContext = createContext<readonly SolutionSummary[]>(
  SOLUTION_SUMMARIES,
);

/** Props for {@link SolutionsChromeProvider}. */
export interface SolutionsChromeProviderProps {
  /** The resolved summaries. Omit or pass empty to keep the seed. */
  solutions?: readonly SolutionSummary[] | null;
  children: ReactNode;
}

/**
 * Provide the resolved solution summaries to the nav and footers.
 *
 * @param props - The summaries and the subtree.
 * @returns The provider.
 */
export function SolutionsChromeProvider({
  solutions,
  children,
}: SolutionsChromeProviderProps): ReactNode {
  const value = solutions && solutions.length > 0 ? solutions : SOLUTION_SUMMARIES;
  return (
    <SolutionSummariesContext.Provider value={value}>
      {children}
    </SolutionSummariesContext.Provider>
  );
}

/**
 * The solution summaries the chrome should link to, in display order.
 *
 * @returns The summaries from the nearest provider, else the seed.
 */
export function useSolutionSummaries(): readonly SolutionSummary[] {
  return useContext(SolutionSummariesContext);
}

/**
 * The summaries of one kind, in display order.
 *
 * @param kind - "agency" or "job".
 * @returns The matching summaries.
 */
export function useSolutionsOfKind(kind: SolutionKind): SolutionSummary[] {
  const summaries = useSolutionSummaries();
  try {
    return summaries.filter((summary) => summary?.kind === kind);
  } catch {
    return [];
  }
}

/** Props for {@link SolutionsFooterLinks}. */
export interface SolutionsFooterLinksProps {
  /** Class for each link, from the footer's own CSS module or utility classes. */
  linkClassName?: string;
  /** Inline style for each link (the legacy footer sets its colours inline). */
  linkStyle?: React.CSSProperties;
}

/**
 * The list items of a footer's Solutions column: every visible solution page
 * followed by the link to the index. Rendered inside the footer's own `<ul>`
 * so each footer keeps its heading and list styling.
 *
 * @param props - Link styling hooks.
 * @returns The list items.
 */
export function SolutionsFooterLinks({
  linkClassName,
  linkStyle,
}: SolutionsFooterLinksProps): ReactNode {
  const summaries = useSolutionSummaries();
  return (
    <>
      {summaries.map((solution) => (
        <li key={solution.slug}>
          <Link
            href={solutionPath(solution.slug)}
            className={linkClassName}
            style={linkStyle}
          >
            {solution.navLabel}
          </Link>
        </li>
      ))}
      <li>
        <Link href={SOLUTIONS_BASE_PATH} className={linkClassName} style={linkStyle}>
          {ALL_SOLUTIONS_LABEL}
        </Link>
      </li>
    </>
  );
}
