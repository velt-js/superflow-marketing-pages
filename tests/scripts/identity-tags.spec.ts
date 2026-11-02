// The visitor-identification tags (RB2B, Claydar, Snitcher) must be in the
// SERVER HTML of every page, not injected after hydration. See the IDENTITY
// TAGS note in components/scripts/ThirdPartyScripts.tsx for why.
//
// That property is invisible in a browser: a tag moved onto next/script still
// "works" on screen, it just loses every visitor who leaves before hydration.
// So this reads the raw HTML over HTTP, one page per template, blog included.
//
// Run against a local server (default) or any deployment:
//   npx playwright test tests/scripts/identity-tags.spec.ts
//   TOOLS_BASE_URL=https://usesuperflow.ai npx playwright test tests/scripts

import { test, expect } from "@playwright/test";

/** One page per template. Replace a retired slug rather than deleting it. */
const PAGES: { label: string; path: string }[] = [
  { label: "homepage", path: "/" },
  { label: "static (pricing)", path: "/pricing" },
  { label: "blog hub", path: "/blog" },
  { label: "blog post", path: "/blog/bugherd-alternatives-comparison" },
  { label: "comparison", path: "/comparisons/superflow-vs-bugherd" },
  { label: "free tool", path: "/tools" },
];

/** Tag id in the HTML, plus a string that proves it carries our account id. */
const IDENTITY_TAGS: { name: string; id: string; accountId: string }[] = [
  { name: "RB2B", id: "rb2b", accountId: "Q6J2RH2WVE6D" },
  { name: "Claydar", id: "claydar", accountId: "cgBo1m1XAw" },
  { name: "Snitcher Radar", id: "snitcher-radar", accountId: "roakcpqQfkP" },
];

for (const { label, path } of PAGES) {
  test(`${label} (${path}) server-renders every identity tag in <body>`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status(), `${path} status`).toBe(200);
    const html = await res.text();
    const bodyStart = html.indexOf("<body");
    expect(bodyStart, "<body> in HTML").toBeGreaterThan(-1);

    for (const { name, id, accountId } of IDENTITY_TAGS) {
      const tagStart = html.indexOf(`<script id="${id}"`);
      expect(tagStart, `${name} <script id="${id}"> in server HTML`).toBeGreaterThan(-1);
      expect(tagStart, `${name} rendered inside <body>`).toBeGreaterThan(bodyStart);
      const tag = html.slice(tagStart, html.indexOf("</script>", tagStart));
      expect(tag, `${name} carries account id`).toContain(accountId);
      // Rendered exactly once, or the vendor double-counts.
      expect(html.split(`<script id="${id}"`).length - 1, `${name} count`).toBe(1);
    }
  });
}
