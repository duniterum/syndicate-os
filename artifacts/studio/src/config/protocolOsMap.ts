// Protocol OS Map — INTERNAL FOUNDER PREVIEW configuration.
// ---------------------------------------------------------------------------
// One structured map of the FULL protocol organism: every subsystem the OS
// knows about, each carrying its honest status. This file mints NO new status
// vocabulary — every node binds to one of the two existing systems:
//   - `surfaceStatus` (TruthStatus reason codes) for product/wiring surfaces
//   - `DisplayLifecycle` for real-but-scoped systems (read-only spine,
//     server-only historical indexes, founder-gated data)
// plus a single boolean, `notPublic`, marking server-only subsystems that have
// NO public UI/API surface and must not get one without founder approval.
//
// `asOf` strings are operator-script-reported figures (counts and dates ONLY —
// never wallets, hashes, or addresses). They are static labels reported by a
// founder-gated script run, not live reads; the date states when.

import type { DisplayLifecycle, SurfaceId } from "./truthStatus";

export type OsMapStatusBinding =
  | { kind: "surface"; surfaceId: SurfaceId }
  | { kind: "lifecycle"; lifecycle: DisplayLifecycle };

export interface OsMapNode {
  id: string;
  label: string;
  binding: OsMapStatusBinding;
  /** Server-only subsystem: no public UI/API exists, none may be added without founder approval. */
  notPublic: boolean;
  /** What this subsystem is, in one sentence. */
  summary: string;
  /** What is actually real today (honest scope, no aspiration). */
  reality: string;
  /** Operator-script-reported figures (counts/dates only), when available. */
  asOf?: string;
}

export interface OsMapDomain {
  id: string;
  label: string;
  description: string;
  nodes: OsMapNode[];
}

export const OS_MAP_PAGE = {
  banner: "INTERNAL FOUNDER PREVIEW — not a live product surface",
  intro:
    "The full protocol organism in one place: every subsystem the OS knows about, with its honest status. Nothing on this page acts, writes, or claims more than the source it names.",
} as const;

export const protocolOsMap: OsMapDomain[] = [
  {
    id: "reality-spine",
    label: "Chain Reality Spine",
    description:
      "Server-side, read-only reconciliation against Avalanche C-Chain. Reads only; fails closed to null on any canon mismatch.",
    nodes: [
      {
        id: "chain-identity",
        label: "Chain identity",
        binding: { kind: "lifecycle", lifecycle: "READ_ONLY_PROOF" },
        notPublic: false,
        summary: "eth_chainId reconciled against the expected chain (43114).",
        reality:
          "Wired read-only via the protocol reality endpoint. Wrong chain means every dependent signal reports null.",
      },
      {
        id: "contract-code",
        label: "Contract code presence",
        binding: { kind: "lifecycle", lifecycle: "READ_ONLY_PROOF" },
        notPublic: false,
        summary: "Bytecode presence checks for the vendored contract set.",
        reality:
          "Wired read-only. Addresses stay server-side; the client sees presence booleans and labels only.",
      },
      {
        id: "erc20-metadata",
        label: "SYN token metadata",
        binding: { kind: "lifecycle", lifecycle: "READ_ONLY_PROOF" },
        notPublic: false,
        summary: "ERC-20 name/symbol/decimals reconciled against vendored canon.",
        reality: "Wired read-only. Canon mismatch reports null, never a normalized value.",
      },
      {
        id: "sale-engines",
        label: "Membership sale engines (V1/V2/V3)",
        binding: { kind: "lifecycle", lifecycle: "READ_ONLY_PROOF" },
        notPublic: false,
        summary:
          "Lifecycle flags for all three engines; public figures for the active V3 engine as exact raw base-unit strings.",
        reality:
          "Wired read-only. No wallet, purchase, or referral surface exists anywhere in the app.",
      },
    ],
  },
  {
    id: "historical-index",
    label: "Server-Only Historical Index",
    description:
      "Founder-gated, script-written history. These tables are never read by served code and have no public UI or API surface.",
    nodes: [
      {
        id: "sale-event-raw",
        label: "Sale event raw index (Part A)",
        binding: { kind: "lifecycle", lifecycle: "HISTORICAL_PROOF" },
        notPublic: true,
        summary: "Insert-only raw index of on-chain sale events, replayable byte-for-byte.",
        reality:
          "Backfilled once by a founder-gated script. Served code never reads or writes it.",
        asOf: "26 raw events across 17 blocks — operator script, 2026-07-02",
      },
      {
        id: "protocol-time",
        label: "Protocol Time (block-timestamp cache)",
        binding: { kind: "lifecycle", lifecycle: "HISTORICAL_PROOF" },
        notPublic: true,
        summary:
          "Chain-verified timestamp for every indexed block, fetched header-by-header and witness-checked.",
        reality:
          "Every distinct indexed block carries a chain-verified timestamp; replays re-verify the whole cache and insert nothing.",
        asOf: "17 of 17 distinct blocks verified — operator script, 2026-07-02",
      },
      {
        id: "member-freeze",
        label: "Historical member freeze (Part B)",
        binding: { kind: "lifecycle", lifecycle: "FOUNDER_GATED" },
        notPublic: true,
        summary: "Verified historical-member freeze imported once from the founder artifact.",
        reality:
          "Wallet-bearing data. Server-only, no UI/API projection exists, and none may be added without founder approval.",
        asOf: "8 verified historical members — founder-gated import, 2026-07-02",
      },
      {
        id: "member-continuity",
        label: "Member continuity derivation",
        binding: { kind: "lifecycle", lifecycle: "FOUNDER_GATED" },
        notPublic: true,
        summary: "Continuity records reconciling frozen members with indexed sale events.",
        reality: "Derived server-side by a founder-gated script; never served.",
        asOf: "10 continuity records — operator script, 2026-07-02",
      },
      {
        id: "activity-heartbeat",
        label: "Activity heartbeat read-model",
        binding: { kind: "lifecycle", lifecycle: "HISTORICAL_PROOF" },
        notPublic: true,
        summary:
          "In-memory activity derivation over the raw index and Protocol Time — purchases with Routed rows folded in, chain-verified day granularity.",
        reality:
          "Rebuilt unattended by the event backbone each cycle and served on /activity as the receipt-line feed (H2-P: lines speak the origin voice — member number + short-form signature; a full address never serializes). The aggregate status report stays address-safe.",
        asOf: "served live by the event backbone — the complete indexed history",
      },
    ],
  },
  {
    id: "pending-wiring",
    label: "Canon Vendored, Wiring Pending",
    description:
      "Contract canon (ABIs, registries, taxonomies) is vendored; the honest remaining gap is the live adapter or indexer.",
    nodes: [
      {
        id: "proof-of-fire",
        // Truth sweep 2026-07-17: the four "…once the adapter/indexer exists"
        // photographs below were Slice-2.7-era fossils — the backbone shipped.
        label: "Proof of Fire",
        binding: { kind: "lifecycle", lifecycle: "READ_ONLY_PROOF" },
        notPublic: false,
        summary: "The complete numbered burn record, served live.",
        reality: "LIVE — /fire-ledger serves every burn, numbered, from the event backbone; the live total is a direct chain read.",
      },
      {
        id: "membership-index",
        label: "Membership index",
        binding: { kind: "lifecycle", lifecycle: "READ_ONLY_PROOF" },
        notPublic: false,
        summary: "Member state served from the indexed record.",
        reality: "LIVE — the sale-event index, seat history, capital standing and the own-row standing readback serve member state in production.",
      },
      {
        id: "source-attribution",
        label: "Source attribution",
        binding: { kind: "lifecycle", lifecycle: "LIVE_ACTION" },
        notPublic: false,
        summary: "Verified-introduction attribution, live and paying.",
        reality: "LIVE — the registry pays a referred join inside the buyer's own transaction; the R5 introduction indexer serves real standing.",
      },
      {
        id: "archive",
        label: "Archive / Chronicle",
        binding: { kind: "lifecycle", lifecycle: "READ_ONLY_PROOF" },
        notPublic: false,
        summary: "Minting open; every mint on the indexed record.",
        reality: "LIVE — archive mints ride the indexed record and the feed's archive lane; the museum surface with page-level live reads is the honest remaining gap.",
      },
    ],
  },
  {
    id: "product-surfaces",
    label: "Product Surfaces",
    description:
      "What visitors, members, and the founder see. Every surface carries its truth label; nothing implies wiring that does not exist.",
    nodes: [
      {
        id: "public-dashboard",
        label: "Public dashboard",
        binding: { kind: "lifecycle", lifecycle: "READ_ONLY_PROOF" },
        notPublic: false,
        summary: "The public proof surfaces, live in production.",
        reality: "LIVE — the homepage, /proof, /map, /activity and the ledgers serve live chain reads on thesyndicate.money.",
      },
      {
        id: "member-cockpit",
        label: "Member Home",
        binding: { kind: "lifecycle", lifecycle: "AUTH_REQUIRED" },
        notPublic: false,
        summary: "The member's own-row surface, live in production.",
        reality: "LIVE — SIWE auth in prod; a signed-in member reads their own seat, receipt, standing and purchases (own-row only, never a directory).",
      },
      {
        id: "recognition",
        label: "Recognition",
        binding: { kind: "surface", surfaceId: "recognition" },
        notPublic: false,
        summary: "The recognition model as a future concept.",
        reality: "Genuine future module; no dedicated canon is vendored.",
      },
      {
        id: "founder-controls",
        label: "Founder controls",
        binding: { kind: "surface", surfaceId: "founderControls" },
        notPublic: false,
        summary: "Founder-gated operational controls.",
        reality: "Founder authentication is LIVE (server-confirmed founder_root); the working controls run in /admin (operators, referral terms, propose-source — audit-logged). The dedicated Founder OS surface stays a preview.",
      },
    ],
  },
  {
    id: "future-governance",
    label: "Future & Governance Concepts",
    description:
      "Named, not built. Each entry below is a labelled concept only — no route, write, endpoint, or data exists for any of them, and none may be wired without founder approval.",
    nodes: [
      {
        id: "notice-os",
        label: "Notice OS",
        binding: { kind: "lifecycle", lifecycle: "FUTURE" },
        notPublic: false,
        summary: "A read-only surface for protocol notices and announcements.",
        reality:
          "Concept only. No broadcast, notification, email, or persistence exists or is designed.",
      },
      {
        id: "knowledge-os",
        label: "Knowledge OS",
        binding: { kind: "lifecycle", lifecycle: "FUTURE" },
        notPublic: false,
        summary:
          "A guided learn, verify, and inspect map over the public read-only surfaces.",
        reality:
          "A first Knowledge OS map is present on the public /learning page today; deeper guided tooling is a future concept.",
      },
      {
        id: "acknowledgement",
        label: "Acknowledgement & recognition moments",
        binding: { kind: "lifecycle", lifecycle: "FUTURE" },
        notPublic: false,
        summary: "Read-only acknowledgement of verified member milestones.",
        reality:
          "Concept only. Recognition is structural, never a financial benefit; nothing is wired.",
      },
      {
        id: "admin-audit",
        label: "Admin audit / activity spine",
        binding: { kind: "lifecycle", lifecycle: "FUTURE" },
        notPublic: true,
        summary:
          "A future append-only audit trail of operator reads (never a write to the protocol).",
        reality:
          "Concept only. The activity read-model is script-only today; no audit persistence exists or is designed.",
      },
      {
        id: "link-registry",
        label: "Link registry / CTA safety",
        binding: { kind: "lifecycle", lifecycle: "FUTURE" },
        notPublic: false,
        summary:
          "A governed registry of outbound links and calls-to-action, checked for safe framing.",
        reality:
          "Concept only. CTA copy is governed by the forbidden-copy guard today; a runtime link registry is not built.",
      },
      {
        id: "admin-gates",
        label: "Admin gates",
        binding: { kind: "lifecycle", lifecycle: "FOUNDER_GATED" },
        notPublic: false,
        summary:
          "The founder/operator visibility and approval gates governing internal surfaces.",
        reality:
          "Real today as build-time visibility gates (operator preview, wallet session, server-side auth exposure) — read-only, not authentication.",
      },
    ],
  },
];
