// components/member/MemberPulse.tsx — the dashboard's protocol pulse (S7-b).
// ---------------------------------------------------------------------------
// Zone 4 of the member dashboard: the newest served heartbeat lines, rendered
// through the SAME §8 lexicon as /activity and the home hero (one sentence
// mapping, one truth — the HeroLiveActivity precedent). Public chain data
// only; feed unavailable → an honest note, never a guess. When A1 ("My
// Activity") lands, this zone gains the My | Protocol lens switch.

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import {
  fetchServedFeed,
  sentenceForServedLine,
  factsForServedLine,
  type ServedFeedLine,
} from "@/lib/backboneFeedClient";

const PULSE_LINES = 5;

export function MemberPulse() {
  const [lines, setLines] = useState<ServedFeedLine[] | null | undefined>(undefined);
  const { data: verifyLinks } = useGetProtocolVerifyLinks();
  const explorerBase = (() => {
    const u = verifyLinks?.links?.find((l) => l.id === "membershipSaleV3")?.url;
    return u ? (u.match(/^(.*)\/address\//)?.[1] ?? null) : null;
  })();

  useEffect(() => {
    let alive = true;
    void fetchServedFeed().then((feed) => {
      if (!alive) return;
      setLines(feed === null ? null : feed.items.slice(0, PULSE_LINES));
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Card className="bg-card/40 border-border/50 p-5" data-testid="member-pulse">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-medium text-foreground">The protocol pulse</h2>
        <Link
          href="/activity"
          className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          data-testid="link-pulse-full-record"
        >
          Open the full record →
        </Link>
      </div>
      {lines === undefined ? (
        <p className="text-sm text-muted-foreground">Checking…</p>
      ) : lines === null || lines.length === 0 ? (
        <p className="text-sm text-muted-foreground leading-relaxed">
          The live record is unavailable right now — nothing is assumed. The
          complete history lives on the Activity page.
        </p>
      ) : (
        <ul className="grid gap-1.5">
          {lines.map((line) => (
            <li
              key={`${line.transactionHash}:${line.logIndex}`}
              className="rounded-lg border border-border/70 bg-card/50 px-3 py-2"
            >
              <p className="text-sm leading-snug text-foreground/90">
                {sentenceForServedLine(line)}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {factsForServedLine(line) ? (
                  <span className="text-foreground/70">{factsForServedLine(line)}</span>
                ) : null}
                {line.isoDayUtc} · block {line.blockNumber.toLocaleString("en-US")}
                {explorerBase ? (
                  <a
                    href={`${explorerBase}/tx/${line.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-proof/80 hover:text-proof"
                    title="Open the transaction on the block explorer"
                  >
                    verify
                    <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                  </a>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
