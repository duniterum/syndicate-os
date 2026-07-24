// ─────────────────────────────────────────────────────────────────────────────
  // Vendored from duniterum/TheSyndicate main @ cf4ca34c74599de1324e77052f1a81dd15cb1cc0
  // source path: src/lib/chain-registry.ts
  // Read-only canon asset. Do not edit logic.
  // NOTE: This directory is excluded from the api-server TypeScript program and is
  // not yet imported by active app code. It exists as pinned local canon so future
  // status/contracts/proof/archive/token/sale wiring reads real files, not memory.
  // A future wiring slice owns any strict-mode / server-runtime adaptation.
// CONVERSION: (1) rewrote relative import "./syndicate-config" -> "../contracts/syndicate-config" to match the vendored folder layout (syndicate-config.ts lives under contracts/); (2) replaced the React/DOM "./explorer-preference" import with a self-contained no-op shim (ExplorerId/readExplorerPreference/applyPreferenceOrder); URL builders keep canonical order. No other logic changed.
  // ─────────────────────────────────────────────────────────────────────────────

  /**
 * Chain + Explorer Registry — single source of truth.
 *
 * Every chain id, RPC endpoint, explorer base, explorer URL builder, and
 * wallet-facing chain config in the codebase MUST be sourced from this
 * file. Never hand-build an explorer URL. Never re-declare the chain id.
 * Never assume a default tx path.
 *
 * Background — June 2026 incident:
 *   A Patron Seal USDC approval succeeded on-chain but the wallet-rendered
 *   link opened a 404:
 *       https://avascan.info/tx/0x96eb...   ← WRONG, no Avascan route
 *   Cause: Avascan's canonical tx path is /blockchain/c/tx/<hash>, not
 *   /tx/<hash>. MetaMask + viem strip paths from the configured explorer
 *   and append /tx/<hash> to the bare origin. Snowtrace tx pages live at
 *   the bare origin, so Snowtrace is the wallet-facing default.
 *
 * Rules (enforced by src/lib/__tests__/chain-registry-guard.test.ts):
 *   • Wallet-facing explorer default MUST be a bare origin (path === "/").
 *   • In-app links MUST flow through the helpers exported from this file
 *     (or the re-exported helpers in syndicate-config.ts).
 *   • Avascan C-Chain paths MUST use the /blockchain/c/<kind>/<value> form.
 *   • No component or hook may concatenate "avascan.info/tx", "snowtrace.io/tx",
 *     or "routescan.io/tx" by hand.
 */

import {
  AVALANCHE_CHAIN_ID,
  AVALANCHE_RPC_URL,
  AVALANCHE_RPC_URL_FALLBACK,
  AVALANCHE_RPC_ENDPOINTS,
  AVASCAN_C_CHAIN_BASE_URL,
  SNOWTRACE_BASE_URL,
  ROUTESCAN_BASE_URL,
  isTxHash,
  isLiveAddress,
  txExplorerUrl as canonicalTxUrl,
  txExplorerUrls as canonicalTxUrls,
  avascanTxExplorerUrl,
  snowtraceTxExplorerUrl,
  routescanTxExplorerUrl,
  explorerUrlForAddress,
} from "../contracts/syndicate-config";
// ── Vendoring shim (replaces "./explorer-preference") ─────────────────────────
  // Upstream explorer-preference is React/DOM client code (localStorage) and is
  // intentionally NOT vendored server-side. These no-op stand-ins keep the URL
  // builders' exact signatures while preserving canonical (unreordered) ordering.
  type ExplorerId = string;
  function readExplorerPreference(): ExplorerId | undefined { return undefined; }
  function applyPreferenceOrder<T>(items: T[], _preference?: ExplorerId): T[] { return items; }

// ─── Chain truth ──────────────────────────────────────────────────────────

export const CHAIN_REGISTRY = {
  id: AVALANCHE_CHAIN_ID,           // 43114
  name: "Avalanche C-Chain",
  shortName: "Avalanche",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpc: {
    primary: AVALANCHE_RPC_URL,
    fallback: AVALANCHE_RPC_URL_FALLBACK,
    all: AVALANCHE_RPC_ENDPOINTS,
  },
} as const;

// ─── Explorer truth ───────────────────────────────────────────────────────
//
// Each entry documents the explorer's canonical paths so future work has
// a single place to consult before adding a link.

export type ExplorerKind = "tx" | "address" | "token" | "contract" | "erc1155";

export const EXPLORER_REGISTRY = {
  /** Primary wallet-facing + in-app default. Bare origin — MetaMask/viem safe. */
  snowtrace: {
    name: "Snowtrace",
    origin: SNOWTRACE_BASE_URL,            // "https://snowtrace.io"
    paths: {
      tx: "/tx/{hash}",
      address: "/address/{address}",
      token: "/token/{address}",
      contract: "/address/{address}",
      // No first-class ERC-1155 token page; we link to the contract.
      erc1155: "/token/{address}?a={tokenId}",
    },
  },
  /** Canonical Avalanche-native explorer — REQUIRES "/blockchain/c" prefix. */
  avascan: {
    name: "Avascan",
    origin: "https://avascan.info",
    base: AVASCAN_C_CHAIN_BASE_URL,        // "https://avascan.info/blockchain/c"
    paths: {
      tx: "/blockchain/c/tx/{hash}",
      address: "/blockchain/c/address/{address}",
      token: "/blockchain/c/token/{address}",
      contract: "/blockchain/c/address/{address}",
      erc1155: "/blockchain/c/token/{address}",
    },
    /** Known broken path — must never be generated. */
    unsupported: { bareTxPath: "/tx/{hash}" },
  },
  routescan: {
    name: "Routescan",
    origin: ROUTESCAN_BASE_URL,            // "https://routescan.io"
    paths: {
      tx: "/tx/{hash}",
      address: "/address/{address}",
      token: "/address/{address}",
      contract: "/address/{address}/contract/43114/code",
      erc1155: "/address/{address}",
    },
  },
  sourcify: {
    name: "Sourcify",
    origin: "https://repo.sourcify.dev",
    paths: { contract: "/43114/{address}" },
  },
} as const;

// ─── Helpers — the ONLY sanctioned URL builders ───────────────────────────

/** Canonical tx URL (Snowtrace). Returns null for malformed hashes.
 *  Pass `respectPreference: true` to honor the user's saved explorer choice. */
export function txUrl(
  hash: string | undefined | null,
  opts: { respectPreference?: boolean; preference?: ExplorerId } = {},
): string | null {
  if (!isTxHash(hash)) return null;
  if (!opts.respectPreference) return canonicalTxUrl(hash);
  const ordered = applyPreferenceOrder(canonicalTxUrls(hash), opts.preference ?? readExplorerPreference());
  return ordered[0]?.href ?? canonicalTxUrl(hash);
}

/** Fan-out (Snowtrace + Avascan + Routescan), reordered so the user's saved
 *  preferred explorer is first. Empty array for bad input. */
export function txUrls(hash: string | undefined | null, preference?: ExplorerId) {
  if (!isTxHash(hash)) return [];
  return applyPreferenceOrder(canonicalTxUrls(hash), preference ?? readExplorerPreference());
}

/** Canonical EOA / wallet / contract address page (Snowtrace — the reliable
 *  default since 2026-07-24; Avascan address pages hang and stay a per-brand
 *  fan-out option only). */
export function addressUrl(address: string | undefined | null): string | null {
  if (!address || !isLiveAddress(address)) return null;
  return explorerUrlForAddress(address);
}

/** ERC-20 token landing page (Snowtrace — works for any ERC-20). */
export function tokenUrl(address: string | undefined | null): string | null {
  if (!address || !isLiveAddress(address)) return null;
  return `${SNOWTRACE_BASE_URL}/token/${address}`;
}

/** Verified-contract page. Same as addressUrl on Avalanche. */
export function contractUrl(address: string | undefined | null): string | null {
  return addressUrl(address);
}

/**
 * ERC-1155 token page. Avalanche explorers do not expose a stable per-id
 * landing route, so we link to the contract address and (when available)
 * append the token id query param Snowtrace honors.
 */
export function erc1155TokenUrl(
  contractAddress: string | undefined | null,
  tokenId: number | bigint | string,
): string | null {
  if (!contractAddress || !isLiveAddress(contractAddress)) return null;
  return `${SNOWTRACE_BASE_URL}/token/${contractAddress}?a=${tokenId}`;
}

// ─── Per-brand helpers ─────────────────────────────────────────────────────
// Use these when a component intentionally targets a specific explorer
// (e.g. "Verify on Avascan", "Routescan code tab"). Never hand-build
// these URLs in components or routes.

/** Avascan C-Chain address page. */
export function avascanAddressUrl(address: string | undefined | null): string | null {
  if (!address || !isLiveAddress(address)) return null;
  return `${EXPLORER_REGISTRY.avascan.origin}/blockchain/c/address/${address}`;
}

/** Avascan C-Chain ERC-20 / token page. */
export function avascanTokenUrl(address: string | undefined | null): string | null {
  if (!address || !isLiveAddress(address)) return null;
  return `${EXPLORER_REGISTRY.avascan.origin}/blockchain/c/token/${address}`;
}

/** Snowtrace token page (per-brand explicit variant of `tokenUrl`). */
export function snowtraceTokenUrl(address: string | undefined | null): string | null {
  if (!address || !isLiveAddress(address)) return null;
  return `${SNOWTRACE_BASE_URL}/token/${address}`;
}

/** Routescan verified-contract code tab (chain 43114). */
export function routescanContractCodeUrl(address: string | undefined | null): string | null {
  if (!address || !isLiveAddress(address)) return null;
  return `${ROUTESCAN_BASE_URL}/address/${address}/contract/43114/code`;
}

/** Safe fallback chain when the primary helper returns null. */
export function safeExplorerFallback(
  kind: ExplorerKind,
  value: string | undefined | null,
): string | null {
  if (!value) return null;
  switch (kind) {
    case "tx":       return txUrl(value);
    case "address":  return addressUrl(value);
    case "token":    return tokenUrl(value);
    case "contract": return contractUrl(value);
    case "erc1155":  return addressUrl(value);
  }
}

// Re-export the per-explorer helpers for callers that need a specific brand.
export {
  avascanTxExplorerUrl,
  snowtraceTxExplorerUrl,
  routescanTxExplorerUrl,
  isTxHash,
  isLiveAddress,
};
