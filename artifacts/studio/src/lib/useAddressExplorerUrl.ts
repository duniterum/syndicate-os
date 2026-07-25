// lib/useAddressExplorerUrl.ts
//
// The Snowtrace /address/ URL for an EVM address — the ONE shared derivation so
// every surface links the same way (harmonize at source, not per-site patchwork).
//
// THE ADDRESS LAW (founder + research 2026-07-25, engraved in CLAUDE.md rule ①):
// EVM addresses are PUBLIC — shown short-form + an explorer link EVERYWHERE, the
// grade-AAA pattern (readability + independent verifiability). The explorer
// ORIGIN is derived from the served registry verify-link (never hardcoded); a
// null read renders no link (fail-closed — never a dead click).

import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";

/** Snowtrace `/address/<addr>` URL for a full EVM address, or null when the
 *  address or the served explorer origin is unavailable (fail-closed). */
export function useAddressExplorerUrl(
  address: string | null | undefined,
): string | null {
  const { data } = useGetProtocolVerifyLinks();
  const registryUrl =
    data?.links?.find((l) => l.id === "sourceRegistry")?.url ?? null;
  const origin = registryUrl
    ? (registryUrl.match(/^https?:\/\/[^/]+/)?.[0] ?? null)
    : null;
  return origin && address ? `${origin}/address/${address}` : null;
}
