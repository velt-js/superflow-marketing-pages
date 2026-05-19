"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is Superflow?",
    a: "Superflow is a collaboration platform that lets creative teams review and approve assets — images, videos, PDFs, websites, Lottie — in one place, with comments, approvals, and integrations to your existing stack.",
  },
  {
    q: "What formats are supported in Superflow?",
    a: "Websites, video, Lottie animations, PDFs, images, and more. New formats are added regularly based on customer requests.",
  },
  {
    q: "Does Superflow offer a free plan?",
    a: "Yes — you can get started for free with no credit card required. Upgrade when your team grows.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="container-page flex flex-col lg:flex-row items-start justify-between gap-12 max-w-[1000px] mx-auto">
      <div className="flex flex-col justify-between gap-8 lg:h-[360px]">
        <h2
          className="font-semibold tracking-[-1.2px] text-white"
          style={{ fontFamily: "var(--font-poppins)", fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: "1.4" }}
        >
          Frequently
          <br />
          Asked Question
        </h2>
        <p className="text-[14px] leading-[28px] text-white/75">
          Got more questions?
          <br />
          You can{" "}
          <a href="#contact" className="underline" style={{ color: "rgba(174,171,255,0.9)" }}>
            Contact Us
          </a>{" "}
          or{" "}
          <a href="#demo" className="underline" style={{ color: "rgba(174,171,255,0.9)" }}>
            Book a Demo
          </a>
        </p>
      </div>

      <div className="flex-1 w-full max-w-[520px]">
        {faqs.map((item, i) => (
          <div key={i} className="border-b border-white/10">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 py-8 text-left"
            >
              <span className="text-[18px] font-medium text-white leading-[21.6px]">
                {item.q}
              </span>
              <span
                className="w-6 h-6 flex items-center justify-center text-white opacity-50 transition-transform"
                style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            {open === i && (
              <p className="pb-8 text-[14px] leading-[24px] text-white/75">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
