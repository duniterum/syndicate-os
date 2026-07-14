// Brand color meaning (canonical): Gold = identity / seat / membership;
// Cyan = live / verification / activity.
export const brand = {
  name: "The Syndicate",
  product: "Studio OS",
  tagline: "A Living Protocol",
  descriptor: "On-chain membership protocol",
  // M1-c truth sweep: "Read-only foundation shell." DIED — the protocol sells
  // seats live, in-page. The footer line states the live-production posture.
  foundationNote: "Every public figure is a live chain read — don't trust, verify.",
  rightsNote: "All rights reserved.",
} as const;

/**
 * Canonical brand assets, served from `public/brand/`. The gold "SS" monogram
 * is the real Syndicate mark (transparent PNG) — the single header logo.
 */
export const brandAssets = {
  "syn-mark-gold": "/brand/syn-mark-gold.png",
} as const;

/**
 * Header chip wording. M1-c structural law: the chips' STATE is never frozen —
 * PublicLayout derives live/checking/unavailable from the Protocol Reality
 * Spine read at render time and picks the matching label here. Kept in config
 * so no live-state label is ever hardcoded in JSX.
 */
export const headerChips = {
  chainName: "Avalanche",
  states: {
    live: "Live",
    checking: "Checking…",
    unavailable: "Unavailable",
  },
} as const;

export type HeaderChipState = keyof typeof headerChips.states;

/**
 * Official public channels. Labels are deliberately DISTINCT (two Telegram
 * channels serve different purposes) and no follower counts are ever shown.
 * All links open in a new tab with rel="noopener noreferrer".
 */
export interface SocialLink {
  id: string;
  label: string;
  href: string;
  kind: "x" | "telegram";
}

export const socialLinks: readonly SocialLink[] = [
  {
    id: "x",
    label: "X (Twitter)",
    href: "https://x.com/TheSyndicateOne",
    kind: "x",
  },
  {
    id: "tg-announcements",
    label: "Telegram — Announcements",
    href: "https://t.me/TheSyndicateOfficial",
    kind: "telegram",
  },
  {
    id: "tg-community",
    label: "Telegram — Community",
    href: "https://t.me/TheSyndicateMoney",
    kind: "telegram",
  },
] as const;
