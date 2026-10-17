#!/usr/bin/env node
// Assets for /state-of-website-qa.
//
//   node scripts/state-of-website-qa/generate-assets.mjs --placeholders
//     Writes clearly marked PLACEHOLDER versions of the cover, the three page
//     previews and the 12-page PDF into public/reports/, then the social card.
//     Overwrites whatever is there, so never run it once the real files land.
//
//   node scripts/state-of-website-qa/generate-assets.mjs
//     Rebuilds only the social card (public/og/pages/state-of-website-qa.png)
//     from whatever cover is in public/reports/. Run this after dropping in
//     the final cover.
//
// Renders with Playwright's Chromium (already a dev dependency) and the
// site's own fonts from app/fonts. Copy is hard-coded here because these are
// throwaway placeholders; the page itself reads lib/website-qa-report.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPORTS = join(ROOT, "public", "reports");
const OG_OUT = join(ROOT, "public", "og", "pages", "state-of-website-qa.png");

const TITLE = "The State of Website QA 2026";
const SUBTITLE = "What 505,857 review comments say about how agencies ship websites.";

/** 5.5 x 8.5 in at 200 dpi. */
const PAGE = { width: 1100, height: 1700 };

const CHAPTERS = [
  "The data",
  "What reviewers really flag",
  "Same problems, every agency",
  "The copy-paste problem",
  "Missing links",
  "Copy edits and typos",
  "Review rounds",
  "Where AI QA fits",
  "Memory and brand rules",
  "The pre-launch checklist (tear-out)",
];

async function fontFaces() {
  const font = async (file) =>
    `data:font/woff2;base64,${(await readFile(join(ROOT, "app", "fonts", file))).toString("base64")}`;
  return `
    @font-face { font-family: Adamina; src: url(${await font("adamina-400.woff2")}); }
    @font-face { font-family: Urbanist; src: url(${await font("urbanist-variable.woff2")}); font-weight: 100 900; }
    @font-face { font-family: Poppins; src: url(${await font("poppins-400.woff2")}); font-weight: 400; }
  `;
}

/** Shared page chrome. `scale` is 1 for PNGs at 1100px wide. */
function pageCss(faces) {
  return `
    ${faces}
    * { box-sizing: border-box; margin: 0; }
    html, body { width: 100%; height: 100%; }
    body { font-family: Poppins, sans-serif; color: #16171a; }
    .page { position: relative; width: 1100px; height: 1700px; overflow: hidden; background: #fbfbfd; padding: 110px 100px; }
    .stamp { position: absolute; top: 48px; right: 56px; font: 700 22px Urbanist; letter-spacing: .14em; color: #c8362f; border: 3px solid #c8362f; border-radius: 10px; padding: 8px 16px; }
    .eyebrow { font: 700 26px Urbanist; letter-spacing: .14em; text-transform: uppercase; color: #433df3; }
    h1 { font: 400 104px/1.04 Adamina; letter-spacing: -.02em; margin-top: 40px; }
    h2 { font: 400 72px/1.1 Adamina; margin-top: 28px; }
    .sub { font-size: 34px; line-height: 1.5; color: #6b7079; margin-top: 44px; max-width: 820px; }
    .foot { position: absolute; left: 100px; right: 100px; bottom: 90px; display: flex; justify-content: space-between; font: 600 26px Urbanist; color: #6b7079; }
    .cover { background: radial-gradient(900px 700px at 90% 10%, rgba(67,61,243,.18), transparent 70%), linear-gradient(180deg, #ffffff, #eeedfe); }
    .rule { height: 6px; width: 140px; background: #433df3; margin-top: 64px; }
    .bars { margin-top: 90px; display: flex; flex-direction: column; gap: 34px; }
    .row { display: flex; align-items: center; gap: 24px; font: 600 28px Urbanist; }
    .row span { width: 300px; color: #6b7079; }
    .track { flex: 1; height: 44px; background: #e9e9f0; border-radius: 10px; overflow: hidden; }
    .fill { height: 100%; background: #433df3; }
    .ghost { height: 100%; background: repeating-linear-gradient(45deg, #d6d6e2 0 14px, #e9e9f0 14px 28px); }
    .lines { margin-top: 80px; display: flex; flex-direction: column; gap: 22px; }
    .lines i { display: block; height: 22px; border-radius: 6px; background: #e3e3ec; }
    .stack { display: flex; gap: 6px; height: 120px; margin-top: 90px; border-radius: 16px; overflow: hidden; }
    .stack div { display: flex; align-items: center; justify-content: center; font: 700 36px Urbanist; background: #e9e9f0; }
    .stack .on { background: #433df3; color: #fff; }
    .legend { display: flex; gap: 6px; margin-top: 18px; font: 600 26px Urbanist; color: #6b7079; text-align: center; }
  `;
}

const STAMP = `<div class="stamp">PLACEHOLDER</div>`;

function coverHtml() {
  return `<div class="page cover">${STAMP}
    <p class="eyebrow">Industry report · 2026</p>
    <h1>${TITLE}</h1>
    <div class="rule"></div>
    <p class="sub">${SUBTITLE}</p>
    <div class="foot"><span>Superflow</span><span>usesuperflow.ai</span></div>
  </div>`;
}

/** "What reviewers flag": shape only. No numbers, none are approved for it. */
function flagsHtml() {
  const widths = [88, 71, 60, 46, 38, 27, 19];
  return `<div class="page">${STAMP}
    <p class="eyebrow">Chapter 2</p>
    <h2>What reviewers really flag</h2>
    <div class="lines"><i style="width:92%"></i><i style="width:84%"></i><i style="width:66%"></i></div>
    <div class="bars">${widths
      .map((w) => `<div class="row"><span>Topic</span><div class="track"><div class="ghost" style="width:${w}%"></div></div></div>`)
      .join("")}</div>
    <div class="lines"><i style="width:90%"></i><i style="width:72%"></i></div>
    <div class="foot"><span>${TITLE}</span><span>2</span></div>
  </div>`;
}

/** "Review rounds": the approved round buckets only. */
function roundsHtml() {
  const buckets = [
    { label: "1 to 2 rounds", share: 34 },
    { label: "3 to 4 rounds", share: 22 },
    { label: "5 or more", share: 43, on: true },
  ];
  return `<div class="page">${STAMP}
    <p class="eyebrow">Chapter 7</p>
    <h2>Review rounds</h2>
    <p class="sub">The typical site takes 4 review rounds. 43% take 5 or more.</p>
    <div class="stack">${buckets
      .map((b) => `<div class="${b.on ? "on" : ""}" style="flex:${b.share}">${b.share}%</div>`)
      .join("")}</div>
    <div class="legend">${buckets.map((b) => `<div style="flex:${b.share}">${b.label}</div>`).join("")}</div>
    <div class="lines"><i style="width:94%"></i><i style="width:88%"></i><i style="width:61%"></i></div>
    <div class="foot"><span>${TITLE}</span><span>7</span></div>
  </div>`;
}

function chapterHtml(n, title) {
  return `<div class="page">${STAMP}
    <p class="eyebrow">Chapter ${n}</p>
    <h2>${title}</h2>
    <p class="sub">Placeholder page. The final report replaces this file.</p>
    <div class="lines"><i style="width:92%"></i><i style="width:86%"></i><i style="width:74%"></i><i style="width:58%"></i></div>
    <div class="foot"><span>${TITLE}</span><span>${n + 1}</span></div>
  </div>`;
}

function backHtml() {
  return `<div class="page cover">${STAMP}
    <p class="eyebrow">About this report</p>
    <h2>Built from real review data.</h2>
    <p class="sub">Every review comment and reply left by people in Superflow between 2022 and 2026, counted in aggregate.</p>
    <div class="foot"><span>Superflow</span><span>usesuperflow.ai/state-of-website-qa</span></div>
  </div>`;
}

async function shoot(browser, css, body, out, size) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>${body}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, ...size } });
  await page.close();
  console.log(`[qa-report] wrote ${out}`);
}

async function placeholders(browser, css) {
  await mkdir(REPORTS, { recursive: true });
  await shoot(browser, css, coverHtml(), join(REPORTS, "state-of-website-qa-2026-cover.png"), PAGE);
  await shoot(browser, css, coverHtml(), join(REPORTS, "preview-1.png"), PAGE);
  await shoot(browser, css, flagsHtml(), join(REPORTS, "preview-2.png"), PAGE);
  await shoot(browser, css, roundsHtml(), join(REPORTS, "preview-3.png"), PAGE);

  // 12 pages: cover, ten chapters, back page. Chapters 2 and 7 use the
  // preview layouts so the PDF and the previews agree.
  const pages = [
    coverHtml(),
    ...CHAPTERS.map((title, i) =>
      i === 1 ? flagsHtml() : i === 6 ? roundsHtml() : chapterHtml(i + 1, title),
    ),
    backHtml(),
  ];
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head><style>${css}
      @page { size: 5.5in 8.5in; margin: 0; }
      .page { zoom: ${(5.5 * 96) / 1100}; break-after: page; }
    </style><title>${TITLE}</title></head><body>${pages.join("")}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const pdf = join(REPORTS, "state-of-website-qa-2026.pdf");
  await page.pdf({ path: pdf, width: "5.5in", height: "8.5in", printBackground: true });
  await page.close();
  console.log(`[qa-report] wrote ${pdf}`);
}

async function socialCard(browser, faces) {
  const cover = (await readFile(join(REPORTS, "state-of-website-qa-2026-cover.png"))).toString("base64");
  const logo = (await readFile(join(ROOT, "public", "brand", "logo.png"))).toString("base64");
  const css = `${faces}
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; overflow: hidden; font-family: Poppins, sans-serif; color: #16171a;
      background: radial-gradient(700px 400px at 85% 30%, rgba(67,61,243,.14), transparent 70%), linear-gradient(180deg, #ffffff, #f4f4fb); }
    .wrap { display: flex; align-items: center; gap: 56px; height: 100%; padding: 0 72px; }
    .copy { flex: 1; }
    .eyebrow { font: 700 20px Urbanist; letter-spacing: .14em; text-transform: uppercase; color: #433df3; }
    h1 { font: 400 62px/1.08 Adamina; letter-spacing: -.02em; margin-top: 20px; }
    p { font-size: 24px; line-height: 1.45; color: #6b7079; margin-top: 22px; }
    .logo { height: 34px; margin-top: 36px; }
    .desk { position: relative; width: 320px; transform: rotate(-4deg); }
    .desk::before { content: ""; position: absolute; inset: 0; background: #ececf3; border-radius: 6px; transform: rotate(6deg) translate(10px, 6px); }
    .desk img { position: relative; display: block; width: 100%; border-radius: 6px; box-shadow: 0 24px 48px rgba(22,23,26,.22); }`;
  const body = `<div class="wrap">
      <div class="copy">
        <div class="eyebrow">Industry report · 2026</div>
        <h1>${TITLE}</h1>
        <p>${SUBTITLE}</p>
        <img class="logo" src="data:image/png;base64,${logo}" alt="">
      </div>
      <div class="desk"><img src="data:image/png;base64,${cover}" alt=""></div>
    </div>`;
  await mkdir(dirname(OG_OUT), { recursive: true });
  await shoot(browser, css, body, OG_OUT, { width: 1200, height: 630 });
}

async function main() {
  const browser = await chromium.launch(
    process.env.PLAYWRIGHT_BROWSERS_PATH ? {} : { executablePath: "/opt/pw-browsers/chromium" },
  );
  try {
    const faces = await fontFaces();
    if (process.argv.includes("--placeholders")) await placeholders(browser, pageCss(faces));
    await socialCard(browser, faces);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("[qa-report] asset generation failed:", error);
  process.exit(1);
});
