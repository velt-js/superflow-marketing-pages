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
