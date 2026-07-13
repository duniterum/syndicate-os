// components/TeaserSurface.tsx — the designed-teaser chassis (§11 slot 2c).
// ---------------------------------------------------------------------------
// A teaser page states, honestly: WHAT this surface will be (one paragraph),
// its posture (the existing badge system), a DESIGN PREVIEW that is labeled a
// design preview and carries NO figures (a fake number would poison the whole
// truth-first spine), WHAT UNLOCKS it, and a RETURN HOOK (the reason to come
// back). Ethical FOMO is historical only — never financial. A teaser may
// carry a LIVE slot when a figure is already chain-readable (LIVE-PRODUCTION
// rule: readable ⇒ displayed) — the Fire Ledger's total burn, for example.

import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DisplayLifecycle } from "@/config/truthStatus";
import type { ReactNode } from "react";

export interface TeaserSpec {
  eyebrow: string;
  title: string;
  /** ONE paragraph — what this surface will be. */
  what: string;
  lifecycle: DisplayLifecycle;
  /** Abstract preview rows (shapes, never data). */
  previewRows: readonly { label: string; hint: string }[];
  /** What has to exist before this page goes live. */
  unlocks: string;
  /** The reason to come back — historical, never financial. */
  returnHook: string;
}

export function TeaserSurface({ spec, liveSlot }: { spec: TeaserSpec; liveSlot?: ReactNode }) {
  return (
    <PublicPage
      eyebrow={spec.eyebrow}
      title={spec.title}
      lead={spec.what}
      badge={<LifecycleBadge lifecycle={spec.lifecycle} />}
    >
      {/* A live figure that already exists renders ABOVE the preview — the
          one real thing on a teaser is never mixed into the mock shapes. */}
      {liveSlot ? <div className="mb-10">{liveSlot}</div> : null}

      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Design preview — the shape, not data
        </span>
      </div>
      <Card className="border-dashed border-border/60 bg-card/20 p-5 mb-10" aria-label="Design preview — no real data">
        <div className="space-y-3">
          {/* Static ordered shapes — index keys are correct (labels may repeat,
              e.g. the Fire Ledger's three "A burn event" rows). */}
          {spec.previewRows.map((row, i) => (
            <div key={`${i}-${row.label}`} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-border" aria-hidden="true" />
              <span className="text-sm text-foreground/80 w-40 shrink-0">{row.label}</span>
              <span className="h-2 flex-1 rounded bg-border/50" aria-hidden="true" />
              <span className="text-[11px] text-muted-foreground shrink-0">{row.hint}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-4">
          Nothing above is a figure. When this page goes live, every line will be
          receipt-backed and verify-linked — the same standard as every live
          surface here.
        </p>
      </Card>

      <h2 className="text-base font-medium text-foreground mb-1.5">What unlocks it</h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-10">{spec.unlocks}</p>

      <Card className="bg-gold/5 border-gold/25 p-5">
        <p className="text-sm text-foreground/90 leading-relaxed mb-3">{spec.returnHook}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/member">
            <Button variant="outline" size="sm">
              Member Home <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/join">
            <Button size="sm">Take your seat</Button>
          </Link>
        </div>
      </Card>
    </PublicPage>
  );
}
