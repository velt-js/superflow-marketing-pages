import Link from "next/link";

import { EARLY_ACCESS_EMAIL } from "./launch-week-utils";

export interface TimelineEntry {
    key: string;
    date: string;
    title: string;
    upcoming: boolean;
}

export interface TimelineWeek {
    slug: string;
    name: string;
    entries: TimelineEntry[];
}

export interface LaunchWeeksTimelineProps {
    weeks: TimelineWeek[];
}

/** Timeline of launch weeks with their reveal dates; week names link to each week's page. */
export default function LaunchWeeksTimeline({ weeks }: LaunchWeeksTimelineProps) {
    if (weeks.length === 0) return null;

    return (
        <section className="container-page">
            <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-[60px] lg:flex-row lg:gap-[138px]">
                <div className="flex flex-col gap-[60px] lg:sticky lg:top-[120px] lg:w-[320px] lg:shrink-0 lg:gap-[35vh] lg:self-start">
                    <h2
                        className="font-semibold"
                        style={{
                            fontFamily: "var(--font-poppins)",
                            color: "var(--color-superflow-charcoal)",
                            fontSize: "clamp(30px, 3.5vw, 44px)",
                            lineHeight: 1.5,
                            letterSpacing: "-1.8px",
                        }}
                    >
                        Launch Weeks
                    </h2>
                    <p className="max-w-[272px] text-[14px] leading-[1.2]" style={{ color: "rgba(78,78,78,0.52)" }}>
                        Agency owners can get early access. Mail us at{" "}
                        <a href={`mailto:${EARLY_ACCESS_EMAIL}`} className="underline">
                            {EARLY_ACCESS_EMAIL}
                        </a>
                    </p>
                </div>

                <div className="flex flex-1 flex-col gap-[52px]">
                    {weeks.map((week, weekIndex) => (
                        <div key={week.slug} className="flex flex-col gap-[52px]">
                            {weekIndex > 0 && <div className="h-px w-full bg-black/[0.08]" />}
                            <div
                                className="grid gap-[20px] sm:grid-cols-[max-content_1fr] sm:gap-[60px] lg:gap-[122px]"
                                style={{
                                    fontFamily: "var(--font-poppins)",
                                    color: "var(--color-superflow-charcoal)",
                                    letterSpacing: "-0.72px",
                                }}
                            >
                                <p className="text-[20px] font-medium whitespace-nowrap">
                                    <Link href={`/launch-week/${week.slug}`} className="hover:underline">
                                        {week.name}
                                    </Link>
                                </p>
                                <div className="flex flex-col gap-[47px]">
                                    {week.entries.map((entry) => (
                                        <div key={entry.key} className="flex flex-col gap-[12px]">
                                            <p className="text-[20px] opacity-50">{entry.date}</p>
                                            <p className={`text-[20px] font-medium ${entry.upcoming ? "opacity-35" : ""}`}>
                                                {entry.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
