import type { ReactNode } from "react";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalPage({
  title,
  lastUpdated,
  children,
}: LegalPageProps) {
  return (
    <main className="bg-white">
      <Nav />
      <section className="bg-white pt-[120px] pb-[80px] lg:pt-[160px] lg:pb-[120px]">
        <div className="container-page">
          <header className="mx-auto flex max-w-[760px] flex-col gap-[12px] pb-[40px]">
            <h1
              className="text-[#111]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 700,
                fontSize: "clamp(36px, 5vw, 56px)",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 14,
                color: "rgba(17,17,17,0.55)",
              }}
            >
              Last updated: {lastUpdated}
            </p>
          </header>

          <article className="legal-content mx-auto max-w-[760px]">
            {children}
          </article>
        </div>
      </section>
      <Footer />
      <IntercomButton />

      <style>{`
        .legal-content {
          font-family: var(--font-poppins);
          color: #111;
          font-size: 15px;
          line-height: 1.7;
        }
        .legal-content h2 {
          font-family: var(--font-poppins);
          font-weight: 700;
          font-size: clamp(20px, 2.4vw, 26px);
          line-height: 1.3;
          letter-spacing: -0.02em;
          color: #111;
          margin-top: 48px;
          margin-bottom: 16px;
        }
        .legal-content h2:first-child { margin-top: 0; }
        .legal-content h3 {
          font-family: var(--font-poppins);
          font-weight: 600;
          font-size: 18px;
          line-height: 1.4;
          letter-spacing: -0.01em;
          color: #111;
          margin-top: 32px;
          margin-bottom: 12px;
        }
        .legal-content h4 {
          font-family: var(--font-poppins);
          font-weight: 600;
          font-size: 16px;
          line-height: 1.4;
          color: #111;
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .legal-content p { margin: 12px 0; color: rgba(17,17,17,0.78); }
        .legal-content strong { color: #111; font-weight: 600; }
        .legal-content a { color: #4F46E5; text-decoration: underline; }
        .legal-content a:hover { color: #3b32c2; }
        .legal-content ul { margin: 12px 0; padding-left: 24px; color: rgba(17,17,17,0.78); }
        .legal-content ul li { list-style: disc; margin: 6px 0; }
        .legal-content hr {
          border: 0;
          border-top: 1px solid #ECECEC;
          margin: 40px 0;
        }
        .legal-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14px;
        }
        .legal-content th,
        .legal-content td {
          border: 1px solid #ECECEC;
          padding: 12px 14px;
          text-align: left;
          vertical-align: top;
          color: rgba(17,17,17,0.78);
        }
        .legal-content th {
          background: #FAFAFA;
          font-weight: 600;
          color: #111;
        }
        .legal-content blockquote {
          border-left: 3px solid #ECECEC;
          padding-left: 16px;
          margin: 16px 0;
          color: rgba(17,17,17,0.65);
        }
      `}</style>
    </main>
  );
}
