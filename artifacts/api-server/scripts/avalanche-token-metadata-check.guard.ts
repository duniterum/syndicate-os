/**
 * Guard for the Internal Avalanche Token-Metadata + Contract-Posture Check — Slice 2.13
 * ------------------------------------------------------------------------------------
 * Dependency-free runtime guard (mirrors the Slice 2.11 guard) that uses INJECTED
 * MOCK transports — it never touches the network. It proves the safety invariants
 * the founder requires:
 *   - eth_chainId is the FIRST call; eth_getCode is NEVER called unless
 *     chainId === 43114 (wrong/garbage chain and unreachable RPC fail closed).
 *   - eth_call (metadata) is NEVER made unless chainId is verified AND the token
 *     contract has code.
 *   - ONLY the 3 approved selectors are ever used: name(), symbol(), decimals().
 *     (Proves no totalSupply/balanceOf/allowance/event/log read.)
 *   - A decode failure returns an explicit error + null field — never fake data.
 *   - Canon mismatches are reported (unexpected=true) and NOT normalized; tokens
 *     without canon (USDC) are reported as-is and never flagged unexpected.
 *   - No full 0x[40-hex] address, no target address, and no address field leak
 *     into the serialized output. No PII / Supa / forbidden financial framing.
 *   - The short in-memory cache + request coalescing behave correctly.
 *   - Real canon selection yields exactly SYN + USDC by safe key.
 *
 * Run:  pnpm --filter @workspace/api-server run token-metadata:guard
 * Exit: 0 if every check passes, 1 otherwise.
 */

import { FULL_ADDRESS_RE, EXPECTED_CHAIN_ID, EXPECTED_CHAIN_ID_HEX, type RpcTransport } from "./avalanche-live-read-check";
import {
  runTokenMetadataCheck,
  getTokenMetadataCheck,
  __resetTokenMetadataCache,
  selectTokenTargets,
  canonExpectations,
  decodeAbiString,
  decodeUint8,
  APPROVED_SELECTORS,
  SELECTOR_NAME,
  SELECTOR_SYMBOL,
  SELECTOR_DECIMALS,
  type TokenTarget,
  type TokenExpectation,
} from "./avalanche-token-metadata-check";

// ── tiny check harness ───────────────────────────────────────────────────────
type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];
function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
}
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── ABI mock encoders (produce valid return data for the decoders) ────────────
function encString(s: string): string {
  const buf = Buffer.from(s, "utf8");
  const offset = (32).toString(16).padStart(64, "0");
  const lenWord = buf.length.toString(16).padStart(64, "0");
  const contentHex = buf.toString("hex");
  const padded = contentHex + "0".repeat((64 - (contentHex.length % 64)) % 64);
  return "0x" + offset + lenWord + padded;
}
function encUint(n: number): string {
  return "0x" + n.toString(16).padStart(64, "0");
}

// Fake (clearly non-real) addresses for output-leak tests.
const ADDR_SYN = "0x1111111111111111111111111111111111111111";
const ADDR_USDC = "0x2222222222222222222222222222222222222222";
const TARGETS: TokenTarget[] = [
  { key: "SYN", address: ADDR_SYN },
  { key: "USDC", address: ADDR_USDC },
];
const EXP: Record<string, TokenExpectation> = { SYN: { symbol: "SYN", decimals: 18 } };

// Forbidden output content (same spirit as the Slice 2.11 guard).
const FORBIDDEN_SUBSTRINGS = [
  "guaranteed profit",
  "guaranteed return",
  "passive income",
  "payout",
  "jackpot",
  "betting",
  "wager",
  "reward farming",
  "liquidity mining",
  "buy for upside",
  "casino",
  "fake live",
  "airdrop",
  "supa",
];
const FORBIDDEN_PATTERNS = [/\broi\b/i, /\byield/i, /\bprofit\b/i];

type MockOpts = {
  chainId?: string | "__throw__";
  getCode?: (addr: string) => string | "__throw__";
  call?: (addr: string, selector: string) => string | "__throw__";
};
function makeMock(o: MockOpts): {
  transport: RpcTransport;
  calls: string[];
  callDetails: { selector: string; to: string }[];
} {
  const calls: string[] = [];
  const callDetails: { selector: string; to: string }[] = [];
  const transport: RpcTransport = async (method, params) => {
    calls.push(method);
    if (method === "eth_chainId") {
      if (o.chainId === "__throw__") throw new Error("rpc down");
      return o.chainId;
    }
    if (method === "eth_getCode") {
      const addr = params[0] as string;
      const r = o.getCode?.(addr);
      if (r === "__throw__") throw new Error("getCode failure");
      return r;
    }
    if (method === "eth_call") {
      const p = params[0] as { to: string; data: string };
      callDetails.push({ selector: p.data, to: p.to });
      const r = o.call?.(p.to, p.data);
      if (r === "__throw__") throw new Error("call failure");
      return r;
    }
    // Any non-approved RPC method is itself a violation.
    throw new Error("UNEXPECTED_METHOD:" + method);
  };
  return { transport, calls, callDetails };
}

// A "good" eth_call responder: SYN = (The Syndicate / SYN / 18), USDC = (USD Coin / USDC / 6).
function goodCall(addr: string, selector: string): string {
  const isSyn = addr.toLowerCase() === ADDR_SYN;
  if (selector === SELECTOR_NAME) return encString(isSyn ? "The Syndicate" : "USD Coin");
  if (selector === SELECTOR_SYMBOL) return encString(isSyn ? "SYN" : "USDC");
  if (selector === SELECTOR_DECIMALS) return encUint(isSyn ? 18 : 6);
  return "0x";
}

async function run(): Promise<void> {
  // 1) WRONG CHAIN (Ethereum mainnet 0x1) fails closed before getCode/eth_call.
  {
    const { transport, calls } = makeMock({ chainId: "0x1", getCode: () => "0x60", call: goodCall });
    const r = await runTokenMetadataCheck({ transport, targets: TARGETS, expectations: EXP });
    check("wrong-chain: chainIdActual === 1", r.chainIdActual === 1, String(r.chainIdActual));
    check("wrong-chain: chainIdOk false / wrongChain true", r.chainIdOk === false && r.wrongChain === true);
    check("wrong-chain: tokensChecked === 0", r.tokensChecked === 0, String(r.tokensChecked));
    check("wrong-chain: eth_getCode NEVER called", !calls.includes("eth_getCode"));
    check("wrong-chain: eth_call NEVER called", !calls.includes("eth_call"));
    check("wrong-chain: eth_chainId is the FIRST call", calls[0] === "eth_chainId", calls[0]);
  }

  // 2) CORRECT CHAIN happy path: chainId→getCode→eth_call ordering + correct decode.
  {
    const { transport, calls, callDetails } = makeMock({
      chainId: "0xa86a",
      getCode: () => "0x60806040",
      call: goodCall,
    });
    const r = await runTokenMetadataCheck({ transport, targets: TARGETS, expectations: EXP });
    const firstGetCode = calls.indexOf("eth_getCode");
    const firstCall = calls.indexOf("eth_call");
    check("avax: eth_chainId is the FIRST call", calls[0] === "eth_chainId", calls[0]);
    check("avax: chainId verified BEFORE any eth_getCode", firstGetCode > 0 && calls.slice(0, firstGetCode).includes("eth_chainId"));
    check("avax: eth_getCode BEFORE any eth_call", firstCall === -1 || (firstGetCode !== -1 && firstGetCode < firstCall));
    check("avax: chainIdActual 43114 / hex short", r.chainIdActual === EXPECTED_CHAIN_ID && r.chainIdActualHex === EXPECTED_CHAIN_ID_HEX);
    check("avax: tokensChecked === 2 / tokensReadable === 2", r.tokensChecked === 2 && r.tokensReadable === 2);
    const syn = r.checks.find((c) => c.key === "SYN");
    const usdc = r.checks.find((c) => c.key === "USDC");
    check("avax: SYN name/symbol/decimals decoded", syn?.name === "The Syndicate" && syn?.symbol === "SYN" && syn?.decimals === 18);
    check("avax: USDC name/symbol/decimals decoded", usdc?.name === "USD Coin" && usdc?.symbol === "USDC" && usdc?.decimals === 6);
    check("avax: SYN matches canon (unexpected false, no error)", syn?.unexpected === false && syn?.error === null);
    check("avax: USDC has NO canon expectation (expected null, unexpected false)", usdc?.expected === null && usdc?.unexpected === false);
    // Only approved selectors, ever.
    check(
      "avax: ONLY approved selectors used (name/symbol/decimals)",
      callDetails.every((d) => APPROVED_SELECTORS.has(d.selector)),
      [...new Set(callDetails.map((d) => d.selector))].join(","),
    );
    check(
      "avax: exactly 3 metadata calls per token (6 total)",
      callDetails.length === 6,
      String(callDetails.length),
    );
  }

  // 3) MISSING CODE: metadata eth_call is NOT made for the code-less token.
  {
    const { transport, callDetails } = makeMock({
      chainId: "0xa86a",
      getCode: (addr) => (addr.toLowerCase() === ADDR_SYN ? "0x" : "0x60806040"),
      call: goodCall,
    });
    const r = await runTokenMetadataCheck({ transport, targets: TARGETS, expectations: EXP });
    const syn = r.checks.find((c) => c.key === "SYN");
    check("no-code: SYN hasCode false / metadataReadable false", syn?.hasCode === false && syn?.metadataReadable === false);
    check("no-code: SYN error NO_CODE, fields null", syn?.error === "NO_CODE" && syn?.name === null && syn?.symbol === null && syn?.decimals === null);
    check("no-code: NO eth_call made to the code-less SYN address", callDetails.every((d) => d.to.toLowerCase() !== ADDR_SYN));
    check("no-code: USDC still read (3 calls to USDC only)", callDetails.length === 3 && callDetails.every((d) => d.to.toLowerCase() === ADDR_USDC));
  }

  // 4) RPC UNAVAILABLE: explicit unavailable, no getCode/no eth_call, no fake metadata.
  {
    const { transport, calls } = makeMock({ chainId: "__throw__", getCode: () => "0x60", call: goodCall });
    const r = await runTokenMetadataCheck({ transport, targets: TARGETS, expectations: EXP });
    check("rpc-fail: rpcReachable false / chainIdActual null", r.rpcReachable === false && r.chainIdActual === null);
    check("rpc-fail: chainIdOk false / wrongChain false (unknown, not wrong)", r.chainIdOk === false && r.wrongChain === false);
    check("rpc-fail: tokensChecked === 0", r.tokensChecked === 0);
    check("rpc-fail: eth_getCode + eth_call NEVER called", !calls.includes("eth_getCode") && !calls.includes("eth_call"));
    check("rpc-fail: no fabricated metadata", r.checks.length === 0);
  }

  // 5) DECODE FAILURE: explicit error, null field, never fabricated.
  {
    const { transport } = makeMock({
      chainId: "0xa86a",
      getCode: () => "0x60806040",
      call: (addr, selector) => {
        if (addr.toLowerCase() === ADDR_SYN && selector === SELECTOR_SYMBOL) return "0x"; // empty → decode fail
        return goodCall(addr, selector);
      },
    });
    const r = await runTokenMetadataCheck({ transport, targets: TARGETS, expectations: EXP });
    const syn = r.checks.find((c) => c.key === "SYN");
    check("decode-fail: SYN symbol null (not fabricated)", syn?.symbol === null);
    check("decode-fail: SYN metadataReadable false", syn?.metadataReadable === false);
    check("decode-fail: SYN explicit decode error", typeof syn?.error === "string" && syn!.error!.startsWith("METADATA_DECODE_FAILED") && syn!.error!.includes("symbol"));
    check("decode-fail: SYN name + decimals still decoded", syn?.name === "The Syndicate" && syn?.decimals === 18);
  }

  // 6) MISMATCH: canon contradiction is reported (unexpected), values NOT normalized.
  {
    const { transport } = makeMock({
      chainId: "0xa86a",
      getCode: () => "0x60806040",
      call: (addr, selector) => {
        if (addr.toLowerCase() === ADDR_SYN) {
          if (selector === SELECTOR_NAME) return encString("Imposter");
          if (selector === SELECTOR_SYMBOL) return encString("XYZ"); // != canon SYN
          if (selector === SELECTOR_DECIMALS) return encUint(9); // != canon 18
        }
        return goodCall(addr, selector);
      },
    });
    const r = await runTokenMetadataCheck({ transport, targets: TARGETS, expectations: EXP });
    const syn = r.checks.find((c) => c.key === "SYN");
    check("mismatch: SYN unexpected true", syn?.unexpected === true);
    check("mismatch: SYN reports BOTH symbol + decimals mismatch", (syn?.mismatches.length ?? 0) === 2, (syn?.mismatches ?? []).join(" | "));
    check("mismatch: SYN values reported AS-READ (not normalized)", syn?.symbol === "XYZ" && syn?.decimals === 9);
    check("mismatch: SYN error METADATA_UNEXPECTED", syn?.error === "METADATA_UNEXPECTED");
  }

  // 7) USDC with surprising decimals but NO canon → reported as-is, never unexpected.
  {
    const { transport } = makeMock({
      chainId: "0xa86a",
      getCode: () => "0x60806040",
      call: (addr, selector) => {
        if (addr.toLowerCase() === ADDR_USDC && selector === SELECTOR_DECIMALS) return encUint(2);
        return goodCall(addr, selector);
      },
    });
    const r = await runTokenMetadataCheck({ transport, targets: TARGETS, expectations: EXP });
    const usdc = r.checks.find((c) => c.key === "USDC");
    check("usdc-no-canon: decimals reported as-read (2)", usdc?.decimals === 2);
    check("usdc-no-canon: unexpected false (no canon to contradict)", usdc?.unexpected === false && usdc?.mismatches.length === 0);
  }

  // 8) OUTPUT LEAK SCAN: no full address, no target address, no address field.
  {
    const { transport } = makeMock({ chainId: "0xa86a", getCode: () => "0x60806040", call: goodCall });
    const r = await runTokenMetadataCheck({ transport, targets: TARGETS, expectations: EXP });
    const serialized = JSON.stringify(r);
    check("leak: no full 0x[40-hex] address in output", !FULL_ADDRESS_RE.test(serialized));
    check("leak: no target address string in output", !serialized.includes(ADDR_SYN) && !serialized.includes(ADDR_USDC));
    check("leak: no entry carries an address/explorerUrl field", r.checks.every((c) => !("address" in c) && !("explorerUrl" in c)));
    check("leak: chainIdActualHex is the short chain hex only", r.chainIdActualHex === EXPECTED_CHAIN_ID_HEX);
  }

  // 9) FRAMING / PII SCAN of serialized output.
  {
    const { transport } = makeMock({ chainId: "0xa86a", getCode: () => "0x60806040", call: goodCall });
    const r = await runTokenMetadataCheck({ transport, targets: TARGETS, expectations: EXP });
    const lower = JSON.stringify(r).toLowerCase();
    const subHit = FORBIDDEN_SUBSTRINGS.filter((s) => lower.includes(s));
    check("framing: no forbidden substrings (incl. supa)", subHit.length === 0, subHit.join(","));
    const patHit = FORBIDDEN_PATTERNS.filter((re) => re.test(JSON.stringify(r)));
    check("framing: no ROI/yield/profit framing", patHit.length === 0, patHit.map(String).join(","));
    // No financial-amount fields should ever be present.
    const banned = ["totalSupply", "balance", "supply", "price", "reserve", "allowance", "holders", "members"];
    const fieldHit = banned.filter((b) => lower.includes(b.toLowerCase()));
    check("framing: no balance/supply/price/holder/member fields", fieldHit.length === 0, fieldHit.join(","));
  }

  // 10) DECODER UNIT TESTS (pure).
  {
    check("decode: dynamic string round-trip", decodeAbiString(encString("The Syndicate")) === "The Syndicate");
    check("decode: dynamic string (USD Coin)", decodeAbiString(encString("USD Coin")) === "USD Coin");
    check("decode: empty 0x → null", decodeAbiString("0x") === null);
    check("decode: garbage hex → null", decodeAbiString("0xZZ") === null);
    const bytes32 = "0x53594e0000000000000000000000000000000000000000000000000000000000"; // "SYN" padded
    check("decode: bytes32 fallback (SYN)", decodeAbiString(bytes32) === "SYN");
    check("decode: uint8 18", decodeUint8(encUint(18)) === 18);
    check("decode: uint8 6", decodeUint8(encUint(6)) === 6);
    check("decode: uint8 > 255 → null", decodeUint8(encUint(300)) === null);
    check("decode: uint8 wrong width → null", decodeUint8("0x12") === null);
  }

  // 11) DECIMALS OUT OF RANGE via the full path → explicit error, null decimals.
  {
    const { transport } = makeMock({
      chainId: "0xa86a",
      getCode: () => "0x60806040",
      call: (addr, selector) => {
        if (addr.toLowerCase() === ADDR_SYN && selector === SELECTOR_DECIMALS) return encUint(300);
        return goodCall(addr, selector);
      },
    });
    const r = await runTokenMetadataCheck({ transport, targets: TARGETS, expectations: EXP });
    const syn = r.checks.find((c) => c.key === "SYN");
    check("decimals-range: SYN decimals null (rejected >255)", syn?.decimals === null);
    check("decimals-range: SYN explicit decode error includes decimals", typeof syn?.error === "string" && syn!.error!.includes("decimals"));
  }

  // 12) REAL canon selection + expectations.
  {
    const targets = selectTokenTargets();
    const keys = targets.map((t) => t.key);
    check("canon: selects exactly SYN + USDC", keys.length === 2 && keys.includes("SYN") && keys.includes("USDC"), keys.join(","));
    check("canon: every selected target has a full 0x[40] address (internal only)", targets.every((t) => /^0x[0-9a-fA-F]{40}$/.test(t.address)));
    const exp = canonExpectations();
    check("canon: SYN expectation present (symbol SYN, decimals 18)", exp["SYN"]?.symbol === "SYN" && exp["SYN"]?.decimals === 18);
    check("canon: USDC has NO expectation (report actual, no new canon)", !("USDC" in exp));
  }

  // 13) CACHE + COALESCING: concurrent runs share one chainId; next run cached.
  {
    __resetTokenMetadataCache();
    let chainIdCalls = 0;
    const slow: RpcTransport = async (method, params) => {
      if (method === "eth_chainId") {
        chainIdCalls += 1;
        await delay(20);
        return "0xa86a";
      }
      if (method === "eth_getCode") return "0x60806040";
      if (method === "eth_call") {
        const p = params[0] as { to: string; data: string };
        return goodCall(p.to, p.data);
      }
      throw new Error("UNEXPECTED_METHOD:" + method);
    };
    const [a, b] = await Promise.all([
      getTokenMetadataCheck({ transport: slow, targets: TARGETS, expectations: EXP }),
      getTokenMetadataCheck({ transport: slow, targets: TARGETS, expectations: EXP }),
    ]);
    check("cache: concurrent runs coalesced to one chainId call", chainIdCalls === 1, String(chainIdCalls));
    check("cache: both concurrent results resolved", Boolean(a) && Boolean(b));
    const c = await getTokenMetadataCheck({ transport: slow, targets: TARGETS, expectations: EXP });
    check("cache: sequential follow-up served from cache", c.cached === true);
    check("cache: cache prevented an extra chainId RPC", chainIdCalls === 1, String(chainIdCalls));
    __resetTokenMetadataCache();
  }

  // ── report ──────────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.ok);
  console.log("\nToken-Metadata Check Guard — Phase 1 Slice 2.13\n" + "=".repeat(50));
  for (const r of results) {
    console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
  }
  console.log("-".repeat(50));
  console.log(`Result: ${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    console.error(`\nGUARD FAILED: ${failed.length} check(s) failed.`);
    process.exit(1);
  }
  console.log("GUARD PASSED: token-metadata safety invariants hold.\n");
}

void run();
