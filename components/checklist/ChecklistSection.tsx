import { PortableTextRenderer } from "@/components/PortableText";
import type { ChecklistSection as Section } from "@/lib/checklist-types";

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 11L11 3M11 3H4.5M11 3V9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="2" height="2" rx="0.5" fill="#FFB300" />
      <rect x="2" y="7" width="2" height="2" rx="0.5" fill="#FFB300" />
      <rect x="2" y="11" width="2" height="2" rx="0.5" fill="#FFB300" />
      <rect x="6" y="3.5" width="8" height="1" rx="0.5" fill="rgba(255,179,0,0.7)" />
      <rect x="6" y="7.5" width="8" height="1" rx="0.5" fill="rgba(255,179,0,0.7)" />
      <rect x="6" y="11.5" width="8" height="1" rx="0.5" fill="rgba(255,179,0,0.7)" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 2.5h8a.5.5 0 0 1 .5.5v10.5l-4.5-3-4.5 3V3a.5.5 0 0 1 .5-.5z"
        stroke="#0DCF82"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckboxIcon() {
  return (
    <span
      aria-hidden="true"
      className="mt-[6px] inline-block h-[22px] w-[22px] flex-none rounded-[6px] border"
      style={{ borderColor: "rgba(17,17,17,0.2)" }}
    />
  );
}

export default function ChecklistSection({ section }: { section: Section }) {
  const tips = section.tips ?? [];
  if (!section.title && !section.description && tips.length === 0) return null;

  return (
    <section className="bg-white py-[60px] lg:py-[100px]">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-[40px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-[80px]">
          {/* LHS — sticky */}
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            {section.title && (
              <h2
                className="text-[#111]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 700,
                  fontSize: "clamp(28px, 3.6vw, 42px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                {section.title}
              </h2>
            )}
            {section.description && (
              <div
                className="mt-[20px] [&_p]:text-black/65! [&_p]:mb-4! [&_p]:leading-[1.6]! [&_strong]:text-black! [&_li]:text-black/65! [&_a]:text-[#625DF5]! [&_a]:underline"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 16,
                }}
              >
                <PortableTextRenderer value={section.description} />
              </div>
            )}
            {section.buttonText && section.buttonAction && (
              <a
                href={section.buttonAction}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-[28px] inline-flex items-center gap-[10px] rounded-[40px] border px-[22px] py-[12px] transition-colors hover:bg-black/5"
                style={{
                  borderColor: "rgba(98,93,245,0.55)",
                  color: "#111",
                  fontFamily: "var(--font-poppins)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {section.buttonText}
                <ArrowIcon />
              </a>
            )}

            <div className="mt-[48px] flex flex-col gap-[16px] lg:mt-[64px]">
              <div
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(17,17,17,0.4)",
                }}
              >
                Super Tips
              </div>
              <div
                className="flex items-center gap-[10px]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 14,
                  color: "rgba(17,17,17,0.7)",
                }}
              >
                <ListIcon />
                <span>Copy checklist &amp; Create tasks</span>
              </div>
              <div
                className="flex items-center gap-[10px]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 14,
                  color: "rgba(17,17,17,0.7)",
                }}
              >
                <BookmarkIcon />
                <span>Bookmark this tab (Ctrl+D)</span>
              </div>
            </div>
          </div>

          {/* RHS — scrolling tips */}
          <div className="flex flex-col">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="flex gap-[16px] py-[28px]"
                style={{
                  borderBottom:
                    i === tips.length - 1
                      ? "none"
                      : "1px solid rgba(17,17,17,0.08)",
                }}
              >
                <CheckboxIcon />
                <div className="flex-1">
                  {tip.title && (
                    <h3
                      className="text-[#111]"
                      style={{
                        fontFamily: "var(--font-poppins)",
                        fontWeight: 600,
                        fontSize: 20,
                        lineHeight: 1.3,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {tip.title}
                    </h3>
                  )}
                  {tip.description && (
                    <div
                      className="mt-[12px] [&_p]:text-black/65! [&_p]:mb-3! [&_p]:leading-[1.6]! [&_strong]:text-black! [&_li]:text-black/65! [&_a]:text-[#625DF5]! [&_a]:underline"
                      style={{
                        fontFamily: "var(--font-poppins)",
                        fontSize: 15,
                      }}
                    >
                      <PortableTextRenderer value={tip.description} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
