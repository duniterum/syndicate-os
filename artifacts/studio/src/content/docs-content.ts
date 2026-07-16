// Docs content — the curated structure for /docs (slice 2.4), the protocol
// operating manual / knowledge hub.
//
// HARVEST PROVENANCE: STRUCTURE (a Protocol Journey Spine + grouped cards, each
// with a status + audience tag) is adapted from the origin's docs.tsx. CONTENT is
// OURS — never the origin's routes or figures.
//
// DOCTRINE (why it reads the way it does):
//   - REAL ROUTES ONLY. Every `routePath` below is a live route in the SEO route
//     registry / App.tsx. We never link the origin's non-existent routes
//     (/token, /vault, /ranks, /transparency, /roadmap, …).
//   - NUMBER-FREE. Purposes carry zero figures — the live numbers live on the
//     surfaces themselves (Tokenomics / Status / Join), read live from the chain.
//   - STATUS IS NOT HERE. A card's status is derived at render from the route
//     registry (Ready vs Pending) — never hardcoded — so a surface flips its own
//     pill when its posture changes. Audience tags below are editorial wayfinding
//     ("who is this for"), never access-gating.
//
// Dependency-free + under src/**, so the forbidden-copy and no-raw-color guards
// scan it automatically. No banned words; no numerals.

export interface DocCard {
  /** A real route path (registry-backed). Card title + status derive from it. */
  routePath: string;
  /** Number-free one-liner: what this surface is for. */
  purpose: string;
  /** Editorial "who is this for" tags — wayfinding only, never access control. */
  audience: string[];
}

export interface DocGroup {
  /** Anchor id (SectionIndex + deep links). */
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cards: DocCard[];
}

export interface JourneyStep {
  label: string;
  routePath: string;
}

/** Read the protocol in the order a member experiences it — all live surfaces. */
export const DOCS_JOURNEY: JourneyStep[] = [
  { label: "Understand", routePath: "/whitepaper" },
  { label: "Observe", routePath: "/status" },
  { label: "Ask", routePath: "/faq" },
  { label: "Verify", routePath: "/map" },
  { label: "Take a seat", routePath: "/join" },
];

export const DOCS_GROUPS: DocGroup[] = [
  {
    id: "start",
    eyebrow: "Start here",
    title: "First steps",
    description:
      "Read these first — what The Syndicate is, what a seat means, and how to see it for yourself.",
    cards: [
      {
        routePath: "/whitepaper",
        purpose:
          "What The Syndicate is, how a seat and treasury routing work, and how to verify every figure on-chain — the flagship living reference.",
        audience: ["New here", "Member", "Builder", "Verifier"],
      },
      {
        routePath: "/faq",
        purpose:
          "Honest answers across the eight topics — search, filter by topic, and expand any question.",
        audience: ["New here", "Member"],
      },
      {
        routePath: "/join",
        purpose: "Read your exact entry quote and complete the join — two signatures from your own wallet.",
        audience: ["New here", "Member"],
      },
      {
        routePath: "/learning",
        purpose:
          "Plain-language education: wallets, transactions, proof, and what membership means.",
        audience: ["New here"],
      },
    ],
  },
  {
    id: "protocol",
    eyebrow: "Protocol & economy",
    title: "How it works",
    description: "The token, the treasury routing, and the contracts behind every claim.",
    cards: [
      {
        routePath: "/tokenomics",
        purpose:
          "SYN's fixed supply, the live distribution across the allocation wallets, the two independent prices, and burn — every figure read live.",
        audience: ["Member", "Verifier"],
      },
      {
        routePath: "/contracts",
        purpose:
          "A read-only map of the protocol's contracts and treasury-routing structure — canon reference.",
        audience: ["Member", "Verifier"],
      },
      {
        routePath: "/map",
        purpose:
          "The public proof organism: chain identity, contract-code presence, and sale lifecycle — reconciled read-only, fail-closed.",
        audience: ["Builder", "Verifier"],
      },
    ],
  },
  {
    id: "identity",
    eyebrow: "Membership & identity",
    title: "Your seat & recognition",
    description:
      "What a seat is, how a verified introduction is recognised, and why this is never a wealth ranking.",
    cards: [
      {
        routePath: "/member",
        purpose:
          "Sign with your wallet to read your own standing — a live self-readback. A session is not membership.",
        audience: ["Member"],
      },
      {
        routePath: "/referral",
        purpose:
          "How a verified introduction works — an eligible completed introduction pays a bounded commission inside the buyer's own transaction, transparently.",
        audience: ["Member", "Builder"],
      },
      {
        routePath: "/recognition",
        purpose:
          "The recognition model, explained as a future concept — recognition of participation, never a financial reward.",
        audience: ["Member"],
      },
    ],
  },
  {
    id: "verify",
    eyebrow: "Verify everything",
    title: "Don't trust, verify",
    description: "Every claim the site makes has an on-chain primitive behind it — check it yourself.",
    cards: [
      {
        routePath: "/status",
        purpose: "The authoritative ledger of what is live versus pending across every surface.",
        audience: ["Verifier", "Member"],
      },
      {
        routePath: "/proof",
        purpose:
          "Proof, live from the chain — membership receipts, attribution, burns — and where to verify each yourself.",
        audience: ["Verifier"],
      },
      {
        routePath: "/source",
        purpose:
          "Validate your referral code against the on-chain registry and build a shareable join link — read-only.",
        audience: ["Builder", "Verifier"],
      },
    ],
  },
  {
    id: "memory",
    eyebrow: "Help & memory",
    title: "Support & the archive",
    description: "Where to get help, and the protocol's memory layer.",
    cards: [
      {
        routePath: "/support",
        purpose:
          "Where help and review requests will live — an honest preview; nothing is stored until intake is wired.",
        audience: ["New here", "Member"],
      },
      {
        routePath: "/archive",
        purpose:
          "The archive and chronicle — protocol memory and milestones. Artifacts mint on-chain; the chronicle publishes its promoted entries.",
        audience: ["Member", "Verifier"],
      },
    ],
  },
];
