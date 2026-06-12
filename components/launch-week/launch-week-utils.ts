import type { LaunchWeek, LaunchWeekFeature } from "@/sanity/lib/queries";

export const FEATURE_REVEAL_NOTE = "Features will be revealed on first day";
export const COMING_SOON_LABEL = "Coming soon";
export const EARLY_ACCESS_EMAIL = "emma@usesuperflow.com";
export const LAUNCH_WEEK_TAGLINE =
    "3 new features for usesuperflow.com revealed every week.";
export const DEFAULT_SUBTITLE = "Experience the latest from Superflow";

export const LAUNCH_WEEK_FAQS = [
    {
        q: "What is Superflow?",
        a: "Superflow is a collaboration platform for agencies & marketers to review, proof and deliver creative assets fast.",
    },
    {
        q: "What formats are supported in Superflow?",
        a: "Superflow supports all types of websites, videos, Lottie animations, images and PDFs.",
    },
    {
        q: "Does Superflow offer a free plan?",
        a: "Superflow offers a free 10-day trial to new users, no credit card needed. During the trial period, you get full access to all features.",
    },
];

// Launch weeks flip over at Pacific midnight; ISR (revalidate = 60) picks the
// change up within a minute regardless of where the server runs.
const LAUNCH_TIMEZONE = "America/Los_Angeles";

/**
 * Today's date as a "YYYY-MM-DD" string in the launch timezone.
 * @returns ISO date string safe for lexicographic comparison.
 */
export function todayStr(): string {
    try {
        return new Intl.DateTimeFormat("en-CA", {
            timeZone: LAUNCH_TIMEZONE,
        }).format(new Date());
    } catch {
        return new Date().toISOString().slice(0, 10);
    }
}

/**
 * Parse a Sanity "YYYY-MM-DD" date at UTC midnight to avoid timezone
 * off-by-one shifts when formatting.
 * @param dateString - ISO date string from Sanity.
 * @returns Date pinned to UTC midnight.
 */
function parseUtcDate(dateString: string): Date {
    return new Date(`${dateString}T00:00:00Z`);
}

/**
 * Format a week's date range for the hero, e.g. "22 Jun - 26 Jun".
 * @param startDate - ISO start date.
 * @param endDate - ISO end date.
 * @returns Human-readable range label.
 */
export function formatHeroRange(startDate: string, endDate: string): string {
    try {
        const formatter = new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            timeZone: "UTC",
        });
        return `${formatter.format(parseUtcDate(startDate))} - ${formatter.format(parseUtcDate(endDate))}`;
    } catch {
        return `${startDate} - ${endDate}`;
    }
}

/**
 * Format a feature date for the timeline, e.g. "Jun 22".
 * @param dateString - ISO date string.
 * @returns Human-readable date label.
 */
export function formatTimelineDate(dateString: string): string {
    try {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
        }).format(parseUtcDate(dateString));
    } catch {
        return dateString;
    }
}

/**
 * Add days to an ISO date, e.g. ("2026-06-29", 2) → "2026-07-01".
 * @param dateString - ISO date string.
 * @param days - Number of days to add.
 * @returns ISO date string.
 */
export function addDays(dateString: string, days: number): string {
    try {
        const date = parseUtcDate(dateString);
        date.setUTCDate(date.getUTCDate() + days);
        return date.toISOString().slice(0, 10);
    } catch {
        return dateString;
    }
}

/**
 * Weekday name for a feature's day chip, e.g. "Monday".
 * @param dateString - ISO date string.
 * @returns Full weekday name.
 */
export function weekdayName(dateString: string): string {
    try {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            timeZone: "UTC",
        }).format(parseUtcDate(dateString));
    } catch {
        return dateString;
    }
}

/**
 * Pick the week the /launch-week hero should show: the ongoing week, else the
 * next upcoming one, else the most recent past week.
 * @param weeks - All launch weeks (any order).
 * @param today - "YYYY-MM-DD" in the launch timezone.
 * @returns The hero week, or null when there are no weeks.
 */
export function selectHeroWeek(
    weeks: LaunchWeek[],
    today: string,
): LaunchWeek | null {
    try {
        const sorted = [...weeks].sort((weekA, weekB) =>
            weekA.startDate.localeCompare(weekB.startDate),
        );
        const ongoing = sorted.find(
            (week) => week.startDate <= today && today <= week.endDate,
        );
        if (ongoing) return ongoing;
        const upcoming = sorted.find((week) => week.startDate > today);
        if (upcoming) return upcoming;
        return sorted[sorted.length - 1] ?? null;
    } catch {
        return weeks?.[0] ?? null;
    }
}

/**
 * Week-level reveal gate: the hero week and every week before it are fully
 * revealed; weeks after the hero week stay hidden.
 * @param week - Week to test.
 * @param heroWeek - Week currently selected for the hero.
 * @returns True when the week's feature names/images may be shown.
 */
export function isWeekRevealed(
    week: LaunchWeek,
    heroWeek: LaunchWeek | null,
): boolean {
    try {
        if (!heroWeek) return false;
        return week.startDate <= heroWeek.startDate;
    } catch {
        return false;
    }
}

export type { LaunchWeek, LaunchWeekFeature };
