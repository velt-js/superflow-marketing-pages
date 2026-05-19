import Image from "next/image";

export default function EliminateRedundant() {
  return (
    <section className="bg-white pt-[120px] pb-[80px]">
      <div className="container-page flex flex-col items-center gap-[52px]">
        <div className="flex flex-col items-center gap-[8px]">
          <h2
            className="text-black text-center font-semibold tracking-[-0.03em]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(36px, 4vw, 52px)",
              lineHeight: "1.2",
            }}
          >
            Eliminate
            <br />
            Redundant Tools.
          </h2>
          <h2
            className="text-center font-semibold tracking-[-0.03em]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(36px, 4vw, 52px)",
              lineHeight: "1.2",
              backgroundImage: "linear-gradient(90deg, #ff7162 0%, #ffa96b 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            No more &quot;busy&quot; work
          </h2>
        </div>
        <div className="w-[507px] max-w-full h-[52px] relative">
          <Image
            src="/images/sections/eliminate-avatars.png"
            alt=""
            fill
            sizes="507px"
            className="object-contain"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
