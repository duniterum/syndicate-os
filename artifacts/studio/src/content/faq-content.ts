// FAQ content — the doctrine-perfect question/answer corpus for /faq (slice 2.3).
//
// HARVEST PROVENANCE: the STRUCTURE (8 categories, search + filter + accordion +
// JSON-LD) is adapted from the Supa FAQ chrome; the CONTENT is reframed from the
// origin's own 39-Q&A set (TheSyndicate FaqRebuilt) — NEVER Supa/entity content.
//
// DOCTRINE (why every answer reads the way it does):
//   - NEVER hardcode a figure. Answers carry ZERO numerals — no supply, rate,
//     percentage, minimum, price, or member range. Every live figure is one click
//     away on /tokenomics, /status, or /join (which read it live from the chain).
//     This also keeps the FAQPage JSON-LD text identical to what renders on screen.
//   - NEVER emit an address. The spine is fail-closed and address-free; answers
//     point to the Contracts map / block explorer instead.
//   - Legal framing wherever SYN appears: a seat, not a security; recognition like
//     a loyalty program; the protocol promises nothing; joining can mean total loss.
//   - Banned public financial-upside words (and the public word for a bundle of
//     seats) are absent, or appear only inside an explicit in-clause negation, so
//     the forbidden-copy guard passes and the doctrine holds.
//
// Dependency-free ON PURPOSE: no `@/` imports, no runtime deps. Both the page
// (via the `@/` alias) AND the Node build scripts (via a relative `.ts` import,
// e.g. the FAQPage JSON-LD builder + prerender) load this one source of truth.

export interface FaqEntry {
  /** Plain-text question (also the JSON-LD `Question.name`). */
  q: string;
  /** Plain-text answer (also the JSON-LD `acceptedAnswer.text`). Number-free. */
  a: string;
}

export interface FaqCategory {
  /** Stable anchor id (deep links + the sticky SectionIndex + accordion sections). */
  id: string;
  /** Human-readable category name. */
  name: string;
  entries: FaqEntry[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "basics",
    name: "Basics",
    entries: [
      {
        q: "What is The Syndicate?",
        a: "An on-chain membership protocol on Avalanche C-Chain. You join by acquiring SYN with USDC and receive a permanent, numbered, verifiable seat, a place in a public archive, and a transparent treasury-routing system you can check for yourself. It sells access and recognition — a business, not a fundraise.",
      },
      {
        q: "What can I verify today?",
        a: "The SYN token, the membership sale, the Reserve / Liquidity / Operations wallets, every USDC entry, every routing transfer, each allocation wallet, and the SYN/USDC pool on Trader Joe — all live on Avalanche and openable in any block explorer. The live figures sit on Tokenomics and the Status ledger; open any contract from the Contracts map.",
      },
      {
        q: "What does LIVE vs PENDING mean?",
        a: "LIVE means the contract is deployed and every number is read straight from the chain, fail-closed. PENDING means the underlying primitive — a programmatic Vault contract, an identity-record contract, on-chain governance, the AI Layer — is not yet deployed; it is clearly labelled and never mixed with live numbers. The Status ledger lists exactly what is which.",
      },
      {
        q: "Why does joining early matter?",
        a: "The first members shape the culture, carry the lowest founder numbers, and stay visible in the public archive. Recognition and archive placement reflect being present at the start — never bonus tokens, and never a return.",
      },
      {
        q: "What is the Signal Chamber?",
        a: "A planned future module that would surface member signals derived only from public on-chain activity. It would be advisory, clearly labelled PENDING, confer no rights, and never influence the entry rate, a rank, or any value — it would describe what is already on-chain, never predict a price.",
      },
    ],
  },
  {
    id: "syn",
    name: "SYN Token",
    entries: [
      {
        q: "What is SYN?",
        a: "A fixed-supply ERC-20 utility token on Avalanche C-Chain, and the V1 membership seat: holding SYN means the wallet is seated. It powers rank, identity in the archive, and participation. It is not a share, not a security, and not a claim on treasury assets.",
      },
      {
        q: "Is SYN live?",
        a: "Yes — SYN is deployed and verified on Avalanche. Open the token contract from the Contracts map and read it yourself; the live total supply and burn are shown on Tokenomics.",
      },
      {
        q: "Can new SYN be minted?",
        a: "No. Supply is fixed — there is no mint function — so it can only stay fixed or fall through burns. The live total supply is on Tokenomics.",
      },
      {
        q: "Can the owner change the token?",
        a: "No. The ERC-20 has no owner, no admin, no upgrade path, no pause, no blacklist, no whitelist, no max-wallet, no max-transaction, and no tax.",
      },
      {
        q: "Where does member SYN come from?",
        a: "From the membership distribution allocation, which the sale draws on. Each allocation wallet's live balance is shown on Tokenomics — design target versus current on-chain balance — verifiable on-chain.",
      },
    ],
  },
  {
    id: "membership",
    name: "Membership & Sale",
    entries: [
      {
        q: "How do I become a member?",
        a: "Go to Join, read your exact quote — what you pay, the SYN you receive at the live entry rate, and where every dollar routes, all read live from Avalanche C-Chain — then complete the join from your own wallet: an exact USDC approval, then the join signature. Your seat number is written by the on-chain receipt event, never by this app.",
      },
      {
        q: "Can larger members get cheaper SYN?",
        a: "No. The current era sets one entry rate for every wallet in that era. A larger amount can deepen SYN held, contribution, routing impact, rank progression, and future recognition — never bonus tokens, and never private terms.",
      },
      {
        q: "Can I enter a custom amount?",
        a: "Yes. Any amount above the published minimum works; Join computes the exact SYN for your amount at the live rate, and you complete the join with two signatures from your own wallet.",
      },
      {
        q: "Can I take multiple seats?",
        a: "No — the seat is binary. A wallet is seated by holding SYN. A small entrant and a large entrant both hold one seat; what differs is contribution depth, SYN acquired, USDC routed, rank progression, and historical footprint.",
      },
      {
        q: "What changes after I join?",
        a: "A member holds a permanent seat number, an on-chain SYN balance, a rank, an entry in the public archive, and visibility in future identity and verification modules as they ship. My Syndicate becomes the home for the seat and its proofs.",
      },
      {
        q: "Is member count the same as economic scale?",
        a: "No. Member count measures seated wallets and institutional reach. Economic scale comes from routed USDC, liquidity growth, and operations capacity — the site keeps those signals separate. The live figures are on Tokenomics and Status.",
      },
      {
        q: "What is a featured entry tier?",
        a: "A featured entry amount on Join is simply a highlighted amount mapped one-to-one to a recognition tier, showing the SYN you would receive at the current live rate. Recognition only — no payout, no entitlement, no private terms, and no bonus tokens. Any custom amount above the minimum works exactly the same.",
      },
      {
        q: "What are the distribution eras?",
        a: "A deterministic pricing schedule layered over the member archive: each era sets the entry rate for a range of member seats, and later eras are scheduled by seat range. Chapter is history and belonging; era is pricing. The live current rate is shown on Join.",
      },
    ],
  },
  {
    id: "vault",
    name: "Vault & Routing",
    entries: [
      {
        q: "Where does my USDC go?",
        a: "Every entry is split inside the sale contract across the Reserve, Liquidity, and Operations wallets — a fixed on-chain split, every transfer visible in the block explorer. The live routed amounts are on Tokenomics and Status.",
      },
      {
        q: "Do members own the Vault?",
        a: "No. The Reserve is a protocol-owned resource. SYN is not ownership of, or a claim on, treasury assets.",
      },
      {
        q: "What is the Vault wallet vs the Vault contract?",
        a: "Today the Reserve is a public allocation wallet on Avalanche — every inflow is on-chain. The programmatic Vault contract (deposit accounting, policy enforcement, withdrawal logic) is PENDING and clearly labelled wherever it appears.",
      },
      {
        q: "Does membership pay a return?",
        a: "No. There is no dividend, no passive income, and no guaranteed return of any kind — the protocol owes members nothing. Joining buys access and recognition, not a financial right.",
      },
    ],
  },
  {
    id: "liquidity",
    name: "Liquidity",
    entries: [
      {
        q: "Where can I trade SYN?",
        a: "In the live SYN/USDC pool on Trader Joe on Avalanche C-Chain — a classic AMM pool. Open the pair from the Contracts map; the live reserves are on Tokenomics.",
      },
      {
        q: "Why is liquidity small right now?",
        a: "The pool started as a small verification seed. Depth grows as the Liquidity wallet — which receives a fixed share of every entry — is deployed into the pool over time, and as liquidity providers add to it. The live reserves are on Tokenomics.",
      },
      {
        q: "How is the SYN price calculated?",
        a: "The implied market price is the USDC reserve divided by the SYN reserve, read live from the pair contract. Tokenomics shows the live market price and the reserves behind it.",
      },
      {
        q: "Are liquidity providers guaranteed rewards?",
        a: "No. Providing liquidity carries impermanent loss, price, and smart-contract risk. Any future recognition for providers is not promised, not a return, and not guaranteed.",
      },
      {
        q: "What risks do liquidity providers face?",
        a: "Impermanent loss, price movement, smart-contract risk, low-liquidity slippage, and total loss. Providing liquidity is risky.",
      },
      {
        q: "Is the entry rate the same as the market price?",
        a: "No — they are independent. The entry rate is the protocol's own rate for taking a seat. Once you hold SYN it may also trade on Trader Joe at a separate, market-set price. Neither values the other, and the protocol promises nothing about the market price. Both live figures are on Tokenomics.",
      },
    ],
  },
  {
    id: "ranks",
    name: "Ranks & Identity",
    entries: [
      {
        q: "What is a founder number?",
        a: "A permanent archive ID assigned in join order. The first members carry the lowest numbers.",
      },
      {
        q: "How do ranks work?",
        a: "Rank is derived from a wallet's on-chain SYN balance, across a series of tiers from Citizen to Cornerstone. Rank reflects contribution depth, archive recognition, and visibility — never a wealth leaderboard, never bonus tokens, and never a better rate.",
      },
      {
        q: "What is institutional trust capital?",
        a: "Future recognition of what a participant helped the institution become — building, documenting, operating, verifying, auditing, introducing, or preserving. It is recognition, not a return, not governance, and not a claim. Future records may reflect it only when real gates exist.",
      },
      {
        q: "Do ranks give cheaper SYN?",
        a: "No. Rank reflects status, visibility, and future module access only. It never changes the current entry rate, and never creates a discount, a payout, or an entitlement.",
      },
    ],
  },
  {
    id: "archive",
    name: "Archive",
    entries: [
      {
        q: "What is the Archive?",
        a: "The collectible memory layer of The Syndicate on Avalanche. The archive contract is deployed; some artifacts are openly mintable, while others are gated or reserved and only appear mintable from live contract reads. Artifacts grant no equity, no treasury ownership, no revenue share, no governance right, and no promise of gain.",
      },
      {
        q: "Are Archive artifacts NFTs?",
        a: "Yes — ERC-1155 NFTs on Avalanche, served by the deployed archive contract. Some IDs are publicly mintable today; others are gated, sealed, reserved, or pending a separate future contract.",
      },
      {
        q: "Are any artifacts live today?",
        a: "Yes. At least one public artifact mint is open on Avalanche; a gated artifact only appears mintable when live contract reads confirm it for the connected wallet. Other artifacts are protocol-memory surfaces sealed by event.",
      },
      {
        q: "What is a Seat Record?",
        a: "A planned optional identity record for a verified membership entry, encoding member number, chapter, and block height. It would live in a separate future ERC-721 contract — not the archive contract, and not yet deployed.",
      },
      {
        q: "Do Archive artifacts give financial rights?",
        a: "No. They are an optional memory layer — not a share, not treasury ownership, not a dividend instrument, not revenue share, not a governance right, and not a promise of gain. Participation may result in total loss.",
      },
      {
        q: "What does “pending separate contract” mean?",
        a: "It means the artifact depends on a future contract distinct from the deployed archive contract — for example the seat-record contract. The archive contract itself is deployed and verified; its open artifact is mintable today.",
      },
    ],
  },
  {
    id: "risk",
    name: "Risk & Legal",
    entries: [
      {
        q: "Is a seat a financial product?",
        a: "No. SYN is utility access for rank, identity, and participation — it is not a share, not debt, not a dividend, and not a treasury claim, and it is not an investment. Nothing here is financial advice.",
      },
      {
        q: "Can I lose money?",
        a: "Yes. Participation may result in total loss of the amount you spend. Only join if you fully understand the risks.",
      },
      {
        q: "What is LIVE vs PENDING, exactly?",
        a: "LIVE modules — SYN, the sale, the pool, the routing wallets — display chain-verified data read live from Avalanche. PENDING modules — a programmatic Vault contract, on-chain governance, the identity-record contract — are clearly labelled and never mixed with live numbers. The Status ledger is the authoritative list.",
      },
    ],
  },
];

/** Flat list of every entry, in category order (JSON-LD + total count). */
export const FAQ_ENTRIES_FLAT: FaqEntry[] = FAQ_CATEGORIES.flatMap((c) => c.entries);

/** Total question count across all categories (for the count badge). */
export const FAQ_TOTAL_COUNT = FAQ_ENTRIES_FLAT.length;
