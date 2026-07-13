// config/moduleRegistry.ts — Module Registry v0 (founder-approved skeleton).
// ---------------------------------------------------------------------------
// A GOVERNANCE OVERLAY over the existing module canon — NOT a competing canon:
//
//   - Route/title/nav truth stays in `modules.ts` (the route/nav drift guard
//     keeps that file in lockstep with the router and the SEO registry).
//     Entries that map to a mounted surface reference a compile-time
//     `ModuleId` and DERIVE their title/route from it — no duplicated path
//     literals, no second route table.
//   - Modules with no mounted route yet (wallet session, continuity, address
//     labels, packages) carry `moduleId: null` and resolve to `route: null`.
//     They may NOT invent paths: every `modules.ts` path must be a mounted
//     route, so unbuilt modules live only here until a real page ships.
//   - There is deliberately NO static `status` field. Live-ness is never a
//     hardcoded literal: consumers derive posture at render time from
//     `proofSource` (a category key of GET /api/source-status or a group key
//     of GET /api/protocol/reality), falling back to `fallbackTruthStatus`
//     (the module's honest wiring reason code). A missing or failed lookup
//     fails closed to "posture unavailable" — never an invented value.
//   - `forbiddenClaims` are claim-CATEGORY codes, not literal phrases. The
//     forbidden-copy guard remains the single source of banned vocabulary;
//     this field records WHICH claim families each module must never make.
//
// Read-only: nothing here executes, writes, sends transactions, or exposes
// addresses/PII. This registry exists so a later founder-approved slice can
// drive homepage recomposition, /map, /member, /source and /join alignment
// from ONE governed list instead of scattered config.

import type { SyndicateSurface } from "@workspace/os-contracts";
import { getModuleById, type ModuleId } from "./modules";
import type { TruthStatus } from "./truthStatus";

/** Homepage governance zones (fixed section model — see replit.md). */
export type HomepageZone =
  | "HERO"
  | "PROMOTED_STRIP"
  | "HOW_IT_WORKS"
  | "MODULE_STRIP"
  | "REAL_VS_PENDING"
  | "STUDIO_TEASER"
  | "EXPECTATIONS"
  | "NONE";

/** What the module could touch if mis-built — drives review strictness. */
export type ModuleRiskClass =
  | "READ_ONLY_PUBLIC"
  | "SESSION_SELF_READBACK"
  | "SERVER_ONLY_PII"
  | "OWNER_SIDE_ONCHAIN_ACTION"
  | "CONTENT_ONLY";

/** Fixed group keys of GET /api/protocol/reality (generated client shape). */
export type RealityGroupKey =
  | "chain"
  | "contracts"
  | "tokens"
  | "archive"
  | "sale"
  | "source";

/**
 * Where a module's live posture comes from. `sourceStatus.category` must be a
 * real key of the /api/source-status ledger (server-defined; the payload is an
 * index signature, so lookups are runtime + fail-closed by design).
 */
export type ProofSourceRef =
  | { readonly kind: "sourceStatus"; readonly category: string }
  | { readonly kind: "reality"; readonly group: RealityGroupKey };

/** Claim families a module's copy must never make (codes, not phrases). */
export type ForbiddenClaimClass =
  | "FINANCIAL_UPSIDE"
  | "INCOME_PROMISE"
  | "GUARANTEED_OUTCOME"
  | "GAMBLING_FRAMING"
  | "WEALTH_RANKING"
  | "UNPAID_LABOR_FRAMING";

export interface ModuleRegistryEntry {
  /** Stable registry key — the governance identity of the module. */
  readonly registryId: string;
  /** Link into `modules.ts` when a mounted surface exists; else null. */
  readonly moduleId: ModuleId | null;
  /** Human title (derived from modules.ts label when moduleId is set). */
  readonly title: string;
  /** Mounted route derived from modules.ts; null = no page exists yet. */
  readonly route: string | null;
  readonly surface: SyndicateSurface;
  /** May this module ever be presented on public surfaces? */
  readonly publicVisible: boolean;
  /** Will the Admin Console manage this module in a later slice? */
  readonly adminManaged: boolean;
  /** Requires a wallet session (SIWE, self-readback only) to be useful. */
  readonly requiresAuth: boolean;
  /** Any activation beyond read-only requires explicit founder approval. */
  readonly requiresApproval: boolean;
  readonly cta: { readonly label: string; readonly href: string } | null;
  readonly homepageZone: HomepageZone;
  /** Live posture source; null = nothing wired, use fallbackTruthStatus. */
  readonly proofSource: ProofSourceRef | null;
  /** Honest wiring reason code shown when no live posture is available. */
  readonly fallbackTruthStatus: TruthStatus | null;
  readonly riskClass: ModuleRiskClass;
  readonly forbiddenClaims: readonly ForbiddenClaimClass[];
  readonly notes: string;
}

/** Author-side spec: routed entries derive title/route/fallback from modules.ts. */
type RegistrySpec = Omit<ModuleRegistryEntry, "title" | "route" | "fallbackTruthStatus"> &
  (
    | { readonly moduleId: ModuleId; readonly title?: undefined }
    | { readonly moduleId: null; readonly title: string }
  ) & { readonly fallbackTruthStatus?: TruthStatus | null };

const specs: readonly RegistrySpec[] = [
  {
    registryId: "membership-join",
    moduleId: "join",
    surface: "PUBLIC_VISITOR",
    publicVisible: true,
    adminManaged: true,
    requiresAuth: false,
    requiresApproval: true,
    cta: { label: "Read the live join quote", href: "/join" },
    homepageZone: "PROMOTED_STRIP",
    proofSource: { kind: "reality", group: "sale" },
    riskClass: "OWNER_SIDE_ONCHAIN_ACTION",
    forbiddenClaims: ["FINANCIAL_UPSIDE", "INCOME_PROMISE", "GUARANTEED_OUTCOME"],
    // STATE (not an INVARIANT) — a description of TODAY, per
    // docs/direction/CANON_INVARIANT_VS_STATE.md. Rewritten in the C5 go-live
    // commit exactly as the previous state line said it would be.
    notes:
      "STATE (today, C5 go-live — founder 2026-07-13): live V3 quote plus the published two-signature approve→buy checkout. The app BUILDS the transactions; the visitor's own wallet SIGNS them; the seat is read from the receipt event. The server sends nothing and holds nothing.",
  },
  {
    registryId: "wallet-session",
    moduleId: null,
    title: "Wallet Session (SIWE)",
    surface: "AUTHENTICATED_MEMBER",
    publicVisible: true,
    adminManaged: true,
    requiresAuth: true,
    requiresApproval: true,
    cta: { label: "Open Member Home", href: "/member" },
    homepageZone: "NONE",
    proofSource: { kind: "sourceStatus", category: "walletSession" },
    riskClass: "SESSION_SELF_READBACK",
    forbiddenClaims: [],
    notes:
      "Public SIWE session lives inside /member (no dedicated route). Session ≠ membership. Production exposure stays dark unless the founder sets the server-side auth exposure flag.",
  },
  {
    registryId: "member-cockpit",
    moduleId: "member",
    surface: "AUTHENTICATED_MEMBER",
    publicVisible: true,
    adminManaged: true,
    requiresAuth: true,
    requiresApproval: true,
    cta: { label: "Member standing self-readback", href: "/member" },
    homepageZone: "PROMOTED_STRIP",
    proofSource: { kind: "sourceStatus", category: "walletSession" },
    riskClass: "SESSION_SELF_READBACK",
    forbiddenClaims: ["WEALTH_RANKING", "FINANCIAL_UPSIDE"],
    notes:
      "A signed wallet may read ONLY its own standing (memberNumberOf self-readback). No directory or lookup of other wallets exists anywhere.",
  },
  {
    registryId: "verified-introduction",
    moduleId: "source-link",
    surface: "PUBLIC_VISITOR",
    publicVisible: true,
    adminManaged: true,
    requiresAuth: false,
    requiresApproval: true,
    cta: { label: "Build your referral link", href: "/source" },
    homepageZone: "PROMOTED_STRIP",
    proofSource: { kind: "reality", group: "source" },
    riskClass: "OWNER_SIDE_ONCHAIN_ACTION",
    forbiddenClaims: ["UNPAID_LABOR_FRAMING", "INCOME_PROMISE", "FINANCIAL_UPSIDE"],
    notes:
      "Read-only source-id validation and link building. Source creation/activation remain owner-side on-chain acts; introduction = recognition, never a paid role.",
  },
  {
    registryId: "protocol-reality",
    moduleId: null,
    title: "Protocol Reality Spine",
    surface: "API_READ_MODEL",
    publicVisible: true,
    adminManaged: false,
    requiresAuth: false,
    requiresApproval: true,
    cta: { label: "Open the protocol map", href: "/map" },
    homepageZone: "PROMOTED_STRIP",
    proofSource: { kind: "reality", group: "chain" },
    riskClass: "READ_ONLY_PUBLIC",
    forbiddenClaims: [],
    notes:
      "Server-side read-only reconciliation spine (live chain reads vs vendored canon). Fail-closed: canon mismatch → null, never a normalized value. Addresses stay server-side.",
  },
  {
    registryId: "member-continuity",
    moduleId: null,
    title: "Member Continuity (Freeze & Root)",
    surface: "SERVER_SIDE_CANON",
    publicVisible: false,
    adminManaged: true,
    requiresAuth: false,
    requiresApproval: true,
    cta: null,
    homepageZone: "NONE",
    proofSource: { kind: "sourceStatus", category: "continuity" },
    riskClass: "SERVER_ONLY_PII",
    forbiddenClaims: ["WEALTH_RANKING"],
    notes:
      "Verified historical-member freeze is server-only (wallet PII). No UI, API, or projection exposes it; any public member surface is a separate founder-gated slice.",
  },
  {
    registryId: "address-labels",
    moduleId: null,
    title: "Address Labels",
    surface: "PRIVATE_OPERATOR_ADMIN",
    publicVisible: false,
    adminManaged: true,
    requiresAuth: false,
    requiresApproval: true,
    cta: null,
    homepageZone: "NONE",
    proofSource: null,
    fallbackTruthStatus: "FUTURE_MODULE",
    riskClass: "SERVER_ONLY_PII",
    forbiddenClaims: [],
    notes:
      "Future operator tool for labelling server-side addresses. Not designed, not built; labels would never expose full addresses to any client.",
  },
  {
    registryId: "packages-advertising",
    moduleId: null,
    title: "Packages & Advertising",
    surface: "PRIVATE_OPERATOR_ADMIN",
    publicVisible: false,
    adminManaged: true,
    requiresAuth: false,
    requiresApproval: true,
    cta: null,
    homepageZone: "NONE",
    proofSource: null,
    fallbackTruthStatus: "FUTURE_MODULE",
    riskClass: "CONTENT_ONLY",
    forbiddenClaims: ["FINANCIAL_UPSIDE", "INCOME_PROMISE", "GUARANTEED_OUTCOME", "GAMBLING_FRAMING"],
    notes:
      "Future concept only. No packages, pricing, checkout, or placements exist. Any future copy must stay recognition-safe and founder-approved.",
  },
  {
    registryId: "activity-chronicle",
    moduleId: "archive",
    surface: "PUBLIC_VISITOR",
    publicVisible: true,
    adminManaged: true,
    requiresAuth: false,
    requiresApproval: true,
    cta: { label: "Archive & chronicle memory", href: "/archive" },
    homepageZone: "MODULE_STRIP",
    proofSource: { kind: "sourceStatus", category: "chronicle" },
    riskClass: "READ_ONLY_PUBLIC",
    forbiddenClaims: [],
    notes:
      "Chronicle/heartbeat remains a concept surface; the activity read-model is script-only and unwired. Archive reads are not wired.",
  },
  {
    registryId: "recognition",
    moduleId: "recognition",
    surface: "PUBLIC_VISITOR",
    publicVisible: true,
    adminManaged: true,
    requiresAuth: false,
    requiresApproval: true,
    cta: { label: "Recognition model", href: "/recognition" },
    homepageZone: "MODULE_STRIP",
    proofSource: { kind: "sourceStatus", category: "recognition" },
    riskClass: "CONTENT_ONLY",
    forbiddenClaims: ["WEALTH_RANKING", "FINANCIAL_UPSIDE", "UNPAID_LABOR_FRAMING"],
    notes:
      "Recognition = member-status logic (Member Standing / Syndicate Rank vocabulary). Genuine future module; no recognition canon is vendored.",
  },
  {
    registryId: "protocol-map",
    moduleId: "os-map",
    surface: "PRIVATE_OPERATOR_ADMIN",
    publicVisible: false,
    adminManaged: true,
    requiresAuth: false,
    requiresApproval: true,
    cta: null,
    homepageZone: "NONE",
    proofSource: null,
    riskClass: "CONTENT_ONLY",
    forbiddenClaims: [],
    notes:
      "Internal founder preview (operator-gated). The public /map recomposition shipped as its own entry (public-map) so this row keeps the internal /os-map governance coverage intact.",
  },
  {
    registryId: "public-map",
    moduleId: "map",
    surface: "PUBLIC_VISITOR",
    publicVisible: true,
    adminManaged: true,
    requiresAuth: false,
    requiresApproval: true,
    cta: { label: "Open the protocol map", href: "/map" },
    homepageZone: "NONE",
    proofSource: { kind: "reality", group: "sale" },
    riskClass: "READ_ONLY_PUBLIC",
    forbiddenClaims: [],
    notes:
      "Public proof organism at /map — read-only composition of GET /api/protocol/reality (chain, contracts, tokens, sale, source; archive deliberately unbound). Raw base-unit strings are the source of truth; derived displays are labelled and use decimals read from the live tokens group, failing closed to raw-only.",
  },
];

/**
 * The resolved registry: routed entries pull title/route/fallback from
 * modules.ts so there is exactly one route/title truth. `getModuleById` is
 * total over `ModuleId` (compile-time union), so the lookup cannot miss; the
 * defensive fallbacks below are for type-narrowing only.
 */
export const moduleRegistry: readonly ModuleRegistryEntry[] = specs.map((spec) => {
  const mod = spec.moduleId ? getModuleById(spec.moduleId) : undefined;
  return {
    ...spec,
    title: spec.title ?? mod?.label ?? spec.registryId,
    route: mod?.path ?? null,
    fallbackTruthStatus: spec.fallbackTruthStatus ?? mod?.truthStatus ?? null,
  };
});

export const getRegistryEntry = (
  registryId: string,
): ModuleRegistryEntry | undefined =>
  moduleRegistry.find((e) => e.registryId === registryId);
