import { Link } from "wouter";
import { ShieldAlert } from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { ProtocolRealityPanel } from "@/components/ProtocolReality";
import { ProtocolAssetsCard } from "@/components/ProtocolAssetsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  contractMemoryIntro,
  contractMemoryCategories,
  contractMemoryCategoryText,
  getContractsByCategory,
} from "@/config/contractMemory";
import { ctas, safetyCopy } from "@/config/sharedCopy";

export default function ContractMemory() {
  return (
    <PublicPage
      eyebrow="Contract & economy memory"
      title="The protocol economy — live holdings, plus contract memory."
      lead={contractMemoryIntro}
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <div className="mb-12">
        <ProtocolAssetsCard />
      </div>

      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 mb-12 flex items-start gap-3">
        <div className="p-1.5 rounded-md bg-warning/10 text-warning shrink-0 mt-0.5">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The contract memory below is roles and structure only — not a live read. No contract
          addresses, transaction hashes, balances, prices, or member records appear in it.{" "}
          {safetyCopy.noFakeData}
        </p>
      </div>

      <div className="space-y-12">
        {contractMemoryCategories.map((cat) => {
          const entries = getContractsByCategory(cat);
          if (entries.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="type-h2 text-foreground mb-5">
                {contractMemoryCategoryText[cat]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {entries.map((e) => (
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
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-16">
        <h2 className="type-h2 text-foreground mb-1">
          Live read-only reality
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-6">
          Beyond memory: strictly read-only public reads of contract code presence, membership-sale
          lifecycle, and archive configuration on Avalanche C-Chain. The active V3 sale engine's
          public figures are surfaced as exact raw base units. No addresses, no wallet, and no
          purchase, transaction, or referral surface — this app only reads. Any unverifiable value
          renders as null with a reason.
        </p>
        <ProtocolRealityPanel groups={["contracts", "sale", "archive"]} />
      </section>

      <div className="flex flex-wrap gap-3 mt-14">
        <Link href={ctas.viewStatus.href}>
          <Button>{ctas.viewStatus.label}</Button>
        </Link>
        <Link href={ctas.verifyProof.href}>
          <Button variant="outline">{ctas.verifyProof.label}</Button>
        </Link>
      </div>
    </PublicPage>
  );
}
