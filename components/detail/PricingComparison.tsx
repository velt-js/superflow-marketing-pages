import type { ReactNode } from "react";
import Image from "next/image";
import SectionHeading from "./SectionHeading";
import type { PricingComparisonData, PricingProduct } from "@/lib/detail-data";

const DOLLAR_ICON = (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <path
      d="M18 5v26M24 11.5c0-2.485-2.686-4.5-6-4.5s-6 2.015-6 4.5c0 2.485 2.686 4.5 6 4.5h0c3.314 0 6 2.015 6 4.5S21.314 25 18 25s-6-2.015-6-4.5"
      stroke="#22C55E"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SUPERFLOW_LOGO_DEFAULT = (
  <Image src="/images/nav/logo.svg" alt="Superflow" width={22} height={22} />
);

const COMPETITOR_LOGO_DEFAULT = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
      fill="#3B82F6"
    />
    <path d="M14 2v6h6" fill="#1E40AF" opacity="0.6" />
    <path d="M8 12h8M8 15h8M8 18h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

function ProductPricing({
  product,
  logoNode,
}: {
  product: PricingProduct;
  logoNode: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-[10px]">
        {product.logo ? (
          <div className="relative h-[22px] w-[22px] overflow-hidden">
            <Image src={product.logo} alt="" width={22} height={22} className="object-contain" />
          </div>
        ) : (
          logoNode
        )}
        <p
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 20,
            fontWeight: 600,
            color: "#111",
            letterSpacing: "-0.02em",
          }}
        >
          {product.name}
        </p>
      </div>

      <div className="rounded-[20px] border border-[#ECECEC] px-[20px] py-[28px] lg:px-[32px] lg:py-[40px]">
        <div
          className="grid gap-[24px]"
          style={{ gridTemplateColumns: `repeat(${product.tiers.length}, minmax(0, 1fr))` }}
        >
          {product.tiers.map((tier, i) => (
            <div
              key={`${product.name}-${i}-${tier.planName}`}
              className="flex flex-col items-center gap-[8px] text-center"
            >
              <span
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(17,17,17,0.55)",
                }}
              >
                {tier.planName}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 28,
                  fontWeight: 500,
                  color: "#111",
                  letterSpacing: "-0.02em",
                }}
              >
                {tier.price}
              </span>
              {tier.billing && (
                <span
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 14,
                    color: "rgba(17,17,17,0.5)",
                  }}
                >
                  {tier.billing}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PricingComparison({
  heading,
  highlight,
  description,
  products,
}: PricingComparisonData) {
  return (
    <section className="bg-white pt-[40px] pb-[80px] lg:pt-[60px] lg:pb-[120px]">
      <div className="container-page flex flex-col items-center gap-[48px]">
        <div className="flex flex-col items-center gap-[12px] text-center">
          {DOLLAR_ICON}
          <SectionHeading heading={heading} highlight={highlight} />
          {description && (
            <p
              className="max-w-[640px]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 15,
                lineHeight: 1.55,
                color: "rgba(17,17,17,0.65)",
              }}
            >
              {description}
            </p>
          )}
        </div>

        <div className="flex w-full max-w-[1080px] flex-col gap-[40px]">
          {products.map((product, i) => (
            <ProductPricing
              key={product.name}
              product={product}
              logoNode={i === 0 ? SUPERFLOW_LOGO_DEFAULT : COMPETITOR_LOGO_DEFAULT}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
