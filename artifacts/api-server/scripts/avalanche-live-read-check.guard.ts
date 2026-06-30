/**
 * Guard for the Internal Avalanche Live-Read Check — Phase 1 Slice 2.11
 * ---------------------------------------------------------------------------
 * Dependency-free runtime guard (mirrors verify-canon-integrity.ts) that uses
 * INJECTED MOCK transports — it never touches the network. It proves the safety
 * invariants the founder requires:
 *   - eth_chainId is the FIRST call, and eth_getCode is NEVER called unless
 *     chainId === 43114 (wrong-chain and garbage-chain both fail closed).
 *   - An RPC failure returns an explicit unavailable state, never a fake success.
 *   - No full 0x[40-hex] address (and no real target address) leaks into the
 *     serialized output, and no check entry carries an address field.
 *   - No PII / Supa / forbidden financial-or-casino framing in the output.
 *   - The real canon selection yields only contract roles (no wallet EOAs).
 *   - The short in-memory cache + request coalescing behave correctly.
 *
 * Run:  pnpm --filter @workspace/api-server run live-read:guard
 * Exit: 0 if every check passes, 1 otherwise.
 */

import {
  runAvalancheLiveReadCheck,
  getLiveReadCheck,
  __resetLiveReadCache,
  selectContractTargets,
  resolveEndpoints,
  FULL_ADDRESS_RE,
  EXPECTED_CHAIN_ID,
  EXPECTED_CHAIN_ID_HEX,
  type RpcTransport,
  type ContractTarget,
} from "./avalanche-live-read-check";

// ── tiny check harness ───────────────────────────────────────────────────────
type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];
function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
}
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Fake (clearly non-real) addresses for output-leak tests.
const EMPTY_ADDR = "0x000000000000000000000000000000000000abcd";
const FAKE_TARGETS: ContractTarget[] = [
  { key: "SYN_TOKEN", address: "0x1111111111111111111111111111111111111111" },
  { key: "USDC", address: "0x2222222222222222222222222222222222222222" },
  { key: "MEMBERSHIP_SALE_V3", address: EMPTY_ADDR },
];

// Forbidden output content (same spirit as verify-canon's payload bans).
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

function recorder(map: Record<string, unknown>): { transport: RpcTransport; calls: string[] } {
  const calls: string[] = [];
  const transport: RpcTransport = async (method, params) => {
    calls.push(method);
    const v = map[method];
    if (typeof v === "function") return (v as (p: unknown[]) => unknown)(params);
    if (v === "__throw__") throw new Error("mock transport failure");
    return v;
  };
  return { transport, calls };
}

async function run(): Promise<void> {
  // 1) WRONG CHAIN (Ethereum mainnet 0x1) fails closed before eth_getCode.
  {
    const { transport, calls } = recorder({ eth_chainId: "0x1", eth_getCode: "0x60016000" });
    const r = await runAvalancheLiveReadCheck({ transport, targets: FAKE_TARGETS });
    check("wrong-chain: chainId parsed as 1", r.chainIdActual === 1, String(r.chainIdActual));
    check("wrong-chain: chainIdOk false", r.chainIdOk === false);
    check("wrong-chain: wrongChain true", r.wrongChain === true);
    check("wrong-chain: contractsChecked === 0", r.contractsChecked === 0, String(r.contractsChecked));
    check("wrong-chain: eth_getCode NEVER called", !calls.includes("eth_getCode"), calls.join(","));
    check("wrong-chain: eth_chainId is the FIRST call", calls[0] === "eth_chainId", calls[0]);
  }

  // 2) CORRECT CHAIN (Avalanche 0xa86a): chainId first, then getCode; counts correct.
  {
    const { transport, calls } = recorder({
      eth_chainId: "0xa86a",
      eth_getCode: (p: unknown[]) =>
        (p[0] as string).toLowerCase() === EMPTY_ADDR ? "0x" : "0x60806040",
    });
    const r = await runAvalancheLiveReadCheck({ transport, targets: FAKE_TARGETS });
    const firstGetCode = calls.indexOf("eth_getCode");
    check("avax: eth_chainId is the FIRST call", calls[0] === "eth_chainId", calls[0]);
    check(
      "avax: chainId verified BEFORE any eth_getCode",
      firstGetCode === -1 || calls.slice(0, firstGetCode).includes("eth_chainId"),
    );
    check("avax: chainIdOk true / wrongChain false", r.chainIdOk === true && r.wrongChain === false);
    check("avax: chainIdActual 43114", r.chainIdActual === EXPECTED_CHAIN_ID, String(r.chainIdActual));
    check("avax: contractsChecked === targets", r.contractsChecked === FAKE_TARGETS.length);
    check("avax: contractsWithCode === 2", r.contractsWithCode === 2, String(r.contractsWithCode));
    check("avax: contractsMissingCode === 1", r.contractsMissingCode === 1, String(r.contractsMissingCode));
    check("avax: counts reconcile", r.contractsWithCode + r.contractsMissingCode === r.contractsChecked);
  }

  // 3) RPC FAILURE: explicit unavailable, never a fabricated success.
  {
    const { transport, calls } = recorder({ eth_chainId: "__throw__" });
    const r = await runAvalancheLiveReadCheck({ transport, targets: FAKE_TARGETS });
    check("rpc-fail: rpcReachable false", r.rpcReachable === false);
    check("rpc-fail: chainIdActual null", r.chainIdActual === null);
    check("rpc-fail: chainIdActualHex null", r.chainIdActualHex === null);
    check("rpc-fail: chainIdOk false", r.chainIdOk === false);
    check("rpc-fail: wrongChain false (unknown, not wrong)", r.wrongChain === false);
    check("rpc-fail: contractsChecked === 0", r.contractsChecked === 0);
    check("rpc-fail: eth_getCode NEVER called", !calls.includes("eth_getCode"));
    check("rpc-fail: no fabricated deployed:true", r.checks.every((c) => c.deployed === false));
  }

  // 4) GARBAGE chainId (reachable but unparseable) → fail closed, no getCode.
  {
    const { transport, calls } = recorder({ eth_chainId: "not-hex", eth_getCode: "0x60" });
    const r = await runAvalancheLiveReadCheck({ transport, targets: FAKE_TARGETS });
    check("garbage-chain: rpcReachable true (got a response)", r.rpcReachable === true);
    check("garbage-chain: chainIdActual null", r.chainIdActual === null);
    check("garbage-chain: chainIdOk false", r.chainIdOk === false);
    check("garbage-chain: contractsChecked === 0", r.contractsChecked === 0);
    check("garbage-chain: eth_getCode NEVER called", !calls.includes("eth_getCode"));
  }

  // 5) OUTPUT LEAK SCAN: no full address, no target address, no address field.
  {
    const { transport } = recorder({
      eth_chainId: "0xa86a",
      eth_getCode: (p: unknown[]) =>
        (p[0] as string).toLowerCase() === EMPTY_ADDR ? "0x" : "0x60806040",
    });
    const r = await runAvalancheLiveReadCheck({ transport, targets: FAKE_TARGETS });
    const serialized = JSON.stringify(r);
    check("leak: no full 0x[40-hex] address in output", !FULL_ADDRESS_RE.test(serialized));
    check(
      "leak: no target address string in output",
      FAKE_TARGETS.every((t) => !serialized.includes(t.address)),
    );
    check(
      "leak: no check entry carries an address/explorerUrl field",
      r.checks.every((c) => !("address" in c) && !("explorerUrl" in c)),
    );
    check(
      "leak: chainIdActualHex is the short chain hex only",
      r.chainIdActualHex === EXPECTED_CHAIN_ID_HEX,
      String(r.chainIdActualHex),
    );
  }

  // 6) FRAMING/PII SCAN of serialized output.
  {
    const { transport } = recorder({ eth_chainId: "0xa86a", eth_getCode: "0x60806040" });
    const r = await runAvalancheLiveReadCheck({ transport, targets: FAKE_TARGETS });
    const serialized = JSON.stringify(r);
    const lower = serialized.toLowerCase();
    const subHit = FORBIDDEN_SUBSTRINGS.filter((s) => lower.includes(s));
    check("framing: no forbidden substrings (incl. supa)", subHit.length === 0, subHit.join(","));
    const patHit = FORBIDDEN_PATTERNS.filter((re) => re.test(serialized));
    check("framing: no ROI/yield/profit framing", patHit.length === 0, patHit.map(String).join(","));
  }

  // 7) REAL canon selection: only contract roles, real addresses, no wallets.
  {
    const targets = selectContractTargets();
    check("canon: at least one contract target selected", targets.length > 0, String(targets.length));
    check(
      "canon: every selected target has a full 0x[40] address (internal use only)",
      targets.every((t) => /^0x[0-9a-fA-F]{40}$/.test(t.address)),
    );
    check(
      "canon: no wallet/EOA or PENDING key selected",
      targets.every(
        (t) =>
          !t.key.endsWith("_WALLET") &&
          t.key !== "COMMISSION_ROUTER_V1" &&
          t.key !== "SEAT_RECORD_721",
      ),
      targets.map((t) => t.key).join(","),
    );
  }

  // 8) ENDPOINT resolution: defaults to founder-approved, https-only.
  {
    const eps = resolveEndpoints();
    check("endpoints: at least one resolved", eps.length >= 1);
    check(
      "endpoints: all https",
      eps.every((e) => e.url.startsWith("https://")),
      eps.map((e) => e.url).join(","),
    );
    check(
      "endpoints: default primary is approved api.avax.network",
      eps[0]?.url === "https://api.avax.network/ext/bc/C/rpc" || eps[0]?.fromEnv === true,
    );
  }

  // 9) CACHE + COALESCING: concurrent runs share one RPC; next run is cached.
  {
    __resetLiveReadCache();
    let chainIdCalls = 0;
    const slow: RpcTransport = async (method) => {
      if (method === "eth_chainId") {
        chainIdCalls += 1;
        await delay(20);
        return "0xa86a";
      }
      return "0x60806040";
    };
    const [a, b] = await Promise.all([
      getLiveReadCheck({ transport: slow, targets: FAKE_TARGETS }),
      getLiveReadCheck({ transport: slow, targets: FAKE_TARGETS }),
    ]);
    check("cache: concurrent runs coalesced to one chainId call", chainIdCalls === 1, String(chainIdCalls));
    check("cache: both concurrent results resolved", Boolean(a) && Boolean(b));
    const c = await getLiveReadCheck({ transport: slow, targets: FAKE_TARGETS });
    check("cache: sequential follow-up served from cache", c.cached === true);
    check("cache: cache prevented an extra chainId RPC", chainIdCalls === 1, String(chainIdCalls));
    __resetLiveReadCache();
  }

  // ── report ──────────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.ok);
  console.log("\nLive-Read Check Guard — Phase 1 Slice 2.11\n" + "=".repeat(46));
  for (const r of results) {
    console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
  }
  console.log("-".repeat(46));
  console.log(`Result: ${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    console.error(`\nGUARD FAILED: ${failed.length} check(s) failed.`);
    process.exit(1);
  }
  console.log("GUARD PASSED: live-read safety invariants hold.\n");
}

void run();
