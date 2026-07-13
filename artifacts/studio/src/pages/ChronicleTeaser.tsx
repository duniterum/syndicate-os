// pages/ChronicleTeaser.tsx — /chronicle (CHR-1: the register is real, the
// data source is a COMMITTED FILE, and promotion is a FOUNDER ACT).
// Two honest states:
//   · register EMPTY → the designed teaser + "the first entry awaits the
//     founder's promotion" (no invented history);
//   · register CARRIES ENTRIES → the solemn public record, oldest-first,
//     protocol-institutional voice, identity/amount-blind, verify-first.

import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { TeaserSurface, type TeaserSpec } from "@/components/TeaserSurface";
import { CHRONICLE_REGISTER } from "@/config/chronicleRegister";

const spec: TeaserSpec = {
  eyebrow: "Chronicle",
  title: "The institutional story.",
  what:
    "The Chronicle is the protocol's solemn record — not a feed, a memory. Turning points only, each promoted by a human decision and anchored to its on-chain proof. The first chapters are already lived and waiting to be written: the duplicate seat that was owned in public instead of hidden, the first seat bought with real money, the first member source signed under the convention, the day the ladder was decided.",
  lifecycle: "FUTURE",
  previewRows: [
    { label: "The duplicate seat", hint: "owned, never hidden · tx-linked" },
    { label: "The first real seat", hint: "a purchase, not a promise · tx-linked" },
    { label: "The first member source", hint: "founder-signed · tx-linked" },
    { label: "The ladder decision", hint: "the day rates got rules" },
  ],
  unlocks:
    "A founder act, page by page: an entry enters this register by a commit the founder approves — no database, no automation, no exceptions. The first entry awaits the founder's promotion.",
  returnHook:
    "Anyone can claim transparency when everything is clean. The Chronicle exists to prove it when it isn't — and the seats that witness these chapters are part of the story they tell.",
};

export default function ChronicleTeaser() {
  // The register empty → the honest teaser (nothing invented, nothing implied).
  if (CHRONICLE_REGISTER.length === 0) {
    return <TeaserSurface spec={spec} />;
  }

  // The register speaks → the solemn record, oldest-first.
  const entries = [...CHRONICLE_REGISTER].sort((a, b) =>
    a.dateUtc.localeCompare(b.dateUtc),
  );
  return (
    <PublicPage
      eyebrow="Chronicle"
      title="The institutional story."
      lead="Turning points only — each entry promoted by a human decision, written in the protocol's own voice, and verifiable by anyone. Oldest first: the story in the order it was lived."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <div className="space-y-10">
        {entries.map((e, idx) => (
          <article key={e.id} id={e.id} className="scroll-mt-24">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
              <span className="font-mono text-xs text-gold">{`Entry ${idx + 1}`}</span>
              <h2 className="type-h2 text-foreground">{e.title}</h2>
              <span className="font-mono text-xs text-muted-foreground">{e.dateUtc}</span>
            </div>
            {e.sections.map((s) => (
              <div key={s.heading} className="mb-4">
                <h3 className="text-base font-medium text-foreground mb-1.5">{s.heading}</h3>
                <p className="text-sm text-foreground/90 leading-relaxed max-w-3xl whitespace-pre-line">
                  {s.body}
                </p>
              </div>
            ))}
            <Card className="bg-card/20 border-border/50 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-mono uppercase tracking-wider text-proof/80">Verify · </span>
                {e.verifyNote}
              </p>
            </Card>
          </article>
        ))}
      </div>

      <Card className="bg-card/20 border-dashed border-border/60 p-4 mt-12">
        <p className="text-xs text-muted-foreground leading-relaxed">
          An entry enters this register by a founder-approved commit — no
          database, no automation, no silent edits: the register's own history
          is public in the repository.
        </p>
      </Card>
    </PublicPage>
  );
}
