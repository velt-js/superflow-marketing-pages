import Image from "next/image";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import DarkSection from "@/components/home/DarkSection";
import {
  criterionHeading,
  type SanityComparisonDoc,
} from "@/lib/sanity-adapters/comparisons";
import {
  labelForGroup,
  labelForRow,
} from "@/lib/comparisons/feature-table-labels";

function CompetitorLogo({ src, name, size = 28 }: { src?: string; name?: string; size?: number }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? ""}
        width={size}
        height={size}
        className="object-contain"
      />
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-md bg-black/5 text-[10px] font-semibold uppercase text-black/60"
      style={{ width: size, height: size }}
    >
      {name?.slice(0, 1) ?? "?"}
    </span>
  );
}

function ComparisonsHero({ doc }: { doc: SanityComparisonDoc }) {
  return (
    <section className="bg-[#010001] pt-[140px] pb-[60px] lg:pt-[180px] lg:pb-[80px]">
      <div className="container-page flex flex-col items-center gap-[40px] text-center">
        <h1
          className="max-w-[920px] text-white"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 700,
            fontSize: "clamp(36px, 5vw, 60px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {doc.title}
        </h1>
        <div className="flex items-center gap-[16px] text-white/85">
          <CompetitorLogo src={doc.competitor1Logo} name={doc.competitor1Name} size={32} />
          <span className="text-base font-semibold">{doc.competitor1Name}</span>
          <span className="text-white/30">vs</span>
          <CompetitorLogo src={doc.competitor2Logo} name={doc.competitor2Name} size={32} />
          <span className="text-base font-semibold">{doc.competitor2Name}</span>
        </div>
        {doc.heroImage && (
          <div className="relative mt-[24px] w-full max-w-[1080px] overflow-hidden rounded-[24px]">
            <Image
              src={doc.heroImage}
              alt={doc.title ?? ""}
              width={1080}
              height={600}
              className="h-auto w-full"
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ComparisonsOverview({ doc }: { doc: SanityComparisonDoc }) {
  if (!doc.overviewC1Text && !doc.overviewC2Text) return null;
  return (
    <section className="bg-white py-[60px] lg:py-[100px]">
      <div className="container-page">
        <div className="mx-auto grid max-w-[1080px] grid-cols-1 gap-[24px] lg:grid-cols-2 lg:gap-[32px]">
          {[
            { name: doc.competitor1Name, logo: doc.competitor1Logo, text: doc.overviewC1Text },
            { name: doc.competitor2Name, logo: doc.competitor2Logo, text: doc.overviewC2Text },
          ].map((col, i) => (
            <article
              key={i}
              className="rounded-[24px] border border-[#ECECEC] bg-white p-[28px] lg:p-[36px]"
            >
              <header className="flex items-center gap-[12px]">
                <CompetitorLogo src={col.logo} name={col.name} size={28} />
                <h3
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontWeight: 600,
                    fontSize: 22,
                    color: "#111",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {col.name}
                </h3>
              </header>
              {col.text && (
                <p
                  className="mt-[16px]"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "rgba(17,17,17,0.75)",
                  }}
                >
                  {col.text}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CriterionMedia({
  videoUrl,
  image,
  alt,
}: {
  videoUrl?: string;
  image?: string;
  alt?: string;
}) {
  if (videoUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-[16px]">
        <iframe
          src={videoUrl}
          title={alt}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    );
  }
  if (image) {
    return (
      <div className="w-full overflow-hidden rounded-[16px]">
        <Image
          src={image}
          alt={alt ?? ""}
          width={960}
          height={540}
          className="h-auto w-full"
        />
      </div>
    );
  }
  return null;
}

function ComparisonsNamedCriteria({ doc }: { doc: SanityComparisonDoc }) {
  if (!doc.namedCriteria?.length) return null;
  return (
    <section className="bg-white py-[40px] lg:py-[60px]">
      <div className="container-page flex flex-col gap-[40px]">
        {doc.namedCriteria.map((c) => (
          <article
            key={c._key}
            className="mx-auto w-full max-w-[1080px] rounded-[32px] border border-[#ECECEC] bg-white p-[28px] lg:p-[48px]"
          >
            <header className="mb-[24px] text-center">
              <h3
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#111",
                  letterSpacing: "-0.02em",
                }}
              >
                {criterionHeading(c.key)}
              </h3>
              {c.summary && (
                <p
                  className="mx-auto mt-[12px] max-w-[720px]"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "rgba(17,17,17,0.65)",
                  }}
                >
                  {c.summary}
                </p>
              )}
            </header>
            <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center gap-[10px]">
                  <CompetitorLogo
                    src={doc.competitor1Logo}
                    name={doc.competitor1Name}
                    size={22}
                  />
                  <span className="text-[15px] font-semibold text-[#111]">
                    {doc.competitor1Name}
                  </span>
                </div>
                <CriterionMedia videoUrl={c.c1Video} image={c.c1Image} alt={c.c1ImageAlt} />
              </div>
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center gap-[10px]">
                  <CompetitorLogo
                    src={doc.competitor2Logo}
                    name={doc.competitor2Name}
                    size={22}
                  />
                  <span className="text-[15px] font-semibold text-[#111]">
                    {doc.competitor2Name}
                  </span>
                </div>
                <CriterionMedia videoUrl={c.c2Video} image={c.c2Image} alt={c.c2ImageAlt} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Available({ value, text }: { value?: boolean; text?: string }) {
  return (
    <div className="flex flex-col items-center gap-[4px]">
      <span
        className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-full"
        style={{
          background: value ? "#22C55E" : "#F05252",
          color: "white",
          fontSize: 13,
          fontWeight: 600,
        }}
        aria-label={value ? "Available" : "Not available"}
      >
        {value ? "✓" : "✕"}
      </span>
      {text && (
        <span
          className="text-center text-xs"
          style={{ color: "rgba(17,17,17,0.55)" }}
        >
          {text}
        </span>
      )}
    </div>
  );
}

function ComparisonsFeatureTable({ doc }: { doc: SanityComparisonDoc }) {
  if (!doc.featureTable?.length) return null;
  return (
    <section className="bg-white py-[40px] lg:py-[60px]">
      <div className="container-page">
        <div className="mx-auto w-full max-w-[1080px] rounded-[28px] border border-[#ECECEC] bg-white px-[20px] py-[28px] lg:px-[48px] lg:py-[40px]">
          <div className="grid grid-cols-[2fr_1fr_1fr] items-center gap-[12px] border-b border-[#ECECEC] pb-[18px]">
            <span className="text-[18px] font-semibold text-[#111]">Feature</span>
            <div className="flex items-center justify-center gap-[8px]">
              <CompetitorLogo src={doc.competitor1Logo} name={doc.competitor1Name} size={22} />
              <span className="text-[15px] font-semibold text-[#111]">{doc.competitor1Name}</span>
            </div>
            <div className="flex items-center justify-center gap-[8px]">
              <CompetitorLogo src={doc.competitor2Logo} name={doc.competitor2Name} size={22} />
              <span className="text-[15px] font-semibold text-[#111]">{doc.competitor2Name}</span>
            </div>
          </div>
          {doc.featureTable.map((group) => (
            <div key={group._key} className="mt-[24px]">
              <h4
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: 16,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(17,17,17,0.55)",
                }}
              >
                {labelForGroup(group.key ?? "")}
              </h4>
              <div className="mt-[12px] flex flex-col divide-y divide-[#ECECEC]">
                {(group.rows ?? []).map((row) => (
                  <div
                    key={row._key}
                    className="grid grid-cols-[2fr_1fr_1fr] items-center gap-[12px] py-[14px]"
                  >
                    <span className="text-[15px] text-[#111]">
                      {labelForRow(group.key ?? "", row.rowKey ?? "")}
                    </span>
                    <Available value={row.c1Available} text={row.c1Text} />
                    <Available value={row.c2Available} text={row.c2Text} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HighlightCard({ block }: { block: { title?: string; subText?: string; image?: string; imageAlt?: string; videoUrl?: string } }) {
  return (
    <article className="flex flex-col gap-[16px] rounded-[24px] border border-[#ECECEC] bg-white p-[24px]">
      {block.videoUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-[16px]">
          <iframe
            src={block.videoUrl}
            title={block.title ?? ""}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ) : block.image ? (
        <div className="w-full overflow-hidden rounded-[16px]">
          <Image
            src={block.image}
            alt={block.imageAlt ?? ""}
            width={640}
            height={360}
            className="h-auto w-full"
          />
        </div>
      ) : null}
      {block.title && (
        <h4
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 700,
            fontSize: 22,
            color: "#111",
            letterSpacing: "-0.02em",
          }}
        >
          {block.title}
        </h4>
      )}
      {block.subText && (
        <p
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 15,
            lineHeight: 1.6,
            color: "rgba(17,17,17,0.7)",
          }}
        >
          {block.subText}
        </p>
      )}
    </article>
  );
}

function HighlightsSection({
  heading,
  blocks,
}: {
  heading: string;
  blocks?: { _key?: string; title?: string; subText?: string; image?: string; imageAlt?: string; videoUrl?: string }[];
}) {
  if (!blocks?.length) return null;
  return (
    <section className="bg-white py-[40px] lg:py-[60px]">
      <div className="container-page flex flex-col gap-[28px]">
        <h2
          className="mx-auto max-w-[820px] text-center text-[#111]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.02em",
          }}
        >
          {heading}
        </h2>
        <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 gap-[20px] md:grid-cols-3">
          {blocks.map((b) => (
            <HighlightCard key={b._key} block={b} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonsPricing({ doc }: { doc: SanityComparisonDoc }) {
  if (!doc.pricingTiers?.length) return null;
  const tiers = doc.pricingTiers;
  return (
    <section className="bg-white py-[40px] lg:py-[60px]">
      <div className="container-page">
        <h2
          className="mx-auto max-w-[820px] text-center text-[#111]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.02em",
          }}
        >
          Pricing comparison
        </h2>
        <div className="mx-auto mt-[36px] w-full max-w-[1080px] rounded-[24px] border border-[#ECECEC] bg-white p-[24px] lg:p-[36px]">
          <div className="grid grid-cols-1 gap-[32px] lg:grid-cols-2">
            {[
              { name: doc.competitor1Name, logo: doc.competitor1Logo, priceKey: "c1Price" as const, seatsKey: "c1Seats" as const },
              { name: doc.competitor2Name, logo: doc.competitor2Logo, priceKey: "c2Price" as const, seatsKey: "c2Seats" as const },
            ].map((side, sideIdx) => (
              <div key={sideIdx} className="flex flex-col gap-[16px]">
                <div className="flex items-center gap-[10px]">
                  <CompetitorLogo src={side.logo} name={side.name} size={22} />
                  <span className="text-[18px] font-semibold text-[#111]">{side.name}</span>
                </div>
                <div className="rounded-[20px] border border-[#ECECEC] p-[20px]">
                  <div
                    className="grid gap-[16px]"
                    style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}
                  >
                    {tiers.map((tier, i) => (
                      <div key={tier._key ?? i} className="flex flex-col items-center gap-[6px] text-center">
                        <span className="text-[24px] font-medium text-[#111]">
                          {tier[side.priceKey] ?? ""}
                        </span>
                        {tier[side.seatsKey] && (
                          <span className="text-[13px]" style={{ color: "rgba(17,17,17,0.55)" }}>
                            {tier[side.seatsKey]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonsReviews({ doc }: { doc: SanityComparisonDoc }) {
  if (!doc.reviews?.length) return null;
  return (
    <section className="bg-white py-[40px] lg:py-[60px]">
      <div className="container-page">
        <h2
          className="mx-auto max-w-[820px] text-center text-[#111]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.02em",
          }}
        >
          What users say
        </h2>
        <div className="mx-auto mt-[32px] grid w-full max-w-[1080px] grid-cols-1 gap-[20px] md:grid-cols-2">
          {doc.reviews.map((r) => (
            <article
              key={r._key}
              className="flex flex-col gap-[14px] rounded-[20px] border border-[#ECECEC] bg-white p-[24px]"
            >
              <div className="flex items-center gap-[12px]">
                {r.image && (
                  <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full bg-[#F4F4F6]">
                    <Image
                      src={r.image}
                      alt={r.imageAlt ?? r.name ?? ""}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-[#111]">{r.name}</span>
                  {r.rating && (
                    <span className="text-[12px]" style={{ color: "rgba(17,17,17,0.55)" }}>
                      {r.rating}
                    </span>
                  )}
                </div>
                <span
                  className="ml-auto rounded-full px-[10px] py-[4px] text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{
                    background: r.side === "c1" ? "rgba(34,197,94,0.12)" : "rgba(240,82,82,0.12)",
                    color: r.side === "c1" ? "#15803D" : "#B91C1C",
                  }}
                >
                  {r.side === "c1" ? doc.competitor1Name : doc.competitor2Name}
                </span>
              </div>
              {r.title && (
                <p className="text-[16px] font-semibold text-[#111]">{r.title}</p>
              )}
              {r.content && (
                <p
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "rgba(17,17,17,0.7)",
                  }}
                >
                  {r.content}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ComparisonsPage({ doc }: { doc: SanityComparisonDoc }) {
  return (
    <main>
      <Nav />
      <ComparisonsHero doc={doc} />
      <ComparisonsOverview doc={doc} />
      <ComparisonsNamedCriteria doc={doc} />
      <ComparisonsFeatureTable doc={doc} />
      <HighlightsSection
        heading={`Why Superflow stands out`}
        blocks={doc.superflowHighlights}
      />
      <ComparisonsPricing doc={doc} />
      <HighlightsSection
        heading={`Why teams pick ${doc.competitor2Name ?? "the alternative"}`}
        blocks={doc.alternativeHighlights}
      />
      <ComparisonsReviews doc={doc} />
      <DarkSection
        faqItems={(doc.faq ?? [])
          .filter((f) => f.question)
          .map((f) => ({ q: f.question!, a: f.answer ?? "" }))}
      />
      <Footer />
      <IntercomButton />
    </main>
  );
}
