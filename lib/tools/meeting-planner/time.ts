/** All comparisons use instants, never fixed UTC offsets or the host time zone. */
export const MINUTE = 60_000;
export const STEP = 15;

export type Place = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  zone: string;
};
export type Participant = Place & {
  start: number;
  end: number;
  days: number[];
};
export type PlannerState = {
  version: 1;
  people: Participant[];
  date: string;
  duration: number;
  selected: number | null;
  hour12: boolean;
};

const formatters = new Map<string, Intl.DateTimeFormat>();
export function localParts(instant: number, zone: string) {
  let formatter = formatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(zone, formatter);
  }
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((p) => [p.type, p.value]),
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  return {
    date,
    minute: Number(parts.hour) * 60 + Number(parts.minute),
    weekday: new Date(`${date}T12:00:00Z`).getUTCDay(),
  };
}

export function addDays(date: string, amount: number) {
  return new Date(Date.parse(`${date}T12:00:00Z`) + amount * 86400000)
    .toISOString()
    .slice(0, 10);
}

/** Find the first instant of a local calendar date, including midnight DST changes. */
export function dayStart(date: string, zone: string) {
  const nominal = Date.parse(`${date}T00:00:00Z`);
  let lo = nominal - 36 * 3600000;
  let hi = nominal + 36 * 3600000;
  while (hi - lo > MINUTE) {
    const mid = Math.floor((lo + hi) / (2 * MINUTE)) * MINUTE;
    if (localParts(mid, zone).date < date) lo = mid + MINUTE;
    else hi = mid;
  }
  return localParts(lo, zone).date >= date ? lo : hi;
}

export function isWorking(instant: number, person: Participant) {
  const { minute, weekday } = localParts(instant, person.zone);
  if (person.start === person.end) return false;
  if (person.start < person.end)
    return (
      person.days.includes(weekday) &&
      minute >= person.start &&
      minute < person.end
    );
  // After midnight belongs to the previous day's overnight shift.
  return (
    (minute >= person.start && person.days.includes(weekday)) ||
    (minute < person.end && person.days.includes((weekday + 6) % 7))
  );
}

export function meetingFits(
  instant: number,
  duration: number,
  person: Participant,
) {
  for (let minute = 0; minute < duration; minute += STEP)
    if (!isWorking(instant + minute * MINUTE, person)) return false;
  return true;
}

export function buildDay(
  date: string,
  people: Participant[],
  duration: number,
) {
  const start = dayStart(date, people[0].zone);
  const end = dayStart(addDays(date, 1), people[0].zone);
  const instants: number[] = [];
  for (let t = start; t < end; t += STEP * MINUTE) instants.push(t);
  const count = duration / STEP;
  const availability = people.map((person) =>
    Array.from({ length: instants.length + count }, (_, i) =>
      isWorking(start + i * STEP * MINUTE, person),
    ),
  );
  const shared = instants.map((_, i) => availability.every((row) => row[i]));
  const fits = instants.map((_, i) =>
    availability.every((row) => row.slice(i, i + count).every(Boolean)),
  );
  const windows: { start: number; end: number }[] = [];
  for (let i = 0; i < instants.length; i++) {
    if (!shared[i]) continue;
    const begin = instants[i];
    while (i + 1 < instants.length && shared[i + 1]) i++;
    windows.push({ start: begin, end: instants[i] + STEP * MINUTE });
  }
  return {
    start,
    end,
    instants,
    availability,
    shared,
    fits,
    windows,
    overlapMinutes: shared.filter(Boolean).length * STEP,
  };
}

function labelFormatter(
  key: string,
  options: Intl.DateTimeFormatOptions,
  locale = "en-US",
) {
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, formatter);
  }
  return formatter;
}

export function timeLabel(instant: number, zone: string, hour12 = true) {
  return labelFormatter(`time:${zone}:${hour12}`, {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
    hourCycle: hour12 ? "h12" : "h23",
  }).format(instant);
}
export function dateLabel(instant: number, zone: string) {
  return labelFormatter(`date:${zone}`, {
    timeZone: zone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(instant);
}
export function zoneLabel(instant: number, zone: string) {
  try {
    const f = labelFormatter(`offset:${zone}`, {
      timeZone: zone,
      timeZoneName: "shortOffset",
    });
    return (
      f
        .formatToParts(instant)
        .find((p) => p.type === "timeZoneName")
        ?.value.replace("GMT", "UTC") ?? zone
    );
  } catch {
    return zone;
  } // New IANA zones can precede the browser's bundled tzdb.
}
export function hourValue(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}
export function hoursLabel(minutes: number) {
  return (
    `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)}h` : ""}${minutes % 60 ? ` ${minutes % 60}m` : ""}`.trim() ||
    "0h"
  );
}

export const DEFAULT_PEOPLE: Participant[] = [
  {
    id: "5391959",
    name: "San Francisco",
    country: "United States",
    countryCode: "US",
    region: "California",
    zone: "America/Los_Angeles",
    start: 540,
    end: 1080,
    days: [1, 2, 3, 4, 5],
  },
  {
    id: "5128581",
    name: "New York City",
    country: "United States",
    countryCode: "US",
    region: "New York",
    zone: "America/New_York",
    start: 540,
    end: 1080,
    days: [1, 2, 3, 4, 5],
  },
  {
    id: "2643743",
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "England",
    zone: "Europe/London",
    start: 540,
    end: 1080,
    days: [1, 2, 3, 4, 5],
  },
];

/** URL fragments and localStorage are untrusted. Bound every value before use. */
export function parseState(raw: string): PlannerState | null {
  if (raw.length > 20000) return null;
  try {
    const value = JSON.parse(raw);
    if (
      value.version !== 1 ||
      !Array.isArray(value.people) ||
      value.people.length < 1 ||
      value.people.length > 8
    )
      return null;
    if (
      typeof value.date !== "string" ||
      !/^20\d{2}-\d{2}-\d{2}$/.test(value.date) ||
      new Date(`${value.date}T00:00:00Z`).toISOString().slice(0, 10) !==
        value.date
    )
      return null;
    if (
      !Number.isInteger(value.duration) ||
      value.duration < STEP ||
      value.duration > 1440 ||
      value.duration % STEP !== 0 ||
      typeof value.hour12 !== "boolean"
    )
      return null;
    const ids = new Set<string>();
    for (const person of value.people) {
      if (
        !person ||
        ["id", "name", "country", "countryCode", "region", "zone"].some(
          (key) => typeof person[key] !== "string" || person[key].length > 100,
        )
      )
        return null;
      if (!person.name || !person.id || ids.has(person.id)) return null;
      ids.add(person.id);
      new Intl.DateTimeFormat("en", { timeZone: person.zone });
      if (
        ![person.start, person.end].every(
          (n) => Number.isInteger(n) && n >= 0 && n < 1440 && n % STEP === 0,
        )
      )
        return null;
      if (
        !Array.isArray(person.days) ||
        person.days.length > 7 ||
        !person.days.every(
          (n: number) => Number.isInteger(n) && n >= 0 && n <= 6,
        )
      )
        return null;
    }
    const start = dayStart(value.date, value.people[0].zone);
    const end = dayStart(addDays(value.date, 1), value.people[0].zone);
    const selected =
      typeof value.selected === "number" &&
      Number.isFinite(value.selected) &&
      value.selected >= start &&
      value.selected < end &&
      (value.selected - start) % (STEP * MINUTE) === 0
        ? value.selected
        : null;
    return {
      version: 1,
      people: value.people,
      date: value.date,
      duration: value.duration,
      hour12: value.hour12,
      selected,
    };
  } catch {
    return null;
  }
}

function copyZoneLabel(instant: number, person: Participant, specific = false) {
  const name = (style: "shortGeneric" | "short", locale = "en-US") =>
    labelFormatter(
      `copy-zone:${person.zone}:${style}:${locale}`,
      { timeZone: person.zone, timeZoneName: style },
      locale,
    )
      .formatToParts(instant)
      .find((part) => part.type === "timeZoneName")?.value;
  const generic = name("shortGeneric");
  // CLDR supplies familiar generic names such as PT/ET without hardcoded offsets.
  if (!specific && generic && /^[A-Z]{2,5}$/.test(generic))
    return generic.toLowerCase();
  const locale = /^[A-Z]{2}$/.test(person.countryCode)
    ? `en-${person.countryCode}`
    : "en-US";
  const short = name("short", locale);
  if (short && /^[A-Z]{2,5}$/.test(short)) return short.toLowerCase();
  // Where English has no short abbreviation, keep a readable name, e.g. Japan time.
  return (
    specific
      ? zoneLabel(instant, person.zone)
      : (generic ?? zoneLabel(instant, person.zone))
  ).replace(/ Time$/, " time");
}

/** Compact text for pasting into a customer conversation, regardless of the grid's clock format. */
export function meetingCopyText(
  people: Participant[],
  instant: number,
  duration: number,
) {
  const end = instant + duration * MINUTE;
  const clock = (minute: number) => {
    const hour = Math.floor(minute / 60);
    const minutes = minute % 60;
    return `${hour % 12 || 12}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}${hour < 12 ? "a" : "p"}`;
  };
  return people
    .map((person) => {
      const startParts = localParts(instant, person.zone);
      const endParts = localParts(end, person.zone);
      const includeYear =
        startParts.date.slice(0, 4) !== endParts.date.slice(0, 4);
      const date = (at: number) =>
        labelFormatter(`copy-date:${person.zone}:${includeYear}`, {
          timeZone: person.zone,
          month: "short",
          day: "numeric",
          ...(includeYear ? ({ year: "numeric" } as const) : {}),
        })
          .formatToParts(at)
          .filter((part) => ["month", "day", "year"].includes(part.type))
          .map((part) => part.value)
          .join(" ");
      const startTime = `${date(instant)} ${clock(startParts.minute)}`;
      const endTime = `${startParts.date !== endParts.date ? `${date(end)} ` : ""}${clock(endParts.minute)}`;
      // A repeated clock hour is ambiguous without both standard/daylight labels.
      if (zoneLabel(instant, person.zone) !== zoneLabel(end, person.zone)) {
        return `${person.name}: ${startTime} ${copyZoneLabel(instant, person, true)} - ${endTime} ${copyZoneLabel(end, person, true)}`;
      }
      return `${person.name}: ${startTime} - ${endTime} ${copyZoneLabel(instant, person)}`;
    })
    .join("\n");
}

export function meetingSummary(
  people: Participant[],
  instant: number,
  duration: number,
  hour12: boolean,
) {
  return [
    `Customer meeting · ${duration} minutes`,
    ...people.map(
      (p) =>
        `${p.name}: ${dateLabel(instant, p.zone)}, ${timeLabel(instant, p.zone, hour12)} – ${dateLabel(instant + duration * MINUTE, p.zone)}, ${timeLabel(instant + duration * MINUTE, p.zone, hour12)} (${zoneLabel(instant, p.zone)}; ${p.zone})`,
    ),
  ].join("\n");
}

export function calendarFile(
  people: Participant[],
  instant: number,
  duration: number,
  hour12: boolean,
) {
  const stamp = (n: number) =>
    new Date(n)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  const escape = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  // RFC 5545 folds at 75 UTF-8 octets, not 75 JS code units.
  const fold = (line: string) => {
    const chunks: string[] = [];
    let chunk = "";
    let size = 0;
    for (const char of line) {
      const bytes = new TextEncoder().encode(char).length;
      if (size + bytes > 75) {
        chunks.push(chunk);
        chunk = " ";
        size = 1;
      }
      chunk += char;
      size += bytes;
    }
    return [...chunks, chunk].join("\r\n");
  };
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Superflow//Meeting Planner//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@usesuperflow.ai`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(instant)}`,
    `DTEND:${stamp(instant + duration * MINUTE)}`,
    "SUMMARY:Customer meeting",
    `DESCRIPTION:${escape(meetingSummary(people, instant, duration, hour12))}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(fold)
    .join("\r\n");
}
