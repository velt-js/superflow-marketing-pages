interface PrincipleCard {
  text: string;
  background: string;
}

const cards: PrincipleCard[] = [
  {
    text: "We limit access to those with a legitimate business need, granting only the minimum privilege required.",
    background:
      "linear-gradient(106.37deg, rgb(196, 240, 255) 0%, rgb(175, 192, 255) 100%)",
  },
  {
    text: "Multi-layered security. We implement strong controls, built on the principle of defense-in-depth.",
    background:
      "linear-gradient(109.4deg, rgb(248, 255, 178) 0%, rgb(255, 201, 97) 100%)",
  },
  {
    text: "Consistent security. We apply robust controls uniformly across the entire enterprise.",
    background:
      "linear-gradient(109.4deg, rgb(235, 230, 255) 0%, rgb(162, 139, 255) 100%)",
  },
  {
    text: "Our security controls are always evolving. We continuously improve their effectiveness, auditability, and ease of use.",
    background:
      "linear-gradient(106.37deg, rgb(255, 206, 196) 0%, rgb(255, 189, 175) 100%)",
  },
];

export default function FoundationalPrinciples() {
  return (
    <section className="bg-white pt-[80px] pb-[60px] lg:pt-[120px] lg:pb-[80px]">
      <div className="container-page max-w-[1080px]">
        <div
          className="mx-auto flex flex-col items-center gap-[24px] text-center rounded-[32px] px-[32px] py-[56px] lg:px-[80px] lg:py-[80px]"
          style={{ background: "#f7f7f7" }}
        >
          <span
            className="text-[14px]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 500,
              color: "rgba(0,0,0,0.35)",
            }}
          >
            Governance
          </span>
          <p
            className="text-black max-w-[860px]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "clamp(24px, 3.2vw, 36px)",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            We establish policies and controls, monitor compliance and{" "}
            <span style={{ color: "#6C63FF" }}>prove it</span> to third-party auditors.
          </p>
        </div>

        <h2
          className="mt-[80px] mb-[40px] lg:mt-[120px] lg:mb-[52px] text-center text-black font-semibold"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: "clamp(28px, 4vw, 40px)",
            lineHeight: 1.6,
            letterSpacing: "-0.03em",
          }}
        >
          Our policies are based on the following
          <br />
          foundational principles:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] max-w-[976px] mx-auto">
          {cards.map((card, i) => (
            <div
              key={i}
              className="rounded-[52px] p-[48px] min-h-[420px] lg:min-h-[480px] flex items-center justify-center text-center"
              style={{ background: card.background }}
            >
              <p
                className="text-black font-semibold"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: "clamp(20px, 2.2vw, 28px)",
                  lineHeight: 1.5,
                  letterSpacing: "-0.03em",
                }}
              >
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
