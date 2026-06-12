import Image from "next/image";
import Link from "next/link";

export interface FeatureDayCard {
    key: string;
    dayLabel: string;
    title: string;
    image?: string;
    muted?: boolean;
    readMoreHref?: string;
    readMoreEnabled?: boolean;
}

export interface FeatureDayCardsProps {
    cards: FeatureDayCard[];
}

/** White section with the three feature-of-the-day cards. */
export default function FeatureDayCards({ cards }: FeatureDayCardsProps) {
    if (cards.length === 0) return null;

    return (
        <section className="container-page flex flex-col items-center gap-[37px]">
            <div className="flex max-w-[840px] flex-col items-center gap-[8px] text-center">
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
                    3 new features revealed every week
                </h2>
                <p className="text-[16px] leading-[32px] text-black">
                    Every launch week we reveal three new feature. A new one every other day.
                </p>
            </div>

            <div className="grid w-full max-w-[1120px] gap-[13px] md:grid-cols-3">
                {cards.map((card) => (
                    <div
                        key={card.key}
                        className="overflow-hidden rounded-[28px] border-2 border-[rgba(66,133,244,0.16)]"
                    >
                        {card.image ? (
                            <div className="relative h-[241px] w-full overflow-hidden">
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    fill
                                    sizes="(min-width: 768px) 33vw, 100vw"
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-[241px] w-full bg-[#d9d9d9] opacity-30" />
                        )}
                        <div className="flex flex-col items-center gap-[24px] px-[30px] pt-[29px] pb-[34px]">
                            <span
                                className="rounded-[32px] bg-[rgba(66,133,244,0.08)] px-[12px] py-[8px] text-[16px] font-semibold uppercase tracking-[2.4px] text-[#4285f4]"
                                style={{ fontFamily: "var(--font-poppins)" }}
                            >
                                {card.dayLabel}
                            </span>
                            <p
                                className={`text-center text-[24px] font-medium tracking-[-0.72px] ${card.muted ? "opacity-35" : ""}`}
                                style={{
                                    fontFamily: "var(--font-poppins)",
                                    color: "var(--color-superflow-charcoal)",
                                }}
                            >
                                {card.title}
                            </p>
                            {card.readMoreEnabled && card.readMoreHref ? (
                                <Link
                                    href={card.readMoreHref}
                                    className="rounded-[32px] bg-black px-[24px] py-[12px] text-[16px] font-medium text-white transition-colors hover:bg-black/85"
                                    style={{ fontFamily: "var(--font-poppins)" }}
                                >
                                    Read more
                                </Link>
                            ) : (
                                <span
                                    className="cursor-not-allowed rounded-[32px] bg-black/[0.06] px-[24px] py-[12px] text-[16px] font-medium text-black/35"
                                    style={{ fontFamily: "var(--font-poppins)" }}
                                    title="Available on launch day"
                                >
                                    Read more
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
