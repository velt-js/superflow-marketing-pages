import Image from "next/image";

type Card = { icon: string; title: string; body: string };

const CARDS: Card[] = [
  {
    icon: "/images/affiliate/icon-money.svg",
    title: "Make Money",
    body: "Earn a revenue share upto 30% for every new paid user.",
  },
  {
    icon: "/images/affiliate/icon-pro.svg",
    title: "Become Superflow Pro",
    body: "Learn how to upsell and cross sell Superflow with your existing services.",
  },
  {
    icon: "/images/affiliate/icon-megaphone.svg",
    title: "Promote your business",
    body: "Participate in case studies, press releases and upcoming community events happening in London and San Francisco.",
  },
  {
    icon: "/images/affiliate/icon-key.svg",
    title: "Access to alpha features",
    body: "Try our latest features and product launches before our customers and become part of our early access program.",
  },
];

export default function WhyJoinUs() {
  return (
    <section className="px-6 lg:px-12 pt-[80px] lg:pt-[120px]">
      <div className="mx-auto max-w-[1000px] flex flex-col items-center gap-[40px]">
        <h2
          className="text-center font-semibold tracking-[-0.03em]"
          style={{
            fontFamily: "var(--font-poppins)",
            color: "#111",
            fontSize: "clamp(32px, 4.5vw, 44px)",
            lineHeight: "1.5",
          }}
        >
          Why you should join us
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="bg-[#f8f8fa] rounded-[24px] p-6 lg:p-8 flex flex-col gap-3"
            >
              <Image src={c.icon} alt="" width={32} height={32} />
              <h3
                style={{
                  fontFamily: "var(--font-poppins)",
                  color: "#111",
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: "30px",
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-poppins)",
                  color: "rgba(17,17,17,0.6)",
                  fontSize: 15,
                  lineHeight: "24px",
                }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
