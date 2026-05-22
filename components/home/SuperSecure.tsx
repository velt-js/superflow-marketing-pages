"use client";

import { useRef, useState } from "react";

function LetterTile({ letter }: { letter: string }) {
  const [up, setUp] = useState(false);
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (revertTimer.current) {
      clearTimeout(revertTimer.current);
      revertTimer.current = null;
    }
    setUp(true);
  };

  const handleLeave = () => {
    if (revertTimer.current) clearTimeout(revertTimer.current);
    // wait for up-anim (300ms) + hold (1200ms) before flipping back
    revertTimer.current = setTimeout(() => setUp(false), 1500);
  };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`w-[36px] h-[36px] rounded-[12px] overflow-hidden transition-colors duration-200 ${up ? "bg-[#ececec]" : "bg-white"}`}
      style={{ border: "1px solid rgba(34,34,34,0.08)" }}
    >
      <div
        className="flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: up ? "translateY(-36px)" : "translateY(0)" }}
      >
        <span
          className="h-[36px] w-[36px] flex items-center justify-center text-[18px] leading-none"
          style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, color: "#5748ff" }}
        >
          ✱
        </span>
        <span
          className="h-[36px] w-[36px] flex items-center justify-center text-[14px] leading-none"
          style={{ fontFamily: "var(--font-poppins)", fontWeight: 500, color: "#111" }}
        >
          {letter}
        </span>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
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
    <section
      className="bg-white px-6 lg:px-12 py-[40px] flex justify-center"
      style={{ height: "90vh", maxHeight: "720px" }}
    >
      <div className="relative w-full max-w-[1440px]">
        <div
          className="absolute inset-0 rounded-[40px] lg:rounded-[80px] secure-ring"
          style={{ background: GRADIENT_BG, animationDelay: "0s" }}
        />
        <div
          className="absolute inset-[12px] lg:inset-[14px] rounded-[36px] lg:rounded-[75px] secure-ring"
          style={{ background: SOFT_GRADIENT_BG, animationDelay: "0.8s" }}
        />
        <div
          className="absolute inset-[24px] lg:inset-[28px] rounded-[28px] lg:rounded-[70px] secure-ring"
          style={{ background: MID_GRADIENT_BG, animationDelay: "1.6s" }}
        />

        <div className="absolute inset-[26px] lg:inset-[30px] bg-white rounded-[26px] lg:rounded-[68px] flex flex-col items-center justify-center gap-[40px] lg:gap-[52px] py-[40px] pb-[80px] px-6 lg:py-[60px] lg:pb-[80px] lg:px-[120px]">
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
                <CheckIcon />
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
    </section>
  );
}
