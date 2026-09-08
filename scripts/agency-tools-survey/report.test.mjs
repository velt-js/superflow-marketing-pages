import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const dataPath = "lib/agency-tools-survey/report-data.ts";
const compiled = ts.transpileModule(read(dataPath), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { REPORT_DATA: data, assistantUsePay } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`
);
const charts = data.sections.flatMap((section) => section.charts);
const chart = (id) => {
  const found = charts.find((entry) => entry.id === id);
  assert.ok(found, `Missing chart: ${id}`);
  return found;
};

for (const path of [
  dataPath,
  "lib/agency-tools-survey/config.ts",
  "app/state-of-agency-tools/page.tsx",
  "app/state-of-agency-tools/report/page.tsx",
  "components/agency-survey-2026/charts/BarCharts.tsx",
]) {
  test(`TS/TSX syntax: ${path}`, () => {
    const result = ts.transpileModule(read(path), {
      fileName: path,
      reportDiagnostics: true,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
      },
    });
    const errors = (result.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error);
    assert.deepEqual(errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")), []);
  });
}

test("data and config pass standalone strict TypeScript checking", () => {
  const program = ts.createProgram([dataPath, "lib/agency-tools-survey/config.ts"].map(
    (path) => fileURLToPath(new URL(path, root)),
  ), { noEmit: true, strict: true, skipLibCheck: true, types: [], target: ts.ScriptTarget.ES2020 });
  const errors = ts.getPreEmitDiagnostics(program).filter((d) => d.category === ts.DiagnosticCategory.Error);
  assert.deepEqual(errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")), []);
});

test("fixtures have valid question-specific denominators and shares", () => {
  assert.ok(Number.isInteger(data.respondents) && data.respondents > 0);
  assert.equal(new Set(data.sections.map((s) => s.id)).size, data.sections.length);
  assert.equal(new Set(charts.map((c) => c.id)).size, charts.length);
  for (const c of charts) {
    assert.ok(c.title && c.audience && c.rows.length, c.id);
    assert.ok(Number.isInteger(c.answered) && c.answered > 0 && c.answered <= data.respondents, c.id);
    assert.equal(new Set(c.rows.map((r) => r.label)).size, c.rows.length, c.id);
    for (const row of c.rows) {
      assert.ok(Number.isFinite(row.pct) && row.pct >= 0 && row.pct <= 100, `${c.id}: ${row.label}`);
    }
    if (!c.multiple) {
      assert.ok(Math.abs(c.rows.reduce((sum, r) => sum + r.pct, 0) - 100) < 0.2, c.id);
    }
  }
});

test("all current tool categories and eight business questions are represented", () => {
  for (const id of [
    "website-platforms", "project-management", "design", "video", "seo-reporting", "social", "client-email",
    "time-resourcing", "profit-tracking", "accounting", "payroll", "crm", "prospecting", "proposals", "support",
    "notetakers", "feedback", "review-tools", "revisions", "checklists", "ai-production", "ai-deliverables", "ai-disclosure", "bottlenecks",
  ]) chart(id);
  for (const id of ["time-resourcing", "profit-tracking", "accounting", "payroll", "crm", "prospecting", "proposals", "support"]) {
    assert.match(chart(id).audience, /opted into business tools/);
    assert.ok(chart(id).answered < data.respondents);
  }
});

test("CRM, prospecting and support contain the newly published options", () => {
  const expected = {
    crm: ["HighLevel (GoHighLevel)", "Zoho CRM", "HoneyBook", "Dubsado", "Attio"],
    prospecting: ["LinkedIn Sales Navigator", "Apollo", "Clay", "Instantly", "Smartlead", "lemlist", "Hunter", "HeyReach", "Our CRM's built-in tools"],
    support: ["Zendesk", "Freshdesk", "Help Scout", "Front", "Intercom", "HubSpot Service Hub", "Zoho Desk", "We do not provide ongoing client support"],
  };
  for (const [id, labels] of Object.entries(expected)) {
    for (const label of [...labels, "Other", "Not sure"]) {
      assert.ok(chart(id).rows.some((row) => row.label === label), `${id}: ${label}`);
    }
  }
});

test("choose-again is a whole-stack distribution, not per-vendor loyalty", () => {
  for (const id of ["website-choose-again", "pm-choose-again"]) {
    assert.deepEqual(chart(id).rows.map((row) => row.label), [
      "Yes, all of them", "Some, but not all", "No, none of them", "Not sure",
    ]);
  }
  assert.doesNotMatch(read("app/state-of-agency-tools/report/page.tsx"), /QuadrantChart|avgRevisionRounds|noMarginPct|clientComms|noQaPct/);
  assert.doesNotMatch(read("app/state-of-agency-tools/page.tsx"), /QuadrantMotif/);
});

test("AI use is derived from all three used statuses without conflating payment", () => {
  assert.equal(data.aiAssistants.length, 8);
  for (const row of data.aiAssistants) {
    const counts = [row.notUsed, row.agencyPaid, row.notAgencyPaid, row.paymentUnknown];
    assert.ok(counts.every((n) => Number.isInteger(n) && n >= 0));
    assert.equal(counts.reduce((sum, n) => sum + n, 0), row.answered, row.name);
    const { usePct, payPct } = assistantUsePay(row);
    assert.ok(payPct <= usePct && usePct <= 100);
  }
  assert.deepEqual(assistantUsePay({ name: "Test", answered: 10, notUsed: 2, agencyPaid: 3, notAgencyPaid: 4, paymentUnknown: 1 }),
    { name: "Test", usePct: 80, payPct: 30 });
  assert.deepEqual(assistantUsePay({ name: "Empty", answered: 0, notUsed: 0, agencyPaid: 0, notAgencyPaid: 0, paymentUnknown: 0 }),
    { name: "Empty", usePct: 0, payPct: 0 });
  assert.match(read("components/agency-survey-2026/charts/BarCharts.tsx"), /Used, agency-paid/);
});

test("current feedback, QA, revision and disclosure options replace the old questions", () => {
  assert.ok(chart("feedback").rows.some((r) => r.label === "WhatsApp/iMessage"));
  assert.equal(chart("review-tools").answered, 20);
  assert.match(chart("review-tools").audience, /selected a dedicated review tool/);
  assert.ok(chart("revisions").rows.some((r) => r.label === "0"));
  assert.ok(chart("revisions").rows.some((r) => r.label === "6+"));
  assert.ok(chart("checklists").rows.some((r) => r.label === "We check sites without a written checklist"));
  assert.deepEqual(chart("ai-disclosure").rows.map((r) => r.label), ["Always", "Sometimes", "Never", "Not sure", "Prefer not to say"]);
  for (const tool of ["Runway", "Descript"]) {
    assert.equal(charts.flatMap((c) => c.rows).filter((r) => r.label === tool).length, 1);
  }
});

test("sample safety and privacy promises remain explicit", () => {
  assert.equal(data.sample, true, "Replace every fixture and review publication before changing this assertion");
  const landing = read("app/state-of-agency-tools/page.tsx");
  const report = read("app/state-of-agency-tools/report/page.tsx");
  for (const text of [landing, report]) {
    assert.doesNotMatch(text, /500\+ agencies|28 quick questions|all[ -]taps|single (click|tap) except|takes 5 minutes/i);
    assert.doesNotMatch(text, /Anonymous by default/);
  }
  assert.match(report, /noindex: REPORT_DATA\.sample/);
  assert.match(report, /Sample report, not survey findings/);
  assert.match(report, /Illustrative sample/);
  assert.match(landing, /Report delivery and Superflow setup help are separate, optional choices/);
  assert.match(read("lib/agency-tools-survey/config.ts"), /TALLY_FORM_ID = "ODqdPK"/);
  assert.ok(data.leastValue.tools.every((tool) => tool.name.startsWith("Example tool ")));
  assert.equal(data.leastValue.tools.reduce((sum, tool) => sum + tool.mentions, 0), data.leastValue.answered);
});
