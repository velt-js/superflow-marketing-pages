"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useNavTheme } from "@/lib/use-nav-color";

interface DropdownItem {
  label: string;
  href: string;
}

interface NavLink {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
}

const navLinks: NavLink[] = [
  {
    label: "Product",
    href: "#product",
    dropdown: [
      { label: "Website Review", href: "/website-review" },
      { label: "Video Review", href: "/video-review" },
      { label: "Lottie Review", href: "/lottie-files-review" },
      { label: "PDF Review", href: "/pdf-review" },
      { label: "Image Review", href: "/image-review" },
    ],
  },
  { label: "Features", href: "/#features" },
  { label: "Integrations", href: "/integrations" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Try Demo", href: "/demo" },
];

export default function Nav() {
  const theme = useNavTheme();
  const isDark = theme === "dark";
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  function scheduleClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenIndex(null), 120);
  }
  function openMenu(i: number) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenIndex(i);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav
      ref={navRef}
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
          {navLinks.map((link, i) => {
            const isOpen = openIndex === i;
            const linkColor = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)";
            const linkClasses =
              "flex items-center gap-1 text-[12px] uppercase tracking-[1.8px] font-normal transition-opacity";

            if (link.dropdown) {
              return (
                <li
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => openMenu(i)}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    className={`${linkClasses} hover:opacity-100`}
                    style={{ color: linkColor }}
                  >
                    {link.label}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                      style={{ transition: "transform 200ms", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div
                    role="menu"
                    className="absolute left-0 top-full pt-4"
                    style={{
                      pointerEvents: isOpen ? "auto" : "none",
                    }}
                  >
                    <div
                      className="min-w-[180px] rounded-[14px] overflow-hidden transition-all duration-200 origin-top-left"
                      style={{
                        background: "#000",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        opacity: isOpen ? 1 : 0,
                        visibility: isOpen ? "visible" : "hidden",
                        transform: isOpen ? "scale(1) translateY(0)" : "scale(0.97) translateY(-6px)",
                      }}
                    >
                      <ul className="py-2">
                        {link.dropdown.map((item) => (
                          <li key={item.label}>
                            <Link
                              role="menuitem"
                              href={item.href}
                              onClick={() => setOpenIndex(null)}
                              className="block px-4 py-2 text-[13px] font-normal text-white/85 transition-colors hover:text-white hover:bg-white/[0.04]"
                              style={{ fontFamily: "var(--font-poppins)" }}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`${linkClasses} hover:opacity-100`}
                  style={{ color: linkColor }}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/book-demo"
            className="rounded-pill px-4 py-2 text-[14px] font-medium border transition-colors"
            style={{
              color: isDark ? "#fff" : "#0a0a0a",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
            }}
          >
            Book Demo
          </Link>
          <a
            href="https://app.usesuperflow.com/signup?returnUrl=%2Fhome%3F_gl%3D1*16r2jus*_gcl_au*MzgzMzk1NDk4LjE3NzkxMjUzNjU."
            className="rounded-pill px-4 py-2 text-[14px] font-medium transition-colors"
            style={{
              background: isDark ? "#fff" : "#0a0a0a",
              color: isDark ? "#0a0a0a" : "#fff",
            }}
          >
            Try Now for Free
          </a>
        </div>
      </div>
    </nav>
  );
}
