function MobileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#625DF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M11 18h2" />
    </svg>
  );
}
function BrowserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#625DF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <circle cx="6.5" cy="7" r="0.5" fill="#625DF5" />
      <circle cx="8.5" cy="7" r="0.5" fill="#625DF5" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#625DF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export default function WebflowPluginMobileBrowsers() {
  return (
    <section className="bg-white pt-[40px] pb-[100px] lg:pt-[60px] lg:pb-[120px]">
      <div className="container-page grid grid-cols-1 gap-[24px] lg:grid-cols-2">
        <article className="flex flex-col gap-[24px] rounded-[28px] border border-[#ECECEC] bg-white p-[32px] lg:p-[48px]">
          <div className="flex items-center gap-[12px]">
            <MobileIcon />
            <BrowserIcon />
          </div>
          <h3
            className="text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "clamp(24px, 3vw, 32px)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Optimized for{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(101deg, #ff7162 0%, #ff5a8a 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              mobile devices and all browsers
            </span>
          </h3>
          <p
            className="text-[#111]/65"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            Works for everyone using a single code snippet installation.
          </p>
        </article>

        <article
          className="flex flex-col gap-[24px] rounded-[28px] p-[32px] lg:p-[48px]"
          style={{ background: "#EEEBFF" }}
        >
          <LockIcon />
          <h3
            className="text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "clamp(24px, 3vw, 32px)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Collaborate on your entire websites,{" "}
            <span style={{ color: "#625DF5" }}>including secured pages.</span>
          </h3>
          <p
            className="text-[#111]/65"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            Log into your app and leave no pages behind.
          </p>
        </article>
      </div>
    </section>
  );
}
