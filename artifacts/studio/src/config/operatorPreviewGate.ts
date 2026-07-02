// Operator Preview Hard Gate — build-time flag for internal/operator routes.
// ---------------------------------------------------------------------------
// Production is a static SPA build (no server), so the only honest hard gate
// is a BUILD-TIME one: when this constant folds to `false` at build time, the
// operator console module (Shell + all INTERNAL pages) is dead-code-eliminated
// by Rollup — its code is NOT shipped in the production bundle at all, and the
// INTERNAL routes render a safe "preview not enabled" page instead.
//
// Posture:
//   - Workspace/dev server (`vite dev`): `import.meta.env.DEV` is true →
//     operator preview ENABLED.
//   - Production build (default): `import.meta.env.DEV` is false and
//     `__OPERATOR_PREVIEW__` is defined `false` in vite.config.ts →
//     DISABLED and code-excluded. Safe by default.
//   - Explicit founder-enabled build: set `VITE_OPERATOR_PREVIEW=true` in the
//     BUILD environment → `__OPERATOR_PREVIEW__` is defined `true`.
//
// This is a visibility gate, not authentication. It is honest about that: it
// removes internal preview code from public builds; it does not authenticate
// anyone. Auth for operator surfaces remains a later founder-approved slice.
// `import.meta.env.DEV` and `__OPERATOR_PREVIEW__` are static build-time
// replacements (Vite `define`); the App.tsx fold additionally relies on Rollup
// inlining this exported constant. The dist-grep probes in the operator-gate
// guard workflow are the regression net for that mechanism.

export const OPERATOR_PREVIEW_ENABLED: boolean =
  import.meta.env.DEV || __OPERATOR_PREVIEW__;
