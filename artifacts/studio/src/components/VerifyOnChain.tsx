// "Don't trust — verify." — tiny explorer-link row bound to the read-only
// GET /api/protocol/verify-links endpoint (protocol infrastructure ONLY;
// the server never emits member wallets). Strict fail-closed: if the
// endpoint is unavailable or ANY requested id is missing from the payload,
// NOTHING renders — never a partial verification row, no guessed URLs, no
// hardcoded addresses in the client bundle.
import { ExternalLink } from "lucide-react";
import { useGetProtocolVerifyLinks, type VerifyLinkId } from "@workspace/api-client-react";

/** Compact display names when several links share one row (sale engines). */
const SHORT_LABELS: Partial<Record<VerifyLinkId, string>> = {
  membershipSaleV1: "V1",
  membershipSaleV2A: "V2a",
  membershipSaleV2: "V2b",
  membershipSaleV3: "V3",
};

export const VERIFY_SLOGAN = "Don't trust — verify.";

export function VerifyOnChain({
  ids,
  className,
}: {
  ids: readonly VerifyLinkId[];
  className?: string;
}) {
  const { data } = useGetProtocolVerifyLinks();
  const resolved = ids.map((id) => data?.links.find((l) => l.id === id));
  // Strict fail-closed: every requested id must resolve, or nothing renders.
  if (ids.length === 0 || resolved.some((l) => l === undefined)) return null;
  const links = resolved as NonNullable<(typeof resolved)[number]>[];

  const anchorClass =
    "inline-flex items-center gap-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-proof/80 transition-colors hover:text-proof";

  if (links.length === 1) {
    const link = links[0];
    return (
      <span className={className}>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`${link.label} — open in block explorer`}
          className={anchorClass}
        >
          Verify on-chain
          <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
        </a>
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 ${className ?? ""}`}>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
        Verify:
      </span>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`${link.label} — open in block explorer`}
          className={anchorClass}
        >
          {SHORT_LABELS[link.id] ?? link.label}
          <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
        </a>
      ))}
    </span>
  );
}
