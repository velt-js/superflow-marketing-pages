import Image from "next/image";

const steps = [
  { label: "Design", icon: "/images/sections/step-design.png" },
  { label: "Build", icon: "/images/sections/step-build.png" },
  { label: "Review", icon: "/images/sections/step-review.png" },
  { label: "Deliver", icon: "/images/sections/step-deliver.png" },
];

function CursorBadge({
  label,
  color,
  side,
  top,
}: {
  label: string;
  color: string;
  side: "left" | "right";
  top: number;
}) {
  const isLeft = side === "left";
  return (
    <div
      className={`hidden lg:block absolute ${isLeft ? "left-8" : "right-8"}`}
      style={{ top }}
    >
      <div className="relative h-[78px] w-[159px]">
        <div
          className="absolute top-0 h-[30px] w-[28px]"
          style={{ [isLeft ? "right" : "left"]: 0 } as React.CSSProperties}
        >
          <svg
            viewBox="0 0 27 30"
            width="27"
            height="30"
            fill={color}
            style={{ transform: isLeft ? "scaleX(-1)" : undefined }}
          >
            <path d="M2 2l12 28 4-12 12-4z" />
          </svg>
        </div>
        <div
          className="absolute top-[27px] flex items-start rounded-[29px] pt-[7px] pb-[8px] px-4"
          style={
            {
              background: color,
              [isLeft ? "left" : "right"]: "21px",
            } as React.CSSProperties
          }
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

const GRADIENT_LINE =
  "linear-gradient(90deg, #6941ff 0%, #ff5f7a 49%, #ffa113 100%)";

function GradientConnector() {
  // Window centered on the Superflow pill: a gradient line with white-fade
  // gradients on both ends so the gradient feels bounded. The line itself
  // is desktop-only; on mobile we only render the centered pill.
  return (
    <div className="relative lg:w-[184px] lg:h-[56px] flex items-center justify-center shrink-0">
      <div className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px]">
        <div className="relative w-full h-full" style={{ background: GRADIENT_LINE }}>
          <div
            className="absolute inset-y-0 left-0 w-[40px]"
            style={{
              background:
                "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0) 100%)",
            }}
          />
          <div
            className="absolute inset-y-0 right-0 w-[40px]"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, #ffffff 100%)",
            }}
          />
        </div>
      </div>
      {/* Superflow gradient-bordered pill */}
      <div
        className="relative rounded-[32px] p-px"
        style={{
          background:
            "linear-gradient(180deg, rgb(46,154,255) 0%, rgb(133,129,255) 32%, rgb(255,108,196) 64%, rgb(255,173,98) 100%)",
        }}
      >
        <div className="bg-white rounded-[32px] px-3 py-2">
          <span
            className="text-[14px] font-medium text-[#111] leading-[16.8px]"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Superflow
          </span>
        </div>
      </div>
    </div>
  );
}

function StepTile({
  src,
  alt,
  label,
  small,
  dim,
}: {
  src: string;
  alt: string;
  label: string;
  small?: boolean;
  dim?: boolean;
}) {
  const inner = small ? 30 : 26;
  return (
    <div className="shrink-0 flex flex-col items-center gap-2 lg:gap-0 lg:block lg:relative lg:w-[56px] lg:h-[56px]">
      <div
        className="bg-white rounded-[52px] w-[56px] h-[56px] flex items-center justify-center"
        style={{ boxShadow: "0 0 0 1px #ebebeb" }}
      >
        <Image src={src} alt={alt} width={inner} height={inner} className="object-contain" />
      </div>
      <span
        className="text-[20px] font-medium leading-[24px] whitespace-nowrap text-center lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-[73px]"
        style={{
          color: dim ? "#c8c8c8" : "#111",
          fontFamily: "var(--font-poppins)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function WorkflowStats() {
  return (
    <section className="bg-white pt-[120px] pb-[80px] relative overflow-hidden">
      <div className="container-page flex flex-col items-center gap-[80px]">
        <h2
          className="text-center font-semibold tracking-[-1.8px]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: "clamp(36px, 5vw, 60px)",
            lineHeight: 1.3,
          }}
        >
          <span style={{ color: "#111" }}>Your creative workflow just got</span>
          <br />
          <span
            style={{
              backgroundImage:
                "linear-gradient(101deg, rgb(46,154,255) 0%, rgb(133,129,255) 29%, rgb(255,108,196) 65%, rgb(255,173,98) 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            1000x more collaborative
          </span>
        </h2>

        {/* Stepper — labels are anchored under each icon to stay aligned on
            desktop. On mobile the row stacks vertically; horizontal connector
            lines are hidden because the icons themselves communicate the flow. */}
        <div className="w-full max-w-[720px] lg:pb-[41px]">
          <div className="flex flex-col items-center gap-[32px] w-full lg:flex-row lg:gap-0 lg:px-10">
            <StepTile src={steps[0].icon} alt={steps[0].label} label={steps[0].label} dim />
            <div className="hidden lg:block flex-1 h-[2px] bg-[#ebebeb] min-w-[20px]" />
            <StepTile src={steps[1].icon} alt={steps[1].label} label={steps[1].label} dim />
            <div className="hidden lg:block flex-1 h-[2px] bg-[#ebebeb] min-w-[20px]" />
            <StepTile src={steps[2].icon} alt={steps[2].label} label={steps[2].label} small />
            <GradientConnector />
            <StepTile src={steps[3].icon} alt={steps[3].label} label={steps[3].label} small />
          </div>
        </div>

        <a
          href="https://app.usesuperflow.com/signup?returnUrl=%2Fhome%3F_gl%3D1*16r2jus*_gcl_au*MzgzMzk1NDk4LjE3NzkxMjUzNjU."
          className="rounded-[32px] bg-black px-[32px] py-[16px] text-[16px] font-medium text-white"
        >
          Try Now For Free
        </a>
      </div>

      {/* Cursor badges */}
      <CursorBadge label="Developer" color="#4dd5ff" side="left" top={296} />
      <CursorBadge label="Designer" color="#fc6cba" side="right" top={420} />
    </section>
  );
}
