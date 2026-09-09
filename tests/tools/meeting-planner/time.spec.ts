import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import {
  buildDay,
  calendarFile,
  dayStart,
  DEFAULT_PEOPLE,
  isWorking,
  localParts,
  meetingFits,
  timeLabel,
  parseState,
  type Participant,
} from "../../../lib/tools/meeting-planner/time";
import {
  createLocationSearch,
  type LocationCatalog,
} from "../../../lib/tools/meeting-planner/locations";

const person = (
  zone: string,
  changes: Partial<Participant> = {},
): Participant => ({ ...DEFAULT_PEOPLE[0], zone, ...changes });
const utc = (s: string) => Date.parse(s);

test("shared hours and the entire meeting duration are respected", () => {
  const day = buildDay("2026-09-09", DEFAULT_PEOPLE, 30);
  expect(day.overlapMinutes).toBe(60);
  expect(
    day.instants
      .filter((_, i) => day.fits[i])
      .map((t) => new Date(t).toISOString()),
  ).toEqual([
    "2026-09-09T16:00:00.000Z",
    "2026-09-09T16:15:00.000Z",
    "2026-09-09T16:30:00.000Z",
  ]);
  expect(buildDay("2026-09-09", DEFAULT_PEOPLE, 90).fits.some(Boolean)).toBe(
    false,
  );
});

test("spring-forward and fall-back have the right day lengths and distinct repeated hours", () => {
  const p = person("America/New_York", { days: [0, 1, 2, 3, 4, 5, 6] });
  const spring = buildDay("2026-03-08", [p], 30);
  const fall = buildDay("2026-11-01", [p], 30);
  expect(spring.instants).toHaveLength(92);
  expect(fall.instants).toHaveLength(100);
  expect(new Set(fall.instants).size).toBe(100);
  expect(
    spring.instants.some((t) => localParts(t, p.zone).minute === 120),
  ).toBe(false);
});

test("overlap changes during the US/UK daylight-saving mismatch", () => {
  expect(buildDay("2026-03-10", DEFAULT_PEOPLE, 30).overlapMinutes).toBe(120);
  expect(buildDay("2026-03-31", DEFAULT_PEOPLE, 30).overlapMinutes).toBe(60);
});

test("half-hour and quarter-hour zones keep minute precision", () => {
  expect(timeLabel(utc("2026-09-09T00:15:00Z"), "UTC", false)).toBe("00:15");
  expect(dayStart("2026-09-09", "Asia/Kolkata")).toBe(
    utc("2026-09-08T18:30:00Z"),
  );
  expect(dayStart("2026-09-09", "Asia/Kathmandu")).toBe(
    utc("2026-09-08T18:15:00Z"),
  );
  const day = buildDay(
    "2026-09-09",
    [person("Asia/Kolkata"), person("Asia/Kathmandu")],
    30,
  );
  expect(
    new Date(day.instants[day.fits.findIndex(Boolean)]).toISOString(),
  ).toBe("2026-09-09T03:30:00.000Z");
  expect(day.overlapMinutes).toBe(525);
});

test("overnight shifts use the previous working day after midnight", () => {
  const p = person("UTC", { start: 1320, end: 360, days: [5] });
  expect(isWorking(utc("2026-09-12T02:00:00Z"), p)).toBe(true);
  expect(isWorking(utc("2026-09-11T02:00:00Z"), p)).toBe(false);
  expect(meetingFits(utc("2026-09-12T05:45:00Z"), 30, p)).toBe(false);
});

test("local weekends and international date-line dates are checked separately", () => {
  const p = person("Pacific/Kiritimati");
  expect(localParts(utc("2026-09-11T20:00:00Z"), p.zone).date).toBe(
    "2026-09-12",
  );
  expect(isWorking(utc("2026-09-11T20:00:00Z"), p)).toBe(false);
  expect(buildDay("2026-09-12", DEFAULT_PEOPLE, 30).overlapMinutes).toBe(0);
});

test("meetings may cross the reference midnight and skipped dates stay empty", () => {
  const p = person("UTC", { start: 1320, end: 120, days: [1, 2, 3, 4, 5] });
  const day = buildDay("2026-09-11", [p], 60);
  expect(day.fits.at(-1)).toBe(true);
  expect(
    buildDay("2011-12-30", [person("Pacific/Apia")], 30).instants,
  ).toHaveLength(0);
});

test("half-hour daylight-saving transitions and no working days", () => {
  const lordHowe = person("Australia/Lord_Howe");
  expect(buildDay("2026-10-04", [lordHowe], 30).instants).toHaveLength(94);
  expect(
    buildDay("2026-09-09", [person("UTC", { days: [] })], 30).fits.some(
      Boolean,
    ),
  ).toBe(false);
});

test("shared plans reject malformed data and invalid selections", () => {
  const state = {
    version: 1,
    people: DEFAULT_PEOPLE,
    date: "2026-09-09",
    duration: 30,
    selected: null,
    hour12: true,
  };
  expect(parseState(JSON.stringify(state))).toEqual(state);
  for (const value of [
    { ...state, date: "2026-02-31" },
    { ...state, people: [] },
    { ...state, people: [...DEFAULT_PEOPLE, DEFAULT_PEOPLE[0]] },
    { ...state, duration: -1 },
    { ...state, people: [person("Not/AZone")] },
    { ...state, people: [person("UTC", { start: 17 })] },
  ])
    expect(parseState(JSON.stringify(value))).toBeNull();
  expect(
    parseState(JSON.stringify({ ...state, selected: 0 }))?.selected,
  ).toBeNull();
  expect(parseState("bad json")).toBeNull();
});

test("calendar export uses UTC instants and RFC-compliant escaped, folded lines", () => {
  const text = calendarFile(
    [
      person("Asia/Kolkata", {
        name: "City, with; punctuation and a long name",
      }),
    ],
    utc("2026-09-09T16:00:00Z"),
    30,
    true,
  );
  expect(text).toContain("DTSTART:20260909T160000Z\r\nDTEND:20260909T163000Z");
  expect(text).toContain("City\\, with\\;");
  expect(
    text.split("\r\n").every((line) => Buffer.byteLength(line) <= 75),
  ).toBe(true);
  expect(text).toContain("END:VCALENDAR\r\n");
});

test("country searches offer all regions and city aliases find actual places", () => {
  const catalog = JSON.parse(
    readFileSync("public/data/meeting-locations.json", "utf8"),
  ) as LocationCatalog;
  const search = createLocationSearch(catalog);
  expect(catalog.cities.length).toBeGreaterThan(30000);
  expect(search("India")[0]).toMatchObject({
    name: "India",
    zone: "Asia/Kolkata",
    id: "country-IN",
  });
  const usa = search("USA");
  expect(new Set(usa.map((p) => p.zone)).size).toBe(
    catalog.countries.US.zones.length,
  );
  expect(usa.some((p) => p.zone === "America/Los_Angeles")).toBe(true);
  expect(usa.some((p) => p.zone === "America/New_York")).toBe(true);
  expect(search("San Francisco")[0].id).toBe("5391959");
  expect(search("NYC")[0].id).toBe("5128581");
  expect(search("Bangalore")[0].countryCode).toBe("IN");
  expect(search("Kathmandu")[0].zone).toBe("Asia/Kathmandu");
  expect(search("zzzznonexistent")).toEqual([]);
});
