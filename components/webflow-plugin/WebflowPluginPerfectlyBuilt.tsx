"use client";

import { useEffect, useState } from "react";

const INSTALL_URL = "https://webflow.com/integrations/superflow";

const ROLES = ["Designer", "Developer", "Project Manager", "Client"];

const CARDS = [
  {
    label: "Comment",
    gradient: "linear-gradient(135deg, #ff8c42 0%, #ffb380 100%)",
    iconColor: "#ff5a1f",
  },
  {
    label: "Assign",
    gradient: "linear-gradient(135deg, #1fb47a 0%, #4fd99a 100%)",
    iconColor: "#0c7a4f",
  },
  {
    label: "Ship",
    gradient: "linear-gradient(135deg, #d946ef 0%, #ec96ff 100%)",
    iconColor: "#a21caf",
  },
];

function CommentIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
    </svg>
  );
}
function AssignIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 11a4 4 0 1 0 -8 0a4 4 0 0 0 8 0" />
      <path d="M3 21v-2a4 4 0 0 1 4 -4h8" />
      <path d="M16 19h6" />
      <path d="M19 16v6" />
    </svg>
  );
}
function ShipIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M8 12l3 3l5 -6" />
    </svg>
  );
}

const ICONS = [CommentIcon, AssignIcon, ShipIcon];

export default function WebflowPluginPerfectlyBuilt() {
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIdx((i) => (i + 1) % ROLES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white pt-[100px] pb-[80px] lg:pt-[140px] lg:pb-[120px]">
      <div className="container-page flex flex-col items-center gap-[40px] text-center">
        <div className="flex flex-col items-center gap-[12px]">
          <h2
            className="font-semibold tracking-[-0.03em] text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(32px, 5vw, 56px)",
              lineHeight: 1.15,
            }}
          >
            Perfectly built for a
            <br />
            <span
              key={roleIdx}
              className="webflow-role-flip inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(101deg, rgb(46,154,255) 0%, rgb(133,129,255) 29%, rgb(255,108,196) 65%, rgb(255,173,98) 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {ROLES[roleIdx]}
            </span>
          </h2>
          <p
            className="max-w-[560px] text-[#111]/65"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(16px, 1.6vw, 18px)",
              lineHeight: 1.55,
            }}
          >
            Streamline your feedback process and ship Webflow websites faster.
          </p>
          <a
            href={INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[12px] inline-flex items-center justify-center rounded-[32px] bg-black px-[28px] py-[14px] text-white transition-colors hover:bg-black/80"
            style={{ fontFamily: "var(--font-poppins)", fontSize: 15, fontWeight: 500 }}
          >
            Add Superflow to Webflow
          </a>
        </div>

        <div className="grid w-full grid-cols-1 gap-[20px] md:grid-cols-3">
          {CARDS.map((card, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={card.label}
                className="flex aspect-[4/3] flex-col overflow-hidden rounded-[28px]"
                style={{ background: card.gradient }}
              >
                <div className="flex flex-1 items-center justify-center p-[24px]">
                  <div className="flex h-full w-full items-center justify-center rounded-[18px] bg-white/95">
                    <span
                      className="flex h-[56px] w-[56px] items-center justify-center rounded-full"
                      style={{ background: card.gradient }}
                    >
                      <Icon color="#fff" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center pb-[20px]">
                  <span
                    className="flex items-center gap-[8px] text-white"
                    style={{
                      fontFamily: "var(--font-poppins)",
                      fontSize: 17,
                      fontWeight: 600,
                    }}
                  >
                    <Icon color="#fff" />
                    {card.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
