import Image from "next/image";
import ListingPage from "@/components/listing/ListingPage";
import { getAllComparisonPages } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import type { ListingPageConfig } from "@/lib/listing-data";

export const revalidate = 60;

interface SanityComparisonListItem {
  _id: string;
  title?: string;
  slug?: string;
  competitor1Name?: string;
  competitor2Name?: string;
  thumbnail?: string;
  competitor1Logo?: string;
  competitor2Logo?: string;
}

const HERO = {
  heading: "How Superflow stacks up",
  subheading:
    "See how Superflow compares to other review and feedback tools - pricing, integrations, and where each one fits best.",
};

export const metadata = buildPageMetadata({
  title: "Collaboration Apps Comparisons by Superflow",
  description: HERO.subheading,
  path: "/comparisons",
  noBrandSuffix: true,
});

function LogoPair({
  c1Logo,
  c1Name,
  c2Logo,
  c2Name,
}: {
  c1Logo?: string;
  c1Name?: string;
  c2Logo?: string;
  c2Name?: string;
}) {
  const Item = ({ src, name }: { src?: string; name?: string }) =>
    src ? (
      <Image
        src={src}
        alt={name ?? ""}
        width={48}
        height={48}
        className="object-contain"
      />
    ) : (
      <span
        className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-md bg-black/5 text-[14px] font-semibold uppercase text-black/60"
      >
        {name?.slice(0, 1) ?? "?"}
      </span>
    );

  return (
    <div className="flex items-center gap-3">
      <Item src={c1Logo} name={c1Name} />
      <span
        className="text-[14px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: "rgba(17,17,17,0.4)" }}
      >
        vs
      </span>
      <Item src={c2Logo} name={c2Name} />
    </div>
  );
}

export default async function ComparisonIndexPage() {
  const docs = (await getAllComparisonPages()) as SanityComparisonListItem[];

  const config: ListingPageConfig = {
    hero: HERO,
    grid: {
      variant: "icon-centered",
      items: docs
        .filter((d) => d.slug)
        .map((d) => ({
          title:
            d.competitor1Name && d.competitor2Name
              ? `${d.competitor1Name} vs ${d.competitor2Name}`
              : d.title ?? d.slug!,
          iconNode: (
            <LogoPair
              c1Logo={d.competitor1Logo}
              c1Name={d.competitor1Name}
              c2Logo={d.competitor2Logo}
              c2Name={d.competitor2Name}
            />
          ),
          href: `/comparisons/${d.slug}`,
        })),
    },
  };

  return (
    <>
      <PageJsonLd
        name="Collaboration Apps Comparisons by Superflow"
        description={HERO.subheading}
        path="/comparisons"
        trail={[{ name: "Comparisons", url: `${SITE_URL}/comparisons` }]}
      />
      <JsonLd
        id="ld-comparisons-itemlist"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Comparison Pages",
          url: `${SITE_URL}/comparisons`,
          numberOfItems: docs.filter((d) => d.slug).length,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: docs
            .filter((d) => d.slug)
            .map((d, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/comparisons/${d.slug}`,
              name:
                d.competitor1Name && d.competitor2Name
                  ? `${d.competitor1Name} vs ${d.competitor2Name}`
                  : d.title ?? d.slug,
            })),
        }}
      />
      <ListingPage config={config} />
    </>
  );
}
