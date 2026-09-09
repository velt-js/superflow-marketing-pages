import { test, expect, type Page } from "@playwright/test";
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

async function use24HourClock(page: Page) {
  await page.getByText("View options", { exact: true }).click();
  await page.getByRole("button", { name: "24h", exact: true }).click();
  await page.getByText("View options", { exact: true }).click();
}

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
    page.getByText("1 hour within everyone’s work hours", { exact: true }),
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
    page.getByText("No shared work hours. Try a suggested compromise.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove India", exact: true }).click();
  await page.getByLabel("Meeting date", { exact: true }).fill("2026-09-12");
  await expect(
    page.getByText("No shared work hours. Try a suggested compromise.", {
      exact: true,
    }),
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
  await use24HourClock(page);
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
  await page.getByText("More ways to share", { exact: true }).click();
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
    other.getByRole("button", {
      name: "24h",
      exact: true,
      includeHidden: true,
    }),
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
    page.getByText("2 hours within everyone’s work hours", { exact: true }),
  ).toBeVisible();
  await page.getByText("View options", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Show times in", includeHidden: true })
    .selectOption("2643743");
  await page.getByText("View options", { exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Show times in", includeHidden: true }),
  ).toHaveValue("2643743");
  await page.goto(path);
  await expect(
    page.getByRole("combobox", { name: "Show times in", includeHidden: true }),
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
    .locator("[data-meeting-planner]")
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
  await use24HourClock(page);
  await expect(
    page.getByLabel("Meeting duration", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: /reference/i })).toHaveCount(0);
  const row = page.getByRole("group", {
    name: "San Francisco timeline",
    exact: true,
  });
  await expect(row.locator("button[data-index]")).toHaveCount(48);
  await expect(row.locator('[data-index="16"]')).toHaveText("08:00");
  await expect(
    page
      .getByRole("group", { name: "London timeline", exact: true })
      .locator('[data-index="16"]'),
  ).toHaveText("16:00");
  await expect(
    page.getByLabel("Current time in San Francisco", { exact: true }),
  ).toContainText("now");
  const searchBox = await page
    .getByRole("combobox", { name: "Add a city or country" })
    .boundingBox();
  const overlapBox = await page
    .getByText("1 hour within everyone’s work hours", { exact: true })
    .boundingBox();
  const dateBox = await page
    .getByLabel("Meeting date", { exact: true })
    .boundingBox();
  expect(overlapBox!.y).toBeGreaterThan(searchBox!.y + searchBox!.height);
  expect(overlapBox!.y).toBeLessThan(dateBox!.y);
  const viewport = page.getByRole("region", { name: /Time comparison/ });
  await row.scrollIntoViewIfNeeded();
  await row.locator('[data-index="16"]').click();
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
    page.getByText("Outside London’s work hours", { exact: true }),
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
  await expect(row.getByRole("button", { pressed: true })).toHaveCSS(
    "outline-style",
    "none",
  );
  await page
    .locator("[data-meeting-planner]")
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
      page.getByLabel("Current time in Mumbai", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("combobox", { name: "Show times in", includeHidden: true })
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
      page.getByLabel("Current time in Your location", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("combobox", { name: "Show times in", includeHidden: true })
        .locator("option:checked"),
    ).toHaveText("Your location");
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("combobox", {
        name: "Show times in",
        includeHidden: true,
      }),
    ).toHaveValue("5391959");
    await expect(
      page.getByRole("button", { name: "Remove Your location", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Use my location", exact: true })
      .click();
    await expect(
      page
        .getByRole("combobox", { name: "Show times in", includeHidden: true })
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
        .locator("button[data-index]"),
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
  await row
    .getByRole("button", { name: "Resize start in San Francisco", exact: true })
    .press("ArrowRight");
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("09:15 – 09:30");
  await row
    .getByRole("button", { name: "Resize end in San Francisco", exact: true })
    .press("ArrowLeft");
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("09:15 – 09:30");
  await row.getByRole("button", { pressed: true }).press("Shift+ArrowLeft");
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("09:15 – 09:30");
  await row.getByRole("button", { pressed: true }).press("Shift+ArrowRight");
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("09:15 – 10:15");
  await row.getByRole("button", { pressed: true }).press("Shift+ArrowLeft");
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("09:15 – 09:45");
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

test("a simple suggestion leads straight to readable copy with advanced controls tucked away", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("combobox", { name: "Show times in", includeHidden: true }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Download calendar event", exact: true }),
  ).toBeHidden();
  const row = page.getByRole("group", { name: "London timeline", exact: true });
  await row.getByRole("button", { pressed: true }).press("Home");
  await expect(
    page.getByLabel("Selected time in London", { exact: true }),
  ).toHaveText("8am – 8:30am");
  await page
    .getByRole("button", { name: "Suggest a time", exact: true })
    .click();
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("9am – 9:30am");
  await expect(
    page.getByLabel("Selected time in London", { exact: true }),
  ).toHaveText("5pm – 5:30pm");
  await page
    .getByRole("button", { name: "Copy meeting times", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "San Francisco: Sep 9, 9a - 9:30a PT\nNew York City: Sep 9, 12p - 12:30p ET\nLondon: Sep 9, 5p - 5:30p BST",
  );
  expect(
    await page.locator("[data-meeting-planner]").innerText(),
  ).not.toContain("UTC");
});

test("clicks stay put, new slots select 30 minutes, and dragging or handles change the range", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  const longPlan = {
    ...state,
    selected: Date.parse("2026-09-09T16:00:00Z"),
    duration: 90,
    hour12: false,
  };
  await page.goto(
    `${path}#plan=${encodeURIComponent(JSON.stringify(longPlan))}`,
  );
  const row = page.getByRole("group", {
    name: "San Francisco timeline",
    exact: true,
  });
  const label = page.getByLabel("Selected time in San Francisco", {
    exact: true,
  });
  const mover = row.getByRole("button", {
    name: "Move meeting in San Francisco",
    exact: true,
  });
  const start = row.getByRole("button", {
    name: "Resize start in San Francisco",
    exact: true,
  });
  const end = row.getByRole("button", {
    name: "Resize end in San Francisco",
    exact: true,
  });
  await expect(label).toHaveText("09:00 – 10:30");
  await mover.click();
  await label.click();
  await start.click();
  await end.click();
  await expect(label).toHaveText("09:00 – 10:30");
  const box = await mover.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 3, box!.y + box!.height / 2);
  await page.mouse.up();
  await expect(label).toHaveText("09:00 – 10:30");
  const cellWidth = (await row.locator('[data-index="18"]').boundingBox())!
    .width;
  async function dragControl(control: typeof mover, steps: number) {
    const rect = (await control.boundingBox())!;
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      rect.x + rect.width / 2 + steps * cellWidth,
      rect.y + rect.height / 2,
      { steps: 8 },
    );
    await page.mouse.up();
  }
  await dragControl(mover, 1);
  await expect(label).toHaveText("09:30 – 11:00");
  await dragControl(end, 1);
  await expect(label).toHaveText("09:30 – 11:30");
  await dragControl(start, -1);
  await expect(label).toHaveText("09:00 – 11:30");
  await row.locator('[data-index="16"]').click();
  await expect(label).toHaveText("08:00 – 08:30");
  await start.press("ArrowRight");
  await end.press("ArrowLeft");
  await expect(label).toHaveText("08:00 – 08:30");

  // Remember cities and view preferences, but a fresh plan starts at 30 minutes.
  await end.press("ArrowRight");
  await expect(label).toHaveText("08:00 – 09:00");
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(
    page
      .getByText("30 minutes", { exact: false })
      .filter({ hasText: /minutes$/ })
      .first(),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("superflow-meeting-planner-v1")!)
            .duration,
      ),
    )
    .toBe(30);
});

test("Share plan is prominent above search and day/night colors follow each city", async ({
  page,
}) => {
  await page.goto(url);
  const share = page.getByRole("button", { name: "Share plan", exact: true });
  await expect(share).toHaveCount(1);
  await expect(share).toBeVisible();
  const shareBox = (await share.boundingBox())!;
  const searchBox = (await page
    .getByRole("combobox", { name: "Add a city or country" })
    .boundingBox())!;
  expect(shareBox.y + shareBox.height).toBeLessThan(searchBox.y);
  const sf = page.getByRole("group", {
    name: "San Francisco timeline",
    exact: true,
  });
  const london = page.getByRole("group", {
    name: "London timeline",
    exact: true,
  });
  const sfMidnight = sf.locator('[data-index="0"]');
  const londonMorning = london.locator('[data-index="0"]');
  await expect(sfMidnight).toHaveAttribute("data-period", "night");
  await expect(londonMorning).toHaveAttribute("data-period", "day");
  await expect(sfMidnight).toHaveCSS("background-color", "rgb(231, 232, 237)");
  await expect(londonMorning).toHaveCSS(
    "background-color",
    "rgb(231, 241, 255)",
  );
  await expect(sf.locator('[data-index="12"]')).toHaveAttribute(
    "data-period",
    "day",
  );
  await expect(sf.locator('[data-index="36"]')).toHaveAttribute(
    "data-period",
    "night",
  );
});

test.describe("touch timeline", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  test("swiping pans the day and tapping selects a half hour", async ({
    page,
    context,
  }) => {
    await page.goto(url);
    const viewport = page.getByRole("region", { name: /Time comparison/ });
    await viewport.scrollIntoViewIfNeeded();
    const row = page.getByRole("group", {
      name: "San Francisco timeline",
      exact: true,
    });
    const label = page.getByLabel("Selected time in San Francisco", {
      exact: true,
    });
    const before = await viewport.evaluate((el) => el.scrollLeft);
    const city = (await page
      .locator("[data-city-label]")
      .first()
      .boundingBox())!;
    const rowBox = (await row.boundingBox())!;
    const viewportBox = (await viewport.boundingBox())!;
    const x = viewportBox.x + viewportBox.width - 15;
    const y = rowBox.y + rowBox.height - 24;
    const distance = x - (city.x + city.width + 10);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let i = 1; i <= 8; i++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - (distance * i) / 8, y }],
      });
    }
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(() => viewport.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(before + 30);
    await expect(label).toHaveText("9am – 9:30am");
    // Stop native momentum, then tap a visible unselected slot.
    await viewport.evaluate((el) => {
      el.scrollLeft = 0;
    });
    await row.locator('[data-index="2"]').tap();
    await expect(label).toHaveText("1am – 1:30am");
    await cdp.detach();
  });
});

test("Suggest a time stays available without overlap and cycles through clear compromises", async ({
  page,
}) => {
  const plan = {
    ...state,
    people: [
      DEFAULT_PEOPLE[0],
      {
        ...DEFAULT_PEOPLE[2],
        id: "sweden",
        name: "Sweden",
        zone: "Europe/Stockholm",
        country: "Sweden",
        countryCode: "SE",
      },
    ],
  };
  await page.goto(`${path}#plan=${encodeURIComponent(JSON.stringify(plan))}`);
  await expect(
    page.getByText("No shared work hours. Try a suggested compromise.", {
      exact: true,
    }),
  ).toBeVisible();
  const suggest = page.getByRole("button", {
    name: "Suggest a time",
    exact: true,
  });
  await expect(suggest).toBeEnabled();
  await suggest.click();
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("8:30am – 9am");
  await expect(
    page.getByLabel("Selected time in Sweden", { exact: true }),
  ).toHaveText("5:30pm – 6pm");
  await expect(
    page.getByText(
      /Closest compromise: San Francisco would meet outside work hours/,
    ),
  ).toBeVisible();
  await suggest.click();
  await expect(
    page.getByLabel("Selected time in San Francisco", { exact: true }),
  ).toHaveText("9am – 9:30am");
  await expect(
    page.getByLabel("Selected time in Sweden", { exact: true }),
  ).toHaveText("6pm – 6:30pm");
  await expect(
    page.getByText(/Closest compromise: Sweden would meet outside work hours/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Sweden", exact: true })
    .click();
  await expect(suggest).toBeEnabled();
});
