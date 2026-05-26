import Image from "next/image";

export interface TestimonialProps {
  name: string;
  role: string;
  headline: string;
  quote: string;
  avatar: string;
  nameGradient?: string;
  dark?: boolean;
}

export default function Testimonial({
  name,
  role,
  headline,
  quote,
  avatar,
  nameGradient = "linear-gradient(-83deg, rgb(252, 153, 255) 0%, rgb(181, 34, 113) 100%)",
  dark = false,
}: TestimonialProps) {
  return (
    <div className={`${dark ? "bg-[#010001]" : "bg-white"} px-[24px] lg:px-[52px] py-[24px] lg:py-[32px]`}>
      <div className="mx-auto max-w-[1000px]">
        <div className={`flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-[52px] rounded-[32px] px-6 lg:px-[52px] py-[32px] ${dark ? "bg-white/5" : "bg-white"}`}
          style={{ border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-[12px] shrink-0">
            <div className="h-[44px] w-[44px] rounded-full overflow-hidden">
              <Image src={avatar} alt={name} width={44} height={44} className="object-cover" />
            </div>
            <div className="flex flex-col gap-1">
              <span
                className="font-semibold text-[16px] leading-[24px]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  backgroundImage: nameGradient,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {name}
              </span>
              <span
                className="text-[14px] leading-[16.8px] tracking-[-0.42px]"
                style={{ color: dark ? "#fff" : "#23222b", opacity: dark ? 0.5 : 0.4, fontFamily: "var(--font-poppins)" }}
              >
                {role}
              </span>
            </div>
          </div>
          <div className={`hidden lg:block w-px self-stretch ${dark ? "bg-white/10" : "bg-[#ededed]"}`} />
          <div className="flex-1 flex flex-col gap-1">
            <p
              className="font-semibold text-[18px] leading-[27px] tracking-[-0.54px]"
              style={{ color: dark ? "#fff" : "#23222b", fontFamily: "var(--font-poppins)" }}
            >
              {headline}
            </p>
            <p className={`text-[14px] leading-[19.6px] opacity-75 ${dark ? "text-white" : "text-black"}`}>{quote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
