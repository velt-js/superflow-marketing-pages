// /state-of-website-qa: the report page, its form, and the lead endpoint.
//
// Runs against a production build (see playwright.config.ts). With no
// Customer.io env set the endpoint stores and sends nothing, which is the
// state these tests want: they check the page's behaviour and that a backend
// that is off still hands over the PDF.

import { test, expect, type Page } from "@playwright/test";

const PATH = "/state-of-website-qa";
const PDF = "/reports/state-of-website-qa-2026.pdf";

/** Every number the brief approves, as the page writes them. */
const APPROVED = [
  "505,857",
  "63,000+",
  "1,200+",
  "34%",
  "22%",
  "43%",
  "1 in 9",
  "1%",
  "5 to 1",
  "3 of 4",
];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
}

test("the page is server-rendered with a 200", async ({ request }) => {
  const response = await request.get(PATH);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("The State of Website QA 2026");
  expect(html).toContain('"@type":"Report"');
  expect(html).toContain("<title>The State of Website QA 2026 | Superflow</title>");
});

test("the copy has no em dashes and only approved numbers", async ({ page }) => {
  await page.goto(PATH);
  // The round shares are drawn once the benchmark is answered.
  await page.getByRole("button", { name: "3 to 4", exact: true }).click();
  const text = await page.locator("main").innerText();
  expect(text).not.toContain("—");
  for (const value of APPROVED) expect(text).toContain(value);
  expect(text).not.toMatch(/\b1M\b/);
});

test("the benchmark shows the right line for each answer", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(PATH);

  const lines: Record<string, string> = {
    "1 to 2": "Faster than most. Only about 1 in 3 sites ships in 1 or 2 rounds.",
    "3 to 4": "Right in the middle. The typical site takes 4 rounds.",
    "5 or more": "You're not alone. 43% of sites take 5 or more rounds.",
  };
  for (const [answer, line] of Object.entries(lines)) {
    const button = page.getByRole("button", { name: answer, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("status").filter({ hasText: line })).toBeVisible();
  }
  await expect(
    page.getByText("The full report shows what fills those rounds"),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("a bad email is reported inline and what was typed is kept", async ({ page }) => {
  await page.goto(PATH);
  const form = page.locator("#report-form");
  const email = form.getByLabel("Work email");
  await email.fill("not-an-email");
  await form.getByLabel(/Agency website/).fill("acme.studio");
  await form.getByRole("button", { name: "Get the report" }).click();

  await expect(form.getByText("Enter a valid email")).toBeVisible();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toBeFocused();
  await expect(email).toHaveValue("not-an-email");
  await expect(form.getByLabel(/Agency website/)).toHaveValue("acme.studio");
});

test("submitting shows the thank-you state and starts the download", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(`${PATH}?source=newsletter&utm_source=li&utm_campaign=launch`);
  await page.getByRole("button", { name: "5 or more", exact: true }).click();

  let posted: Record<string, unknown> = {};
  page.on("request", (req) => {
    if (req.url().includes("/api/leads/state-of-website-qa")) posted = req.postDataJSON();
  });

  const form = page.locator("#report-form");
  await form.getByLabel("Work email").fill("lead@example.com");
  await form.getByLabel(/Your role/).selectOption("owner-founder");
  const download = page.waitForEvent("download");
  await form.getByRole("button", { name: "Get the report" }).click();

  expect((await download).url()).toContain(PDF);
  await expect(page.getByRole("heading", { name: "Your report is ready." }).first()).toBeVisible();
  await expect(page.getByText("You said your sites take 5 or more rounds.").first()).toBeVisible();

  expect(posted).toMatchObject({
    email: "lead@example.com",
    role: "owner-founder",
    source: "newsletter",
    utm_source: "li",
    utm_campaign: "launch",
    benchmark_rounds: "5+",
    page: PATH,
  });

  const scan = page.getByRole("link", { name: "Scan your website" }).first();
  const href = new URL((await scan.getAttribute("href")) ?? "");
  expect(href.origin + href.pathname).toBe("https://app.usesuperflow.com/signup");
  expect(href.searchParams.get("source")).toBe("newsletter");
  expect(href.searchParams.get("utm_source")).toBe("li");
  expect(href.searchParams.get("ref")).toBe("state-of-website-qa");

  await expect(page.getByRole("link", { name: "Download the PDF" }).first()).toHaveAttribute(
    "href",
    PDF,
  );
  expect(errors).toEqual([]);
});

test("a form post without JavaScript still gets the PDF", async ({ request }) => {
  const response = await request.post("/api/leads/state-of-website-qa", {
    form: { email: "nojs@example.com", page: PATH },
    headers: { referer: `http://127.0.0.1${PATH}?source=old-iphone` },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(303);
  expect(response.headers()["location"]).toContain(PDF);
});

test("the endpoint rejects a bad email and swallows the honeypot", async ({ request }) => {
  const bad = await request.post("/api/leads/state-of-website-qa", {
    data: { email: "nope" },
  });
  expect(bad.status()).toBe(400);
  expect((await bad.json()).errors.email).toBeTruthy();

  const bot = await request.post("/api/leads/state-of-website-qa", {
    data: { email: "bot@example.com", company_fax: "123" },
  });
  expect(bot.status()).toBe(200);
  expect((await bot.json()).downloadUrl).toBe(PDF);
});

test("finding anchors exist and share links carry the finding", async ({ page }) => {
  await page.goto(`${PATH}#finding-4`);
  for (let n = 1; n <= 6; n += 1) await expect(page.locator(`#finding-${n}`)).toHaveCount(1);

  const linkedIn = page.locator("#finding-4").getByRole("link", { name: "Share on LinkedIn" });
  const href = new URL((await linkedIn.getAttribute("href")) ?? "");
  expect(href.hostname).toBe("www.linkedin.com");
  const text = href.searchParams.get("text") ?? "";
  expect(text).toContain("missing links beat broken links 5 to 1");
  expect(text).toContain("https://usesuperflow.ai/state-of-website-qa#finding-4");
});

test("the email download link redirects to the PDF", async ({ request }) => {
  const response = await request.get(
    `${PATH}/download?source=state-of-website-qa-email&lid=test`,
    { maxRedirects: 0 },
  );
  expect(response.status()).toBe(302);
  expect(response.headers()["location"]).toContain(PDF);
});

test("the PDF is served but not indexed", async ({ request }) => {
  const response = await request.get(PDF);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect(response.headers()["x-robots-tag"]).toBe("noindex");
});

test("the page has a Markdown copy", async ({ request }) => {
  const response = await request.get(`${PATH}.md`);
  expect(response.status()).toBe(200);
  const md = await response.text();
  expect(md).toContain("# The State of Website QA 2026");
  expect(md).toContain("4 review rounds per site. 43% take 5 or more.");
  expect(md).not.toContain("—");
});
