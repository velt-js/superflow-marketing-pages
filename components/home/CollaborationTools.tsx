import Image from "next/image";

import { toInternalHref } from "@/lib/links";

const IMG = "/images/sections/collaboration";
const SIGNUP_URL =
  "https://app.usesuperflow.com/signup?returnUrl=%2Fhome%3F_gl%3D1*16r2jus*_gcl_au*MzgzMzk1NDk4LjE3NzkxMjUzNjU.";

type Card = {
  icon: string;
  title: string;
  body: React.ReactNode;
  preview: string;
};

export type CollaborationToolsCardOverride = {
  title: string;
  body: string;
  iconSrc: string;
  previewSrc: string;
};

export type CollaborationToolsProps = {
  /** Heading line 1 — rendered in default text color. */
  headingLine1?: string;
  /** Heading line 2 — rendered with the rainbow gradient. */
  headingLine2?: string;
  /** Per-feature card content; defaults to Superflow homepage values. */
  cards?: CollaborationToolsCardOverride[];
  ctaLabel?: string;
  ctaHref?: string;
};

const DEFAULT_CARDS: Card[] = [
  {
    icon: `${IMG}/icon-comments.png`,
    title: "Comments in context",
    body: <>Pin comments directly to frames &amp; elements for clearer feedback</>,
    preview: "/images/sections/home-collab/comments-in-context.svg",
  },
  {
    icon: `${IMG}/icon-record.png`,
    title: "Record richer feedback",
    body: <>Direct comment with Loom-style recordings without leaving the app</>,
    preview: "/images/sections/home-collab/recorder.svg",
  },
  {
    icon: `${IMG}/icon-incognito.png`,
    title: "Private & Guest Mode",
    body: <>Keep wires from crossing: Clients use guest mode while your team goes private</>,
    preview: "/images/sections/home-collab/private-and-guest-mode.svg",
  },
  {
    icon: `${IMG}/icon-devices.png`,
    title: "Review from wherever",
    body: <>Works across all devices for seamless reviews on your time</>,
    preview: "/images/sections/home-collab/mobile-review.svg",
  },
  {
    icon: `${IMG}/icon-tasks.png`,
    title: "Who’s doing what?",
    body: <>Free built-in task management with Slack and email notifications</>,
    preview: "/images/sections/home-collab/task-management.svg",
  },
  {
    icon: `${IMG}/icon-versions.png`,
    title: "Versioning",
    body: (
      <>
        Go from <strong>final</strong> to <strong>final final</strong> without losing a single comment
      </>
    ),
    preview: "/images/sections/home-collab/Versioning.svg",
  },
];

function FeatureCard({ card }: { card: Card }) {
  return (
    <div
      className="feature-card group relative flex flex-col w-full h-full max-w-[490px] overflow-hidden rounded-[32px]"
      style={{ background: "#f8f8fa", border: "2px solid #f5f5f7" }}
    >
      <div className="flex flex-col items-start gap-[15px] p-[32px] lg:p-[52px]">
        <div className="w-[40px] h-[40px] relative">
          <Image src={card.icon} alt="" width={40} height={40} className="object-contain" />
        </div>
        <h3
          className="font-semibold text-[24px] leading-[28.8px]"
          style={{ fontFamily: "var(--font-poppins)", color: "#23222b" }}
        >
          {card.title}
        </h3>
        <p
          className="text-[18px] leading-[27px] max-w-[320px]"
          style={{ fontFamily: "var(--font-poppins)", color: "#23222b", opacity: 0.5 }}
        >
          {card.body}
        </p>
      </div>

      <div className="relative w-full mt-auto">
        <div className="relative w-full grayscale group-hover:grayscale-0 transition-[filter] duration-300 ease-out" style={{ aspectRatio: "490 / 260" }}>
          <Image src={card.preview} alt="" fill sizes="490px" className="object-cover object-top" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, #f8f8fa 0%, rgba(248,248,250,0) 30%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CollaborationTools({
  headingLine1 = "Collaboration tools",
  headingLine2 = "for faster teamwork",
  cards,
  ctaLabel = "Try Now For Free",
  ctaHref = SIGNUP_URL,
}: CollaborationToolsProps = {}) {
  const resolved: Card[] = cards && cards.length === 6
    ? cards.map((c) => ({
        icon: c.iconSrc,
        title: c.title,
        body: c.body,
        preview: c.previewSrc,
      }))
    : DEFAULT_CARDS;

  return (
    <section id="features" className="bg-white px-6 lg:px-12 py-[80px]">
      <div className="mx-auto max-w-[1000px] flex flex-col items-center gap-[48px]">
        <h2
          className="text-center font-semibold tracking-[-0.03em]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: "clamp(36px, 7vw, 60px)",
            lineHeight: 1.2,
          }}
        >
          <span style={{ color: "#23222b" }}>{headingLine1}</span>
          <br />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] w-full items-stretch justify-items-center">
          {resolved.map((card, i) => (
            <FeatureCard key={`${card.title}-${i}`} card={card} />
          ))}
        </div>

        <a
          href={toInternalHref(ctaHref) ?? ctaHref}
          className="rounded-[32px] bg-black px-[32px] py-[16px] text-white"
          style={{ fontFamily: "var(--font-poppins)", fontSize: 16, fontWeight: 500, lineHeight: "1.5em" }}
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
