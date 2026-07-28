const STEPS = [
  {
    step: "Step 1",
    title: "Select your websites",
    body: "Choose the Webflow sites you want to enable feedback on.",
  },
  {
    step: "Step 2",
    title: "Authenticate",
    body: "One-click OAuth - no code, no copy-pasting tokens.",
  },
  {
    step: "Step 3",
    title: "Add Comments",
    body: "Click anywhere on the page and start the conversation.",
  },
];

export default function WebflowPluginSteps() {
  return (
    <section className="bg-white py-[80px] lg:py-[120px]">
      <div className="container-page flex flex-col items-center gap-[48px]">
        <div className="flex flex-col items-center gap-[10px] text-center">
          <h2
            className="font-semibold tracking-[-0.03em] text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(32px, 5vw, 52px)",
              lineHeight: 1.15,
            }}
          >
            Get started in{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(101deg, #ff5a8a 0%, #b45cff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              3 Steps
            </span>
          </h2>
          <p
            className="text-[#111]/60"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 16,
              lineHeight: 1.5,
            }}
          >
            Once you&apos;ve installed the Superflow plugin
          </p>
        </div>

        <div className="grid w-full max-w-[1080px] grid-cols-1 gap-[20px] md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="flex flex-col gap-[20px] rounded-[24px] border border-[#ECECEC] bg-white p-[28px]"
            >
              <span
                className="self-start rounded-full bg-[#F4F4F6] px-[12px] py-[6px] uppercase"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  color: "rgba(17,17,17,0.55)",
                }}
              >
                {s.step}
              </span>
              <div className="flex flex-col gap-[8px]">
                <h3
                  className="text-[#111]"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontWeight: 600,
                    fontSize: 22,
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-[#111]/65"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 15,
                    lineHeight: 1.55,
                  }}
                >
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
