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
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M4.68067 19.5265C4.3229 19.3225 4.02532 19.0277 3.818 18.6719C3.61069 18.3161 3.50099 17.9118 3.5 17.5V5.83333C3.5 4.55 4.55 3.5 5.83333 3.5H17.5C18.375 3.5 18.851 3.94917 19.25 4.66667M8.16667 11.2782C8.16667 10.4529 8.49448 9.66152 9.078 9.078C9.66152 8.49448 10.4529 8.16667 11.2782 8.16667H21.3885C21.7971 8.16667 22.2017 8.24715 22.5792 8.40352C22.9567 8.55988 23.2997 8.78907 23.5887 9.078C23.8776 9.36693 24.1068 9.70994 24.2632 10.0874C24.4195 10.465 24.5 10.8696 24.5 11.2782V21.3885C24.5 21.7971 24.4195 22.2017 24.2632 22.5792C24.1068 22.9567 23.8776 23.2997 23.5887 23.5887C23.2997 23.8776 22.9567 24.1068 22.5792 24.2632C22.2017 24.4195 21.7971 24.5 21.3885 24.5H11.2782C10.8696 24.5 10.465 24.4195 10.0874 24.2632C9.70994 24.1068 9.36693 23.8776 9.078 23.5887C8.78907 23.2997 8.55988 22.9567 8.40352 22.5792C8.24715 22.2017 8.16667 21.7971 8.16667 21.3885V11.2782Z"
          stroke="#EDB103"
          strokeWidth="2.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "world-upload") {
    return (
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M24.5 14C24.5 11.9233 23.8842 9.89323 22.7304 8.16652C21.5767 6.4398 19.9368 5.09399 18.0182 4.29927C16.0996 3.50455 13.9884 3.29661 11.9516 3.70176C9.91476 4.1069 8.04383 5.10693 6.57538 6.57538C5.10693 8.04383 4.1069 9.91476 3.70176 11.9516C3.29661 13.9884 3.50455 16.0996 4.29927 18.0182C5.09399 19.9368 6.4398 21.5767 8.16652 22.7304C9.89323 23.8842 11.9233 24.5 14 24.5M4.19954 10.5H23.7995M4.19954 17.5H13.9995M13.5074 3.5C11.542 6.64955 10.5 10.2875 10.5 14C10.5 17.7125 11.542 21.3505 13.5074 24.5M14.5833 3.5C16.5888 6.71417 17.5 10.3553 17.5 14M21 24.5V16.3333M17.5 19.8333L21 16.3333L24.5 19.8333"
          stroke="#3772FE"
          strokeWidth="2.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M2.91699 13.417C2.91699 7.618 7.618 2.91699 13.417 2.91699V2.91699C19.216 2.91699 23.917 7.618 23.917 13.417V13.417C23.917 19.216 19.216 23.917 13.417 23.917H2.91699V13.417Z"
        stroke="#625DF5"
        strokeWidth="2.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
          1547×80 strip for a seamless wrap. Edge-only mask is set inline so the
          shared `.marquee-viewport` defaults stay untouched for other usages. */}
      {logosSrc ? (
        <div
          className="w-full overflow-hidden mt-[48px] lg:mt-[64px]"
          style={{
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 6%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 6%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%)",
          }}
        >
          <div
            className="marquee-track items-center"
            style={{ ["--marquee-duration" as string]: "12s", gap: 40 }}
          >
            {[0, 1].map((i) => (
              <div key={i} className="shrink-0">
                <Image src={logosSrc} alt="" width={1547} height={80} className="h-[40px] lg:h-[52px] w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
