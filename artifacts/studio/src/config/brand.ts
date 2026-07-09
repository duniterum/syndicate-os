// Brand color meaning (canonical): Gold = identity / seat / membership;
// Cyan = live / verification / activity.
export const brand = {
  name: "The Syndicate",
  product: "Studio OS",
  tagline: "A Living Protocol",
  descriptor: "On-chain membership protocol",
  foundationNote: "Read-only foundation shell.",
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
 * Header chip wording. "Live" is honest here — the header chips describe the
 * live, read-only chain reads (Protocol Reality Spine) that power the public
 * surfaces. Kept in config so no live-state label is ever hardcoded in JSX.
 */
export const headerChips = {
  chainName: "Avalanche",
  chainState: "Live",
  liveBadge: "Live",
  mobileChainNote: "Avalanche · Live",
} as const;

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
