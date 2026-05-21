const STEPS = [
  {
    n: 1,
    title: "Fill out the application",
    body: "Apply with a quick form so we can learn about your audience and reach.",
  },
  {
    n: 2,
    title: "We will review it in a week",
    body: "Our team will review your application and respond within seven days.",
  },
  {
    n: 3,
    title: "Join us on Rewardful",
    body: "Once approved, you'll get your unique affiliate link via Rewardful.",
  },
];

export default function ThreeSteps() {
  return (
    <section className="px-6 lg:px-12 pt-[80px] lg:pt-[120px]">
      <div className="mx-auto max-w-[1000px] flex flex-col items-center gap-[40px]">
        <h2
          className="text-center font-semibold tracking-[-0.03em]"
          style={{
            fontFamily: "var(--font-poppins)",
            color: "#111",
            fontSize: "clamp(32px, 4.5vw, 44px)",
            lineHeight: "1.5",
          }}
        >
          It just takes 3 steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="bg-[#f8f8fa] rounded-[24px] p-6 lg:p-8 flex flex-col gap-3"
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: "#625cf4",
                  color: "#fff",
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: 18,
                }}
              >
                {s.n}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-poppins)",
                  color: "#111",
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: "30px",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-poppins)",
                  color: "rgba(17,17,17,0.6)",
                  fontSize: 15,
                  lineHeight: "24px",
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
