import Image from "next/image";
import Link from "next/link";
import { toInternalHref } from "@/lib/links";
import type {
  IntegrationDoc,
  OtherIntegrationItem,
} from "@/lib/integration-types";

export default function IntegrationHero({
  doc,
  otherIntegrations,
}: {
  doc: IntegrationDoc;
  otherIntegrations: OtherIntegrationItem[];
}) {
  const appName = doc.appName || doc.title;
  const subtitle = doc.metaDescription || "";
  const primaryHref = doc.linkToApp;
  const primaryLabel = `Install ${appName} App`;
  const secondaryHref = doc.installationVideoLink;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#010001] rounded-b-[32px] lg:rounded-b-[80px]"
    >
      <div className="container-page relative flex flex-col items-center gap-[44px] pt-[140px] pb-[80px] lg:pt-[180px] lg:pb-[120px]">
        <div className="flex max-w-[840px] flex-col items-center gap-[20px] text-center">
          {doc.appLogo && (
            <div className="relative h-[64px] w-[64px] overflow-hidden rounded-[16px] bg-white/5">
              <Image
                src={doc.appLogo}
                alt={`${appName} logo`}
                fill
                sizes="64px"
                className="object-contain p-2"
              />
            </div>
          )}
          <h1
            className="text-white"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "clamp(36px, 5.5vw, 60px)",
              lineHeight: 1.2,
              letterSpacing: "-0.045em",
            }}
          >
            {doc.title}
          </h1>
          {subtitle && (
            <p
              className="max-w-[560px]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 16,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-[12px]">
          {secondaryHref && (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-[8px] rounded-[32px] bg-[#1a1a1a] px-[24px] py-[12px] text-white transition-colors hover:bg-[#2a2a2a]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              <svg
                width="10"
                height="12"
                viewBox="0 0 10 12"
                fill="none"
                aria-hidden="true"
              >
                <path d="M0.5 0.5L9.5 6L0.5 11.5V0.5Z" fill="currentColor" />
              </svg>
              Watch Installation Video
            </a>
          )}
          {primaryHref && (
            <a
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-[32px] bg-white px-[24px] py-[12px] text-black transition-colors hover:bg-white/90"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {primaryLabel}
            </a>
          )}
        </div>

        {otherIntegrations.length > 0 && (
          <div className="flex flex-col items-center gap-[16px]">
            <p
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "-0.01em",
              }}
            >
              Other Integrations
            </p>
            <div className="flex flex-wrap items-center justify-center gap-[8px]">
              {otherIntegrations.map((item) => (
                <Link
                  key={item.href}
                  href={toInternalHref(item.href) ?? item.href}
                  aria-label={item.name}
                  className="flex h-[40px] w-[40px] items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  <div className="relative h-[20px] w-[20px] overflow-hidden">
                    <Image
                      src={item.icon}
                      alt=""
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
