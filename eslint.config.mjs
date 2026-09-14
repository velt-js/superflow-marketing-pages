// ESLint flat config.
//
// The repo had no config at all: `npm run lint` died with "couldn't find
// eslint.config.(js|mjs|cjs)" because ESLint 9 dropped .eslintrc support and
// nothing replaced it. That is the worse of the two failure modes - a red
// lint gets fixed, a lint that errors out before checking anything just stops
// being run.
//
// `core-web-vitals` is what Next recommends for most projects: the base
// Next/React/React-Hooks rules, with the ones affecting Core Web Vitals
// raised from warning to error.

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,

  {
    // Five `eslint-disable` comments in the repo name rules this config does
    // not enable (no-console, no-constant-condition, jsx-a11y/media-has-caption),
    // so ESLint reports them as unused. They are not noise: each one documents
    // a deliberate decision at the line it sits on - an intentional `while
    // (true)` retry loop, a dev-only warning, a caption-less decorative video -
    // and `--fix` deletes the explanation along with the directive, in one case
    // leaving `{ }` where a JSX comment was. Keep the comments; do not report
    // them.
    linterOptions: { reportUnusedDisableDirectives: "off" },
  },

  globalIgnores([
    // eslint-config-next's own defaults, restated because setting `ignores`
    // replaces them rather than adding to them.
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Raw Framer HTML export, kept as a fallback during the migration. Not
    // hand-maintained source - see AGENTS.md.
    "public/pages-html/**",

    // Sanity's generated workspace manifest.
    ".sanity/**",
  ]),

  {
    rules: {
      // OFF: conflicts with a deliberate, repo-wide convention.
      //
      // Almost every component here is written as
      //   try { return <JSX/> } catch { return null }
      // so that one bad CMS field degrades to a missing section rather than a
      // white screen. This rule flags all ~3,280 of them.
      //
      // The rule's point is real but narrower than it looks: React renders
      // children later, so a throw inside a CHILD is not caught by the
      // parent's try/catch and needs an error boundary. What the try/catch
      // here does catch is a throw while computing props - which, given the
      // CMS shapes these components read, is the case it was written for.
      //
      // Turning it off is a decision about this convention, not a licence to
      // ignore error handling: an error boundary is still the right tool for
      // render-time failures in a subtree, and adding real boundaries would be
      // the way to revisit this.
      "react-hooks/error-boundaries": "off",

      // WARN, not off: a real backlog worth seeing.
      //
      // 28 effects call setState synchronously, which React 19 flags because
      // it triggers a second render pass before paint. Each one is a genuine
      // fix, but they are behavioural changes across ~20 interactive
      // components and do not belong in the change that made lint run at all.
      // Left visible so they get worked through rather than forgotten.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
