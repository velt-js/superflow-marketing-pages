import Image from "next/image";
import SectionHeading from "./SectionHeading";
import type { ShowcaseMediaData } from "@/lib/detail-data";

export default function ShowcaseMedia({
  heading,
  highlight,
  image,
  imageAlt = "",
  imageWidth = 1176,
  imageHeight = 700,
}: ShowcaseMediaData) {
  return (
    <section className="bg-white pt-[40px] pb-[80px] lg:pb-[120px]">
      <div className="container-page flex flex-col items-center gap-[48px]">
        <SectionHeading heading={heading} highlight={highlight} />

        <div
          className="relative mx-auto w-full max-w-[1200px] overflow-hidden rounded-[32px] lg:rounded-[48px]"
          style={{
            border: "4px solid rgba(0,0,0,0.06)",
            aspectRatio: `${imageWidth} / ${imageHeight}`,
          }}
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 1200px, 100vw"
            className="object-cover"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
