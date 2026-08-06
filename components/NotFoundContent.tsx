// Shared 404 body — used by both app/not-found.tsx (wraps it in its own
// Nav for routes outside any layout that provides one) and app/(features)/
// not-found.tsx (no Nav, since (features)/layout.tsx already renders one
// and rendering a second instance produced overlapping fixed Navs).

import Link from "next/link";

import Footer from "@/components/home/Footer";

const POPULAR_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Book demo", href: "/book-demo" },
];

export function NotFoundContent() {
  return (
    <main className="relative bg-black text-white font-urbanist w-full overflow-x-hidden">
      <section className="relative w-full bg-black overflow-hidden pt-32 pb-24 lg:pt-[180px] lg:pb-[140px] min-h-[80vh] flex items-center">
        {/* Pixel-grid GIF — lifted from PageHero's `decorated` variant
            (components/library/PageHero.tsx:106). Hidden below md so it
            doesn't crowd the headline on phones. */}
        <div
          aria-hidden
          className="hidden md:block absolute pointer-events-none"
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: 534,
            backgroundImage: "url('/images/home/grid-animation.gif')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "1440px 740px",
            backgroundPosition: "top center",
          }}
        />
        <div
          aria-hidden
          className="hidden md:block absolute pointer-events-none"
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: 534,
            background:
              "radial-gradient(ellipse 100% 534px at 50% 0%, rgba(0,0,0,0.7) 0%, #000 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 900px 420px at 50% 70%, rgba(98,93,245,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="container-page relative flex flex-col items-center text-center gap-8 lg:gap-10">
          <span
            className="inline-flex items-center font-urbanist font-semibold text-white"
            style={{
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(98,93,245,0.4)",
              background: "rgba(98,93,245,0.12)",
              fontSize: 14,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            <span
              aria-hidden
              className="inline-block"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#ff7162",
              }}
            />
            404
          </span>

          <div className="flex flex-col items-center gap-5 w-full max-w-[760px]">
            <p
              aria-hidden
              className="hidden md:block font-urbanist font-bold select-none"
              style={{
                fontSize: "clamp(140px, 18vw, 240px)",
                lineHeight: 0.9,
                letterSpacing: "-0.06em",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                marginBottom: -24,
              }}
            >
              404
            </p>

            <h1
              className="font-urbanist font-bold text-white"
              style={{
                fontSize: "clamp(36px, 5vw, 72px)",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
              }}
            >
              Page not found
            </h1>

            <p
              className="font-urbanist font-medium max-w-[560px]"
              style={{
                fontSize: "clamp(16px, 1.5vw, 20px)",
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              The page you&rsquo;re looking for doesn&rsquo;t exist or may have
              moved. Try one of the destinations below.
            </p>
          </div>

          <div className="flex items-start gap-3 flex-wrap justify-center">
            <Link
              href="/docs"
              className="flex items-center justify-center gap-2 rounded-lg font-urbanist font-bold text-white"
              style={{
                minWidth: 150,
                padding: "12px 16px",
                border: "1px solid #FFFFFF",
                fontSize: 16,
                letterSpacing: "-0.03em",
                background: "transparent",
              }}
            >
              Read the docs
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-lg font-urbanist font-bold text-white"
              style={{
                minWidth: 150,
                padding: "12px 16px",
                background: "#625df5",
                fontSize: 16,
                letterSpacing: "-0.03em",
              }}
            >
              Back to home
            </Link>
          </div>

          <div className="flex flex-col items-center gap-3 mt-4">
            <p
              className="font-mono uppercase"
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.4)",
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
              }}
            >
              Popular destinations
            </p>
            <ul className="flex items-center flex-wrap justify-center gap-x-6 gap-y-2">
              {POPULAR_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-urbanist font-medium"
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.8)",
                      letterSpacing: "-0.02em",
                      textDecoration: "underline",
                      textDecorationColor: "rgba(255,255,255,0.25)",
                      textUnderlineOffset: 4,
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
