"use client";

import { useMemo, useState } from "react";

interface HourStop {
  hours: number;
  top: string;
  bottom: string;
  approx?: boolean;
}

interface Role {
  name: string;
  rate: number;
  color: string;
}

const STOPS: HourStop[] = [
  { hours: 0, top: "0", bottom: "Hours" },
  { hours: 50, top: "50", bottom: "Hours" },
  { hours: 100, top: "100", bottom: "Hours" },
  { hours: 150, top: "150", bottom: "Hours" },
  { hours: 200, top: "200", bottom: "Hours" },
  { hours: 232, top: "Too", bottom: "Many", approx: true },
];

const ROLES: Role[] = [
  { name: "DESIGNER", rate: 25, color: "#5b4dff" },
  { name: "DEVELOPER", rate: 90, color: "#f4c842" },
  { name: "MARKETING", rate: 50, color: "#3fd082" },
  { name: "MANAGER", rate: 50, color: "#ff5860" },
];

function ChatBubbleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function Calculator() {
  const [hoursIdx, setHoursIdx] = useState(0);
  const [activeRoles, setActiveRoles] = useState<ReadonlySet<number>>(
    () => new Set([0, 1, 2, 3])
  );

  const stop = STOPS[hoursIdx];
  const showLost = hoursIdx > 0;

  const { avgRate, moneyLost, displayValue } = useMemo(() => {
    const selected = ROLES.filter((_, i) => activeRoles.has(i));
    const avg =
      selected.length > 0
        ? selected.reduce((sum, r) => sum + r.rate, 0) / selected.length
        : 0;
    const lost = stop.hours * avg;
    let label = "$0";
    if (lost > 0) {
      if (stop.approx) {
        const rounded = Math.round(lost / 500) * 500;
        label = `~$${rounded.toLocaleString()}`;
      } else {
        label = `-$${Math.round(lost).toLocaleString()}`;
      }
    }
    return { avgRate: avg, moneyLost: lost, displayValue: label };
  }, [activeRoles, stop]);

  const toggleRole = (i: number) => {
    setActiveRoles((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section
      className="relative overflow-hidden pt-[140px] pb-[120px] lg:pt-[180px] lg:pb-[160px]"
      style={{ background: "#0a0a14" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: showLost
            ? "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(180,30,60,0.20) 0%, rgba(80,20,40,0.10) 40%, transparent 75%)"
            : "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(70,60,200,0.22) 0%, rgba(40,30,140,0.10) 40%, transparent 75%)",
        }}
      />

      <div className="container-page relative z-10 flex flex-col items-center gap-[64px] lg:gap-[80px] max-w-[1200px]">
        <HeroDisplay
          showLost={showLost}
          displayValue={displayValue}
          moneyLost={moneyLost}
        />

        <div
          className={`flex flex-wrap items-center justify-center gap-[16px] lg:gap-[20px] transition-opacity duration-500 ${
            showLost ? "opacity-100" : "opacity-0 pointer-events-none h-0"
          }`}
        >
          {ROLES.map((role, i) => {
            const active = activeRoles.has(i);
            return (
              <button
                key={role.name}
                type="button"
                onClick={() => toggleRole(i)}
                className="cursor-pointer rounded-full transition-all px-[22px] py-[12px] flex items-center gap-[12px]"
                style={{
                  border: `1.5px solid ${active ? role.color : "rgba(255,255,255,0.10)"}`,
                  background: active
                    ? `color-mix(in srgb, ${role.color} 14%, transparent)`
                    : "rgba(255,255,255,0.02)",
                  color: active ? role.color : "rgba(255,255,255,0.30)",
                  boxShadow: active
                    ? `0 0 24px color-mix(in srgb, ${role.color} 22%, transparent)`
                    : "none",
                }}
              >
                <span
                  className="font-semibold uppercase"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 14,
                    letterSpacing: "1.5px",
                  }}
                >
                  {role.name}
                </span>
                <span
                  aria-hidden
                  style={{
                    color: "currentColor",
                    opacity: 0.45,
                  }}
                >
                  |
                </span>
                <span
                  className="font-semibold"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 14,
                  }}
                >
                  ${role.rate}/hr
                </span>
              </button>
            );
          })}
        </div>

        <HoursSlider
          stops={STOPS}
          activeIdx={hoursIdx}
          onSelect={setHoursIdx}
        />

        <p
          className="uppercase text-center"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 500,
            fontSize: 13,
            letterSpacing: "3px",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          Hours spent on feedback
        </p>
      </div>
    </section>
  );
}

function HeroDisplay({
  showLost,
  displayValue,
  moneyLost,
}: {
  showLost: boolean;
  displayValue: string;
  moneyLost: number;
}) {
  return (
    <div className="flex flex-col items-center gap-[20px] lg:gap-[28px] relative w-full">
      <div className="relative w-full flex items-center justify-center" style={{ minHeight: "1em" }}>
        {showLost && moneyLost > 0 && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 text-center whitespace-nowrap select-none"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 700,
              fontSize: "clamp(70px, 11vw, 150px)",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              WebkitTextStroke: "1px rgba(255, 99, 132, 0.32)",
              color: "transparent",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            Money Lost
          </span>
        )}
        <h1
          className="relative text-white font-bold whitespace-nowrap"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: "clamp(72px, 12vw, 168px)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            zIndex: 1,
            textShadow: showLost
              ? "0 0 40px rgba(255,180,200,0.18)"
              : "0 0 40px rgba(180,180,255,0.18)",
          }}
        >
          {displayValue}
        </h1>
      </div>
      <p
        className="text-center"
        style={{
          fontFamily: "var(--font-poppins)",
          fontWeight: 400,
          fontSize: "clamp(18px, 2vw, 26px)",
          letterSpacing: "-0.01em",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {showLost ? (
          <>
            Team&rsquo;s rate{"   "}
            <span style={{ color: "rgba(255,255,255,0.35)" }}>X</span>
            {"   "}Number of Hours{"   "}
            <span style={{ color: "rgba(255,255,255,0.35)" }}>=</span>
            {"   "}
            <span style={{ color: "rgba(255,255,255,0.75)" }}>
              {displayValue}
            </span>
          </>
        ) : (
          "Calculate how much money you lose!"
        )}
      </p>
    </div>
  );
}

function HoursSlider({
  stops,
  activeIdx,
  onSelect,
}: {
  stops: HourStop[];
  activeIdx: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="w-full max-w-[1080px] px-[28px] lg:px-[40px]">
      <div className="relative" style={{ height: 56 }}>
        <div
          className="absolute h-[1.5px]"
          style={{
            left: 0,
            right: 0,
            top: 27,
            background: "rgba(255,255,255,0.14)",
          }}
        />

        {stops.map((stop, i) => {
          const position = (i / (stops.length - 1)) * 100;
          const isActive = i === activeIdx;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`${stop.top} ${stop.bottom}`}
              className="cursor-pointer absolute -translate-x-1/2 flex items-center justify-center transition-transform"
              style={{
                left: `${position}%`,
                top: 0,
                width: 56,
                height: 56,
              }}
            >
              {isActive ? (
                <div
                  className="w-[56px] h-[56px] rounded-full flex items-center justify-center"
                  style={{
                    background: "#6C63FF",
                    boxShadow:
                      "0 10px 32px rgba(108,99,255,0.45), 0 0 0 6px rgba(108,99,255,0.12)",
                  }}
                >
                  <ChatBubbleIcon />
                </div>
              ) : (
                <div
                  className="w-[14px] h-[14px] rounded-full transition-colors hover:bg-white/10"
                  style={{
                    border: "1.5px solid rgba(255,255,255,0.30)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="relative mt-[24px]" style={{ height: 56 }}>
        {stops.map((stop, i) => {
          const position = (i / (stops.length - 1)) * 100;
          const isActive = i === activeIdx;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className="cursor-pointer absolute -translate-x-1/2 flex flex-col items-center text-center"
              style={{ left: `${position}%`, top: 0, width: 72 }}
            >
              <span
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 500,
                  fontSize: 18,
                  lineHeight: "24px",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.40)",
                }}
              >
                {stop.top}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "20px",
                  color: isActive
                    ? "rgba(255,255,255,0.70)"
                    : "rgba(255,255,255,0.40)",
                }}
              >
                {stop.bottom}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
