import AgencyCard from "./AgencyCard";
import type { RelatedAgenciesBlock } from "@/lib/directory/agencies";

/**
 * Internal-link block shown at the bottom of an agency detail page, so
 * every profile is reachable from more than one path (its category
 * listing plus this block) instead of being an orphan the crawler only
 * finds once.
 *
 * Renders nothing when the block has no agencies - happens for a record
 * with no country-mates and no category-mates, which is expected while
 * the dataset is small.
 *
 * @param props - Component props.
 * @param props.block - The heading + agencies computed by
 *                       `getRelatedAgencies`.
 */
export default function RelatedAgencies({ block }: { block: RelatedAgenciesBlock }) {
  try {
    if (!block?.agencies || block.agencies.length === 0) return null;

    return (
      <section className="bg-white pb-[80px] lg:pb-[120px]">
        <div className="container-page">
          <h2
            className="mb-[24px] text-black"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: "-0.03em",
            }}
          >
            {block.heading}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {block.agencies.map((agency) => (
              <AgencyCard key={agency?.slug ?? agency?.profileUrl} agency={agency} />
            ))}
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
