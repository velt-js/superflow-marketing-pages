import { Cursor } from "@/components/shared/Cursor";

export default function AffiliateHero() {
  return (
    <section className="relative w-full overflow-hidden bg-black pt-[120px] pb-[60px] lg:pt-[160px] lg:pb-[80px]">
      <div className="container-page relative flex flex-col items-center gap-[32px]">
        <div className="relative flex flex-col items-center gap-[24px]">
          <div className="relative flex flex-col items-center">
            <h1
              className="text-center text-white font-semibold tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(40px, 6.5vw, 60px)",
                lineHeight: "1.2",
              }}
            >
              Join Superflow
              <br />
              Affiliate Program
            </h1>

            <Cursor
              text="Designer"
              color="#4dd5ff"
              direction="right"
              className="pointer-events-none hidden lg:block"
              style={{ position: "absolute", left: "-220px", top: "20px" }}
            />
            <Cursor
              text="Photographer"
              color="#fc6cba"
              direction="left"
              className="pointer-events-none hidden lg:block"
              style={{ position: "absolute", right: "-220px", top: "20px" }}
            />
          </div>

          <p
            className="text-center max-w-[760px]"
            style={{
              fontFamily: "var(--font-poppins)",
              color: "rgba(255,255,255,0.52)",
              fontSize: 16,
              lineHeight: "32px",
            }}
          >
            Are you a freelancer or agency specializing in marketing, web development, or web design with great audience? Register to be our affiliate partner &amp; supercharge your affiliate income!
          </p>

          <a
            href="https://app.usesuperflow.com/signup"
            rel="noopener"
            className="flex items-center justify-center rounded-[32px] bg-white px-6 py-3 text-black transition-colors hover:bg-white/90"
            style={{ fontFamily: "var(--font-poppins)", fontSize: 16, fontWeight: 500, lineHeight: "1.5em" }}
          >
            Try Superflow for Free
          </a>
        </div>
      </div>
    </section>
  );
}
