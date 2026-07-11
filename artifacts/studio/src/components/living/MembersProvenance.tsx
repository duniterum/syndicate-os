import { cn } from "@/lib/utils";

// MembersProvenance — the honest dual-authority line for the member figure.
// The headline is the LIVE continuous memberCount(); this line states, from day
// one, the two never-collapsed authorities (freeze/root #1–8 + live V3-emitted)
// AND the verified snapshot's point-in-time attestation with its as-of. When the
// live engine runs ahead of the snapshot (the STALE story), we say so plainly
// rather than let a reader discover two contradicting public numbers.
//
// Fail-closed: if the split can't be stated honestly (no live reads), render
// nothing — never a bare or half-true provenance.

interface MembersProvenanceProps {
  historicalFreeze: number | null;
  v3Emitted: number | null;
  snapshotMemberTotal: number | null;
  snapshotAsOf: string | null;
  membersDiverged: boolean;
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
  variant = "full",
  className,
}: MembersProvenanceProps) {
  if (historicalFreeze === null || v3Emitted === null) return null;
  const date = asOfDate(snapshotAsOf);
  const hasSnapshot = snapshotMemberTotal !== null && date !== null;

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
      </p>
    );
  }

  return (
    <p className={cn("type-body text-muted-foreground", className)}>
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
  );
}
