// components/referral/ReferralIntroductionsPanel.tsx — TAB 2 · Introductions.
//
// The member's own introduction record. The COUNTS are live (the figures
// above the tabs); the per-introduction ROWS honestly wait for row-level
// serving (S7 truth sweep law: never a fake table, never a sample dollar).
// Visibility Law: rows will show the chain-emitted address short-form —
// never a name, alias, or email (address ≠ identity).

import { Card } from "@/components/ui/card";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { StatusPill } from "@/components/status-pill/StatusPill";
import {
  usd,
  useOwnIntroductions,
  type StandingReadback,
} from "@/components/referral/referralStanding";

// The live rows card — REAL rows only (the S7 truth-sweep law kept: an
// unanswered read renders its honest state, never a sample; an empty record
// renders honest-zero, never a fake table).
function IntroductionRowsCard() {
  const intro = useOwnIntroductions();
  const rows = intro?.rows ?? null;
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-foreground">Per-introduction record</span>
        {rows !== null ? (
          <StatusPill tone="live" size="xs">Live · your own row</StatusPill>
        ) : null}
      </div>
      {rows === null ? (
        <p
          className="text-sm text-muted-foreground leading-relaxed"
          title={intro?.failureReason ?? undefined}
        >
          {intro === null
            ? "The record read is resolving — nothing is assumed, nothing is invented."
            : "The record is unavailable right now — nothing is assumed, nothing is invented. Try again in a moment."}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground leading-relaxed">
          No attributed joins on your record yet — the first one appears here
          with its date, amount and on-chain proof.
        </p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="font-mono text-xs uppercase tracking-wider font-normal py-1.5 pr-4">Date</th>
                <th className="font-mono text-xs uppercase tracking-wider font-normal py-1.5 pr-4">Who joined</th>
                <th className="font-mono text-xs uppercase tracking-wider font-normal py-1.5 pr-4">Standing</th>
                <th className="font-mono text-xs uppercase tracking-wider font-normal py-1.5 pr-4">Commission</th>
                <th className="py-1.5"><span className="sr-only">Verify on-chain</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.transaction} className="border-t border-border/40">
                  <td className="font-mono text-muted-foreground py-2 pr-4 whitespace-nowrap">{r.isoDayUtc}</td>
                  <td className="font-mono text-foreground/90 py-2 pr-4">{r.who}</td>
                  <td className="py-2 pr-4">
                    {r.durable ? (
                      <StatusPill tone="proof" size="xs">Durable</StatusPill>
                    ) : (
                      <StatusPill tone="neutral" size="xs">Not durable</StatusPill>
                    )}
                  </td>
                  <td className="font-mono text-gold py-2 pr-4">{usd(r.commissionRaw)}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <a
                      href={r.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex font-mono text-xs text-proof/80 hover:text-proof underline underline-offset-2"
                    >
                      verify ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            Every row is a chain event — the address shown is the short form of
            what the chain itself published, never a name, alias, or email.
            Durable = that wallet still holds SYN
            {intro?.asOfBlock ? ` (as of block ${intro.asOfBlock.toLocaleString("en-US")})` : ""}.
          </p>
        </div>
      )}
    </Card>
  );
}

export function ReferralIntroductionsPanel({ readback }: { readback: StandingReadback | null }) {
  const s = readback?.standing ?? null;

  return (
    <div>
      <Card className="bg-card/40 border-border/50 p-5 mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Your introductions — your own record
        </p>
        {s ? (
          <p className="text-sm text-foreground/90 leading-relaxed mb-2">
            <span className="font-medium text-foreground">
              {s.durableIntroductions} durable
            </span>{" "}
            · {s.introducedMembers} total — indexed from the chain, recorded up
            to block {s.asOfBlock.toLocaleString("en-US")}.
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground leading-relaxed">
          A durable introduction is an introduced member whose wallet still
          holds SYN. The count may move down as well as up; a signed promotion
          never reverts. Each introduction is an on-chain purchase the chain
          published — the record shows the joining wallet&apos;s address
          short-form, never a name, alias, or email.
        </p>
      </Card>

      {/* Slice ④ — the per-introduction rows, LIVE (the row-level model):
          each attributed join as a chain-event fact — verified day · the
          introduced wallet short-form (ADR-003: never a name/alias/email) ·
          the durable flag · the commission · its verify anchor. */}
      <IntroductionRowsCard />

      <Card className="bg-card/30 border-border/50 border-dashed p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Second generation</span>
          <LifecycleBadge lifecycle="FUTURE" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Who they brought — the introductions your introductions made, as your
          own record. Own-row only, never a directory of other members.
        </p>
      </Card>
    </div>
  );
}
