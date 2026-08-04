// eslint.config.js — THE LINTER THIS APP NEVER HAD.
// ===========================================================================
// THE FOUNDER'S ITEM ④, and why it exists: a CONDITIONAL REACT HOOK reached
// production and blacked out /admin/sources — his own signing panel. Forty
// hand-written guards in this repo, and not one linter to catch the one class
// of defect that had already taken a live page down. An earlier session tried a
// hand-rolled tripwire, found 34 candidate sites, and deleted it as too noisy
// to gate. This is the real tool instead.
//
// ⛔ DELIBERATELY NARROW, AND HONEST ABOUT IT.
// This config does NOT turn on the full TypeScript rule set. Thousands of style
// findings across 300+ files would drown the one signal that matters and would
// never be gated, which is the same as not having a linter at all. So:
//
//   · react-hooks/rules-of-hooks  → ERROR, BLOCKING. This is the class that
//     broke production. A hook called conditionally, in a loop, or outside a
//     component is a red build, forever.
//   · react-hooks/exhaustive-deps → WARN, reported and counted, never blocking.
//     It is advice, not law: this codebase has deliberate partial dependency
//     lists, and a wrong "fix" to one of them is how an effect starts looping.
//     The count is the DEBT COUNTER — it exists to go down.
//
// NOT CHECKED, and no green run here claims otherwise: type-aware rules, style,
// unused variables, import hygiene, accessibility, and every non-React rule.
// Widening this is its own slice, with its own allowlist and its own ratchet.
// This file also does not lint scripts/, guards/ or server/ — those are Node
// tools, not the React app, and they have their own gates.
// ===========================================================================

import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      // Node-side tooling, not the React app — linted by nothing here on purpose.
      "scripts/**",
      "guards/**",
      "server/**",
      "*.config.js",
      "*.config.ts",
      // The vendored shadcn carrier layer: upstream code we do not author.
      "src/components/ui/**",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      // THE ONE THAT BROKE PRODUCTION.
      "react-hooks/rules-of-hooks": "error",
      // The debt counter — advice, never a gate.
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
