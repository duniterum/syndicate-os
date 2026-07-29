// pages/ChronicleTeaser.tsx — /chronicle (CHR-1: the register is real, the
// data source is a COMMITTED FILE, and promotion is a FOUNDER ACT).
// Two honest states:
//   · register EMPTY → the designed teaser + "the first entry awaits the
//     founder's promotion" (no invented history);
//   · register CARRIES ENTRIES → the solemn public record, NEWEST-first (the
//     entry NUMBER stays chronological — Entry 1 is the first thing that happened),
//     protocol-institutional voice, identity/amount-blind, verify-first.

import { MemberAppPage } from "@/components/member/MemberAppPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { TeaserSurface, type TeaserSpec } from "@/components/TeaserSurface";
import { CHRONICLE_REGISTER, type ChronicleEntry } from "@/config/chronicleRegister";

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

  // THE REGISTER SPEAKS NEWEST FIRST (Founder doctrine change, 2026-07-26).
  // It rendered oldest-first until the register grew from 4 entries to 15: a
  // reader then opens the page on June and has to scroll a whole institutional
  // history to reach what just happened. Newest-first matches every other record
  // on this protocol — /activity, the burn ledger, the notification centre — so
  // the Chronicle stops being the one surface that reads backwards.
  // Sorted by the EVENT date, never by array position: the Founder promotes out
  // of order (eleven entries dated June landed in one commit in July), so array
  // order carries no meaning and must never be trusted for chronology.
  // THE ENTRY NUMBER IS CHRONOLOGICAL; THE ORDER IS NEWEST-FIRST. Two different
  // things, and conflating them was a defect (senior review, 2026-07-27).
  // `Entry N` was rendered from the RENDER index, so after `b74dfdb` flipped the
  // list to newest-first the ordinals ran BACKWARDS against the dates printed
  // beside them — Entry 1 dated 2026-07-13, Entry 15 dated 2026-06-06. To a
  // reader, "Entry 1" means the FIRST thing that happened; it cannot mean "the
  // most recent" just because the list opens there. The previous commit fixed
  // the sentence and left the number three lines below it untouched.
  //
  // Ties are broken by id so both orderings are deterministic mirrors of each
  // other: eleven entries share a promotion date, and a stable sort alone would
  // let a tie group read ascending inside a descending list.
  const byDateThenId = (a: ChronicleEntry, b: ChronicleEntry) =>
    a.dateUtc.localeCompare(b.dateUtc) || a.id.localeCompare(b.id);
  const chronological = [...CHRONICLE_REGISTER].sort(byDateThenId);
  const entryNumberById = new Map(chronological.map((e, i) => [e.id, i + 1]));
  const entries = [...chronological].reverse();
  return (
    <MemberAppPage
      eyebrow="Chronicle"
      title="The institutional story."
      // THE COPY MUST MATCH THE SORT (senior review, 2026-07-27). `b74dfdb`
      // flipped the register to NEWEST-FIRST — the founder's ruling: the
      // doctrine that fit four entries broke at fifteen — and left this
      // sentence saying "Oldest first". A public page describing its own list
      // backwards is a chain-refutable claim about the cheapest thing to check:
      // what the reader is looking at.
      lead="Turning points only — each entry promoted by a human decision, written in the protocol's own voice, and verifiable by anyone. Newest first — the record opens on what happened last."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <div className="space-y-10">
        {entries.map((e) => (
          <article key={e.id} id={e.id} className="scroll-mt-24">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
              <span className="font-mono text-xs text-gold">{`Entry ${entryNumberById.get(e.id)}`}</span>
              <h2 className="type-h2 text-foreground">{e.title}</h2>
              <span className="font-mono text-xs text-muted-foreground">{e.dateUtc}</span>
            </div>
            {e.sections.map((s) => (
              <div key={s.heading} className="mb-4">
                {/* A HEADING MUST OUTRANK ITS OWN BODY (2026-07-28 review).
                    24131e7 raised the <p> below from `text-sm` to `type-body`
                    (16→20px fluid) and never touched this line, which is a fixed
                    16px `text-base` — so at 1440px the prose rendered 18.75px
                    UNDER a 16px heading, on 45 sections. The verification that
                    slice ran measured the ARTICLE title (`type-h2`, 29.6px), not
                    the heading that actually governs the paragraph.
                    `type-h3` is the site's own step above body. */}
                <h3 className="type-h3 text-foreground mb-1.5">{s.heading}</h3>
                <p className="type-body text-foreground/90 measure whitespace-pre-line">
                  {s.body}
                </p>
              </div>
            ))}
            <Card className="bg-card/20 border-border/50 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-mono uppercase tracking-wider text-proof">Verify · </span>
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
    </MemberAppPage>
  );
}
