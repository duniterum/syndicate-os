// config/surfaceClassification.ts
//
// The single bridge between a route, its audience, and its layout. Every real
// route in the app appears here exactly once. The route/nav drift guard checks
// this list against `seoRouteRegistry` and `App.tsx`, so adding a route without
// classifying it (or vice-versa) fails the guard.
//
// `surface` reuses the canonical `SyndicateSurface` vocabulary from
// @workspace/os-contracts (type-only import → this file stays Node-loadable).
//
// IA-1 access-state fields (two-field design, founder-approved):
//   - `requiredState` records the FUTURE §3-matrix requirement from the
//     checkpointed identity/access design doc. It is matrix truth on file,
//     NOT current enforcement — no auth system exists.
//   - `enforcement` is the current mode: every surface is PREVIEW_LABELLED
//     (renders exactly as today). GATED is reserved for a future slice with a
//     real, wired state machine; guard-access-state forbids it until then.
// Frontend gating is visibility/UX only — never permission control.

import type {
  AccessEnforcement,
  AccessStateId,
  SyndicateSurface,
} from "@workspace/os-contracts";

/** Who a surface is built for. Drives which layout/chrome it renders in. */
export type SurfaceAudience = "PUBLIC" | "MEMBER_PREVIEW" | "OPERATOR_PREVIEW";

/** Which chrome wraps the route: the public marketing site, or the console. */
export type SurfaceLayout = "public" | "console";

export const surfaceAudienceText: Record<SurfaceAudience, string> = {
  PUBLIC: "Public",
  MEMBER_PREVIEW: "Member preview",
  OPERATOR_PREVIEW: "Operator preview",
};

export interface SurfaceClassificationEntry {
  routePath: string;
  /** Matching module id in `modules.ts`, when the route has one. */
  moduleId?: string;
  audience: SurfaceAudience;
  surface: SyndicateSurface;
  layout: SurfaceLayout;
  summary: string;
  /** FUTURE §3-matrix access requirement (recorded truth, not enforcement). */
  requiredState: AccessStateId;
  /** Current enforcement mode. PREVIEW_LABELLED = renders as today. */
  enforcement: AccessEnforcement;
}

export const surfaceClassification: SurfaceClassificationEntry[] = [
  {
    routePath: "/",
    moduleId: "home",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Curated public front door.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/proof",
    moduleId: "proof",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "What public proof will look like, and why none is wired yet.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/status",
    moduleId: "status",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Authoritative ledger of what is real vs awaiting source.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/learning",
    moduleId: "learning",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Plain-language education about the protocol.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/source-attribution",
    moduleId: "source-attribution",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "The verified-introduction model, framed attribution-only.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/contracts",
    moduleId: "contracts",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Read-only contract & economy memory (roles + lifecycle).",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/support",
    moduleId: "support",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Public help entry. Intake states only — nothing is stored.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/archive",
    moduleId: "archive",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Archive & chronicle concept memory. Reads not wired.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/recognition",
    moduleId: "recognition",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "The recognition model, explained as a future concept.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/member",
    moduleId: "member",
    audience: "MEMBER_PREVIEW",
    surface: "AUTHENTICATED_MEMBER",
    layout: "public",
    summary: "A labelled preview of the future member cockpit. Founder-gated.",
    requiredState: "S7",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/studio",
    moduleId: "studio",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Operator console overview.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/proof-studio",
    moduleId: "proof-studio",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Draft proof tooling (disabled).",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/founder",
    moduleId: "founder",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Founder/operator controls preview. Gated.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/source",
    moduleId: "source",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Operator source surface. Paused by precaution.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/os-map",
    moduleId: "os-map",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary:
      "Internal founder preview: the full protocol organism, honestly labelled.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
];

export const getSurfaceByRoute = (
  routePath: string,
): SurfaceClassificationEntry | undefined =>
  surfaceClassification.find((s) => s.routePath === routePath);

export const publicSurfaces = (): SurfaceClassificationEntry[] =>
  surfaceClassification.filter((s) => s.layout === "public");

export const consoleSurfaces = (): SurfaceClassificationEntry[] =>
  surfaceClassification.filter((s) => s.layout === "console");
