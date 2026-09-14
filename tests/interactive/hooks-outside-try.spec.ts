// Interactivity smoke tests for the three components whose hooks were moved
// out of their try/catch.
//
// WHY THIS FILE EXISTS
//
// Those components were written as `try { ...hooks...; return <JSX/> } catch {
// return null }`. If anything between two hook calls throws, the catch returns
// null having run fewer hooks than the previous render, and React crashes on
// the NEXT render with "rendered fewer hooks than expected" - a failure that
// points at a component nowhere near the actual throw. Moving the hooks above
// the try fixes that, and leaves the try doing the job it was written for,
// guarding the JSX.
//
// The hazard and the fix are both invisible to `tsc` and to a page that only
// gets server-rendered, so what has to be checked is that these components
// still re-render on interaction in a real browser. None of the three had any
// coverage before.

import { test, expect } from "@playwright/test";

test("the pricing billing toggle still re-renders the tier cards", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto("/pricing");
  const section = page.locator('[data-section="pricing-tiers"]');
  await expect(section).toBeVisible();

  const before = await section.innerText();
  await section.getByRole("radio", { name: /monthly/i }).click();

  await expect.poll(async () => section.innerText()).not.toBe(before);
  expect(errors, "no uncaught errors").toEqual([]);
});

test("the homepage renders its cycling insight card without erroring", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto("/");
  // Long enough for SolutionInsightsFlow's interval to fire and re-render.
  await page.waitForTimeout(3000);

  expect(errors, "no uncaught errors").toEqual([]);
});

test("the agency explorer still filters as you type", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto("/directory/web-design");
  const search = page.getByRole("searchbox").first();
  await expect(search).toBeVisible();

  const countLabel = page.locator("text=/Showing \\d+ of/");
  const before = await countLabel.innerText();
  await search.fill("lusion");

  await expect.poll(async () => countLabel.innerText()).not.toBe(before);
  expect(errors, "no uncaught errors").toEqual([]);
});
