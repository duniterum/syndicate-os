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
];
