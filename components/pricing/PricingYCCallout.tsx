// YC callout banner for /pricing — sits between the tier cards and the
// comparison table. Mirrors velt.dev/pricing's framer-17nugrw element:
// a 2px orange→red gradient frame around a black card with a small Y
// Combinator logo, two-tone heading, and a "Reach Out" outlined CTA
// aligned to the right.

import Link from "next/link";
import Image from "next/image";

const GRADIENT =
  "linear-gradient(101deg, #f16722 0%, #ff3c00 100%)";

export function PricingYCCallout() {
  return (
    <section
      className="flex justify-center bg-black full-bleed-bg px-6 lg:px-8 pb-[72px]"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1280,
          background: GRADIENT,
          borderRadius: 18,
          padding: 2,
        }}
      >
        <div
          className="flex flex-col lg:flex-row lg:items-center"
          style={{
            background: "#000",
            border: "1px solid #222",
            borderRadius: 16,
            padding: 24,
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div className="flex items-center" style={{ gap: 16 }}>
            <Image
              src="/images/KCKsYtZQajVlOxbwY95uLiMH7k.png"
              alt="Y Combinator"
              width={28}
              height={28}
              style={{ flexShrink: 0 }}
            />
            <p
              className="font-urbanist"
              style={{
                color: "#fff",
                fontSize: "clamp(16px, 1.5vw, 24px)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              <span style={{ fontWeight: 600 }}>Are you a YC Company? </span>
              Check Bookface or reach out for the YC deal.
            </p>
          </div>

          <Link
            href="/book-demo"
            className="flex items-center justify-center font-urbanist self-start lg:self-auto"
            style={{
              flexShrink: 0,
              padding: "8px 16px",
              border: "1.5px solid #262291",
              borderRadius: 6,
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              textDecoration: "none",
            }}
          >
            Reach Out
          </Link>
        </div>
      </div>
    </section>
  );
}
