// wallet/MemberKpiRow.tsx (build-time-gated wallet module)
//
// S7-b — THE KPI ROW (dashboard zone 2, the after-login standard: YOUR
// portfolio first — Binance/Coinbase land on balances, never on a program).
// Four live tiles, top-left where the eye lands (F-pattern): Your SYN ·
// Your USDC · Your capital footprint (own cumulative + rung — the
// OWN-ACCOUNT DISPLAY RULE, GAMIFICATION_LEGAL_DOCTRINE) · Introductions.
// Every tile is Label → live Value → provenance tooltip; a figure that
// cannot be read renders an honest "—" — never invented, never stale.
// Own-row only; commission/escrow detail lives in the referral module.

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import {
  useOwnSourceStanding,
  useOwnSynBalance,
  useOwnUsdcBalance,
  usdFromRaw,
} from "./ownReads";
import {
  fetchCapitalStanding,
  type CapitalStanding,
} from "@/lib/capitalStanding";
import { fetchMemberStanding } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

function KpiTile({
  label,
  value,
  detail,
  testId,
}: {
  label: string;
  value: string | null;
  detail: string;
  testId: string;
}) {
  return (
    <Card className="bg-card/40 border-border/50 p-4" title={detail}>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className="mt-1 truncate font-mono text-xl text-foreground"
        data-testid={testId}
      >
        {value ?? "—"}
      </p>
    </Card>
  );
}

/** Own seat → own capital standing (footprint + rung), fail-closed. */
function useOwnFootprint(): CapitalStanding | null {
  const [standing, setStanding] = useState<CapitalStanding | null>(null);
  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchMemberStanding().then((r) => {
        if (!active) return;
        const seat =
          r?.state === "S4" && r.recognized === true ? r.memberNumber : null;
        if (seat === null) {
          setStanding(null);
          return;
        }
        void fetchCapitalStanding(seat).then((s) => {
          if (active) setStanding(s);
        });
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);
  return standing;
}

export default function MemberKpiRow() {
  const { address } = useAccount();
  const synBalance = useOwnSynBalance(address);
  const usdcBalance = useOwnUsdcBalance(address);
  const sourceStanding = useOwnSourceStanding();
  const footprint = useOwnFootprint();
  const s = sourceStanding?.standing ?? null;
  const walked =
    footprint !== null &&
    footprint.rung !== null &&
    footprint.cumulativeUsdcRaw !== null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiTile
        label="Your SYN"
        value={synBalance !== null ? `${synBalance} SYN` : null}
        detail="Your own wallet's live SYN balance, read from the token contract — never cached."
        testId="kpi-syn-balance"
      />
      <KpiTile
        label="Your USDC"
        value={usdcBalance !== null ? `${usdcBalance} USDC` : null}
        detail="Your own wallet's live USDC balance — the token the sale engine itself names."
        testId="kpi-usdc-balance"
      />
      <KpiTile
        label="Your footprint"
        value={
          walked
            ? `${usdFromRaw(footprint.cumulativeUsdcRaw!)} · ${footprint.rung}`
            : null
        }
        detail="Your cumulative on-chain purchases — every era, the earliest included — and the rung they place you on. Recognition only, never a financial benefit."
        testId="kpi-footprint"
      />
      <KpiTile
        label="Introductions"
        value={
          s !== null
            ? `${s.durableIntroductions} durable · ${s.introducedMembers} total`
            : sourceStanding?.sourceOnChain === false
              ? // D-TRUTH D6: the registry answered DEFINITIVELY — no source,
                // so the count is exactly zero. A dash is for the unreadable.
                "0 durable · 0 total"
              : null
        }
        detail="Members you brought in, from the indexed introduction record — durable means their wallet still holds SYN. Zero is a real answer; a dash means the record could not be read."
        testId="kpi-introductions"
      />
    </div>
  );
}
