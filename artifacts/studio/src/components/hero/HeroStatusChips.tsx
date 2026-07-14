// ① The hero's honest LIVE/PENDING posture rows — the origin's design
// language harvested (two labelled rows on desktop, one compact summary pill
// on mobile), rebuilt on our tokens. These are static posture DECLARATIONS
// (no figures, nothing fake-live); the live reconciliation behind them is the
// TrustStatusStrip and /status. PENDING lists only what is genuinely not
// deployed or wired today.
import { heroSystem } from "@/config/syndicateFacts";

function StatusRow({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "live" | "pending";
  items: readonly string[];
}) {
  const live = tone === "live";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] ${
          live
            ? "border-success/40 bg-success/10 text-success"
            : "border-warning/40 bg-warning/10 text-warning"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-success" : "bg-warning"}`}
          aria-hidden
        />
        {label}
      </span>
      {items.map((item) => (
        <span
          key={item}
          className="rounded border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:border-white/10 dark:bg-white/[0.03]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function HeroStatusChips({ className = "" }: { className?: string }) {
  const { live, pending, mobileNoteTail } = heroSystem.statusChips;
  return (
    <div className={className}>
      <div className="hidden flex-col gap-1.5 md:flex">
        <StatusRow label="Live" tone="live" items={live} />
        <StatusRow label="Pending" tone="pending" items={pending} />
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-success md:hidden">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" aria-hidden />
        {live.length} live · {pending.length} pending — {mobileNoteTail}
      </span>
    </div>
  );
}
