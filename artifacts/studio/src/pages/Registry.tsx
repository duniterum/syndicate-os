/**
 * /registry — THE REGISTER (founder order 2026-07-30).
 *
 * The public per-seat register the 2026-07-25 address model explicitly
 * permits (CANON_VISIBILITY_LAW · ADR-003 rescope): `#N · 0x…↗ · chapter ·
 * rung · joined` — address-only, zero identity. Everything this protocol
 * does is on-chain and SHOWN: which wallet holds which seat is public,
 * verifiable data, and this page is where the whole membership stands in
 * one column. The red line is untouched — no name, alias, or email exists
 * anywhere in the system, and a name↔address directory will never exist.
 *
 * WORK-FIRST: the page opens on the register itself. Honest states only —
 * a dash is an absence the chain can explain (a genesis seat predates the
 * indexed streams), never a hidden value; a dark backbone says so.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { TABLE_PAGE_SIZE } from "@/lib/pageSize";

interface RegisterRow {
  seat: number;
  wallet: string;
  shortForm: string;
  explorerUrl: string;
  chapter: string;
  rung: string | null;
  joinedIsoDay: string | null;
}
interface RegisterPayload {
  module: "the-register";
  state: "LIVE" | "DARK";
  seatsTotal: number;
  rows: RegisterRow[];
  honesty: string;
}

export default function Registry() {
  const [payload, setPayload] = useState<RegisterPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/registry")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: RegisterPayload) => {
        if (!cancelled) setPayload(j);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = payload?.state === "LIVE" ? payload.rows : [];

  // Founder-approved pagination (wireframe v2, « ok les 2 » 2026-08-02):
  // 25/page via the ONE shared constant, the pager row exists ONLY beyond one
  // page (today's 16 seats render byte-identical, no pager in the DOM), the
  // register OPENS on page 1 — a register reads from its beginning. The range
  // line counts register rows (positions); with a contiguous seat set they
  // coincide with the seat ordinals shown.
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / TABLE_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = rows.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE,
  );
  const rangeStart = rows.length === 0 ? 0 : (currentPage - 1) * TABLE_PAGE_SIZE + 1;
  const rangeEnd = rangeStart + Math.max(0, visibleRows.length - 1);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="type-eyebrow text-gold">The public record</div>
          <LifecycleBadge lifecycle="READ_ONLY_PROOF" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl mt-1">The Register.</h1>
        <p className="type-body text-muted-foreground measure mt-3">
          Every seat, its wallet, and its standing — in one public column.
          The chain wrote each row when the seat was taken; the explorer link
          beside every address is the proof. Address-only by design: no name,
          no email, no identity exists anywhere in this system.
        </p>
      </div>

      {failed && (
        <p className="type-body text-muted-foreground">
          The register cannot be read right now — nothing is shown rather than
          something guessed. Reload to try again.
        </p>
      )}
      {!failed && payload?.state === "DARK" && (
        <p className="type-body text-muted-foreground">
          The indexer has not published its first read yet. The register shows
          real rows or none — never an invention.
        </p>
      )}
      {!failed && payload === null && (
        <p className="type-eyebrow text-muted-foreground">Reading the chain…</p>
      )}

      {rows.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left">
                  <th className="type-eyebrow text-muted-foreground font-semibold pb-3 pr-4">Seat</th>
                  <th className="type-eyebrow text-muted-foreground font-semibold pb-3 pr-4">Address</th>
                  <th className="type-eyebrow text-muted-foreground font-semibold pb-3 pr-4">Chapter</th>
                  <th className="type-eyebrow text-muted-foreground font-semibold pb-3 pr-4">Standing</th>
                  <th className="type-eyebrow text-muted-foreground font-semibold pb-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((r) => (
                  <tr key={r.seat} className="border-t border-border/50 hover:bg-card/40">
                    <td className="font-mono text-sm font-semibold text-gold py-3.5 pr-4 border-t border-border/40">
                      #{r.seat}
                    </td>
                    <td className="py-3.5 pr-4 border-t border-border/40">
                      <a
                        href={r.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-sm font-mono text-sm text-proof transition-colors hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        title={r.wallet}
                      >
                        {r.shortForm}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </td>
                    <td className="text-sm text-muted-foreground py-3.5 pr-4 border-t border-border/40">
                      {r.chapter}
                    </td>
                    <td className="font-mono text-sm py-3.5 pr-4 border-t border-border/40">
                      {r.rung ?? <span title="No walked standing yet — an honest absence.">—</span>}
                    </td>
                    <td className="font-mono text-sm text-muted-foreground py-3.5 border-t border-border/40">
                      {r.joinedIsoDay ?? (
                        <span title="This seat's history predates the indexed streams (genesis).">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > TABLE_PAGE_SIZE ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="syn-caption text-muted-foreground">
                Seats {rangeStart}–{rangeEnd} of {rows.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="px-1.5 font-mono text-xs text-muted-foreground">
                  {currentPage} / {pageCount}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
          <p className="text-sm text-muted-foreground leading-relaxed measure mt-6">
            {payload!.honesty}
          </p>
        </>
      )}

      <div className="flex flex-wrap gap-3 mt-10">
        <Link href="/join" className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Button tabIndex={-1}>Take your seat</Button>
        </Link>
        <Link href="/season" className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Button tabIndex={-1} variant="outline">The season board</Button>
        </Link>
      </div>
    </div>
  );
}
