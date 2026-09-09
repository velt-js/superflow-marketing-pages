import type { Place } from "./time";

export type LocationCatalog = {
  countries: Record<string, { name: string; zones: string[] }>;
  cities: [
    id: string,
    name: string,
    country: string,
    region: string,
    zone: string,
    population: number,
    aliases: string,
  ][];
};
export type SearchResult = Place & { hint?: string };
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const COUNTRY_ALIASES: Record<string, string> = {
  usa: "US",
  "u.s.": "US",
  "united states of america": "US",
  uk: "GB",
  britain: "GB",
  "great britain": "GB",
  england: "GB",
  uae: "AE",
  korea: "KR",
};
const CITY_ALIASES: Record<string, string> = {
  nyc: "New York City",
  sf: "San Francisco",
  bangalore: "Bengaluru",
  bombay: "Mumbai",
  saigon: "Ho Chi Minh City",
  "new york": "New York City",
};

// Curated shortcuts for customer calls. GeoNames IDs disambiguate namesakes.
const POPULAR_TECH_HUB_IDS = [
  "5391959", // San Francisco, United States
  "5128581", // New York City, United States
  "5368361", // Los Angeles, United States
  "2643743", // London, United Kingdom
  "1277333", // Bengaluru, India
  "1880252", // Singapore
  "5809844", // Seattle, United States
  "4671654", // Austin, Texas, United States
  "4930956", // Boston, United States
  "6167865", // Toronto, Canada
  "2950159", // Berlin, Germany
  "1269843", // Hyderabad, India
  "293397", // Tel Aviv, Israel
  "2759794", // Amsterdam, Netherlands
  "2988507", // Paris, France
  "2673730", // Stockholm, Sweden
  "2964574", // Dublin, Ireland
  "292223", // Dubai, United Arab Emirates
  "2147714", // Sydney, Australia
  "1850147", // Tokyo, Japan
  "1835848", // Seoul, South Korea
];

export function createLocationSearch(catalog: LocationCatalog) {
  const places = catalog.cities.map(
    ([id, name, code, region, zone, population, aliases]) => ({
      id,
      name,
      countryCode: code,
      region,
      zone,
      country: catalog.countries[code].name,
      population,
      normalizedName: normalize(name),
      text: normalize(
        `${name} ${aliases} ${region} ${catalog.countries[code].name} ${code}`,
      ),
    }),
  );
  const popularPlaces = POPULAR_TECH_HUB_IDS.map((id) =>
    places.find((place) => place.id === id),
  ).filter((place) => place !== undefined);
  return (query: string): SearchResult[] => {
    const q = normalize(query);
    if (!q) return popularPlaces;
    const country = Object.entries(catalog.countries).find(
      ([code, c]) =>
        code.toLowerCase() === q ||
        normalize(c.name) === q ||
        COUNTRY_ALIASES[q] === code,
    );
    if (country) {
      const [code, c] = country;
      if (c.zones.length === 1)
        return [
          {
            id: `country-${code}`,
            name: c.name,
            country: c.name,
            countryCode: code,
            region: "",
            zone: c.zones[0],
            hint: "Country · one time zone",
          },
          ...places.filter((p) => p.countryCode === code).slice(0, 7),
        ];
      // Every region stays selectable, even if there is no city in cities15000.
      // Never collapse distinct zones just because their offsets match today.
      return c.zones.map((zone) => {
        const city = places.find(
          (p) => p.countryCode === code && p.zone === zone,
        );
        return city
          ? { ...city, hint: `${c.name} · choose a city or region` }
          : {
              id: `region-${zone}`,
              name: zone.split("/").slice(1).join(" / ").replace(/_/g, " "),
              country: c.name,
              countryCode: code,
              region: "",
              zone,
              hint: `${c.name} · region`,
            };
      });
    }
    const target = normalize(CITY_ALIASES[q] ?? q);
    const words = target.split(/\s+/);
    return places
      .filter((p) => words.every((word) => p.text.includes(word)))
      .sort(
        (a, b) =>
          Number(b.normalizedName === target) -
            Number(a.normalizedName === target) ||
          Number(b.normalizedName.startsWith(target)) -
            Number(a.normalizedName.startsWith(target)) ||
          b.population - a.population,
      )
      .slice(0, 20);
  };
}

export function asPlace(result: SearchResult): Place {
  const { id, name, country, countryCode, region, zone } = result;
  return { id, name, country, countryCode, region, zone };
}
