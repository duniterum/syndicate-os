// config/referralProgram.ts
//
// The PUBLIC "Referral Program" vocabulary layer that sits on top of the
// protocol-internal "Source" terminology (config/sourceAttributionTerminology).
//
// DOCTRINE (founder directive, 2026-07-07 — the corrected position):
//   The Syndicate is a membership BUSINESS, not a charity. A referral is an
//   acquisition mechanic and must be presented plainly, like Binance/Kraken:
//   clear, bounded, terms-based — never hidden, never dressed up as pure
//   charity, and never an upside promise: no passive income, no yield, no
//   downline, no profit.
//   Word roles:  Referral = user word · Source = protocol word ·
//   Commission = business word · Receipt = proof word · Recognition = long-term
//   status word.
//
// STATE — ACTIVE (founder override 2026-07-13, canon: SESSION_STATE + the
// SPEC header: "referral not active in the MVP" is DEAD). The rail is proven
// with real money: the first purchase (seat #13) paid the introducer's
// payoutWallet inside the buyer's own transaction. `programLifecycle` below is
// the single switch; copy still NEVER says "earn now" — the commission is a
// bounded commission, and every protective disclaimer stays pinned by
// guard-safe-source forever. New sources remain founder-signed on-chain acts
// (SPEC R2); self-service creation arrives with the emitter (R7).
//
// Dependency-free except a type-only import → Node-loadable. Guarded by
// guard-forbidden-copy (negation-aware) and guard-safe-source.

import type { DisplayLifecycle } from "./truthStatus";

/**
 * The one lifecycle switch for the whole public referral layer.
 * LIVE_ACTION ("Live — signed from your wallet") is exactly true: the
 * commission is paid inside the purchase transaction the BUYER signs.
 */
export const programLifecycle: DisplayLifecycle = "LIVE_ACTION";

/** Public (user) word  →  protocol (proof) word. Both are used on purpose. */
export const publicToProtocol: Record<string, string> = {
  Referral: "Source",
  "Referral link": "Source link",
  "Referral code": "Source code / Source ID",
  "Referral commission": "Source payment (the contract calls it acquisitionCost)",
  "Referral dashboard": "Source dashboard",
  "Referred member": "Introduced member",
  "Referral history": "Source receipts / Introduction history",
  "Referral receipt": "Source-linked receipt",
};

/** The five word roles that keep the language honest. */
export const wordRoles = {
  user: "Referral",
  protocol: "Source",
  business: "Commission",
  proof: "Receipt",
  longTerm: "Recognition",
} as const;

/**
 * The constitutional line. Every negative clause is an honest disclaimer
 * (allowed by the negation-aware copy guard); nothing here is a positive claim.
 */
export const constitutionalLine =
  "Referral commissions are transparent payments for eligible completed member introductions — not passive income, not token yield, not downline, and not a profit promise.";

/** Short reusable boundary shown near any commission mention. */
export const boundaryLine =
  "A referral commission is a bounded, one-time payment for a completed introduction. It is not token yield, not passive income, not equity, and not a guarantee of token appreciation.";

/** "Not a charity" — said professionally. */
export const notCharityLine =
  "The Syndicate is a membership business with transparent acquisition mechanics. Referral commissions compensate eligible member acquisition; they are not donations, not charity points, and not investment returns.";

/**
 * The program states an introduction/commission can be in (buyer- and
 * operator-visible). The buyer must SEE the applied source and its amount
 * before signing — visibility is what keeps it honest (FOUNDER OVERRIDE
 * 2026-07-13: there is NO buyer clear/remove control; the referral does not
 * change the buyer's price, and a removal button would only strip the
 * referrer of earned work).
 */
export interface ProgramState {
  id: string;
  meaning: string;
}
export const programStates: ProgramState[] = [
  { id: "Active", meaning: "The referral code is usable." },
  { id: "Applied", meaning: "A referral code is attached to this checkout." },
  { id: "Eligible", meaning: "The conditions appear to be met." },
  { id: "Pending", meaning: "Purchase, indexing, or confirmation is not final yet." },
  { id: "Paid", meaning: "The commission has been recorded as paid." },
  { id: "Ineligible", meaning: "The referral did not qualify (see reason)." },
  { id: "Flagged", meaning: "Held for anti-abuse or manual review." },
  { id: "Paused", meaning: "The program is not publicly active right now." },
  { id: "Expired", meaning: "The code or attribution window has expired." },
];

/** "How it works" — six plain steps. */
export const howItWorks: string[] = [
  "Share your referral link with serious people.",
  "A new member reviews the terms.",
  "They join by their own choice.",
  "The purchase records the referral on-chain.",
  "The commission is marked pending or paid.",
  "The receipt stays visible in your history.",
];

/** "What counts" — an eligible referral requires all of these. */
export const eligibility: string[] = [
  "A new buyer (not an existing member).",
  "A valid referral link or code.",
  "A completed membership purchase.",
  "No self-referral.",
  "No circular referral.",
  "No abuse flag.",
  "Active program terms.",
  "Receipt / indexer confirmation.",
];

/** Receipt fields shown for a source-linked purchase. */
export const receiptFields: { field: string; meaning: string }[] = [
  { field: "Referral code", meaning: "The on-chain identifier (the protocol calls it a source id)." },
  { field: "Purchase tx", meaning: "Proof of a completed join." },
  { field: "Gross amount", meaning: "Total purchase amount." },
  { field: "Referral commission", meaning: "The commission paid, if eligible." },
  { field: "Net routed", meaning: "Amount routed after the referral commission." },
  { field: "Routing split", meaning: "Protocol allocation." },
  { field: "Status", meaning: "Pending / Paid / Ineligible." },
  { field: "Reason", meaning: "Why, if ineligible." },
];

/** Anti-abuse rules — so it can never read like a farm. */
export const antiAbuse: string[] = [
  "No self-referral and no same wallet.",
  "No circular referral.",
  "No bots or fake accounts.",
  "No wash purchases.",
  "No referral code on an already-existing member.",
  "No hidden attribution — the referral and its amount are always shown before signing. The referral does not change the buyer's price.",
  "Commissions stay pending until confirmation.",
  "Abnormal patterns go to abuse review.",
  "Caps and windows may apply.",
];

/**
 * Recognition rankings — merit, never money-ranking. Time and retention win
 * over raw volume; there is never an MLM tree, a downline, or a lifetime-income
 * ladder.
 */
export const goodRankings: string[] = [
  "Top Verified Introducers",
  "Durable Referrers",
  "Long-Term Member Referrers",
  "High-Signal Introducers",
  "Recognized Referrers",
  "Retention-weighted Referrer Rank",
  "Members Introduced",
  "Active Members Introduced",
];
export const rankingDoctrine =
  "Money creates attribution. Time creates reputation. History creates memory. Rankings are retention- and quality-weighted — never by raw money, never a downline, never an MLM tree, never a lifetime-income ladder.";

/** Copy that must show while the program is paused (never "earn now"). */
export const pausedCopy = {
  status:
    "Referral infrastructure is prepared and has been internally tested, but public referral activation is currently paused.",
  detail:
    "Public and default purchases stay source-neutral unless active terms say otherwise. Public activation will require active terms, receipt readback, and founder approval.",
};

/** Copy for the ACTIVE program (founder-published 2026-07-13). */
export const activeCopy = {
  status: "The referral program is active under the current terms.",
  detail:
    "An eligible source-linked membership purchase generates a bounded commission, paid directly to the introducer's wallet inside the buyer's own purchase transaction — on-chain, shown by receipt. New sources are created by a founder-signed on-chain act.",
};

/** The copy the surfaces render — selected by the single lifecycle switch. */
export const currentProgramCopy =
  programLifecycle === "LIVE_ACTION" ? activeCopy : pausedCopy;

/** Member-cockpit referral cards — each labelled for exactly how real it is
 * TODAY (program ACTIVE since 2026-07-13; the introduction read-model /
 * indexer is SPEC slice R5 and is not wired yet, so per-member histories
 * honestly say "Not live yet" rather than pretending). */
export interface MemberReferralCard {
  title: string;
  note: string;
  lifecycle: DisplayLifecycle;
}
export const memberCards: MemberReferralCard[] = [
  { title: "My referral link", note: "The program is active: validate your source id on /source and build a shareable join link. A new source itself is a founder-signed on-chain act.", lifecycle: "READ_ONLY_PROOF" },
  { title: "My introductions", note: "Members you have introduced, read from verified source records — arrives with the introduction read-model (indexer).", lifecycle: "PENDING_ADAPTER" },
  { title: "Referral receipts", note: "Receipt-backed proof of each eligible introduction — arrives with the introduction read-model (indexer).", lifecycle: "PENDING_ADAPTER" },
  { title: "Pending commissions", note: "Commissions awaiting confirmation — the payment itself is on-chain in the buyer's transaction; the readable history arrives with the indexer.", lifecycle: "PENDING_ADAPTER" },
  { title: "Paid commissions", note: "Commissions recorded as paid — verifiable on-chain today on the introducer's wallet; the in-app history arrives with the indexer.", lifecycle: "PENDING_ADAPTER" },
  { title: "Source standing", note: "Your non-financial recognition as a source, retention-weighted — a future concept.", lifecycle: "FUTURE" },
];

// ─────────────────────────────────────────────────────────────────────────
// SAMPLE dashboard data — shape only, never live.
// Every figure below is illustrative and MUST render behind a SampleTag /
// paused banner. It shows a member and an operator what the live dashboard
// will look like; it is never read as real activity. At activation these
// arrays are replaced by verified read-model / receipt data.
// ─────────────────────────────────────────────────────────────────────────

export const sampleReferralLink = "https://thesyndicate.money/join?source=SAMPLE-CODE";
export const sampleReferralCode = "SAMPLE-CODE";

export interface ReferralStat {
  label: string;
  sampleValue: string;
}
export const memberStatsSample: ReferralStat[] = [
  { label: "Introductions", sampleValue: "12" },
  { label: "Eligible", sampleValue: "9" },
  { label: "Members joined", sampleValue: "7" },
  { label: "Pending commission", sampleValue: "$35.00" },
  { label: "Paid commission", sampleValue: "$120.00" },
];

export interface ReferralHistoryRow {
  referred: string;
  date: string;
  status: string;
  commission: string;
}
export const memberHistorySample: ReferralHistoryRow[] = [
  { referred: "0x71C…976F", date: "Today", status: "Pending", commission: "$5.00" },
  { referred: "0x3A2…145A", date: "Yesterday", status: "Paid", commission: "$5.00" },
  { referred: "0x9F4…22B1", date: "3 days ago", status: "Paid", commission: "$5.00" },
  { referred: "0xC08…7E30", date: "Last week", status: "Ineligible", commission: "—" },
];

export interface TrendPoint {
  label: string;
  value: number;
}
export const memberTrendSample: TrendPoint[] = [
  { label: "W1", value: 2 },
  { label: "W2", value: 1 },
  { label: "W3", value: 4 },
  { label: "W4", value: 3 },
  { label: "W5", value: 5 },
  { label: "W6", value: 4 },
  { label: "W7", value: 6 },
];

export const adminKpisSample: ReferralStat[] = [
  { label: "Source-attributed buys", sampleValue: "34" },
  { label: "Gross USDC (source)", sampleValue: "$4,250" },
  { label: "Commissions paid", sampleValue: "$720" },
  { label: "Commissions pending", sampleValue: "$180" },
  { label: "Net routed after commission", sampleValue: "$3,350" },
];

export interface TopSourceRow {
  source: string;
  introduced: number;
  durable: number;
  quality: string;
}
export const adminTopSourcesSample: TopSourceRow[] = [
  { source: "0x71C…976F", introduced: 9, durable: 7, quality: "High" },
  { source: "0x3A2…145A", introduced: 6, durable: 5, quality: "High" },
  { source: "0x9F4…22B1", introduced: 5, durable: 2, quality: "Medium" },
];
export const adminAbuseFlagsSample: { flag: string; count: string }[] = [
  { flag: "Self-referral attempts", count: "3" },
  { flag: "Circular referral attempts", count: "1" },
  { flag: "Flagged for review", count: "2" },
];
export const adminConversionSample: TrendPoint[] = [
  { label: "W1", value: 3 },
  { label: "W2", value: 2 },
  { label: "W3", value: 5 },
  { label: "W4", value: 4 },
  { label: "W5", value: 7 },
  { label: "W6", value: 5 },
  { label: "W7", value: 8 },
];

// ── Commission tiers (source classes), hard cap, and transparency event ──────
// Human-readable %. Storage/emission on-chain is basis points (bps): 5% = 500,
// 8% = 800, 30% = 3000. A hard cap applies to EVERY class and every change.
export const commissionCapPct = 30; // hard maximum — 30% = 3000 bps
export interface CommissionTier {
  name: string;
  pct: number;
  note: string;
}
export const commissionTiers: CommissionTier[] = [
  { name: "Standard", pct: 5, note: "Default source class for verified referrals." },
  { name: "Trusted", pct: 8, note: "Higher commission rate for consistent, high-retention sources." },
  { name: "Partner", pct: commissionCapPct, note: "Negotiated partnership class — at the hard cap." },
];
// Every change to a source's class / commission % / cap / window is recorded as
// this governance event, so it surfaces in Activity + Chronicle (old → new,
// actor, timelock). Reserved today; registered under the `governance` namespace.
export const rateChangeEvent = {
  kind: "source-terms-changed",
  namespace: "governance",
  note: "Rate, tier, cap, and window changes are recorded on-chain-adjacent as a governance event and shown in Activity + Chronicle — old value → new value, who changed it, and the timelock. Total transparency, no silent edits.",
} as const;

/**
 * FIXED acquisition structure — DISPLAY ONLY. These describe the fixed $5
 * per-join payment and its protocol routing; they are never editable and never
 * sent to the write zone. (Doctrine: the fixed 70/20/10 routing is a separate
 * system from the variable per-source commission rate below — never conflate them.)
 */
export interface ReferralSetting {
  key: string;
  label: string;
  value: string;
}
export const referralSettingsSample: ReferralSetting[] = [
  { key: "commissionPerJoin", label: "Commission per eligible join", value: "$5.00" },
  { key: "referrerInstant", label: "Paid to referrer instantly", value: "$0.25" },
  { key: "protocolRouted", label: "Sent to the Syndicate", value: "$4.75" },
  { key: "split", label: "Protocol split (vault / liquidity / ops)", value: "70 / 20 / 10" },
  { key: "capPerSource", label: "Gross cap per source", value: "No cap" },
];

/**
 * EDITABLE terms — writable through the operator write zone. `key` is the
 * SERVER's canonical key and `value` is already in the server's canonical unit
 * (basis points, days, USDC), so Save posts them VERBATIM — no client-side
 * conversion and no key drift. Bps values are hard-capped server-side at 3000.
 */
export interface ReferralEditableTerm {
  key: "commissionBps" | "capBps" | "attributionWindowDays" | "minPurchaseUsdc";
  label: string;
  value: string;
  hint: string;
}
export const referralEditableTerms: ReferralEditableTerm[] = [
  { key: "commissionBps", label: "Standard commission rate", value: "500", hint: "basis points · 500 = 5% · hard cap 3000 (30%)" },
  { key: "capBps", label: "Commission rate cap", value: "3000", hint: "basis points · 3000 = 30% (hard cap)" },
  { key: "attributionWindowDays", label: "Attribution window", value: "30", hint: "days" },
  { key: "minPurchaseUsdc", label: "Minimum qualifying purchase", value: "50", hint: "USDC" },
];
export const referralEligibilityToggles: { key: string; label: string; on: boolean }[] = [
  { key: "blockSelf", label: "Block self-referral", on: true },
  { key: "blockCircular", label: "Block circular referral", on: true },
  { key: "requireReceipt", label: "Require receipt / indexer confirmation", on: true },
  { key: "abuseReview", label: "Send abnormal patterns to abuse review", on: true },
];

/** Operator role hierarchy — mirrors OPERATOR_WALLET_AUTH_AND_ROLES_DESIGN §D. */
// `id` is the CANONICAL server-side role identifier (the operator registry's
// role enum); `role` is the human display name. The invite form submits ids.
export const operatorRoles: { id: string; role: string; scope: string }[] = [
  { id: "founder_root", role: "Founder / root", scope: "Everything, plus admin-tier registry changes, recovery approvals, emergency suspension." },
  { id: "protocol_admin", role: "Protocol admin", scope: "Flags, exports, broadcast approval, support overrides, non-admin registry proposals." },
  { id: "operator", role: "Operator", scope: "Day-to-day console: reports, support queue, content ops, read dashboards." },
  { id: "source_reviewer", role: "Source / referral reviewer", scope: "Reviews source attributions; approves within policy." },
  { id: "member_support", role: "Member support", scope: "Member queue with least-data context; respond and escalate." },
  { id: "content_docs", role: "Content / docs operator", scope: "Public copy and docs surfaces; no member data." },
  { id: "auditor", role: "Auditor / read-only", scope: "Reads audit log, redacted registry, reports. Zero mutations." },
  { id: "worker_agent", role: "Worker / agent", scope: "Scoped non-human identity; proposal-only by default." },
];

export interface OperatorRow {
  label: string;
  wallet: string;
  role: string;
  status: string;
}
export const operatorsSample: OperatorRow[] = [
  { label: "Founder", wallet: "0x71C…976F", role: "Founder / root", status: "Active" },
  { label: "Ops lead", wallet: "0x3A2…145A", role: "Protocol admin", status: "Active" },
  { label: "Support 1", wallet: "0x9F4…22B1", role: "Member support", status: "Active" },
  { label: "Source reviewer", wallet: "0xC08…7E30", role: "Source / referral reviewer", status: "Invited" },
  { label: "Auditor", wallet: "0x5D1…88A0", role: "Auditor / read-only", status: "Suspended" },
];

export const sourceReviewSample: { source: string; requested: string; status: string }[] = [
  { source: "0x71C…976F", requested: "Today", status: "Pending review" },
  { source: "0x3A2…145A", requested: "Yesterday", status: "Approved" },
  { source: "0x9F4…22B1", requested: "2 days ago", status: "Flagged" },
];

export const featureFlagsSample: { key: string; label: string; on: boolean }[] = [
  { key: "referralPublic", label: "Public referral program", on: false },
  { key: "walletSession", label: "Wallet session (SIWE)", on: true },
  { key: "sourceValidate", label: "Source link validation", on: true },
  { key: "operatorConsole", label: "Operator console", on: false },
  { key: "archiveReads", label: "Archive reads", on: false },
];

export const auditLogSample: { actor: string; action: string; target: string; when: string }[] = [
  { actor: "Founder", action: "Updated referral terms", target: "referral.commission", when: "2 min ago" },
  { actor: "Ops lead", action: "Suspended operator", target: "0x5D1…88A0", when: "1 h ago" },
  { actor: "Source reviewer", action: "Approved source", target: "0x3A2…145A", when: "3 h ago" },
  { actor: "Founder", action: "Toggled feature flag", target: "operatorConsole", when: "yesterday" },
];

export const supportQueueSample: { id: string; subject: string; requester: string; status: string }[] = [
  { id: "T-1042", subject: "Where is my receipt?", requester: "0x71C…976F", status: "Open" },
  { id: "T-1041", subject: "Referral link not tracking", requester: "0x3A2…145A", status: "In review" },
  { id: "T-1039", subject: "Update my source label", requester: "0x9F4…22B1", status: "Resolved" },
];

/**
 * The shareable "verified introducer" card — a referrer's public, on-chain
 * verifiable proof + their referral link, designed to be shared in one tap.
 * The differentiator vs ordinary referral programs: the figures are not claims,
 * they are on-chain and verifiable. Sample today (paused); real at activation.
 */
export const shareCardSample = {
  eyebrow: "Verified on-chain",
  headline: "7 members introduced",
  subline: "$120 in verified referral commissions",
  tagline: "Proof, not claims — every figure is on-chain and verifiable.",
  proofHref: "/proof",
  joinHref: "/join?source=SAMPLE-CODE",
  link: sampleReferralLink,
};

/** The whole public surface, assembled — read by /source when it renders. */
export const referralProgram = {
  heading: "Referral Program",
  poweredBy: "Powered by Source Attribution",
  subheading:
    "Invite serious members into The Syndicate. An eligible referral generates a transparent commission when a completed membership purchase is recorded.",
  lifecycle: programLifecycle,
  constitutionalLine,
  boundaryLine,
  notCharityLine,
  howItWorks,
  eligibility,
  receiptFields,
  antiAbuse,
  goodRankings,
  rankingDoctrine,
  pausedCopy,
  activeCopy,
  /** The lifecycle-selected status copy the surfaces actually render. */
  statusCopy: currentProgramCopy,
  states: programStates,
  vocabulary: publicToProtocol,
  wordRoles,
  memberCards,
} as const;
