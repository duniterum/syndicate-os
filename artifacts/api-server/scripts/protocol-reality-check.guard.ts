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
  getProtocolReality,
  __resetProtocolRealityCache,
  __getProtocolRealityInFlight,
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
import { SELECTOR_SOURCE_REGISTRY } from "../src/lib/protocol/sourceDecoders";
import {
  SELECTOR_TOTAL_USDC_RAISED,
  SELECTOR_BALANCE_OF,
  SELECTOR_GET_RESERVES,
  SELECTOR_TOKEN0,
  SELECTOR_MEMBER_COUNT,
  SELECTOR_GENESIS_OFFSET,
  SELECTOR_NEXT_SEAT_NUMBER,
  SELECTOR_TOTAL_SUPPLY,
  encodeAddressArg,
} from "../src/lib/protocol/financialDecoders";
import {
  CONTRACT_TARGETS,
  TOKEN_TARGETS,
  ARCHIVE_TARGET,
  ARCHIVE_ARTIFACTS,
  SALE_TARGETS,
  SOURCE_LINKAGE_TARGET,
  FINANCIAL_TARGETS,
} from "../src/data/protocolTargets";
import { REFERRAL_ATTRIBUTION_SNAPSHOT } from "../src/lib/protocol/referralAttributionSnapshot";

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
/** A 9-word getArtifactCore tuple: word 0 = `configured`, word 7 = `priceUsdc`, word 8 = `minted`. */
const encArtifactCore = (configured: boolean, minted: bigint = 0n, priceUsdc: bigint = 0n): string =>
  "0x" + word(configured ? "1" : "0") + word("0").repeat(6) + word(priceUsdc.toString(16)) + word(minted.toString(16));
const ID1_MINTED = 11n;
const ID3_MINTED = 6n;
const ID1_PRICE = 25_000_000n; // fixture: 25 USDC raw @6dec
const ID3_PRICE = 100_000_000n; // fixture: 100 USDC raw @6dec

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
      const r = o.call ? o.call(p.to, selector, p.data) : goodCall(p.to, selector, p.data);
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

// ── financial group fixtures (Slice N1 + Reconciliation slice) ───────────────
const V1_FIN_ADDR = FINANCIAL_TARGETS.inflows
  .find((i) => i.key === "MEMBERSHIP_SALE")!
  .address.toLowerCase();
const V2A_FIN_ADDR = FINANCIAL_TARGETS.inflows
  .find((i) => i.key === "MEMBERSHIP_SALE_V2A")!
  .address.toLowerCase();
const LP_ADDR = FINANCIAL_TARGETS.lpPair.toLowerCase();
const V1_INFLOW = 44000000n; //     44 USDC @ 6 decimals (V1 founder-test era)
const V2A_INFLOW = 111000000n; //  111 USDC @ 6 decimals
const V2B_INFLOW = 222000000n; //  222 USDC @ 6 decimals
// aggregate = V1 + V2A + V2B + V3_TOTAL_GROSS_USDC (server-side bigint sum)
const INFLOW_AGGREGATE = V1_INFLOW + V2A_INFLOW + V2B_INFLOW + V3_TOTAL_GROSS_USDC;
const VAULT_USDC_BAL = 70000000123n; // vault USDC balance fixture
const OPS_USDC_BAL = 10000000456n; //  operations wallet USDC balance fixture
// balanceOf(vault) vs balanceOf(operations) hit the SAME USDC contract — only
// the encoded calldata argument distinguishes them, so goodCall needs `data`.
const VAULT_BAL_DATA = encodeAddressArg(SELECTOR_BALANCE_OF, FINANCIAL_TARGETS.vaultWallet);
const OPS_BAL_DATA = encodeAddressArg(SELECTOR_BALANCE_OF, FINANCIAL_TARGETS.operationsWallet);
// Burned SYN fixture: 16,000 SYN @ 18 decimals — ABOVE Number.MAX_SAFE_INTEGER
// and DIFFERENT from any recorded canon ceremony figure: the guard proves the
// served value comes from the TRANSPORT, never a stored constant.
const BURNED_SYN = 16000000000000000000000n;
const STALE_CANON_BURN = 2000000000000000000000n; // 2,000 SYN — must NEVER appear
const LP_RESERVE0 = 987654321000000000000n; // SYN side (token0 fixture = SYN)
const LP_RESERVE1 = 4321000000n; //           USDC side
const MEMBER_COUNT_FIX = 27n;
// ⓪ dual-provenance reconciliation fixtures: GENESIS_OFFSET() must equal the
// snapshot freeze-root count (FREEZE_ROOT_COUNT = 8) and nextSeatNumber() must
// equal memberCount + 1 — the exact anchor realityService reconciles against
// before it surfaces either figure (else both fail closed).
const GENESIS_OFFSET_FIX = 8n;
/** Uniswap-V2 getReserves(): exactly 3 words (uint112, uint112, uint32 ts). */
const encReserves = (r0: bigint, r1: bigint): string =>
  "0x" + word(r0.toString(16)) + word(r1.toString(16)) + word("64");

// ── tokenomics live reads (Slice 2.2) fixtures ───────────────────────────────
// SYN totalSupply + per-allocation SYN balances. Values are distinct and ABOVE
// Number.MAX_SAFE_INTEGER so the guard proves each exact decimal STRING survives.
const SYN_TOTAL_SUPPLY_FIX = 1_000_000_000_000_000_000_000_000_000n; // 1B SYN @18dec
// Non-round fixtures (distinct, above MAX_SAFE_INTEGER, no long zero runs) — they
// prove exact-string survival AND avoid accidentally embedding a tripwire constant
// like STALE_CANON_BURN ("2" + 21 zeros).
const ALLOC_BALANCES: Record<string, bigint> = {
  MEMBERSHIP_DISTRIBUTION: 300_000_000_123_456_789_012_345_678n,
  VAULT_RESERVE: 250_000_000_234_567_890_123_456_789n,
  FOUNDER: 120_000_000_345_678_901_234_567_890n,
  LIQUIDITY: 100_000_000_456_789_012_345_678_901n,
  PARTNERSHIPS: 80_000_000_567_890_123_456_789_012n,
  CONTRIBUTORS: 50_000_000_678_901_234_567_890_123n,
  FUTURE_ECOSYSTEM: 49_000_000_789_012_345_678_901_234n,
};
// balanceOf(SYN) calldata → fixture value per allocation wallet, so the mock can
// disambiguate the 7 allocation reads from the burn read on the SAME SYN contract.
const ALLOC_BAL_BY_DATA = new Map<string, bigint>(
  FINANCIAL_TARGETS.allocationWallets.map((w) => [
    encodeAddressArg(SELECTOR_BALANCE_OF, w.address) as string,
    ALLOC_BALANCES[w.key],
  ]),
);

function goodCall(to: string, selector: string, data = ""): string {
  const addr = to.toLowerCase();
  if (selector === SELECTOR_SYMBOL) return encString(addr === USDC_ADDR ? "USDC" : "SYN");
  if (selector === SELECTOR_DECIMALS) return encUint(addr === USDC_ADDR ? 6 : 18);
  if (selector === SELECTOR_PAUSED) return encBool(false);
  if (selector === SELECTOR_IS_CONCLUDED) return encBool(false);
  if (selector === SELECTOR_AVAILABLE_SYN) return encUint256(V3_AVAILABLE_SYN);
  if (selector === SELECTOR_TOTAL_GROSS_USDC) return encUint256(V3_TOTAL_GROSS_USDC);
  if (selector === SELECTOR_RECEIPT_COUNT) return encUint256(V3_RECEIPT_COUNT);
  if (selector === SELECTOR_GET_ARTIFACT_CORE) {
    const id = BigInt("0x" + (data.slice(10) || "0"));
    return encArtifactCore(
      true,
      id === 1n ? ID1_MINTED : id === 3n ? ID3_MINTED : 0n,
      id === 1n ? ID1_PRICE : id === 3n ? ID3_PRICE : 0n,
    );
  }
  if (selector === SELECTOR_SOURCE_REGISTRY)
    return "0x" + word(SOURCE_LINKAGE_TARGET.registryAddress.slice(2).toLowerCase());
  // financial group: disambiguated by call target + calldata, never a constant.
  if (selector === SELECTOR_TOTAL_USDC_RAISED) {
    if (addr === V1_FIN_ADDR) return encUint256(V1_INFLOW);
    return encUint256(addr === V2A_FIN_ADDR ? V2A_INFLOW : V2B_INFLOW);
  }
  if (selector === SELECTOR_BALANCE_OF) {
    if (addr === USDC_ADDR)
      return encUint256(data === OPS_BAL_DATA ? OPS_USDC_BAL : VAULT_USDC_BAL);
    // SYN balanceOf: an allocation wallet (by calldata) or the burn address.
    const alloc = ALLOC_BAL_BY_DATA.get(data);
    if (alloc !== undefined) return encUint256(alloc);
    return encUint256(BURNED_SYN);
  }
  if (selector === SELECTOR_TOTAL_SUPPLY) return encUint256(SYN_TOTAL_SUPPLY_FIX);
  if (selector === SELECTOR_TOKEN0) return "0x" + word(SYN_ADDR.slice(2));
  if (selector === SELECTOR_GET_RESERVES) return encReserves(LP_RESERVE0, LP_RESERVE1);
  if (selector === SELECTOR_MEMBER_COUNT) return encUint256(MEMBER_COUNT_FIX);
  if (selector === SELECTOR_GENESIS_OFFSET) return encUint256(GENESIS_OFFSET_FIX);
  if (selector === SELECTOR_NEXT_SEAT_NUMBER)
    return encUint256(MEMBER_COUNT_FIX + 1n);
  return "0x";
}

const baseOpts = (transport: RpcTransport): BuildOpts => ({
  transport,
  contractTargets: CONTRACT_TARGETS,
  tokenTargets: TOKEN_TARGETS,
  archiveTarget: ARCHIVE_TARGET,
  archiveArtifacts: ARCHIVE_ARTIFACTS,
  saleTargets: SALE_TARGETS,
  sourceLinkageTarget: SOURCE_LINKAGE_TARGET,
  financialTargets: FINANCIAL_TARGETS,
  now: () => new Date("2026-06-30T00:00:00.000Z"),
});

const allItems = (e: ProtocolRealityEnvelope): ProtocolRealityItem[] => [
  ...e.groups.chain,
  ...e.groups.contracts,
  ...e.groups.sale,
  ...e.groups.tokens,
  ...e.groups.archive,
  ...e.groups.source,
  ...e.groups.financial,
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
    // Record every balanceOf calldata so the guard can pin WHICH wallet each
    // token-balance read targets (vault on USDC; canonical burn on SYN).
    const balanceOfCalls: { to: string; data: string }[] = [];
    const { transport, methods } = makeMock({
      call: (to, s, d) => {
        if (s === SELECTOR_BALANCE_OF) balanceOfCalls.push({ to: to.toLowerCase(), data: d });
        return goodCall(to, s, d);
      },
    });
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
    const id1Minted = byId(e, "archive.artifact.1.minted");
    check("happy: archive id1 minted EXACT count string (LIVE_CHAIN_RPC, MEDIUM, READ_ONLY_PROOF)", id1Minted?.value === ID1_MINTED.toString() && id1Minted?.valueType === "string" && id1Minted?.sourceType === "LIVE_CHAIN_RPC" && id1Minted?.confidence === "MEDIUM" && id1Minted?.lifecycle === "READ_ONLY_PROOF");
    const id3Minted = byId(e, "archive.artifact.3.minted");
    check("happy: archive id3 minted EXACT count string (MEDIUM, READ_ONLY_PROOF)", id3Minted?.value === ID3_MINTED.toString() && id3Minted?.valueType === "string" && id3Minted?.confidence === "MEDIUM" && id3Minted?.lifecycle === "READ_ONLY_PROOF");
    const id1Price = byId(e, "archive.artifact.1.price");
    check("happy: archive id1 price EXACT raw 6dec string (LIVE_CHAIN_RPC, MEDIUM, READ_ONLY_PROOF)", id1Price?.value === ID1_PRICE.toString() && id1Price?.valueType === "string" && id1Price?.sourceType === "LIVE_CHAIN_RPC" && id1Price?.confidence === "MEDIUM" && id1Price?.lifecycle === "READ_ONLY_PROOF");
    const id3Price = byId(e, "archive.artifact.3.price");
    check("happy: archive id3 price EXACT raw 6dec string (MEDIUM, READ_ONLY_PROOF)", id3Price?.value === ID3_PRICE.toString() && id3Price?.valueType === "string" && id3Price?.confidence === "MEDIUM" && id3Price?.lifecycle === "READ_ONLY_PROOF");
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
    // Source group (Public MVP): linkage + 2 static canon facts, 3 items total.
    check("happy: source group has 3 items", e.groups.source.length === 3, String(e.groups.source.length));
    const linkage = byId(e, "source.registryLinkage");
    check("happy: source registryLinkage true (CANON_RECONCILED_RPC, HIGH, READ_ONLY_PROOF)", linkage?.value === true && linkage?.sourceType === "CANON_RECONCILED_RPC" && linkage?.confidence === "HIGH" && linkage?.lifecycle === "READ_ONLY_PROOF");
    check("happy: source creationPolicy OWNER_ONLY (SERVER_SIDE_CANON, FOUNDER_GATED)", byId(e, "source.creationPolicy")?.value === "OWNER_ONLY" && byId(e, "source.creationPolicy")?.sourceType === "SERVER_SIDE_CANON" && byId(e, "source.creationPolicy")?.lifecycle === "FOUNDER_GATED");
    check("happy: source zeroSourceJoin true (SERVER_SIDE_CANON, READ_ONLY_PROOF)", byId(e, "source.zeroSourceJoin")?.value === true && byId(e, "source.zeroSourceJoin")?.sourceType === "SERVER_SIDE_CANON" && byId(e, "source.zeroSourceJoin")?.lifecycle === "READ_ONLY_PROOF");
    // Financial group (Slice N1 + Reconciliation): 13 items, values LIVE from
    // the transport except the attribution count (static hash-pinned snapshot).
    check("fin: financial group has exactly 22 items", e.groups.financial.length === 22, String(e.groups.financial.length));
    const finIds = e.groups.financial.map((i) => i.id).sort().join(",");
    check(
      "fin: exact id set (14 base [incl. genesisOffset] + SYN totalSupply + 7 allocation balances = 22)",
      finIds ===
        [
          "financial.burn.synBalance",
          "financial.distribution.CONTRIBUTORS.balance",
          "financial.distribution.FOUNDER.balance",
          "financial.distribution.FUTURE_ECOSYSTEM.balance",
          "financial.distribution.LIQUIDITY.balance",
          "financial.distribution.MEMBERSHIP_DISTRIBUTION.balance",
          "financial.distribution.PARTNERSHIPS.balance",
          "financial.distribution.VAULT_RESERVE.balance",
          "financial.inflow.MEMBERSHIP_SALE",
          "financial.inflow.MEMBERSHIP_SALE_V2",
          "financial.inflow.MEMBERSHIP_SALE_V2A",
          "financial.inflow.MEMBERSHIP_SALE_V3",
          "financial.inflow.aggregate",
          "financial.lp.reserveSyn",
          "financial.lp.reserveUsdc",
          "financial.members.genesisOffset",
          "financial.members.memberCount",
          "financial.ops.usdcBalance",
          "financial.referral.attributionActivity",
          "financial.referral.registryLive",
          "financial.token.synTotalSupply",
          "financial.vault.usdcBalance",
        ].join(","),
      finIds,
    );
    check("fin: NO financial item is ever SERVER_SIDE_CANON (no stored-constant figures)", e.groups.financial.every((i) => i.sourceType !== "SERVER_SIDE_CANON"));
    check("fin: V1 inflow EXACT decimal string (LIVE_CHAIN_RPC, MEDIUM, sale role) — reversed scope pin", byId(e, "financial.inflow.MEMBERSHIP_SALE")?.value === V1_INFLOW.toString() && byId(e, "financial.inflow.MEMBERSHIP_SALE")?.sourceType === "LIVE_CHAIN_RPC" && byId(e, "financial.inflow.MEMBERSHIP_SALE")?.confidence === "MEDIUM" && byId(e, "financial.inflow.MEMBERSHIP_SALE")?.contractRole === "sale");
    check("fin: V2a inflow EXACT decimal string (LIVE_CHAIN_RPC, MEDIUM, sale role)", byId(e, "financial.inflow.MEMBERSHIP_SALE_V2A")?.value === V2A_INFLOW.toString() && byId(e, "financial.inflow.MEMBERSHIP_SALE_V2A")?.sourceType === "LIVE_CHAIN_RPC" && byId(e, "financial.inflow.MEMBERSHIP_SALE_V2A")?.confidence === "MEDIUM" && byId(e, "financial.inflow.MEMBERSHIP_SALE_V2A")?.contractRole === "sale");
    check("fin: V2b inflow EXACT decimal string", byId(e, "financial.inflow.MEMBERSHIP_SALE_V2")?.value === V2B_INFLOW.toString());
    check("fin: V3 inflow equals the engine's totalGrossUsdc figure", byId(e, "financial.inflow.MEMBERSHIP_SALE_V3")?.value === V3_TOTAL_GROSS_USDC.toString());
    const agg = byId(e, "financial.inflow.aggregate");
    check("fin: aggregate EXACT bigint sum of the FOUR components (string, READ_ONLY_PROOF)", agg?.value === INFLOW_AGGREGATE.toString() && agg?.valueType === "string" && agg?.lifecycle === "READ_ONLY_PROOF" && agg?.sourceType === "LIVE_CHAIN_RPC");
    check("fin: aggregate note pins four-engine scope + founder-test provenance (never external customer revenue)", (agg?.note ?? "").includes("V1 + V2a + V2b + V3") && (agg?.note ?? "").includes("founder test transactions") && (agg?.note ?? "").includes("never external customer revenue"));
    check("fin: vault USDC balance EXACT decimal string (stablecoin role)", byId(e, "financial.vault.usdcBalance")?.value === VAULT_USDC_BAL.toString() && byId(e, "financial.vault.usdcBalance")?.contractRole === "stablecoin");
    check("fin: vault note pins 70/20/10 routed split + current-balance ≠ cumulative-inflow honesty", (byId(e, "financial.vault.usdcBalance")?.note ?? "").includes("70/20/10") && (byId(e, "financial.vault.usdcBalance")?.note ?? "").includes("not cumulative inflow"));
    check("fin: ops wallet USDC balance EXACT decimal string (stablecoin role, distinct from vault)", byId(e, "financial.ops.usdcBalance")?.value === OPS_USDC_BAL.toString() && byId(e, "financial.ops.usdcBalance")?.contractRole === "stablecoin" && OPS_USDC_BAL !== VAULT_USDC_BAL);
    check("fin: ops note pins the 70/20/10 routed-split reconciliation purpose", (byId(e, "financial.ops.usdcBalance")?.note ?? "").includes("70/20/10"));
    const burned = byId(e, "financial.burn.synBalance");
    check("fin: burned SYN EXACT decimal string ABOVE MAX_SAFE_INTEGER (token role)", burned?.value === BURNED_SYN.toString() && burned?.valueType === "string" && burned?.contractRole === "token");
    check("fin: burned SYN is the TRANSPORT figure, never a stored ceremony constant", burned?.value !== STALE_CANON_BURN.toString() && !JSON.stringify(e).includes(STALE_CANON_BURN.toString()));
    check("fin: LP reserves oriented via token0 (SYN=reserve0, USDC=reserve1, lp-pair role)", byId(e, "financial.lp.reserveSyn")?.value === LP_RESERVE0.toString() && byId(e, "financial.lp.reserveUsdc")?.value === LP_RESERVE1.toString() && byId(e, "financial.lp.reserveSyn")?.contractRole === "lp-pair");
    check("fin: memberCount EXACT count string (sale role, count only)", byId(e, "financial.members.memberCount")?.value === MEMBER_COUNT_FIX.toString() && byId(e, "financial.members.memberCount")?.contractRole === "sale");
    check("fin: genesisOffset EXACT count string (sale role, reconciled freeze base = FREEZE_ROOT_COUNT)", byId(e, "financial.members.genesisOffset")?.value === GENESIS_OFFSET_FIX.toString() && byId(e, "financial.members.genesisOffset")?.contractRole === "sale");
    // Tokenomics live reads (Slice 2.2): SYN totalSupply + 7 allocation balances.
    const supply = byId(e, "financial.token.synTotalSupply");
    check("fin: SYN totalSupply EXACT decimal string ABOVE MAX_SAFE_INTEGER (token role, LIVE_CHAIN_RPC, MEDIUM, READ_ONLY_PROOF)", supply?.value === SYN_TOTAL_SUPPLY_FIX.toString() && supply?.valueType === "string" && supply?.contractRole === "token" && supply?.sourceType === "LIVE_CHAIN_RPC" && supply?.confidence === "MEDIUM" && supply?.lifecycle === "READ_ONLY_PROOF");
    check("fin: SYN totalSupply is the TRANSPORT figure, never a canon constant", supply?.value !== null && supply?.sourceType !== "SERVER_SIDE_CANON");
    for (const w of FINANCIAL_TARGETS.allocationWallets) {
      const it = byId(e, `financial.distribution.${w.key}.balance`);
      check(`fin: allocation ${w.key} balance EXACT decimal string (token role, LIVE_CHAIN_RPC, MEDIUM, READ_ONLY_PROOF)`, it?.value === ALLOC_BALANCES[w.key].toString() && it?.valueType === "string" && it?.contractRole === "token" && it?.sourceType === "LIVE_CHAIN_RPC" && it?.confidence === "MEDIUM" && it?.lifecycle === "READ_ONLY_PROOF");
    }
    check("fin: every allocation balance is distinct (per-wallet calldata disambiguated, never one constant)", new Set(FINANCIAL_TARGETS.allocationWallets.map((w) => byId(e, `financial.distribution.${w.key}.balance`)?.value)).size === FINANCIAL_TARGETS.allocationWallets.length);
    check("fin: no allocation item leaks a full address in note/sourceRef", FINANCIAL_TARGETS.allocationWallets.every((w) => { const it = byId(e, `financial.distribution.${w.key}.balance`); return it !== undefined && !FULL_ADDRESS_RE.test(it.note) && !FULL_ADDRESS_RE.test(it.sourceRef); }));
    const regLive = byId(e, "financial.referral.registryLive");
    check("fin: referral registryLive true (CANON_RECONCILED_RPC, HIGH, source-registry)", regLive?.value === true && regLive?.sourceType === "CANON_RECONCILED_RPC" && regLive?.confidence === "HIGH" && regLive?.contractRole === "source-registry");
    check("fin: referral note reports per-source views only, no invented global flag", (regLive?.note ?? "").includes("per-source views") && (regLive?.note ?? "").includes("none is reported or invented"));
    // Attribution ACTIVITY COUNT — served from the static hash-pinned snapshot,
    // NEVER from the transport (no RPC method exists for an unbounded scan).
    const attr = byId(e, "financial.referral.attributionActivity");
    check("fin: attribution count equals the pinned snapshot totalEvents (string, INDEXED_CHAIN_SCAN)", attr?.value === String(REFERRAL_ATTRIBUTION_SNAPSHOT.totalEvents) && attr?.valueType === "string" && attr?.sourceType === "INDEXED_CHAIN_SCAN" && attr?.contractRole === "source-registry");
    check("fin: attribution confidence MEDIUM + READ_ONLY_PROOF (snapshot verified)", attr?.confidence === "MEDIUM" && attr?.lifecycle === "READ_ONLY_PROOF" && attr?.failureReason === null);
    check("fin: attribution note pins ACTIVITY-COUNT-not-USDC + no-commission-ever + router-not-deployed", (attr?.note ?? "").includes("ACTIVITY COUNT only, never a USDC or commission figure") && (attr?.note ?? "").includes("No commission has ever been paid") && (attr?.note ?? "").includes("CommissionRouterV1 is not deployed"));
    check("fin: attribution note pins the indexed asOfBlock (honest freshness)", (attr?.note ?? "").includes(`as of block ${REFERRAL_ATTRIBUTION_SNAPSHOT.asOfBlock}`));
    check("fin: attribution sourceRef carries the snapshot hash pin (truncated)", (attr?.sourceRef ?? "").includes(REFERRAL_ATTRIBUTION_SNAPSHOT.snapshotHash.slice(0, 18)));
    check("fin: snapshot internal consistency (byEvent + other == totalEvents, VERIFIED, chain 43114)", Object.values(REFERRAL_ATTRIBUTION_SNAPSHOT.byEvent).reduce((a, b) => a + b, 0) + REFERRAL_ATTRIBUTION_SNAPSHOT.otherEventCount === REFERRAL_ATTRIBUTION_SNAPSHOT.totalEvents && REFERRAL_ATTRIBUTION_SNAPSHOT.status === "VERIFIED" && REFERRAL_ATTRIBUTION_SNAPSHOT.chainId === 43114);
    // balanceOf calldata discipline: exactly 3 reads, each addressed to the
    // right token AND encoding the right wallet argument.
    const vaultCall = balanceOfCalls.find((c) => c.to === USDC_ADDR && c.data === encodeAddressArg(SELECTOR_BALANCE_OF, FINANCIAL_TARGETS.vaultWallet));
    const opsCall = balanceOfCalls.find((c) => c.to === USDC_ADDR && c.data === encodeAddressArg(SELECTOR_BALANCE_OF, FINANCIAL_TARGETS.operationsWallet));
    const burnCall = balanceOfCalls.find((c) => c.to === SYN_ADDR && c.data === encodeAddressArg(SELECTOR_BALANCE_OF, FINANCIAL_TARGETS.synBurnAddress));
    const allocCalls = FINANCIAL_TARGETS.allocationWallets.map((w) =>
      balanceOfCalls.find((c) => c.to === SYN_ADDR && c.data === encodeAddressArg(SELECTOR_BALANCE_OF, w.address)),
    );
    check("fin: exactly 10 balanceOf reads (vault + ops on USDC; burn + 7 allocations on SYN)", balanceOfCalls.length === 10 && Boolean(vaultCall) && Boolean(opsCall) && Boolean(burnCall) && allocCalls.every(Boolean));
    check("fin: vault balanceOf calldata encodes the vault wallet", vaultCall?.data === encodeAddressArg(SELECTOR_BALANCE_OF, FINANCIAL_TARGETS.vaultWallet));
    check("fin: ops balanceOf calldata encodes the operations wallet", opsCall?.data === encodeAddressArg(SELECTOR_BALANCE_OF, FINANCIAL_TARGETS.operationsWallet));
    check("fin: burn balanceOf calldata encodes the canonical burn address", burnCall?.data === encodeAddressArg(SELECTOR_BALANCE_OF, FINANCIAL_TARGETS.synBurnAddress));
    check("fin: each of the 7 allocation balanceOf reads targets SYN with its wallet calldata", allocCalls.every((c) => c?.to === SYN_ADDR));
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
    check("unreachable: every CHAIN-READ financial value null + failureReason (no stored fallback)", e.groups.financial.every((i) => i.id === "financial.referral.attributionActivity" || (i.value === null && i.failureReason !== null)));
    check("unreachable: attribution count SURVIVES (static snapshot, honestly labelled INDEXED_CHAIN_SCAN — not a live read)", byId(e, "financial.referral.attributionActivity")?.value === String(REFERRAL_ATTRIBUTION_SNAPSHOT.totalEvents) && byId(e, "financial.referral.attributionActivity")?.sourceType === "INDEXED_CHAIN_SCAN");
    check("unreachable: source registryLinkage null + failureReason, static canon facts survive", byId(e, "source.registryLinkage")?.value === null && byId(e, "source.registryLinkage")?.failureReason !== null && byId(e, "source.creationPolicy")?.value === "OWNER_ONLY" && byId(e, "source.zeroSourceJoin")?.value === true);
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
    check("wrong-chain: contracts/sale/tokens/archive/financial all null (attribution snapshot exempt — its chain identity is pinned inside the snapshot)", [...e.groups.contracts, ...e.groups.sale, ...e.groups.tokens, ...e.groups.archive, ...e.groups.financial].every((i) => i.id === "financial.referral.attributionActivity" || i.value === null));
  }

  // 4) CANON MISMATCH: SYN symbol reads "XXX" → value null, NEVER normalized.
  {
    const { transport } = makeMock({
      call: (to, s, d) => (to.toLowerCase() === SYN_ADDR && s === SELECTOR_SYMBOL ? encString("XXX") : goodCall(to, s, d)),
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
      call: (to, s, d) => (to.toLowerCase() === SYN_ADDR && s === SELECTOR_SYMBOL ? "0x" : goodCall(to, s, d)),
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
      call: (to, s, d) => (s === SELECTOR_GET_ARTIFACT_CORE ? "0x" + word("1") : goodCall(to, s, d)),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    check("shape-drift: archive id1 null + PENDING_ADAPTER + failureReason", byId(e, "archive.artifact.1")?.value === null && byId(e, "archive.artifact.1")?.lifecycle === "PENDING_ADAPTER" && byId(e, "archive.artifact.1")?.failureReason !== null);
    check("shape-drift: archive id1 minted null + PENDING_ADAPTER + failureReason", byId(e, "archive.artifact.1.minted")?.value === null && byId(e, "archive.artifact.1.minted")?.lifecycle === "PENDING_ADAPTER" && byId(e, "archive.artifact.1.minted")?.failureReason !== null);
    check("shape-drift: archive id1 price null + PENDING_ADAPTER + failureReason", byId(e, "archive.artifact.1.price")?.value === null && byId(e, "archive.artifact.1.price")?.lifecycle === "PENDING_ADAPTER" && byId(e, "archive.artifact.1.price")?.failureReason !== null);
  }

  // 7c) CANON/CHAIN CONFIG DISAGREEMENT: configured=false where canon expects
  //     true → minted count withheld too (whole-tuple trust fails closed).
  {
    const { transport } = makeMock({
      call: (to, s, d) => (s === SELECTOR_GET_ARTIFACT_CORE ? encArtifactCore(false, 99n) : goodCall(to, s, d)),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    check("config-mismatch: archive id1 null + PAUSED_BY_PRECAUTION", byId(e, "archive.artifact.1")?.value === null && byId(e, "archive.artifact.1")?.lifecycle === "PAUSED_BY_PRECAUTION");
    check("config-mismatch: archive id1 minted WITHHELD (null + failureReason, never 99)", byId(e, "archive.artifact.1.minted")?.value === null && byId(e, "archive.artifact.1.minted")?.failureReason !== null);
    check("config-mismatch: archive id1 price WITHHELD (null + failureReason)", byId(e, "archive.artifact.1.price")?.value === null && byId(e, "archive.artifact.1.price")?.failureReason !== null);
  }

  // 7b) SALE NUMERIC DECODE FAILURE: V3 availableSyn returns "0x" → null, and
  //     the sibling receiptCount still reads (one bad view never poisons others).
  {
    const { transport } = makeMock({
      call: (to, s, d) => (to.toLowerCase() === V3_ADDR && s === SELECTOR_AVAILABLE_SYN ? "0x" : goodCall(to, s, d)),
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
    check("sale-no-code: financial V3 inflow + memberCount fail closed; aggregate fails closed too", byId(e, "financial.inflow.MEMBERSHIP_SALE_V3")?.value === null && byId(e, "financial.members.memberCount")?.value === null && byId(e, "financial.inflow.aggregate")?.value === null);
    check("sale-no-code: financial siblings on OTHER contracts still read", byId(e, "financial.inflow.MEMBERSHIP_SALE_V2A")?.value === V2A_INFLOW.toString() && byId(e, "financial.burn.synBalance")?.value === BURNED_SYN.toString());
  }

  // 7g) FINANCIAL INFLOW COMPONENT FAILURE: V2a totalUsdcRaised reverts → that
  //     component null, the AGGREGATE fails closed naming the component, and
  //     every sibling financial read survives with its exact figure.
  {
    const { transport } = makeMock({
      call: (to, s, d) =>
        to.toLowerCase() === V2A_FIN_ADDR && s === SELECTOR_TOTAL_USDC_RAISED
          ? "__throw__"
          : goodCall(to, s, d),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    const comp = byId(e, "financial.inflow.MEMBERSHIP_SALE_V2A");
    check("fin-component-fail: V2a inflow null + PENDING_ADAPTER + LOW + failureReason", comp?.value === null && comp?.lifecycle === "PENDING_ADAPTER" && comp?.confidence === "LOW" && comp?.failureReason !== null);
    const agg = byId(e, "financial.inflow.aggregate");
    check("fin-component-fail: aggregate null (NEVER a partial sum) + names the failed component", agg?.value === null && (agg?.failureReason ?? "").includes("MEMBERSHIP_SALE_V2A"));
    check("fin-component-fail: sibling inflows still exact", byId(e, "financial.inflow.MEMBERSHIP_SALE_V2")?.value === V2B_INFLOW.toString() && byId(e, "financial.inflow.MEMBERSHIP_SALE_V3")?.value === V3_TOTAL_GROSS_USDC.toString());
    check("fin-component-fail: vault/burn/lp/members unaffected", byId(e, "financial.vault.usdcBalance")?.value === VAULT_USDC_BAL.toString() && byId(e, "financial.burn.synBalance")?.value === BURNED_SYN.toString() && byId(e, "financial.lp.reserveSyn")?.value === LP_RESERVE0.toString() && byId(e, "financial.members.memberCount")?.value === MEMBER_COUNT_FIX.toString());
    check("fin-component-fail: NO address leak + discipline passes", noAddressLeak(e) && disciplinePasses(e));
  }

  // 7h) LP ORIENTATION FLIP: token0 = USDC → reserves swap deterministically.
  {
    const { transport } = makeMock({
      call: (to, s, d) =>
        to.toLowerCase() === LP_ADDR && s === SELECTOR_TOKEN0
          ? "0x" + word(USDC_ADDR.slice(2))
          : goodCall(to, s, d),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    check("fin-orient-flip: token0=USDC → reserveUsdc=reserve0, reserveSyn=reserve1", byId(e, "financial.lp.reserveUsdc")?.value === LP_RESERVE0.toString() && byId(e, "financial.lp.reserveSyn")?.value === LP_RESERVE1.toString());
  }

  // 7i) LP ORIENTATION FAILURE: token0 matches NEITHER canon token → BOTH
  //     reserves fail closed (never guessed), no leak, siblings survive.
  {
    const { transport } = makeMock({
      call: (to, s, d) =>
        to.toLowerCase() === LP_ADDR && s === SELECTOR_TOKEN0
          ? "0x" + word("00000000000000000000000000000000000000aa")
          : goodCall(to, s, d),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    const syn = byId(e, "financial.lp.reserveSyn");
    const usdcR = byId(e, "financial.lp.reserveUsdc");
    check("fin-orient-fail: BOTH reserves null + LOW + PAUSED_BY_PRECAUTION + failureReason", syn?.value === null && usdcR?.value === null && syn?.confidence === "LOW" && syn?.lifecycle === "PAUSED_BY_PRECAUTION" && syn?.failureReason !== null && usdcR?.failureReason !== null);
    check("fin-orient-fail: failureReason never echoes the read address", !FULL_ADDRESS_RE.test(syn?.failureReason ?? "") && noAddressLeak(e) && disciplinePasses(e));
    check("fin-orient-fail: sibling financial reads survive", byId(e, "financial.burn.synBalance")?.value === BURNED_SYN.toString() && byId(e, "financial.inflow.aggregate")?.value === INFLOW_AGGREGATE.toString());
  }

  // 7e) SOURCE LINKAGE MISMATCH: SOURCE_REGISTRY() resolves to a DIFFERENT
  //     address → value null (NEVER normalized), failureReason set, no leak.
  {
    const wrongAddr = "00000000000000000000000000000000000000ff";
    const { transport } = makeMock({
      call: (to, s, d) =>
        to.toLowerCase() === V3_ADDR && s === SELECTOR_SOURCE_REGISTRY
          ? "0x" + word(wrongAddr)
          : goodCall(to, s, d),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    const linkage = byId(e, "source.registryLinkage");
    check("source-mismatch: registryLinkage null (NOT normalized) + LOW + PAUSED_BY_PRECAUTION + failureReason", linkage?.value === null && linkage?.confidence === "LOW" && linkage?.lifecycle === "PAUSED_BY_PRECAUTION" && linkage?.failureReason !== null);
    check("source-mismatch: NO address leak + discipline passes", noAddressLeak(e) && disciplinePasses(e));
  }

  // 7f) SOURCE LINKAGE DECODE FAILURE: SOURCE_REGISTRY() returns "0x" → null.
  {
    const { transport } = makeMock({
      call: (to, s, d) =>
        to.toLowerCase() === V3_ADDR && s === SELECTOR_SOURCE_REGISTRY ? "0x" : goodCall(to, s, d),
    });
    const e = await buildProtocolReality(baseOpts(transport));
    const linkage = byId(e, "source.registryLinkage");
    check("source-decode-fail: registryLinkage null + PENDING_ADAPTER + LOW + failureReason", linkage?.value === null && linkage?.lifecycle === "PENDING_ADAPTER" && linkage?.confidence === "LOW" && linkage?.failureReason !== null);
  }

  // 7d) SERVED CACHE DISCIPLINE (pre-publish hardening): getProtocolReality is
  //     the served path — bounded TTL, success-only caching, coalescing, and
  //     honest freshness metadata (asOf / cached / cacheTtlMs).
  {
    __resetProtocolRealityCache();
    const first = makeMock({});
    const e1 = await getProtocolReality(baseOpts(first.transport));
    check(
      "cache: first read is fresh (cached false, cacheTtlMs 30000, asOf parseable)",
      e1.cached === false && e1.cacheTtlMs === 30_000 && !Number.isNaN(Date.parse(e1.asOf)),
    );
    const callsAfterFirst = first.methods.length;
    const e2 = await getProtocolReality(baseOpts(first.transport));
    check(
      "cache: second read within TTL is served from cache (cached true, same asOf, NO new RPC)",
      e2.cached === true && e2.asOf === e1.asOf && first.methods.length === callsAfterFirst,
    );
    check(
      "cache: cached envelope keeps discipline + no address leak",
      noAddressLeak(e2) && disciplinePasses(e2),
    );

    // Coalescing: two concurrent callers share ONE build.
    __resetProtocolRealityCache();
    const co = makeMock({});
    const [c1, c2] = await Promise.all([
      getProtocolReality(baseOpts(co.transport)),
      getProtocolReality(baseOpts(co.transport)),
    ]);
    check(
      "cache: concurrent reads coalesce onto ONE build (single eth_chainId)",
      co.methods.filter((m) => m === "eth_chainId").length === 1 &&
        c1.cached === false &&
        c2.cached === false,
    );

    // Stale-while-revalidate: an expired-TTL read with a verified entry is
    // served INSTANTLY from cache while ONE coalesced refresh runs in the
    // background; the refreshed entry is pinned for subsequent reads.
    __resetProtocolRealityCache();
    const swr = makeMock({});
    const s1 = await getProtocolReality(baseOpts(swr.transport)); // pin verified entry
    const swrCallsBefore = swr.methods.filter((m) => m === "eth_chainId").length;
    const s2 = await getProtocolReality({ ...baseOpts(swr.transport), ttlMs: 0 });
    check(
      "cache: SWR serves stale instantly (cached true, same asOf as the pinned entry)",
      s2.cached === true && s2.asOf === s1.asOf,
    );
    await __getProtocolRealityInFlight();
    const s3 = await getProtocolReality(baseOpts(swr.transport));
    check(
      "cache: SWR background refresh ran ONE build + repinned a verified entry (served from cache)",
      s3.cached === true &&
        byId(s3, "chain.identityVerified")?.value === true &&
        swr.methods.filter((m) => m === "eth_chainId").length === swrCallsBefore + 1,
    );

    // SWR fail-closed: a DEGRADED background refresh never overwrites the
    // verified entry — the stale verified truth keeps serving (bounded age).
    __resetProtocolRealityCache();
    const swrBadBg = makeMock({});
    const g1 = await getProtocolReality(baseOpts(swrBadBg.transport)); // verified entry
    const badBg = makeMock({ chainId: "__unreachable__" });
    const g2 = await getProtocolReality({ ...baseOpts(badBg.transport), ttlMs: 0 });
    await __getProtocolRealityInFlight();
    // (background degraded build finished — entry must still be g1's)
    const g3 = await getProtocolReality({ ...baseOpts(badBg.transport), ttlMs: 0 });
    check(
      "cache: SWR degraded background refresh NOT pinned — verified stale entry keeps serving",
      g2.cached === true && g3.cached === true && g2.asOf === g1.asOf && g3.asOf === g1.asOf,
    );

    // Hard-stale bound: beyond ttl + maxStale the caller AWAITS a fresh build
    // (bounded age, no forever-stale serving).
    __resetProtocolRealityCache();
    const exp = makeMock({});
    await getProtocolReality({ ...baseOpts(exp.transport), ttlMs: 0, maxStaleMs: 0 });
    const chainCallsBefore = exp.methods.filter((m) => m === "eth_chainId").length;
    const e4 = await getProtocolReality({ ...baseOpts(exp.transport), ttlMs: 0, maxStaleMs: 0 });
    check(
      "cache: hard-stale (beyond ttl+maxStale) refetches (fresh, cached false, one more RPC round)",
      e4.cached === false &&
        exp.methods.filter((m) => m === "eth_chainId").length === chainCallsBefore + 1,
    );

    // Success-only: an UNVERIFIED build (unreachable RPC) is served live but
    // NEVER pinned — the very next read is a fresh verified build.
    __resetProtocolRealityCache();
    const bad = makeMock({ chainId: "__unreachable__" });
    const eBad = await getProtocolReality(baseOpts(bad.transport));
    check(
      "cache: degraded read served live (cached false, fail-closed nulls)",
      eBad.cached === false && eBad.groups.contracts.every((i) => i.value === null),
    );
    const recover = makeMock({});
    const eRec = await getProtocolReality(baseOpts(recover.transport));
    check(
      "cache: degraded read NOT cached — next read is a FRESH verified build",
      eRec.cached === false && byId(eRec, "chain.identityVerified")?.value === true,
    );
    __resetProtocolRealityCache();
  }

  // 8) DISCIPLINE runtime net — enforcement LIFTED by founder decision 2026-07-11
  //    (ADR-003 amendment; reversible via DISCIPLINE_ENFORCED in payloadDiscipline.ts).
  //    The runtime net no longer throws on a doctored address / framing payload, so
  //    the former "…THROWS" positive controls no longer describe intended behavior.
  //    The REAL protection against a served address leak is unaffected: every built
  //    envelope's no-address-leak invariant is still verified INDEPENDENTLY above
  //    (happy / unreachable / fin-* "NO address leak" checks via FULL_ADDRESS_RE).
  //    This control asserts the CURRENT no-op contract; if DISCIPLINE_ENFORCED is
  //    flipped back on, this goes RED — restore the THROWS controls alongside it.
  {
    const doctoredLeak = { groups: { chain: [{ note: "see 0x1234567890abcdef1234567890abcdef12345678" }] } };
    const doctoredFraming = { note: "guaranteed profit and yield for everyone" };
    let liftedNoThrow = true;
    try {
      assertProtocolRealityDiscipline(doctoredLeak);
      assertProtocolRealityDiscipline(doctoredFraming);
    } catch {
      liftedNoThrow = false;
    }
    check(
      "discipline: runtime net lifted (founder 2026-07-11) — no throw; envelope leak still verified independently",
      liftedNoThrow,
    );
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
