"use client";

import Image from "next/image";
import Link from "next/link";
import { useNavTheme } from "@/lib/use-nav-color";

const navLinks = [
  { label: "Product", href: "#product", caret: true },
  { label: "Features", href: "#features" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Try Demo", href: "#demo" },
];

export default function Nav() {
  const theme = useNavTheme();
  const isDark = theme === "dark";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-200"
      style={{
        background: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="container-page flex h-[68px] items-center justify-between gap-10">
        <Link href="/" className="flex items-center gap-4 shrink-0">
          <Image
            src="/images/nav/logo.svg"
            alt="Superflow"
            width={20}
            height={20}
            priority
          />
          <span className="flex flex-col leading-none">
            <span
              className="font-medium text-[14px] leading-[16.8px]"
              style={{ color: isDark ? "#fff" : "#0a0a0a" }}
            >
              Superflow
            </span>
            <span
              className="font-normal text-[12px] leading-[14.4px] mt-[3px]"
              style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}
            >
              by Velt&nbsp;™
            </span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-10">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="flex items-center gap-1 text-[12px] uppercase tracking-[1.8px] font-normal transition-opacity hover:opacity-100"
                style={{
                  color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)",
                }}
              >
                {l.label}
                {l.caret && (
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="#demo"
            className="rounded-pill px-4 py-2 text-[14px] font-medium border transition-colors"
            style={{
              color: isDark ? "#fff" : "#0a0a0a",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
            }}
          >
            Book Demo
          </Link>
          <Link
            href="#signup"
            className="rounded-pill px-4 py-2 text-[14px] font-medium transition-colors"
            style={{
              background: isDark ? "#fff" : "#0a0a0a",
              color: isDark ? "#0a0a0a" : "#fff",
            }}
          >
            Try Now for Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
