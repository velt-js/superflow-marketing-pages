import Image from "next/image";

const T = "/images/sections/testimonials";

type Testimonial = {
  name: string;
  role: string;
  headline: string;
  quote: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Nick Winter",
    role: "CEO @CodeCombat",
    headline: "It’s everything I’ve wanted",
    quote:
      "\"Superflow is the fastest, easiest way to iterate on our apps and marketing pages. The UX is easy, the tech is brilliant, the team is like lightning–it’s everything I’ve wanted and tried to build into our websites myself for 15 years. Finally!\"",
    avatar: `${T}/nick.jpg`,
  },
  {
    name: "DeAndre Holland",
    role: "Designer @Lenus",
    headline: "This is an investment that I’m so grateful for!",
    quote:
      "\"I’m incredibly grateful for this investment! Superflow with Webflow has made client feedback seamless. No more back and forth calls or messages, or using tools like Bubbles. It’s a great time-saver!\"",
    avatar: `${T}/deandre.jpg`,
  },
  {
    name: "Ana Wegbreit",
    role: "Head of BD @ECOM Dept",
    headline: "Saves our team a ton of time!",
    quote:
      "\"Thanks for creating a tool that helps us streamline communication with clients, it’s great to have everything in one place and saves our team a ton of time when collaborating.\"",
    avatar: `${T}/ana.png`,
  },
  {
    name: "Caleb",
    role: "Digital Designer @Calbie Creative",
    headline: "No more juggling multiple feedback",
    quote:
      "\"Superflow simplifies live website annotation, centralizing client comments for seamless organization. No more juggling multiple feedback channels. The responsive team welcomes suggestions, making it a truly collaborative experience. Highly recommended for an efficient and open-door workflow!\"",
    avatar: `${T}/caleb.png`,
  },
  {
    name: "Eric Lessman",
    role: "Co-founder & CEO @ Bluecap",
    headline: "Eliminating time wasted on vague instruction",
    quote:
      "\"Superflow streamlines front-end design coordination, eliminating time wasted on vague instructions. Clicking comments highlights specific website areas instantly. The receptive team implements feedback promptly, making collaboration effortless.\"",
    avatar: `${T}/eric.jpg`,
  },
  {
    name: "Manvi Agarwal",
    role: "Head of Content @Writesonic",
    headline: "Empowers non-tech users like me",
    quote:
      "\"Superflow revolutionized how my team works with Webflow. Streamlining collaboration and communication, it saves time, empowers non-tech users like me, and delivers high-quality results fast. I highly recommend it for simplified web development and enhanced collaboration.\"",
    avatar: `${T}/manvi.jpg`,
  },
  {
    name: "Simon Smallchua",
    role: "COO @ Harvey",
    headline: "Clear, Simple & Saves time for everyone involved",
    quote:
      "\"Collaborating on websites is transformed with Superflow. It saves time clarifying feedback, assigning tasks, and resolving actions in real-time. The intuitive interface, image/screen recording support, and responsive team make it our top choice. Efficient and user-friendly!\"",
    avatar: `${T}/simon-harvey.jpg`,
  },
  {
    name: "Riley Hennigh",
    role: "Product Designer @Headway.io",
    headline: "Everybody has loved how easy it is to get started",
    quote:
      "\"Superflow simplifies collaboration, enabling fast feedback from stakeholders during website design and development. Easy to use, loved by all, and seamlessly compatible with mobile, it’s a powerful tool for efficient project workflows.\"",
    avatar: `${T}/riley.png`,
  },
];

function Card({ t }: { t: Testimonial }) {
  return (
    <div
      className="bg-white rounded-[32px] shrink-0 flex flex-col w-[clamp(340px,38vw,520px)] p-[32px] gap-[20px]"
      style={{ border: "1px solid rgba(0,0,0,0.08)" }}
    >
      <div className="flex items-center gap-[12px]">
        <div className="w-[44px] h-[44px] rounded-full overflow-hidden shrink-0">
          <Image src={t.avatar} alt={t.name} width={88} height={88} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-[2px]">
          <span
            className="font-semibold text-[16px] leading-[24px]"
            style={{
              fontFamily: "var(--font-poppins)",
              backgroundImage: "linear-gradient(-83deg, rgb(252,153,255) 0%, rgb(181,34,113) 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {t.name}
          </span>
          <span
            className="text-[12px]"
            style={{
              fontFamily: "var(--font-poppins)",
              color: "#23222b",
              opacity: 0.4,
              letterSpacing: "-0.03em",
            }}
          >
            {t.role}
          </span>
        </div>
      </div>

      <p
        className="text-center font-semibold"
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 24,
          lineHeight: 1.4,
          letterSpacing: "-0.03em",
          color: "#23222b",
        }}
      >
        {t.headline}
      </p>

      <p
        className="text-center"
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 14,
          lineHeight: "1.5em",
          color: "#7c7a85",
          opacity: 0.9,
        }}
      >
        {t.quote}
      </p>
    </div>
  );
}

export default function CustomerLoveCarousel() {
  const items = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section className="bg-white px-6 lg:px-[30px] pb-[80px] rounded-b-[80px]">
      <div className="bg-[#f5f5f7] rounded-[60px] lg:rounded-[80px] pt-[80px] pb-[52px] flex flex-col items-center gap-[48px]">
        <div className="flex flex-col items-center gap-[16px] px-6 text-center">
          <p
            className="uppercase"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.15em",
              lineHeight: 1.5,
              color: "#23222b",
            }}
          >
            Loved by 150+ Agencies
          </p>
          <h2
            className="font-semibold"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(36px, 5vw, 60px)",
              lineHeight: 1.3,
              letterSpacing: "-1.8px",
              color: "#000",
            }}
          >
            ❤️&nbsp; Why Customers Love Us
          </h2>
        </div>

        <div className="marquee-viewport w-full">
          <div className="marquee-track gap-[20px]" style={{ ["--marquee-duration" as string]: "90s" }}>
            {items.map((t, i) => (
              <Card key={`${t.name}-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
