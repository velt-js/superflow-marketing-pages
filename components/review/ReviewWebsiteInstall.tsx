// ReviewWebsiteInstall — "Install Anywhere. In Seconds." section with a
// marquee of platform logos at the bottom. Animation speed matches the
// hero asset-pill marquee (12s) via the shared `.marquee-track` keyframe.
// Visual reference: Figma 25:10659.

import Image from "next/image";

export type ReviewWebsiteInstallProps = {
  headingLine1: string;
  headingLine2: string;
  subheading?: string;
  logosSrc?: string | null;
};

const BUTTONS = [
  { label: "Add Snippet", icon: "copy" },
  { label: "Publish", icon: "world-upload" },
  { label: "Comment", icon: "message" },
];

function ButtonIcon({ name }: { name: string }) {
  if (name === "copy") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </svg>
    );
  }
  if (name === "world-upload") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8" />
        <path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
    </svg>
  );
}

export default function ReviewWebsiteInstall({
  headingLine1,
  headingLine2,
  subheading,
  logosSrc,
}: ReviewWebsiteInstallProps) {
  return (
    <section className="bg-white px-6 lg:px-12 py-[80px] lg:py-[120px]">
      <div className="mx-auto max-w-[1200px] flex flex-col items-center gap-[32px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2
            className="font-bold text-center"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            <span style={{ color: "#111" }}>{headingLine1}</span>{" "}
            <span
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgb(45,154,255) 0%, rgb(132,128,255) 36%, rgb(255,107,196) 70%, rgb(255,173,97) 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {headingLine2}
            </span>
          </h2>
          {subheading ? (
            <p style={{ fontFamily: "var(--font-poppins)", color: "rgba(17,17,17,0.6)", fontSize: 18, lineHeight: 1.5 }}>
              {subheading}
            </p>
          ) : null}
        </div>

        {/* CTA-style buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {BUTTONS.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-5 py-3"
              style={{ fontFamily: "var(--font-poppins)", fontSize: 18, fontWeight: 600, color: "#111" }}
            >
              <ButtonIcon name={b.icon} />
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* Logo marquee — 12s loop matches hero. Track holds 2 copies of the
          1547×80 strip for a seamless wrap. */}
      {logosSrc ? (
        <div className="marquee-viewport w-full overflow-hidden mt-[48px] lg:mt-[64px]">
          <div
            className="marquee-track items-center"
            style={{ ["--marquee-duration" as string]: "12s", gap: 40 }}
          >
            {[0, 1].map((i) => (
              <div key={i} className="shrink-0">
                <Image src={logosSrc} alt="" width={1547} height={80} className="h-[60px] lg:h-[80px] w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
