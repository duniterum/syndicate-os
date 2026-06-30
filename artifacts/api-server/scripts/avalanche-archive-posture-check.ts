/**
 * Internal Avalanche Archive-1155 Posture Check — Phase 1 Slice 2.14
 * ------------------------------------------------------------------------------
 * The smallest safe internal read of the SyndicateArchive1155 contract's
 * artifact-level POSTURE. After verifying the chain and that the Archive
 * contract has code, it reads, per known artifact id from the vendored archive
 * ID registry, only:
 *   - getArtifactCore(id)            → we surface ONLY `configured` as `exists`
 *   - remainingSupply(id)            → artifact contract state (NOT a financial metric)
 *   - paused()                       → global Pausable flag (read once, applied to all)
 *   - isMintable(id, REFERENCE, 1)   → reference-wallet display eligibility (a bool)
 *   - uri(id)                        → classified to a status; the value is NEVER emitted
 *
 * It emits booleans, a small enum, and supply counts only. It NEVER emits the
 * Archive contract address, any wallet/owner/holder/minter/treasury/recipient
 * address, event logs, token/treasury balances, LP reserves, member/source data,
 * or price as a public claim. `getArtifactCore` price/payment fields
 * (priceUsdc, minted, maxSupply, walletLimit) are decoded for ABI-shape
 * validation but intentionally NOT surfaced this slice ("present in ABI, not
 * surfaced").
 *
 * INTERNAL-ONLY. CLI script (run via tsx), NOT an HTTP route, NOT imported by the
 * compiled server, and it does NOT touch /api/source-status. It lives under
 * `scripts/` (outside the api-server TypeScript program, whose tsconfig `include`
 * is ["src"]), so importing the vendored canon here never pulls canon into the
 * app's `tsc --noEmit` typecheck. No wagmi/viem/browser hooks are imported.
 *
 * Run:
 *   pnpm --filter @workspace/api-server run archive-posture:check
 *   (guard/tests:)  pnpm --filter @workspace/api-server run archive-posture:guard
 *
 * Chain discipline (Avalanche C-Chain ONLY — NOT Ethereum mainnet):
 *   1. The FIRST RPC call is ALWAYS eth_chainId.
 *   2. Expected chainId: 43114 decimal / 0xa86a hex.
 *   3. eth_getCode is NEVER called unless chainId === 43114.
 *   4. archive eth_call is NEVER made unless chainId is verified AND the Archive
 *      contract has on-chain code. Wrong/garbage chain and unreachable RPC FAIL CLOSED.
 *
 * Approved RPC methods this slice: eth_chainId, eth_getCode, eth_call.
 * Approved eth_call selectors: getArtifactCore / remainingSupply / paused /
 * isMintable / uri — nothing else. (NO balanceOf / balanceOfBatch /
 * walletRemaining / owner / treasury / mint / transfer / events.)
 *
 * No private key. No wallet. No chain writes. No transactions. Read-only.
 */

import { basename } from "node:path";

import { CONTRACT_REGISTRY } from "../src/canon/the-syndicate/contracts/contract-registry";
import {
  ARCHIVE_ID_REGISTRY,
  type ArchiveIdActivation,
} from "../src/canon/the-syndicate/archive/archive-id-registry";
import {
  decodeArtifactCore,
  REFERENCE_WALLET,
} from "../src/canon/the-syndicate/contracts/abi/archive-nft-abi";

import {
  makeFetchTransport,
  resolveEndpoints,
  readEnvInt,
  assertNoAddressLeak,
  DEFAULT_TIMEOUT_MS,
  EXPECTED_CHAIN_ID,
  EXPECTED_CHAIN_ID_HEX,
  type RpcTransport,
} from "./avalanche-live-read-check";
import { decodeAbiString } from "./avalanche-token-metadata-check";

const CACHE_TTL_MS = 30_000;

// ─────────────────────────────────────────────────────────────────────────────
// keccak-256 (vendored, dependency-free). Verified against the empty-string
// digest and the standard ERC-20/1155/OZ selectors in the guard. Used ONLY to
// derive function selectors from their canonical signatures at load time, so the
// signatures are auditable in source rather than magic 4-byte literals.
// ─────────────────────────────────────────────────────────────────────────────
const KECCAK_MASK = (1n << 64n) - 1n;
const KECCAK_RC: readonly bigint[] = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];
const rotl64 = (x: bigint, n: bigint): bigint => ((x << n) | (x >> (64n - n))) & KECCAK_MASK;

function keccakF(A: bigint[]): void {
  for (let round = 0; round < 24; round++) {
    const C = new Array<bigint>(5);
    for (let x = 0; x < 5; x++) C[x] = A[x]! ^ A[x + 5]! ^ A[x + 10]! ^ A[x + 15]! ^ A[x + 20]!;
    const D = new Array<bigint>(5);
    for (let x = 0; x < 5; x++) D[x] = C[(x + 4) % 5]! ^ rotl64(C[(x + 1) % 5]!, 1n);
    for (let x = 0; x < 5; x++) for (let y = 0; y < 25; y += 5) A[x + y] = A[x + y]! ^ D[x]!;
    let x = 1, y = 0;
    let current = A[1]!;
    for (let t = 0; t < 24; t++) {
      const nx = y;
      const ny = (2 * x + 3 * y) % 5;
      const idx = nx + 5 * ny;
      const tmp = A[idx]!;
      A[idx] = rotl64(current, BigInt((((t + 1) * (t + 2)) / 2) % 64));
      current = tmp;
      x = nx;
      y = ny;
    }
    for (let yy = 0; yy < 25; yy += 5) {
      const T = [A[yy]!, A[yy + 1]!, A[yy + 2]!, A[yy + 3]!, A[yy + 4]!];
      for (let xx = 0; xx < 5; xx++) A[yy + xx] = T[xx]! ^ ((~T[(xx + 1) % 5]! & KECCAK_MASK) & T[(xx + 2) % 5]!);
    }
    A[0] = A[0]! ^ KECCAK_RC[round]!;
  }
}

export function keccak256Hex(bytes: Uint8Array): string {
  const rate = 136; // keccak256: 1088-bit rate, 512-bit capacity
  const A = new Array<bigint>(25).fill(0n);
  const padded = new Uint8Array(Math.ceil((bytes.length + 1) / rate) * rate);
  padded.set(bytes);
  padded[bytes.length] ^= 0x01; // keccak domain padding
  padded[padded.length - 1] ^= 0x80;
  for (let off = 0; off < padded.length; off += rate) {
    for (let i = 0; i < rate / 8; i++) {
      let lane = 0n;
      for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(padded[off + i * 8 + b]!);
      A[i] = A[i]! ^ lane;
    }
    keccakF(A);
  }
  let out = "";
  for (let i = 0; i < 4; i++) {
    let lane = A[i]!;
    for (let b = 0; b < 8; b++) {
      out += (lane & 0xffn).toString(16).padStart(2, "0");
      lane >>= 8n;
    }
  }
  return out;
}

export function functionSelector(signature: string): string {
  return "0x" + keccak256Hex(new TextEncoder().encode(signature)).slice(0, 8);
}

// ── Approved Archive read selectors (derived from canonical signatures) ───────
export const SELECTOR_GET_ARTIFACT_CORE = functionSelector("getArtifactCore(uint256)"); // 0x0f1a0fba
export const SELECTOR_REMAINING_SUPPLY = functionSelector("remainingSupply(uint256)"); // 0x47fda41a
export const SELECTOR_PAUSED = functionSelector("paused()"); // 0x5c975abb
export const SELECTOR_IS_MINTABLE = functionSelector("isMintable(uint256,address,uint64)"); // 0x80e101ca
export const SELECTOR_URI = functionSelector("uri(uint256)"); // 0x0e89341c
export const APPROVED_ARCHIVE_SELECTORS: ReadonlySet<string> = new Set([
  SELECTOR_GET_ARTIFACT_CORE,
  SELECTOR_REMAINING_SUPPLY,
  SELECTOR_PAUSED,
  SELECTOR_IS_MINTABLE,
  SELECTOR_URI,
]);

// ─────────────────────────────────────────────────────────────────────────────
// Pure ABI encoders / decoders (no network).
// ─────────────────────────────────────────────────────────────────────────────
function encodeUint256(n: bigint): string {
  if (n < 0n) throw new Error("encodeUint256: negative");
  return n.toString(16).padStart(64, "0");
}
function encodeAddress(addr: string): string {
  if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) throw new Error("encodeAddress: bad address");
  return addr.slice(2).toLowerCase().padStart(64, "0");
}
function callData(selector: string, words: string[] = []): string {
  return selector + words.join("");
}

/** Decode a single bool word (0 → false, 1 → true; anything else → null). */
export function decodeBool(hex: unknown): boolean | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]+$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length !== 64) return null;
  let n: bigint;
  try {
    n = BigInt("0x" + data);
  } catch {
    return null;
  }
  if (n === 0n) return false;
  if (n === 1n) return true;
  return null;
}

/** Decode a single uint256 word → bigint (null on malformation). */
export function decodeUint256Word(hex: unknown): bigint | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]+$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length !== 64) return null;
  try {
    return BigInt("0x" + data);
  } catch {
    return null;
  }
}

export type ArtifactCoreDecode =
  | { ok: true; configured: boolean }
  | { ok: false; reason: string; shapeMismatch: boolean };

/**
 * Decode getArtifactCore raw return into the canon validator. We reuse the
 * vendored `decodeArtifactCore` (strict 9-field tuple) so any ABI-shape drift is
 * caught and reported rather than silently mis-read. We surface ONLY `configured`.
 */
export function decodeArtifactCoreHex(hex: unknown): ArtifactCoreDecode {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]*$/.test(hex)) {
    return { ok: false, reason: "non-hex return", shapeMismatch: true };
  }
  const data = hex.slice(2);
  if (data.length < 9 * 64) {
    return { ok: false, reason: `tuple too short: ${data.length / 64} words`, shapeMismatch: true };
  }
  const word = (i: number) => "0x" + data.slice(i * 64, i * 64 + 64);
  const b = (i: number) => decodeBool(word(i));
  const u = (i: number) => decodeUint256Word(word(i));
  const arr = [b(0), b(1), b(2), b(3), Number(u(4) ?? -1n), u(5), u(6), u(7), u(8)];
  const decoded = decodeArtifactCore(arr);
  if (!decoded.ok) {
    return { ok: false, reason: decoded.error.reason, shapeMismatch: true };
  }
  return { ok: true, configured: decoded.value.configured };
}

// ── URI classification (the raw value is NEVER emitted this slice) ────────────
export type UriStatus = "omitted" | "safe" | "redacted" | "unreadable";
export function classifyUri(decoded: string | null): UriStatus {
  if (decoded === null) return "unreadable";
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(decoded)) return "redacted";
  if (decoded.length > 256) return "redacted";
  if (/^(https:\/\/|ipfs:\/\/|ar:\/\/)/i.test(decoded)) return "safe";
  return "redacted";
}

// ── Output shapes (address-free by construction) ─────────────────────────────
export type ArchivePosture = {
  exists: boolean | null;
  mintableReference: boolean | null;
  paused: boolean | null;
  remainingSupply: number | null;
};
export type ArchiveCheckEntry = {
  key: string;
  id: number;
  registryActivation: ArchiveIdActivation;
  configuredOnChain: boolean;
  publicMintAllowed: boolean;
  readable: boolean;
  posture: ArchivePosture;
  uriStatus: UriStatus;
  error: string | null;
};
export type ArchivePostureResult = {
  mode: "INTERNAL_AVALANCHE_ARCHIVE_POSTURE_CHECK";
  rpcReachable: boolean;
  chainIdExpected: typeof EXPECTED_CHAIN_ID;
  chainIdExpectedHex: typeof EXPECTED_CHAIN_ID_HEX;
  chainIdActual: number | null;
  chainIdActualHex: string | null;
  chainIdOk: boolean;
  wrongChain: boolean;
  archiveContractHasCode: boolean;
  artifactsChecked: number;
  artifactsReadable: number;
  checks: ArchiveCheckEntry[];
  cached: boolean;
  asOf: string;
};

export type ArchiveTarget = { key: string; address: string };
export type ArtifactTarget = {
  key: string;
  id: number;
  activation: ArchiveIdActivation;
  configuredOnChain: boolean;
  publicMintAllowed: boolean;
};

// ── canon-driven target selection ────────────────────────────────────────────
export function selectArchiveTarget(): ArchiveTarget | null {
  const c = CONTRACT_REGISTRY.find(
    (e) =>
      e.role === "archive1155" &&
      (e.status === "LIVE" || e.status === "DEPLOYED") &&
      typeof e.address === "string" &&
      (e.address as string).length > 0,
  );
  return c ? { key: c.key, address: c.address as string } : null;
}

/** Safe display key from the artifact name (public canon copy — never an address). */
function safeKey(name: string, id: number): string {
  const slug = name.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").toUpperCase();
  return slug ? `ARCHIVE_${id}_${slug}` : `ARCHIVE_${id}`;
}

export function selectArtifactTargets(): ArtifactTarget[] {
  return ARCHIVE_ID_REGISTRY.map((e) => ({
    key: safeKey(e.name, e.id),
    id: e.id,
    activation: e.activation,
    configuredOnChain: e.configuredOnChain,
    publicMintAllowed: e.publicMintAllowed,
  }));
}

async function ethCall(transport: RpcTransport, to: string, data: string): Promise<unknown> {
  return transport("eth_call", [{ to, data }, "latest"]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Core check (pure: transport injected; no network of its own).
// chainId FIRST → eth_getCode ONLY if chainId ok → archive eth_call ONLY if hasCode.
// ─────────────────────────────────────────────────────────────────────────────
export async function runArchivePostureCheck(opts: {
  transport: RpcTransport;
  archive: ArchiveTarget | null;
  artifacts: ReadonlyArray<ArtifactTarget>;
  now?: () => Date;
}): Promise<ArchivePostureResult> {
  const now = opts.now ?? (() => new Date());

  // STEP 1 — eth_chainId FIRST.
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

  let archiveContractHasCode = false;
  const checks: ArchiveCheckEntry[] = [];

  if (chainIdOk && opts.archive) {
    // STEP 2 — eth_getCode before ANY archive eth_call.
    try {
      const code = await opts.transport("eth_getCode", [opts.archive.address, "latest"]);
      archiveContractHasCode =
        typeof code === "string" && code !== "0x" && code !== "0x0" && code.length > 2;
    } catch {
      archiveContractHasCode = false;
    }

    if (archiveContractHasCode) {
      // STEP 3a — paused() once (global Pausable). Unknown stays null (never "not paused").
      let globalPaused: boolean | null = null;
      try {
        globalPaused = decodeBool(await ethCall(opts.transport, opts.archive.address, callData(SELECTOR_PAUSED)));
      } catch {
        globalPaused = null;
      }

      // STEP 3b — per-artifact safe reads.
      for (const t of opts.artifacts) {
        const errors: string[] = [];
        const idWord = encodeUint256(BigInt(t.id));

        // getArtifactCore → ONLY `configured` surfaced as `exists`.
        let exists: boolean | null = null;
        try {
          const decoded = decodeArtifactCoreHex(
            await ethCall(opts.transport, opts.archive.address, callData(SELECTOR_GET_ARTIFACT_CORE, [idWord])),
          );
          if (decoded.ok) exists = decoded.configured;
          else errors.push(`ARTIFACT_CORE_${decoded.shapeMismatch ? "SHAPE" : "DECODE"}:${decoded.reason}`);
        } catch {
          errors.push("ARTIFACT_CORE_REVERT");
        }

        // remainingSupply → artifact contract state (not financial).
        let remainingSupply: number | null = null;
        try {
          const big = decodeUint256Word(
            await ethCall(opts.transport, opts.archive.address, callData(SELECTOR_REMAINING_SUPPLY, [idWord])),
          );
          if (big === null) errors.push("REMAINING_SUPPLY_DECODE");
          else if (big > BigInt(Number.MAX_SAFE_INTEGER)) {
            errors.push("REMAINING_SUPPLY_OUT_OF_RANGE");
          } else remainingSupply = Number(big);
        } catch {
          errors.push("REMAINING_SUPPLY_REVERT");
        }

        // isMintable(id, REFERENCE_WALLET, 1) → reference-wallet display eligibility.
        // A revert is legitimate (owner-only / not-configured) → null, no error.
        let mintableReference: boolean | null = null;
        try {
          const data = callData(SELECTOR_IS_MINTABLE, [
            idWord,
            encodeAddress(REFERENCE_WALLET),
            encodeUint256(1n),
          ]);
          const decoded = decodeBool(await ethCall(opts.transport, opts.archive.address, data));
          if (decoded === null) errors.push("IS_MINTABLE_DECODE");
          else mintableReference = decoded;
        } catch {
          mintableReference = null;
        }

        // uri(id) → classified; the raw value is NEVER emitted.
        let uriStatus: UriStatus = "unreadable";
        try {
          uriStatus = classifyUri(
            decodeAbiString(await ethCall(opts.transport, opts.archive.address, callData(SELECTOR_URI, [idWord]))),
          );
        } catch {
          uriStatus = "unreadable";
        }

        checks.push({
          key: t.key,
          id: t.id,
          registryActivation: t.activation,
          configuredOnChain: t.configuredOnChain,
          publicMintAllowed: t.publicMintAllowed,
          readable: exists !== null,
          posture: { exists, mintableReference, paused: globalPaused, remainingSupply },
          uriStatus,
          error: errors.length ? errors.join("; ") : null,
        });
      }
    }
  }

  const artifactsReadable = checks.filter((c) => c.readable).length;

  return {
    mode: "INTERNAL_AVALANCHE_ARCHIVE_POSTURE_CHECK",
    rpcReachable,
    chainIdExpected: EXPECTED_CHAIN_ID,
    chainIdExpectedHex: EXPECTED_CHAIN_ID_HEX,
    chainIdActual,
    chainIdActualHex,
    chainIdOk,
    wrongChain,
    archiveContractHasCode,
    artifactsChecked: checks.length,
    artifactsReadable,
    checks,
    cached: false,
    asOf: now().toISOString(),
  };
}

// ── Short in-memory cache + request coalescing (mirrors Slices 2.11/2.13) ─────
let cacheEntry: { at: number; result: ArchivePostureResult } | null = null;
let inFlight: Promise<ArchivePostureResult> | null = null;

export function __resetArchivePostureCache(): void {
  cacheEntry = null;
  inFlight = null;
}

export async function getArchivePostureCheck(opts: {
  transport: RpcTransport;
  archive: ArchiveTarget | null;
  artifacts: ReadonlyArray<ArtifactTarget>;
  now?: () => Date;
  ttlMs?: number;
}): Promise<ArchivePostureResult> {
  const ttl = opts.ttlMs ?? CACHE_TTL_MS;
  if (cacheEntry && Date.now() - cacheEntry.at < ttl) {
    return { ...cacheEntry.result, cached: true };
  }
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const result = await runArchivePostureCheck(opts);
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
  const archive = selectArchiveTarget();
  const artifacts = selectArtifactTargets();

  console.log("Internal Avalanche Archive-1155 Posture Check — Phase 1 Slice 2.14");
  console.log("=".repeat(78));
  console.log(`  archive target present (by safe key): ${archive ? archive.key : "(none)"}`);
  console.log(`  artifact ids from registry: ${artifacts.map((a) => a.id).join(", ")}`);
  console.log("  approved methods: eth_chainId, eth_getCode, eth_call(getArtifactCore/remainingSupply/paused/isMintable/uri)");
  console.log("  NOT executed this slice: balanceOf, balanceOfBatch, walletRemaining, owner, treasury, mint, events");
  console.log("-".repeat(78));

  const result = await getArchivePostureCheck({ transport, archive, artifacts });
  const serialized = JSON.stringify(result, null, 2);
  assertNoAddressLeak(serialized); // defense-in-depth before printing
  console.log(serialized);

  if (!result.rpcReachable) {
    console.error("\nARCHIVE POSTURE UNAVAILABLE: RPC was not reachable. No results trusted.");
    process.exit(1);
  }
  if (!result.chainIdOk) {
    console.error(
      `\nFAILED CLOSED: chainId ${result.chainIdActual ?? "unknown"} is not Avalanche C-Chain (43114). No archive reads were performed.`,
    );
    process.exit(1);
  }
  if (!result.archiveContractHasCode) {
    console.error("\nFAILED CLOSED: Archive1155 contract has no code on this chain. No artifact reads were performed.");
    process.exit(1);
  }

  // Fail closed on genuine ABI-shape drift (returned data that the canon
  // validator rejects) — "if ABI shape differs from expectation, stop and report".
  const shapeDrift = result.checks.filter((c) => c.error && c.error.includes("ARTIFACT_CORE_SHAPE"));
  if (shapeDrift.length > 0) {
    console.error("\nABI SHAPE DRIFT: getArtifactCore returned an unexpected tuple shape:");
    for (const c of shapeDrift) console.error(`  id ${c.id}: ${c.error}`);
    process.exit(1);
  }

  console.log(
    `\nOK: Avalanche C-Chain verified (43114), Archive1155 has code. ${result.artifactsReadable}/${result.artifactsChecked} artifact(s) returned safe posture; no ABI drift.`,
  );
}

const invokedDirectly =
  !!process.argv[1] && basename(process.argv[1]) === "avalanche-archive-posture-check.ts";
if (invokedDirectly) {
  void main();
}
