import { test, expect } from "@playwright/test";
import { DEFAULT_PEOPLE } from "../../../lib/tools/meeting-planner/time";

const path = "/tools/meeting-planner";
const state = {
  version: 1,
  people: DEFAULT_PEOPLE,
  date: "2026-09-09",
  duration: 30,
  selected: null,
  hour12: true,
};
const url = `${path}#plan=${encodeURIComponent(JSON.stringify(state))}`;

test.beforeEach(async ({ context }) => {
  // Product-owned resources stay real; unrelated analytics are outside this test.
  await context.route(
    /(googletagmanager|google-analytics|amplitude|claydar|intercom|termly|rewardful)/,
    (route) => route.abort(),
  );
});

test("city/country search, working hours, date changes, and no overlap", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await expect(
    page.getByText("1h of shared working hours", { exact: true }),
  ).toBeVisible();
  const search = page.getByRole("combobox", { name: "Add a city or country" });
  await search.fill("India");
  await expect(page.getByRole("option").first()).toContainText(
    "Country · one time zone",
  );
  await search.press("Enter");
  await expect(
    page.getByRole("button", { name: "Remove India", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("No shared working hours on this date", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove India", exact: true }).click();
  await page.getByLabel("Meeting date", { exact: true }).fill("2026-09-12");
  await expect(
    page.getByText("No shared working hours on this date", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Meeting date", { exact: true }).fill("2026-09-09");
  await search.fill("United States");
  await expect(
    page.getByRole("option").filter({ hasText: "Los Angeles" }),
  ).toBeVisible();
  await search.fill("Kathmandu");
  await search.press("Enter");
  await expect(
    page.getByRole("button", { name: "Remove Kathmandu", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("full meeting selection, clipboard, calendar export and exact shared-link round trip", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(url);
  await page.getByRole("button", { name: "24h", exact: true }).click();
  await page
    .getByRole("group", { name: "London timeline", exact: true })
    .getByRole("button", { pressed: true })
    .press("ArrowRight");
  await expect(
    page.getByRole("heading", { name: "09:30 – 10:00" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Copy meeting times", exact: true })
    .click();
  const summary = await page.evaluate(() => navigator.clipboard.readText());
  expect(summary).toBe(
    [
      "San Francisco: Sep 9, 9:30a - 10a PT",
      "New York City: Sep 9, 12:30p - 1p ET",
      "London: Sep 9, 5:30p - 6p BST",
    ].join("\n"),
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download calendar event", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("customer-meeting.ics");
  await page.getByRole("button", { name: "Share plan", exact: true }).click();
  const share = await page.evaluate(() => navigator.clipboard.readText());
  expect(share).toContain("#plan=");
  const other = await context.newPage();
  await other.goto(share, { waitUntil: "domcontentloaded" });
  await expect(
    other.getByRole("heading", { name: "09:30 – 10:00" }),
  ).toBeVisible();
  await expect(
    other.getByRole("button", { name: "24h", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("per-location schedules persist, time scale changes, and only the final location cannot be removed", async ({
  page,
}) => {
  await page.goto(url);
  await page
    .getByRole("button", { name: /09:00–18:00.*Edit hours/ })
    .first()
    .click();
  await page
    .getByLabel("San Francisco work start", { exact: true })
    .selectOption("480");
  await expect(
    page.getByText("2h of shared working hours", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Show times in" })
    .selectOption("2643743");
  await expect(
    page.getByRole("combobox", { name: "Show times in" }),
  ).toHaveValue("2643743");
  await page.goto(path);
  await expect(
    page.getByRole("combobox", { name: "Show times in" }),
  ).toHaveValue("2643743");
  await page
    .getByRole("button", { name: "Remove San Francisco", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Remove New York City", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Remove London", exact: true }),
  ).toBeDisabled();
});

test("mobile fits the viewport and location search works with the keyboard", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await expect(
    page.getByRole("button", { name: "Copy meeting times", exact: true }),
  ).toBeVisible();
  const search = page.getByRole("combobox", { name: "Add a city or country" });
  await search.fill("Tokyo");
  await expect(page.getByRole("option").first()).toContainText("Tokyo");
  await search.press("Enter");
  await expect(
    page.getByRole("button", { name: "Remove Tokyo", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("region", { name: /Time comparison/ })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toBeInViewport();
  const selectionBox = await page
    .getByLabel("Selected time in San Francisco", { exact: true })
    .boundingBox();
  const cityBox = await page.locator("[data-city-label]").first().boundingBox();
  expect(selectionBox!.x).toBeGreaterThanOrEqual(cityBox!.x + cityBox!.width);
  expect(selectionBox!.x + selectionBox!.width).toBeLessThanOrEqual(390);
  await page
    .getByRole("heading", {
      name: "Different places. One good time.",
      exact: true,
    })
    .locator("../../..")
    .screenshot({ path: testInfo.outputPath("mobile-planner.png") });
});

test("failed catalog download can retry; invalid shared links remain usable", async ({
  page,
}) => {
  await page.route("**/data/meeting-locations.json", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto(`${path}#plan=invalid`);
  await page.getByRole("combobox", { name: "Add a city or country" }).click();
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
  await page.unroute("**/data/meeting-locations.json");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Add a city or country" })
    .fill("Paris");
  await expect(page.getByRole("option").first()).toContainText("Paris");
});

test("half-hour dragging stays smooth and labels the local range on every city row", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto(url);
  await page.getByRole("button", { name: "24h", exact: true }).click();
  await expect(
    page.getByLabel("Meeting duration", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: /reference/i })).toHaveCount(0);
  const row = page.getByRole("group", {
    name: "San Francisco timeline",
    exact: true,
  });
  await expect(row.getByRole("button")).toHaveCount(48);
  await expect(row.locator('[data-index="18"]')).toHaveText("09:00");
  await expect(
    page
      .getByRole("group", { name: "London timeline", exact: true })
      .locator('[data-index="18"]'),
  ).toHaveText("17:00");
  await expect(
    page.getByLabel("Current time in San Francisco", { exact: true }),
  ).toContainText("now");
  const searchBox = await page
    .getByRole("combobox", { name: "Add a city or country" })
    .boundingBox();
  const overlapBox = await page
    .getByText("1h of shared working hours", { exact: true })
    .boundingBox();
  const dateBox = await page
    .getByLabel("Meeting date", { exact: true })
    .boundingBox();
  expect(overlapBox!.y).toBeGreaterThan(searchBox!.y + searchBox!.height);
  expect(overlapBox!.y).toBeLessThan(dateBox!.y);
  const viewport = page.getByRole("region", { name: /Time comparison/ });
  await row.scrollIntoViewIfNeeded();
  const from = await row.locator('[data-index="18"]').boundingBox();
  const to = await row.locator('[data-index="20"]').boundingBox();
  expect(from).not.toBeNull();
  expect(to).not.toBeNull();
  const rowBox = await row.boundingBox();
  const clockBox = await page
    .getByLabel("Current time in San Francisco", { exact: true })
    .boundingBox();
  expect(clockBox!.y).toBeGreaterThanOrEqual(rowBox!.y);
  expect(clockBox!.y + clockBox!.height).toBeLessThanOrEqual(
    rowBox!.y + rowBox!.height,
  );
  const scroll = await viewport.evaluate((el) => el.scrollLeft);
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down();
  await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, {
    steps: 12,
  });
  await page.mouse.up();
  await expect(
    page.getByRole("heading", { name: "09:00 – 10:30" }),
  ).toBeVisible();
  await expect(
    page.getByText("Shared hours are too short for a 90-minute call", {
      exact: true,
    }),
  ).toBeVisible();
  expect(await viewport.evaluate((el) => el.scrollLeft)).toBeCloseTo(scroll, 0);
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("09:00 – 10:30");
  await expect(
    page.getByLabel("Selected time in New York City", { exact: true }),
  ).toHaveText("12:00 – 13:30");
  await expect(
    page.getByLabel("Selected time in London", { exact: true }),
  ).toHaveText("17:00 – 18:30");
  await row.getByRole("button", { pressed: true }).press("Shift+ArrowRight");
  await expect(
    page.getByRole("heading", { name: "09:00 – 11:00" }),
  ).toBeVisible();
  await row.getByRole("button", { pressed: true }).press("Shift+ArrowLeft");
  await expect(
    page.getByRole("heading", { name: "09:00 – 10:30" }),
  ).toBeVisible();

  // Canceling an in-progress gesture restores the previous range.
  await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2);
  await page.mouse.down();
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2, {
    steps: 6,
  });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(
    page.getByRole("heading", { name: "09:00 – 10:30" }),
  ).toBeVisible();
  expect(await viewport.evaluate((el) => el.scrollLeft)).toBeCloseTo(scroll, 0);
  await page
    .getByRole("heading", {
      name: "Different places. One good time.",
      exact: true,
    })
    .locator("../../..")
    .screenshot({ path: testInfo.outputPath("desktop-planner.png") });
});

test.describe("India device time zone", () => {
  // Use the fixture context so the shared analytics routing applies here too.
  test.use({ timezoneId: "Asia/Kolkata" });

  test("a new visitor gets their device zone and an approximate city without a permission prompt", async ({
    page,
  }) => {
    await page.route("**/api/tools/meeting-planner/location", (route) =>
      route.fulfill({
        json: { city: "Mumbai", countryCode: "IN", zone: "Asia/Kolkata" },
      }),
    );
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("button", { name: "Remove Mumbai", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Approximate location", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("combobox", { name: "Show times in" })
        .locator("option:checked"),
    ).toHaveText("Mumbai");
  });
});

test.describe("Nepal device time zone", () => {
  // Use the fixture context so the shared analytics routing applies here too.
  test.use({ timezoneId: "Asia/Kathmandu" });

  test("location detection falls back to device time and preserves shared plans", async ({
    page,
  }) => {
    await page.route("**/api/tools/meeting-planner/location", (route) =>
      route.fulfill({ status: 503, body: "Unavailable" }),
    );
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("button", { name: "Remove Your location", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Auto-detected time zone", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("combobox", { name: "Show times in" })
        .locator("option:checked"),
    ).toHaveText("Your location");
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("combobox", { name: "Show times in" }),
    ).toHaveValue("5391959");
    await expect(
      page.getByRole("button", { name: "Remove Your location", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Use my location", exact: true })
      .click();
    await expect(
      page
        .getByRole("combobox", { name: "Show times in" })
        .locator("option:checked"),
    ).toHaveText("Your location");
  });
});

test("half-hour rows retain DST day lengths, quarter-hour zones, and existing shared selections", async ({
  page,
}) => {
  for (const [date, count] of [
    ["2026-03-08", 46],
    ["2026-11-01", 50],
  ] as const) {
    await page.goto(
      `${path}#plan=${encodeURIComponent(JSON.stringify({ ...state, date }))}`,
      { waitUntil: "domcontentloaded" },
    );
    await expect(
      page
        .getByRole("group", { name: "San Francisco timeline", exact: true })
        .getByRole("button"),
    ).toHaveCount(count);
  }
  const kathmandu = {
    ...DEFAULT_PEOPLE[0],
    id: "kathmandu-test",
    name: "Kathmandu",
    country: "Nepal",
    countryCode: "NP",
    zone: "Asia/Kathmandu",
  };
  const legacy = {
    ...state,
    people: [...DEFAULT_PEOPLE, kathmandu],
    selected: Date.parse("2026-09-09T16:15:00Z"),
    duration: 15,
    hour12: false,
  };
  await page.goto(
    `${path}#plan=${encodeURIComponent(JSON.stringify(legacy))}`,
    { waitUntil: "domcontentloaded" },
  );
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("09:15 – 09:30");
  await expect(
    page.getByLabel("Selected time in Kathmandu", { exact: true }),
  ).toHaveText("22:00 – 22:15");
  const row = page.getByRole("group", {
    name: "San Francisco timeline",
    exact: true,
  });
  await row.getByRole("button", { pressed: true }).press("ArrowRight");
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("09:30 – 10:00");
  await expect(
    page.getByLabel("Selected time in Kathmandu", { exact: true }),
  ).toHaveText("22:15 – 22:45");
  await row.getByRole("button", { pressed: true }).press("End");
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("23:30 – 00:00 · Sep 10");
});
