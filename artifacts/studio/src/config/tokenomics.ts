// Tokenomics DESIGN allocation — the mint-time design targets (config).
//
// Source of truth: api-server canon `syndicate-config.ts` TOKENOMICS_ALLOCATION
// (1,000,000,000 SYN across 7 buckets). These are the FIXED DESIGN TARGETS only.
// Every LIVE figure on /tokenomics — total supply, each allocation wallet's
// CURRENT SYN balance, its current share of supply, market price, entry rate,
// burn — is read from the chain (see useTokenomics). The design % is shown as a
// labelled target beside the live current figure; it is never presented as live.
//
// `key` matches the spine's `financial.distribution.<KEY>.balance` item id.

export type AllocationKey =
  | "MEMBERSHIP_DISTRIBUTION"
  | "VAULT_RESERVE"
  | "FOUNDER"
  | "LIQUIDITY"
  | "PARTNERSHIPS"
  | "CONTRIBUTORS"
  | "FUTURE_ECOSYSTEM";

export interface AllocationDesign {
  key: AllocationKey;
  label: string;
  /** Mint-time design target share (canon TOKENOMICS_ALLOCATION.pct). */
  designPct: number;
  note: string;
}

export const TOKENOMICS_DESIGN: readonly AllocationDesign[] = [
  { key: "MEMBERSHIP_DISTRIBUTION", label: "Membership Distribution", designPct: 35, note: "Pool for website membership acquisitions, small entries, and custom entries." },
  { key: "VAULT_RESERVE", label: "Vault Reserve", designPct: 25, note: "Long-term reserve. Any movement is public and verifiable on-chain." },
  { key: "FOUNDER", label: "Founder", designPct: 12, note: "12-month cliff, then 36-month monthly vesting. Public wallet, no hidden unlocks." },
  { key: "LIQUIDITY", label: "Liquidity", designPct: 10, note: "DEX liquidity provisioning and depth reinforcement." },
  { key: "PARTNERSHIPS", label: "Partnerships", designPct: 8, note: "Future ecosystem partners. No release counted until public and verifiable." },
  { key: "CONTRIBUTORS", label: "Contributors", designPct: 5, note: "Builders, designers, operators, and contributors who help ship The Syndicate." },
  { key: "FUTURE_ECOSYSTEM", label: "Future Ecosystem", designPct: 5, note: "Reserved for unannounced ecosystem expansion." },
] as const;
