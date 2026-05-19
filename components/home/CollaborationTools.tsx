import Image from "next/image";

const IMG = "/images/sections/collaboration";
const SIGNUP_URL =
  "https://app.usesuperflow.com/signup?returnUrl=%2Fhome%3F_gl%3D1*16r2jus*_gcl_au*MzgzMzk1NDk4LjE3NzkxMjUzNjU.";

type Card = {
  icon: string;
  title: string;
  body: React.ReactNode;
  preview: string;
};

const CARDS: Card[] = [
  {
    icon: `${IMG}/icon-comments.png`,
    title: "Comments in context",
    body: <>Pin comments directly to frames &amp; elements for clearer feedback</>,
    preview: `${IMG}/comments-in-context.png`,
  },
  {
    icon: `${IMG}/icon-record.png`,
    title: "Record richer feedback",
    body: <>Direct comment with Loom-style recordings without leaving the app</>,
    preview: `${IMG}/record-richer-feedback.png`,
  },
  {
    icon: `${IMG}/icon-incognito.png`,
    title: "Private & Guest Mode",
    body: <>Keep wires from crossing: Clients use guest mode while your team goes private</>,
    preview: `${IMG}/private-guest-mode.png`,
  },
  {
    icon: `${IMG}/icon-devices.png`,
    title: "Review from wherever",
    body: <>Works across all devices for seamless reviews on your time</>,
    preview: `${IMG}/review-from-wherever.png`,
  },
  {
    icon: `${IMG}/icon-tasks.png`,
    title: "Who’s doing what?",
    body: <>Free built-in task management with Slack and email notifications</>,
    preview: `${IMG}/whos-doing-what.png`,
  },
  {
    icon: `${IMG}/icon-versions.png`,
    title: "Versioning",
    body: (
      <>
        Go from <strong>final</strong> to <strong>final final</strong> without losing a single comment
      </>
    ),
    preview: `${IMG}/versioning.png`,
  },
];

function FeatureCard({ card }: { card: Card }) {
  return (
    <div
      className="feature-card group relative flex flex-col w-full max-w-[490px] h-[560px] overflow-hidden rounded-[32px] transition-transform duration-300 ease-out hover:scale-[1.05]"
      style={{ background: "#f8f8fa", border: "2px solid #f5f5f7" }}
    >
      <div className="flex flex-col items-start gap-[15px] p-[32px] lg:p-[52px]">
        <div className="w-[40px] h-[40px] relative grayscale group-hover:grayscale-0 transition-[filter] duration-300 ease-out">
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

      {/* Preview image anchored at the bottom, with a top fade into the card bg */}
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

export default function CollaborationTools() {
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
          <span style={{ color: "#23222b" }}>Collaboration tools</span>
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
            for faster teamwork
          </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] w-full place-items-center">
          {CARDS.map((card) => (
            <FeatureCard key={card.title} card={card} />
          ))}
        </div>

        <a
          href={SIGNUP_URL}
          className="rounded-[32px] bg-black px-[32px] py-[16px] text-white"
          style={{ fontFamily: "var(--font-poppins)", fontSize: 16, fontWeight: 500, lineHeight: "1.5em" }}
        >
          Try Now For Free
        </a>
      </div>
    </section>
  );
}
