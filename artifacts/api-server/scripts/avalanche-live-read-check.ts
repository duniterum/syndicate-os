/**
 * Internal Avalanche Live-Read Check — Phase 1 Slice 2.11 (infrastructure proof only)
 * ---------------------------------------------------------------------------------
 * The SMALLEST possible server-side live-read path. It proves the app can safely
 * reach Avalanche C-Chain RPC and verify contract *deployment existence* WITHOUT
 * exposing any address, amount, wallet, balance, supply, price, member, or PII.
 *
 * This is INTERNAL-ONLY. It is a CLI script (run via tsx), NOT an HTTP route and
 * NOT imported by the compiled server. It lives under `scripts/` which is outside
 * the api-server TypeScript program (`include: ["src"]`), so importing the vendored
 * canon here never pulls canon into the app's `tsc --noEmit` typecheck.
 *
 * Run:
 *   pnpm --filter @workspace/api-server run live-read:check
 *   (guard/tests:)  pnpm --filter @workspace/api-server run live-read:guard
 *
 * Chain discipline (Avalanche C-Chain ONLY — NOT Ethereum mainnet):
 *   1. The FIRST RPC call is ALWAYS eth_chainId.
 *   2. Expected chainId: 43114 decimal / 0xa86a hex.
 *   3. If chainId is anything else (e.g. 1 / 0x1 = Ethereum mainnet) we FAIL CLOSED:
 *      eth_getCode is NEVER called and no contract result is trusted.
 *   4. If RPC is unreachable we return an explicit unavailable state — never a
 *      fabricated success.
 *
 * Output: only mode, rpcReachable, chainId{Expected,Actual}(+hex), chainIdOk,
 * wrongChain, contract counts, and per-contract { key, deployed, error }. The check
 * key is a safe internal contract name (e.g. "SYN_TOKEN"); a full 0x address is
 * NEVER emitted (a runtime guard refuses to print output that contains one).
 *
 * No private key. No wallet. No chain writes. No transactions. Read-only.
 */

import { basename } from "node:path";

import {
  CONTRACT_REGISTRY,
  type ContractRole,
} from "../src/canon/the-syndicate/contracts/contract-registry";
// Imported ONLY to reconcile/report canon's RPC config against the founder-approved
// endpoints. We do NOT route live calls through canon endpoints (see resolveEndpoints).
import {
  AVALANCHE_RPC_URL as CANON_RPC_PRIMARY,
  AVALANCHE_RPC_URL_FALLBACK as CANON_RPC_FALLBACK,
  AVALANCHE_CHAIN_ID as CANON_CHAIN_ID,
} from "../src/canon/the-syndicate/contracts/syndicate-config";

// ── Chain constants (Avalanche C-Chain) ──────────────────────────────────────
export const EXPECTED_CHAIN_ID = 43114 as const;
export const EXPECTED_CHAIN_ID_HEX = "0xa86a" as const;

// ── Founder-approved RPC endpoints (Slice 2.11). Server-side only, no secrets. ─
const APPROVED_PRIMARY = "https://api.avax.network/ext/bc/C/rpc";
const APPROVED_FALLBACK = "https://avalanche-c-chain-rpc.publicnode.com";

export const DEFAULT_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 30_000;

// ── Public output shape (exactly per founder spec) ───────────────────────────
export type CheckEntry = {
  /** Safe internal contract key/name only — never an address. */
  key: string;
  deployed: boolean;
  error: string | null;
};

export type LiveReadCheckResult = {
  mode: "INTERNAL_AVALANCHE_LIVE_READ_CHECK";
  rpcReachable: boolean;
  chainIdExpected: typeof EXPECTED_CHAIN_ID;
  chainIdExpectedHex: typeof EXPECTED_CHAIN_ID_HEX;
  chainIdActual: number | null;
  chainIdActualHex: string | null;
  chainIdOk: boolean;
  wrongChain: boolean;
  contractsChecked: number;
  contractsWithCode: number;
  contractsMissingCode: number;
  checks: CheckEntry[];
  cached: boolean;
  asOf: string;
};

/** A JSON-RPC transport: resolves the unwrapped `result`, or throws on failure. */
export type RpcTransport = (method: string, params: unknown[]) => Promise<unknown>;

export type ContractTarget = { key: string; address: string };

// ── Safety: a full 0x address must NEVER appear in serialized output ──────────
export const FULL_ADDRESS_RE = /0x[0-9a-fA-F]{40}/;

// ─────────────────────────────────────────────────────────────────────────────
// Contract target selection (from vendored canon registry)
// Only true *contract* roles get an existence check. Wallet roles are EOAs (no
// bytecode) and are excluded, as are PENDING entries (address === null).
// ─────────────────────────────────────────────────────────────────────────────
const CONTRACT_ROLES_FOR_EXISTENCE: ReadonlySet<ContractRole> = new Set<ContractRole>([
  "token",
  "stablecoin",
  "sale",
  "source-registry",
  "archive1155",
  "lp-pair",
]);

export function selectContractTargets(): ContractTarget[] {
  return CONTRACT_REGISTRY.filter(
    (c) =>
      (c.status === "LIVE" || c.status === "DEPLOYED") &&
      CONTRACT_ROLES_FOR_EXISTENCE.has(c.role) &&
      typeof c.address === "string" &&
      c.address.length > 0,
  ).map((c) => ({ key: c.key, address: c.address as string }));
}

// ── env helpers (optional overrides, https-only, no secrets in code) ──────────
function readEnvUrl(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return undefined;
  try {
    return new URL(s).protocol === "https:" ? s : undefined;
  } catch {
    return undefined;
  }
}

export function readEnvInt(v: unknown): number | undefined {
  if (typeof v !== "string") return undefined;
  const n = Number.parseInt(v.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * Endpoints actually used this run. Defaults to the founder-approved endpoints;
 * optional env overrides (AVALANCHE_RPC_URL / AVALANCHE_RPC_URL_FALLBACK) may
 * point at another https endpoint. We never silently adopt canon's endpoints.
 */
export function resolveEndpoints(): { url: string; fromEnv: boolean }[] {
  const envPrimary = readEnvUrl(process.env["AVALANCHE_RPC_URL"]);
  const envFallback = readEnvUrl(process.env["AVALANCHE_RPC_URL_FALLBACK"]);
  const primary = { url: envPrimary ?? APPROVED_PRIMARY, fromEnv: Boolean(envPrimary) };
  const fallback = { url: envFallback ?? APPROVED_FALLBACK, fromEnv: Boolean(envFallback) };
  return primary.url === fallback.url ? [primary] : [primary, fallback];
}

// ── Real fetch-based JSON-RPC transport (timeout + endpoint fallback) ─────────
export function makeFetchTransport(urls: string[], timeoutMs = DEFAULT_TIMEOUT_MS): RpcTransport {
  let id = 0;
  return async (method, params) => {
    let lastErr: unknown;
    for (const url of urls) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: (id += 1), method, params }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { result?: unknown; error?: { message?: string } };
        if (json.error) throw new Error(`RPC error: ${json.error.message ?? "unknown"}`);
        return json.result;
      } catch (err) {
        lastErr = err;
        // fall through to the next endpoint
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error("All RPC endpoints failed");
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core check (pure: no cache, no network of its own — transport is injected).
// chainId is ALWAYS the first call; eth_getCode runs ONLY if chainId === 43114.
// ─────────────────────────────────────────────────────────────────────────────
export async function runAvalancheLiveReadCheck(opts: {
  transport: RpcTransport;
  targets: ReadonlyArray<ContractTarget>;
  now?: () => Date;
}): Promise<LiveReadCheckResult> {
  const now = opts.now ?? (() => new Date());

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
    } else {
      // Reachable but unparseable → unknown chain → fail closed (no getCode).
      chainIdActual = null;
      chainIdActualHex = null;
    }
  } catch {
    rpcReachable = false;
  }

  const chainIdOk = chainIdActual === EXPECTED_CHAIN_ID;
  const wrongChain = chainIdActual !== null && chainIdActual !== EXPECTED_CHAIN_ID;

  // STEP 2 — eth_getCode ONLY when chainId is verified as Avalanche C-Chain.
  const checks: CheckEntry[] = [];
  if (chainIdOk) {
    for (const target of opts.targets) {
      try {
        const code = await opts.transport("eth_getCode", [target.address, "latest"]);
        const deployed =
          typeof code === "string" && code !== "0x" && code !== "0x0" && code.length > 2;
        checks.push({ key: target.key, deployed, error: null });
      } catch {
        checks.push({ key: target.key, deployed: false, error: "UNAVAILABLE" });
      }
    }
  }

  const contractsWithCode = checks.filter((c) => c.deployed).length;

  return {
    mode: "INTERNAL_AVALANCHE_LIVE_READ_CHECK",
    rpcReachable,
    chainIdExpected: EXPECTED_CHAIN_ID,
    chainIdExpectedHex: EXPECTED_CHAIN_ID_HEX,
    chainIdActual,
    chainIdActualHex,
    chainIdOk,
    wrongChain,
    contractsChecked: checks.length,
    contractsWithCode,
    contractsMissingCode: checks.length - contractsWithCode,
    checks,
    cached: false,
    asOf: now().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Short in-memory cache + request coalescing (per founder spec, minimal).
// ─────────────────────────────────────────────────────────────────────────────
let cacheEntry: { at: number; result: LiveReadCheckResult } | null = null;
let inFlight: Promise<LiveReadCheckResult> | null = null;

/** Test/maintenance hook: clear the in-memory cache + in-flight coalescing. */
export function __resetLiveReadCache(): void {
  cacheEntry = null;
  inFlight = null;
}

export async function getLiveReadCheck(opts: {
  transport: RpcTransport;
  targets: ReadonlyArray<ContractTarget>;
  now?: () => Date;
  ttlMs?: number;
}): Promise<LiveReadCheckResult> {
  const ttl = opts.ttlMs ?? CACHE_TTL_MS;
  if (cacheEntry && Date.now() - cacheEntry.at < ttl) {
    return { ...cacheEntry.result, cached: true };
  }
  if (inFlight) return inFlight; // coalesce concurrent callers onto one request
  inFlight = (async () => {
    try {
      const result = await runAvalancheLiveReadCheck(opts);
      cacheEntry = { at: Date.now(), result };
      return result;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

// ── Runtime self-guard: refuse to emit output containing a full address ───────
export function assertAddressSafeAggregate(serialized: string): void {
  if (FULL_ADDRESS_RE.test(serialized)) {
    throw new Error(
      "SAFETY VIOLATION: a full 0x address was detected in live-read output; refusing to emit.",
    );
  }
}

// ── RPC reconciliation report (founder requested: report any canon mismatch) ──
function reconciliationReport(used: { url: string; fromEnv: boolean }[]): string {
  const match = (a: string, b: string) => (a === b ? "MATCH" : "MISMATCH");
  const usedDesc = used
    .map((e, i) => {
      const label = i === 0 ? "primary" : "fallback";
      // Never print an env-provided URL (it could contain a provider key).
      return e.fromEnv ? `${label}=<env override (https)>` : `${label}=${e.url}`;
    })
    .join(", ");
  return [
    "RPC reconciliation (canon vs founder-approved):",
    `  approved primary : ${APPROVED_PRIMARY}`,
    `  approved fallback: ${APPROVED_FALLBACK}`,
    `  canon default primary : ${CANON_RPC_PRIMARY}  [${match(CANON_RPC_PRIMARY, APPROVED_PRIMARY)} vs approved primary]`,
    `  canon default fallback: ${CANON_RPC_FALLBACK}  [${match(CANON_RPC_FALLBACK, APPROVED_FALLBACK)} vs approved fallback]`,
    `  canon chainId: ${CANON_CHAIN_ID}  [${match(String(CANON_CHAIN_ID), String(EXPECTED_CHAIN_ID))} vs expected ${EXPECTED_CHAIN_ID}]`,
    `  endpoints used this run: ${usedDesc}`,
    "  note: canon fallback is Ankr; founder-approved fallback is publicnode — this run uses the APPROVED endpoints, not canon's.",
  ].join("\n");
}

// ── CLI entry (runs ONLY when invoked directly, never on import) ──────────────
async function main(): Promise<void> {
  const endpoints = resolveEndpoints();
  const timeoutMs = readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(
    endpoints.map((e) => e.url),
    timeoutMs,
  );
  const targets = selectContractTargets();

  console.log("Internal Avalanche Live-Read Check — Phase 1 Slice 2.11");
  console.log("=".repeat(58));
  console.log(reconciliationReport(endpoints));
  console.log(`  contract targets selected (by safe key): ${targets.map((t) => t.key).join(", ")}`);
  console.log("-".repeat(58));

  const result = await getLiveReadCheck({ transport, targets });
  const serialized = JSON.stringify(result, null, 2);
  assertAddressSafeAggregate(serialized); // defense-in-depth before printing
  console.log(serialized);

  // Fail closed (non-zero exit) on unreachable RPC or wrong chain.
  if (!result.rpcReachable) {
    console.error("\nLIVE-READ UNAVAILABLE: RPC was not reachable. No results trusted.");
    process.exit(1);
  }
  if (!result.chainIdOk) {
    console.error(
      `\nLIVE-READ FAILED CLOSED: chainId ${result.chainIdActual ?? "unknown"} is not Avalanche C-Chain (43114). No contract checks were performed.`,
    );
    process.exit(1);
  }
  console.log(
    `\nOK: Avalanche C-Chain verified (43114). ${result.contractsWithCode}/${result.contractsChecked} target contracts have on-chain code.`,
  );
}

const invokedDirectly =
  !!process.argv[1] && basename(process.argv[1]) === "avalanche-live-read-check.ts";
if (invokedDirectly) {
  void main();
}
