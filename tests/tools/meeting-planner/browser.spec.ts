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

test.beforeEach(async ({ page }) => {
  // Product-owned resources stay real; unrelated analytics are outside this test.
  await page.route(
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
  await page.getByLabel("Meeting duration", { exact: true }).selectOption("90");
  await expect(
    page.getByText("Shared hours are too short for a 90-minute call", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Meeting duration", { exact: true }).selectOption("30");
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
    page.getByRole("heading", { name: "09:15 – 09:45" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Copy meeting times", exact: true })
    .click();
  const summary = await page.evaluate(() => navigator.clipboard.readText());
  expect(summary).toContain("San Francisco: Wed, Sep 9, 09:15");
  expect(summary).toContain("London: Wed, Sep 9, 17:15");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download calendar event", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("customer-meeting.ics");
  await page.getByRole("button", { name: "Share plan", exact: true }).click();
  const share = await page.evaluate(() => navigator.clipboard.readText());
  expect(share).toContain("#plan=");
  const other = await context.newPage();
  await other.goto(share);
  await expect(
    other.getByRole("heading", { name: "09:15 – 09:45" }),
  ).toBeVisible();
  await expect(
    other.getByRole("button", { name: "24h", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("per-location schedules persist, reference changes, and only the final location cannot be removed", async ({
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
    .getByRole("button", { name: "Use London as reference", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "London is the reference city" }),
  ).toBeVisible();
  await page.goto(path);
  await expect(
    page.getByRole("button", { name: "London is the reference city" }),
  ).toBeVisible();
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
}) => {
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
