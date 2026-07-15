// components/admin/ChroniclePrepare.tsx — the Chronicle PREPARE panel (CHR-1).
// ---------------------------------------------------------------------------
// Origin labs promotion screens ADAPTED to our v1 doctrine: the register is a
// COMMITTED FILE and PROMOTION IS A FOUNDER ACT. This panel therefore writes
// NOTHING anywhere — it formats a candidate into the exact ChronicleEntry
// shape and the founder's promotion happens as a repo commit (through the
// normal gate). Console-only: mounted in the operator shell, which is
// dead-code-eliminated from default public builds.

import { useState } from "react";
import { Check, Copy, ScrollText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function tsString(s: string): string {
  return JSON.stringify(s);
}

export function ChroniclePrepare() {
  const [title, setTitle] = useState("");
  const [dateUtc, setDateUtc] = useState("");
  const [record, setRecord] = useState("");
  const [why, setWhy] = useState("");
  const [verify, setVerify] = useState("");
  const [copied, setCopied] = useState(false);

  const id = `${dateUtc || "YYYY-MM-DD"}-${(title || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)}`;

  const snippet = `  {
    id: ${tsString(id)},
    dateUtc: ${tsString(dateUtc)},
    // H2-⑭: set to the day of THIS promoting commit (the feed narrates it).
    promotedUtc: "YYYY-MM-DD",
    title: ${tsString(title)},
    sections: [
      { heading: "The record", body: ${tsString(record)} },
      { heading: "Why this is recorded", body: ${tsString(why)} },
    ],
    verifyNote: ${tsString(verify)},
  },`;

  const copy = () => {
    void navigator.clipboard?.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const field =
    "w-full rounded-md border border-border/50 bg-background/60 px-3 py-2 text-xs text-foreground outline-none focus:border-primary/60";

  return (
    <Card className="p-5 border-border/50 bg-card/40 space-y-3">
      <div className="flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 className="text-base font-medium text-foreground">
          Chronicle — prepare an entry (promotion = a founder commit)
        </h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        This panel writes nothing. It formats a candidate into the register's
        exact shape; the entry enters /chronicle only when the founder approves
        the commit that adds it to <span className="font-mono">config/chronicleRegister.ts</span>.
        Register discipline: protocol-institutional voice · identity-blind ·
        amount-blind · verify-first. Candidates wait in{" "}
        <span className="font-mono">docs/chronicle/candidates/</span>.
      </p>
      <input className={field} placeholder="Title (e.g. The duplicate seat)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={field} placeholder="Date UTC (YYYY-MM-DD — the day it happened)" value={dateUtc} onChange={(e) => setDateUtc(e.target.value)} />
      <textarea className={`${field} min-h-24`} placeholder="The record — what happened, protocol voice, no identities, no spin" value={record} onChange={(e) => setRecord(e.target.value)} />
      <textarea className={`${field} min-h-16`} placeholder="Why this is recorded" value={why} onChange={(e) => setWhy(e.target.value)} />
      <textarea className={`${field} min-h-16`} placeholder="Verify — how any reader checks this record on-chain" value={verify} onChange={(e) => setVerify(e.target.value)} />
      <div className="rounded-md border border-border/50 bg-background/40 p-3">
        <pre className="text-[10px] text-muted-foreground overflow-x-auto whitespace-pre">{snippet}</pre>
      </div>
      <Button size="sm" variant="outline" onClick={copy} data-testid="button-chronicle-copy">
        {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
        {copied ? "Copied" : "Copy the entry for the commit"}
      </Button>
    </Card>
  );
}
