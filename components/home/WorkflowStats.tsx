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
  // gradients on both ends so the gradient feels bounded.
  return (
    <div className="relative w-[180px] h-[70px] flex items-center justify-center shrink-0">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px]">
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

function StepTile({ src, alt, small }: { src: string; alt: string; small?: boolean }) {
  const inner = small ? 37 : 32;
  return (
    <div
      className="bg-white rounded-[52px] w-[70px] h-[70px] flex items-center justify-center shrink-0"
      style={{ boxShadow: "0 0 0 1px #ebebeb" }}
    >
      <Image src={src} alt={alt} width={inner} height={inner} className="object-contain" />
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

        {/* Stepper */}
        <div className="w-full max-w-[1000px] flex flex-col items-center gap-[17px]">
          {/* Icon row */}
          <div className="flex items-center w-full px-10">
            <StepTile src={steps[0].icon} alt={steps[0].label} />
            <div className="flex-1 h-[2px] bg-[#ebebeb] min-w-[20px]" />
            <StepTile src={steps[1].icon} alt={steps[1].label} />
            <div className="flex-1 h-[2px] bg-[#ebebeb] min-w-[20px]" />
            <StepTile src={steps[2].icon} alt={steps[2].label} small />
            <GradientConnector />
            <StepTile src={steps[3].icon} alt={steps[3].label} small />
          </div>

          {/* Labels row */}
          <div className="flex items-start gap-[100px]">
            {steps.map((step, i) => (
              <div key={step.label} className="w-[150px] flex justify-center">
                <span
                  className="text-[20px] font-medium leading-[24px] text-center"
                  style={{
                    color: i < 2 ? "#c8c8c8" : "#111",
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  {step.label}
                </span>
              </div>
            ))}
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
