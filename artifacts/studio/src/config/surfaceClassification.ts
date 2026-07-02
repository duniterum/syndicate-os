// config/surfaceClassification.ts
//
// The single bridge between a route, its audience, and its layout. Every real
// route in the app appears here exactly once. The route/nav drift guard checks
// this list against `seoRouteRegistry` and `App.tsx`, so adding a route without
// classifying it (or vice-versa) fails the guard.
//
// `surface` reuses the canonical `SyndicateSurface` vocabulary from
// @workspace/os-contracts (type-only import → this file stays Node-loadable).

import type { SyndicateSurface } from "@workspace/os-contracts";

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
}

export const surfaceClassification: SurfaceClassificationEntry[] = [
  {
    routePath: "/",
    moduleId: "home",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Curated public front door.",
  },
  {
    routePath: "/proof",
    moduleId: "proof",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "What public proof will look like, and why none is wired yet.",
  },
  {
    routePath: "/status",
    moduleId: "status",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Authoritative ledger of what is real vs awaiting source.",
  },
  {
    routePath: "/learning",
    moduleId: "learning",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Plain-language education about the protocol.",
  },
  {
    routePath: "/source-attribution",
    moduleId: "source-attribution",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "The verified-introduction model, framed attribution-only.",
  },
  {
    routePath: "/contracts",
    moduleId: "contracts",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Read-only contract & economy memory (roles + lifecycle).",
  },
  {
    routePath: "/support",
    moduleId: "support",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Public help entry. Intake states only — nothing is stored.",
  },
  {
    routePath: "/archive",
    moduleId: "archive",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Archive & chronicle concept memory. Reads not wired.",
  },
  {
    routePath: "/recognition",
    moduleId: "recognition",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "The recognition model, explained as a future concept.",
  },
  {
    routePath: "/member",
    moduleId: "member",
    audience: "MEMBER_PREVIEW",
    surface: "AUTHENTICATED_MEMBER",
    layout: "public",
    summary: "A labelled preview of the future member cockpit. Founder-gated.",
  },
  {
    routePath: "/studio",
    moduleId: "studio",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Operator console overview.",
  },
  {
    routePath: "/proof-studio",
    moduleId: "proof-studio",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Draft proof tooling (disabled).",
  },
  {
    routePath: "/founder",
    moduleId: "founder",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Founder/operator controls preview. Gated.",
  },
  {
    routePath: "/source",
    moduleId: "source",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Operator source surface. Paused by precaution.",
  },
  {
    routePath: "/os-map",
    moduleId: "os-map",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Internal founder preview: the full protocol organism, honestly labelled.",
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
