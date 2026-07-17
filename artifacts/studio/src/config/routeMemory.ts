// config/routeMemory.ts
//
// Phase 0 — typed route/product memory of the prior public TheSyndicate.
//
// This classifies the legacy surface families harvested in the prior-art audits
// so the current read-only OS can decide what it PRESERVES, DEFERS, or REJECTS.
// It is reference-pattern memory only: naming a legacy family here is NOT a claim
// that any data, contract, adapter, or live wiring exists in this foundation.
//
// Dependency-free on purpose so the Node guard scripts in `scripts/` can load it
// directly via Node's native TypeScript support.

export type RouteMemoryClass =
  | "PRESERVE_PUBLIC"
  | "MERGE_PUBLIC"
  | "AUTH_MEMBER_FUTURE"
  | "PRIVATE_OPERATOR_FUTURE"
  | "PROOF_OR_ARCHIVE"
  | "LEARNING_OR_CHRONICLE"
  | "CONTRACT_MEMORY"
  | "SOURCE_ATTRIBUTION"
  | "REJECT_UNSAFE"
  | "DEFER_POST_MVP";

export const routeMemoryClassText: Record<RouteMemoryClass, string> = {
  PRESERVE_PUBLIC: "Preserve (public)",
  MERGE_PUBLIC: "Merge into public",
  AUTH_MEMBER_FUTURE: "Member, behind auth (future)",
  PRIVATE_OPERATOR_FUTURE: "Operator-only (future)",
  PROOF_OR_ARCHIVE: "Proof / archive memory",
  LEARNING_OR_CHRONICLE: "Learning / chronicle",
  CONTRACT_MEMORY: "Contract / economy memory",
  SOURCE_ATTRIBUTION: "Source attribution",
  REJECT_UNSAFE: "Rejected (unsafe framing)",
  DEFER_POST_MVP: "Deferred (post-MVP)",
};

export interface RouteMemoryEntry {
  id: string;
  /** The legacy surface family name, as remembered from prior art. */
  legacyName: string;
  description: string;
  classification: RouteMemoryClass;
  /** What this organism does with the family — preserve, fold, defer, or reject. */
  disposition: string;
  /** The current route this family informs today, when one exists. */
  mappedRoute?: string;
}

export const routeMemory: RouteMemoryEntry[] = [
  {
    id: "public-cockpit",
    legacyName: "Public Cockpit",
    description: "The public front page — hero, activity tape, headline protocol signals.",
    classification: "PRESERVE_PUBLIC",
    disposition:
      "Kept as the curated front door. The live ticker is not reproduced; protocol signals stay truth-labelled.",
    mappedRoute: "/",
  },
  {
    id: "membership-join",
    legacyName: "Membership / Join",
    description: "The membership sale landing and buy flow.",
    classification: "MERGE_PUBLIC",
    disposition:
      "Folded into an honest member preview and seat framing. The live buy flow now lives at /join (C5 go-live, founder 2026-07-13).",
    // AUD-ROUTE (2026-07-17): the mapping now matches its own disposition —
    // the legacy buy flow maps to the live /join, not the member door.
    mappedRoute: "/join",
  },
  {
    id: "institutional-register",
    legacyName: "Institutional Register",
    description: "A public register of membership seats and standing.",
    classification: "CONTRACT_MEMORY",
    disposition:
      "Represented as posture-only contract memory. No member rows, balances, or seats are shown.",
    mappedRoute: "/contracts",
  },
  {
    id: "my-syndicate",
    legacyName: "My Syndicate",
    description: "The member-only cockpit for a signed-in seat holder.",
    classification: "AUTH_MEMBER_FUTURE",
    disposition:
      "Shown only as a labelled member preview. The real cockpit requires authentication that is not built.",
    mappedRoute: "/member",
  },
  {
    id: "tokenomics-economy",
    legacyName: "Tokenomics / Economy",
    description: "Token allocation, treasury routing, and economy transparency.",
    classification: "CONTRACT_MEMORY",
    disposition:
      "Recorded as read-only economy memory (roles + routing structure). No live values are read.",
    mappedRoute: "/contracts",
  },
  {
    id: "registry-explorer",
    legacyName: "Registry / Explorer",
    description: "A browser of contracts, wallets, transactions, and milestones.",
    classification: "CONTRACT_MEMORY",
    disposition:
      "Distilled into contract memory cards (roles + lifecycle). No addresses, hashes, or live reads.",
    mappedRoute: "/contracts",
  },
  {
    id: "archive-museum",
    legacyName: "Archive / Museum",
    description: "Archive artifacts and collectible protocol memory.",
    classification: "PROOF_OR_ARCHIVE",
    disposition:
      "Represented as the archive memory surface; artifacts are minted on-chain and every mint lands on the indexed record.",
    mappedRoute: "/archive",
  },
  {
    id: "chronicle",
    legacyName: "Chronicle",
    description: "Long-form institutional memory and protocol milestones.",
    classification: "LEARNING_OR_CHRONICLE",
    disposition:
      "Kept as a chronicle within the archive surface — narrative memory, not live data.",
    mappedRoute: "/archive",
  },
  {
    id: "ranks-recognition",
    legacyName: "Ranks / Recognition",
    description: "A structural ladder recognising verified participation.",
    classification: "LEARNING_OR_CHRONICLE",
    disposition:
      "Explained as a conceptual recognition model. No ranks, scores, or member placement are invented.",
    mappedRoute: "/recognition",
  },
  {
    id: "verified-introduction",
    legacyName: "Verified Introduction",
    description: "The source-attribution model for who introduced a member.",
    classification: "SOURCE_ATTRIBUTION",
    disposition:
      "Public-safe attribution vision on its own surface; the operator surface stays paused.",
    // AUD-ROUTE (2026-07-17): map to the CANONICAL route — /source-attribution
    // is the legacy 200-alias that cross-canonicalizes into /referral.
    mappedRoute: "/referral",
  },
  {
    id: "learning-docs",
    legacyName: "Learning / Docs",
    description: "Whitepaper, FAQ, glossary, and on-chain literacy material.",
    classification: "LEARNING_OR_CHRONICLE",
    disposition: "Rebuilt as plain-language learning content that is real and present today.",
    mappedRoute: "/learning",
  },
  {
    id: "labs-workbenches",
    legacyName: "Labs / Workbenches",
    description: "Internal inspection and tooling workbenches.",
    classification: "PRIVATE_OPERATOR_FUTURE",
    disposition: "Reframed as operator previews in the console. Disabled; not real tooling.",
    mappedRoute: "/proof-studio",
  },
  {
    id: "foundation-triage",
    legacyName: "Foundation Triage",
    description: "Support intake and review queues for the foundation.",
    classification: "DEFER_POST_MVP",
    disposition:
      "A public help entry is built (states only). Operator triage queues are deferred.",
    mappedRoute: "/support",
  },
  {
    id: "admin-broadcast",
    legacyName: "Admin Broadcast",
    description: "Operator-to-member announcements and broadcasts.",
    classification: "PRIVATE_OPERATOR_FUTURE",
    disposition: "Reserved for the founder/operator surface. Not built or wired.",
    mappedRoute: "/founder",
  },
  {
    id: "marketplace",
    legacyName: "Marketplace",
    description: "A future marketplace for trading protocol artifacts.",
    classification: "DEFER_POST_MVP",
    disposition: "Recorded as a deferred concept. No route, no listings, no payments.",
  },
  {
    id: "yield-earnings",
    legacyName: "Yield / Earnings",
    description: "Any surface framing membership as passive income or financial return.",
    classification: "REJECT_UNSAFE",
    disposition:
      "Explicitly rejected. It violates the protocol's doctrine: membership is not an investment and promises no financial gain.",
  },
];

export const getRouteMemoryByClass = (
  classification: RouteMemoryClass,
): RouteMemoryEntry[] => routeMemory.filter((r) => r.classification === classification);

export const getRouteMemoryById = (id: string): RouteMemoryEntry | undefined =>
  routeMemory.find((r) => r.id === id);
