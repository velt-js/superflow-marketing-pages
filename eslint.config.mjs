// ESLint flat config.
//
// `npm run lint` runs `eslint`, which since ESLint 9 looks for this file and
// nothing else - there is no `.eslintrc` fallback. Without it the command
// exits 2 with "couldn't find an eslint.config file" and lints nothing, which
// is how this repo shipped until now.
//
// `eslint-config-next` 16 exports flat config arrays directly, so no
// FlatCompat shim is needed. Two presets:
//
//   core-web-vitals - the Next rules, with the Core Web Vitals ones raised
//                     from warning to error (the stricter of the two, and the
//                     one create-next-app picks).
//   typescript      - typescript-eslint's recommended set plus the Next
//                     TypeScript rules.

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  {
    // Build output, vendored assets, and generated files. Linting these says
    // nothing about the code we write and is slow.
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    // ── The try/catch convention ──────────────────────────────────────────
    //
    // This codebase wraps function bodies - components included - in
    // try/catch, so a section that fails renders a fallback instead of
    // taking the page down. Four rules from eslint-plugin-react-hooks 7
    // fire on that pattern, and the first of them fires 3283 times across
    // 118 files. Turned on as errors they would report the convention, not
    // defects, and nobody would read the output.
    //
    // The settings below are about making the linter usable on the codebase
    // as it stands. They are not an argument that the pattern is free:
    // hooks inside a `try` are genuinely order-unstable, because a throw
    // partway through skips the hooks after it and React sees a different
    // hook sequence on the next render. That is a real hazard worth
    // revisiting, which is why `rules-of-hooks` stays visible as a warning
    // rather than being switched off.
    rules: {
      // Pure consequence of the convention, and no per-site judgment to
      // make: every JSX return inside a try is one of these.
      "react-hooks/error-boundaries": "off",

      // Same root cause, but a real correctness hazard - keep it in the
      // output so the count is known, without failing the run on it.
      "react-hooks/rules-of-hooks": "warn",

      // React Compiler-era rules, new in eslint-plugin-react-hooks 7. Each
      // hit needs a look at the component rather than a blanket rewrite, so
      // they report without gating.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
  {
    // The repo's build scripts are ESM (`.mjs`) with one exception:
    // `scripts/gen-persona-pages.js`, a CommonJS one-off that runs under
    // Node's default module type because package.json declares none.
    // `require()` is correct there, so the TypeScript rule banning it does
    // not apply.
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default config;
