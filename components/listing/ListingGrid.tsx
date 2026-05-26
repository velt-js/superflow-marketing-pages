import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type ListingVariant =
  | "icon-vertical"
  | "text-only"
  | "icon-horizontal"
  | "icon-centered";

export interface ListingItem {
  title: string;
  subtitle?: string;
  icon?: string;
  iconNode?: ReactNode;
  href: string;
  cta?: string;
}

export interface ListingGridProps {
  variant: ListingVariant;
  items: ListingItem[];
  defaultCta?: string;
  // Inverts raster/SVG icons (e.g. Framer use-case icons whose strokes
  // ship light/white). Off by default so brand logos (integrations) stay
  // full-color.
  iconInvert?: boolean;
  // Optional header rendered inside the same section as the grid, so the
  // caller doesn't have to stack two sections and double up section-pad-y.
  header?: ReactNode;
  // Override the outer section's vertical padding (defaults to the global
  // `section-pad-y` 120px helper).
  sectionClassName?: string;
}

const COLS: Record<ListingVariant, string> = {
  "icon-vertical": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "text-only": "grid-cols-1 sm:grid-cols-2",
  "icon-horizontal": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "icon-centered": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
};

const MIN_HEIGHT: Record<ListingVariant, string> = {
  "icon-vertical": "min-h-[232px]",
  "text-only": "min-h-[232px]",
  "icon-horizontal": "min-h-[155px]",
  "icon-centered": "min-h-[180px]",
};

function CardIcon({
  item,
  size,
  invert,
}: {
  item: ListingItem;
  size: number;
  invert?: boolean;
}) {
  if (item.iconNode) {
    return <div style={{ width: size, height: size }}>{item.iconNode}</div>;
  }
  if (item.icon) {
    return (
      <div className="relative shrink-0 overflow-hidden rounded-[8px]" style={{ width: size, height: size }}>
        <Image
          src={item.icon}
          alt=""
          width={size}
          height={size}
          className="object-contain"
          style={invert ? { filter: "invert(1)" } : undefined}
        />
      </div>
    );
  }
  return null;
}

function LearnMoreButton({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute bottom-[10px] left-[10px] right-[10px] opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
      <div
        className="flex items-center justify-center rounded-[8px] bg-[#1e1e1e] px-4 py-2 text-white"
        style={{
          fontFamily: "var(--font-urbanist)",
          fontSize: 14,
          lineHeight: "1.2",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function CardShell({
  children,
  href,
  cta,
}: {
  children: ReactNode;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-[#f7f7f7] bg-[#f7f7f7] px-6 py-6 text-center transition-colors hover:border-[#111] hover:bg-white lg:px-8"
    >
      {children}
      <LearnMoreButton label={cta} />
    </Link>
  );
}

function CardIconVertical({ item, cta, invert }: { item: ListingItem; cta: string; invert?: boolean }) {
  return (
    <CardShell href={item.href} cta={cta}>
      <div className="flex flex-col items-center gap-4 transition-transform duration-200 group-hover:-translate-y-2">
        <CardIcon item={item} size={28} invert={invert} />
        <div className="flex flex-col gap-1 text-center" style={{ letterSpacing: "-0.03em" }}>
          <p
            className="text-black"
            style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: 16, lineHeight: 1.3 }}
          >
            {item.title}
          </p>
          {item.subtitle && (
            <p
              className="text-black"
              style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: 16, lineHeight: 1.3 }}
            >
              {item.subtitle}
            </p>
          )}
        </div>
      </div>
    </CardShell>
  );
}

function CardTextOnly({ item, cta }: { item: ListingItem; cta: string }) {
  return (
    <CardShell href={item.href} cta={cta}>
      <div className="flex max-w-[340px] flex-col items-center gap-1 text-center transition-transform duration-200 group-hover:-translate-y-2">
        <p
          className="text-black"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            fontSize: 16,
            lineHeight: 1.3,
            letterSpacing: "-0.03em",
          }}
        >
          {item.title}
        </p>
        {item.subtitle && (
          <p
            className="text-black"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 400,
              fontSize: 14,
              lineHeight: 1.3,
              letterSpacing: "-0.03em",
            }}
          >
            {item.subtitle}
          </p>
        )}
      </div>
    </CardShell>
  );
}

function CardIconHorizontal({ item, cta, invert }: { item: ListingItem; cta: string; invert?: boolean }) {
  return (
    <CardShell href={item.href} cta={cta}>
      <div className="flex items-center justify-center gap-3 transition-transform duration-200 group-hover:-translate-y-2">
        <CardIcon item={item} size={32} invert={invert} />
        <p
          className="text-black"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            fontSize: 16,
            lineHeight: 1.3,
            letterSpacing: "-0.03em",
          }}
        >
          {item.title}
        </p>
      </div>
    </CardShell>
  );
}

function CardIconCentered({ item, cta, invert }: { item: ListingItem; cta: string; invert?: boolean }) {
  return (
    <CardShell href={item.href} cta={cta}>
      <div className="flex flex-col items-center gap-3 transition-transform duration-200 group-hover:-translate-y-2">
        <CardIcon item={item} size={40} invert={invert} />
        <p
          className="text-black"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            fontSize: 16,
            lineHeight: 1.3,
            letterSpacing: "-0.03em",
          }}
        >
          {item.title}
        </p>
      </div>
    </CardShell>
  );
}

function CardFor({
  variant,
  item,
  cta,
  invert,
}: {
  variant: ListingVariant;
  item: ListingItem;
  cta: string;
  invert?: boolean;
}) {
  switch (variant) {
    case "icon-vertical":
      return <CardIconVertical item={item} cta={cta} invert={invert} />;
    case "text-only":
      return <CardTextOnly item={item} cta={cta} />;
    case "icon-horizontal":
      return <CardIconHorizontal item={item} cta={cta} invert={invert} />;
    case "icon-centered":
      return <CardIconCentered item={item} cta={cta} invert={invert} />;
  }
}

export default function ListingGrid({
  variant,
  items,
  defaultCta = "Learn More",
  iconInvert,
  header,
  sectionClassName = "section-pad-y",
}: ListingGridProps) {
  return (
    <section className={`bg-white ${sectionClassName}`}>
      <div className="container-page">
        {header && <div className="mb-[40px] lg:mb-[56px]">{header}</div>}
        <div className={`grid gap-3 ${COLS[variant]}`}>
          {items.map((item) => (
            <div key={item.href} className={MIN_HEIGHT[variant]}>
              <div className="h-full [&>a]:h-full">
                <CardFor
                  variant={variant}
                  item={item}
                  cta={item.cta ?? defaultCta}
                  invert={iconInvert}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
