import { Link } from "wouter";
import { ScrollText } from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { TruthLabel } from "@/components/TruthLabel";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { surfaceStatus } from "@/config/truthStatus";
import { getContractsByCategory } from "@/config/contractMemory";
import { ctas } from "@/config/sharedCopy";

export default function Archive() {
  const archiveEntries = getContractsByCategory("archive");

  return (
    <PublicPage
      eyebrow="Archive & chronicle"
      title="Protocol memory, kept honestly."
      lead="The archive holds the protocol's artifacts; the chronicle is its narrative memory of milestones. Both are concept memory today — archive reads are not wired and nothing is minted here."
      badge={<TruthLabel variant={surfaceStatus.archive} />}
    >
      <h2 className="type-h2 text-foreground mb-5">The archive</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
        {archiveEntries.map((e) => (
          <Card key={e.id} className="bg-card/40 border-border/50 p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="text-base font-medium text-foreground">{e.label}</h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{e.role}</p>
              </div>
              <LifecycleBadge lifecycle={e.lifecycle} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{e.note}</p>
          </Card>
        ))}
        <Card className="bg-card/40 border-border/50 p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-primary" />
              <h3 className="text-base font-medium text-foreground">Chronicle</h3>
            </div>
            <LifecycleBadge lifecycle="DESIGN_CONCEPT" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A narrative record of protocol milestones and decisions. A design concept today — no
            chronicle entries are stored or published in this foundation.
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        <Link href={ctas.viewContracts.href}>
          <Button>{ctas.viewContracts.label}</Button>
        </Link>
        <Link href={ctas.viewStatus.href}>
          <Button variant="outline">{ctas.viewStatus.label}</Button>
        </Link>
      </div>

      {/* §11 slot 2c teaser elements — what unlocks it + the return hook
          (the page already carries the honest paragraph, badges, and real
          contract-memory content, so nothing was gutted to add them). */}
      <h2 className="text-base font-medium text-foreground mb-1.5">What unlocks it</h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-8">
        Archive reads against the deployed Archive 1155 contract — wiring them is
        its own slice. Nothing renders here before it can be read and verified.
      </p>
      <Card className="bg-gold/5 border-gold/25 p-5">
        <p className="text-sm text-foreground/90 leading-relaxed mb-3">
          Artifacts are protocol memory: what a seat has witnessed stays witnessed.
          When the reads are wired, this page becomes the shelf your seat&apos;s
          history sits on.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/member">
            <Button variant="outline" size="sm">Member Home</Button>
          </Link>
          <Link href="/join">
            <Button size="sm">Take your seat</Button>
          </Link>
        </div>
      </Card>
    </PublicPage>
  );
}
