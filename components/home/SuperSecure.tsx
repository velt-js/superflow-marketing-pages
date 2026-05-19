function LetterTile({ letter }: { letter: string }) {
  return (
    <div
      className="w-[36px] h-[36px] flex items-center justify-center rounded-[12px] bg-white"
      style={{ border: "1px solid rgba(34,34,34,0.08)" }}
    >
      <span
        className="text-[14px] leading-none"
        style={{ fontFamily: "var(--font-poppins)", fontWeight: 500, color: "#111" }}
      >
        {letter}
      </span>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}

const GRADIENT_BG =
  "radial-gradient(circle at 10% 0%, rgba(130,181,255,0.76) 0%, rgba(88,124,255,0.76) 50%, rgba(46,67,255,0.76) 100%)";
const SOFT_GRADIENT_BG =
  "radial-gradient(circle at 10% 0%, rgba(130,181,255,0.2) 0%, rgba(46,67,255,0.2) 100%)";
const MID_GRADIENT_BG =
  "radial-gradient(circle at 10% 0%, rgba(130,181,255,0.56) 0%, rgba(88,124,255,0.56) 50%, rgba(46,67,255,0.56) 100%)";

export default function SuperSecure() {
  return (
    <section className="bg-white px-6 lg:px-12 py-[80px] flex justify-center">
      <div
        className="relative w-full max-w-[1440px] rounded-[60px] lg:rounded-[80px] p-[2px]"
        style={{ background: GRADIENT_BG }}
      >
        <div className="bg-white rounded-[58px] lg:rounded-[78px] p-[10px] lg:p-[12px]">
          <div className="rounded-[55px] lg:rounded-[75px] p-[2px]" style={{ background: SOFT_GRADIENT_BG }}>
            <div className="bg-white rounded-[53px] lg:rounded-[73px] p-[10px] lg:p-[12px]">
              <div className="rounded-[50px] lg:rounded-[70px] p-[2px]" style={{ background: MID_GRADIENT_BG }}>
                <div className="bg-white rounded-[48px] lg:rounded-[68px] py-[60px] px-6 lg:p-[120px] flex flex-col items-center gap-[40px] lg:gap-[52px]">
                  <div className="flex items-center justify-center gap-[10px]">
                    {["S", "E", "C", "U", "R", "E"].map((l, i) => (
                      <LetterTile key={`${l}-${i}`} letter={l} />
                    ))}
                  </div>

                  <h2
                    className="text-center font-semibold"
                    style={{
                      fontFamily: "var(--font-poppins)",
                      fontSize: "clamp(36px, 6vw, 60px)",
                      lineHeight: 1.2,
                      letterSpacing: "-1.8px",
                    }}
                  >
                    <span style={{ color: "#000" }}>Super secure with</span>
                    <br />
                    <span
                      style={{
                        backgroundImage: "linear-gradient(90deg, #85bdff 0%, #5748ff 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      SOCII Type 2 Compliance
                    </span>
                  </h2>

                  <div className="flex flex-wrap items-center justify-center gap-[24px] lg:gap-[40px]">
                    {["End-to-End data encryption", "Dedicated Storage", "SOC2 Compliant"].map((label) => (
                      <div key={label} className="flex items-center gap-[16px]">
                        <LockIcon />
                        <span
                          className="text-[18px] leading-[21.6px] whitespace-nowrap"
                          style={{
                            fontFamily: "var(--font-poppins)",
                            color: "rgba(0,0,0,0.5)",
                            letterSpacing: "-0.54px",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
