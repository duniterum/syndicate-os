/**
 * Notification vocabulary — the SINGLE SOURCE of the notification icon palette,
 * the internal deep-link whitelist, the forbidden-icon set, and the (v2)
 * category taxonomy. Runtime constants (not type-only) so the API validator,
 * the studio renderer/pickers, and the guards all trace to ONE literal and can
 * never drift.
 *
 * DOCTRINE (founder, 2026-07-18 — "mechanism decides, not the symbol"):
 *  · Icons are curated lucide KEYS (never emoji), theme-aware and guard-pinnable.
 *  · The palette carries honest FUNCTION symbols (vault, gift, trophy, receipt,
 *    treasury) and bans only GAIN-PROMISE / speculation glyphs (rocket, moon,
 *    trending-up, price charts, diamond-pump, raining money, dice/gambling) —
 *    see NOTIFICATION_FORBIDDEN_ICONS.
 *  · Links are INTERNAL-ONLY, validated by EXACT-MATCH membership in
 *    NOTIFICATION_LINK_WHITELIST — never a prefix/startsWith test (`//evil.com`
 *    satisfies `like '/%'`), never an operator free-text URL. The in-app
 *    notification center is the protocol's only trusted channel; a link inside
 *    it must never leave thesyndicate.money (anti-phishing, ADR-003).
 */

/** Curated lucide icon KEYS an operator may attach to a notification. */
export const NOTIFICATION_ICON_PALETTE = [
  // Recognition & protocol
  "bell",
  "megaphone",
  "flag",
  "trophy",
  "award",
  "sparkles",
  "badge-check",
  "user-plus",
  "users",
  "handshake",
  "shield-check",
  "book-open", // Chronicle — the register
  "flame", // Burn / Fire Ledger (context-exclusive)
  "calendar", // Season / era
  "graduation-cap", // Learn
  // Economy & assets (transparency, never gain)
  "arrow-left-right", // Swap (sideways exchange, never up)
  "route", // Bridge (logistics path)
  "store", // Marketplace (the place, not a payout)
  "frame", // Artifact / NFT mint (the memory)
  "gift", // Gifted seat / gift
  "vault", // Treasury / protocol-own-asset (the coffre)
  "receipt", // Receipt / ticket (proof of record)
  "activity", // Generic protocol-activity fallback
] as const;
export type NotificationIcon = (typeof NOTIFICATION_ICON_PALETTE)[number];

/**
 * Imagery that PROMISES a financial return / speculation — permanently banned
 * as a notification icon. NOT a list of "wealth-adjacent" symbols: function
 * symbols (vault/gift/trophy/receipt) are ALLOWED. The guard asserts the
 * palette and this set never intersect.
 */
export const NOTIFICATION_FORBIDDEN_ICONS = [
  "rocket",
  "moon",
  "trending-up",
  "trending-down",
  "arrow-up",
  "arrow-up-right",
  "chevrons-up",
  "line-chart",
  "candlestick-chart",
  "area-chart",
  "gem",
  "diamond",
  "coins",
  "banknote",
  "dollar-sign",
  "circle-dollar-sign",
  "hand-coins",
  "piggy-bank",
  "bitcoin",
  "dice-1",
  "dice-5",
  "dices",
  "target",
  "crosshair",
  "spade",
  "club",
] as const;

/**
 * Internal deep-link destinations a notification may point to. EXACT-MATCH
 * whitelist — the write validator refuses any link_path not in this set, and
 * the client renders a non-member path as non-clickable (fail-closed). Every
 * target is an own-row surface (/member, /wallet, /referral/introductions)
 * or a public aggregate/content page — none keyed by another member's identity
 * (ADR-003 own-row/no-directory). `/notifications` is excluded (self-referential).
 * FOSSIL FIX (K1, 2026-07-20, deliberate + dated): the referral dashboard
 * moved to /referral's real sub-routes in the 5-tabs slice (2026-07-19); the
 * old /member#referral-dashboard anchor pointed at a surface that no longer
 * hosts the dashboard. Old rows carrying the dead anchor render non-clickable
 * (the fail-closed client rule) — honest, never a broken jump.
 */
export const NOTIFICATION_LINK_WHITELIST = [
  { path: "/member", label: "Member Home — your seat & standing" },
  { path: "/referral/introductions", label: "Referral dashboard — your introductions & ladder" },
  { path: "/wallet", label: "Wallet — balances & approvals" },
  { path: "/toolkit", label: "Toolkit — what a seat can do" },
  { path: "/activity", label: "Activity — the public heartbeat" },
  { path: "/chronicle", label: "Chronicle — the record" },
  { path: "/fire-ledger", label: "Fire Ledger — supply retired in public" },
  { path: "/recognition", label: "Recognition" },
  { path: "/archive", label: "Archive — protocol memory" },
  { path: "/liquidity", label: "Liquidity — the SYN/USDC pool" },
  { path: "/map", label: "Protocol graph" },
  { path: "/join", label: "Join — take your seat" },
  { path: "/status", label: "Status — what's live vs pending" },
  { path: "/proof", label: "Proof — verify The Syndicate" },
  { path: "/referral", label: "Referral program (public explainer)" },
  { path: "/source", label: "Build your referral link" },
] as const;
export type NotificationLinkPath = (typeof NOTIFICATION_LINK_WHITELIST)[number]["path"];
/** The bare exact-match path set (validation authority). */
export const NOTIFICATION_LINK_PATHS: readonly string[] = NOTIFICATION_LINK_WHITELIST.map(
  (l) => l.path,
);

/**
 * The (v2) category taxonomy the auto-generator will populate. Reference only —
 * v1 free-text operator sends leave `category` NULL and it is not surfaced to
 * members. Added now so the v2 protocol-event generator needs NO second
 * migration. Recognition/transparency framing (mechanism decides): a treasury
 * event is "the treasury acquired X — verify", never "you gained".
 */
export const NOTIFICATION_CATEGORIES = [
  "notice",
  "broadcast",
  "milestone",
  "recognition",
  "network",
  "commission",
  "security",
  "chronicle",
  "burn",
  "season",
  "learn",
  "swap",
  "bridge",
  "marketplace",
  "artifact",
  "treasury",
  "receipt",
  "protocol-activity",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];
