// The machine-readable surface: Markdown copies, content negotiation, the
// .well-known endpoints, and the headers that advertise all of it.
//
// WHY THIS FILE EXISTS
//
// Every check here covers something that fails silently. A page renders
// perfectly in a browser while its .md twin 404s; a `Link` header added in
// next.config.ts REPLACES the one a route handler set, quietly dropping the
// canonical that stops an agent treating the copy and the page as competing
// documents (that exact regression happened once already, to the tool copies);
// proxy.ts is one regex away from swallowing /docs, which is reverse-proxied to
// Mintlify and publishes its own Markdown. None of it shows up in `tsc`, in
// `next build`, or on screen.
//
// Run against a local server (default) or any deployment:
//   npx playwright test tests/seo/agent-surface.spec.ts
//   TOOLS_BASE_URL=https://usesuperflow.ai npx playwright test tests/seo

import { test, expect, type APIRequestContext } from "@playwright/test";
import { MCP_PATH } from "../../lib/tools/api-catalog";

/** A browser's Accept header, verbatim from Chrome. */
const BROWSER_ACCEPT =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";

/**
 * One page per template, so a builder that breaks for exactly one document
 * type is caught. These are stable published slugs; if one is retired, replace
 * it rather than deleting the case.
 */
const PAGES_BY_TEMPLATE: { label: string; path: string }[] = [
  { label: "homepage", path: "/index" },
  { label: "static (pricing)", path: "/pricing" },
  { label: "static (security)", path: "/security" },
  { label: "feature page", path: "/ai-review-agents" },
  { label: "review surface", path: "/image-review" },
  { label: "blog post", path: "/blog/bugherd-alternatives-comparison" },
  { label: "comparison", path: "/comparisons/superflow-vs-bugherd" },
  { label: "blog hub", path: "/blog" },
  { label: "integrations hub", path: "/integrations" },
];

/** Fetches a URL without following redirects. */
async function get(request: APIRequestContext, path: string, headers?: Record<string, string>) {
  return request.get(path, { headers, maxRedirects: 0 });
}

test.describe("Markdown copies", () => {
  for (const { label, path } of PAGES_BY_TEMPLATE) {
    test(`${label} publishes a Markdown copy at ${path}.md`, async ({ request }) => {
      const response = await get(request, `${path}.md`);

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/markdown");

      const body = await response.text();
      // An H1 and the provenance line are the two things every copy has. A
      // document missing either is a stub, and a stub that answers 200 is
      // worse than a 404 because nothing downstream notices.
      expect(body).toMatch(/^# \S/m);
      expect(body).toContain("published for AI agents and scripts");
      expect(body).toContain("## Key facts");
      // A builder that silently found no content still emits the scaffolding,
      // so assert there is actually a document here.
      expect(body.length).toBeGreaterThan(400);
    });
  }

  test("a Markdown copy points back at the HTML page as canonical", async ({ request }) => {
    const response = await get(request, "/ai-review-agents.md");
    const link = response.headers()["link"] ?? "";

    // The regression this guards: a config-level `Link` header matching the
    // same path replaces this one instead of adding to it.
    expect(link).toContain('rel="canonical"');
    expect(link).toContain("/ai-review-agents>");
  });

  test("the hand-authored tool copies still own /tools/*.md", async ({ request }) => {
    // proxy.ts must not route these to the generic generator: they are
    // generated at build time, served from the CDN, and written by hand.
    const response = await get(request, "/tools/utm-builder.md");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/markdown");
    expect(response.headers()["link"] ?? "").toContain('rel="canonical"');
  });

  test("a path with no page 404s rather than serving a stub", async ({ request }) => {
    const response = await get(request, "/this-page-does-not-exist-9f3a.md");
    expect(response.status()).toBe(404);
  });

  test("a held integration has no Markdown copy either", async ({ request }) => {
    // HELD_INTEGRATION_SLUGS must gate every published surface, this one
    // included - otherwise the .md becomes the leak the HTML route prevents.
    const response = await get(request, "/integrations/figma.md");
    expect(response.status()).toBe(404);
  });
});

test.describe("Content negotiation", () => {
  test("Accept: text/markdown returns Markdown for the page URL", async ({ request }) => {
    const response = await get(request, "/ai-review-agents", { Accept: "text/markdown" });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/markdown");
  });

  test("a weighted Accept still resolves to Markdown", async ({ request }) => {
    const response = await get(request, "/pricing", {
      Accept: "text/markdown;q=0.9, text/html;q=0.8",
    });
    expect(response.headers()["content-type"]).toContain("text/markdown");
  });

  test("a browser still gets HTML", async ({ request }) => {
    const response = await get(request, "/ai-review-agents", { Accept: BROWSER_ACCEPT });
    expect(response.headers()["content-type"]).toContain("text/html");
  });

  test("a wildcard Accept still gets HTML", async ({ request }) => {
    // curl's default. Negotiating this into Markdown would change what every
    // naive client sees.
    const response = await get(request, "/pricing", { Accept: "*/*" });
    expect(response.headers()["content-type"]).toContain("text/html");
  });
});

test.describe("Discovery endpoints", () => {
  test("the agent card names the real endpoints", async ({ request }) => {
    const response = await get(request, "/.well-known/agent-card.json");
    expect(response.status()).toBe(200);

    const card = (await response.json()) as {
      name?: string;
      skills?: unknown[];
      endpoints?: Record<string, string>;
    };
    expect(card.name).toBe("Superflow");
    expect(Array.isArray(card.skills) && card.skills.length).toBeTruthy();
    expect(card.endpoints?.mcp).toContain(MCP_PATH);
    expect(card.endpoints?.llmsTxt).toContain("/llms.txt");
  });

  test("the MCP server card lists the tools the server actually serves", async ({ request }) => {
    const response = await get(request, "/.well-known/mcp/server-card.json");
    expect(response.status()).toBe(200);

    const card = (await response.json()) as {
      url?: string;
      transport?: string;
      tools?: { name?: string; inputSchema?: unknown }[];
    };
    expect(card.url).toContain(MCP_PATH);
    expect(card.transport).toBe("http");

    const tools = card.tools ?? [];
    expect(tools.length).toBeGreaterThan(0);
    // A card that advertises a tool without a schema cannot be called from.
    for (const tool of tools) {
      expect(tool.name, "every advertised tool is named").toBeTruthy();
      expect(tool.inputSchema, `${tool.name} has an input schema`).toBeTruthy();
    }
  });

  test("the API catalog is a linkset", async ({ request }) => {
    const response = await get(request, "/.well-known/api-catalog");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("linkset+json");

    const body = (await response.json()) as { linkset?: { anchor?: string }[] };
    expect((body.linkset ?? []).length).toBeGreaterThan(0);
    expect(body.linkset?.[0]?.anchor).toContain(MCP_PATH);
  });

  test("/.well-known/llms.txt points at the canonical index", async ({ request }) => {
    const response = await get(request, "/.well-known/llms.txt");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("/llms.txt");
  });
});

test.describe("Advertising the surface", () => {
  test("an HTML page links its Markdown copy", async ({ request }) => {
    const html = await (await get(request, "/ai-review-agents")).text();
    expect(html).toContain('rel="alternate"');
    expect(html).toContain("/ai-review-agents.md");
  });

  test("an HTML page carries the discovery Link header", async ({ request }) => {
    const link = (await get(request, "/ai-review-agents")).headers()["link"] ?? "";
    for (const rel of ["llms-txt", "llms-full-txt", "agent-card", "mcp-server-card", "api-catalog"]) {
      expect(link, `Link header advertises rel="${rel}"`).toContain(`rel="${rel}"`);
    }
  });

  test("llms.txt names the Markdown copy of every page it lists", async ({ request }) => {
    const body = await (await get(request, "/llms.txt")).text();

    expect(body).toContain("/index.md");
    expect(body).toContain("Accept: text/markdown");

    const entries = body.split("\n").filter((line) => line.startsWith("- ["));
    expect(entries.length).toBeGreaterThan(20);
    // Every listed page is a promise that its copy exists.
    for (const entry of entries) {
      expect(entry, `entry names a .md copy: ${entry}`).toMatch(/\.md$/);
    }
  });

  test("robots.txt welcomes the crawlers that matter and names the endpoints", async ({
    request,
  }) => {
    const body = await (await get(request, "/robots.txt")).text();

    // Training crawlers, retrieval agents, and Common Crawl, which feeds most
    // open training corpora. Losing any one of these costs a different thing.
    for (const bot of [
      "GPTBot",
      "ChatGPT-User",
      "ClaudeBot",
      "Claude-User",
      "PerplexityBot",
      "Perplexity-User",
      "Google-Extended",
      "Applebot-Extended",
      "CCBot",
      "meta-externalagent",
    ]) {
      expect(body, `robots.txt names ${bot}`).toContain(`User-agent: ${bot}`);
    }

    expect(body).toContain("/llms.txt");
    expect(body).toContain("/.well-known/agent-card.json");
    // The MCP server is allowed back out of the blanket /api/ disallow.
    expect(body).toContain(`Allow: ${MCP_PATH}`);
  });
});

test.describe("Paths the proxy must not touch", () => {
  test("/docs is left to Mintlify", async ({ request }) => {
    // Mintlify publishes its own .md copies. Answering /docs/*.md from this app
    // would replace a real document with a 404.
    const response = await get(request, "/docs");
    expect(response.headers()["content-type"] ?? "").not.toContain("text/markdown");
  });

  test("the tools index keeps its own route", async ({ request }) => {
    const response = await get(request, "/tools.md");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("# Superflow free tools");
  });
});
