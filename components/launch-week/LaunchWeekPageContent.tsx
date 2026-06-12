import Nav from "@/components/home/Nav";
import DarkSection from "@/components/home/DarkSection";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { buildFaqPageSchema } from "@/app/_seo/schema";
import type { LaunchWeek } from "@/sanity/lib/queries";

import LaunchWeekHero from "./LaunchWeekHero";
import FeatureDayCards, { type FeatureDayCard } from "./FeatureDayCards";
import LaunchWeeksTimeline, { type TimelineWeek } from "./LaunchWeeksTimeline";
import {
    COMING_SOON_LABEL,
    DEFAULT_SUBTITLE,
    FEATURE_REVEAL_NOTE,
    LAUNCH_WEEK_FAQS,
    addDays,
    formatHeroRange,
    formatTimelineDate,
    isWeekRevealed,
    selectHeroWeek,
    weekdayName,
} from "./launch-week-utils";

const LAUNCH_WEEK_FAQ_SCHEMA = buildFaqPageSchema(
    LAUNCH_WEEK_FAQS.map(({ q, a }) => ({ question: q, answer: a })),
);

/**
 * "Coming soon" card placeholders for a not-yet-revealed week. Day chips use
 * the entered feature dates when present, else the every-other-day cadence
 * from the week's start date.
 * @param week - The hidden launch week.
 * @returns Three muted placeholder cards.
 */
function buildComingSoonCards(week: LaunchWeek): FeatureDayCard[] {
    const dates = week.features?.length
        ? week.features.map((feature) => feature.date)
        : [week.startDate, addDays(week.startDate, 2), addDays(week.startDate, 4)];
    return dates.map((date, index) => ({
        key: `coming-soon-${index}`,
        dayLabel: weekdayName(date),
        title: COMING_SOON_LABEL,
        muted: true,
    }));
}

export interface LaunchWeekPageContentProps {
    /** Week shown in the hero and feature cards; null renders the empty state. */
    displayedWeek: LaunchWeek | null;
    allWeeks: LaunchWeek[];
    /** "YYYY-MM-DD" in the launch timezone; drives week-level reveal gating. */
    today: string;
    path: string;
    pageName: string;
    pageDescription: string;
    trail: Array<{ name: string; url: string }>;
}

/** Shared composition for the /launch-week index and /launch-week/[week] pages. */
export default function LaunchWeekPageContent({
    displayedWeek,
    allWeeks,
    today,
    path,
    pageName,
    pageDescription,
    trail,
}: LaunchWeekPageContentProps) {
    const gatingWeek = selectHeroWeek(allWeeks, today);

    const displayedRevealed = displayedWeek
        ? isWeekRevealed(displayedWeek, gatingWeek)
        : false;
    const cards: FeatureDayCard[] = !displayedWeek
        ? []
        : displayedRevealed
          ? (displayedWeek.features ?? []).map((feature) => ({
                key: feature._key,
                dayLabel: weekdayName(feature.date),
                title: feature.title,
                image: feature.image,
                readMoreHref: feature.blogSlug ? `/blog/${feature.blogSlug}` : undefined,
                readMoreEnabled: feature.date <= today,
            }))
          : buildComingSoonCards(displayedWeek);

    const timelineWeeks: TimelineWeek[] = allWeeks.map((week) => {
        const revealed = isWeekRevealed(week, gatingWeek);
        const entries =
            revealed && week.features?.length
                ? week.features.map((feature) => ({
                      key: feature._key,
                      date: formatTimelineDate(feature.date),
                      title: feature.title,
                      upcoming: false,
                  }))
                : [
                      {
                          key: week._id,
                          date: formatTimelineDate(week.startDate),
                          title: FEATURE_REVEAL_NOTE,
                          upcoming: true,
                      },
                  ];
        return { slug: week.slug, name: week.title, entries };
    });

    const hasWhiteContent = cards.length > 0 || timelineWeeks.length > 0;

    return (
        <main>
            <PageJsonLd
                name={pageName}
                description={pageDescription}
                path={path}
                trail={trail}
            />
            <JsonLd id="ld-launch-week-faq" data={LAUNCH_WEEK_FAQ_SCHEMA} />
            <Nav />
            <LaunchWeekHero
                dateRangeLabel={
                    displayedWeek
                        ? formatHeroRange(displayedWeek.startDate, displayedWeek.endDate)
                        : null
                }
                title={displayedWeek?.title ?? "Launch Weeks"}
                subtitle={displayedWeek?.subtitle ?? DEFAULT_SUBTITLE}
                titleHref={
                    path === "/launch-week" && displayedWeek
                        ? `/launch-week/${displayedWeek.slug}`
                        : undefined
                }
            />
            {hasWhiteContent && (
                <div style={{ background: "#121212" }}>
                    <div className="flex flex-col gap-[200px] rounded-b-[40px] bg-white py-[90px] lg:gap-[180px] lg:rounded-b-[80px] lg:py-[110px]">
                        <FeatureDayCards cards={cards} />
                        <LaunchWeeksTimeline weeks={timelineWeeks} />
                    </div>
                </div>
            )}
            <DarkSection faqItems={LAUNCH_WEEK_FAQS} />
            <Footer />
            <IntercomButton />
        </main>
    );
}
