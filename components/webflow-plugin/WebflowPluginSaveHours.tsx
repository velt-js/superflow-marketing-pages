import Image from "next/image";

type Feature = {
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
  textPanel?: string;
};

const IMG = "/images/sections/webflow-plugin";

const FEATURES: Feature[] = [
  {
    title: "Accurate Comments",
    body: "Pin feedback to the exact pixel - never lose context again.",
    image: `${IMG}/accurate-comments.png`,
    imageAlt: "Dashed selection box with a pinned comment avatar",
  },
  {
    title: "Recording with transcriptions",
    body: "Record screen + voice. We transcribe so search-and-jump works.",
    image: `${IMG}/recording-transcriptions.png`,
    imageAlt: "Video comment with playback controls and transcription",
  },
  {
    title: "Guest Mode",
    body: "Clients leave feedback without creating an account.",
    textPanel: "No Sign-in",
  },
  {
    title: "@mentions & Assign Tasks",
    body: "Loop in teammates and turn comments into tracked tasks.",
    image: `${IMG}/mentions-assign.png`,
    imageAlt: "Comment thread with assignee chip and reply",
  },
  {
    title: "Private Comments",
    body: "Keep internal threads invisible to clients and guests.",
    image: `${IMG}/private-comments.png`,
    imageAlt: "Comment composer with a Private toggle",
  },
  {
    title: "Progress Tracking",
    body: "See what is open, in progress, and resolved at a glance.",
    image: `${IMG}/progress-tracking.png`,
    imageAlt: "Comment card showing status changes over time",
  },
];

export default function WebflowPluginSaveHours() {
  return (
    <section className="bg-white py-[80px] lg:py-[120px]">
      <div className="container-page flex flex-col items-center gap-[48px]">
        <div className="flex flex-col items-center gap-[12px] text-center">
          <h2
            className="font-semibold tracking-[-0.03em] text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(32px, 5vw, 52px)",
              lineHeight: 1.15,
            }}
          >
            <span
              style={{
                backgroundImage: "linear-gradient(101deg, #ff7162 0%, #ffa96b 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Save 100 hours a month
            </span>
            <br />
            consumed by scattered communication
          </h2>
        </div>

        <div className="grid w-full max-w-[1140px] grid-cols-1 gap-[20px] md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-[18px] overflow-hidden rounded-[24px] border border-[#ECECEC] bg-white p-[24px]"
            >
              <div className="relative h-[160px] w-full overflow-hidden rounded-[16px] bg-[#FAFAFB]">
                {f.image ? (
                  <Image
                    src={f.image}
                    alt={f.imageAlt ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      className="text-[#111]/55"
                      style={{
                        fontFamily: "var(--font-poppins)",
                        fontSize: 20,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {f.textPanel}
                    </span>
                  </div>
                )}
              </div>
              <h3
                className="text-[#111]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: 20,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}
              >
                {f.title}
              </h3>
              <p
                className="text-[#111]/65"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 15,
                  lineHeight: 1.55,
                }}
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
