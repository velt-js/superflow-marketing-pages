import { test, expect } from "@playwright/test";
import { POST } from "../../../app/api/tools/meeting-planner/route";
import { toolToMarkdown } from "../../../lib/tools/content/to-markdown";
import { findToolContent } from "../../../lib/tools/content";

const path = "/api/tools/meeting-planner";
const sample = { locations: ["India"], date: "2026-09-09" };

test("uncached tool Markdown does not advertise refresh or cached results", () => {
  for (const slug of ["meeting-planner", "utm-builder", "md5-generator"]) {
    const markdown = toolToMarkdown(findToolContent(slug)!);
    expect(markdown).toContain("## Call it directly");
    expect(markdown).not.toContain('"refresh": true');
    expect(markdown).not.toContain("Results are cached for 24 hours per URL");
  }
  // Cached tools must retain the supported refresh instructions.
  const cached = toolToMarkdown(findToolContent("tech-stack-detector")!);
  expect(cached).toContain('"refresh": true');
  expect(cached).toContain("Results are cached for 24 hours per URL");
});

test("all planner failure responses have a stable code and readable message", async () => {
  const cases: [string | undefined, number, string][] = [
    [undefined, 400, "bad-request"],
    ["{", 400, "bad-request"],
    ["null", 400, "invalid-input"],
    [JSON.stringify({ ...sample, date: "2026-02-30" }), 400, "invalid-input"],
    [JSON.stringify({ ...sample, durationMinutes: 31 }), 400, "invalid-input"],
    [JSON.stringify({ ...sample, workStart: "9am" }), 400, "invalid-input"],
    [
      JSON.stringify({ ...sample, locations: ["USA"] }),
      400,
      "ambiguous-location",
    ],
    [
      JSON.stringify({ ...sample, locations: ["Notarealcityxyz"] }),
      400,
      "location-not-found",
    ],
    [JSON.stringify({ text: "x".repeat(16_384) }), 413, "payload-too-large"],
  ];
  for (const [body, status, code] of cases) {
    const response = await POST(
      new Request(`https://usesuperflow.ai${path}`, { method: "POST", body }),
    );
    expect(response.status).toBe(status);
    expect(await response.json()).toMatchObject({
      ok: false,
      code,
      message: expect.any(String),
    });
  }
  // Exercise the catch-all path without depending on filesystem or network failures.
  const broken = new Request(`https://usesuperflow.ai${path}`, {
    method: "POST",
    body: "{}",
  });
  await broken.text();
  const unexpected = await POST(broken);
  expect(unexpected.status).toBe(500);
  expect(await unexpected.json()).toMatchObject({
    ok: false,
    code: "internal",
    message: expect.any(String),
  });
});

test("published planner errors keep their codes over HTTP and MCP", async ({
  request,
}) => {
  const input = { ...sample, date: "2026-02-30" };
  const response = await request.post(path, { data: input });
  expect(response.status()).toBe(400);
  const error = await response.json();
  expect(error).toMatchObject({
    ok: false,
    code: "invalid-input",
    message: expect.any(String),
  });
  const mcp = await request.post("/api/mcp", {
    data: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "find_meeting_times", arguments: input },
    },
  });
  expect((await mcp.json()).result).toMatchObject({
    isError: true,
    structuredContent: error,
  });
});

test("published Markdown documents caching only for tools that support refresh", async ({
  request,
}) => {
  for (const slug of ["meeting-planner", "utm-builder", "md5-generator"]) {
    const response = await request.get(`/tools/${slug}.md`);
    expect(response.status()).toBe(200);
    const markdown = await response.text();
    expect(markdown).toContain("## Call it directly");
    expect(markdown).not.toContain('"refresh": true');
    expect(markdown).not.toContain("Results are cached for 24 hours per URL");
  }
  const cached = await request.get("/tools/tech-stack-detector.md");
  expect(cached.status()).toBe(200);
  expect(await cached.text()).toContain('"refresh": true');
});
