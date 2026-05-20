interface Props {
  heading: string;
  subtitle?: string;
}

export default function CaseStudySectionHeading({ heading, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center gap-[8px] text-center w-full">
      <h2
        className="text-[#111] font-semibold"
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: "clamp(32px, 4.5vw, 44px)",
          lineHeight: 1.5,
          letterSpacing: "-1.8px",
        }}
      >
        {heading}
      </h2>
      {subtitle && (
        <p
          className="text-[16px] leading-[32px]"
          style={{
            fontFamily: "var(--font-poppins)",
            color: "rgba(78,78,78,0.52)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
