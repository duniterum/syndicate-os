/**
 * Read-only Avalanche C-Chain JSON-RPC transport (SERVED, canon-free) — Slice 2.23A.
 * ---------------------------------------------------------------------------------
 * A minimal, safety-hardened JSON-RPC transport for the protocol-reality read
 * path. This module is compiled into the api-server program, so it MUST stay
 * canon-free: it imports nothing from `src/canon` (which the tsconfig excludes)
 * and hardcodes only public, non-secret chain constants. Curated contract
 * addresses live in `src/data/protocolTargets.ts` (server-side only, never
 * emitted into any payload).
 *
 * Read-only by construction:
 *   - No private key, no wallet, no transaction, no chain write.
 *   - Only eth_chainId / eth_getCode / eth_call are ever issued by callers.
 *   - https-only endpoints, AbortController timeout, ordered endpoint fallback.
 *
 * The fetch transport + endpoint resolution + address-leak guard mirror the
 * internal Slice 2.11/2.13 CLI checks, re-implemented here WITHOUT importing the
 * vendored canon (a reconcile guard verifies these served constants/targets
 * still match canon).
 */

// ── Chain constants (Avalanche C-Chain, public + non-secret) ─────────────────
export const EXPECTED_CHAIN_ID = 43114 as const;
export const EXPECTED_CHAIN_ID_HEX = "0xa86a" as const;

// ── Founder-approved RPC endpoints (server-side only, no secrets) ─────────────
const APPROVED_PRIMARY = "https://api.avax.network/ext/bc/C/rpc";
const APPROVED_FALLBACK = "https://avalanche-c-chain-rpc.publicnode.com";

export const DEFAULT_TIMEOUT_MS = 8000;

/** A JSON-RPC transport: resolves the unwrapped `result`, or throws on failure. */
export type RpcTransport = (method: string, params: unknown[]) => Promise<unknown>;

// ── Safety: a full 0x address must NEVER appear in serialized output ──────────
export const FULL_ADDRESS_RE = /0x[0-9a-fA-F]{40}/;

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
 * Endpoints used this run. Defaults to the founder-approved https endpoints;
 * optional env overrides (AVALANCHE_RPC_URL / AVALANCHE_RPC_URL_FALLBACK) may
 * point at another https endpoint. Returns deduped URL strings only.
 */
export function resolveEndpoints(): string[] {
  const primary = readEnvUrl(process.env["AVALANCHE_RPC_URL"]) ?? APPROVED_PRIMARY;
  const fallback = readEnvUrl(process.env["AVALANCHE_RPC_URL_FALLBACK"]) ?? APPROVED_FALLBACK;
  return primary === fallback ? [primary] : [primary, fallback];
}

// ── wss endpoint (PENDING — the event indexer's transport; no consumer yet) ────
// Validated wss-only reader for AVALANCHE_RPC_WSS_URL, kept beside resolveEndpoints
// so the whole RPC env surface lives in one place. A QuickNode endpoint URL embeds
// an auth token, so this is a SECRET supplied via the host's secrets UI — never a
// commit, never a default. Returns null when unset/invalid; the future event-backbone
// slice (indexer → activity feed) is its sole intended consumer.
function readEnvWss(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  try {
    return new URL(s).protocol === "wss:" ? s : null;
  } catch {
    return null;
  }
}

/** The WSS RPC endpoint for the (PENDING) event indexer, or null if not provisioned. */
export function resolveWssEndpoint(): string | null {
  return readEnvWss(process.env["AVALANCHE_RPC_WSS_URL"]);
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

// ── Runtime self-guard: refuse to emit output containing a full address ───────
export function assertNoAddressLeak(serialized: string): void {
  if (FULL_ADDRESS_RE.test(serialized)) {
    throw new Error(
      "SAFETY VIOLATION: a full 0x address was detected in protocol-reality output; refusing to emit.",
    );
  }
}
