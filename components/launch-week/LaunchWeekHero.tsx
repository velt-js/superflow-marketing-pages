import Link from "next/link";

import { Cursor } from "@/components/shared/Cursor";

export interface LaunchWeekHeroProps {
    dateRangeLabel?: string | null;
    title: string;
    subtitle?: string | null;
    /** Permalink to the week's own page — set on the rotating index hero. */
    titleHref?: string | null;
}

/** Dark hero with the launch-week dates, title and collaborative cursor decorations. */
export default function LaunchWeekHero({ dateRangeLabel, title, subtitle, titleHref }: LaunchWeekHeroProps) {
    return (
        <section className="relative w-full overflow-hidden rounded-b-[40px] bg-black pt-[140px] pb-[100px] lg:rounded-b-[80px] lg:pt-[170px] lg:pb-[120px]">
            <div className="container-page relative flex flex-col items-center gap-[20px] text-center">
                {dateRangeLabel && (
                    <p
                        style={{
                            fontFamily: "var(--font-poppins)",
                            color: "rgba(255,255,255,0.52)",
                            fontSize: 16,
                            lineHeight: "32px",
                        }}
                    >
                        {dateRangeLabel}
                    </p>
                )}
                <h1
                    className="text-white font-semibold"
                    style={{
                        fontFamily: "var(--font-poppins)",
                        fontSize: "clamp(40px, 6.5vw, 60px)",
                        lineHeight: 1.3,
                        letterSpacing: "-2.7px",
                    }}
                >
                    {titleHref ? (
                        <Link href={titleHref} className="hover:underline">
                            {title}
                        </Link>
                    ) : (
                        title
                    )}
                </h1>
                {subtitle && (
                    <p
                        style={{
                            fontFamily: "var(--font-poppins)",
                            color: "rgba(255,255,255,0.52)",
                            fontSize: 16,
                            lineHeight: "32px",
                        }}
                    >
                        {subtitle}
                    </p>
                )}

                <Cursor
                    text="Photographer"
                    color="var(--color-superflow-cyan)"
                    direction="right"
                    className="pointer-events-none hidden lg:block"
                    style={{ position: "absolute", left: "-72px", bottom: "-10px" }}
                />
                <Cursor
                    text="Designer"
                    color="var(--color-superflow-pink)"
                    direction="left"
                    className="pointer-events-none hidden lg:block"
                    style={{ position: "absolute", right: "-56px", bottom: "-50px" }}
                />
            </div>
        </section>
    );
}
