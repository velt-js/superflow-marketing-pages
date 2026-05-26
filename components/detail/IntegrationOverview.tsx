import {
  PortableText as SanityPortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";
import { urlFor } from "@/sanity/imageUrl";
import type { IntegrationDoc, IntegrationStepDoc } from "@/lib/integration-types";

type ImageValue = {
  asset?: { _ref?: string; url?: string };
  alt?: string;
  caption?: string;
};

function renderBodyImage({ value }: { value: ImageValue }) {
  const src = value?.asset?._ref
    ? urlFor(value).width(1200).fit("max").auto("format").url()
    : value?.asset?.url || "";
  if (!src) return null;
  return (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={value.alt || ""} className="rounded-lg w-full" />
      {value.caption && (
        <figcaption className="text-sm text-[#111]/50 mt-2 text-center">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}

const lightComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p
        className="mb-3"
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 15,
          lineHeight: 1.65,
          color: "rgba(17,17,17,0.65)",
        }}
      >
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h3
        className="text-[#111] mt-6 mb-2"
        style={{
          fontFamily: "var(--font-poppins)",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4
        className="text-[#111] mt-4 mb-2"
        style={{
          fontFamily: "var(--font-poppins)",
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#6366F1] pl-4 my-4 italic text-[#111]/70">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 14,
          lineHeight: 1.6,
          color: "rgba(17,17,17,0.65)",
        }}
      >
        {children}
      </li>
    ),
    number: ({ children }) => (
      <li
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 14,
          lineHeight: 1.6,
          color: "rgba(17,17,17,0.65)",
        }}
      >
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-[#111]">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="bg-black/5 px-1.5 py-0.5 rounded text-sm font-mono text-[#111]">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="text-[#6366F1] hover:underline"
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel={
          value?.href?.startsWith("http") ? "noopener noreferrer" : undefined
        }
      >
        {children}
      </a>
    ),
  },
  types: {
    image: renderBodyImage,
    integrationBodyImage: renderBodyImage,
  },
};

function StepRow({ step, index }: { step: IntegrationStepDoc; index: number }) {
  return (
    <div className="flex items-start gap-[18px]">
      <span
        className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full"
        style={{
          background: "#F4F2FF",
          color: "#6366F1",
          fontFamily: "var(--font-poppins)",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex flex-1 flex-col gap-[10px]">
        <p
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            fontSize: 16,
            color: "#111",
            letterSpacing: "-0.01em",
          }}
        >
          {step.title}
        </p>
        {step.body && step.body.length > 0 && (
          <div>
            <SanityPortableText
              value={step.body as PortableTextBlock[]}
              components={lightComponents}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntegrationOverview({ doc }: { doc: IntegrationDoc }) {
  const appName = doc.appName || doc.title;
  const steps = doc.steps ?? [];
  return (
    <section className="bg-white pt-[80px] pb-[120px] lg:pt-[120px] lg:pb-[160px] rounded-b-[32px] lg:rounded-b-[80px]">
      <div className="container-page">
        <div className="mx-auto flex max-w-[720px] flex-col gap-[64px]">
          {doc.overview && doc.overview.length > 0 && (
            <div className="flex flex-col gap-[16px]">
              <h2
                className="text-[#111]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: "clamp(24px, 3vw, 32px)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                }}
              >
                An Overview
              </h2>
              <div>
                <SanityPortableText
                  value={doc.overview as PortableTextBlock[]}
                  components={lightComponents}
                />
              </div>
            </div>
          )}

          {steps.length > 0 && (
            <div className="flex flex-col gap-[28px]">
              <div className="flex flex-col gap-[8px]">
                <h2
                  className="text-[#111]"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontWeight: 600,
                    fontSize: "clamp(24px, 3vw, 32px)",
                    lineHeight: 1.25,
                    letterSpacing: "-0.02em",
                  }}
                >
                  How does it work?
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "rgba(17,17,17,0.6)",
                  }}
                >
                  Superflow integration with {appName} works very seamlessly
                </p>
              </div>

              <div className="flex flex-col gap-[28px]">
                {steps.map((step, i) => (
                  <StepRow key={step.title} step={step} index={i} />
                ))}
              </div>

              <div className="flex items-center gap-[10px]">
                <span
                  className="flex h-[20px] w-[20px] items-center justify-center rounded-full"
                  style={{ background: "rgba(34,197,94,0.15)" }}
                  aria-hidden="true"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.2L4.8 8.5L9.5 3.5"
                      stroke="#22C55E"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#22C55E",
                  }}
                >
                  {appName} Connected Successfully!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
