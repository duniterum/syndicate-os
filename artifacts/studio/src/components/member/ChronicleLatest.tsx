// components/member/ChronicleLatest.tsx — the Chronicle's newest entry (S7-b).
// ---------------------------------------------------------------------------
// The dashboard's "announcements" slot, our way: the solemn record's latest
// entry, straight from the committed register (the one truth — client-side,
// CHR-1 intact: entries exist only by founder promotion). Register empty →
// the honest awaiting line, never an invented history.

import { Link } from "wouter";
import { ScrollText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CHRONICLE_REGISTER } from "@/config/chronicleRegister";

export function ChronicleLatest() {
  // Self-audit fix (2026-07-16): "latest" is decided by the PROMOTION date,
  // never by array position — the founder may promote entries out of order.
  const latest =
    CHRONICLE_REGISTER.length > 0
      ? [...CHRONICLE_REGISTER].sort((a, b) =>
          a.promotedUtc.localeCompare(b.promotedUtc),
        )[CHRONICLE_REGISTER.length - 1]!
      : null;

  return (
    <Card className="bg-card/40 border-border/50 p-5" data-testid="chronicle-latest">
      <div className="flex items-center gap-2 mb-2">
        <ScrollText className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 className="text-base font-medium text-foreground">The Chronicle</h3>
      </div>
      {latest !== null ? (
        <>
          <p className="text-base text-foreground/90" data-testid="chronicle-latest-title">
            “{latest.title}”
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {latest.dateUtc} · promoted by the founder
          </p>
          <Link
            href={`/chronicle#${latest.id}`}
            className="mt-2 inline-flex font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            Read the record →
          </Link>
        </>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">
          The first entry awaits the founder&apos;s promotion — the register
          only ever speaks by founder act.
        </p>
      )}
    </Card>
  );
}
