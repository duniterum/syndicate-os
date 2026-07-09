export const brand = {
  name: "The Syndicate",
  product: "Studio OS",
  tagline: "A Living Protocol",
  foundationNote: "Read-only foundation shell.",
  rightsNote: "All rights reserved.",
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
