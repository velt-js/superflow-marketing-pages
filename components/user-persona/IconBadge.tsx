import Image from "next/image";

// Persona icons from Framer are light outline glyphs that vanish on the
// light grey cards. Render them inside a dark circle with the glyph
// forced white so they read clearly. Falls back to the first letter of
// the label when no icon is present.
export default function IconBadge({
  src,
  name,
  size = 56,
}: {
  src?: string;
  name: string;
  size?: number;
}) {
  const glyph = Math.round(size * 0.5);
  if (!src) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full bg-[#1e1e1e] font-semibold text-white"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}
      >
        {name.slice(0, 1)}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-[#1e1e1e]"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt=""
        width={glyph}
        height={glyph}
        className="object-contain"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    </span>
  );
}
