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
    summary: "Verify the protocol: receipts, numbered burns and referral payments — read live with verify links.",
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
    routePath: "/whitepaper",
    moduleId: "whitepaper",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "The anchor whitepaper — 15 sections, every figure read live from the chain.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/tokenomics",
    moduleId: "tokenomics",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "SYN supply, live distribution, the two prices, and burn — every figure a live chain read.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/faq",
    moduleId: "faq",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary:
      "FAQ composed from the living chassis — number-free doctrine-perfect answers, every live figure one click away on-chain.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  // AUD-T (2026-07-16): the legal layer — three prose pages, footer-linked
  // site-wide, honestly labeled Version-1 drafts awaiting counsel.
  {
    routePath: "/terms",
    moduleId: "terms",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary:
      "Terms of Use — founder-approved text: what a seat is and is not, purchase finality, the referral program's rules, no custody, the public record.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/privacy",
    moduleId: "privacy",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary:
      "Privacy Policy — every claim harvested from real code: one functional cookie, two local preferences, zero analytics, logs disclosed plainly.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/risk",
    moduleId: "risk",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary:
      "Risk Disclosure — honest and specific: price can fall to zero, contracts can flaw, keys are the only access, transactions are final.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/docs",
    moduleId: "docs",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary:
      "The protocol operating manual — a knowledge hub indexing every surface with a registry-derived status and an editorial audience tag.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    // The canonical referral-program URL (founder, 2026-07-13).
    routePath: "/referral",
    moduleId: "source-attribution",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "The referral program — how a bounded commission per completed introduction works.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    // Legacy alias of /referral (200 + canonical; links never break). No
    // moduleId on purpose: the module points at the CANONICAL path /referral.
    routePath: "/source-attribution",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Legacy alias of /referral — serves the same referral-program page.",
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
    routePath: "/map",
    moduleId: "map",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Public proof organism — the live protocol reality map, fail-closed.",
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
    // AUD-ROUTE (2026-07-17): "artifact reads live" DIED — the page renders
    // static memory; every mint rides the indexed record.
    summary: "Archive & chronicle memory; every mint on the indexed record.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  // ARC L-1 — the liquidity surface (LP-side flow only, public shell).
  // AUD-ROUTE (2026-07-17): the six chrome-visible routes carry their
  // moduleId so the public surface map speaks their human labels.
  {
    routePath: "/liquidity",
    moduleId: "liquidity",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Why LP exists + live pair reserves + LP-side actions. No Join CTA (flow separation).",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  // ARC SLICE D member doors — flat routes, member shell chosen by the page.
  {
    routePath: "/wallet",
    moduleId: "wallet",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Own balances + approvals panel; revoke = the member's own signed act.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/toolkit",
    moduleId: "toolkit",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "The member action registry as the public conversion surface.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  // §11 slot 2c, GROWN UP (AUD-ROUTE 2026-07-17): the born-as-teasers trio
  // serves the real indexed record today — live surfaces, public shell.
  {
    routePath: "/activity",
    moduleId: "activity",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "The public heartbeat, live — receipt-backed events, complete served history.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/chronicle",
    moduleId: "chronicle",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    // AUD-ROUTE: "teaser" DIED — the register is open and serves its entries.
    summary: "The solemn record, open — founder-promoted entries; promotion is a human act.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/fire-ledger",
    moduleId: "fire-ledger",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary: "Fire Ledger, live — the retired total plus the numbered per-event Proof of Burn record.",
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
    summary:
      "Public wallet session + live read-only self-readback of the signed wallet's standing. Session ≠ membership.",
    requiredState: "S7",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/join",
    moduleId: "join",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary:
      "Public joining surface: live engine read + exact quote + the two-signature join signed from the visitor's own wallet (C5 go-live, founder 2026-07-13).",
    requiredState: "S1",
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
    moduleId: "source-link",
    audience: "PUBLIC",
    surface: "PUBLIC_VISITOR",
    layout: "public",
    summary:
      "Public Verified-Introduction link builder: read-only registry validation.",
    requiredState: "S1",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/os-source",
    moduleId: "source",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Operator source console (moved from /source).",
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
  {
    routePath: "/admin",
    moduleId: "admin",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary:
      "Internal admin console dashboard (sectioned shell): read-only panels over the module registry and live postures.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/admin/members",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Admin section: members & continuity postures (read-only).",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/admin/sources",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary:
      "Admin section: source registry, referral terms and review-queue previews.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/admin/operators",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Admin section: operator roles and registry previews.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/admin/content",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary:
      "Admin section: homepage/content governance, packages and address-label reservations.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/admin/modules",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Admin section: module registry governance overlay (read-only).",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/admin/broadcast",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Admin section: broadcast preview surface.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/admin/audit",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Admin section: audit log preview and activity postures.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/admin/support",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Admin section: support queue preview surface.",
    requiredState: "S11",
    enforcement: "PREVIEW_LABELLED",
  },
  {
    routePath: "/admin/settings",
    audience: "OPERATOR_PREVIEW",
    surface: "PRIVATE_OPERATOR_ADMIN",
    layout: "console",
    summary: "Admin section: build flags and system health, read-only.",
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
