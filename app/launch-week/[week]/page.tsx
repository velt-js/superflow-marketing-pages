import { notFound } from "next/navigation";

import LaunchWeekPageContent from "@/components/launch-week/LaunchWeekPageContent";
import {
    LAUNCH_WEEK_TAGLINE,
    formatHeroRange,
    todayStr,
} from "@/components/launch-week/launch-week-utils";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { SITE_URL } from "@/app/_seo/schema";
import {
    getAllLaunchWeekSlugs,
    getAllLaunchWeeks,
    getLaunchWeekBySlug,
} from "@/sanity/lib/queries";

export const revalidate = 60;

/**
 * Pre-generate a page per launch week slug.
 * @returns Route params for every launch week.
 */
export async function generateStaticParams() {
    const slugs = await getAllLaunchWeekSlugs();
    return slugs.map((week) => ({ week }));
}

/**
 * Build per-week metadata with a canonical /launch-week/[week] URL.
 * @param props - Route props with the async week param.
 * @returns Page metadata, or empty object for unknown weeks.
 */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ week: string }>;
}) {
    const { week } = await params;
    const weekDoc = await getLaunchWeekBySlug(week);
    if (!weekDoc) return {};
    return buildPageMetadata({
        title: weekDoc.title,
        description: `${LAUNCH_WEEK_TAGLINE} ${weekDoc.title} runs ${formatHeroRange(weekDoc.startDate, weekDoc.endDate)}.`,
        path: `/launch-week/${week}`,
    });
}

/** /launch-week/[week] — the launch-week layout scoped to a single week. */
export default async function LaunchWeekDetailPage({
    params,
}: {
    params: Promise<{ week: string }>;
}) {
    const { week } = await params;
    const allWeeks = await getAllLaunchWeeks();
    const weekDoc = allWeeks.find((candidate) => candidate.slug === week);

    if (!weekDoc) {
        notFound();
    }

    return (
        <LaunchWeekPageContent
            displayedWeek={weekDoc}
            allWeeks={allWeeks}
            today={todayStr()}
            path={`/launch-week/${week}`}
            pageName={`${weekDoc.title} | Superflow`}
            pageDescription={`${LAUNCH_WEEK_TAGLINE} ${weekDoc.title} runs ${formatHeroRange(weekDoc.startDate, weekDoc.endDate)}.`}
            trail={[
                { name: "Launch Week", url: `${SITE_URL}/launch-week` },
                { name: weekDoc.title, url: `${SITE_URL}/launch-week/${week}` },
            ]}
        />
    );
}
