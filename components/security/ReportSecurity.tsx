import Link from "next/link";
import { SECURITY_EMAIL } from "./security-contact";

// PSL reviewers look for this address on /security, so it stays visible as
// text, not only behind a button.

function ShieldIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M18 4.5L6.75 9V16.5C6.75 23.4 11.55 29.85 18 31.5C24.45 29.85 29.25 23.4 29.25 16.5V9L18 4.5Z"
        stroke="#52E0FF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 12V18.75" stroke="#52E0FF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 23.25H18.015" stroke="#52E0FF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function ReportSecurity() {
  return (
    <section
      id="report"
      aria-labelledby="report-heading"
      className="pb-[80px] lg:pb-[120px]"
      style={{ background: "#000" }}
    >
      <div className="container-page max-w-[1080px] flex flex-col items-center">
        <div
          className="rounded-[24px] p-[32px] lg:p-[48px] flex flex-col items-center gap-[24px] w-full max-w-[1000px]"
          style={{ background: "#0d0d0d" }}
        >
          <ShieldIcon />
          <h2
            id="report-heading"
            className="text-center text-white"
            style={{
              fontFamily: "var(--font-urbanist)",
              fontWeight: 600,
              fontSize: "clamp(24px, 3vw, 32px)",
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            Report Security Issues or Abuse
          </h2>
          <p
            className="text-center text-white max-w-[720px]"
            style={{
              fontFamily: "var(--font-urbanist)",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: 1.6,
              opacity: 0.75,
            }}
          >
            Security vulnerabilities, phishing, or any other abuse originating from{" "}
            <strong className="font-semibold whitespace-nowrap">usesuperflow.ai</strong> or{" "}
            <strong className="font-semibold whitespace-nowrap">*.superflow-preview.com</strong> can be
            reported to{" "}
            <a
              href={`mailto:${SECURITY_EMAIL}`}
              className="underline hover:text-white transition-colors"
              style={{ color: "rgb(82, 224, 255)" }}
            >
              {SECURITY_EMAIL}
            </a>
            . Please include the affected URL and any details that help us reproduce
            the issue. Our team reviews every report.
          </p>
          <a
            href={`mailto:${SECURITY_EMAIL}`}
            className="rounded-full px-[24px] py-[12px] text-black font-semibold transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-urbanist)", fontSize: 16, background: "#fff" }}
          >
            Email {SECURITY_EMAIL}
          </a>
          <p
            className="text-center text-white"
            style={{
              fontFamily: "var(--font-urbanist)",
              fontWeight: 400,
              fontSize: 14,
              lineHeight: "22.4px",
              opacity: 0.6,
            }}
          >
            Use of Superflow is governed by our{" "}
            <Link href="/terms" className="underline hover:text-white transition-colors">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
