import Image from "next/image";

export default function EliminateRedundant() {
  return (
    <section className="bg-white pt-[120px] pb-[80px]">
      <div className="container-page flex flex-col items-center gap-[52px]">
        <div className="flex flex-col items-center gap-[8px]">
          <h2
            className="font-semibold tracking-[-1.8px] text-black text-center"
            style={{ fontFamily: "var(--font-poppins)", fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.2 }}
          >
            Eliminate Redundant Tools.
          </h2>
          <h2
            className="font-semibold tracking-[-1.8px] text-center"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(36px, 5vw, 60px)",
              lineHeight: 1.2,
              backgroundImage: "linear-gradient(90deg, #ff7162 0%, #ffa96b 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            No more &quot;busy&quot; work
          </h2>
        </div>
        <div className="w-full max-w-[507px]">
          <Image
            src="/images/sections/eliminate-avatars.png"
            alt="Team avatars"
            width={507}
            height={52}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
