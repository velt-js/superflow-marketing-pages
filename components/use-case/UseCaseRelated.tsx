import ListingGrid from "@/components/listing/ListingGrid";
import type { UseCaseRelatedItem } from "@/lib/use-case-types";

export default function UseCaseRelated({
  items,
}: {
  items: UseCaseRelatedItem[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <ListingGrid
      variant="icon-vertical"
      iconInvert
      defaultCta="Read more"
      sectionClassName="pt-[60px] pb-[100px] lg:pt-[80px] lg:pb-[140px]"
      items={items.map((item) => ({
        title: item.title,
        subtitle: item.description,
        icon: item.icon,
        href: item.href,
      }))}
      header={
        <h2
          className="mx-auto max-w-[820px] text-center text-[#111]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            fontSize: "clamp(28px, 3.6vw, 40px)",
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
          }}
        >
          Other ways in which{" "}
          <span style={{ color: "#6366F1" }}>Superflow can help</span>
        </h2>
      }
    />
  );
}
