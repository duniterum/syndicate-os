// ④ The living seat line — the hero's chain-read invitation, harvested from
// the origin's next-member surface and rebuilt LIVE-PRODUCTION (the origin
// was read-only; here the next seat is genuinely open for purchase, in-page,
// today). Speaks in SEATS: memberCount() counts seats, one wallet can hold
// two — this line never says "Members". The next-seat number is an invitation
// derived from the live count (current seats + 1); it renders ONLY while the
// live read is available and falls closed to an honest generic sentence —
// a member's recorded seat number still only ever comes from the emitted event.
import { useHeroReality } from "@/components/hero/useHeroReality";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { MembersProvenance } from "@/components/living/MembersProvenance";
import { heroSystem } from "@/config/syndicateFacts";
import type { VerifyLinkId } from "@workspace/api-client-react";

// memberCount() lives on the active sale engine — the line's verify path.
const SEAT_LINE_VERIFY_IDS: readonly VerifyLinkId[] = ["membershipSaleV3"];

export function HeroSeatLine({ className = "" }: { className?: string }) {
  const reality = useHeroReality();
  const copy = heroSystem.seatLine;
  const seats = reality.membersTotalNumber;

  if (seats === null) {
    return (
      <div className={className}>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {reality.loading ? copy.checking : copy.fallback}
        </p>
      </div>
    );
  }

  const nextSeat = seats + 1;
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] md:text-xs">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" aria-hidden />
        <span className="text-foreground dark:text-white">
          {seats.toLocaleString("en-US")} {copy.countSuffix}
        </span>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <span className="text-gold">
          {copy.nextLead} #{nextSeat.toLocaleString("en-US")} — {copy.openNote}
        </span>
        <VerifyOnChain ids={SEAT_LINE_VERIFY_IDS} />
      </div>
      <p className="mt-1 text-sm text-foreground/85 md:text-base">
        {copy.couldBeLead}{" "}
        <span className="font-semibold text-foreground dark:text-white">
          seat #{nextSeat.toLocaleString("en-US")}
        </span>{" "}
        {copy.couldBeTail}
      </p>
      <MembersProvenance
        variant="compact"
        className="mt-1.5"
        historicalFreeze={reality.historicalFreeze}
        v3Emitted={reality.v3Emitted}
        snapshotMemberTotal={reality.snapshotMemberTotal}
        snapshotAsOf={reality.snapshotAsOf}
        membersDiverged={reality.membersDiverged}
        distinctWallets={reality.distinctWallets}
        seatOverlap={reality.seatOverlap}
      />
    </div>
  );
}
