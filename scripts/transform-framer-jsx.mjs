#!/usr/bin/env node
// Placeholder: transforms Framer-exported HTML into Next.js-friendly JSX.
// Implement based on the patterns used in the Velt migration:
//   - rewrite kebab-case style keys to camelCase
//   - quote CSS custom properties (e.g. "--foo": "bar")
//   - inject `"use client"` and `@ts-nocheck` pragmas
//   - strip Framer-specific runtime attrs we hydrate elsewhere
//
// Usage: node scripts/transform-framer-jsx.mjs <input.html> <output.tsx>

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error("Usage: transform-framer-jsx.mjs <input.html> <output.tsx>");
  process.exit(1);
}
console.log(`TODO: transform ${input} -> ${output}`);
