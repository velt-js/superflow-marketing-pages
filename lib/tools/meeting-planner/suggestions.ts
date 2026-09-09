import {
  isWorking,
  localParts,
  MINUTE,
  STEP,
  type buildDay,
  type Participant,
} from "./time";

/** Rank half-hour browser suggestions. The public API still returns strict work-hour fits. */
export function suggestMeetingTimes(
  day: ReturnType<typeof buildDay>,
  people: Participant[],
  limit = 3,
) {
  const candidates = day.instants
    .filter((_, i) => i % (30 / STEP) === 0)
    .map((start) => {
      const costs = people.map((person) => {
        let cost = 0;
        // Evaluate the entire meeting, including midnight, DST and quarter-hour offsets.
        for (let offset = 0; offset < 30; offset += STEP) {
          const instant = start + offset * MINUTE;
          if (isWorking(instant, person)) continue;
          const { minute, weekday } = localParts(instant, person.zone);
          const midpoint = minute + STEP / 2;
          let distance = 1440;
          if (person.start !== person.end) {
            for (const shiftDay of [-1, 0, 1]) {
              if (!person.days.includes((weekday + shiftDay + 7) % 7)) continue;
              const shiftStart = shiftDay * 1440 + person.start;
              const shiftEnd =
                shiftDay * 1440 +
                person.end +
                (person.end < person.start ? 1440 : 0);
              distance = Math.min(
                distance,
                Math.max(shiftStart - midpoint, midpoint - shiftEnd, 0),
              );
            }
          }
          // Small early/late compromises beat large ones. Protect sleep hours unless
          // the participant explicitly marked them as their working schedule.
          cost += (1 + distance / 30) ** 2;
          if (midpoint < 7 * 60 || midpoint >= 22 * 60) cost += 100;
        }
        return cost;
      });
      return {
        start,
        worst: Math.max(...costs),
        total: costs.reduce((a, b) => a + b, 0),
      };
    });
  // Minimize the biggest inconvenience first, so one city does not bear all of it.
  return candidates
    .sort((a, b) => a.worst - b.worst || a.total - b.total || a.start - b.start)
    .slice(0, limit)
    .map((candidate) => candidate.start);
}
