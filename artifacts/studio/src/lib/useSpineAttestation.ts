// lib/useSpineAttestation.ts — the always-fresh verified member attestation
// (founder order 2026-08-02: « it must be always up to date »).
// ---------------------------------------------------------------------------
// The backbone's continuity spine re-verifies membership EVERY cycle (the
// same determinism + live-reconciliation pipeline the founder-armed script
// uses) and publishes its latest VERIFIED run on the public status payload.
// This hook reads it tolerantly: any missing/odd shape → null, and callers
// fall back to the committed snapshot (the honest boot state) — never a
// broken line, never an invented figure. Re-read on a cycle-scale interval.

import { useEffect, useState } from "react";

export interface SpineAttestationReadback {
  readonly memberTotal: number;
  readonly onchainMemberCount: number;
  readonly verifiedAtIso: string;
}

/** ~one backbone cycle — fresh enough for a provenance line, cheap for the api. */
const REFRESH_MS = 120_000;

function parseAttestation(body: unknown): SpineAttestationReadback | null {
  if (typeof body !== "object" || body === null) return null;
  const last = (body as Record<string, unknown>).lastSuccess;
  if (typeof last !== "object" || last === null) return null;
  const spine = (last as Record<string, unknown>).continuitySpine;
  if (typeof spine !== "object" || spine === null) return null;
  const att = (spine as Record<string, unknown>).attestation;
  if (typeof att !== "object" || att === null) return null;
  const a = att as Record<string, unknown>;
  if (
    typeof a.memberTotal === "number" &&
    Number.isInteger(a.memberTotal) &&
    a.memberTotal >= 0 &&
    typeof a.onchainMemberCount === "number" &&
    typeof a.verifiedAtIso === "string" &&
    a.verifiedAtIso.length >= 10
  ) {
    return {
      memberTotal: a.memberTotal,
      onchainMemberCount: a.onchainMemberCount,
      verifiedAtIso: a.verifiedAtIso,
    };
  }
  return null;
}

export function useSpineAttestation(): SpineAttestationReadback | null {
  const [attestation, setAttestation] = useState<SpineAttestationReadback | null>(null);
  useEffect(() => {
    let active = true;
    const read = () => {
      void fetch("/api/backbone/status")
        .then((res) => (res.ok ? res.json() : null))
        .then((body: unknown) => {
          if (active) {
            const parsed = parseAttestation(body);
            if (parsed !== null) setAttestation(parsed);
          }
        })
        .catch(() => {
          // Transport miss: keep the last good attestation (or the callers'
          // snapshot fallback) — never clear to a broken line.
        });
    };
    read();
    const timer = window.setInterval(read, REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);
  return attestation;
}
