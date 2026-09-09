# Time Zone Converter & Meeting Planner

Route: `/tools/meeting-planner`. The free-tools registry also exposes it in the directory, footer, sitemap, and Markdown index.

The planner runs in the browser without an API key. It detects the device time zone immediately; an optional same-origin location endpoint reads Vercel’s approximate IP city headers and enriches the label only if the zones agree. No geolocation permission prompt or external geolocation service is needed. The location response is private and never cached. Saved custom plans and shared links keep their locations. It loads the bundled GeoNames catalog from `/data/meeting-locations.json`. Countries with one named time zone can be added directly; countries with several zones offer one representative city or region per zone. City results retain region and country information to distinguish namesakes.

`lib/tools/meeting-planner/time.ts` compares instants using `Intl.DateTimeFormat` and named IANA zones. The city selected under “Show times in” and its local date determines the day boundaries, including 23-, 25-, and fractional-hour days. The calculation engine evaluates candidate meetings every 15 minutes; browser selections snap to 30-minute steps. Meetings must fit entirely inside every location's configured working hours. Overnight working days belong to the shift's starting day. Holidays and personal calendar free/busy are not included.

The versioned plan in localStorage is validated before use. Normal visits restore saved locations and hours on today's date with a fresh 30-minute selection; shared URL fragments restore the exact date and selection. Clipboard failure exposes selectable text. Calendar downloads use UTC timestamps, unique event IDs, escaping, and UTF-8 line folding.

Copied meeting times use one readable line per city, e.g. `San Diego: Sep 9, 9a - 2p PT`, independently of the timeline's 12/24-hour display. Minutes, overnight dates, year changes, and standard/daylight labels across clock changes remain explicit. English time-zone names come from Intl/CLDR; calendar event descriptions retain the detailed format.

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

Each city has one compact timeline row with its current local clock, local hour labels, working-hours controls, and the selected local range above the highlight. The overlap summary sits immediately after search, with a one-click suggestion for a 30-minute meeting. The primary flow is add cities, choose a time, and copy; Share plan stays prominent above search; display preferences and calendar actions are collapsed under View options and More ways to share. Current clocks show plain local times, and selections outside configured work hours identify the affected city. Clicking an empty slot selects 30 minutes; clicking the selection leaves it fixed. Drag the selection to move it, or its visible edge handles to resize (30 minutes to 24 hours). Arrow keys move in 30-minute steps and Shift + arrows resize without shifting a quarter-hour start. Touch swipes on cells pan the day; taps select, and the selection/handles support touch dragging. Daytime (6am–6pm locally) is soft blue, nighttime gray, shared work hours green, and selection pale lavender. These period colors are clock-based, not sunrise/sunset estimates. Formatting and availability are cached independently of selection, storage writes are debounced, and dragging does not recenter the viewport.

The always-visible Suggest a time action ranks 30-minute options on the chosen day. Full work-hour fits rank first; when none fit, it minimizes the worst individual inconvenience, then total inconvenience, using distance from configured work shifts and an extra penalty for 10pm–7am outside a configured shift. Repeated clicks cycle through the top three choices, clearly labeling compromises. Local weekdays, overnight shifts, DST and quarter-hour zones remain part of the calculation. These are scheduling suggestions, not confirmation of customer availability.

## Public API and MCP

The same engine is exposed at `POST /api/tools/meeting-planner` and as `find_meeting_times` on `/api/mcp`. The catalog in `lib/tools/api-catalog.ts` publishes the schema and examples to the page, `/tools/mcp`, and their Markdown copies.

Required arguments are `locations` (1–8 city/country strings or returned location IDs) and `date` (YYYY-MM-DD in the first location's zone). Optional arguments: `durationMinutes` (default 30), `workStart`/`workEnd` (09:00–18:00 in each location), `workDays` (1,2,3,4,5, with Sunday=0), and `limit` (10, maximum 20). Ambiguous cities or multi-zone countries return HTTP 400 with choices and IDs to retry. No arbitrary timezone strings or offsets are accepted as location IDs.

Results include resolved locations, shared windows clipped to the first location's date, earliest fitting starts, UTC/local timestamps and readable copy, plus a browser plan link. Meetings may end after that date's midnight. All locations use the supplied working schedule; the linked browser plan permits individual edits. No calendar is consulted or booked. Input is capped at 16 KB and no result is cached or stored by the application.

Errors consistently return `{ ok: false, code, message }`: `bad-request` for missing or malformed JSON, `invalid-input` for invalid arguments, `ambiguous-location` and `location-not-found` for location resolution, `payload-too-large` for HTTP 413, and `internal` for unexpected HTTP 500 failures. Location errors retain their query and choices. MCP forwards endpoint failures as tool errors with the same structured payload.
