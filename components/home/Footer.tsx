import Image from "next/image";
import Link from "next/link";
import {
  SOLUTIONS_BASE_PATH,
  SOLUTION_SUMMARIES,
  solutionPath,
} from "@/lib/solutions/seed";

type LinkItem = { label: string; href: string; dollar?: boolean };
type Column = { title: string; links: LinkItem[] };

const SIGNUP_URL = "https://app.usesuperflow.com/signup";

const tryColumn: Column = {
  title: "Try Superflow",
  links: [
    { label: "For Website", href: SIGNUP_URL },
    { label: "For PDF", href: SIGNUP_URL },
    { label: "For Image", href: SIGNUP_URL },
    { label: "For Video", href: SIGNUP_URL },
    { label: "For Lottie", href: SIGNUP_URL },
  ],
};

const COLUMNS: Column[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Integrations", href: "/integrations" },
      { label: "Pricing", href: "/pricing" },
      { label: "Affiliate", href: "/affiliate", dollar: true },
    ],
  },
  {
    title: "Integrations",
    links: [
      { label: "Asana", href: "/integrations/asana" },
      { label: "Slack", href: "/integrations/slack" },
      { label: "ClickUp", href: "/integrations/clickup" },
      { label: "Webflow", href: "/integrations/webflow" },
      { label: "Monday.com", href: "/integrations/monday" },
      { label: "Google Tag Manager", href: "/integrations/google-tag-manager" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Case Study", href: "/case-study/writesonic" },
      { label: "SEO Checklist", href: "/seo-checklist-2023" },
      { label: "Blog", href: "/blog" },
      { label: "ROI Calculator", href: "/calculator", dollar: true },
      { label: "YouTube", href: "https://www.youtube.com/@usesuperflow" },
      { label: "Join Community", href: "https://superflowusers.slack.com/ssb/redirect" },
    ],
  },
  {
    title: "Competition",
    links: [
      { label: "Markup Alternative", href: "/alternative/markup-alternative" },
      { label: "Pastel Alternative", href: "/alternative/pastel-alternative" },
      { label: "Bugherd Alternative", href: "/alternative/bugherd-alternative" },
      { label: "Ruttl Alternative", href: "/alternative/ruttl-alternative" },
      { label: "Vercel Comments", href: "/alternative/vercel-comments-alternative" },
      { label: "Webflow Comments", href: "/alternative/webflow-comments-alternative" },
      { label: "Marker.io Comments", href: "/alternative/marker-io-alternative" },
      { label: "Use Bubbles", href: "/alternative/use-bubbles-alternative" },
    ],
  },
  {
    title: "Comparison",
    links: [
      { label: "MarkUp vs Pastel", href: "/comparisons/markup-vs-pastel" },
      { label: "MarkUp vs Ruttl", href: "/comparisons/markup-vs-ruttl" },
      { label: "Pastel vs BugHerd", href: "/comparisons/pastel-vs-bugherd" },
    ],
  },
  {
    // The old Use Case and User Persona pages are retired; their URLs 301 to
    // the solutions pages (see next.config.ts), so this column mirrors the
    // Solutions column in components/home-2026/SiteFooter.tsx.
    title: "Solutions",
    links: [
      ...SOLUTION_SUMMARIES.map((solution) => ({
        label: solution.navLabel,
        href: solutionPath(solution.slug),
      })),
      { label: "All solutions", href: SOLUTIONS_BASE_PATH },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const SOCIAL_LINKS: Record<string, string> = {
  slack: "https://usesuperflow.ai",
  linkedin: "https://www.linkedin.com/company/usesuperflow",
  x: "https://x.com/usesuperflow",
  instagram: "https://www.instagram.com/usesuperflow",
  youtube: "https://www.youtube.com/@usesuperflow",
};

function DollarBadge() {
  return (
    <span
      className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full ml-2 text-[12px] text-white"
      style={{ background: "rgba(255,255,255,0.06)" }}
    >
      $
    </span>
  );
}

function ColumnBlock({ col }: { col: Column }) {
  return (
    <div className="flex flex-col gap-[24px]">
      <h4
        className="text-white text-[16px] leading-[20px] font-semibold"
        style={{ fontFamily: "var(--font-urbanist)" }}
      >
        {col.title}
      </h4>
      <ul className="flex flex-col gap-[16px]">
        {col.links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="flex items-center text-[16px] leading-[20px] hover:text-white transition-colors"
              style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-urbanist)" }}
            >
              {l.label}
              {l.dollar && <DollarBadge />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ name }: { name: string }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" } as const;
  switch (name) {
    case "slack":
      return (
        <svg {...common}>
          <path d="M5.5 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5zM8.5 5a2 2 0 1 1 2-2v2h-2zm0 1a2 2 0 1 1 0 4h-5a2 2 0 1 1 0-4h5zM18.5 9a2 2 0 1 1 2 2h-2V9zm-1 0a2 2 0 1 1-4 0V4a2 2 0 1 1 4 0v5zM15.5 19a2 2 0 1 1-2 2v-2h2zm0-1a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4h-5z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.52.01-4.76.07-1.07.05-1.65.23-2.04.37-.51.2-.88.44-1.27.83-.39.39-.63.76-.83 1.27-.14.39-.32.97-.37 2.04-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.07.23 1.65.37 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.14.97.32 2.04.37 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.07-.05 1.65-.23 2.04-.37.51-.2.88-.44 1.27-.83.39-.39.63-.76.83-1.27.14-.39.32-.97.37-2.04.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.07-.23-1.65-.37-2.04-.2-.51-.44-.88-.83-1.27a3.42 3.42 0 00-1.27-.83c-.39-.14-.97-.32-2.04-.37-1.24-.06-1.61-.07-4.76-.07zm0 3.07a4.97 4.97 0 110 9.94 4.97 4.97 0 010-9.94zm0 8.2a3.23 3.23 0 100-6.46 3.23 3.23 0 000 6.46zm6.34-8.41a1.16 1.16 0 11-2.32 0 1.16 1.16 0 012.32 0z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M23.5 6.5a3 3 0 00-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 00.5 6.5C.1 8.4.1 12 .1 12s0 3.6.4 5.5a3 3 0 002.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 002.1-2.1c.4-1.9.4-5.5.4-5.5s0-3.6-.4-5.5zM9.6 15.5V8.5l6.3 3.5-6.3 3.5z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Footer({ roundedTop = false }: { roundedTop?: boolean }) {
  return (
    <footer
      className={`text-white ${roundedTop ? "rounded-t-[32px] lg:rounded-t-[80px]" : ""}`}
      style={{ background: "#0a0a0a" }}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-[80px] pt-[80px] lg:pt-[120px] pb-[80px]">
        <div className="flex flex-col lg:flex-row gap-[60px] lg:gap-[40px]">
          {/* Left: Try Superflow column */}
          <div className="flex flex-col gap-[24px] shrink-0 lg:w-[158px]">
            <div className="flex items-center gap-[10px]">
              <Image src="/images/nav/logo.svg" alt="Superflow" width={20} height={20} />
              <span
                className="text-white text-[16px] leading-[20px] font-semibold"
                style={{ fontFamily: "var(--font-urbanist)" }}
              >
                Try Superflow
              </span>
            </div>
            <ul className="flex flex-col gap-[16px]">
              {tryColumn.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[16px] leading-[20px] hover:text-white transition-colors"
                    style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-urbanist)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: 4×2 grid of link columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[40px] gap-y-[48px]">
            {COLUMNS.map((col) => (
              <ColumnBlock key={col.title} col={col} />
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-[80px] pt-[24px] flex flex-col-reverse lg:flex-row items-start lg:items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-[26px]">
            {Object.entries(SOCIAL_LINKS).map(([name, href]) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="text-white/60 hover:text-white transition-colors"
              >
                <SocialIcon name={name} />
              </a>
            ))}
          </div>
          <p
            className="text-[12px] leading-[16px]"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-urbanist)" }}
          >
            All rights reserved © 2025 Superflow by Velt™
          </p>
        </div>
      </div>
    </footer>
  );
}
