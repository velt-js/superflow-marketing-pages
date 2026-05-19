import Image from "next/image";

const steps = [
  { label: "Design", icon: "/images/sections/step-design.png", active: false },
  { label: "Build", icon: "/images/sections/step-build.png", active: false },
  { label: "Review", icon: "/images/sections/step-review.png", active: true },
  { label: "Deliver", icon: "/images/sections/step-deliver.png", active: false },
];

function CursorBadge({ label, color, side }: { label: string; color: string; side: "left" | "right" }) {
  return (
    <div className={`hidden lg:block absolute top-[120px] ${side === "left" ? "left-4" : "right-4"}`}>
      <div className="relative h-[78px] w-[159px]">
        <div
          className="absolute top-0 h-[30px] w-[28px]"
          style={{ [side === "left" ? "left" : "right"]: 0 } as React.CSSProperties}
        >
          <svg viewBox="0 0 27 30" width="27" height="30" fill={color} style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}>
            <path d="M2 2l12 28 4-12 12-4z" />
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

export default function WorkflowStats() {
  return (
    <section className="bg-white pt-[120px] pb-[80px] relative overflow-hidden">
      <div className="container-page flex flex-col items-center gap-[80px]">
        <h2
          className="text-center font-semibold tracking-[-1.8px]"
          style={{ fontFamily: "var(--font-poppins)", fontSize: "clamp(36px, 5vw, 60px)", lineHeight: "1.3" }}
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

        {/* Workflow stepper */}
        <div className="relative w-full max-w-[700px]">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.label} className="relative flex flex-col items-center gap-3 z-10">
                <div className="bg-white rounded-full w-[70px] h-[70px] flex items-center justify-center"
                  style={{ boxShadow: "0 0 0 1px #ebebeb" }}>
                  <Image src={step.icon} alt={step.label} width={32} height={32} className="object-contain" />
                </div>
                {step.active ? (
                  <div
                    className="rounded-[32px] p-px"
                    style={{
                      background:
                        "linear-gradient(180deg, rgb(46,154,255) 0%, rgb(133,129,255) 32%, rgb(255,108,196) 64%, rgb(255,173,98) 100%)",
                    }}
                  >
                    <div className="bg-white rounded-[32px] px-3 py-2">
                      <span
                        className="text-[14px] font-medium text-[#111]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        Superflow
                      </span>
                    </div>
                  </div>
                ) : (
                  <span
                    className="text-[20px] font-medium"
                    style={{
                      color: i < 2 ? "#c8c8c8" : "#111",
                      fontFamily: "var(--font-poppins)",
                    }}
                  >
                    {step.label}
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Connector line */}
          <div
            className="absolute top-[35px] left-[60px] right-[60px] h-[2px]"
            style={{
              background:
                "linear-gradient(90deg, #ebebeb 0%, #6941ff 30%, #ff5f7a 50%, #ffa113 70%, #ebebeb 100%)",
              zIndex: 0,
            }}
          />
        </div>

        <a
          href="#signup"
          className="rounded-[32px] bg-black px-[32px] py-[16px] text-[16px] font-medium text-white"
        >
          Try Now For Free
        </a>
      </div>

      <CursorBadge label="Developer" color="#4dd5ff" side="left" />
      <CursorBadge label="Designer" color="#fc6cba" side="right" />
    </section>
  );
}
