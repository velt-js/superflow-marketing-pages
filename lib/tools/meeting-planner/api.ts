import { readFileSync } from "node:fs";
import path from "node:path";
import {
  asPlace,
  createLocationSearch,
  normalizeCityQuery,
  type LocationCatalog,
} from "./locations";
import {
  buildDay,
  hourValue,
  localParts,
  meetingCopyText,
  MINUTE,
  STEP,
  zoneLabel,
  type Participant,
  type Place,
  type PlannerState,
} from "./time";

// Server-only adapter. Both the API and the browser use the same location
// catalogue, named time zones, working-hours engine, and readable copy format.
let index: ReturnType<typeof createIndex> | undefined;
function createIndex() {
  const catalog = JSON.parse(
    readFileSync(
      path.join(process.cwd(), "public/data/meeting-locations.json"),
      "utf8",
    ),
  ) as LocationCatalog;
  const search = createLocationSearch(catalog);
  const byId = new Map<string, Place>(
    catalog.cities.map(([id, name, code, region, zone]) => [
      id,
      {
        id,
        name,
        countryCode: code,
        country: catalog.countries[code].name,
        region,
        zone,
      },
    ]),
  );
  return { catalog, search, byId };
}

export class PlannerInputError extends Error {
  constructor(
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

function resolveLocation(query: string): Place {
  const { search, byId, catalog } = (index ??= createIndex());
  const known = byId.get(query);
  if (known) return known;
  if (query.startsWith("country-") || query.startsWith("region-")) {
    const code = query.startsWith("country-")
      ? query.slice("country-".length)
      : Object.entries(catalog.countries).find(([, country]) =>
          country.zones.includes(query.slice("region-".length)),
        )?.[0];
    if (code && Object.hasOwn(catalog.countries, code)) {
      const found = search(code).find((place) => place.id === query);
      if (found) return asPlace(found);
    }
  }
  const clean = query.replace(/,/g, " ").replace(/\s+/g, " ").trim();
  const results = search(clean);
  if (results[0]?.id.startsWith("country-")) return asPlace(results[0]);
  // Country searches that offer multiple zones always require a choice.
  const countryChoices = results.some((place) => place.hint);
  const normalized = normalizeCityQuery(clean);
  const named = results.filter((place) => {
    const name = normalizeCityQuery(place.name);
    return normalized === name || normalized.startsWith(`${name} `);
  });
  const candidates = named.length ? named : results;
  if (!countryChoices && candidates.length === 1) return asPlace(candidates[0]);
  throw new PlannerInputError(
    results.length
      ? `Choose a more specific location for "${query}". Retry with one of the returned IDs, or include the city, region, and country.`
      : `No location found for "${query}". Try a city or country name.`,
    {
      code: results.length ? "ambiguous-location" : "location-not-found",
      query,
      choices: (countryChoices ? results : candidates).map(asPlace),
    },
  );
}

function integer(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  field: string,
) {
  const result = value === undefined ? fallback : value;
  if (
    typeof result !== "number" ||
    !Number.isInteger(result) ||
    result < min ||
    result > max
  )
    throw new PlannerInputError(
      `${field} must be an integer from ${min} to ${max}.`,
    );
  return result;
}

function workTime(value: unknown, fallback: string, field: string) {
  const raw = value === undefined ? fallback : value;
  if (typeof raw !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(raw))
    throw new PlannerInputError(`${field} must use 24-hour HH:mm format.`);
  const [hour, minute] = raw.split(":").map(Number);
  if (minute % STEP)
    throw new PlannerInputError(`${field} must use 15-minute increments.`);
  return hour * 60 + minute;
}

export function findMeetingTimes(raw: unknown, origin: string) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new PlannerInputError("Send a JSON object with locations and date.");
  const input = raw as Record<string, unknown>;
  if (
    !Array.isArray(input.locations) ||
    input.locations.length < 1 ||
    input.locations.length > 8 ||
    !input.locations.every(
      (q) => typeof q === "string" && q.trim().length > 0 && q.length <= 150,
    )
  )
    throw new PlannerInputError(
      "locations must be an array of 1 to 8 city names, country names, or returned location IDs (up to 150 characters each).",
    );
  const date = input.date;
  if (
    typeof date !== "string" ||
    !/^20\d{2}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
  )
    throw new PlannerInputError(
      "date must be a real YYYY-MM-DD date between 2000 and 2099, in the first location's time zone.",
    );
  const duration = integer(
    input.durationMinutes,
    30,
    STEP,
    1440,
    "durationMinutes",
  );
  if (duration % STEP)
    throw new PlannerInputError(
      "durationMinutes must use 15-minute increments.",
    );
  const limit = integer(input.limit, 10, 1, 20, "limit");
  const start = workTime(input.workStart, "09:00", "workStart");
  const end = workTime(input.workEnd, "18:00", "workEnd");
  if (start === end)
    throw new PlannerInputError(
      "workStart and workEnd must differ. An earlier end time represents an overnight shift.",
    );
  const daysRaw = input.workDays ?? "1,2,3,4,5";
  if (typeof daysRaw !== "string" || !/^[0-6](,[0-6]){0,6}$/.test(daysRaw))
    throw new PlannerInputError(
      "workDays must be comma-separated day numbers, from 0 (Sunday) to 6 (Saturday), e.g. 1,2,3,4,5.",
    );
  const days = [...new Set(daysRaw.split(",").map(Number))];
  const people: Participant[] = input.locations.map((q: string) => ({
    ...resolveLocation(q.trim()),
    start,
    end,
    days,
  }));
  if (new Set(people.map((p) => p.id)).size !== people.length)
    throw new PlannerInputError("Each location must be unique.");
  const day = buildDay(date, people, duration);
  const starts = day.instants.filter((_, i) => day.fits[i]);
  const range = (from: number, to: number) => ({
    startUtc: new Date(from).toISOString(),
    endUtc: new Date(to).toISOString(),
    localTimes: people.map((person) => {
      const local = (instant: number) => {
        const parts = localParts(instant, person.zone);
        return {
          date: parts.date,
          time: hourValue(parts.minute),
          utcOffset: zoneLabel(instant, person.zone),
        };
      };
      return {
        id: person.id,
        name: person.name,
        zone: person.zone,
        start: local(from),
        end: local(to),
      };
    }),
    copyText: meetingCopyText(people, from, (to - from) / MINUTE),
  });
  const plan: PlannerState = {
    version: 1,
    people,
    date,
    duration,
    selected: starts[0] ?? null,
    hour12: true,
  };
  const planUrl = new URL("/tools/meeting-planner", origin);
  planUrl.hash = `plan=${encodeURIComponent(JSON.stringify(plan))}`;
  return {
    ok: true,
    date,
    dateZone: people[0].zone,
    durationMinutes: duration,
    locations: people,
    overlapMinutes: day.overlapMinutes,
    overlapWindows: day.windows.map((window) =>
      range(window.start, window.end),
    ),
    totalAvailableStarts: starts.length,
    slots: starts
      .slice(0, limit)
      .map((instant) => range(instant, instant + duration * MINUTE)),
    hasMore: starts.length > limit,
    planUrl: planUrl.href,
    note: starts.length
      ? "Earliest matching starts, in 15-minute increments. The date is in the first location's time zone. Shared hours are clipped to that date; a meeting may end on the next date."
      : "No meeting of this length fits everyone's working hours on this date. Try another date, shorter duration, or different working hours.",
    availability:
      "Configured working hours only, with the same schedule applied in each location's local time. No calendar, holiday, or free/busy data. Open planUrl to edit each location's schedule separately. No meeting is booked.",
    attribution:
      "Location data: GeoNames, CC BY 4.0 (https://www.geonames.org/). Time-zone rules: runtime Intl/IANA data.",
  };
}
