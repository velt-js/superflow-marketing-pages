import type { ReactNode } from "react";

/**
 * One line icon and one tint per agent, keyed by the agent names in
 * content.ts. Shared by the "13 agents" card and the agents section so an agent
 * looks the same everywhere on the page.
 */

type AgentLook = { color: string; tint: string; paths: ReactNode };

const LOOKS: Readonly<Record<string, AgentLook>> = {
  "Link Checker": {
    color: "#e5484d",
    tint: "#fdecec",
    paths: (
      <>
        <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
        <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
      </>
    ),
  },
  "Image Inspector": {
    color: "#0e9f6e",
    tint: "#e3f7ef",
    paths: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M21 16l-5-5-9 9" />
      </>
    ),
  },
  "Mobile Inspector": {
    color: "#2563eb",
    tint: "#e7effe",
    paths: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
  },
  Accessibility: {
    color: "#7c3aed",
    tint: "#f0e9fe",
    paths: (
      <>
        <circle cx="12" cy="4.5" r="1.6" />
        <path d="M5 8.5l7 1.5 7-1.5" />
        <path d="M12 10v4l-3 6.5" />
        <path d="M12 14l3 6.5" />
      </>
    ),
  },
  "AI Visibility": {
    color: "#d97706",
    tint: "#fdf3e1",
    paths: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />,
  },
  Proofreader: {
    color: "#3555dd",
    tint: "#e8ecfc",
    paths: (
      <>
        <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3" />
        <path d="M13.5 7.5l3 3" />
      </>
    ),
  },
  "Consistency Checker": {
    color: "#db2777",
    tint: "#fce8f2",
    paths: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  Performance: {
    color: "#ea580c",
    tint: "#feede3",
    paths: (
      <>
        <path d="M3.5 17a9 9 0 1 1 17 0" />
        <path d="M12 14l4-4" />
      </>
    ),
  },
  Compliance: {
    color: "#0d9488",
    tint: "#e2f5f3",
    paths: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 3.5h6" />
        <path d="M9 13l2 2 4-4" />
      </>
    ),
  },
  "Data Privacy": {
    color: "#4f46e5",
    tint: "#ebeafd",
    paths: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
      </>
    ),
  },
  Security: {
    color: "#475569",
    tint: "#eef1f5",
    paths: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  },
  "Figma Match": {
    color: "#a21caf",
    tint: "#f8e8fb",
    paths: <path d="M8 3v18M16 3v18M3 8h18M3 16h18" />,
  },
  Copyright: {
    color: "#65a30d",
    tint: "#eef7e0",
    paths: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M14.5 9.5a3.5 3.5 0 1 0 0 5" />
      </>
    ),
  },
};

const FALLBACK: AgentLook = { color: "#475569", tint: "#eef1f5", paths: <circle cx="12" cy="12" r="8" /> };

/** The tint pair for an agent, for callers that color their own container. */
export function agentColors(name: string): { color: string; tint: string } {
  const look = LOOKS[name] ?? FALLBACK;
  return { color: look.color, tint: look.tint };
}

/** The agent's line icon, drawn in its own color. */
export function AgentIcon({ name, size = 20 }: { name: string; size?: number }) {
  const look = LOOKS[name] ?? FALLBACK;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={look.color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {look.paths}
    </svg>
  );
}
