// config/chronicleRegister.ts — THE CHRONICLE REGISTER (committed file).
// ---------------------------------------------------------------------------
// CHR-1 doctrine: the Chronicle's v1 data source is THIS FILE, in the repo.
// PROMOTION IS A FOUNDER ACT — an entry lands here via a commit the founder
// approves; there is no DB, no server write, and no auto-promotion, ever.
// Candidates wait in docs/chronicle/candidates/; the console's Chronicle
// panel PREPARES an entry in this exact shape for the founder's commit.
//
// Register discipline (matches the first candidate): protocol-institutional
// voice · identity-blind (seat numbers only, never a wallet or a person) ·
// amount-blind unless the amount IS the record · oldest-first on the page ·
// every entry says how to VERIFY itself.

export interface ChronicleSection {
  heading: string;
  body: string;
}

export interface ChronicleEntry {
  /** Stable id (kebab, dated) — also the anchor on /chronicle. */
  id: string;
  /** The day the recorded thing happened (UTC). */
  dateUtc: string;
  title: string;
  sections: readonly ChronicleSection[];
  /** How a reader verifies this record themselves (verify-first, always). */
  verifyNote: string;
}

/**
 * The public register. Oldest-first when rendered. Every entry below entered
 * by a founder-approved commit — the promotion IS the commit.
 */
export const CHRONICLE_REGISTER: readonly ChronicleEntry[] = [
  // ENTRY 1 — promoted by the founder 2026-07-14 (candidate:
  // docs/chronicle/candidates/2026-07-12-the-duplicate-seat.md, faithful text).
  {
    id: "2026-07-12-the-duplicate-seat",
    dateUtc: "2026-07-12",
    title: "The duplicate seat",
    sections: [
      {
        heading: "The record",
        body: "The protocol carries its members across engine generations by a frozen commitment: eight historical seats, sealed behind a Merkle root written immutably into the third-generation sale engine at deployment. To be carried across, a historical member must present a proof and claim their seat — one on-chain act, once.\nThe engine, however, does not force the claim. A historical member who purchases before claiming is seen by the engine as a stranger — and is issued a new seat.\nIn the protocol's first era of live operation, this happened. Historical seat #7, unclaimed, purchased through the active engine and was issued seat #11. One member, two seat numbers — written to mainnet, permanent. The engine's member count said 12. The number of distinct members was 11.",
      },
      {
        heading: "What the protocol did",
        body: "It did not edit the number. It did not quietly reconcile the count, retire a seat, or wait for the claim that can no longer happen — the engine permanently refuses a claim from a member it already knows, so seat #7 will stand empty forever, and the overlap can never be undone.\nInstead, the protocol now states both figures, derived live from the chain on every read — never typed, never frozen into a document: N seats issued, M distinct wallets — one wallet holds two seats: a member of an earlier era who bought again before the claim gate existed.\nAnd it closed the gap: the joining surface now reads the engine's own recognition state for every historical seat before a purchase path is offered. An unclaimed historical seat is blocked from buying — claim your seat first — and any failure to verify blocks rather than guesses. The check that the engine lacks was built in front of it.",
      },
      {
        heading: "Why this is recorded",
        body: "This protocol was built in public, on mainnet, deliberately — errors dated, signed, and impossible to erase. Anyone can claim transparency when everything is clean. The claim is only proven when something is not.\nThe duplicate seat is that proof: an inconvenient truth the chain records and the protocol repeats, at the exact place where it would be easiest to round away. The count on the public page and the count on the chain will disagree with each other exactly never — because the page is the chain.",
      },
    ],
    verifyNote:
      "Every figure in this record is a live read of the active sale engine (see the public verify links): memberCount() (seats issued), GENESIS_OFFSET() (the eight historical seats), memberNumberOf(address) (the overlap — a historical wallet answering with a seat number above eight), memberByNumber(7) (the permanently empty seat). Don't trust — verify.",
  },
  // ENTRY 2 — promoted by the founder 2026-07-14 (candidate:
  // docs/chronicle/candidates/2026-07-12-the-first-real-money-seat.md, faithful text).
  {
    id: "2026-07-12-the-first-real-money-seat",
    dateUtc: "2026-07-12",
    title: "The first real-money seat",
    sections: [
      {
        heading: "The record",
        body: "On the night of 2026-07-12, the checkout went live and the first real purchase moved through it — five dollars, through a referral link, on the first attempt.\nOne signed transaction did all of it. Five dollars entered; twenty-five cents were paid to the referrer's wallet inside that same transaction — before the protocol received anything; the remaining four dollars and seventy-five cents arrived as the net protocol contribution and were split on-chain exactly as the bytecode commands: 3.325 to the vault, 0.95 to liquidity, 0.475 to operations — seventy, twenty, ten. Five hundred SYN were delivered, and the engine wrote seat #13.\nThe protocol noticed by itself. The public member count read 13 everywhere, and the honest readback recomputed its own sentence — thirteen seats, twelve distinct wallets, one holding two — with zero human edits.",
      },
      {
        heading: "What made it deliberate",
        body: "The five dollars were the founder's own. The protocol does not ask a stranger to trust a rail its own founder has not walked: the first money through the checkout, through the referral payment, through the routing, was the protocol's own test — dated, signed, and left on mainnet where anyone can inspect it. For the same reason, this seat is set aside: it does not count toward the protocol's proof metric, and it waits as a gift.",
      },
      {
        heading: "Why this is recorded",
        body: "“The referrer is not paid from Syndicate revenue after the fact. The referrer is paid from the purchase transaction before the net protocol contribution is routed.” Until this night, that sentence was architecture. After it, it is a fact with a block number — one signature, two recipients, and a split the chain performed to the last cent. The protocol's boldest claim about money became something anyone can recompute.",
      },
    ],
    verifyNote:
      "The purchase transaction is public on the explorer (it is the seat #13 event line in the served activity feed — every line carries its verify anchor). Live reads of the active sale engine confirm the standing state: memberCount() (thirteen and counting), memberNumberOf(address) and memberByNumber(13) (the seat, written). The split is recomputable from the transaction itself: gross, referral payment, net, then 70/20/10 to the cent. Don't trust — verify.",
  },
  // ENTRY 3 — promoted by the founder 2026-07-14 (candidate:
  // docs/chronicle/candidates/2026-07-13-the-first-referral-source.md, faithful text).
  {
    id: "2026-07-13-the-first-referral-source",
    dateUtc: "2026-07-13",
    title: "The first referral source",
    sections: [
      {
        heading: "The record",
        body: "The protocol's referral system rests on a convention: a member's referral source has one deterministic identity, derived from their wallet — computed, never assigned, so the same wallet always resolves to the same source and no registry clerk exists to get it wrong.\nOn 2026-07-13, the convention stopped being a design. The first member referral source was created in the on-chain Source Registry — member class, five percent, lifetime terms — and its terms fingerprint was written with it: the exact hash of the public terms document served at the protocol's own address. The words and the chain now hold each other: edit the document and the fingerprint breaks; anyone can download the file and recompute the commitment.\nThe source was born paused — the contract enforces it — and was activated by a second, separate signature about a minute later. Two acts, both public events, both the founder's own wallet through the console's first PROPOSE form. Minutes after activation, the live quote confirmed the rail end to end: a join through the new referral link pays its referrer inside the buyer's own transaction.",
      },
      {
        heading: "What made it deliberate",
        body: "The first source under the member convention is the founder's. The pattern repeats on purpose: before any member is offered a referral link, the founder created one against his own wallet, signed both lifecycle acts himself, and left the whole sequence on mainnet — creation, pause, activation, terms fingerprint — as the worked example every future source will follow.",
      },
      {
        heading: "Why this is recorded",
        body: "A referral program is where protocols usually reach for trust-us language. This one committed the opposite way: the terms are a public file whose bytes are hashed on-chain, the source's existence and status are public events, and the payment path was proven with real money before the program was spoken of in the present tense. The first source is the template: derived identity, fingerprinted terms, founder-signed lifecycle, no silent edits — ever.",
      },
    ],
    verifyNote:
      "Read the source's record live from the on-chain registry (sourceConfig / the registry's public reads — the /referral page renders them). Download the served terms document (/referral-program-terms-v1.txt), compute keccak256 over its raw bytes, and compare it to the on-chain terms fingerprint (the contract's metadataHash) — they match or something is wrong. The creation and activation are public registry events; the served activity feed speaks them as its referral lifecycle lines. Don't trust — verify.",
  },
  // ENTRY 4 — promoted by the founder 2026-07-14 (candidate:
  // docs/chronicle/candidates/2026-07-13-the-ladder-decision.md, faithful text).
  {
    id: "2026-07-13-the-ladder-decision",
    dateUtc: "2026-07-13",
    title: "The ladder decision",
    sections: [
      {
        heading: "The record",
        body: "On 2026-07-13, the protocol decided how referral standing grows — and wrote the decision down where it cannot quietly change.\nTwo ladders, deliberately decoupled. Titles are dense and free: a badge, a public event, season points — recognition may celebrate often. Rates are rare and irreversible: a commission rate never decreases and is never retroactive. The rungs are fixed — Emerging at five percent, Trusted at six, Established at seven, Durable at eight, Foundational at ten, and Summit at twelve — where twelve percent is not a choice but the ceiling the deployed bytecode itself enforces. The ladder ends exactly where the contract says no.\nNobody grants a promotion and nobody refuses one. The unit of progress is the durable introduction — an introduced member still holding their seat — counted by the protocol's own indexer. When the count crosses a threshold, the promotion is due; the founder's signature only executes what the threshold already decided, and the change lands as a public on-chain event. Partner is not a rung: it is a separate, negotiated class, never reachable by climbing.",
      },
      {
        heading: "What was refused",
        body: "The decision is also a list of refusals, recorded so they stay refused: no demotion — the acquired is permanent; no discretion — a threshold, not a favor; no retroactivity — every purchase pays the rate that was true at its own moment; and no new smart contract for the horizon ahead — the deployed registry already covers the whole plan, and the machinery that would extend it waits for a professional firm and a mandatory audit.",
      },
      {
        heading: "Why this is recorded",
        body: "A rate schedule is a promise about other people's future work. Most such promises live in editable pages. This one is canon in a public repository — its history readable, its ceiling in bytecode, its every future application a signed public event. The day the ladder was decided is the day the protocol bound its own hands on how it pays the people who grow it: upward only, threshold-driven, capped by code.",
      },
    ],
    verifyNote:
      "The decision is docs/direction/CONNECTOR_LADDER_POLICY.md in the public repository — its commit history is the no-silent-edits proof. The ceiling is readable on-chain: the sale engine's maximum member introduction rate (the bytecode constant the Summit rung equals). Every promotion executed under this ladder is a public SourceTermsUpdated registry event, spoken by the activity feed as it happens. Don't trust — verify.",
  },
];
