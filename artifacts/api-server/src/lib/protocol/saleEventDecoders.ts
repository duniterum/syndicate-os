/**
 * Membership-sale EVENT decoders (SERVED, canon-free) — Sprint 2B-Part A.
 * ----------------------------------------------------------------------
 * Pure, read-only decoders for the exact set of canon sale events the raw
 * indexer scans via eth_getLogs. Like the sibling read decoders, this module is
 * forbidden from importing the vendored canon (the api-server tsconfig excludes
 * `src/canon`), so it PINS each event's canonical signature, keccak256 `topic0`,
 * and static parameter layout. A reconcile guard (under scripts/, which MAY
 * import canon) proves every pinned signature/topic0/param-layout still matches
 * the vendored `sale-abi.ts` — no speculative or hand-invented ABIs.
 *
 * Decoding is fail-closed: a matching-topic0 log whose data/topics do not match
 * the pinned static layout returns { ok: false }, and the caller stops rather
 * than persisting a partial or guessed row.
 *
 * SERVER-ONLY: decoded fields MAY include buyer/recipient/sourceWallet addresses
 * and source/referral figures. They are persisted in a server-only jsonb column
 * and are NEVER placed into any public/HTTP payload.
 */

// Only the static (single-word) parameter types used by the canon sale events.
export type EventParamType =
  | "address"
  | "bytes32"
  | "bool"
  | "uint256"
  | "uint64"
  | "uint16"
  | "uint8";

export type EventParam = {
  readonly name: string;
  readonly type: EventParamType;
  readonly indexed: boolean;
};

export type SaleEventDef = {
  readonly eventName: string;
  /** Canonical signature (types only), e.g. "Routed(uint256,uint256,...)". */
  readonly signature: string;
  /** keccak256(signature) — the log topic0 (0x + 64 hex). */
  readonly topic0: string;
  readonly params: readonly EventParam[];
};

// ── Pinned event definitions (reconciled to canon by the scan guard) ──────────
// topic0 values were derived with the repo's vendored keccak256 from the exact
// canon signatures below; the guard re-derives and asserts they still match.

export const TOKENS_PURCHASED_DEF: SaleEventDef = {
  eventName: "TokensPurchased",
  signature:
    "TokensPurchased(address,uint256,uint256,uint256,uint256,uint256,uint256)",
  topic0: "0xb176b33ad40225c8f67dc6ef0cba96c0c88f67afd36396e2198a3f48a44fc7a0",
  params: [
    { name: "buyer", type: "address", indexed: true },
    { name: "purchaseId", type: "uint256", indexed: true },
    { name: "usdcAmount", type: "uint256", indexed: false },
    { name: "synAmount", type: "uint256", indexed: false },
    { name: "vaultAmount", type: "uint256", indexed: false },
    { name: "liquidityAmount", type: "uint256", indexed: false },
    { name: "operationsAmount", type: "uint256", indexed: false },
  ],
};

export const PURCHASED_DEF: SaleEventDef = {
  eventName: "Purchased",
  signature: "Purchased(address,uint256,uint16,uint256,uint256,uint64,bool)",
  topic0: "0x93d2e586c297dbdb7eb626f12e5d09cad992760d782aea2571c44da40791b3f1",
  params: [
    { name: "buyer", type: "address", indexed: true },
    { name: "memberNumber", type: "uint256", indexed: true },
    { name: "era", type: "uint16", indexed: true },
    { name: "usdcIn", type: "uint256", indexed: false },
    { name: "synOut", type: "uint256", indexed: false },
    { name: "synPerUsdc", type: "uint64", indexed: false },
    { name: "firstSeat", type: "bool", indexed: false },
  ],
};

export const ROUTED_DEF: SaleEventDef = {
  eventName: "Routed",
  signature: "Routed(uint256,uint256,uint256,uint256,uint256)",
  topic0: "0x1e9301528d148faec4e5a2a81ccbc4f4a66f801001fe2cc7437c6a8d17da9fc9",
  params: [
    { name: "memberNumber", type: "uint256", indexed: true },
    { name: "vaultAmount", type: "uint256", indexed: false },
    { name: "liquidityAmount", type: "uint256", indexed: false },
    { name: "operationsAmount", type: "uint256", indexed: false },
    { name: "referralAmount", type: "uint256", indexed: false },
  ],
};

export const MEMBERSHIP_PURCHASED_V3_DEF: SaleEventDef = {
  eventName: "MembershipPurchasedV3",
  signature:
    "MembershipPurchasedV3(bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint64,uint16,uint16,bytes32,uint8,address,uint16,uint8,uint256,uint256,uint256,bool,uint8)",
  topic0: "0x4ae1104be21836909353b0af3cd82a339d2ac380eda00ad26313d8fce198c1bf",
  params: [
    { name: "receiptId", type: "bytes32", indexed: true },
    { name: "buyer", type: "address", indexed: true },
    { name: "recipient", type: "address", indexed: true },
    { name: "memberNumber", type: "uint256", indexed: false },
    { name: "grossUsdc", type: "uint256", indexed: false },
    { name: "acquisitionCost", type: "uint256", indexed: false },
    { name: "protocolContribution", type: "uint256", indexed: false },
    { name: "vaultAmount", type: "uint256", indexed: false },
    { name: "liquidityAmount", type: "uint256", indexed: false },
    { name: "operationsAmount", type: "uint256", indexed: false },
    { name: "synOut", type: "uint256", indexed: false },
    { name: "synPerUsdc", type: "uint64", indexed: false },
    { name: "era", type: "uint16", indexed: false },
    { name: "chapter", type: "uint16", indexed: false },
    { name: "sourceId", type: "bytes32", indexed: false },
    { name: "sourceClass", type: "uint8", indexed: false },
    { name: "sourceWallet", type: "address", indexed: false },
    { name: "commissionBps", type: "uint16", indexed: false },
    { name: "attributionScope", type: "uint8", indexed: false },
    { name: "attributionWindowEndsAt", type: "uint256", indexed: false },
    { name: "sourceGrossRemaining", type: "uint256", indexed: false },
    { name: "buyerGrossRemaining", type: "uint256", indexed: false },
    { name: "firstSeat", type: "bool", indexed: false },
    { name: "receiptVersion", type: "uint8", indexed: false },
  ],
};

/** Every pinned event definition, keyed by canon event name. */
export const SALE_EVENT_DEFS_BY_NAME: Readonly<Record<string, SaleEventDef>> = {
  TokensPurchased: TOKENS_PURCHASED_DEF,
  Purchased: PURCHASED_DEF,
  Routed: ROUTED_DEF,
  MembershipPurchasedV3: MEMBERSHIP_PURCHASED_V3_DEF,
};

export const SALE_EVENT_DEFS: readonly SaleEventDef[] =
  Object.values(SALE_EVENT_DEFS_BY_NAME);

// ── Raw log shape (subset of an eth_getLogs entry we rely on) ─────────────────
export type RawLog = {
  address?: unknown;
  topics?: unknown;
  data?: unknown;
  blockNumber?: unknown;
  blockHash?: unknown;
  transactionHash?: unknown;
  logIndex?: unknown;
};

export type DecodedEventFields = Record<string, string | boolean>;

export type DecodeResult =
  | { ok: true; eventName: string; topic0: string; fields: DecodedEventFields }
  | { ok: false; reason: string };

const WORD_RE = /^[0-9a-fA-F]{64}$/;

/** Decode a single 32-byte ABI word (given WITHOUT the 0x prefix) by type. */
function decodeWord(type: EventParamType, word: string): string | boolean | null {
  if (!WORD_RE.test(word)) return null;
  const lower = word.toLowerCase();
  switch (type) {
    case "address": {
      // Left-padded to 32 bytes; the top 12 bytes (24 hex) must be zero.
      if (lower.slice(0, 24) !== "0".repeat(24)) return null;
      return "0x" + lower.slice(24);
    }
    case "bytes32":
      return "0x" + lower;
    case "bool": {
      let n: bigint;
      try {
        n = BigInt("0x" + lower);
      } catch {
        return null;
      }
      if (n === 0n) return false;
      if (n === 1n) return true;
      return null;
    }
    case "uint256":
    case "uint64":
    case "uint16":
    case "uint8": {
      try {
        return BigInt("0x" + lower).toString(10);
      } catch {
        return null;
      }
    }
  }
}

/**
 * Decode a raw log against a pinned event definition. Fail-closed: returns
 * { ok: false } when topic0, indexed-topic count, or the static data layout do
 * not exactly match the pinned canon shape. Never guesses.
 */
export function decodeSaleEventLog(def: SaleEventDef, log: RawLog): DecodeResult {
  const topics = log.topics;
  if (!Array.isArray(topics) || topics.length === 0) {
    return { ok: false, reason: "no topics" };
  }
  const topic0 = typeof topics[0] === "string" ? topics[0].toLowerCase() : null;
  if (topic0 !== def.topic0.toLowerCase()) {
    return { ok: false, reason: "topic0 mismatch" };
  }

  const indexedParams = def.params.filter((p) => p.indexed);
  const dataParams = def.params.filter((p) => !p.indexed);

  // Indexed params occupy topics[1..]; the count must match exactly.
  if (topics.length !== indexedParams.length + 1) {
    return {
      ok: false,
      reason: `indexed topic count ${topics.length - 1} != ${indexedParams.length}`,
    };
  }

  const data = typeof log.data === "string" ? log.data : null;
  if (data === null || !/^0x([0-9a-fA-F]{64})*$/.test(data)) {
    return { ok: false, reason: "malformed data hex" };
  }
  const dataHex = data.slice(2);
  const dataWordCount = dataHex.length / 64;
  if (dataWordCount !== dataParams.length) {
    return {
      ok: false,
      reason: `data word count ${dataWordCount} != ${dataParams.length}`,
    };
  }

  const fields: DecodedEventFields = {};

  // Decode indexed params from topics (each topic is a full 32-byte word).
  for (let i = 0; i < indexedParams.length; i++) {
    const p = indexedParams[i]!;
    const raw = topics[i + 1];
    const word = typeof raw === "string" && raw.startsWith("0x") ? raw.slice(2) : null;
    if (word === null) return { ok: false, reason: `bad topic for ${p.name}` };
    const value = decodeWord(p.type, word);
    if (value === null) return { ok: false, reason: `decode fail: ${p.name}` };
    fields[p.name] = value;
  }

  // Decode non-indexed params from consecutive data words.
  for (let i = 0; i < dataParams.length; i++) {
    const p = dataParams[i]!;
    const word = dataHex.slice(i * 64, i * 64 + 64);
    const value = decodeWord(p.type, word);
    if (value === null) return { ok: false, reason: `decode fail: ${p.name}` };
    fields[p.name] = value;
  }

  return { ok: true, eventName: def.eventName, topic0: def.topic0, fields };
}
