import { useGetProtocolReality } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

// LivingSignature — the "this is NOT a frozen PDF" mark, protocol-wide.
// Reads the reality envelope's honesty metadata (asOf / cacheTtlMs) and renders
// the live-read signature harvested from /status: a pulsing "read live" dot, the
// as-of timestamp, the bounded cache window, and "nothing hardcoded". Fail-closed:
// until the first read resolves it shows "reading…", never a fabricated time.
// Reused by the whitepaper, tokenomics, and every future living surface.
export function LivingSignature({ className }: { className?: string }) {
  const { data } = useGetProtocolReality();
  const asOf = data?.asOf ? new Date(data.asOf) : null;
  const ttlSeconds =
    typeof data?.cacheTtlMs === "number" ? Math.round(data.cacheTtlMs / 1000) : null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground",
        className,
      )}
      aria-label="Live-read signature"
    >
      <span className="inline-flex items-center gap-1.5 text-proof">
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-proof/60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-proof" />
        </span>
        Read live from Avalanche
      </span>
      <span className="text-border">·</span>
      <span>
        as of{" "}
        <span className="text-foreground/80">
          {asOf ? `${asOf.toISOString().replace("T", " ").slice(0, 19)} UTC` : "reading…"}
        </span>
      </span>
      {ttlSeconds !== null ? (
        <>
          <span className="text-border">·</span>
          <span>cached ≤ {ttlSeconds}s</span>
        </>
      ) : null}
      <span className="text-border">·</span>
      <span className="text-foreground/70">nothing hardcoded</span>
    </div>
  );
}
