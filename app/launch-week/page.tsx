import LaunchWeekPageContent from "@/components/launch-week/LaunchWeekPageContent";
import {
    LAUNCH_WEEK_TAGLINE,
    formatHeroRange,
    selectHeroWeek,
    todayStr,
} from "@/components/launch-week/launch-week-utils";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { SITE_URL } from "@/app/_seo/schema";
import { getAllLaunchWeeks } from "@/sanity/lib/queries";

export const revalidate = 60;

/**
 * Build index metadata from the ongoing/upcoming launch week.
 * @returns Page metadata for /launch-week.
 */
export async function generateMetadata() {
    const weeks = await getAllLaunchWeeks();
    const heroWeek = selectHeroWeek(weeks, todayStr());
    const title = heroWeek?.title ?? "Launch Weeks";
    const description = heroWeek
        ? `${LAUNCH_WEEK_TAGLINE} ${heroWeek.title} runs ${formatHeroRange(heroWeek.startDate, heroWeek.endDate)}.`
        : LAUNCH_WEEK_TAGLINE;
    return buildPageMetadata({ title, description, path: "/launch-week" });
}

/** /launch-week index — hero shows the ongoing launch week, or the next upcoming one. */
export default async function LaunchWeekPage() {
    const weeks = await getAllLaunchWeeks();
    const today = todayStr();
    const heroWeek = selectHeroWeek(weeks, today);

    const pageName = `${heroWeek?.title ?? "Launch Weeks"} | Superflow`;
    const pageDescription = heroWeek
        ? `${LAUNCH_WEEK_TAGLINE} ${heroWeek.title} runs ${formatHeroRange(heroWeek.startDate, heroWeek.endDate)}.`
        : LAUNCH_WEEK_TAGLINE;

    return (
        <LaunchWeekPageContent
            displayedWeek={heroWeek}
            allWeeks={weeks}
            today={today}
            path="/launch-week"
            pageName={pageName}
            pageDescription={pageDescription}
            trail={[{ name: "Launch Week", url: `${SITE_URL}/launch-week` }]}
        />
    );
}
