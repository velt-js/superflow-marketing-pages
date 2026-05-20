export interface SectionHeadingProps {
  heading: string;
  highlight?: string;
  align?: "center" | "left";
  size?: "md" | "lg";
}

export default function SectionHeading({
  heading,
  highlight,
  align = "center",
  size = "md",
}: SectionHeadingProps) {
  const fontSize =
    size === "lg" ? "clamp(36px, 5vw, 60px)" : "clamp(28px, 4vw, 44px)";
  return (
    <h2
      className={`font-semibold tracking-[-0.03em] ${align === "center" ? "text-center" : "text-left"}`}
      style={{
        color: "#111",
        fontFamily: "var(--font-poppins)",
        fontSize,
        lineHeight: 1.25,
      }}
    >
      {heading}
      {highlight && (
        <>
          <br />
          <span
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgb(45,154,255) 0%, rgb(132,128,255) 36%, rgb(255,107,196) 70%, rgb(255,173,97) 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {highlight}
          </span>
        </>
      )}
    </h2>
  );
}
