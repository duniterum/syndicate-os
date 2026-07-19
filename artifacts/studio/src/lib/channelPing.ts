// lib/channelPing.ts — SPEC R3 (`&via=`) — the client channel beacons.
//
// Fire-and-forget, silent, in-memory-deduped pings to the api-server's
// anonymous channel zone (POST /api/channel/click|conversion — 204 always).
// The beacons NEVER touch the money path: a click pings on landing, a
// conversion pings AFTER the purchase receipt is already sealed on-chain,
// and every failure is swallowed (a lost beacon is a lost count, nothing
// more). The server is the authority on everything: it re-validates the
// formats, confirms the source exists on the registry, verifies a claimed
// conversion against the on-chain receipt, and stores ONLY aggregate daily
// counts — no cookie, no localStorage, no identifier ever exists client-side
// either (ADR-003: nothing about the visitor is kept anywhere).
//
// Dependency-free (no wallet imports — callable from anywhere, incl. the
// wallet module without adding a fetch to a wallet file's own scan surface).

const HEX32_RE = /^0x[0-9a-fA-F]{64}$/;
/** The channel-tag law — mirrors the server's pin exactly. */
const VIA_RE = /^[a-z0-9][a-z0-9_-]{0,23}$/;
const ZERO_BYTES32 = `0x${"0".repeat(64)}`;

// In-memory once-only dedupe (page-load scoped — a reload is a new landing).
const sentClicks = new Set<string>();
const sentConversions = new Set<string>();

/** Read + normalize the `via` tag from a search string; null when absent/invalid. */
export function parseViaTag(search: string): string | null {
  const raw = new URLSearchParams(search).get("via");
  if (raw === null) return null;
  const via = raw.trim().toLowerCase();
  return VIA_RE.test(via) ? via : null;
}

function post(path: string, body: Record<string, string>): void {
  try {
    void fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // never let a beacon throw into the caller
  }
}

/** Count this landing for (source, tag). No-ops silently on anything off. */
export function pingChannelClick(sourceId: string, via: string): void {
  if (!HEX32_RE.test(sourceId) || sourceId === ZERO_BYTES32 || !VIA_RE.test(via)) return;
  const key = `${sourceId.toLowerCase()}|${via}`;
  if (sentClicks.has(key)) return;
  sentClicks.add(key);
  post("/api/channel/click", { sourceId, via });
}

/**
 * Report a sealed purchase for the channel the landing carried. The via tag
 * is read from the CURRENT location (the /join checkout never navigates, so
 * the landing's query string is still present at receipt time); the source
 * id must be the receipt EVENT's own sourceId — the on-chain truth of which
 * source applied. The server re-verifies the tx before recording.
 */
export function pingChannelConversionFromLocation(sourceId: string, txHash: string): void {
  const via = parseViaTag(window.location.search);
  if (via === null) return;
  if (!HEX32_RE.test(sourceId) || sourceId === ZERO_BYTES32) return;
  if (!HEX32_RE.test(txHash)) return;
  const key = txHash.toLowerCase();
  if (sentConversions.has(key)) return;
  sentConversions.add(key);
  post("/api/channel/conversion", { sourceId, via, txHash });
}
