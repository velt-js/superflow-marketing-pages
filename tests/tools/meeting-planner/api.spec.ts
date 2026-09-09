import { test, expect } from "@playwright/test";
import {
  findMeetingTimes,
  PlannerInputError,
} from "../../../lib/tools/meeting-planner/api";
import { apiForTool } from "../../../lib/tools/api-catalog";
import { coerceArguments } from "../../../lib/tools/mcp/server";
import { parseState } from "../../../lib/tools/meeting-planner/time";
import { POST } from "../../../app/api/tools/meeting-planner/route";

const origin = "https://usesuperflow.ai";
const entry = apiForTool("meeting-planner")!;
const sample = entry.sample;

test("API engine resolves cities, returns full-duration overlap and a valid browser plan", () => {
  const result = findMeetingTimes(sample, origin);
  expect(result.locations.map((p) => p.name)).toEqual([
    "San Francisco",
    "New York City",
    "London",
  ]);
  expect(result.overlapMinutes).toBe(60);
  expect(result.totalAvailableStarts).toBe(3);
  expect(result.slots[0].startUtc).toBe("2026-09-09T16:00:00.000Z");
  expect(result.slots[0].copyText).toBe(
    "San Francisco: Sep 9, 9a - 9:30a PT\nNew York City: Sep 9, 12p - 12:30p ET\nLondon: Sep 9, 5p - 5:30p BST",
  );
  const plan = parseState(
    decodeURIComponent(new URL(result.planUrl).hash.slice(6)),
  );
  expect(plan?.people).toEqual(result.locations);
  expect(plan?.selected).toBe(Date.parse(result.slots[0].startUtc));
  expect(findMeetingTimes({ ...sample, limit: 1 }, origin)).toMatchObject({
    totalAvailableStarts: 3,
    hasMore: true,
  });
  expect(
    findMeetingTimes({ ...sample, durationMinutes: 90 }, origin),
  ).toMatchObject({ overlapMinutes: 60, slots: [], totalAvailableStarts: 0 });
});

test("API engine handles single-zone countries, DST changes, weekends and overnight shifts", () => {
  const fractional = findMeetingTimes(
    { ...sample, locations: ["India", "Kathmandu"] },
    origin,
  );
  expect(fractional.slots[0].startUtc).toBe("2026-09-09T03:30:00.000Z");
  expect(fractional.slots[0].localTimes.map((p) => p.start.time)).toEqual([
    "09:00",
    "09:15",
  ]);
  expect(
    findMeetingTimes({ ...sample, date: "2026-03-10" }, origin).overlapMinutes,
  ).toBe(120);
  expect(
    findMeetingTimes({ ...sample, date: "2026-09-12" }, origin).slots,
  ).toEqual([]);
  const overnight = findMeetingTimes(
    {
      ...sample,
      locations: ["Singapore"],
      date: "2026-09-11",
      workStart: "22:00",
      workEnd: "02:00",
      workDays: "5",
      durationMinutes: 60,
      limit: 20,
    },
    origin,
  );
  expect(overnight.slots.at(-1)?.localTimes[0].end).toMatchObject({
    date: "2026-09-12",
    time: "00:45",
  });
});

test("API engine returns choices for ambiguous cities and countries, accepts IDs, and rejects unknown places", () => {
  for (const query of ["USA", "London"]) {
    try {
      findMeetingTimes({ ...sample, locations: [query] }, origin);
      throw new Error("Expected location ambiguity");
    } catch (error) {
      expect(error).toBeInstanceOf(PlannerInputError);
      const details = (error as PlannerInputError).details;
      expect(details.code).toBe("ambiguous-location");
      const choices = details.choices as { id: string; zone: string }[];
      expect(choices.length).toBeGreaterThan(1);
      const retry = findMeetingTimes(
        { ...sample, locations: [choices[0].id] },
        origin,
      );
      expect(retry.locations[0].zone).toBe(choices[0].zone);
    }
  }
  expect(() =>
    findMeetingTimes({ ...sample, locations: ["Notarealcityxyz"] }, origin),
  ).toThrow("No location found");
});

test("API engine rejects malformed and unbounded arguments", () => {
  for (const input of [
    null,
    [],
    {},
    { ...sample, locations: "London" },
    { ...sample, locations: [] },
    { ...sample, locations: Array(9).fill("India") },
    { ...sample, locations: ["x".repeat(151)] },
    { ...sample, locations: ["India", "country-IN"] },
    { ...sample, date: "2026-02-30" },
    { ...sample, date: "2100-01-01" },
    { ...sample, durationMinutes: 1 },
    { ...sample, durationMinutes: 1441 },
    { ...sample, durationMinutes: 31 },
    { ...sample, durationMinutes: "30" },
    { ...sample, limit: 100 },
    { ...sample, workStart: "9am" },
    { ...sample, workStart: "09:01" },
    { ...sample, workEnd: "09:00" },
    { ...sample, workDays: "7" },
  ]) {
    expect(() => findMeetingTimes(input, origin)).toThrow(PlannerInputError);
  }
});

test("MCP argument checking accepts string arrays and refuses wrong types or oversized lists", () => {
  expect(
    coerceArguments(entry.inputSchema, { ...sample, durationMinutes: "30" }),
  ).toMatchObject({
    ok: true,
    args: { locations: sample.locations, durationMinutes: 30 },
  });
  for (const locations of [
    "London",
    [1],
    [],
    Array(9).fill("India"),
    ["x".repeat(151)],
  ]) {
    expect(
      coerceArguments(entry.inputSchema, { ...sample, locations }).ok,
    ).toBe(false);
  }
});

test("HTTP handler rejects malformed JSON and enforces actual body size without Content-Length", async () => {
  const request = (body: string) =>
    new Request(`${origin}${entry.path}`, { method: "POST", body });
  expect((await POST(request("{"))).status).toBe(400);
  const tooLarge = await POST(
    request(JSON.stringify({ text: "x".repeat(16_384) })),
  );
  expect(tooLarge.status).toBe(413);
  expect(tooLarge.headers.get("access-control-allow-origin")).toBe("*");
});

test("published HTTP and MCP calls return the same meeting times and handle a corrected location", async ({
  request,
}) => {
  const direct = await request.post(entry.path, { data: sample });
  expect(direct.status()).toBe(200);
  expect(direct.headers()["cache-control"]).toBe("no-store");
  const expected = await direct.json();
  expect(expected.slots[0].startUtc).toBe("2026-09-09T16:00:00.000Z");
  const rpc = (method: string, params?: object) =>
    request.post("/api/mcp", {
      data: { jsonrpc: "2.0", id: 1, method, params },
    });
  const listed = await (await rpc("tools/list")).json();
  expect(
    listed.result.tools.find(
      (tool: { name: string }) => tool.name === entry.mcpTool,
    ).inputSchema.properties.locations.type,
  ).toBe("array");
  const called = await (
    await rpc("tools/call", { name: entry.mcpTool, arguments: sample })
  ).json();
  expect(called.result.isError).toBe(false);
  expect(called.result.structuredContent).toEqual(expected);
  const ambiguous = await (
    await rpc("tools/call", {
      name: entry.mcpTool,
      arguments: { ...sample, locations: ["United States"] },
    })
  ).json();
  expect(ambiguous.result.isError).toBe(true);
  const choice = ambiguous.result.structuredContent.choices[0];
  const corrected = await (
    await rpc("tools/call", {
      name: entry.mcpTool,
      arguments: { ...sample, locations: [choice.id] },
    })
  ).json();
  expect(corrected.result.isError).toBe(false);
  expect(corrected.result.structuredContent.locations[0].zone).toBe(
    choice.zone,
  );
});

test("MCP plan opens in the browser with readable copy and discoverable page metadata", async ({
  page,
  request,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.route(
    /(googletagmanager|google-analytics|amplitude|claydar|intercom|termly|rewardful)/,
    (route) => route.abort(),
  );
  const result = await (
    await request.post(entry.path, { data: sample })
  ).json();
  const plan = new URL(result.planUrl);
  await page.goto(`${plan.pathname}${plan.hash}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Time Zone Converter & Meeting Planner",
  );
  await expect(page).toHaveTitle(
    "Free Time Zone Converter & Meeting Planner | Superflow",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${origin}/tools/meeting-planner`,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Free Time Zone Converter & Meeting Planner | Superflow",
  );
  await expect(
    page.getByText("1 hour within everyone’s work hours", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Copy meeting times", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    result.slots[0].copyText,
  );
  await expect(page.locator("#api")).toContainText(entry.mcpTool);
  for (const path of ["/tools/mcp.md", "/tools/meeting-planner.md"]) {
    const markdown = await request.get(path);
    expect(markdown.status()).toBe(200);
    expect(await markdown.text()).toContain(entry.mcpTool);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
