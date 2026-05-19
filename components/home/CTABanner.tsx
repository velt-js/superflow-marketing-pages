import Image from "next/image";

export default function CTABanner() {
  return (
    <div className="container-page max-w-[1200px] mx-auto">
      <div
        className="relative mx-auto overflow-hidden rounded-[40px] lg:rounded-[80px] p-[12px]"
        style={{ border: "4px solid rgba(255,255,255,0.12)" }}
      >
        <div className="relative aspect-[1176/600] overflow-hidden rounded-[32px] lg:rounded-[70px]">
          <Image
            src="/images/sections/cta-orange-bg.png"
            alt=""
            fill
            className="object-cover"
          />
          <div className="relative z-10 flex flex-col items-center gap-[32px] pt-[120px] px-6 text-center">
            <div className="h-[52px] w-[52px] rounded-[26px] bg-white flex items-center justify-center">
              <Image src="/images/sections/cta-icon.png" alt="" width={25} height={22} />
            </div>
            <h2
              className="font-semibold tracking-[-1.5px] text-black"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(32px, 4.5vw, 50px)",
                lineHeight: 1.3,
              }}
            >
              Ship faster and make
              <br />
              more cool sh!t
            </h2>
            <a
              href="https://app.usesuperflow.com/signup?returnUrl=%2Fhome%3F_gl%3D1*16r2jus*_gcl_au*MzgzMzk1NDk4LjE3NzkxMjUzNjU."
              className="rounded-[32px] bg-black px-[24px] py-[16px] text-[18px] font-semibold capitalize tracking-[-0.54px] text-white"
            >
              Try Now for Free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
