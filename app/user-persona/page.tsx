import ListingPage from "@/components/listing/ListingPage";
import { titleCase } from "@/lib/user-persona/format";
import { getAllUserPersonaPages } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import type { ListingPageConfig } from "@/lib/listing-data";

export const revalidate = 60;

interface SanityUserPersonaListItem {
  _id: string;
  title?: string;
  slug?: string;
  role?: string;
  description?: string;
  thumbnail?: string;
  icon?: string;
}

const HERO = {
  heading: "Built for every role on the team",
  subheading:
    "Whoever owns the work, Superflow keeps feedback grounded in the asset itself — fewer threads, faster approvals, no context lost between tools.",
};

export const metadata = buildPageMetadata({
  title: "See if Superflow is right for you and your team",
  description: "Are you a designer, developer, PM? Superflow integrates seamlessly for everyone.",
  path: "/user-persona",
  noBrandSuffix: true,
});

export default async function UserPersonaIndexPage() {
  const docs = (await getAllUserPersonaPages()) as SanityUserPersonaListItem[];

  const config: ListingPageConfig = {
    hero: HERO,
    grid: {
      variant: "icon-vertical",
      items: docs
        .filter((d) => d.slug)
        .map((d) => {
          const label = titleCase(d.role ?? d.title ?? d.slug!);
          return {
            title: label,
            subtitle: d.description,
            icon: d.icon,
            href: `/user-persona/${d.slug}`,
          };
        }),
    },
  };

  return (
    <>
      <PageJsonLd
        name="See if Superflow is right for you and your team"
        description="Are you a designer, developer, PM? Superflow integrates seamlessly for everyone."
        path="/user-persona"
        trail={[{ name: "User Persona", url: `${SITE_URL}/user-persona` }]}
      />
      <ListingPage config={config} iconInvert />
    </>
  );
}
