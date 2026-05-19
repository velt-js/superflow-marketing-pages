import Image from "next/image";

export default function ConsistentCollab() {
  return (
    <section className="bg-white pt-[80px] overflow-hidden">
      <div className="container-page flex flex-col items-center gap-[24px]">
        <h2
          className="font-semibold tracking-[-1.8px] text-center"
          style={{
            color: "#23222b",
            fontFamily: "var(--font-poppins)",
            fontSize: "clamp(36px, 5vw, 60px)",
            lineHeight: 1.2,
          }}
        >
          Consistent collaboration
          <br />
          experience across
          <br />
          <span
            style={{
              backgroundImage: "linear-gradient(90deg, #85bdff 0%, #5748ff 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            all assets in one place
          </span>
        </h2>

        <a
          href="https://app.usesuperflow.com/signup?returnUrl=%2Fhome%3F_gl%3D1*16r2jus*_gcl_au*MzgzMzk1NDk4LjE3NzkxMjUzNjU."
          className="rounded-[32px] bg-black px-[32px] py-[16px] text-[16px] font-medium leading-[24px] text-white transition-colors hover:bg-black/80"
        >
          Try Now For Free
        </a>
      </div>

      <div className="relative mx-auto max-w-[1162px] mt-[40px] px-4">
        <Image
          src="/images/sections/consistent-collab.png"
          alt="Assets in one place"
          width={1162}
          height={254}
          className="w-full h-auto"
        />
      </div>
    </section>
  );
}
