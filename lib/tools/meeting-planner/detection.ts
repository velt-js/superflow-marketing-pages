import type { Participant } from "./time";

/** A device time zone is reliable for local time, but cannot identify a city. */
export function deviceLocation(): Participant | null {
  try {
    const zone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone) return null;
    return {
      id: `device:${zone}`,
      name: "Your location",
      country: "Device time zone",
      countryCode: "",
      region: "",
      zone,
      start: 540,
      end: 1080,
      days: [1, 2, 3, 4, 5],
    };
  } catch {
    return null;
  }
}

/** Only use an approximate IP city if its zone agrees with the device. */
export function withDetectedCity(
  person: Participant,
  value: unknown,
): Participant {
  if (!value || typeof value !== "object") return person;
  const data = value as Record<string, unknown>;
  if (
    typeof data.city !== "string" ||
    !data.city.trim() ||
    data.city.length > 100 ||
    typeof data.countryCode !== "string" ||
    !/^[A-Z]{2}$/.test(data.countryCode) ||
    typeof data.zone !== "string"
  )
    return person;
  try {
    const canonical = (zone: string) =>
      new Intl.DateTimeFormat("en", { timeZone: zone }).resolvedOptions()
        .timeZone;
    if (canonical(data.zone) !== canonical(person.zone)) return person;
    return {
      ...person,
      name: data.city,
      country:
        new Intl.DisplayNames(["en"], { type: "region" }).of(
          data.countryCode,
        ) ?? data.countryCode,
      countryCode: data.countryCode,
      region: "",
    };
  } catch {
    return person;
  }
}
