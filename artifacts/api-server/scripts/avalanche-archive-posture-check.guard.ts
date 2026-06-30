/**
 * Guard for the Internal Avalanche Archive-1155 Posture Check — Slice 2.14
 * ------------------------------------------------------------------------------
 * Dependency-free runtime guard using INJECTED MOCK transports — it never touches
 * the network. It proves the founder-required safety invariants:
 *   - keccak-256 is correct (empty-string digest + known ERC-20/1155/OZ selectors).
 *   - eth_chainId is the FIRST call; eth_getCode is NEVER called unless
 *     chainId === 43114 (wrong/garbage chain and unreachable RPC fail closed).
 *   - archive eth_call is NEVER made unless chainId is verified AND the Archive
 *     contract has code.
 *   - ONLY the 5 approved selectors are ever used: getArtifactCore / remainingSupply
 *     / paused / isMintable / uri. (Proves NO balanceOf / balanceOfBatch /
 *     walletRemaining / owner / treasury / mint / transfer / event-log calls.)
 *   - getArtifactCore surfaces ONLY `configured` as `exists`; price/minted/supply
 *     payment fields are NOT present in output.
 *   - remainingSupply is reported as artifact state; decode failure → explicit error.
 *   - ABI-shape drift (bad tuple) → explicit ARTIFACT_CORE_SHAPE error.
 *   - uri value is NEVER emitted; only a uriStatus enum is.
 *   - No full 0x[40-hex] address, no Archive address, no REFERENCE_WALLET, no
 *     wallet/owner/holder/treasury fields leak into output. No PII / Supa /
 *     forbidden financial framing.
 *   - The short in-memory cache + request coalescing behave correctly.
 *   - Real canon selection yields the Archive1155 target + all registry artifact ids.
 *
 * Run:  pnpm --filter @workspace/api-server run archive-posture:guard
 * Exit: 0 if every check passes, 1 otherwise.
 */

import { FULL_ADDRESS_RE, EXPECTED_CHAIN_ID, EXPECTED_CHAIN_ID_HEX, type RpcTransport } from "./avalanche-live-read-check";
import {
  runArchivePostureCheck,
  getArchivePostureCheck,
  __resetArchivePostureCache,
  selectArchiveTarget,
  selectArtifactTargets,
  keccak256Hex,
  functionSelector,
  classifyUri,
  decodeBool,
  decodeUint256Word,
  decodeArtifactCoreHex,
  APPROVED_ARCHIVE_SELECTORS,
  SELECTOR_GET_ARTIFACT_CORE,
  SELECTOR_REMAINING_SUPPLY,
  SELECTOR_PAUSED,
  SELECTOR_IS_MINTABLE,
  SELECTOR_URI,
  type ArchiveTarget,
  type ArtifactTarget,
} from "./avalanche-archive-posture-check";

// ── tiny check harness ───────────────────────────────────────────────────────
type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];
function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
}
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── ABI mock encoders ─────────────────────────────────────────────────────────
const word = (hexNo0x: string) => hexNo0x.padStart(64, "0");
const encUint = (n: bigint | number) => "0x" + BigInt(n).toString(16).padStart(64, "0");
const encBool = (b: boolean) => "0x" + (b ? "1" : "0").padStart(64, "0");
function encString(s: string): string {
  const buf = Buffer.from(s, "utf8");
  const offset = (32).toString(16).padStart(64, "0");
  const lenWord = buf.length.toString(16).padStart(64, "0");
  const contentHex = buf.toString("hex");
  const padded = contentHex + "0".repeat((64 - (contentHex.length % 64)) % 64);
  return "0x" + offset + lenWord + padded;
}
/** Build a valid getArtifactCore 9-word tuple return. */
function encArtifactCore(o: {
  configured: boolean;
  active?: boolean;
  ownerOnly?: boolean;
  frozen?: boolean;
  renderer?: number;
  maxSupply?: number;
  walletLimit?: number;
  priceUsdc?: number;
  minted?: number;
}): string {
  return (
    "0x" +
    word(o.configured ? "1" : "0") +
    word(o.active ? "1" : "0") +
    word(o.ownerOnly ? "1" : "0") +
    word(o.frozen ? "1" : "0") +
    word((o.renderer ?? 0).toString(16)) +
    word((o.maxSupply ?? 0).toString(16)) +
    word((o.walletLimit ?? 0).toString(16)) +
    word((o.priceUsdc ?? 0).toString(16)) +
    word((o.minted ?? 0).toString(16))
  );
}

const ADDR_ARCHIVE = "0x3333333333333333333333333333333333333333"; // fake, for leak tests
const ARCHIVE: ArchiveTarget = { key: "ARCHIVE_1155", address: ADDR_ARCHIVE };
const ARTIFACTS: ArtifactTarget[] = [
  { key: "ARCHIVE_1_THE_FIRST_SIGNAL", id: 1, activation: "LIVE_PUBLIC_MINT", configuredOnChain: true, publicMintAllowed: true },
  { key: "ARCHIVE_4_PROTOCOL_MEMORY", id: 4, activation: "OWNER_ONLY", configuredOnChain: true, publicMintAllowed: false },
  { key: "ARCHIVE_9_CHRONICLE", id: 9, activation: "NOT_CONFIGURED", configuredOnChain: false, publicMintAllowed: false },
];

const FORBIDDEN_SUBSTRINGS = [
  "guaranteed profit", "guaranteed return", "passive income", "payout", "jackpot",
  "betting", "wager", "reward farming", "liquidity mining", "buy for upside",
  "casino", "fake live", "airdrop", "supa",
];
const FORBIDDEN_PATTERNS = [/\broi\b/i, /\byield/i, /\bprofit\b/i];
// Output must never carry these FIELD NAMES (wallet/owner/holder/treasury/financial).
// Checked against object KEYS only — values like the "OWNER_ONLY" activation enum
// are legitimate design-intent statuses, not leaked owner-address fields.
const BANNED_FIELDS = ["balanceof", "owner", "treasury", "holder", "minter", "recipient", "wallet", "priceusdc", "minted", "maxsupply", "walletlimit", "address", "explorerurl"];
function collectKeys(value: unknown, acc: Set<string>): void {
  if (Array.isArray(value)) {
    for (const v of value) collectKeys(v, acc);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      acc.add(k.toLowerCase());
      collectKeys(v, acc);
    }
  }
}

type MockOpts = {
  chainId?: string | "__throw__";
  getCode?: (addr: string) => string | "__throw__";
  call?: (addr: string, selector: string, data: string) => string | "__throw__";
};
function makeMock(o: MockOpts): {
  transport: RpcTransport;
  calls: string[];
  callSelectors: string[];
  callTos: string[];
} {
  const calls: string[] = [];
  const callSelectors: string[] = [];
  const callTos: string[] = [];
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
      const selector = p.data.slice(0, 10);
      callSelectors.push(selector);
      callTos.push(p.to);
      const r = o.call?.(p.to, selector, p.data);
      if (r === "__throw__") throw new Error("call revert");
      return r;
    }
    throw new Error("UNEXPECTED_METHOD:" + method);
  };
  return { transport, calls, callSelectors, callTos };
}

// A "good" responder: configured artifacts exist; id 9 not configured; paused false.
function goodCall(_addr: string, selector: string, data: string): string {
  if (selector === SELECTOR_PAUSED) return encBool(false);
  if (selector === SELECTOR_GET_ARTIFACT_CORE) {
    const id = Number(BigInt("0x" + data.slice(10))); // first arg
    const configured = id !== 9;
    return encArtifactCore({ configured, active: configured, maxSupply: 10000, priceUsdc: 500000, minted: 42 });
  }
  if (selector === SELECTOR_REMAINING_SUPPLY) return encUint(9958);
  if (selector === SELECTOR_IS_MINTABLE) {
    const id = Number(BigInt("0x" + data.slice(10, 10 + 64)));
    return encBool(id === 1); // only id 1 mintable for the reference wallet
  }
  if (selector === SELECTOR_URI) return encString("ipfs://bafyExampleSafeCidValueNotEmitted");
  return "0x";
}

async function run(): Promise<void> {
  // 0) KECCAK correctness (empty digest + known selectors).
  {
    check(
      "keccak: empty-string digest",
      keccak256Hex(new Uint8Array(0)) === "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    );
    const known: Record<string, string> = {
      "paused()": "0x5c975abb",
      "uri(uint256)": "0x0e89341c",
      "name()": "0x06fdde03",
      "balanceOf(address,uint256)": "0x00fdd58e",
      "owner()": "0x8da5cb5b",
    };
    const bad = Object.entries(known).filter(([sig, sel]) => functionSelector(sig) !== sel);
    check("keccak: known selectors match", bad.length === 0, bad.map(([s]) => s).join(","));
    check("selectors: getArtifactCore/remainingSupply/isMintable derived", SELECTOR_GET_ARTIFACT_CORE === "0x0f1a0fba" && SELECTOR_REMAINING_SUPPLY === "0x47fda41a" && SELECTOR_IS_MINTABLE === "0x80e101ca");
    check("selectors: APPROVED set is exactly 5", APPROVED_ARCHIVE_SELECTORS.size === 5);
  }

  // 1) WRONG CHAIN fails closed before getCode/eth_call.
  {
    const { transport, calls } = makeMock({ chainId: "0x1", getCode: () => "0x60", call: goodCall });
    const r = await runArchivePostureCheck({ transport, archive: ARCHIVE, artifacts: ARTIFACTS });
    check("wrong-chain: chainIdActual === 1, wrongChain true", r.chainIdActual === 1 && r.wrongChain === true && r.chainIdOk === false);
    check("wrong-chain: archiveContractHasCode false", r.archiveContractHasCode === false);
    check("wrong-chain: artifactsChecked === 0", r.artifactsChecked === 0);
    check("wrong-chain: eth_getCode NEVER called", !calls.includes("eth_getCode"));
    check("wrong-chain: eth_call NEVER called", !calls.includes("eth_call"));
    check("wrong-chain: eth_chainId is FIRST call", calls[0] === "eth_chainId");
  }

  // 2) HAPPY PATH: ordering + only approved selectors + posture decode.
  {
    const { transport, calls, callSelectors } = makeMock({ chainId: "0xa86a", getCode: () => "0x60806040", call: goodCall });
    const r = await runArchivePostureCheck({ transport, archive: ARCHIVE, artifacts: ARTIFACTS });
    const firstGetCode = calls.indexOf("eth_getCode");
    const firstCall = calls.indexOf("eth_call");
    check("avax: eth_chainId is FIRST call", calls[0] === "eth_chainId");
    check("avax: chainId BEFORE getCode", firstGetCode > 0 && calls.slice(0, firstGetCode).includes("eth_chainId"));
    check("avax: getCode BEFORE first eth_call", firstCall === -1 || firstGetCode < firstCall);
    check("avax: chainId 43114 / archiveContractHasCode true", r.chainIdActual === EXPECTED_CHAIN_ID && r.archiveContractHasCode === true);
    check("avax: artifactsChecked === 3", r.artifactsChecked === 3, String(r.artifactsChecked));
    check("avax: ONLY approved selectors used", callSelectors.every((s) => APPROVED_ARCHIVE_SELECTORS.has(s)), [...new Set(callSelectors)].join(","));
    check("avax: NO forbidden selector (balanceOf/owner/treasury/mint)", callSelectors.every((s) => !["0x00fdd58e", "0x8da5cb5b", "0x61d027b3", "0x4b58d725", "0x4e1273f4"].includes(s)));
    const a1 = r.checks.find((c) => c.id === 1)!;
    const a9 = r.checks.find((c) => c.id === 9)!;
    check("avax: id1 exists true / readable true", a1.posture.exists === true && a1.readable === true);
    check("avax: id1 remainingSupply surfaced as number", a1.posture.remainingSupply === 9958);
    check("avax: id1 mintableReference true (reference wallet)", a1.posture.mintableReference === true);
    check("avax: id4 mintableReference false", r.checks.find((c) => c.id === 4)!.posture.mintableReference === false);
    check("avax: id9 exists false (not configured on-chain)", a9.posture.exists === false);
    check("avax: paused false applied to every artifact", r.checks.every((c) => c.posture.paused === false));
    check("avax: uriStatus safe (ipfs), value NOT emitted", r.checks.every((c) => c.uriStatus === "safe"));
    check("avax: registry activation/flags passed through", a1.registryActivation === "LIVE_PUBLIC_MINT" && a1.configuredOnChain === true && a1.publicMintAllowed === true);
    // price/minted/supply payment fields must NOT be surfaced.
    const postureKeys = new Set(r.checks.flatMap((c) => Object.keys(c.posture)));
    check("avax: posture has ONLY exists/mintableReference/paused/remainingSupply", postureKeys.size === 4 && postureKeys.has("exists") && postureKeys.has("mintableReference") && postureKeys.has("paused") && postureKeys.has("remainingSupply"));
  }

  // 3) NO CODE: artifact calls are NOT made.
  {
    const { transport, calls } = makeMock({ chainId: "0xa86a", getCode: () => "0x", call: goodCall });
    const r = await runArchivePostureCheck({ transport, archive: ARCHIVE, artifacts: ARTIFACTS });
    check("no-code: archiveContractHasCode false", r.archiveContractHasCode === false);
    check("no-code: artifactsChecked === 0", r.artifactsChecked === 0);
    check("no-code: NO eth_call made", !calls.includes("eth_call"));
  }

  // 4) RPC UNAVAILABLE: explicit, no getCode/call, no fabricated posture.
  {
    const { transport, calls } = makeMock({ chainId: "__throw__", getCode: () => "0x60", call: goodCall });
    const r = await runArchivePostureCheck({ transport, archive: ARCHIVE, artifacts: ARTIFACTS });
    check("rpc-fail: rpcReachable false / chainIdActual null", r.rpcReachable === false && r.chainIdActual === null);
    check("rpc-fail: wrongChain false (unknown, not wrong)", r.wrongChain === false && r.chainIdOk === false);
    check("rpc-fail: NO getCode / NO eth_call", !calls.includes("eth_getCode") && !calls.includes("eth_call"));
    check("rpc-fail: no fabricated checks", r.checks.length === 0);
  }

  // 5) DECODE FAILURE for remainingSupply → explicit error, null field.
  {
    const { transport } = makeMock({
      chainId: "0xa86a",
      getCode: () => "0x60806040",
      call: (a, s, d) => (s === SELECTOR_REMAINING_SUPPLY ? "0x" : goodCall(a, s, d)),
    });
    const r = await runArchivePostureCheck({ transport, archive: ARCHIVE, artifacts: ARTIFACTS });
    const a1 = r.checks.find((c) => c.id === 1)!;
    check("decode-fail: remainingSupply null", a1.posture.remainingSupply === null);
    check("decode-fail: explicit REMAINING_SUPPLY error", typeof a1.error === "string" && a1.error.includes("REMAINING_SUPPLY"));
    check("decode-fail: exists still readable (getArtifactCore ok)", a1.posture.exists === true && a1.readable === true);
  }

  // 6) ABI SHAPE DRIFT: getArtifactCore returns a too-short tuple → SHAPE error.
  {
    const { transport } = makeMock({
      chainId: "0xa86a",
      getCode: () => "0x60806040",
      call: (a, s, d) => (s === SELECTOR_GET_ARTIFACT_CORE ? "0x" + "0".repeat(64) : goodCall(a, s, d)), // 1 word only
    });
    const r = await runArchivePostureCheck({ transport, archive: ARCHIVE, artifacts: ARTIFACTS });
    const a1 = r.checks.find((c) => c.id === 1)!;
    check("shape-drift: exists null / readable false", a1.posture.exists === null && a1.readable === false);
    check("shape-drift: explicit ARTIFACT_CORE_SHAPE error", typeof a1.error === "string" && a1.error.includes("ARTIFACT_CORE_SHAPE"));
  }

  // 7) ARTIFACT_CORE revert → REVERT error (NOT shape drift).
  {
    const { transport } = makeMock({
      chainId: "0xa86a",
      getCode: () => "0x60806040",
      call: (a, s, d) => (s === SELECTOR_GET_ARTIFACT_CORE ? "__throw__" : goodCall(a, s, d)),
    });
    const r = await runArchivePostureCheck({ transport, archive: ARCHIVE, artifacts: ARTIFACTS });
    const a1 = r.checks.find((c) => c.id === 1)!;
    check("revert: ARTIFACT_CORE_REVERT error, not SHAPE", typeof a1.error === "string" && a1.error.includes("ARTIFACT_CORE_REVERT") && !a1.error.includes("SHAPE"));
  }

  // 8) URI UNSAFE → redacted; URI revert → unreadable; value never emitted.
  {
    const { transport } = makeMock({
      chainId: "0xa86a",
      getCode: () => "0x60806040",
      call: (a, s, d) => {
        if (s === SELECTOR_URI) {
          const id = Number(BigInt("0x" + d.slice(10)));
          if (id === 1) return encString("data:application/json;base64,SHOULD_NEVER_APPEAR");
          if (id === 4) return "__throw__";
        }
        return goodCall(a, s, d);
      },
    });
    const r = await runArchivePostureCheck({ transport, archive: ARCHIVE, artifacts: ARTIFACTS });
    check("uri: data: scheme → redacted", r.checks.find((c) => c.id === 1)!.uriStatus === "redacted");
    check("uri: revert → unreadable", r.checks.find((c) => c.id === 4)!.uriStatus === "unreadable");
    check("uri: raw value NEVER emitted", !JSON.stringify(r).includes("SHOULD_NEVER_APPEAR") && !JSON.stringify(r).includes("bafyExample"));
  }

  // 9) OUTPUT LEAK SCAN.
  {
    const { transport } = makeMock({ chainId: "0xa86a", getCode: () => "0x60806040", call: goodCall });
    const r = await runArchivePostureCheck({ transport, archive: ARCHIVE, artifacts: ARTIFACTS });
    const serialized = JSON.stringify(r);
    check("leak: no full 0x[40-hex] address", !FULL_ADDRESS_RE.test(serialized));
    check("leak: no Archive address string", !serialized.includes(ADDR_ARCHIVE));
    check("leak: no REFERENCE_WALLET (0x..0001) in output", !serialized.includes("0000000000000000000000000000000000000001"));
    check("leak: chainIdActualHex is short chain hex only", r.chainIdActualHex === EXPECTED_CHAIN_ID_HEX);
    check("leak: no entry carries address/explorerUrl", r.checks.every((c) => !("address" in c) && !("explorerUrl" in c)));
  }

  // 10) FRAMING / PII / banned-field SCAN.
  {
    const { transport } = makeMock({ chainId: "0xa86a", getCode: () => "0x60806040", call: goodCall });
    const r = await runArchivePostureCheck({ transport, archive: ARCHIVE, artifacts: ARTIFACTS });
    const lower = JSON.stringify(r).toLowerCase();
    check("framing: no forbidden substrings (incl. supa)", FORBIDDEN_SUBSTRINGS.filter((s) => lower.includes(s)).length === 0);
    check("framing: no ROI/yield/profit framing", FORBIDDEN_PATTERNS.filter((re) => re.test(JSON.stringify(r))).length === 0);
    const keys = new Set<string>();
    collectKeys(r, keys);
    const fieldHit = BANNED_FIELDS.filter((b) => [...keys].some((k) => k.includes(b)));
    check("framing: no wallet/owner/treasury/holder/price/minted FIELD names", fieldHit.length === 0, fieldHit.join(","));
  }

  // 11) PURE DECODER UNIT TESTS.
  {
    check("decode: bool true/false/garbage", decodeBool(encBool(true)) === true && decodeBool(encBool(false)) === false && decodeBool("0x" + "2".padStart(64, "0")) === null);
    check("decode: uint256 word", decodeUint256Word(encUint(9958)) === 9958n);
    check("decode: uint256 wrong width → null", decodeUint256Word("0x12") === null);
    const okCore = decodeArtifactCoreHex(encArtifactCore({ configured: true }));
    check("decode: artifactCore ok surfaces configured only", okCore.ok === true && okCore.ok && okCore.configured === true);
    const shortCore = decodeArtifactCoreHex("0x" + "0".repeat(64));
    check("decode: artifactCore short tuple → shapeMismatch", shortCore.ok === false && !shortCore.ok && shortCore.shapeMismatch === true);
    check("uri-classify: https safe", classifyUri("https://example.com/x") === "safe");
    check("uri-classify: ipfs safe", classifyUri("ipfs://bafy") === "safe");
    check("uri-classify: data redacted", classifyUri("data:text/plain,hi") === "redacted");
    check("uri-classify: null unreadable", classifyUri(null) === "unreadable");
    check("uri-classify: control chars redacted", classifyUri("https://x\u0007y") === "redacted");
  }

  // 12) REAL canon selection.
  {
    const archive = selectArchiveTarget();
    check("canon: Archive1155 target selected", !!archive && archive.key === "ARCHIVE_1155");
    check("canon: archive target has full 0x[40] address (internal only)", !!archive && /^0x[0-9a-fA-F]{40}$/.test(archive.address));
    const targets = selectArtifactTargets();
    check("canon: all 9 registry artifact ids selected", targets.length === 9 && targets.map((t) => t.id).join(",") === "1,2,3,4,5,6,7,8,9");
    check("canon: id1 LIVE_PUBLIC_MINT, id9 NOT_CONFIGURED", targets.find((t) => t.id === 1)?.activation === "LIVE_PUBLIC_MINT" && targets.find((t) => t.id === 9)?.activation === "NOT_CONFIGURED");
    check("canon: artifact keys carry no address", targets.every((t) => !/0x[0-9a-fA-F]{40}/.test(t.key)));
  }

  // 13) CACHE + COALESCING.
  {
    __resetArchivePostureCache();
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
        return goodCall(p.to, p.data.slice(0, 10), p.data);
      }
      throw new Error("UNEXPECTED_METHOD:" + method);
    };
    const [a, b] = await Promise.all([
      getArchivePostureCheck({ transport: slow, archive: ARCHIVE, artifacts: ARTIFACTS }),
      getArchivePostureCheck({ transport: slow, archive: ARCHIVE, artifacts: ARTIFACTS }),
    ]);
    check("cache: concurrent runs coalesced to one chainId call", chainIdCalls === 1, String(chainIdCalls));
    check("cache: both concurrent results resolved", Boolean(a) && Boolean(b));
    const c = await getArchivePostureCheck({ transport: slow, archive: ARCHIVE, artifacts: ARTIFACTS });
    check("cache: sequential follow-up served from cache", c.cached === true);
    check("cache: cache prevented extra chainId RPC", chainIdCalls === 1);
    __resetArchivePostureCache();
  }

  // ── report ──────────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.ok);
  console.log("\nArchive-1155 Posture Check Guard — Phase 1 Slice 2.14\n" + "=".repeat(52));
  for (const r of results) console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
  console.log("-".repeat(52));
  console.log(`Result: ${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    console.error(`\nGUARD FAILED: ${failed.length} check(s) failed.`);
    process.exit(1);
  }
  console.log("GUARD PASSED: archive-posture safety invariants hold.\n");
}

void run();
