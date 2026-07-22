// pages/admin/ReferralKpiBand.tsx — CONSOLE ① (mockup v2 founder-approved
// 2026-07-22): the Dashboard's referral figures — four PLAIN, WIRED tiles.
//
// The cross-verdict this band implements (the in-repo A1 research + the
// online gap sweep): plain dated figures, ZERO trend charts at this scale
// (a trend on 3 purchases lies — trends earn their place figure by figure
// at ~8 periods of data); every tile is a DOOR to its ledger page (the
// Stripe rule: the home orients, the ledger is the truth); the money tile
// states its as-of block (the A1 honesty contract); never a sample — the
// band renders ONLY wired reads, or its honest state, or nothing (denied).
//
// Data: the shared cached console signals (ONE audited queue read + ONE
// audited ledger read per TTL window) + the public protocol-reality item
// financial.referral.paidToReferrersTotal.

import { useEffect, useState } from "react";
import {
  useGetProtocolReality,
  useGetProtocolVerifyLinks,
} from "@workspace/api-client-react";
import { Coins } from "lucide-react";
import { StatCard } from "@/components/stat-card/StatCard";
import { usdExact } from "@/components/referral/referralStanding";
import {
  fetchConsoleSignals,
  type ConsoleSignals,
} from "@/lib/operatorClient";
import { requestSourcesTab } from "@/lib/adminPrefill";
import type { AdminSectionId } from "@/pages/admin/AdminHome";

const PAID_ITEM_ID = "financial.referral.paidToReferrersTotal";

export function ReferralKpiBand({
  onNavigate,
}: {
  onNavigate: (section: AdminSectionId) => void;
}) {
  const [signals, setSignals] = useState<ConsoleSignals | null>(null);
  const { data: reality } = useGetProtocolReality();
  // The money tile's verify ↗ (the A1 contract): the ACTIVE sale engine's
  // explorer page — where every commission payment transaction lives. The
  // URL comes from the server's verify-links, never hardcoded; absent →
  // no link renders (fail closed, never a dead click).
  const { data: verifyData } = useGetProtocolVerifyLinks();
  const saleVerifyUrl =
    verifyData?.links?.find((l) => l.id === "membershipSaleV3")?.url ?? null;

  useEffect(() => {
    let active = true;
    void fetchConsoleSignals().then((s) => {
      if (active) setSignals(s);
    });
    return () => {
      active = false;
    };
  }, []);

  // Denied (not founder_root) → the band has nothing to honestly show; the
  // route refused, so the figures are not this operator's to see.
  if (signals !== null && signals.ledger.status === "denied") return null;

  const totals =
    signals !== null && signals.ledger.status === "ok"
      ? signals.ledger.payload.totals
      : null;
  const asOfBlock =
    signals !== null && signals.ledger.status === "ok"
      ? signals.ledger.payload.introductionsAsOfBlock
      : null;

  const paidItem =
    reality?.groups?.financial?.find((i) => i.id === PAID_ITEM_ID) ?? null;
  const paidRaw =
    paidItem !== null &&
    typeof paidItem.value === "string" &&
    /^[0-9]+$/.test(paidItem.value)
      ? paidItem.value
      : null;

  // A door may pre-select the destination's sub-tab (the one-shot seam) —
  // the label must always land where it points (adversarial verify).
  const door = (section: AdminSectionId, label: string, tab?: string) => (
    <button
      type="button"
      onClick={() => {
        if (tab !== undefined) requestSourcesTab(tab);
        onNavigate(section);
      }}
      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
    >
      {label}
    </button>
  );

  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-2">
        Referral — the module&apos;s live figures
      </p>
      {signals === null ? (
        <p className="text-sm text-muted-foreground">Reading the live figures…</p>
      ) : totals === null ? (
        <p className="text-sm text-muted-foreground">
          The live reads didn&apos;t answer just now — nothing is assumed,
          nothing is invented.
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* "Source owners" — the ledger's own unit (one wallet can own
              several sources; the Performance tab counts SOURCES — two
              different words for two different figures, never one word
              disagreeing with itself). */}
          <StatCard label="Source owners" meta={door("sources-referrals", "→ Performance", "performance")}>
            {String(totals.sourceOwners)}
          </StatCard>
          <StatCard label="Promotions due" meta={door("sources-referrals", "→ Signing", "signing")}>
            {String(totals.promotionsDue)}
          </StatCard>
          <StatCard
            label="Paid to referrers"
            tone="identity"
            icon={<Coins className="h-4 w-4" />}
            meta={
              <span className="text-xs text-muted-foreground">
                {saleVerifyUrl !== null ? (
                  <a
                    href={saleVerifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-proof/80 hover:text-proof underline underline-offset-2"
                  >
                    verify ↗
                  </a>
                ) : null}
                {saleVerifyUrl !== null && asOfBlock !== null ? " · " : ""}
                {asOfBlock !== null
                  ? `as of block ${asOfBlock.toLocaleString("en-US")}`
                  : ""}
              </span>
            }
          >
            {paidRaw !== null ? usdExact(paidRaw) : "—"}
          </StatCard>
          <StatCard label="Members seated" meta={door("members", "→ Members")}>
            {String(totals.seats)}
          </StatCard>
        </div>
      )}
    </div>
  );
}
