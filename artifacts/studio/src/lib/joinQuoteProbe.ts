// lib/joinQuoteProbe.ts — K3.b: the fail-closed proof, automated.
// ---------------------------------------------------------------------------
// The manual pre-activation check ("open /join?source= and verify the quote
// shows NO referral line while PAUSED") becomes a CODE gate: the server's own
// public quote endpoint is asked, with a nominal probe amount, whether it
// REFUSES the source — exactly what the founder used to verify by eye in a
// second tab. Raw I/O lives here (the wallet zone's no-raw-fetch convention);
// fail-closed: any doubt → null, never a verdict.

/** A nominal probe amount (raw 6-decimal USDC base units — $5). The quote's
 * refusal decision depends on the SOURCE's registry state, not the amount. */
const PROBE_GROSS_USDC = "5000000";

/**
 * true  = the live quote REFUSES the source (sourceValid === false — the
 *         fail-closed proof holds while the source is paused);
 * false = the quote ACCEPTS the source (it is live on the registry);
 * null  = the probe did not run / did not answer (fail closed — no verdict).
 */
export async function probeQuoteRefusal(
  sourceIdHex: string,
): Promise<boolean | null> {
  try {
    const res = await fetch(
      `/api/join/quote?grossUsdc=${PROBE_GROSS_USDC}&sourceId=${encodeURIComponent(sourceIdHex)}`,
      { method: "GET" },
    );
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const sourceValid = (body as Record<string, unknown>).sourceValid;
    if (typeof sourceValid !== "boolean") return null;
    return sourceValid === false;
  } catch {
    return null;
  }
}
