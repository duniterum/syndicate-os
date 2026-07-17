import { Link } from "wouter";
import {
  ScrollText,
  Network,
  Flame,
  Library,
  type LucideIcon,
} from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { ctas, safetyCopy } from "@/config/sharedCopy";

interface ProofFacet {
  icon: LucideIcon;
  title: string;
  body: string;
  /** The living surface where this proof organ serves today. */
  href: string;
  door: string;
}

// AUD-P0 (founder GO 2026-07-16): the dead-era page rewritten to today's
// truth — all four proof organs are LIVE and each facet says where to see
// it. A live surface renders NO lifecycle badge (the S7 /join precedent);
// the badge slot carries the door to the living proof instead.
const facets: ProofFacet[] = [
  {
    icon: ScrollText,
    title: "Membership receipts",
    body: "Every seat purchase is on the public record with its transaction anchor — and a signed-in member reads their own receipt and full purchase history, only ever their own row.",
    href: "/activity",
    door: "The live record",
  },
  {
    icon: Network,
    title: "Source attribution",
    body: "The registry is live and paying: a referred join names its bringer on the public record, and the commission is paid inside the buyer's own transaction.",
    href: "/referral",
    door: "How referrals work",
  },
  {
    icon: Flame,
    title: "Proof of Fire",
    body: "The numbered burn record — every burn a line with its transaction, and the retired total read live from the chain.",
    href: "/fire-ledger",
    door: "The Fire Ledger",
  },
  {
    icon: Library,
    title: "Archive memory",
    // AUD-ROUTE (2026-07-17): "counts and prices read live" DIED across the
    // class — /archive renders static memory; the mints ride the indexed record.
    body: "Artifacts minted on-chain as protocol memory — every mint a public line on the indexed record.",
    href: "/archive",
    door: "The Archive",
  },
];

const steps = [
  {
    n: "01",
    title: "Read from source",
    body: "Every figure is read live from a contract or the indexed event record — never typed in by hand.",
  },
  {
    n: "02",
    title: "Verify against chain",
    body: "Every event line carries its transaction anchor — check the same fact yourself on the public explorer.",
  },
  {
    n: "03",
    title: "Show with provenance",
    body: "Values appear with their source and freshness, so you always know how real they are.",
  },
];

export default function ProofDashboard() {
  return (
    <PublicPage
      eyebrow="Public proof"
      title="Proof, live from the chain."
      lead="Public, auditable proof is the point of The Syndicate. Every figure on this site is a live chain read or a line of the indexed public record, each with its verify anchor — this page says what the proof layer covers and where to check it yourself."
      badge={<StatusPill tone="proof">Served from the public record</StatusPill>}
    >
      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed mb-10">
        The protocol sells seats on-chain today, and every event — joins, burns,
        mints, referrals — is served from the public record with its transaction
        anchor. {safetyCopy.noFakeData} {safetyCopy.sourceWins}
      </div>

      <h2 className="type-h2 text-foreground mb-5">What proof covers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
        {facets.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="bg-card/40 border-border/50 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <Link
                  href={f.href}
                  className="text-sm text-primary hover:underline underline-offset-2 shrink-0"
                >
                  {f.door} →
                </Link>
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </Card>
          );
        })}
      </div>

      <h2 className="type-h2 text-foreground mb-5">How verification works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {steps.map((s) => (
          <Card key={s.n} className="bg-card/40 border-border/50 p-5">
            <span className="font-mono text-xs text-primary">{s.n}</span>
            <h3 className="text-base font-medium text-foreground mt-2 mb-1">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/activity">
          <Button>Open the live record</Button>
        </Link>
        <Link href={ctas.viewStatus.href}>
          <Button variant="outline">{ctas.viewStatus.label}</Button>
        </Link>
        <Link href={ctas.viewContracts.href}>
          <Button variant="outline">{ctas.viewContracts.label}</Button>
        </Link>
      </div>
    </PublicPage>
  );
}
