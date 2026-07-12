import { cn } from "@/lib/utils";
import { VerifyOnChain } from "@/components/VerifyOnChain";

// MembersProvenance — the honest dual-authority line for the member figure.
// The headline is the LIVE continuous memberCount(); this line states, from day
// one, the two never-collapsed authorities (freeze/root #1–8 + live V3-emitted)
// AND the verified snapshot's point-in-time attestation with its as-of. When the
// live engine runs ahead of the snapshot (the STALE story), we say so plainly
// rather than let a reader discover two contradicting public numbers.
//
// THE HONEST READBACK (12/11 doctrine, founder decision — SHOW BOTH, never fix
// silently): memberCount() counts SEATS, not people. One wallet holds two seats
// — a V2b-era member who bought again before the claim gate existed. When the
// server's DERIVED figures are live (distinctWallets + seatOverlap, computed
// from on-chain memberNumberOf() reads — counts only, no wallet served), we
// state seats vs distinct wallets in the open, with a verify link. Built in
// public: the error is dated, signed, and impossible to erase — so we say it.
//
// Fail-closed: if the split can't be stated honestly (no live reads), render
// nothing — never a bare or half-true provenance. The readback line renders
// only when BOTH derived figures are live AND an overlap actually exists.

interface MembersProvenanceProps {
  historicalFreeze: number | null;
  v3Emitted: number | null;
  snapshotMemberTotal: number | null;
  snapshotAsOf: string | null;
  membersDiverged: boolean;
  /** DERIVED live server-side (counts only). Null → readback line omitted. */
  distinctWallets?: number | null;
  /** Wallets holding two seats (pre-gate duplicates). Null → line omitted. */
  seatOverlap?: number | null;
  variant?: "full" | "compact";
  className?: string;
}

/** ISO timestamp → YYYY-MM-DD (matches the LivingSignature date style). */
function asOfDate(iso: string | null): string | null {
  return iso && iso.length >= 10 ? iso.slice(0, 10) : null;
}

export function MembersProvenance({
  historicalFreeze,
  v3Emitted,
  snapshotMemberTotal,
  snapshotAsOf,
  membersDiverged,
  distinctWallets = null,
  seatOverlap = null,
  variant = "full",
  className,
}: MembersProvenanceProps) {
  if (historicalFreeze === null || v3Emitted === null) return null;
  const date = asOfDate(snapshotAsOf);
  const hasSnapshot = snapshotMemberTotal !== null && date !== null;
  // Seats issued = the two authorities combined (the same live figures the
  // headline uses); the readback states it against the derived distinct count.
  const seatsIssued = historicalFreeze + v3Emitted;
  const hasReadback =
    distinctWallets !== null && seatOverlap !== null && seatOverlap > 0;

  if (variant === "compact") {
    return (
      <p className={cn("font-mono text-[10px] leading-relaxed text-muted-foreground", className)}>
        {historicalFreeze} historical · {v3Emitted} live V3
        {hasSnapshot ? (
          <>
            {" "}· snapshot {snapshotMemberTotal} as of {date}
            {membersDiverged ? " (live runs ahead)" : ""}
          </>
        ) : null}
        {hasReadback ? (
          <span data-testid="text-members-readback-compact">
            {" "}· {seatsIssued} seats / {distinctWallets} distinct wallets ({seatOverlap} holds two)
          </span>
        ) : null}
      </p>
    );
  }

  return (
    <div className={className}>
      <p className="type-body text-muted-foreground">
        <strong className="text-foreground">{historicalFreeze}</strong> verified historical (freeze/root) +{" "}
        <strong className="text-foreground">{v3Emitted}</strong> live V3-emitted — two authorities, never collapsed.
        {hasSnapshot ? (
          <>
            {" "}
            {membersDiverged ? "The live engine runs ahead of the verified snapshot" : "Verified in the snapshot"}:{" "}
            <strong className="text-foreground">{snapshotMemberTotal}</strong> as of {date}
            {membersDiverged
              ? " — a point-in-time attestation the next verified rebuild catches up to."
              : "."}
          </>
        ) : null}
      </p>
      {hasReadback ? (
        <p className="type-body mt-1.5 text-muted-foreground" data-testid="text-members-readback">
          <strong className="text-foreground">{seatsIssued}</strong> seats issued ·{" "}
          <strong className="text-foreground">{distinctWallets}</strong> distinct wallets —{" "}
          {seatOverlap === 1 ? "one wallet holds two seats" : `${seatOverlap} wallets hold two seats`} — a
          V2b-era member who bought again before the claim gate existed. Read live from the engine,
          shown rather than hidden. <VerifyOnChain ids={["membershipSaleV3"]} />
        </p>
      ) : null}
    </div>
  );
}
