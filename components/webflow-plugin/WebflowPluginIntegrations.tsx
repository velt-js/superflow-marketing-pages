const STATS = [
  { value: "300%", label: "Task Completion", sub: "3k+ Installs" },
  { value: "2x", label: "Communication Speed", sub: "10X Fewer Messages" },
  { value: "200%", label: "Productivity Surge", sub: "300+ Tasks Completed" },
  { value: "3k+", label: "Websites Launched", sub: "Across teams worldwide" },
];

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 11L11 3M11 3H4.5M11 3V9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WebflowPluginIntegrations() {
  return (
    <section className="bg-white pt-[60px] pb-[100px] lg:pt-[80px] lg:pb-[140px]">
      <div className="container-page flex flex-col items-center gap-[48px]">
        <div className="flex flex-col items-center gap-[16px] text-center">
          <h2
            className="font-semibold tracking-[-0.03em] text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(30px, 4vw, 44px)",
              lineHeight: 1.2,
            }}
          >
            Superflow integrates with{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(101deg, #625DF5 0%, #ff5a8a 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              all your workflows
            </span>
          </h2>
          <a
            href="/integrations"
            className="inline-flex items-center gap-[8px] text-[#625DF5]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            View All Superflow Integrations
            <ArrowIcon />
          </a>
        </div>

        <div className="grid w-full max-w-[1080px] grid-cols-2 gap-[20px] lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-[8px] rounded-[24px] border border-[#ECECEC] bg-white p-[24px] text-center"
            >
              <span
                className="text-[#111]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 700,
                  fontSize: 36,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </span>
              <span
                className="text-[#111]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: 15,
                  lineHeight: 1.3,
                }}
              >
                {stat.label}
              </span>
              <span
                className="text-[#111]/55"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                {stat.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
