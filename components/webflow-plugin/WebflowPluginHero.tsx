const INSTALL_URL = "https://webflow.com/integrations/superflow";

export default function WebflowPluginHero() {
  return (
    <section className="relative w-full overflow-hidden bg-black pt-[120px] pb-[60px] lg:pt-[160px] lg:pb-[80px]">
      <div className="container-page relative flex flex-col items-center gap-[32px] text-center">
        <span
          className="uppercase text-white/55"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.18em",
          }}
        >
          The Swiftest Annotation Tool
        </span>
        <h1
          className="text-center text-white font-semibold tracking-[-0.03em]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: "clamp(40px, 7vw, 80px)",
            lineHeight: "1.1em",
          }}
        >
          Comment and collaborate
          <br />
          on your Webflow sites
        </h1>
        <p
          className="max-w-[640px] text-white/70"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: "clamp(16px, 1.8vw, 20px)",
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
          }}
        >
          Superflow helps your team and clients review and add feedback in one place,
          so you can iterate and ship your websites 10x faster.
        </p>
        <a
          href={INSTALL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-[32px] bg-white px-[28px] py-[14px] text-black transition-colors hover:bg-white/90"
          style={{ fontFamily: "var(--font-poppins)", fontSize: 16, fontWeight: 500 }}
        >
          Get Superflow now
        </a>
      </div>
    </section>
  );
}
