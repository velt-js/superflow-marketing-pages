type Item = { title: string; body: string };

const DOS: Item[] = [
  { title: "Use Brand Kit", body: "Access our brand kit here to download the Superflow logo and spread the word of our new partnership." },
  { title: "Grow Awareness", body: "Place your affiliate links in blogs, YouTube videos, comparison blogs, social media posts etc." },
  { title: "Promote", body: "Talk about our new partnership on newsletter, social media and everywhere else!" },
];

const DONTS: Item[] = [
  { title: "Wrongful promotions", body: "Use your affiliate link on sites with adult or illegal content." },
  { title: "Not using brand kit", body: "Promote Superflow without our branding guidelines." },
  { title: "Unfair Tactics", body: "Use of fraudulent tactics & abusing the affiliate program." },
];

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0dcf82" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff5c5c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

function Column({
  title,
  items,
  icon,
  tint,
}: {
  title: string;
  items: Item[];
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <div
      className="rounded-[24px] p-6 lg:p-8 flex flex-col gap-5 w-full"
      style={{ background: tint }}
    >
      <h3
        style={{
          fontFamily: "var(--font-poppins)",
          color: "#111",
          fontSize: 22,
          fontWeight: 600,
          lineHeight: "34px",
        }}
      >
        {title}
      </h3>
      <ul className="flex flex-col gap-4">
        {items.map((it) => (
          <li key={it.title} className="flex items-start gap-3">
            <span className="shrink-0 mt-[2px]">{icon}</span>
            <div className="flex flex-col gap-1">
              <span
                style={{
                  fontFamily: "var(--font-poppins)",
                  color: "#111",
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: "24px",
                }}
              >
                {it.title}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-poppins)",
                  color: "rgba(17,17,17,0.6)",
                  fontSize: 14,
                  lineHeight: "22px",
                }}
              >
                {it.body}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DosAndDonts() {
  return (
    <section className="px-6 lg:px-12 pt-[80px] lg:pt-[120px] pb-[80px] lg:pb-[120px]">
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
          What after you
          <br />
          have joined Superflow?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Column title="Do’s" items={DOS} icon={<CheckIcon />} tint="#e8faf0" />
          <Column title="Don’ts" items={DONTS} icon={<XIcon />} tint="#fdecec" />
        </div>
      </div>
    </section>
  );
}
