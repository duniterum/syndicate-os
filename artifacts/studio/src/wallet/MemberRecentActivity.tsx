// wallet/MemberRecentActivity.tsx (build-time-gated wallet module)
//
// ③ HOME Z4 — YOUR RECENT ACTIVITY (approved wireframe 2026-07-16 §3): the
// member's own last purchases, fed by the D3 own-row read (the Stripe
// payments-list pattern — my work above world news). Every figure is the
// indexed record's own field (usdFromRaw, never recomputed) and every row
// carries its verify anchor. R-BIND (2026-07-19): the GO'd A1 placement ②
// LANDED — every row now carries its "receipt" door into the live binder
// (/receipts), where the row reopens as its full ticket. Zero rows served =
// a real, honest zero. A fetch that FAILED is never shown as still reading
// (the settled wrapper); and the footer speaks the mechanism in PRESENT
// tense only — most indexed rows predate the receipt product and never
// printed a checkout ticket (their binder ticket is built from the indexed
// record, which is the truth either way).

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { fetchOwnPurchases, type OwnPurchasesReadback } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";
import { usdFromRaw } from "./ownReads";

const RECENT_LIMIT = 5;

/** Own purchases with SETTLEMENT tracked: undefined = a read is in flight ·
 * null = the read FAILED (transport/shape) · readback = served. */
function useSettledOwnPurchases(): OwnPurchasesReadback | null | undefined {
  const [state, setState] = useState<OwnPurchasesReadback | null | undefined>(
    undefined,
  );
  useEffect(() => {
    let active = true;
    const read = () => {
      setState(undefined);
      void fetchOwnPurchases().then((r) => {
        if (active) setState(r);
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);
  return state;
}

export default function MemberRecentActivity() {
  const purchases = useSettledOwnPurchases();
  // Newest first, by block — the indexed record's own ordering key (a row
  // whose block is honestly absent sorts oldest, never invented).
  const recent = purchases?.rows
    ? [...purchases.rows]
        .sort((a, b) => (b.block ?? 0) - (a.block ?? 0))
        .slice(0, RECENT_LIMIT)
    : null;

  return (
    <Card
      className="bg-card/40 border-border/50 p-5"
      data-testid="member-recent-activity"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-medium text-foreground">
          Your recent activity
        </h2>
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Own record
        </span>
      </div>
      {purchases === undefined ? (
        <p className="text-sm text-muted-foreground">Reading your record…</p>
      ) : recent && recent.length > 0 ? (
        <ul className="grid gap-0.5">
          {recent.map((r) => (
            <li
              key={r.transaction}
              className="flex items-baseline justify-between gap-3 rounded px-2 py-1.5 text-sm"
            >
              <span className="font-mono text-muted-foreground">
                {r.isoDayUtc}
              </span>
              <span className="font-mono text-foreground/90">
                {usdFromRaw(r.amountRaw)}
              </span>
              <span className="hidden sm:inline font-mono text-xs text-muted-foreground">
                {r.engine}
              </span>
              {/* GAP-3b verdict: the link opens THIS row's own ticket in the
                  binder (the ?tx= deep-open), honoring "View receipt — opens
                  the ticket". */}
              <Link
                href={`/receipts?tx=${r.transaction}`}
                className="text-proof/80 hover:text-proof underline underline-offset-2 text-xs"
              >
                receipt
              </Link>
              <a
                href={r.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gold/90 hover:text-gold underline underline-offset-2"
              >
                verify ↗
              </a>
            </li>
          ))}
        </ul>
      ) : recent ? (
        <p className="text-sm text-muted-foreground leading-relaxed">
          No purchases on your account yet — your first prints its ticket at
          checkout.
        </p>
      ) : (
        // A failed transport read and a served rows:null both land here: the
        // record was unreadable — said plainly, never spun as in-progress.
        <p
          className="text-sm text-muted-foreground leading-relaxed"
          title={purchases?.failureReason ?? undefined}
        >
          Your purchase record couldn&apos;t be read just now — nothing is
          assumed, nothing is invented.
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground leading-snug border-t border-border/40 pt-2">
        Every purchase reopens as its full ticket in{" "}
        <Link href="/receipts" className="text-proof/80 hover:text-proof underline underline-offset-2">
          your binder
        </Link>
        .
      </p>
    </Card>
  );
}
