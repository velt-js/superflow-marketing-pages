import Image from "next/image";
import type { FeatureRowData } from "@/lib/detail-data";

export interface FeatureRowProps extends FeatureRowData {
  reverse?: boolean;
}

export default function FeatureRow({
  title,
  description,
  image,
  imageAlt = "",
  imageWidth = 560,
  imageHeight = 360,
  reverse = false,
}: FeatureRowProps) {
  return (
    <section className="bg-white py-[40px] lg:py-[60px]">
      <div className="container-page">
        <div
          className={`mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-[40px] lg:grid-cols-2 lg:gap-[80px] ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div className="flex w-full flex-col gap-[16px]">
            <h3
              className="font-semibold"
              style={{
                color: "#111",
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(24px, 3vw, 32px)",
                lineHeight: 1.25,
                letterSpacing: "-0.03em",
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 16,
                lineHeight: 1.6,
                color: "rgba(17,17,17,0.6)",
              }}
            >
              {description}
            </p>
          </div>

          <div
            className="relative w-full overflow-hidden rounded-[24px] border border-[#ececec] bg-[#fafafa]"
            style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
