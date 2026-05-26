import Link from "next/link";

function PrivacyPolicyIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M25.4998 29.5474H9C7.80653 29.5474 6.66193 29.0822 5.81802 28.2542C4.97411 27.4263 4.5 26.3033 4.5 25.1323C4.5 23.9613 4.97411 22.8383 5.81802 22.0104C6.66193 21.1824 7.80653 20.7172 9 20.7172H25.4998C24.3063 20.7172 23.1617 21.1824 22.3178 22.0104C21.4739 22.8383 20.9998 23.9613 20.9998 25.1323C20.9998 26.3033 21.4739 27.4263 22.3178 28.2542C23.1617 29.0822 24.3063 29.5474 25.4998 29.5474ZM25.4998 29.5474H27C28.1935 29.5474 29.3381 29.0822 30.182 28.2542C31.0259 27.4263 31.5 26.3033 31.5 25.1323V8.94385C31.5001 8.55729 31.4226 8.1745 31.2719 7.81734C31.1211 7.46018 30.9002 7.13565 30.6216 6.86227C30.3431 6.5889 30.0123 6.37205 29.6484 6.2241C29.2844 6.07615 28.8942 6 28.5002 6H13.5C13.106 6 12.7159 6.07615 12.3519 6.2241C11.9879 6.37205 11.6572 6.5889 11.3786 6.86227C11.1 7.13565 10.8791 7.46018 10.7284 7.81734C10.5777 8.1745 10.5001 8.55729 10.5002 8.94385V20.7172"
        stroke="#FD90FF"
        strokeWidth="2.57155"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RegulatoryIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <path
        d="M10.4989 15.0002H14.9989V10.5002L9.74908 5.24977C11.4286 4.44767 13.3154 4.18598 15.1498 4.50074C16.9842 4.8155 18.6759 5.69122 19.9919 7.00732C21.3079 8.32342 22.1835 10.0152 22.4982 11.8496C22.8129 13.684 22.5511 15.5708 21.7489 17.2502L30.7489 26.2502C31.0443 26.5457 31.2787 26.8965 31.4386 27.2825C31.5985 27.6686 31.6808 28.0824 31.6808 28.5002C31.6808 28.9181 31.5985 29.3319 31.4386 29.7179C31.2787 30.104 31.0443 30.4548 30.7489 30.7502C30.4534 31.0457 30.1026 31.2801 29.7165 31.44C29.3305 31.5999 28.9167 31.6822 28.4989 31.6822C28.081 31.6822 27.6672 31.5999 27.2812 31.44C26.8951 31.2801 26.5443 31.0457 26.2489 30.7502L17.2489 21.7502C15.5694 22.5523 13.6825 22.814 11.8481 22.4993C10.0137 22.1845 8.32207 21.3088 7.00604 19.9927C5.69002 18.6766 4.81439 16.9849 4.49973 15.1505C4.18508 13.316 4.44688 11.4292 5.24908 9.74978L10.4989 15.0002Z"
        stroke="#7392FF"
        strokeWidth="2.59615"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const HEADING_GRADIENT =
  "linear-gradient(90deg, rgb(82, 224, 255) 0%, rgb(41, 148, 255) 18%, rgb(0, 71, 255) 36%, rgb(80, 81, 255) 49%, rgb(161, 91, 255) 61%, rgb(214, 97, 255) 70%, rgb(255, 108, 178) 100%)";

export default function DataPrivacy() {
  return (
    <section className="py-[80px] lg:py-[120px]" style={{ background: "#000" }}>
      <div className="container-page max-w-[1080px] flex flex-col items-center gap-[52px]">
        <div className="flex flex-col items-center gap-[16px] max-w-[1000px] w-full">
          <h2
            className="flex flex-wrap items-baseline justify-center gap-x-[12px] text-center"
            style={{
              fontFamily: "var(--font-urbanist)",
              fontWeight: 600,
              fontSize: "clamp(36px, 4.8vw, 52px)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#fff" }}>Data</span>
            <span
              style={{
                backgroundImage: HEADING_GRADIENT,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Privacy
            </span>
          </h2>
          <p
            className="text-center max-w-[800px]"
            style={{
              fontFamily: "var(--font-urbanist)",
              fontWeight: 400,
              fontSize: "clamp(18px, 2vw, 24px)",
              lineHeight: 1.5,
              color: "#fff",
              opacity: 0.6,
            }}
          >
            At Superflow, data privacy is a first-class priority—we strive to be trustworthy stewards of all sensitive data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full max-w-[1000px]">
          <div
            className="rounded-[24px] p-[32px] flex flex-col items-center gap-[32px] min-h-[216px]"
            style={{ background: "#0d0d0d" }}
          >
            <div className="flex items-center justify-center h-[36px]">
              <PrivacyPolicyIcon />
            </div>
            <div className="flex flex-col items-center gap-[7px] w-full">
              <h3
                className="text-center text-white"
                style={{
                  fontFamily: "var(--font-urbanist)",
                  fontWeight: 600,
                  fontSize: 20,
                  lineHeight: "32px",
                }}
              >
                Privacy Policy
              </h3>
              <p
                className="text-center text-white"
                style={{
                  fontFamily: "var(--font-urbanist)",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "22.4px",
                  opacity: 0.75,
                }}
              >
                View{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-white transition-colors"
                >
                  Superflow&rsquo;s Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div
            className="rounded-[24px] p-[32px] flex flex-col items-center gap-[32px] min-h-[216px]"
            style={{ background: "#0d0d0d" }}
          >
            <div className="flex items-center justify-center h-[36px]">
              <RegulatoryIcon />
            </div>
            <div className="flex flex-col items-center gap-[8px] w-full">
              <h3
                className="text-center text-white"
                style={{
                  fontFamily: "var(--font-urbanist)",
                  fontWeight: 600,
                  fontSize: 20,
                  lineHeight: "32px",
                }}
              >
                Regulatory Compliance
              </h3>
              <p
                className="text-center text-white"
                style={{
                  fontFamily: "var(--font-urbanist)",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "22.4px",
                  opacity: 0.75,
                }}
              >
                Superflow evaluates updates to regulatory and emerging frameworks continuously to evolve our program.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
