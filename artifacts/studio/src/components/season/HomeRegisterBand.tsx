// HomeRegisterBand — the visitor home's public-register band (S2c; the
// approved mockup's "LE REGISTRE PUBLIC + STANDING" band, §0.14-E corrected).
// ---------------------------------------------------------------------------
// WHAT IT IS: the pride-of-the-register close of the public home — the head
// statement, a live-register card (real chain events, republished as-is from
// the served feed — the §8 one-event-one-sentence lexicon), and the three
// register cards: Holder Index (the ONE seat spine figure) · Season ranking
// (the door to /season) · Your standing (FUTURE-badged on seasonOwnRow — the
// own-row highlight arrives with the auth-zone wiring; nothing is promised
// live before it is).
// Laws: Visibility Law (chain-emitted short forms only — the feed's own
// output; no directory, no lookup) · one-authority seat count (the hero's
// served spine) · fail-closed (a null feed hides the card, never a guess).
// Superseded mockup copy applied at build time: the alias clause dropped
// (aliasLayer stays future) · "own-row · en plus du registre public" (mockup
// slip, French) → English.

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MembersProvenance } from "@/components/living/MembersProvenance";
import { useHeroReality } from "@/components/hero/useHeroReality";
import {
  fetchServedFeed,
  sentenceForServedLine,
  type ServedFeedLine,
} from "@/lib/backboneFeedClient";

export function HomeRegisterBand() {
  const reality = useHeroReality();
  const seats = reality.membersTotalNumber;
  const [lines, setLines] = useState<ServedFeedLine[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchServedFeed({ limit: 24 })
      .then((feed) => {
        if (cancelled || feed === null) return;
        setLines(feed.items.filter((i) => i.kind === "purchase").slice(0, 3));
      })
      .catch(() => {
        /* fail-closed: the card simply does not render */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="border-t border-border/50 bg-background py-16 text-foreground">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-10">
          <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
            The public register
          </div>
          <h2 className="type-h2 mb-4 text-foreground">
            Nothing to hide — the register is the flex
          </h2>
          <p className="max-w-3xl text-muted-foreground">
            On a chain, hiding does not exist — only making legible or making tedious. We show
            what the chain already publishes: seat number, short address, who brought whom.
            Pseudonymous by default. We&apos;re a business, not a charity — the register sells.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {lines !== null && lines.length > 0 && (
            <Card className="border-card-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground">
                <span className="h-2 w-2 rounded-full bg-success" />
                Live register
              </h3>
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li
                    key={`${line.transactionHash}-${line.logIndex}`}
                    className="border-t border-border/60 pt-3 font-mono text-[12.5px] leading-relaxed text-foreground first:border-t-0 first:pt-0"
                  >
                    {sentenceForServedLine(line)}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-[11px] text-muted-foreground">
                Each line = one chain event, republished as-is — no directory, no lookup, no
                cross-event join.
              </p>
              <Link href="/activity">
                <span className="mt-3 inline-block cursor-pointer border-b border-primary/40 font-mono text-[11.5px] text-primary">
                  Open the full history →
                </span>
              </Link>
            </Card>
          )}

          <div className="grid content-start gap-4">
            <Card className="border-card-border bg-card p-[18px] shadow-sm">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Holder Index
              </div>
              <div className="mt-2 font-serif text-3xl text-gold">
                {seats !== null ? seats.toLocaleString("en-US") : "—"}
              </div>
              <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">
                seats on-chain · aggregate you can verify
              </p>
              {/* guard-freshness law: a live member figure carries its
                  dual-authority provenance + the verified as-of. */}
              <MembersProvenance
                variant="compact"
                className="mt-2"
                historicalFreeze={reality.historicalFreeze}
                v3Emitted={reality.v3Emitted}
                snapshotMemberTotal={reality.snapshotMemberTotal}
                snapshotAsOf={reality.snapshotAsOf}
                membersDiverged={reality.membersDiverged}
                distinctWallets={reality.distinctWallets}
                seatOverlap={reality.seatOverlap}
              />
            </Card>

            <Card className="border-card-border bg-card p-[18px] shadow-sm">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Season ranking
              </div>
              <div className="mt-2 font-serif text-[19px]">Ranked by merit</div>
              <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">
                the full ranking has its own page
              </p>
              <Link href="/season">
                <span className="mt-3 inline-block cursor-pointer border-b border-primary/40 font-mono text-[11.5px] text-primary">
                  Open the full ranking →
                </span>
              </Link>
            </Card>

            <Card className="border-card-border bg-card p-[18px] shadow-sm">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Your standing
                </span>
                <LifecycleBadge lifecycle="FUTURE" />
              </div>
              <div className="mt-2 font-serif text-[19px]">Your own row, highlighted</div>
              <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">
                arrives with the sign-in wiring — every builder already stands on the public
                board, pseudonymous.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
