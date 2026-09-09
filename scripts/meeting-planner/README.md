# Meeting planner

Route: `/tools/meeting-planner`. The free-tools registry also exposes it in the directory, footer, sitemap, and Markdown index.

The planner runs in the browser without an API key or a backend. It loads the bundled GeoNames catalog from `/data/meeting-locations.json`. Countries with one named time zone can be added directly; countries with several zones offer one representative city or region per zone. City results retain region and country information to distinguish namesakes.

`lib/tools/meeting-planner/time.ts` compares instants using `Intl.DateTimeFormat` and named IANA zones. The reference city's local date determines the day boundaries, including 23-, 25-, and fractional-hour days. Candidate meetings start every 15 minutes and must fit entirely inside every location's configured working hours. Overnight working days belong to the shift's starting day. Holidays and personal calendar free/busy are not included.

The versioned plan in localStorage is validated before use. Normal visits restore saved locations and hours on today's date; shared URL fragments restore the exact date and selection. Clipboard failure exposes selectable text. Calendar downloads use UTC timestamps, unique event IDs, escaping, and UTF-8 line folding.

## Validation

```sh
npm ci
npm run build
npx playwright install chromium
npx playwright test tests/tools/meeting-planner
```

The existing tools smoke workflow runs these tests on pull requests. The pure calculation/catalog tests can also run against an existing server without launching a browser:

```sh
TOOLS_BASE_URL=http://localhost:3211 npx playwright test tests/tools/meeting-planner/time.spec.ts
```

## Refreshing locations

Download `cities15000.zip`, `countryInfo.txt`, `timeZones.txt`, and `admin1CodesASCII.txt` from <https://download.geonames.org/export/dump/> into a temporary directory, then run:

```sh
python3 scripts/meeting-planner/build-locations.py /path/to/downloads
```

Commit the generated catalog. The catalog currently includes over 34,000 cities; smaller places may require a nearby city. GeoNames data is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), attributed in both the data file and the visible tool. Time-zone rule updates come from the browser/OS, not fixed offsets in this catalog. Unsupported newly introduced zones fail gracefully and suggest updating the browser.
