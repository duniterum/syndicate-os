// wallet/JoinSeatLine.tsx (build-time-gated wallet module)
//
// The member-aware "Your seat" line on /join (founder-ordered polish,
// 2026-07-13, right after the first real purchase). The generic quote line
// says "Seat #N — if yours is the next join", which is honest for a NEW
// wallet but imprecise for a SEATED member: the seat is binary (Q1), so a
// member's further buy adds SYN and never takes the next seat number.
//
// When the connected wallet is already a member (live memberNumberOf > 0),
// this line tells that truth instead. Own-row only: the wallet reads its own
// number, exactly like the header does. Fail-closed the honest way round:
// no wallet, read failure, loading, not a member → the GENERIC line (which
// is always true — "if yours is the next join" — never a lie).
//
// Reached ONLY via a runtime dynamic import (guard-access-state rule 15).

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readMemberNumberOf } from "@/lib/chainReads";

export default function JoinSeatLine({
  saleAddress,
  seatIfFirstDisplay,
}: {
  /** Deployed sale address — server-sourced from the verify-link. */
  saleAddress: string | null;
  /** The generic next-seat preview, already formatted (e.g. "14"). */
  seatIfFirstDisplay: string;
}) {
  const { address } = useAccount();
  const [ownSeat, setOwnSeat] = useState<bigint | null>(null);

  useEffect(() => {
    let active = true;
    setOwnSeat(null);
    if (!address || !saleAddress) return;
    void readMemberNumberOf(saleAddress, address).then((n) => {
      if (active) setOwnSeat(n);
    });
    return () => {
      active = false;
    };
  }, [address, saleAddress]);

  const seated = ownSeat !== null && ownSeat > 0n;

  // Markup mirrors the page's QuoteLine (kept local so the wallet chunk does
  // not statically pull the page module — rule-15 direction stays one-way).
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-border/40 last:border-b-0">
      <div className="text-sm text-muted-foreground">Your seat</div>
      <div className="text-right">
        <div className="text-base font-medium text-foreground tabular-nums" data-testid="quote-seat">
          {seated ? `You hold seat #${ownSeat!.toString()}` : `Seat #${seatIfFirstDisplay}`}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 max-w-[16rem]">
          {seated
            ? "You are already seated — the seat is binary. A further buy adds SYN to your holdings, never a second seat."
            : "If yours is the next join. The real number is set by the transaction receipt — never predicted here."}
        </div>
      </div>
    </div>
  );
}
