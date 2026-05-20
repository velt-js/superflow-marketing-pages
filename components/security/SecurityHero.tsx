import { CursorBadge } from "@/components/shared/CursorBadge";

export default function SecurityHero() {
  return (
    <section className="relative w-full overflow-hidden bg-black pt-[140px] pb-[60px] lg:pt-[180px] lg:pb-[80px]">
      <div className="container-page relative flex flex-col items-center gap-[40px]">
        <div className="relative flex flex-col items-center gap-[8px]">
          <h1
            className="text-center text-white font-semibold tracking-[-0.03em]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(40px, 7vw, 80px)",
              lineHeight: "1.3em",
            }}
          >
            Security and Privacy
          </h1>

          <h1
            className="text-gradient-superflow text-center font-semibold tracking-[-0.03em]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(40px, 7vw, 80px)",
              lineHeight: "1.3em",
            }}
          >
            at Superflow
          </h1>

          <CursorBadge
            label="Developer"
            color="#4dd5ff"
            side="left"
            style={{ left: "-140px", top: "calc(50% + 16px)" }}
          />
          <CursorBadge
            label="Designer"
            color="#fc6cba"
            side="right"
            style={{ right: "-140px", top: "calc(50% + 16px)" }}
          />
        </div>
      </div>
    </section>
  );
}
