"use client";

// WebsiteFirstCard — interactive slot-0 FeatureCard for /website-review.
// Three tabs (Review Elements / Report Bugs / Review Copy). All chrome
// (gradient bg, top-left tag, title, Designer/Photographer cursors, pill row,
// browser mock frame) is shared; only the overlay on the mock changes.
// Mirrors Figma 25:11844, 25:12604, 25:12744.

import { useState } from "react";
import Image from "next/image";

export type WebsiteFirstCardProps = {
  titleLine1: string;
  titleLine2?: string;
  subtitle: string;
};

const TAB_LABELS = ["Review Elements", "Report Bugs", "Review Copy"] as const;

const AVATAR_CALVIN = "/images/review/website-first-card/avatar-calvin.png";
const AVATAR_HUDDLE = "/images/review/website-first-card/avatar-huddle.png";

/* ────────────────────────────────  Icons  ─────────────────────────────── */

function CommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
    </svg>
  );
}

function CursorGlyph({ color, flipped }: { color: string; flipped: boolean }) {
  return (
    <svg width="27" height="30" viewBox="0 0 27 30" aria-hidden style={{ transform: flipped ? "scaleX(-1)" : undefined }}>
      <g transform="translate(0.837 1.792)">
        <path d="M 4.866 22.858 L 0.911 2.973 C 0.619 1.501 2.193 0.368 3.496 1.112 L 20.95 11.086 C 22.31 11.863 22.043 13.899 20.529 14.298 L 13.086 16.261 C 12.654 16.375 12.281 16.65 12.045 17.03 L 8.069 23.439 C 7.232 24.788 5.175 24.415 4.866 22.858 Z" fill={color} />
        <path d="M 0.053 3.144 L 4.008 23.028 C 4.472 25.364 7.557 25.924 8.813 23.9 L 12.789 17.492 C 12.907 17.302 13.093 17.164 13.309 17.107 L 20.752 15.144 C 23.023 14.545 23.424 11.492 21.385 10.327 L 3.93 0.353 C 1.976 -0.764 -0.386 0.936 0.053 3.144 Z" fill="transparent" stroke="#fff" strokeWidth="1.75" strokeLinecap="square" strokeMiterlimit="10" />
      </g>
    </svg>
  );
}

// Cursor pills pinned to exact Figma 25:10296 coordinates inside the 1436-wide card.
function DesignerCursor() {
  return (
    <>
      <div className="hidden lg:block absolute" style={{ right: 1204.44, top: 360.82, width: 28, height: 30 }}>
        <CursorGlyph color="#4dd5ff" flipped={false} />
      </div>
      <div
        className="hidden lg:flex absolute items-start whitespace-nowrap"
        style={{ right: 1229, top: 387.82, background: "#4dd5ff", borderRadius: 29, padding: "7px 16px 8px" }}
      >
        <span className="font-semibold" style={{ fontFamily: "var(--font-urbanist)", color: "#000", fontSize: 18, lineHeight: "21.6px" }}>
          Designer
        </span>
      </div>
    </>
  );
}

function PhotographerCursor() {
  return (
    <>
      <div
        className="hidden lg:flex absolute items-center justify-center"
        style={{ left: 1234.76, top: 452.94, width: 37.543, height: 35.164 }}
      >
        <div style={{ transform: "rotate(-75deg)", width: 28, height: 31.36 }}>
          <CursorGlyph color="#3772ff" flipped />
        </div>
      </div>
      <div
        className="hidden lg:flex absolute items-start whitespace-nowrap"
        style={{ left: 1264.53, top: 481.85, background: "#3772ff", borderRadius: 29, padding: "7px 16px 8px" }}
      >
        <span className="font-semibold" style={{ fontFamily: "var(--font-urbanist)", color: "#fff", fontSize: 18, lineHeight: "21.6px" }}>
          Photographer
        </span>
      </div>
    </>
  );
}

function LockIcon({ color = "rgba(17,17,17,0.75)" }: { color?: string }) {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden>
      <rect x="1" y="5.5" width="9" height="7" rx="1.5" stroke={color} strokeWidth="1.2" />
      <path d="M3 5.5V3.5a2.5 2.5 0 015 0v2" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden>
      <rect x="0.6" y="0.6" width="12.8" height="8.8" rx="1.4" stroke="#b1b5c3" strokeWidth="1.2" />
      <path d="M5 11h4" stroke="#b1b5c3" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CommentLineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dcdde0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#dcdde0" aria-hidden>
      <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dcdde0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="8" height="9" viewBox="0 0 8 9" fill="none" aria-hidden>
      <path d="M5.5 1.5l-3 3a1.5 1.5 0 102.1 2.1l3-3a2.5 2.5 0 10-3.5-3.5l-3 3a3.5 3.5 0 105 5" stroke="#b1b5c3" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ────────────────────────  Browser-mock subparts  ────────────────────── */

const MOCK_W = 990;
const MOCK_H = 455;

// Comment pin (Figma 25:12570) — purple teardrop with circular avatar inside.
function CommentPin() {
  return (
    <div className="relative" style={{ transform: "rotate(-90deg)" }}>
      <div
        className="relative"
        style={{
          width: 40,
          height: 40,
          background: "#625df5",
          border: "2px solid #fff",
          borderTopLeftRadius: 2,
          borderTopRightRadius: 100,
          borderBottomLeftRadius: 100,
          borderBottomRightRadius: 100,
        }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            inset: "calc(15.38% - 1.38px)",
            borderRadius: 32,
            transform: "rotate(90deg)",
          }}
        >
          <Image src={AVATAR_CALVIN} alt="" width={32} height={32} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

// Calvin comment card (Figma 25:12572) — white rounded popup.
function CalvinCommentCard() {
  return (
    <div
      className="bg-white border border-[#f4f5f6] flex flex-col items-start"
      style={{ width: 370, borderRadius: 24, padding: 24, boxShadow: "0 12px 40px rgba(17,17,17,0.08)" }}
    >
      <div className="flex gap-3 items-start w-full">
        <div className="rounded-full overflow-hidden bg-[#b1b5c3] shrink-0" style={{ width: 24, height: 24 }}>
          <Image src={AVATAR_CALVIN} alt="" width={24} height={24} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col gap-2 min-w-0" style={{ paddingTop: 3 }}>
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <p className="m-0 text-[#111] font-medium" style={{ fontFamily: "var(--font-poppins)", fontSize: 14, lineHeight: "17px", letterSpacing: "0.14px" }}>Calvin F.</p>
                <p className="m-0 text-[#b1b5c3] font-medium" style={{ fontFamily: "var(--font-poppins)", fontSize: 14, lineHeight: "17px", letterSpacing: "0.14px" }}>3h</p>
                <PaperclipIcon />
              </div>
              <div className="flex gap-[2px] items-start" style={{ paddingBottom: 4 }}>
                <p className="m-0 text-[#b1b5c3] font-medium" style={{ fontFamily: "var(--font-poppins)", fontSize: 12, lineHeight: "17px", letterSpacing: "0.12px" }}>Assigned to</p>
                <p className="m-0 text-[#625df5] font-medium" style={{ fontFamily: "var(--font-poppins)", fontSize: 12, lineHeight: "17px", letterSpacing: "0.12px" }}>@You</p>
              </div>
            </div>
            <DeviceIcon />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <p className="m-0 text-[#4c5366]" style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: 14, lineHeight: 1.8 }}>
              Let&rsquo;s add a sun here, Let&rsquo;s use AI
            </p>
            <p className="m-0 text-[#b1b5c3]" style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: 12, lineHeight: "17px", letterSpacing: "0.12px" }}>
              2 Replies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Black recording status bar (Figma 25:12298) — Recording... 00:42 | stop | pause
function HuddleRecordingBar() {
  return (
    <div
      className="flex items-center justify-between overflow-hidden"
      style={{
        width: 250,
        background: "rgba(0,0,0,0.95)",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08))",
        borderRadius: 80,
        paddingLeft: 24,
        paddingRight: 12,
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <span style={{ fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: 13, color: "#fff", opacity: 0.4 }}>Recording...</span>
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: 13, color: "#fff", opacity: 0.75 }}>00:42</span>
        <div style={{ width: 2, height: 20, background: "rgba(255,255,255,0.08)", borderRadius: 2 }} />
        <div className="flex items-center">
          <div className="flex items-center justify-center" style={{ padding: 4, borderRadius: 24 }}>
            <div style={{ width: 14, height: 14, background: "#ff4d4f", borderRadius: 3 }} />
          </div>
          <div
            className="flex items-center justify-center"
            style={{ padding: 4, borderRadius: 24, backgroundImage: "linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08))" }}
          >
            <div className="relative" style={{ width: 20, height: 20 }}>
              <div className="absolute" style={{ left: 7, bottom: 4, width: 3, height: 12, background: "#fff", borderRadius: 4 }} />
              <div className="absolute" style={{ left: 13, bottom: 4, width: 3, height: 12, background: "#fff", borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Rewrite / Ask ChatGPT menu (Figma 25:12908)
function RewriteMenu() {
  return (
    <div
      className="flex flex-col items-start"
      style={{
        background: "#141416",
        border: "1px solid #222226",
        borderRadius: 53,
        paddingLeft: 8,
        paddingRight: 12,
        paddingTop: 4,
        paddingBottom: 4,
        filter: "drop-shadow(0 8px 8px rgba(143,149,178,0.15))",
      }}
    >
      <div className="flex items-center gap-1" style={{ height: 32 }}>
        <div className="flex items-center justify-center gap-1" style={{ paddingLeft: 4, paddingRight: 8 }}>
          <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
            <CommentLineIcon />
          </div>
          <div style={{ width: 1, height: 15, background: "#404044" }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center gap-1" style={{ background: "#222226", borderRadius: 50, height: 28, paddingLeft: 8, paddingRight: 8 }}>
            <SparkleIcon />
            <span style={{ fontFamily: "var(--font-poppins)", fontSize: 14, color: "#dcdde0" }}>Rewrite</span>
          </div>
          <div className="flex items-center gap-1" style={{ background: "#222226", borderRadius: 50, height: 28, paddingLeft: 8, paddingRight: 8 }}>
            <KeyboardIcon />
            <span style={{ fontFamily: "var(--font-poppins)", fontSize: 14, color: "#dcdde0" }}>Ask ChatGPT</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────  Browser mock  ─────────────────────────── */

function BrowserMock({ activeIndex }: { activeIndex: number }) {
  const urlColor = activeIndex === 2 ? "#fff" : "rgba(17,17,17,0.75)";

  return (
    <div
      className="relative"
      style={{
        width: MOCK_W,
        height: MOCK_H,
        borderRadius: 28,
        border: "2px solid rgba(255,255,255,0.16)",
        overflow: "visible",
      }}
    >
      {/* Subtle inner gradient wash */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          borderRadius: 26,
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(0,0,0,0.08), rgba(0,0,0,0) 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Traffic lights */}
      <div className="absolute flex items-start" style={{ left: 18, top: 22, gap: 10 }}>
        <div style={{ width: 13, height: 13, borderRadius: 99, background: "#ff7162" }} />
        <div style={{ width: 13, height: 13, borderRadius: 99, background: "#ffcd2e" }} />
        <div style={{ width: 13, height: 13, borderRadius: 99, background: "#0dcf82" }} />
      </div>

      {/* URL bar */}
      <div
        className="absolute flex items-center justify-center gap-2"
        style={{ left: "50%", top: 16, transform: "translateX(-50%)", width: 820, padding: "5px 8px", borderRadius: 5 }}
      >
        <LockIcon color={urlColor} />
        <span style={{ fontFamily: "var(--font-fira-code), monospace", fontSize: 15.875, color: urlColor }}>
          your-website.com
        </span>
      </div>

      {/* Right-side translucent panel */}
      <div
        className="absolute"
        style={{ right: 12, top: 69, width: 434, height: 386, background: "rgba(255,255,255,0.16)", borderRadius: 16 }}
      />

      {/* Left input row (varies by tab) */}
      {activeIndex === 0 ? (
        <div
          className="absolute"
          style={{
            left: 42,
            top: 89,
            width: 267,
            height: 58,
            background: "rgba(17,17,17,0.08)",
            border: "3.926px dashed #5cffec",
            borderRadius: 12,
          }}
        />
      ) : (
        <div
          className="absolute"
          style={{ left: 42, top: 89, width: 267, height: 58, background: "rgba(255,255,255,0.16)", borderRadius: 16 }}
        />
      )}

      {/* Lower skeleton bar (with green highlight on Tab 3) */}
      <div
        className="absolute"
        style={{ left: 42, top: 159, width: 238, height: 24, background: "rgba(255,255,255,0.16)", borderRadius: 16, overflow: "hidden" }}
      >
        {activeIndex === 2 ? (
          <div style={{ width: 114, height: "100%", background: "#5cffec" }} />
        ) : null}
      </div>

      {/* Add Ticket button */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: 42, top: 217, width: 157, height: 62, background: "#2673bb", borderRadius: 32 }}
      >
        <span style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: 19.844, color: "#fff", letterSpacing: "-0.5953px" }}>
          Add Ticket
        </span>
      </div>

      {/* ── Tab 1 overlay: comment pin + Calvin card (Figma 25:12569/25:12572 — card-y=560 → mock-y=85) ── */}
      {activeIndex === 0 ? (
        <>
          <div className="absolute" style={{ left: "calc(50% - 166.5px)", top: 85, transform: "translate(-50%, -50%)" }}>
            <CommentPin />
          </div>
          <div className="absolute" style={{ left: "calc(50% + 51.27px)", top: 85, transform: "translate(-50%, -50%)" }}>
            <CalvinCommentCard />
          </div>
        </>
      ) : null}

      {/* ── Tab 2 overlay: round portrait + recording bar (Figma 25:12851 card-y=588→mock-y=113; bar card-y≈763→mock-y≈288) ── */}
      {activeIndex === 1 ? (
        <>
          <div
            className="absolute overflow-hidden"
            style={{ left: "50%", top: 113, transform: "translateX(-50%)", width: 200, height: 200, borderRadius: 999 }}
          >
            <Image src={AVATAR_HUDDLE} alt="" width={200} height={200} className="w-full h-full object-cover" />
          </div>
          <div className="absolute" style={{ left: "50%", top: 288, transform: "translateX(-50%)" }}>
            <HuddleRecordingBar />
          </div>
        </>
      ) : null}

      {/* ── Tab 3 overlay: Rewrite / Ask ChatGPT menu (Figma 25:12908 — card-y≈748→mock-y≈273) ── */}
      {activeIndex === 2 ? (
        <div className="absolute" style={{ left: "calc(50% - 189.5px)", top: 273, transform: "translate(-50%, -50%)" }}>
          <RewriteMenu />
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────────  Main component  ─────────────────────────── */

export default function WebsiteFirstCard({ titleLine1, titleLine2, subtitle }: WebsiteFirstCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full flex justify-center px-[24px] lg:px-[52px] py-[26px]">
      <div
        className="relative w-full max-w-[1436px] rounded-[40px] lg:rounded-[48px] overflow-hidden"
        style={{ background: "linear-gradient(106deg, rgb(196,240,255) 0%, rgb(175,192,255) 100%)" }}
      >
        <div className="hidden lg:block" style={{ height: 800 }} aria-hidden />

        {/* Top-left tag */}
        <div className="absolute left-[24px] lg:left-[52px] top-[24px] lg:top-[52px] flex items-center justify-center rounded-[52px] bg-black/[0.08] w-[52px] h-[52px]">
          <CommentIcon />
        </div>

        {/* Title block */}
        <div className="lg:absolute lg:left-0 lg:right-0 lg:top-[120px] flex flex-col items-center gap-[16px] pt-[96px] lg:pt-0 px-6 text-center">
          <h3
            className="font-bold tracking-[-1.8px] text-[#111]"
            style={{ fontFamily: "var(--font-poppins)", fontSize: "clamp(36px, 5vw, 60px)", lineHeight: "72px" }}
          >
            {titleLine1}
            {titleLine2 ? (<><br />{titleLine2}</>) : null}
          </h3>
          <p style={{ color: "rgba(17,17,17,0.8)", fontFamily: "var(--font-poppins)", fontSize: 20, lineHeight: "30px" }}>
            {subtitle}
          </p>

          {/* Mobile pill row (lg has its own absolute one below) */}
          <div
            className="lg:hidden mt-2 flex flex-wrap items-center justify-center"
            style={{ gap: 4, background: "rgba(0,0,0,0.08)", padding: 4, borderRadius: 32 }}
          >
            {TAB_LABELS.map((label, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  style={{
                    background: isActive ? "#fff" : "transparent",
                    color: isActive ? "rgba(17,17,17,0.8)" : "rgba(17,17,17,0.52)",
                    fontFamily: "var(--font-poppins)",
                    fontWeight: 600,
                    fontSize: 16,
                    lineHeight: "30px",
                    padding: "6px 16px",
                    borderRadius: 32,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pill row (lg) — absolutely positioned at Figma top:355.76 */}
        <div
          className="hidden lg:flex items-center justify-center absolute"
          style={{
            top: 355.76,
            left: "50%",
            transform: "translateX(-50%)",
            gap: 4,
            background: "rgba(0,0,0,0.08)",
            padding: 4,
            borderRadius: 32,
          }}
        >
          {TAB_LABELS.map((label, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveIndex(i)}
                style={{
                  background: isActive ? "#fff" : "transparent",
                  color: isActive ? "rgba(17,17,17,0.8)" : "rgba(17,17,17,0.52)",
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: "30px",
                  padding: "6px 16px",
                  borderRadius: 32,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Designer + Photographer cursor pills */}
        <DesignerCursor />
        <PhotographerCursor />

        {/* Browser mock — pixel-positioned at lg, scaled-down stack on mobile */}
        <div className="hidden lg:block absolute" style={{ left: "50%", top: 475, transform: "translateX(-50%)" }}>
          <BrowserMock activeIndex={activeIndex} />
        </div>
        <div className="lg:hidden mt-8 px-4 flex justify-center overflow-hidden">
          <div style={{ transform: "scale(0.36)", transformOrigin: "top center", width: MOCK_W, height: MOCK_H * 0.36 }}>
            <BrowserMock activeIndex={activeIndex} />
          </div>
        </div>

        <div className="lg:hidden h-[40px]" aria-hidden />
      </div>
    </div>
  );
}
