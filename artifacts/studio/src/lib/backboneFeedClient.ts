// lib/backboneFeedClient.ts — the SERVED feed client (ARC M5; M4-c extended).
// ---------------------------------------------------------------------------
// Reads /api/backbone/feed — the event backbone's receipt-line projection:
// the COMPLETE indexed histories, newest first. H2-P (THE PRIDE OF THE
// PUBLIC RECORD, founder amendment 2026-07-15): a line carries kind · block ·
// chain-verified time · the transaction verify anchor · the kind's own facts
// INCLUDING the event's own member number and its actor's SHORT-FORM address
// (the origin voice). A FULL address never parses here (the short-form shape
// is exact, fail-closed); the server's unchanged output gate enforces the
// same on its side. No enrichment, no lookup — the feed narrates what the
// chain publishes, and the verify anchor is the full-truth path.
//
// HONESTY LAW: a null return means "the served history is unavailable right
// now" — the consumer falls back to the client recent window and SAYS so.
// A malformed line is skipped and COUNTED (mirrors the client scan: an
// undecodable log is never guessed into a sentence).

const TX_ANCHOR_RE = /^0x[0-9a-fA-F]{64}$/;
const BUCKETS = new Set(["true", "false", "unknown"]);
const LIFECYCLE_KINDS = new Set([
  "source-created",
  "source-terms",
  "source-status",
  // H1a (⑯): wallet rotations — public administrative acts.
  "source-wallet",
]);

interface ServedLineCommon {
  blockNumber: number;
  /** Chain-verified epoch seconds (Protocol Time — never a wall clock). */
  blockTimestampSec: number;
  isoDayUtc: string;
  transactionHash: `0x${string}`;
  logIndex: number;
}

export interface ServedSeatLine extends ServedLineCommon {
  kind: "purchase";
  generation: string;
  firstSeatBucket: "true" | "false" | "unknown";
  routedFolded: boolean;
  /** H2-P (the pride amendment): the event's own member number. */
  memberNumber: number | null;
  /** H2-P: the actor's SHORT FORM only — a full address never parses. */
  memberShort: string | null;
  /** H2-P: the referred flag (the event's own source-id test). */
  referred: boolean;
  /** H2-P override A: the referrer's SHORT FORM (same event, no join). */
  referredByShort: string | null;
}

export interface ServedBurnLine extends ServedLineCommon {
  kind: "burn";
  /** 1-based Proof of Burn number, oldest first (#1 = the first burn ever). */
  proofOfBurnNumber: number;
  /** Exact raw 18-decimal base units, decimal string. */
  amountSynRaw: string;
  senderLabel: "Founder" | "Community";
  /** H2-P: Community sender's short form (null on Founder — the voice rule). */
  actorShort: string | null;
}

export interface ServedLifecycleLine extends ServedLineCommon {
  kind: "source-created" | "source-terms" | "source-status" | "source-wallet";
  /** H1a (⑧): the rung a source rose to when the terms update IS a promotion. */
  risenToTitle: string | null;
}

// ── H1a — the complete heartbeat's served lines ─────────────────────────────
export interface ServedLpLine extends ServedLineCommon {
  kind: "lp-add" | "lp-remove";
  /** Exact raw base units (SYN 18-dec / USDC 6-dec) — public chain figures. */
  amountSynRaw: string;
  amountUsdcRaw: string;
  /** The founder voice rule: founder acts SAY the founder. */
  actorLabel: "Founder" | "Community";
  /** H2-P: Community actor's short form (null on Founder — the voice rule). */
  actorShort: string | null;
}

export interface ServedArchiveMintLine extends ServedLineCommon {
  kind: "archive-mint";
  artifactLabel: string;
  /** H2-P: the artifact's on-chain token id (the origin voice names it). */
  artifactId: number | null;
  quantityRaw: string;
  /** H2-P: the minter's short form (null on pre-backfill rows). */
  minterShort: string | null;
  /** The founder facet: Founder/Community per the served label, or null. */
  minterLabel: "Founder" | "Community" | null;
}

export interface ServedArchivePauseLine extends ServedLineCommon {
  kind: "archive-pause";
  action: "paused" | "resumed";
}

// ── H2-⑦ — treasury movements (organ LABELS only, post-Fold-Law: a transfer
// inside an already-narrated transaction is routing detail, never a line) ───
export interface ServedTreasuryLine extends ServedLineCommon {
  kind: "treasury-move";
  token: "USDC" | "SYN";
  /** Exact raw base units — public per the Visibility Rule. */
  amountRaw: string;
  movement: "in" | "out" | "internal";
  /** "the vault" / "the liquidity wallet" / "the operations wallet". */
  organLabel: string;
  toOrganLabel: string | null;
}

// ── H2-⑬ — milestone crossings (derived server-side, anchored to the
// crossing transaction; the label is the founder-approved canon label) ──────
export type ServedMilestoneKind = "seats" | "usdc" | "first-mint";

export interface ServedMilestoneLine extends ServedLineCommon {
  kind: "milestone";
  milestoneId: string;
  label: string;
  milestoneKind: ServedMilestoneKind;
  target: number;
}

// ── H2-⑫ — era transitions (witnessed rate-table page turns; the class is
// armed even while history holds none — line-on-crossing ONLY, never a
// countdown: era bounds are bytecode, never framed as scarcity pressure) ────
export interface ServedEraLine extends ServedLineCommon {
  kind: "era-transition";
  era: number;
  /** The engine whose rate table turned (public generation label). */
  engine: string;
}

// ── H2-⑰ — capital-axis rises (footprint recognition; rung title only —
// never an amount, never a benefit; the base rung never lines) ──────────────
export interface ServedCapitalLine extends ServedLineCommon {
  kind: "capital-rise";
  /** The seat whose footprint rose (public ordinal). */
  seatNumber: number;
  /** The rung reached (founder-named canon title — recognition only). */
  rung: string;
}

export type ServedFeedLine =
  | ServedSeatLine
  | ServedBurnLine
  | ServedLifecycleLine
  | ServedLpLine
  | ServedArchiveMintLine
  | ServedArchivePauseLine
  | ServedTreasuryLine
  | ServedMilestoneLine
  | ServedEraLine
  | ServedCapitalLine;

/** H2-⑬ — the served Milestones panel block (/activity). */
export interface ServedMilestones {
  /** Sealed crossings, oldest first, each with its verify anchor. */
  sealed: ServedMilestoneLine[];
  /** Canon order; honest progress from the indexed history. */
  approaching: {
    id: string;
    label: string;
    kind: ServedMilestoneKind;
    target: number;
    currentSeats: number | null;
    currentUsdcRaw: string | null;
  }[];
  /** The server's honest derivation notes (shown, never hidden). */
  notes: string[];
}

export interface ServedFeed {
  state: string;
  headBlock: number | null;
  finishedIso: string | null;
  /** The protocol lane's honest bounds — below headBlock while catching up. */
  burnsAsOfBlock: number | null;
  lifecycleAsOfBlock: number | null;
  /** Total indexed lines server-side across kinds (served = newest cap). */
  itemsTotal: number;
  served: number;
  /** Which histories the server declared COMPLETE in this payload. */
  lanes: {
    seats: boolean;
    burns: boolean;
    referralLifecycle: boolean;
    liquidity: boolean;
    archive: boolean;
    treasury: boolean;
    milestones: boolean;
    eras: boolean;
    capital: boolean;
  };
  /** Malformed lines skipped by THIS client's validation (honesty count). */
  linesSkipped: number;
  /** Mixed feed, newest first, server-capped. */
  items: ServedFeedLine[];
  /** The COMPLETE numbered Proof of Burn record, oldest first. */
  burnLedger: ServedBurnLine[];
  /** H2-⑬: the Milestones panel block (null = the model is dark). */
  milestones: ServedMilestones | null;
}

function toInt(v: unknown): number | null {
  return typeof v === "number" && Number.isSafeInteger(v) ? v : null;
}

// H2-P: the served short form's EXACT shape (0x + 3 hex + … + 4 hex). A full
// address, an over-long hex, or any other string is NOT a valid short form.
const SHORT_FORM_RE = /^0x[0-9a-f]{3}…[0-9a-f]{4}$/;

/**
 * Parse a pride short-form field fail-closed: absent/null → null (an honest
 * gap); a well-shaped short form → itself; ANYTHING ELSE → undefined (the
 * whole line is rejected — a malformed identity never renders).
 */
function toShort(v: unknown): string | null | undefined {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && SHORT_FORM_RE.test(v)) return v;
  return undefined;
}

function parseCommon(r: Record<string, unknown>): ServedLineCommon | null {
  const blockNumber = toInt(r.blockNumber);
  const blockTimestampSec = toInt(r.blockTimestampSec);
  const logIndex = toInt(r.logIndex);
  if (
    blockNumber === null ||
    blockTimestampSec === null ||
    logIndex === null ||
    typeof r.isoDayUtc !== "string" ||
    typeof r.transactionHash !== "string" ||
    !TX_ANCHOR_RE.test(r.transactionHash)
  ) {
    return null;
  }
  return {
    blockNumber,
    blockTimestampSec,
    logIndex,
    isoDayUtc: r.isoDayUtc,
    transactionHash: r.transactionHash as `0x${string}`,
  };
}

function parseLine(raw: unknown): ServedFeedLine | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const common = parseCommon(r);
  if (!common) return null;

  if (r.kind === "purchase") {
    const memberShort = toShort(r.memberShort);
    const referredByShort = toShort(r.referredByShort);
    if (
      typeof r.generation !== "string" ||
      typeof r.firstSeatBucket !== "string" ||
      !BUCKETS.has(r.firstSeatBucket) ||
      typeof r.routedFolded !== "boolean" ||
      memberShort === undefined ||
      referredByShort === undefined
    ) {
      return null;
    }
    const memberNumber = toInt(r.memberNumber);
    return {
      kind: "purchase",
      ...common,
      generation: r.generation,
      firstSeatBucket: r.firstSeatBucket as "true" | "false" | "unknown",
      routedFolded: r.routedFolded,
      memberNumber: memberNumber !== null && memberNumber > 0 ? memberNumber : null,
      memberShort,
      referred: r.referred === true,
      referredByShort,
    };
  }
  if (r.kind === "burn") {
    const n = toInt(r.proofOfBurnNumber);
    const actorShort = toShort(r.actorShort);
    if (
      n === null ||
      n < 1 ||
      typeof r.amountSynRaw !== "string" ||
      !/^[0-9]+$/.test(r.amountSynRaw) ||
      (r.senderLabel !== "Founder" && r.senderLabel !== "Community") ||
      actorShort === undefined
    ) {
      return null;
    }
    return {
      kind: "burn",
      ...common,
      proofOfBurnNumber: n,
      amountSynRaw: r.amountSynRaw,
      senderLabel: r.senderLabel,
      actorShort,
    };
  }
  if (typeof r.kind === "string" && LIFECYCLE_KINDS.has(r.kind)) {
    return {
      kind: r.kind as ServedLifecycleLine["kind"],
      ...common,
      risenToTitle: typeof r.risenToTitle === "string" ? r.risenToTitle : null,
    };
  }
  if (r.kind === "lp-add" || r.kind === "lp-remove") {
    const actorShort = toShort(r.actorShort);
    if (
      typeof r.amountSynRaw !== "string" ||
      !/^[0-9]+$/.test(r.amountSynRaw) ||
      typeof r.amountUsdcRaw !== "string" ||
      !/^[0-9]+$/.test(r.amountUsdcRaw) ||
      (r.actorLabel !== "Founder" && r.actorLabel !== "Community") ||
      actorShort === undefined
    ) {
      return null;
    }
    return {
      kind: r.kind,
      ...common,
      amountSynRaw: r.amountSynRaw,
      amountUsdcRaw: r.amountUsdcRaw,
      actorLabel: r.actorLabel,
      actorShort,
    };
  }
  if (r.kind === "archive-mint") {
    const minterShort = toShort(r.minterShort);
    if (
      typeof r.artifactLabel !== "string" ||
      r.artifactLabel.length === 0 ||
      typeof r.quantityRaw !== "string" ||
      !/^[0-9]+$/.test(r.quantityRaw) ||
      minterShort === undefined
    ) {
      return null;
    }
    return {
      kind: "archive-mint",
      ...common,
      artifactLabel: r.artifactLabel,
      artifactId: toInt(r.artifactId),
      quantityRaw: r.quantityRaw,
      minterShort,
      minterLabel:
        r.minterLabel === "Founder" || r.minterLabel === "Community"
          ? r.minterLabel
          : null,
    };
  }
  if (r.kind === "archive-pause") {
    if (r.action !== "paused" && r.action !== "resumed") return null;
    return { kind: "archive-pause", ...common, action: r.action };
  }
  if (r.kind === "treasury-move") {
    if (
      (r.token !== "USDC" && r.token !== "SYN") ||
      typeof r.amountRaw !== "string" ||
      !/^[0-9]+$/.test(r.amountRaw) ||
      (r.movement !== "in" && r.movement !== "out" && r.movement !== "internal") ||
      typeof r.organLabel !== "string" ||
      r.organLabel.length === 0 ||
      /0x[0-9a-fA-F]{6,}/.test(r.organLabel) ||
      (r.toOrganLabel !== null &&
        r.toOrganLabel !== undefined &&
        (typeof r.toOrganLabel !== "string" || /0x[0-9a-fA-F]{6,}/.test(r.toOrganLabel)))
    ) {
      return null;
    }
    return {
      kind: "treasury-move",
      ...common,
      token: r.token,
      amountRaw: r.amountRaw,
      movement: r.movement,
      organLabel: r.organLabel,
      toOrganLabel: typeof r.toOrganLabel === "string" ? r.toOrganLabel : null,
    };
  }
  if (r.kind === "milestone") {
    const target = toInt(r.target);
    if (
      typeof r.milestoneId !== "string" ||
      r.milestoneId.length === 0 ||
      typeof r.label !== "string" ||
      r.label.length === 0 ||
      target === null ||
      target < 1 ||
      (r.milestoneKind !== "seats" &&
        r.milestoneKind !== "usdc" &&
        r.milestoneKind !== "first-mint")
    ) {
      return null;
    }
    return {
      kind: "milestone",
      ...common,
      milestoneId: r.milestoneId,
      label: r.label,
      milestoneKind: r.milestoneKind,
      target,
    };
  }
  if (r.kind === "era-transition") {
    const era = toInt(r.era);
    if (
      era === null ||
      era < 1 ||
      typeof r.engine !== "string" ||
      r.engine.length === 0 ||
      /0x[0-9a-fA-F]{6,}/.test(r.engine)
    ) {
      return null;
    }
    return { kind: "era-transition", ...common, era, engine: r.engine };
  }
  if (r.kind === "capital-rise") {
    const seatNumber = toInt(r.seatNumber);
    if (
      seatNumber === null ||
      seatNumber < 1 ||
      typeof r.rung !== "string" ||
      r.rung.length === 0 ||
      /0x[0-9a-fA-F]{6,}/.test(r.rung)
    ) {
      return null;
    }
    return { kind: "capital-rise", ...common, seatNumber, rung: r.rung };
  }
  return null;
}

/** Parse the served Milestones block. null on any shape failure (honest). */
function parseMilestones(raw: unknown): ServedMilestones | null {
  if (typeof raw !== "object" || raw === null) return null;
  const m = raw as Record<string, unknown>;
  if (!Array.isArray(m.sealed) || !Array.isArray(m.approaching)) return null;

  const sealed: ServedMilestoneLine[] = [];
  for (const s of m.sealed) {
    const line = parseLine(s);
    if (!line || line.kind !== "milestone") return null; // one bad row = no panel
    sealed.push(line);
  }

  const approaching: ServedMilestones["approaching"] = [];
  for (const a of m.approaching) {
    if (typeof a !== "object" || a === null) return null;
    const r = a as Record<string, unknown>;
    const target = toInt(r.target);
    if (
      typeof r.id !== "string" ||
      typeof r.label !== "string" ||
      target === null ||
      (r.kind !== "seats" && r.kind !== "usdc" && r.kind !== "first-mint")
    ) {
      return null;
    }
    approaching.push({
      id: r.id,
      label: r.label,
      kind: r.kind,
      target,
      currentSeats: toInt(r.currentSeats),
      currentUsdcRaw:
        typeof r.currentUsdcRaw === "string" && /^[0-9]+$/.test(r.currentUsdcRaw)
          ? r.currentUsdcRaw
          : null,
    });
  }

  const notes = Array.isArray(m.notes)
    ? m.notes.filter((n): n is string => typeof n === "string")
    : [];

  return { sealed, approaching, notes };
}

/**
 * Fetch the served receipt-line histories. Returns null on ANY transport/
 * shape failure — the consumer renders the honest fallback, never a guess.
 */
export async function fetchServedFeed(): Promise<ServedFeed | null> {
  try {
    const res = await fetch("/api/backbone/feed", { cache: "no-store" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const b = body as Record<string, unknown>;
    if (b.module !== "event-backbone" || !Array.isArray(b.items)) return null;
    const coverage =
      typeof b.coverage === "object" && b.coverage !== null
        ? (b.coverage as Record<string, unknown>)
        : {};
    const lanesRaw =
      typeof b.lanes === "object" && b.lanes !== null
        ? (b.lanes as Record<string, unknown>)
        : {};

    let linesSkipped = 0;
    const items: ServedFeedLine[] = [];
    for (const raw of b.items) {
      const line = parseLine(raw);
      if (line) items.push(line);
      else linesSkipped += 1;
    }

    const burnLedger: ServedBurnLine[] = [];
    if (Array.isArray(b.burnLedger)) {
      for (const raw of b.burnLedger) {
        const line = parseLine(raw);
        if (line && line.kind === "burn") burnLedger.push(line);
        else linesSkipped += 1;
      }
    }

    return {
      state: typeof b.state === "string" ? b.state : "unknown",
      headBlock: toInt(coverage.headBlock),
      finishedIso:
        typeof coverage.finishedIso === "string" ? coverage.finishedIso : null,
      burnsAsOfBlock: toInt(coverage.burnsAsOfBlock),
      lifecycleAsOfBlock: toInt(coverage.lifecycleAsOfBlock),
      itemsTotal: toInt(coverage.itemsTotal) ?? items.length,
      served: toInt(coverage.served) ?? items.length,
      lanes: {
        seats: lanesRaw.seats === true,
        burns: lanesRaw.burns === true,
        referralLifecycle: lanesRaw.referralLifecycle === true,
        liquidity: lanesRaw.liquidity === true,
        archive: lanesRaw.archive === true,
        treasury: lanesRaw.treasury === true,
        milestones: lanesRaw.milestones === true,
        eras: lanesRaw.eras === true,
        capital: lanesRaw.capital === true,
      },
      linesSkipped,
      items,
      burnLedger,
      milestones: parseMilestones(b.milestones),
    };
  } catch {
    return null; // honest unavailability — the consumer says so
  }
}

/** Format a raw 18-decimal SYN amount for a sentence (whole SYN, localized). */
export function formatSynRaw(amountSynRaw: string): string {
  const whole = BigInt(amountSynRaw) / 10n ** 18n;
  return whole.toLocaleString("en-US");
}

/** Format a raw 6-decimal USDC amount for a sentence (2 decimals, localized). */
export function formatUsdcRaw(amountUsdcRaw: string): string {
  const units = BigInt(amountUsdcRaw);
  const whole = units / 1_000_000n;
  const cents = (units % 1_000_000n) / 10_000n;
  return `${whole.toLocaleString("en-US")}.${cents.toString().padStart(2, "0")}`;
}

// The §8 event lexicon — one event kind, ONE canonical sentence. Never
// reinvented; the served lines carry facts, these lines carry the words.
// (One mapping, shared by the hero's live mini-feed and /activity.)
// H1a — THE COMPLETE HEARTBEAT ARC (founder-approved table + corrections):
//   · THE FOUNDER VOICE RULE: when the act is the founder committing his own
//     stake or signing with his own hand, the sentence SAYS the founder —
//     skin in the game is the trust engine. Identity-blindness protects
//     MEMBERS; it never hides the founder's public acts.
//   · THE VISIBILITY RULE: lines carry what the chain publishes — amounts
//     included; the verify anchor leads to the full transaction anyway.
export function sentenceForServedLine(line: ServedFeedLine): string {
  switch (line.kind) {
    // H2-P — THE PRIDE OF THE PUBLIC RECORD (founder amendment 2026-07-15):
    // the origin voice restored — "0x123…abcd entered the public registry".
    // The veiled referral append is founder choice B; identity facts are the
    // event's own, short form only; lines without them keep the H1a voice.
    case "purchase": {
      const who =
        line.memberNumber !== null && line.memberShort !== null
          ? `Member #${line.memberNumber.toLocaleString("en-US")} · ${line.memberShort}`
          : line.memberShort !== null
            ? line.memberShort
            : null;
      if (who === null) {
        // Pre-amendment fallback voice (an honest gap, never a guess).
        return line.firstSeatBucket === "true"
          ? "A seat was written on-chain — a first seat."
          : line.firstSeatBucket === "false"
            ? "A member expanded their footprint — recorded on-chain."
            : "A seat was written on-chain.";
      }
      // Founder override A (2026-07-15): the referrer is the proud party —
      // named short-form from the SAME event; the veiled wording survives
      // only as the honest degrade when the event's wallet field is absent.
      const referred = line.referred
        ? line.referredByShort !== null
          ? ` — brought by ${line.referredByShort}`
          : " — brought by a verified referral"
        : "";
      return line.firstSeatBucket === "false"
        ? `${who} expanded their footprint — recorded on-chain.`
        : `${who} entered the public registry${referred}.`;
    }
    case "burn":
      return `${formatSynRaw(line.amountSynRaw)} SYN was retired to the burn address — gone for everyone, forever.`;
    case "source-created":
      return "A referral source was created — a founder-signed on-chain act.";
    case "source-terms":
      return line.risenToTitle !== null
        ? `A source rose to ${line.risenToTitle} — recorded on-chain.`
        : "A source's terms were updated — a public event; there are no silent edits.";
    case "source-status":
      return "A source's status changed — a public event; there are no silent edits.";
    case "source-wallet":
      return "A source's payment wallet was rotated — a public act; there are no silent edits.";
    case "lp-add":
      return line.actorLabel === "Founder"
        ? "Liquidity was added to the public pool — the founder deepened the market."
        : "Liquidity was added to the public pool — the market deepened.";
    case "lp-remove":
      return line.actorLabel === "Founder"
        ? "Liquidity was withdrawn from the public pool — a founder-signed public act."
        : "Liquidity was withdrawn from the public pool — a public act.";
    case "archive-mint":
      // H2-P origin voice: "0x123…abcd archived First Signal · token ID 1."
      return line.minterShort !== null
        ? `${line.minterShort} archived ${line.artifactLabel}${line.artifactId !== null ? ` · token ID ${line.artifactId}` : ""}.`
        : `A ${line.artifactLabel} was minted — protocol memory, written to the chain.`;
    case "archive-pause":
      return line.action === "paused"
        ? "The archive was paused — a founder-signed public act."
        : "The archive resumed — a founder-signed public act.";
    // H2-⑦ — TREASURY MOVEMENTS (founder-approved sentences, 2026-07-15).
    // Organ LABELS only; external counterparties never named; a transfer in
    // an already-narrated transaction never reaches here (the Fold Law).
    case "treasury-move": {
      const amount =
        line.token === "SYN" ? formatSynRaw(line.amountRaw) : formatUsdcRaw(line.amountRaw);
      return line.movement === "internal"
        ? `${amount} ${line.token} moved from ${line.organLabel} to ${line.toOrganLabel ?? "another organ"} — an internal treasury rebalance, publicly recorded.`
        : line.movement === "out"
          ? `${amount} ${line.token} moved out of ${line.organLabel} — a founder-signed treasury act; there are no silent moves.`
          : `${amount} ${line.token} entered ${line.organLabel} — recorded on-chain.`;
    }
    // H2-⑬ — MILESTONE CROSSINGS (founder-approved sentences, 2026-07-15).
    // Vocabulary law: always "routed", never "raised"; always SEATS.
    case "milestone":
      switch (line.milestoneId) {
        case "first-seat":
          return "The protocol's first seat was sealed on Avalanche.";
        case "first-signal-mint":
          return "The Archive's first First Signal was minted.";
        case "patron-seal-mint":
          return "The Archive's first Patron Seal was minted.";
        default:
          return line.milestoneKind === "usdc"
            ? `The protocol crossed ${line.target.toLocaleString("en-US")} USDC routed through the sale — 70/20/10, on-chain.`
            : line.milestoneKind === "seats"
              ? `Seat #${line.target.toLocaleString("en-US")} was sealed — a protocol milestone.`
              : `A protocol milestone was sealed — ${line.label}.`;
      }
    // H2-⑫ — ERA TRANSITIONS (§8 sentence graduated verbatim from RESERVED).
    // Line-on-crossing ONLY — never a countdown, never scarcity framing.
    case "era-transition":
      return `The protocol entered era ${line.era.toLocaleString("en-US")} — the rate table turned a page, on schedule, on-chain.`;
    // H2-⑰ — CAPITAL-AXIS RISES (founder sentence 1, 2026-07-15). The rung
    // is RECOGNITION only (the Sephora precedent; the red line: never a
    // rate, never a benefit); acquired forever — it never descends.
    case "capital-rise":
      return `Seat #${line.seatNumber.toLocaleString("en-US")} rose to ${line.rung} — a footprint recognized on the capital axis, never revoked.`;
  }
}

/**
 * The line's public FACTS beyond the sentence (the Visibility rule: amounts
 * included, rendered in the line's meta row beside block/date/verify).
 */
export function factsForServedLine(line: ServedFeedLine): string | null {
  switch (line.kind) {
    case "lp-add":
    case "lp-remove":
      // H2-P: Community pride rides the facts row; the founder voice stands.
      return `${formatSynRaw(line.amountSynRaw)} SYN + ${formatUsdcRaw(line.amountUsdcRaw)} USDC${line.actorShort !== null ? ` · ${line.actorShort}` : ""}`;
    case "burn":
      return `Proof of Burn #${line.proofOfBurnNumber} · ${line.actorShort ?? line.senderLabel}`;
    case "archive-mint":
      return BigInt(line.quantityRaw) > 1n ? `× ${line.quantityRaw}` : null;
    case "milestone":
      // The cohort milestones carry their canon label as the line's fact
      // (the sentence names only the seat ordinal); the first-of-kind and
      // USDC sentences already say everything the label says.
      return line.milestoneKind === "seats" && line.target > 1
        ? line.label
        : null;
    case "era-transition":
      // Generation as detail, never hierarchy (§8 variant axes).
      return line.engine;
    default:
      return null;
  }
}
