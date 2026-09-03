// Browser smoke tests for every live free tool.
//
// Why this file exists: the AI Visibility Checker and its robots.txt sibling
// shipped to production broken. `tsc` passed, `next build` passed, and the API
// route answered HTTP 200 with a valid report, because the defect was that the
// backend deletes `findings` from the report while the TypeScript type still
// promised it. The only place that failure was observable was a browser, where
// the report view called `.filter()` on `undefined` and the page rendered
// nothing but "This page couldn't load".
//
// So the rule these tests encode is: a tool is only "live" if a browser has
// driven it end to end and the page raised no uncaught error. Checking the
// endpoint is not checking the tool.
//
// Run against a local server (default) or any deployment:
//   npx playwright test tests/tools
//   TOOLS_BASE_URL=https://usesuperflow.ai npx playwright test tests/tools

import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { TOOLS, liveTools, toolPath } from "../../lib/tools/registry";
import {
  MCP_PATH,
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_NAME,
  availableToolApis,
} from "../../lib/tools/api-catalog";

/**
 * Third-party hosts we neither control nor test. A blocked analytics beacon is
 * not a tool failure, and treating it as one would make the suite noisy enough
 * that people stop reading it.
 */
/**
 * Budget for a test that waits on a live backend run, and for the test itself.
 *
 * These two tools call the product backend for real rather than a fixture, so
 * the wait has to cover a cold cache, the client's 45s ceiling, and a page load
 * that is slow whenever third-party assets are unreachable.
 */
const RUN_TIMEOUT_MS = 150_000;
const RUN_TEST_TIMEOUT_MS = 240_000;

/**
 * The same budgets for a persona review, which is the slowest thing on the
 * site: a page load, a screenshot and an LLM call, measured at 118 to 153
 * seconds against the production backend on 2026-09-02. The browser waits four
 * minutes for one (RUN_CEILING_MS in ReviewTool.tsx), so the test has to
 * outlast that or it fails before the code under test gives up.
 */
const REVIEW_RUN_TIMEOUT_MS = 260_000;
const REVIEW_TEST_TIMEOUT_MS = 320_000;

const THIRD_PARTY = [
  "googletagmanager.com",
  "google-analytics.com",
  "intercom",
  "termly.io",
  "cdn.velt.dev",
  "rewardful",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
];

/** True when a console message is about a host we do not own. */
function isThirdParty(text: string): boolean {
  return THIRD_PARTY.some((host) => text.includes(host));
}

/**
 * Attaches error collection to a page.
 *
 * `pageerror` is the signal that matters: it fires for the uncaught exception
 * that trips React's error boundary, which is exactly the production failure
 * this suite exists to catch.
 *
 * @param page - The page to watch.
 * @returns The array errors accumulate into.
 */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];

  // The signal that matters. This is what fires when a render throws and the
  // error boundary replaces the page.
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

  // Resource failures are judged by origin, not by message text. Chromium
  // reports a blocked request as a bare "Failed to load resource:
  // net::ERR_CONNECTION_RESET" with no URL, so filtering the console string
  // cannot tell our own broken asset from a blocked analytics beacon. The
  // request object carries the URL, so this asks the question properly.
  page.on("requestfailed", (request) => {
    try {
      const failedHost = new URL(request.url()).host;
      const ourHost = new URL(page.url()).host;
      if (failedHost !== ourHost) return;
      errors.push(`requestfailed: ${request.url()}`);
    } catch {
      // An unparseable URL is not evidence of a broken tool.
    }
  });

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    // Already covered, with a URL, by the requestfailed handler above.
    if (text.startsWith("Failed to load resource")) return;
    if (isThirdParty(text)) return;
    errors.push(`console: ${text.slice(0, 300)}`);
  });

  return errors;
}

test.describe("every live tool page loads clean", () => {
  for (const tool of liveTools()) {
    test(`${tool.slug} renders with no uncaught error`, async ({ page }) => {
      const errors = collectErrors(page);

      const response = await page.goto(toolPath(tool.slug), {
        waitUntil: "domcontentloaded",
      });

      expect(response?.status(), `${tool.slug} HTTP status`).toBe(200);

      // The H1 proves the page template rendered, not just that bytes arrived.
      await expect(page.locator("h1")).toBeVisible();

      // The privacy line is a brief commitment, not a nice-to-have, so its
      // absence is a test failure rather than a copy nit.
      await expect(
        page.getByText(/no login, no email/i).first(),
      ).toBeVisible();

      expect(errors, `${tool.slug} console/page errors`).toEqual([]);
    });
  }
});

/**
 * Relative luminance of an `rgb(...)` string, per WCAG.
 *
 * @param color - A computed colour value.
 */
function luminance(color: string): number {
  const [r, g, b] = (color.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"])
    .slice(0, 3)
    .map(Number);
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

test.describe("the nav is readable on every tool page", () => {
  // SiteNav defaults to a transparent bar with white links and only turns
  // solid once the reader scrolls. On a light hero that renders white-on-white:
  // the menu items are in the DOM, focusable, and completely invisible, which
  // no DOM assertion would catch.
  //
  // The tool pages now open on the site's blue gradient hero, where white links
  // are the design and a computed-background check cannot see the bitmap behind
  // them. So this asserts the pairing rather than one half of it: a page that
  // has the gradient must have white links, and a page without it must clear
  // the contrast bar against whatever background it does have. Swap one without
  // the other and this fails.
  for (const tool of [...liveTools(), { slug: "", name: "index" }]) {
    const path = tool.slug ? toolPath(tool.slug) : "/tools";

    test(`${tool.name} nav links are visible at the top of the page`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // The bar's solid state is applied by a scroll handler, so settle first.
      await page.waitForTimeout(800);

      const link = page.locator("header a").filter({ hasText: /^Pricing$/ }).first();
      await expect(link).toBeVisible();

      const colors = await link.evaluate((element) => {
        const text = getComputedStyle(element).color;
        let node: HTMLElement | null = element as HTMLElement;
        let background = "rgba(0, 0, 0, 0)";
        while (node && background === "rgba(0, 0, 0, 0)") {
          background = getComputedStyle(node).backgroundColor;
          node = node.parentElement;
        }
        return { text, background };
      });

      const onGradient =
        (await page.locator('[data-section="listing-hero"]').count()) > 0;

      if (onGradient) {
        expect(
          luminance(colors.text),
          `nav link ${colors.text} over the gradient hero at ${path}`,
        ).toBeGreaterThan(0.7);
        return;
      }

      const light = Math.max(luminance(colors.text), luminance(colors.background));
      const dark = Math.min(luminance(colors.text), luminance(colors.background));
      const contrast = (light + 0.05) / (dark + 0.05);

      expect(
        contrast,
        `nav link ${colors.text} on ${colors.background} at ${path}`,
      ).toBeGreaterThan(3);
    });
  }
});

test.describe("planned tools are not reachable from the index", () => {
  test("no planned tool is linked", async ({ page }) => {
    await page.goto("/tools", { waitUntil: "domcontentloaded" });

    const planned = TOOLS.filter((tool) => tool.status === "planned");
    for (const tool of planned) {
      // A linked card for an unbuilt tool is a 404 in front of a stranger.
      await expect(
        page.locator(`a[href="${toolPath(tool.slug)}"]`),
        `${tool.slug} must not be linked while planned`,
      ).toHaveCount(0);
    }
  });
});

test.describe("the AI visibility tools survive a real run", () => {
  // These two share an engine and are the pair that shipped broken, so they
  // get a run assertion rather than a load assertion.
  const CASES = [
    { slug: "ai-visibility-checker", heading: /AI Visibility|Visibility/i },
    { slug: "robots-txt-ai-checker", heading: /robots\.txt/i },
  ];

  for (const testCase of CASES) {
    test(`${testCase.slug} renders a report end to end`, async ({ page }) => {
      test.setTimeout(RUN_TEST_TIMEOUT_MS);
      const errors = collectErrors(page);

      await page.goto(`${toolPath(testCase.slug)}?url=${encodeURIComponent("https://example.com")}`, {
        waitUntil: "domcontentloaded",
      });

      // The deep link auto-runs, so the report is the thing to wait for. The
      // score dial only exists once a report is in hand.
      //
      // The budget is deliberately well past the obvious number. This drives a
      // real, uncached backend run: the client's own ceiling is 45s
      // (OVERALL_TIMEOUT_MS in lib/toolkit/superflow-api.ts) and the page load
      // sits on top of that. A 90s budget failed here on a cold cache while
      // the same run passed standalone, which is a flaky gate rather than a
      // finding, and a flaky gate is one people learn to ignore.
      //
      // The text is matched loosely for the same reason. The dial reads "out
      // of 100" only when every check could run; when the render service is
      // unavailable it reads "of N scorable" instead, which is a healthy
      // degraded report, not a failure. Pinning the strict wording made this
      // gate go red on runs where nothing was wrong.
      await expect(
        page.getByText(/out of 100|scorable/).first(),
      ).toBeVisible({ timeout: RUN_TIMEOUT_MS });

      // "What we found" is the section that used to throw.
      await expect(
        page.getByRole("heading", { name: "What we found" }),
      ).toBeVisible();

      // The heading alone is a weak assertion: it renders whether or not a
      // single finding survived the trip. A category group heading only exists
      // when findings were actually mapped and grouped, so this is what proves
      // the backend's detached findings were reattached rather than dropped.
      await expect(
        page.getByRole("heading", {
          name: /^(Access|Readability|Structure|Identity)$/,
        }).first(),
      ).toBeVisible();

      expect(errors, `${testCase.slug} errors during run`).toEqual([]);
    });
  }
});

test.describe("the slow backend tools survive a real run", () => {
  // WHY THIS BLOCK EXISTS
  //
  // These three ran past the old in-request ceiling and answered "the check
  // took too long", while the backend returned a perfectly good result nobody
  // was left to collect. Timed against the production callable on 2026-09-02
  // over a heavy page: full page screenshot 72s, llms.txt generator 57s, alt
  // text generator 52s, against a 55 second ceiling.
  //
  // WHAT THIS DOES AND DOES NOT PROVE. The browser now sends `defer: true` on
  // every run, so each of these goes through the whole start, pending, poll and
  // collect path however fast the page is, and that is what they assert. They
  // do NOT re-prove the duration ceiling: a light page answers in twenty
  // seconds and would have passed under the old shape too. The ceiling itself
  // is gated by the persona review below, which cannot finish inside one
  // request no matter what you point it at.
  const CASES = [
    {
      slug: "full-page-screenshot",
      // The download link only renders once an image URL came back.
      marker: /Download PNG/,
    },
    {
      slug: "llms-txt-generator",
      // A file tab only exists once both files were generated.
      marker: /llms\.txt/,
    },
    {
      slug: "alt-text-generator",
      // Renders for both real outcomes: images with suggestions, and the
      // honest "this page has no images" answer.
      marker: /Check again fresh/,
    },
  ];

  for (const testCase of CASES) {
    test(`${testCase.slug} renders a result end to end`, async ({ page }) => {
      test.setTimeout(REVIEW_TEST_TIMEOUT_MS);
      const errors = collectErrors(page);

      // A cache-busting parameter, so the run is real every time. A fixed URL
      // is cached for 24 hours after the first run, which would answer the
      // second run in milliseconds and quietly stop exercising the wait.
      const subject = `https://usesuperflow.ai/?smoke=${Date.now()}`;

      await page.goto(`${toolPath(testCase.slug)}?url=${encodeURIComponent(subject)}`, {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByText(testCase.marker).first()).toBeVisible({
        timeout: REVIEW_RUN_TIMEOUT_MS,
      });

      // The failure this block was written for, asserted directly.
      await expect(
        page.getByText(/took too long|taking longer than usual/),
      ).toHaveCount(0);

      expect(errors, `${testCase.slug} errors during run`).toEqual([]);
    });
  }
});

test.describe("a persona review survives a real run", () => {
  // WHY THIS BLOCK EXISTS
  //
  // The persona reviews shipped answering "The check took too long" on every
  // single call. Nothing caught it: `tsc` passed, the route returned HTTP 200,
  // and the backend was healthy and returning a real review the whole time. The
  // defect was a ceiling — the site waited for the run inside one serverless
  // request, and these runs take two to three minutes against a 60 second
  // `maxDuration`, so the wait could only ever end in a timeout.
  //
  // The suite could not see it because the run assertions above cover the AI
  // visibility pair only, and those finish in about 35 seconds. So this drives
  // the slowest tool on the site through a browser, which is the only place the
  // ceiling is observable.
  //
  // It is deliberately ONE persona rather than all five: they share
  // ReviewTool and the runner in lib/tools/persona-review/run.ts, so a second
  // lens costs three more minutes of wall clock and asserts nothing new.
  test("review-like-paul-graham renders a verdict end to end", async ({ page }) => {
    test.setTimeout(REVIEW_TEST_TIMEOUT_MS);
    const errors = collectErrors(page);

    await page.goto(toolPath("review-like-paul-graham"), {
      waitUntil: "domcontentloaded",
    });

    // A REAL page, and a cache-busting parameter on it.
    //
    // Both halves matter. example.com is trivial enough that the whole run
    // finishes inside the old 55 second ceiling, so a test pointed at it goes
    // green against the very bug this block exists to catch. And a fixed URL is
    // cached for 24 hours after the first run, which would answer the second
    // run in milliseconds and quietly stop exercising the wait at all. The
    // parameter is ignored by the page and changes only the cache key.
    const subject = `https://usesuperflow.ai/?smoke=${Date.now()}`;

    // No deep-link auto-run on this surface, so the form is driven directly.
    //
    // The fill is retried until the button enables. The input is a controlled
    // React input, so a fill that lands before hydration sets the DOM value and
    // is then wiped by the first client render, leaving a filled-looking box
    // above a disabled button — a hydration race, not a tool failure.
    const input = page.getByLabel("URL to review");
    const submit = page.getByRole("button", { name: "Review my page" });

    await expect(async () => {
      await input.fill(subject);
      await expect(submit).toBeEnabled({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });

    await submit.click();

    // The verdict is the whole point of the tool, and it is the thing the
    // timeout replaced. A budget past three minutes is not padding: an
    // uncached persona run measured 118 to 153 seconds against the production
    // backend, and a gate that goes red on an honest run is one people learn
    // to ignore.
    await expect(page.locator("blockquote").first()).toBeVisible({
      timeout: REVIEW_RUN_TIMEOUT_MS,
    });

    // A severity group heading only exists once findings were mapped and
    // grouped, so this proves the findings survived the trip rather than that
    // a container rendered. The alternative branch is the route's own
    // "verdict but no findings" case, which is a healthy review.
    // The count rides inside the heading ("Worth changing 1"), so the name is
    // matched with the number rather than anchored without it.
    await expect(
      page
        .getByRole("heading", { name: /^(Fix this|Worth changing|Polish)\s*\d*$/ })
        .or(page.getByText(/Nothing else flagged/))
        .first(),
    ).toBeVisible();

    // The failure this block was written for, asserted directly: the timeout
    // copy must not be on the page next to a verdict that did arrive.
    await expect(page.getByText(/took too long|taking longer than usual/)).toHaveCount(0);

    expect(errors, "review-like-paul-graham errors during run").toEqual([]);
  });
});

test.describe("the favicon checker survives a real run", () => {
  // Its own describe rather than a third entry in CASES above: that block
  // waits on the score dial and the category groups, which are the AI
  // visibility report's shape and do not exist here. This tool renders a
  // verdict and a check list instead.
  test("favicon-checker renders a verdict end to end", async ({ page }) => {
    test.setTimeout(RUN_TEST_TIMEOUT_MS);
    const errors = collectErrors(page);

    // example.com is the deliberate case: it declares `href="data:,"` to
    // suppress the favicon entirely and has no /favicon.ico, so it exercises
    // the failing verdict path, which is the one with the most branches.
    await page.goto(
      `${toolPath("favicon-checker")}?url=${encodeURIComponent("https://example.com")}`,
      { waitUntil: "domcontentloaded" },
    );

    // The verdict heading only renders once a report is in hand.
    await expect(
      page.getByRole("heading", { name: /working favicon|favicon off on purpose/i }),
    ).toBeVisible({ timeout: RUN_TIMEOUT_MS });

    // The check list is the section that would throw if `checks` came back
    // undefined, which is the failure mode this whole suite exists for.
    await expect(
      page.getByRole("heading", { name: "What we checked" }),
    ).toBeVisible();

    // A check row proves the list was actually populated and mapped, not just
    // that its container heading rendered.
    await expect(
      page.getByText(/\/favicon\.ico/).first(),
    ).toBeVisible();

    expect(errors, "favicon-checker errors during run").toEqual([]);
  });
});

test.describe("the MCP server answers the protocol", () => {
  // These call the endpoint rather than a browser on purpose: MCP has no UI,
  // and the failure mode that matters is a client that cannot complete the
  // handshake or gets a tool list that does not match what the site documents.

  /** One JSON-RPC round trip against the endpoint. */
  async function rpc(
    request: APIRequestContext,
    body: Record<string, unknown>,
  ): Promise<{ status: number; payload: Record<string, unknown> }> {
    const response = await request.post(MCP_PATH, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      data: body,
    });
    const status = response.status();
    const text = await response.text();
    return {
      status,
      payload: text ? (JSON.parse(text) as Record<string, unknown>) : {},
    };
  }

  test("initialize returns a protocol version and the server identity", async ({
    request,
  }) => {
    const { payload } = await rpc(request, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: "smoke", version: "1" },
      },
    });

    const result = payload.result as Record<string, unknown>;
    expect(result?.protocolVersion).toBe(MCP_PROTOCOL_VERSION);
    expect((result?.serverInfo as { name?: string })?.name).toBe(
      MCP_SERVER_NAME,
    );
    expect(result?.capabilities).toHaveProperty("tools");
  });

  test("a notification gets 202 and no body", async ({ request }) => {
    const response = await request.post(MCP_PATH, {
      headers: { "Content-Type": "application/json" },
      data: { jsonrpc: "2.0", method: "notifications/initialized" },
    });
    expect(response.status()).toBe(202);
  });

  test("tools/list matches the catalogue the site documents", async ({
    request,
  }) => {
    const { payload } = await rpc(request, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    });

    const tools = (payload.result as { tools?: Array<{ name: string }> })?.tools;
    expect(tools?.map((tool) => tool.name).sort()).toEqual(
      availableToolApis()
        .map((entry) => entry.mcpTool)
        .sort(),
    );
  });

  test("tools/call runs a tool and returns its JSON", async ({ request }) => {
    // The MD5 tool is the one call in the suite with a known-constant answer
    // and no network of its own, so it proves the dispatch path — MCP to the
    // published HTTP endpoint and back — without depending on any live site.
    const { payload } = await rpc(request, {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "hash_md5", arguments: { text: "hello" } },
    });

    const result = payload.result as {
      isError?: boolean;
      structuredContent?: { md5?: string };
    };
    expect(result?.isError).toBe(false);
    expect(result?.structuredContent?.md5).toBe(
      "5d41402abc4b2a76b9719d911017c592",
    );
  });

  test("a missing required argument comes back as a tool error", async ({
    request,
  }) => {
    // Reported through the result rather than as a JSON-RPC error, because the
    // model is the party that can fix it and only tool results reliably reach
    // it.
    const { payload } = await rpc(request, {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "detect_tech_stack", arguments: {} },
    });

    const result = payload.result as { isError?: boolean };
    expect(result?.isError).toBe(true);
  });

  test("an unknown method is a JSON-RPC error, not a 500", async ({
    request,
  }) => {
    const { status, payload } = await rpc(request, {
      jsonrpc: "2.0",
      id: 5,
      method: "resources/list",
    });

    expect(status).toBe(200);
    expect((payload.error as { code?: number })?.code).toBe(-32601);
  });

  test("GET describes the endpoint instead of erroring blankly", async ({
    request,
  }) => {
    const response = await request.get(MCP_PATH);
    // 405 is the spec's answer for a server with no server-initiated stream;
    // the body is there so a human who pastes the URL into a browser learns
    // what it is.
    expect(response.status()).toBe(405);
    expect((await response.json()).name).toBe(MCP_SERVER_NAME);
  });
});

test.describe("every published endpoint is documented where people look", () => {
  test("the reference page lists every available tool", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/tools/mcp", { waitUntil: "domcontentloaded" });

    for (const entry of availableToolApis()) {
      await expect(
        page.getByText(entry.mcpTool, { exact: true }).first(),
        `${entry.mcpTool} listed on /tools/mcp`,
      ).toBeVisible();
    }

    expect(errors, "/tools/mcp console/page errors").toEqual([]);
  });

  test("the Markdown copy is served as Markdown", async ({ request }) => {
    const response = await request.get("/tools/mcp.md");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/markdown");
    expect(await response.text()).toContain(MCP_PATH);
  });

  for (const entry of availableToolApis()) {
    test(`${entry.slug} page shows its endpoint and MCP tool name`, async ({
      page,
    }) => {
      await page.goto(toolPath(entry.slug), { waitUntil: "domcontentloaded" });

      const section = page.locator("#api");
      await expect(section).toBeVisible();
      // The tool name is on the page as prose; the calls themselves are one
      // click away, which is the whole point of the disclosure.
      await expect(
        section.getByText(entry.mcpTool, { exact: true }).first(),
      ).toBeVisible();

      await section.locator("summary").first().click();
      await expect(
        section.getByText(entry.path, { exact: false }).first(),
      ).toBeVisible();
    });
  }
});

test.describe("the endpoints answer directly", () => {
  test("the UTM builder normalises and reports its channel", async ({
    request,
  }) => {
    const response = await request.post("/api/tools/utm-builder", {
      data: {
        url: "example.com/pricing",
        source: "Newsletter",
        medium: "email",
        campaign: "Spring Launch",
      },
    });

    const payload = await response.json();
    expect(payload.ok).toBe(true);
    // Casing and spaces normalised, which is the entire point of the tool:
    // "Newsletter" and "newsletter" must not become two rows in GA4.
    expect(payload.url).toContain("utm_source=newsletter");
    expect(payload.url).toContain("utm_campaign=spring_launch");
    expect(payload.channel).toBe("Email");
  });

  test("a non-http destination is refused rather than tagged", async ({
    request,
  }) => {
    const response = await request.post("/api/tools/utm-builder", {
      data: { url: "javascript:alert(1)" },
    });

    const payload = await response.json();
    expect(payload.ok).toBe(false);
    expect(response.status()).toBe(400);
  });
});
