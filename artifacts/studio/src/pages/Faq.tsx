import { useState } from "react";
import { Link } from "wouter";
import { PublicPage } from "@/components/PublicPage";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { LivingSignature } from "@/components/living/LivingSignature";
import { TransparencyPosture } from "@/components/living/TransparencyPosture";
import { SectionIndex, type IndexEntry } from "@/components/living/SectionIndex";
import { MembersProvenance } from "@/components/living/MembersProvenance";
import { FaqAccordion, FAQ_ALL } from "@/components/faq/FaqAccordion";
import { FaqJsonLd } from "@/components/faq/FaqJsonLd";
import { FAQ_CATEGORIES } from "@/content/faq-content";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { useTokenomics } from "@/components/tokenomics/useTokenomics";
import { CONTENT_LINK_CLS } from "@/lib/contentLink";

// FAQ (slice 2.3) — composed from the shared living chassis, NOT rebuilt.
// Reuses PublicPage + LivingSignature + TransparencyPosture + SectionIndex; the
// only new pieces are FaqAccordion (the interactive primitive) and the
// number-free doctrine-perfect corpus. Every figure is a live chain read (the
// live-stat card, below the corpus since the 2026-07-31 WORK-FIRST reorder) or
// a one-click link to the live surface — answers hold no numerals, so the
// on-screen text, the FAQPage JSON-LD, and the crawler view are identical.

// The inline card-link treatment moved to its ONE home 2026-07-30 (footer
// audit): lib/contentLink.ts — /docs hand-typed the same treatment without
// the focus ring, which is exactly what a local constant cannot prevent.

// TOC entries: an "All" reset plus every category. The SectionIndex drives the
// active-category filter (onSelect), so the sticky rail and the chips stay in sync.
const TOC_ENTRIES: readonly IndexEntry[] = [
  { id: FAQ_ALL, label: "All questions" },
  ...FAQ_CATEGORIES.map((c) => ({ id: c.id, label: c.name })),
];

/** One live chain read, fail-closed — never a typed fallback number. */
function LiveStat({ label, value, unit, loading }: {
  label: string;
  value: string | null;
  unit?: string;
  loading: boolean;
}) {
  return (
    <div>
      <div className="type-eyebrow text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        {loading ? (
          <span className="text-sm text-muted-foreground">Checking…</span>
        ) : value === null ? (
          <StatusPill tone="caution" size="xs">Unavailable</StatusPill>
        ) : (
          <span className="font-mono text-lg font-semibold text-foreground">
            {value}
            {unit ? <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span> : null}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Faq() {
  const [activeCat, setActiveCat] = useState<string>(FAQ_ALL);
  const r = useHeroReality();
  const tk = useTokenomics();

  return (
    <PublicPage
      eyebrow="FAQ · honest answers, structured by topic"
      title="Answers you can verify — never a number we typed."
      lead="Search, filter by topic, and open any question. Every answer is consistent with what is live, pending, and planned on-chain — and holds no figures of its own: each live number sits one click away on Tokenomics, the Protocol Map, or Join, read straight from Avalanche."
      badge={<LivingSignature />}
    >
      <FaqJsonLd />

      <div className="space-y-12">
        {/* WORK-FIRST (founder "construis 1-5", 2026-07-30): the page opens on
            THE WORK — search + questions. The manifesto block and the live-stat
            card moved BELOW the corpus (on mobile the search input sat roughly
            two screens down behind them). */}
        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <SectionIndex
            entries={TOC_ENTRIES}
            heading="Topics"
            activeId={activeCat}
            onSelect={setActiveCat}
            className="mb-8 lg:mb-0"
          />

          <FaqAccordion
            categories={FAQ_CATEGORIES}
            activeCat={activeCat}
            onActiveCatChange={setActiveCat}
          />
        </div>

        {/* Live hero-answer card — two figures read live from the chain, fail-closed. */}
        <Card className="border-border/60 bg-card/40 p-5">
          <div className="mb-4 flex items-center gap-2">
            <StatusPill tone="live" size="xs">Live · read from Avalanche</StatusPill>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <LiveStat label="Recognised seats" value={r.membersTotal} loading={r.loading} />
            <LiveStat
              label="Entry rate"
              value={tk.entrySynPerUsdc}
              unit="SYN per 1 USDC"
              loading={tk.loading}
            />
          </div>
          <MembersProvenance
            className="mt-4"
            historicalFreeze={r.historicalFreeze}
            v3Emitted={r.v3Emitted}
            snapshotMemberTotal={r.snapshotMemberTotal}
            snapshotAsOf={r.snapshotAsOf}
            membersDiverged={r.membersDiverged}
            distinctWallets={r.distinctWallets}
            seatOverlap={r.seatOverlap}
          />
          <p className="mt-4 type-body text-muted-foreground">
            The full live picture — supply, distribution, the two prices, burn, and treasury routing —
            is on <Link href="/tokenomics" className={CONTENT_LINK_CLS}>Tokenomics</Link> and the{" "}
            <Link href="/map" className={CONTENT_LINK_CLS}>Protocol Map</Link>. Preview an exact
            entry quote on <Link href="/join" className={CONTENT_LINK_CLS}>Join</Link>.
          </p>
        </Card>

        <TransparencyPosture />

        {/* Closing CTA — honest help routing. (Footer audit 2026-07-30: the
            "reach out through Support" CTA DIED — /support's own config says
            "Support isn't open yet — nothing here sends or stores anything",
            so the FAQ instructed an action the linked surface denies. The
            floating Guide IS live on every page; the stale "next slice"
            comment above this card died with it.) */}
        <Card className="border-border/60 bg-card/40 p-6">
          <h2 className="type-h3 text-foreground">Still have a question?</h2>
          <p className="mt-2 type-body text-muted-foreground">
            Every contract, wallet, and balance is public — the surest answer is always the chain itself.
            Verify anything on the <Link href="/status" className={CONTENT_LINK_CLS}>Status</Link> ledger or the{" "}
            <Link href="/map" className={CONTENT_LINK_CLS}>Protocol Map</Link>, read the full{" "}
            <Link href="/whitepaper" className={CONTENT_LINK_CLS}>Whitepaper</Link>, or ask the Guide — the
            floating help assistant in the corner of every page. When you're ready,{" "}
            <Link href="/join" className={CONTENT_LINK_CLS}>Take a seat</Link> — observe first, join if it suits you.
          </p>
        </Card>
      </div>
    </PublicPage>
  );
}
