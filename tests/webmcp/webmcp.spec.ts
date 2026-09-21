// WebMCP tool registration.
//
// WHY THIS FILE EXISTS
//
// WebMCP is an origin trial: the API is absent from the browser Playwright
// drives, so nothing here can wait for a real `document.modelContext` to
// appear. Instead each test installs a stub at that name BEFORE the page's
// scripts run and records what the site registers against it. That tests the
// thing that can actually break - which tools a page registers, under which
// names, with which schemas, and whether they unregister on navigation -
// without depending on a Chrome version or a trial token.
//
// The one thing it deliberately does NOT test is the browser's own behaviour.
// If Chrome changes how `registerTool` validates a descriptor, this suite
// still passes; that is what the feature detection and the try/catch in
// WebMcpProvider are for.
//
//   npx playwright test tests/webmcp

import { test, expect, type Page } from "@playwright/test";
import { availableToolApis } from "../../lib/tools/api-catalog";

type Recorded = { name: string; title?: string; description: string; inputSchema?: unknown };

/**
 * Installs a fake WebMCP API that records registrations and aborts.
 *
 * Runs as an init script so it is in place before any of the page's own
 * JavaScript, which is the only way to catch a registration that happens on
 * mount.
 *
 * @param page - The Playwright page.
 * @param where - Which surface to expose the stub on.
 */
async function stubModelContext(page: Page, where: "document" | "navigator" = "document") {
  await page.addInitScript((surface) => {
    const registered: Recorded[] = [];
    const unregistered: string[] = [];
    const handlers = new Map<string, (input: unknown, options: unknown) => Promise<unknown>>();
    const api = {
      registerTool(
        tool: Recorded & { execute: (input: unknown, options: unknown) => Promise<unknown> },
        options?: { signal?: AbortSignal },
      ) {
        registered.push({
          name: tool.name,
          title: tool.title,
          description: tool.description,
          inputSchema: tool.inputSchema,
        });
        handlers.set(tool.name, tool.execute);
        options?.signal?.addEventListener("abort", () => unregistered.push(tool.name));
        return Promise.resolve();
      },
    };
    const target = surface === "document" ? document : navigator;
    Object.defineProperty(target, "modelContext", { value: api, configurable: true });
    Object.defineProperty(window, "__webmcp", {
      value: {
        registered,
        unregistered,
        // The agent calls execute with (input, { signal }); so does this.
        call: (name: string, input: unknown) =>
          handlers.get(name)!(input ?? {}, { signal: undefined }),
      },
      configurable: true,
    });
  }, where);
}

/** What the page registered, once the effect has run. */
async function registrations(page: Page): Promise<Recorded[]> {
  await expect
    .poll(async () => page.evaluate(() => window.__webmcp?.registered.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);
  return page.evaluate(() => window.__webmcp!.registered);
}

const SITE_TOOLS = [
  "superflow_read_current_page",
  "superflow_read_page",
  "superflow_list_pages",
];

test.describe("WebMCP registration", () => {
  test("every page registers the site tools", async ({ page }) => {
    await stubModelContext(page);
    await page.goto("/pricing");
    const names = (await registrations(page)).map((t) => t.name);
    for (const tool of SITE_TOOLS) expect(names).toContain(tool);
  });

  test("finds the API on navigator when that is where it lives", async ({ page }) => {
    // Chrome 149 exposes only navigator.modelContext. The detection has to
    // fall back to it, or the whole origin trial's first release is missed.
    await stubModelContext(page, "navigator");
    await page.goto("/pricing");
    const names = (await registrations(page)).map((t) => t.name);
    expect(names).toContain("superflow_read_current_page");
  });

  test("a tool page also registers its own tool, and only its own", async ({ page }) => {
    await stubModelContext(page);
    await page.goto("/tools/favicon-checker");
    const names = (await registrations(page)).map((t) => t.name);
    expect(names).toContain("check_favicon");
    // The other thirteen belong on /tools and /api/mcp, not on this page.
    expect(names).not.toContain("detect_tech_stack");
    expect(names.length).toBe(SITE_TOOLS.length + 1);
  });

  test("the tools index registers the whole live suite", async ({ page }) => {
    await stubModelContext(page);
    await page.goto("/tools");
    const names = (await registrations(page)).map((t) => t.name);
    for (const entry of availableToolApis()) expect(names).toContain(entry.mcpTool);
  });

  test("free tools carry the same names and schemas as the MCP server", async ({ page }) => {
    // The whole point of building these from lib/tools/api-catalog.ts is that
    // the two surfaces cannot drift. This is the assertion that holds it.
    await stubModelContext(page);
    await page.goto("/tools");
    const byName = new Map((await registrations(page)).map((t) => [t.name, t]));
    for (const entry of availableToolApis()) {
      const tool = byName.get(entry.mcpTool);
      expect(tool, `${entry.mcpTool} should be registered`).toBeTruthy();
      expect(tool!.title).toBe(entry.title);
      expect(tool!.inputSchema).toEqual(entry.inputSchema);
      expect(tool!.description).toContain(entry.description);
      // An agent that does not know the limit burns it on retries.
      expect(tool!.description).toContain(entry.rateLimit);
    }
  });

  test("a client-side navigation unregisters the page's tools", async ({ page }) => {
    // This is the case the AbortController exists for. A full page load tears
    // the document down and takes the registrations with it regardless; an
    // in-app navigation does not, so without the cleanup a visitor who browsed
    // four tool pages would leave an agent looking at four stale tools.
    await stubModelContext(page);
    await page.goto("/tools/favicon-checker");
    expect((await registrations(page)).map((t) => t.name)).toContain("check_favicon");

    await page.getByRole("link", { name: "Blog", exact: true }).first().click();
    await page.waitForURL("**/blog");

    // Same document: if this had been a full load the recorder would be empty.
    const state = await page.evaluate(() => ({
      unregistered: window.__webmcp?.unregistered ?? [],
      registered: (window.__webmcp?.registered ?? []).map((t) => t.name),
    }));
    expect(state.unregistered).toContain("check_favicon");
    for (const tool of SITE_TOOLS) expect(state.unregistered).toContain(tool);
    // ...and the new page registered its own set afterwards.
    expect(state.registered.filter((n) => n === "superflow_read_current_page").length).toBe(2);
  });

  test("the site tools actually return the page copy when executed", async ({ page }) => {
    // Registration is only half of it: these handlers fetch the .md surface,
    // and a path bug there produces tools that list fine and fail on call.
    await stubModelContext(page);
    await page.goto("/pricing");
    await registrations(page);

    const current = (await page.evaluate(() =>
      window.__webmcp!.call("superflow_read_current_page"),
    )) as { path: string; markdown: string };
    expect(current.path).toBe("/pricing");
    expect(current.markdown.length).toBeGreaterThan(200);
    expect(current.markdown).not.toContain("<!DOCTYPE");

    const other = (await page.evaluate(() =>
      window.__webmcp!.call("superflow_read_page", { path: "/security" }),
    )) as { markdown: string };
    expect(other.markdown.length).toBeGreaterThan(200);

    // The homepage is published at /index.md, not /.md - the one path in the
    // convention that needs special-casing.
    const home = (await page.evaluate(() =>
      window.__webmcp!.call("superflow_read_page", { path: "/" }),
    )) as { markdown: string };
    expect(home.markdown.length).toBeGreaterThan(200);

    const index = (await page.evaluate(() =>
      window.__webmcp!.call("superflow_list_pages"),
    )) as { index: string };
    expect(index.index).toContain("/pricing");
  });

  test("a free tool executes against its real endpoint", async ({ page }) => {
    await stubModelContext(page);
    await page.goto("/tools/md5-generator");
    const names = (await registrations(page)).map((t) => t.name);
    expect(names).toContain("hash_md5");

    const result = (await page.evaluate(() =>
      window.__webmcp!.call("hash_md5", { text: "superflow" }),
    )) as Record<string, unknown>;
    // md5("superflow"), computed independently.
    expect(JSON.stringify(result)).toContain("b5b156e5a68ac75d4b0174c98227fc13");
  });

  test("a failing tool call explains itself instead of returning undefined", async ({ page }) => {
    await stubModelContext(page);
    await page.goto("/pricing");
    await registrations(page);
    const message = await page.evaluate(async () => {
      try {
        await window.__webmcp!.call("superflow_read_page", { path: "/no-such-page-here" });
        return "(no error)";
      } catch (error) {
        return String((error as Error).message);
      }
    });
    // An agent that is told the path was wrong can fix the call; one handed
    // `undefined` retries the same thing.
    expect(message).toContain("/no-such-page-here");
    expect(message).toContain("superflow_list_pages");
  });

  test("renders nothing and throws nothing without the API", async ({ page }) => {
    // The state nearly every visitor is in today.
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto("/pricing");
    expect(
      await page.evaluate(
        () => "modelContext" in document || "modelContext" in navigator,
      ),
    ).toBe(false);
    expect(errors).toEqual([]);
  });
});

declare global {
  interface Window {
    __webmcp?: {
      registered: Recorded[];
      unregistered: string[];
      call: (name: string, input?: unknown) => Promise<unknown>;
    };
  }
}
