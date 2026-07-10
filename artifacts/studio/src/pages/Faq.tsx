import { useState } from "react";
import { Link } from "wouter";
import { PublicPage } from "@/components/PublicPage";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { LivingSignature } from "@/components/living/LivingSignature";
import { TransparencyPosture } from "@/components/living/TransparencyPosture";
import { SectionIndex, type IndexEntry } from "@/components/living/SectionIndex";
import { FaqAccordion, FAQ_ALL } from "@/components/faq/FaqAccordion";
import { FaqJsonLd } from "@/components/faq/FaqJsonLd";
import { FAQ_CATEGORIES } from "@/content/faq-content";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { useTokenomics } from "@/components/tokenomics/useTokenomics";

// FAQ (slice 2.3) — composed from the shared living chassis, NOT rebuilt.
// Reuses PublicPage + LivingSignature + TransparencyPosture + SectionIndex; the
// only new pieces are FaqAccordion (the interactive primitive) and the
// number-free doctrine-perfect corpus. Every figure is a live chain read (the
// hero card) or a one-click link to the live surface — answers hold no numerals,
// so the on-screen text, the FAQPage JSON-LD, and the crawler view are identical.

// Inline link treatment for links that live in Cards (outside the <Prose>
// container, so they don't inherit its `[&_a]` styling). Mirrors the Prose atom's
// link axis exactly — cyan/primary, underlined, visible focus ring — so a link
// reads as a link on every content surface, not as plain body text.
const linkCls =
  "text-primary underline underline-offset-2 decoration-primary/40 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-sm";

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
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
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
      lead="Search, filter by topic, and open any question. Every answer is consistent with what is live, pending, and planned on-chain — and holds no figures of its own: each live number sits one click away on Tokenomics, Status, or Join, read straight from Avalanche."
      badge={<LivingSignature />}
    >
      <FaqJsonLd />

      <div className="space-y-12">
        <TransparencyPosture />

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
          <p className="mt-4 type-body text-muted-foreground">
            The full live picture — supply, distribution, the two prices, burn, and treasury routing —
            is on <Link href="/tokenomics" className={linkCls}>Tokenomics</Link> and the{" "}
            <Link href="/status" className={linkCls}>Status</Link> ledger. Preview an exact read-only
            entry quote on <Link href="/join" className={linkCls}>Join</Link>.
          </p>
        </Card>

        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
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

        {/* Closing CTA — honest help routing (the floating support assistant is the next slice). */}
        <Card className="border-border/60 bg-card/40 p-6">
          <h2 className="type-h3 text-foreground">Still have a question?</h2>
          <p className="mt-2 type-body text-muted-foreground">
            Every contract, wallet, and balance is public — the surest answer is always the chain itself.
            Verify anything on the <Link href="/status" className={linkCls}>Status</Link> ledger or the{" "}
            <Link href="/map" className={linkCls}>Protocol Map</Link>, read the full{" "}
            <Link href="/whitepaper" className={linkCls}>Whitepaper</Link>, or reach out through{" "}
            <Link href="/support" className={linkCls}>Support</Link>. When you're ready,{" "}
            <Link href="/join" className={linkCls}>Take a seat</Link> — observe first, join if it suits you.
          </p>
        </Card>
      </div>
    </PublicPage>
  );
}
