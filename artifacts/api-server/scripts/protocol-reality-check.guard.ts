/**
 * Guard: Protocol-reality engine invariants (mock transports) — Slice 2.23A.
 * ------------------------------------------------------------------------------
 * Dependency-free runtime guard using INJECTED MOCK transports — it NEVER
 * touches the network. It drives the served `buildProtocolReality` through every
 * boundary condition and proves the founder-required invariants:
 *   - eth_chainId is the FIRST call; nothing is read unless chainId === 43114
 *     (unreachable RPC and wrong chain BOTH fail closed → value null).
 *   - reconciled-match  → value present, CANON_RECONCILED_RPC, HIGH, READ_ONLY_PROOF.
 *   - clean unreconciled (USDC) → value present, LIVE_CHAIN_RPC, MEDIUM.
 *   - canon mismatch    → value null (NEVER normalized) + failureReason, LOW.
 *   - decode failure    → value null + failureReason, PENDING_ADAPTER, LOW.
 *   - missing code      → value null + failureReason, PAUSED_BY_PRECAUTION.
 *   - NO full 0x address and NO forbidden financial/casino framing EVER appears
 *     in the payload; the discipline gate throws on a doctored leak/framing.
 *
 * Run:  pnpm --filter @workspace/api-server run protocol-reality:guard
 * Exit: 0 if every check passes, 1 otherwise.
 */

import type { RpcTransport } from "../src/lib/protocol/rpcTransport";
import { FULL_ADDRESS_RE } from "../src/lib/protocol/rpcTransport";
import {
  buildProtocolReality,
  type BuildOpts,
} from "../src/lib/protocol/realityService";
import type {
  ProtocolRealityEnvelope,
  ProtocolRealityItem,
} from "../src/lib/protocol/realityEnvelope";
import { assertProtocolRealityDiscipline } from "../src/lib/protocol/payloadDiscipline";
import {
  SELECTOR_SYMBOL,
  SELECTOR_DECIMALS,
} from "../src/lib/protocol/erc20Decoders";
import { SELECTOR_PAUSED, SELECTOR_GET_ARTIFACT_CORE } from "../src/lib/protocol/archiveDecoders";
import {
  SELECTOR_IS_CONCLUDED,
  SELECTOR_AVAILABLE_SYN,
  SELECTOR_TOTAL_GROSS_USDC,
  SELECTOR_RECEIPT_COUNT,
} from "../src/lib/protocol/saleDecoders";
import {
  CONTRACT_TARGETS,
  TOKEN_TARGETS,
  ARCHIVE_TARGET,
  ARCHIVE_ARTIFACTS,
  SALE_TARGETS,
} from "../src/data/protocolTargets";

// ── tiny check harness ───────────────────────────────────────────────────────
type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];
function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
}

// ── ABI mock encoders ─────────────────────────────────────────────────────────
const word = (hex: string): string => hex.replace(/^0x/, "").padStart(64, "0");
const encBool = (b: boolean): string => "0x" + word(b ? "1" : "0");
const encUint = (n: number): string => "0x" + word(n.toString(16));
/** Encode a full uint256 from a bigint (exercises values above JS safe-int). */
const encUint256 = (v: bigint): string => "0x" + word(v.toString(16));
function encString(s: string): string {
  const hex = Buffer.from(s, "utf8").toString("hex");
  const len = word(Buffer.byteLength(s, "utf8").toString(16));
  const content = hex.padEnd(Math.ceil(hex.length / 64) * 64 || 64, "0");
  return "0x" + word("20") + len + content;
}
/** A 9-word getArtifactCore tuple whose word 0 is the `configured` boolean. */
const encArtifactCore = (configured: boolean): string =>
  "0x" + word(configured ? "1" : "0") + word("0").repeat(8);

// ── mock transport ────────────────────────────────────────────────────────────
type CallFn = (to: string, selector: string, data: string) => string | "__throw__";
type MockOpts = {
  chainId?: string | "__unreachable__";
  code?: (addr: string) => string;
  call?: CallFn;
};
function makeMock(o: MockOpts): { transport: RpcTransport; methods: string[] } {
  const methods: string[] = [];
  const transport: RpcTransport = async (method, params) => {
    methods.push(method);
    if (method === "eth_chainId") {
      if (o.chainId === "__unreachable__") throw new Error("unreachable");
      return o.chainId ?? "0xa86a";
    }
    if (method === "eth_getCode") {
      const addr = params[0] as string;
      return o.code ? o.code(addr) : "0x60806040";
    }
    if (method === "eth_call") {
      const p = params[0] as { to: string; data: string };
      const selector = p.data.slice(0, 10);
      const r = o.call ? o.call(p.to, selector, p.data) : goodCall(p.to, selector);
      if (r === "__throw__") throw new Error("revert");
      return r;
    }
    throw new Error("unexpected method " + method);
  };
  return { transport, methods };
}

const SYN_ADDR = TOKEN_TARGETS.find((t) => t.key === "SYN")!.address.toLowerCase();
const USDC_ADDR = TOKEN_TARGETS.find((t) => t.key === "USDC")!.address.toLowerCase();
const V3_ADDR = SALE_TARGETS.find((t) => t.key === "MEMBERSHIP_SALE_V3")!.address.toLowerCase();

// Founder-fixture V3 figures: chosen ABOVE Number.MAX_SAFE_INTEGER so the guard
// proves the exact decimal STRING survives (no bigint→number precision loss).
const V3_AVAILABLE_SYN = 1234000000000000000000n; // 1234 SYN @ 18 decimals
const V3_TOTAL_GROSS_USDC = 5000000000n; //          5000 USDC @ 6 decimals
const V3_RECEIPT_COUNT = 42n;

function goodCall(to: string, selector: string): string {
  const addr = to.toLowerCase();
  if (selector === SELECTOR_SYMBOL) return encString(addr === USDC_ADDR ? "USDC" : "SYN");
  if (selector === SELECTOR_DECIMALS) return encUint(addr === USDC_ADDR ? 6 : 18);
  if (selector === SELECTOR_PAUSED) return encBool(false);
  if (selector === SELECTOR_IS_CONCLUDED) return encBool(false);
  if (selector === SELECTOR_AVAILABLE_SYN) return encUint256(V3_AVAILABLE_SYN);
  if (selector === SELECTOR_TOTAL_GROSS_USDC) return encUint256(V3_TOTAL_GROSS_USDC);
  if (selector === SELECTOR_RECEIPT_COUNT) return encUint256(V3_RECEIPT_COUNT);
  if (selector === SELECTOR_GET_ARTIFACT_CORE) return encArtifactCore(true);
  return "0x";
}

const baseOpts = (transport: RpcTransport): BuildOpts => ({
  transport,
  contractTargets: CONTRACT_TARGETS,
  tokenTargets: TOKEN_TARGETS,
  archiveTarget: ARCHIVE_TARGET,
  archiveArtifacts: ARCHIVE_ARTIFACTS,
  saleTargets: SALE_TARGETS,
  now: () => new Date("2026-06-30T00:00:00.000Z"),
});

const allItems = (e: ProtocolRealityEnvelope): ProtocolRealityItem[] => [
  ...e.groups.chain,
  ...e.groups.contracts,
  ...e.groups.sale,
  ...e.groups.tokens,
  ...e.groups.archive,
];
const byId = (e: ProtocolRealityEnvelope, id: string): ProtocolRealityItem | undefined =>
  allItems(e).find((i) => i.id === id);

function noAddressLeak(e: ProtocolRealityEnvelope): boolean {
  return !FULL_ADDRESS_RE.test(JSON.stringify(e));
}
function disciplinePasses(e: ProtocolRealityEnvelope): boolean {
  try {
    assertProtocolRealityDiscipline(e);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  // 1) HAPPY PATH (chain ok, code present, reconciled).
  {
    const { transport, methods } = makeMock({});
    const e = await buildProtocolReality(baseOpts(transport));
    check("happy: eth_chainId is the FIRST call", methods[0] === "eth_chainId");
    check("happy: mode + expectedChainId", e.mode === "READ_ONLY_PROTOCOL_REALITY" && e.expectedChainId === 43114);
    check("happy: chain identity verified true / HIGH / READ_ONLY_PROOF", byId(e, "chain.identityVerified")?.value === true && byId(e, "chain.identityVerified")?.confidence === "HIGH" && byId(e, "chain.identityVerified")?.lifecycle === "READ_ONLY_PROOF");
    check("happy: every contract code present (true, CANON_RECONCILED_RPC, HIGH)", e.groups.contracts.every((i) => i.value === true && i.sourceType === "CANON_RECONCILED_RPC" && i.confidence === "HIGH" && i.lifecycle === "READ_ONLY_PROOF"));
    const synSym = byId(e, "tokens.SYN.symbol");
    check("happy: SYN symbol reconciled (value SYN, CANON_RECONCILED_RPC, HIGH)", synSym?.value === "SYN" && synSym?.sourceType === "CANON_RECONCILED_RPC" && synSym?.confidence === "HIGH");
    check("happy: SYN decimals reconciled (18, HIGH)", byId(e, "tokens.SYN.decimals")?.value === 18 && byId(e, "tokens.SYN.decimals")?.confidence === "HIGH");
    const usdcSym = byId(e, "tokens.USDC.symbol");
    check("happy: USDC symbol unreconciled (value USDC, LIVE_CHAIN_RPC, MEDIUM)", usdcSym?.value === "USDC" && usdcSym?.sourceType === "LIVE_CHAIN_RPC" && usdcSym?.confidence === "MEDIUM");
    check("happy: USDC decimals unreconciled (6, MEDIUM)", byId(e, "tokens.USDC.decimals")?.value === 6 && byId(e, "tokens.USDC.decimals")?.confidence === "MEDIUM");
    check("happy: archive paused read (false, READ_ONLY_PROOF, MEDIUM)", byId(e, "archive.paused")?.value === false && byId(e, "archive.paused")?.lifecycle === "READ_ONLY_PROOF" && byId(e, "archive.paused")?.confidence === "MEDIUM");
    check("happy: archive id1 configured reconciled (true, CANON_RECONCILED_RPC, HIGH)", byId(e, "archive.artifact.1")?.value === true && byId(e, "archive.artifact.1")?.sourceType === "CANON_RECONCILED_RPC" && byId(e, "archive.artifact.1")?.confidence === "HIGH");
    check("happy: archive id3 configured reconciled (true, HIGH)", byId(e, "archive.artifact.3")?.value === true && byId(e, "archive.artifact.3")?.confidence === "HIGH");
    // Sale group (Sprint 2): 8 items — flags on V1/V2/V3 + V3's 3 numeric figures.
    check("happy: sale group has 8 items", e.groups.sale.length === 8, String(e.groups.sale.length));
    check("happy: every sale item contractRole 'sale' + LIVE_CHAIN_RPC", e.groups.sale.every((i) => i.contractRole === "sale" && i.sourceType === "LIVE_CHAIN_RPC"));
    const v1Paused = byId(e, "sale.MEMBERSHIP_SALE.paused");
    check("happy: V1 paused read (false, MEDIUM, READ_ONLY_PROOF)", v1Paused?.value === false && v1Paused?.confidence === "MEDIUM" && v1Paused?.lifecycle === "READ_ONLY_PROOF");
    check("happy: V1 has NO concluded + NO numeric reads", byId(e, "sale.MEMBERSHIP_SALE.concluded") === undefined && byId(e, "sale.MEMBERSHIP_SALE.availableSyn") === undefined);
    check("happy: V2 paused + concluded present, NO numeric reads", byId(e, "sale.MEMBERSHIP_SALE_V2.paused")?.value === false && byId(e, "sale.MEMBERSHIP_SALE_V2.concluded")?.value === false && byId(e, "sale.MEMBERSHIP_SALE_V2.availableSyn") === undefined);
    check("happy: V3 paused + concluded read false (active engine, not concluded)", byId(e, "sale.MEMBERSHIP_SALE_V3.paused")?.value === false && byId(e, "sale.MEMBERSHIP_SALE_V3.concluded")?.value === false);
    const v3Avail = byId(e, "sale.MEMBERSHIP_SALE_V3.availableSyn");
    check("happy: V3 availableSyn EXACT decimal string (no precision loss), string/MEDIUM/READ_ONLY_PROOF", v3Avail?.value === V3_AVAILABLE_SYN.toString() && v3Avail?.valueType === "string" && v3Avail?.confidence === "MEDIUM" && v3Avail?.lifecycle === "READ_ONLY_PROOF");
    check("happy: V3 totalGrossUsdc EXACT decimal string", byId(e, "sale.MEMBERSHIP_SALE_V3.totalGrossUsdc")?.value === V3_TOTAL_GROSS_USDC.toString());
    check("happy: V3 receiptCount EXACT decimal string", byId(e, "sale.MEMBERSHIP_SALE_V3.receiptCount")?.value === V3_RECEIPT_COUNT.toString());
    check("happy: every present value has null failureReason", allItems(e).every((i) => (i.value === null) === (i.failureReason !== null) || i.id === "chain.network"));
    check("happy: NO address leak", noAddressLeak(e));
    check("happy: discipline passes", disciplinePasses(e));
    check("happy: every item publicSafe + valueType consistent", allItems(e).every((i) => i.publicSafe === true && i.valueType === (i.value === null ? "null" : typeof i.value)));
  }

  // 2) UNREACHABLE RPC: only network fact + reachable=false survive; rest null.
  {
    const { transport, methods } = makeMock({ chainId: "__unreachable__" });
    const e = await buildProtocolReality(baseOpts(transport));
    check("unreachable: NO eth_getCode / NO eth_call", !methods.includes("eth_getCode") && !methods.includes("eth_call"));
    check("unreachable: rpcReachable false / PAUSED_BY_PRECAUTION", byId(e, "chain.rpcReachable")?.value === false && byId(e, "chain.rpcReachable")?.lifecycle === "PAUSED_BY_PRECAUTION");
    check("unreachable: identityVerified null + failureReason", byId(e, "chain.identityVerified")?.value === null && byId(e, "chain.identityVerified")?.failureReason !== null);
    check("unreachable: every contract value null + failureReason", e.groups.contracts.every((i) => i.value === null && i.failureReason !== null));
    check("unreachable: every token value null", e.groups.tokens.every((i) => i.value === null));
    check("unreachable: every archive value null", e.groups.archive.every((i) => i.value === null));
    check("unreachable: every sale value null", e.groups.sale.every((i) => i.value === null));
    check("unreachable: chain.network still string", byId(e, "chain.network")?.value === "Avalanche C-Chain");
    check("unreachable: NO address leak + discipline passes", noAddressLeak(e) && disciplinePasses(e));
  }

  // 3) WRONG CHAIN: reachable but chainId !== 43114 → fail closed.
  {
    const { transport, methods } = makeMock({ chainId: "0x1" });
    const e = await buildProtocolReality(baseOpts(transport));
    check("wrong-chain: NO eth_getCode / NO eth_call", !methods.includes("eth_getCode") && !methods.includes("eth_call"));
    check("wrong-chain: rpcReachable true", byId(e, "chain.rpcReachable")?.value === true);
    check("wrong-chain: identityVerified null + LOW + failureReason mentions chain id", byId(e, "chain.identityVerified")?.value === null && byId(e, "chain.identityVerified")?.confidence === "LOW" && (byId(e, "chain.identityVerified")?.failureReason ?? "").includes("chain id"));
    check("wrong-chain: contracts/sale/tokens/archive all null", [...e.groups.contracts, ...e.groups.sale, ...e.groups.tokens, ...e.groups.archive].every((i) => i.value === null));
  }

  // 4) CANON MISMATCH: SYN symbol reads "XXX" → value null, NEVER normalized.
  {
    const { transport } = makeMock({
      call: (to, s) => (to.toLowerCase() === SYN_ADDR && s === SELECTOR_SYMBOL ? encString("XXX") : goodCall(to, s)),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    const synSym = byId(e, "tokens.SYN.symbol");
    check("mismatch: SYN symbol value null (NOT normalized to SYN)", synSym?.value === null);
    check("mismatch: SYN symbol LOW + PAUSED_BY_PRECAUTION + failureReason", synSym?.confidence === "LOW" && synSym?.lifecycle === "PAUSED_BY_PRECAUTION" && synSym?.failureReason !== null);
    check("mismatch: payload never contains the read 'XXX'", !JSON.stringify(e).includes("XXX"));
  }

  // 5) DECODE FAILURE: SYN symbol returns empty → PENDING_ADAPTER + null.
  {
    const { transport } = makeMock({
      call: (to, s) => (to.toLowerCase() === SYN_ADDR && s === SELECTOR_SYMBOL ? "0x" : goodCall(to, s)),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    const synSym = byId(e, "tokens.SYN.symbol");
    check("decode-fail: SYN symbol null + PENDING_ADAPTER + LOW + failureReason", synSym?.value === null && synSym?.lifecycle === "PENDING_ADAPTER" && synSym?.confidence === "LOW" && synSym?.failureReason !== null);
  }

  // 6) MISSING CODE: one contract returns no code → null + PAUSED_BY_PRECAUTION.
  {
    const { transport } = makeMock({
      code: (addr) => (addr.toLowerCase() === SYN_ADDR ? "0x" : "0x60806040"),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    const synCode = byId(e, "contracts.SYN_TOKEN");
    check("no-code: SYN contract null + LOW + PAUSED_BY_PRECAUTION + failureReason", synCode?.value === null && synCode?.confidence === "LOW" && synCode?.lifecycle === "PAUSED_BY_PRECAUTION" && synCode?.failureReason !== null);
    check("no-code: SYN token metadata not read (null)", byId(e, "tokens.SYN.symbol")?.value === null && byId(e, "tokens.SYN.decimals")?.value === null);
  }

  // 7) ARCHIVE SHAPE DRIFT: too-short getArtifactCore tuple → PENDING_ADAPTER.
  {
    const { transport } = makeMock({
      call: (to, s) => (s === SELECTOR_GET_ARTIFACT_CORE ? "0x" + word("1") : goodCall(to, s)),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    check("shape-drift: archive id1 null + PENDING_ADAPTER + failureReason", byId(e, "archive.artifact.1")?.value === null && byId(e, "archive.artifact.1")?.lifecycle === "PENDING_ADAPTER" && byId(e, "archive.artifact.1")?.failureReason !== null);
  }

  // 7b) SALE NUMERIC DECODE FAILURE: V3 availableSyn returns "0x" → null, and
  //     the sibling receiptCount still reads (one bad view never poisons others).
  {
    const { transport } = makeMock({
      call: (to, s) => (to.toLowerCase() === V3_ADDR && s === SELECTOR_AVAILABLE_SYN ? "0x" : goodCall(to, s)),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    const a = byId(e, "sale.MEMBERSHIP_SALE_V3.availableSyn");
    check("sale-decode-fail: V3 availableSyn null + PENDING_ADAPTER + LOW + failureReason", a?.value === null && a?.lifecycle === "PENDING_ADAPTER" && a?.confidence === "LOW" && a?.failureReason !== null);
    check("sale-decode-fail: sibling receiptCount still exact string", byId(e, "sale.MEMBERSHIP_SALE_V3.receiptCount")?.value === V3_RECEIPT_COUNT.toString());
  }

  // 7c) SALE MISSING CODE: V3 has no code → all 5 V3 items fail closed; V1 reads.
  {
    const { transport } = makeMock({
      code: (addr) => (addr.toLowerCase() === V3_ADDR ? "0x" : "0x60806040"),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    const v3 = e.groups.sale.filter((i) => i.id.startsWith("sale.MEMBERSHIP_SALE_V3."));
    check("sale-no-code: all 5 V3 items null + PAUSED_BY_PRECAUTION + failureReason", v3.length === 5 && v3.every((i) => i.value === null && i.lifecycle === "PAUSED_BY_PRECAUTION" && i.failureReason !== null));
    check("sale-no-code: V1 paused still reads (false)", byId(e, "sale.MEMBERSHIP_SALE.paused")?.value === false);
  }

  // 8) DISCIPLINE positive controls: doctored leak + framing must THROW.
  {
    const leak = { groups: { chain: [{ note: "see 0x1234567890abcdef1234567890abcdef12345678" }] } };
    let threwLeak = false;
    try {
      assertProtocolRealityDiscipline(leak);
    } catch {
      threwLeak = true;
    }
    check("discipline: full address leak THROWS", threwLeak);

    const framing = { note: "guaranteed profit and yield for everyone" };
    let threwFraming = false;
    try {
      assertProtocolRealityDiscipline(framing);
    } catch {
      threwFraming = true;
    }
    check("discipline: forbidden financial framing THROWS", threwFraming);
  }

  // ── report ──────────────────────────────────────────────────────────────────
  let failed = 0;
  for (const r of results) {
    if (!r.ok) failed += 1;
    const tag = r.ok ? "PASS" : "FAIL";
    const detail = r.detail ? `  (${r.detail})` : "";
    process.stdout.write(`[${tag}] ${r.name}${r.ok ? "" : detail}\n`);
  }
  process.stdout.write(`\nprotocol-reality guard: ${results.length - failed}/${results.length} passed\n`);
  if (failed > 0) process.exit(1);
}

void main();
