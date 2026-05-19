import Image from "next/image";

interface CardProps {
  tag: { icon: React.ReactNode; label: string };
  titleTop: string;
  titleBottom: string;
  subtitle: string;
  background: string;
  leftCursor: { label: string; color: string };
  rightCursor: { label: string; color: string };
  body: React.ReactNode;
}

function TagChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="absolute left-[52px] top-[52px] flex items-center gap-2 rounded-full bg-white/60 px-3 py-2 backdrop-blur">
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="text-[12px] font-semibold uppercase tracking-[1.2px] text-black/70">
        {label}
      </span>
    </div>
  );
}

function CursorBadge({ label, color, side }: { label: string; color: string; side: "left" | "right" }) {
  return (
    <div className={`absolute ${side === "left" ? "left-[200px]" : "right-[200px]"} top-[340px] hidden lg:block`}>
      <div className="relative h-[78px] w-[159px]">
        <div
          className="absolute top-0 h-[30px] w-[28px]"
          style={{ [side === "left" ? "left" : "right"]: 0 } as React.CSSProperties}
        >
          <svg viewBox="0 0 27 30" width="27" height="30" fill={color}>
            <path
              d={side === "left" ? "M2 2l12 28 4-12 12-4z" : "M25 2L13 30l-4-12-9-4z"}
            />
          </svg>
        </div>
        <div
          className="absolute top-[27px] flex items-start rounded-[29px] pt-[7px] pb-[8px] px-4"
          style={{ background: color, [side === "left" ? "left" : "right"]: "21px" } as React.CSSProperties}
        >
          <span
            className="font-semibold text-[18px] leading-[21.6px] text-black"
            style={{ fontFamily: "var(--font-urbanist)" }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function Card(props: CardProps) {
  return (
    <div className="px-[24px] lg:px-[52px] py-[26px]">
      <div
        className="relative mx-auto max-w-[1436px] overflow-hidden rounded-[40px] lg:rounded-[60px]"
        style={{ background: props.background, minHeight: 760 }}
      >
        <TagChip icon={props.tag.icon} label={props.tag.label} />

        <div className="flex flex-col items-center gap-[20px] pt-[120px] px-6 text-center">
          <h3
            className="font-semibold tracking-[-1.8px] text-black"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(32px, 4.5vw, 60px)",
              lineHeight: 1.2,
            }}
          >
            {props.titleTop}
            <br />
            {props.titleBottom}
          </h3>
          <p
            className="text-black/70 text-[18px] lg:text-[20px] max-w-[600px]"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {props.subtitle}
          </p>
        </div>

        <CursorBadge label={props.leftCursor.label} color={props.leftCursor.color} side="left" />
        <CursorBadge label={props.rightCursor.label} color={props.rightCursor.color} side="right" />

        <div className="px-6 lg:px-[100px] pb-[60px] pt-[40px]">{props.body}</div>
      </div>
    </div>
  );
}

const integrations = [
  { name: "Monday.com", color: "#FF3D57" },
  { name: "ClickUp", color: "#7B68EE" },
  { name: "Slack", color: "#4A154B" },
  { name: "Asana", color: "#F06A6A" },
];

export default function FeatureCards() {
  return (
    <section className="bg-white">
      <Card
        tag={{ icon: <span className="text-black">💬</span>, label: "Comment" }}
        titleTop="Review creative assets"
        titleBottom="with precision"
        subtitle="Comment directly on assets for clearer feedback"
        background="linear-gradient(180deg, #d8e6ff 0%, #b5d0ff 100%)"
        leftCursor={{ label: "Developer", color: "#4dd5ff" }}
        rightCursor={{ label: "Designer", color: "#5b7fff" }}
        body={
          <div
            className="mx-auto rounded-[24px] h-[340px] flex items-center justify-center text-black/40"
            style={{ background: "rgba(255,255,255,0.4)" }}
          >
            Asset review preview
          </div>
        }
      />

      <Card
        tag={{ icon: <span>⚡</span>, label: "Prioritize" }}
        titleTop="Manage, prioritize"
        titleBottom="& assign"
        subtitle="Use our built-in task manager or integrate your own."
        background="linear-gradient(180deg, #fff5cf 0%, #ffe98a 100%)"
        leftCursor={{ label: "Designer", color: "#fc6cba" }}
        rightCursor={{ label: "Developer", color: "#ffd93d" }}
        body={
          <div className="flex flex-col items-center gap-6">
            <div
              className="w-full max-w-[500px] rounded-[24px] h-[260px] flex items-center justify-center text-black/40"
              style={{ background: "rgba(255,255,255,0.5)" }}
            >
              Task manager preview
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {integrations.slice(0, 4).map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center gap-2 rounded-[14px] bg-white px-3 py-2 border border-black/5"
                >
                  <span
                    className="w-7 h-7 rounded-[6px] flex items-center justify-center text-white text-[14px] font-bold"
                    style={{ background: tool.color }}
                  >
                    {tool.name[0]}
                  </span>
                  <span className="text-[14px] font-medium text-black">{tool.name}</span>
                </div>
              ))}
            </div>
            <a href="#integrations" className="flex items-center gap-1 text-[14px] font-medium text-black/70">
              View Integrations →
            </a>
          </div>
        }
      />

      <Card
        tag={{ icon: <span>✓</span>, label: "Approve" }}
        titleTop="Get approvals"
        titleBottom="at hyper speed"
        subtitle="Built-in approvals for less back-and-forth-ing"
        background="linear-gradient(180deg, #e7dcff 0%, #d4c4ff 100%)"
        leftCursor={{ label: "Developer", color: "#3dd589" }}
        rightCursor={{ label: "Designer", color: "#fc6cba" }}
        body={
          <div
            className="mx-auto rounded-[24px] h-[340px] flex items-center justify-center text-black/40"
            style={{ background: "rgba(255,255,255,0.5)" }}
          >
            Approvals preview
          </div>
        }
      />

      <Card
        tag={{ icon: <span>🔗</span>, label: "Integrate" }}
        titleTop="Sync with"
        titleBottom="your tools"
        subtitle="Seamlessly integrate your Slack or favorite task manager"
        background="linear-gradient(180deg, #ffdccb 0%, #ffbfa0 100%)"
        leftCursor={{ label: "Designer", color: "#ff8a4d" }}
        rightCursor={{ label: "Developer", color: "#ffcd2e" }}
        body={
          <div className="flex flex-col items-center gap-8">
            <div className="marquee-viewport w-full overflow-hidden">
              <div
                className="marquee-track items-center gap-6"
                style={{ ["--marquee-duration" as string]: "30s" }}
              >
                {[...integrations, ...integrations, ...integrations].map((tool, i) => (
                  <div
                    key={`${tool.name}-${i}`}
                    className="flex items-center gap-2 rounded-[14px] bg-white px-4 py-3 border border-black/5 shrink-0"
                  >
                    <span
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white text-[14px] font-bold"
                      style={{ background: tool.color }}
                    >
                      {tool.name[0]}
                    </span>
                    <span className="text-[16px] font-medium text-black">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <a href="#integrations" className="flex items-center gap-1 text-[14px] font-medium text-black/70">
              View Integrations →
            </a>
          </div>
        }
      />
    </section>
  );
}
