/**
 * Internal Avalanche Token-Metadata + Contract-Posture Check — Phase 1 Slice 2.13
 * ------------------------------------------------------------------------------
 * The SMALLEST safe extension of the Slice 2.11 live-read: after verifying the
 * chain and that a token contract has code, it reads ONLY non-sensitive ERC-20
 * metadata — name(), symbol(), decimals() — for SYN and USDC. It emits booleans
 * and that metadata only. It NEVER emits an address, balance, supply, price,
 * burn, holder/member count, sale stat, source record, event log, or any
 * financial amount.
 *
 * INTERNAL-ONLY. This is a CLI script (run via tsx), NOT an HTTP route, NOT
 * imported by the compiled server, and it does NOT touch /api/source-status.
 * It lives under `scripts/` (outside the api-server TypeScript program, whose
 * tsconfig `include` is ["src"]), so importing the vendored canon here never
 * pulls canon into the app's `tsc --noEmit` typecheck.
 *
 * It reuses the Slice 2.11 safety machinery verbatim: the injected RpcTransport,
 * the fetch transport (timeout + https-only endpoint fallback), the
 * founder-approved endpoint resolution, the short in-memory cache + request
 * coalescing pattern, and the runtime address-leak guard.
 *
 * Run:
 *   pnpm --filter @workspace/api-server run token-metadata:check
 *   (guard/tests:)  pnpm --filter @workspace/api-server run token-metadata:guard
 *
 * Chain discipline (Avalanche C-Chain ONLY — NOT Ethereum mainnet):
 *   1. The FIRST RPC call is ALWAYS eth_chainId.
 *   2. Expected chainId: 43114 decimal / 0xa86a hex.
 *   3. eth_getCode is NEVER called unless chainId === 43114 (wrong/garbage chain
 *      and unreachable RPC all FAIL CLOSED).
 *   4. eth_call (metadata) is NEVER made for a token unless chainId is verified
 *      AND that token contract has on-chain code.
 *
 * Approved RPC methods this slice: eth_chainId, eth_getCode, eth_call.
 * Approved eth_call selectors: name(), symbol(), decimals() — nothing else.
 * (eth_* names are used only because Avalanche C-Chain is EVM-compatible.)
 *
 * Metadata expectations come from vendored canon ONLY where present (SYN, via
 * TOKEN_SPEC). USDC has no token-metadata canon, so its live values are reported
 * as-is and never reconciled or "normalized". On any decode failure we return an
 * explicit error and a null field — we never fabricate metadata.
 *
 * No private key. No wallet. No chain writes. No transactions. Read-only.
 */

import { basename } from "node:path";

import { CONTRACT_REGISTRY } from "../src/canon/the-syndicate/contracts/contract-registry";
import { TOKEN_SPEC } from "../src/canon/the-syndicate/contracts/syndicate-config";

import {
  makeFetchTransport,
  resolveEndpoints,
  readEnvInt,
  assertAddressSafeAggregate,
  DEFAULT_TIMEOUT_MS,
  EXPECTED_CHAIN_ID,
  EXPECTED_CHAIN_ID_HEX,
  type RpcTransport,
} from "./avalanche-live-read-check";

const CACHE_TTL_MS = 30_000;

// ── Approved ERC-20 read selectors (function selectors, NOT addresses) ────────
// keccak256("name()")[:4], keccak256("symbol()")[:4], keccak256("decimals()")[:4]
export const SELECTOR_NAME = "0x06fdde03" as const;
export const SELECTOR_SYMBOL = "0x95d89b41" as const;
export const SELECTOR_DECIMALS = "0x313ce567" as const;
export const APPROVED_SELECTORS: ReadonlySet<string> = new Set([
  SELECTOR_NAME,
  SELECTOR_SYMBOL,
  SELECTOR_DECIMALS,
]);

// ── Output shapes (address-free by construction) ─────────────────────────────
export type TokenKey = "SYN" | "USDC";
export type TokenTarget = { key: TokenKey; address: string };
/** A canon metadata expectation, only for tokens whose canon has one. */
export type TokenExpectation = { symbol?: string; decimals?: number };

export type TokenMetadataEntry = {
  /** Safe token key only — never an address. */
  key: string;
  hasCode: boolean;
  metadataReadable: boolean;
  /** Read live; null if the read/decode failed (never fabricated). */
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  /** Canon expectation when present (SYN); null when none (USDC). */
  expected: { symbol: string | null; decimals: number | null } | null;
  /** True only when a PRESENT canon expectation was contradicted by a read value. */
  unexpected: boolean;
  /** Human-readable mismatch lines (symbol/decimals only); empty when none. */
  mismatches: string[];
  error: string | null;
};

export type TokenMetadataResult = {
  mode: "INTERNAL_AVALANCHE_TOKEN_METADATA_CHECK";
  rpcReachable: boolean;
  chainIdExpected: typeof EXPECTED_CHAIN_ID;
  chainIdExpectedHex: typeof EXPECTED_CHAIN_ID_HEX;
  chainIdActual: number | null;
  chainIdActualHex: string | null;
  chainIdOk: boolean;
  wrongChain: boolean;
  tokensChecked: number;
  tokensReadable: number;
  checks: TokenMetadataEntry[];
  cached: boolean;
  asOf: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Pure ABI decoders (no network). They validate strictly and return null on any
// malformation so the caller can emit an explicit error instead of fake data.
// ─────────────────────────────────────────────────────────────────────────────

/** Reject empty/non-printable/oversized decoded text (treated as a decode failure). */
function cleanText(s: string): string | null {
  const t = s.replace(/\u0000/g, "").trim();
  if (!t) return null;
  // Any C0 control char other than tab/newline/CR means we decoded garbage.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(t)) return null;
  if (t.length > 128) return null; // a real token name/symbol is short
  return t;
}

/** Decode an ABI-encoded `string` return (dynamic), with a bytes32 fallback. */
export function decodeAbiString(hex: unknown): string | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]*$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length === 0) return null;

  // Standard dynamic string: [offset(32)][length(32)][content...].
  if (data.length >= 128) {
    let offset: number;
    try {
      offset = Number(BigInt("0x" + data.slice(0, 64)));
    } catch {
      offset = -1;
    }
    const lenStart = offset * 2;
    if (offset >= 0 && Number.isFinite(lenStart) && lenStart + 64 <= data.length) {
      let len: number;
      try {
        len = Number(BigInt("0x" + data.slice(lenStart, lenStart + 64)));
      } catch {
        len = -1;
      }
      const contentStart = lenStart + 64;
      const contentEnd = contentStart + len * 2;
      if (len >= 0 && len <= 1024 && contentEnd <= data.length) {
        const buf = Buffer.from(data.slice(contentStart, contentEnd), "hex");
        return cleanText(buf.toString("utf8"));
      }
    }
  }

  // Legacy bytes32 string: exactly one word, right-NUL-padded.
  if (data.length === 64) {
    const buf = Buffer.from(data, "hex");
    return cleanText(buf.toString("utf8"));
  }

  return null;
}

/** Decode a single uint8 word (decimals). Rejects anything outside 0..255. */
export function decodeUint8(hex: unknown): number | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]+$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length !== 64) return null;
  let n: bigint;
  try {
    n = BigInt("0x" + data);
  } catch {
    return null;
  }
  if (n < 0n || n > 255n) return null;
  return Number(n);
}

// ── canon-driven target + expectation selection ──────────────────────────────
export function selectTokenTargets(): TokenTarget[] {
  const out: TokenTarget[] = [];
  const usable = (role: string) =>
    CONTRACT_REGISTRY.find(
      (c) =>
        c.role === role &&
        (c.status === "LIVE" || c.status === "DEPLOYED") &&
        typeof c.address === "string" &&
        (c.address as string).length > 0,
    );
  const syn = usable("token");
  if (syn) out.push({ key: "SYN", address: syn.address as string });
  const usdc = usable("stablecoin");
  if (usdc) out.push({ key: "USDC", address: usdc.address as string });
  return out;
}

/**
 * Expectations come from vendored canon ONLY where present.
 *   • SYN  — TOKEN_SPEC.symbol / TOKEN_SPEC.decimals are explicit token canon.
 *   • USDC — no token-metadata canon exists; intentionally omitted so its live
 *            values are reported as-is (never reconciled, never normalized).
 */
export function canonExpectations(): Record<string, TokenExpectation> {
  return {
    SYN: { symbol: TOKEN_SPEC.symbol, decimals: TOKEN_SPEC.decimals },
  };
}

function expectedView(
  exp: TokenExpectation | undefined,
): { symbol: string | null; decimals: number | null } | null {
  if (!exp) return null;
  return { symbol: exp.symbol ?? null, decimals: exp.decimals ?? null };
}

/** Compare ONLY strong canon invariants (symbol + decimals). Never gates on name. */
function reconcile(
  exp: TokenExpectation | undefined,
  read: { symbol: string | null; decimals: number | null },
): { unexpected: boolean; mismatches: string[] } {
  if (!exp) return { unexpected: false, mismatches: [] };
  const mismatches: string[] = [];
  if (exp.symbol != null && read.symbol != null && read.symbol !== exp.symbol) {
    mismatches.push(`symbol: read "${read.symbol}" canon "${exp.symbol}"`);
  }
  if (exp.decimals != null && read.decimals != null && read.decimals !== exp.decimals) {
    mismatches.push(`decimals: read ${read.decimals} canon ${exp.decimals}`);
  }
  return { unexpected: mismatches.length > 0, mismatches };
}

function emptyEntry(
  key: string,
  exp: TokenExpectation | undefined,
  hasCode: boolean,
  error: string,
): TokenMetadataEntry {
  return {
    key,
    hasCode,
    metadataReadable: false,
    name: null,
    symbol: null,
    decimals: null,
    expected: expectedView(exp),
    unexpected: false,
    mismatches: [],
    error,
  };
}

async function ethCall(
  transport: RpcTransport,
  address: string,
  selector: string,
): Promise<unknown> {
  return transport("eth_call", [{ to: address, data: selector }, "latest"]);
}

/** Read name/symbol/decimals. Returns nulls + an explicit error on any failure. */
async function readErc20Metadata(
  transport: RpcTransport,
  address: string,
): Promise<{ name: string | null; symbol: string | null; decimals: number | null; error: string | null }> {
  const failed: string[] = [];

  let name: string | null = null;
  try {
    name = decodeAbiString(await ethCall(transport, address, SELECTOR_NAME));
  } catch {
    name = null;
  }
  if (name === null) failed.push("name");

  let symbol: string | null = null;
  try {
    symbol = decodeAbiString(await ethCall(transport, address, SELECTOR_SYMBOL));
  } catch {
    symbol = null;
  }
  if (symbol === null) failed.push("symbol");

  let decimals: number | null = null;
  try {
    decimals = decodeUint8(await ethCall(transport, address, SELECTOR_DECIMALS));
  } catch {
    decimals = null;
  }
  if (decimals === null) failed.push("decimals");

  return {
    name,
    symbol,
    decimals,
    error: failed.length ? `METADATA_DECODE_FAILED:${failed.join("+")}` : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core check (pure: transport injected; no network of its own).
// chainId FIRST → eth_getCode ONLY if chainId ok → eth_call ONLY if hasCode.
// ─────────────────────────────────────────────────────────────────────────────
export async function runTokenMetadataCheck(opts: {
  transport: RpcTransport;
  targets: ReadonlyArray<TokenTarget>;
  expectations?: Record<string, TokenExpectation>;
  now?: () => Date;
}): Promise<TokenMetadataResult> {
  const now = opts.now ?? (() => new Date());
  const expectations = opts.expectations ?? {};

  // STEP 1 — eth_chainId FIRST. Nothing is trusted until this verifies.
  let rpcReachable = false;
  let chainIdActual: number | null = null;
  let chainIdActualHex: string | null = null;
  try {
    const raw = await opts.transport("eth_chainId", []);
    rpcReachable = true;
    if (typeof raw === "string" && /^0x[0-9a-fA-F]+$/.test(raw)) {
      chainIdActualHex = raw.toLowerCase();
      chainIdActual = Number.parseInt(raw, 16);
    }
  } catch {
    rpcReachable = false;
  }

  const chainIdOk = chainIdActual === EXPECTED_CHAIN_ID;
  const wrongChain = chainIdActual !== null && chainIdActual !== EXPECTED_CHAIN_ID;

  const checks: TokenMetadataEntry[] = [];
  if (chainIdOk) {
    for (const target of opts.targets) {
      const exp = expectations[target.key];

      // STEP 2 — eth_getCode before ANY metadata eth_call.
      let hasCode = false;
      try {
        const code = await opts.transport("eth_getCode", [target.address, "latest"]);
        hasCode = typeof code === "string" && code !== "0x" && code !== "0x0" && code.length > 2;
      } catch {
        checks.push(emptyEntry(target.key, exp, false, "CODE_UNAVAILABLE"));
        continue;
      }
      if (!hasCode) {
        checks.push(emptyEntry(target.key, exp, false, "NO_CODE"));
        continue;
      }

      // STEP 3 — read ERC-20 metadata (name/symbol/decimals) ONLY now.
      const meta = await readErc20Metadata(opts.transport, target.address);
      const metadataReadable = meta.name !== null && meta.symbol !== null && meta.decimals !== null;
      const { unexpected, mismatches } = reconcile(exp, {
        symbol: meta.symbol,
        decimals: meta.decimals,
      });

      checks.push({
        key: target.key,
        hasCode: true,
        metadataReadable,
        name: meta.name,
        symbol: meta.symbol,
        decimals: meta.decimals,
        expected: expectedView(exp),
        unexpected,
        mismatches,
        error: meta.error ?? (unexpected ? "METADATA_UNEXPECTED" : null),
      });
    }
  }

  const tokensReadable = checks.filter((c) => c.metadataReadable).length;

  return {
    mode: "INTERNAL_AVALANCHE_TOKEN_METADATA_CHECK",
    rpcReachable,
    chainIdExpected: EXPECTED_CHAIN_ID,
    chainIdExpectedHex: EXPECTED_CHAIN_ID_HEX,
    chainIdActual,
    chainIdActualHex,
    chainIdOk,
    wrongChain,
    tokensChecked: checks.length,
    tokensReadable,
    checks,
    cached: false,
    asOf: now().toISOString(),
  };
}

// ── Short in-memory cache + request coalescing (mirrors Slice 2.11) ───────────
let cacheEntry: { at: number; result: TokenMetadataResult } | null = null;
let inFlight: Promise<TokenMetadataResult> | null = null;

/** Test/maintenance hook: clear the in-memory cache + in-flight coalescing. */
export function __resetTokenMetadataCache(): void {
  cacheEntry = null;
  inFlight = null;
}

export async function getTokenMetadataCheck(opts: {
  transport: RpcTransport;
  targets: ReadonlyArray<TokenTarget>;
  expectations?: Record<string, TokenExpectation>;
  now?: () => Date;
  ttlMs?: number;
}): Promise<TokenMetadataResult> {
  const ttl = opts.ttlMs ?? CACHE_TTL_MS;
  if (cacheEntry && Date.now() - cacheEntry.at < ttl) {
    return { ...cacheEntry.result, cached: true };
  }
  if (inFlight) return inFlight; // coalesce concurrent callers onto one request
  inFlight = (async () => {
    try {
      const result = await runTokenMetadataCheck(opts);
      cacheEntry = { at: Date.now(), result };
      return result;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

// ── CLI entry (runs ONLY when invoked directly, never on import) ──────────────
async function main(): Promise<void> {
  const endpoints = resolveEndpoints();
  const timeoutMs = readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(
    endpoints.map((e) => e.url),
    timeoutMs,
  );
  const targets = selectTokenTargets();
  const expectations = canonExpectations();

  console.log("Internal Avalanche Token-Metadata + Contract-Posture Check — Phase 1 Slice 2.13");
  console.log("=".repeat(78));
  console.log(`  token targets selected (by safe key): ${targets.map((t) => t.key).join(", ")}`);
  console.log(
    `  canon metadata expectation present for: ${Object.keys(expectations).join(", ") || "(none)"}`,
  );
  console.log("  approved methods: eth_chainId, eth_getCode, eth_call(name/symbol/decimals)");
  console.log("-".repeat(78));

  const result = await getTokenMetadataCheck({ transport, targets, expectations });
  const serialized = JSON.stringify(result, null, 2);
  assertAddressSafeAggregate(serialized); // defense-in-depth before printing
  console.log(serialized);

  // Fail closed (non-zero exit) on unreachable RPC or wrong chain.
  if (!result.rpcReachable) {
    console.error("\nTOKEN-METADATA UNAVAILABLE: RPC was not reachable. No results trusted.");
    process.exit(1);
  }
  if (!result.chainIdOk) {
    console.error(
      `\nFAILED CLOSED: chainId ${result.chainIdActual ?? "unknown"} is not Avalanche C-Chain (43114). No token reads were performed.`,
    );
    process.exit(1);
  }

  // Report (do NOT normalize) any canon mismatch, loudly and non-zero.
  const mismatched = result.checks.filter((c) => c.unexpected);
  if (mismatched.length > 0) {
    console.error("\nMETADATA MISMATCH (reported as-read, never normalized):");
    for (const c of mismatched) console.error(`  ${c.key}: ${c.mismatches.join("; ")}`);
    process.exit(1);
  }

  console.log(
    `\nOK: Avalanche C-Chain verified (43114). ${result.tokensReadable}/${result.tokensChecked} token(s) returned safe metadata; no canon mismatches.`,
  );
}

const invokedDirectly =
  !!process.argv[1] && basename(process.argv[1]) === "avalanche-token-metadata-check.ts";
if (invokedDirectly) {
  void main();
}
