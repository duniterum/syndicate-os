// wallet/PublicReceiptTicket.tsx (build-time-gated wallet module)
//
// The /receipt/{txHash} public page's ticket mount (Q44 sealed order;
// founder-approved wireframe 2026-07-20). It parses the served PUBLIC row —
// the SAME fact shape and the SAME strict parser the binder's session read
// uses (one spine, one fact shape) — builds the model, and mounts THE ticket
// under its verdict bar.
//
// TRUTH ORDER (review finding, 2026-07-20): the "Sealed on-chain" verdict
// bar and the permanent-address line render ONLY once the STRICT parse
// accepted the row — a payload the parser refuses gets the honest
// unavailable card and no claim at all. A parsed row whose engine cannot
// print a full ticket keeps the bar (the purchase IS in the served record)
// over the honest-absence body.
//
// THE VISITOR'S DOOR (approved copy; review-hardened 2026-07-20): the
// member doors are buyer claims, so they render only for a viewer whose OWN
// referral link actually resolved (a seated member signed in) — everyone
// else, including a connected wallet with no seat, gets the one honest door
// (/join). The ticket itself enforces the rule (doorOverride stands until
// the link resolves); the owner affordances ride the same resolution.
// Still ONE door, always.

import { useAccount } from "wagmi";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { StatusPill } from "@/components/status-pill/StatusPill";
import ReceiptTicket from "./ReceiptTicket";
import { ticketModelFor } from "./receiptRowModel";
import { parseOwnPurchaseRow } from "./walletSession";
import type { ReceiptDoor } from "@/lib/protocolCommerceReceipt";

const VISITOR_DOOR: ReceiptDoor = {
  title: "Seats are open",
  body: "— see how membership works.",
  href: "/join",
};

export default function PublicReceiptTicket({
  rowRaw,
  decimals,
}: {
  /** The public read's served row, unparsed — strict parsing happens HERE,
   *  in the wallet module, with the binder's own parser. */
  rowRaw: unknown;
  decimals: { usdc: number; syn: number };
}) {
  const { address: wallet } = useAccount();
  const row = parseOwnPurchaseRow(rowRaw);

  if (row === null) {
    // A served row the strict parser refuses is a transport/shape fault —
    // the honest unavailable state; no verdict, no claim.
    return (
      <p className="max-w-md mx-auto text-sm text-muted-foreground leading-relaxed text-center">
        The record is unavailable right now — the on-chain record is
        unchanged. Try again in a moment.
      </p>
    );
  }

  const model = ticketModelFor(row, decimals);
  const seat =
    row.receipt !== null && row.receipt.seat !== null && row.receipt.seat > 0
      ? row.receipt.seat
      : null;
  const shortTx = `${row.transaction.slice(0, 6)}…${row.transaction.slice(-4)}`;

  return (
    <div data-testid="public-receipt-ticket">
      {/* Z1 · the verdict bar — whoever receives the link understands in one
          second: a sealed document, its identity, its receipt number. Renders
          only over a strictly-parsed served row. */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-4 max-w-[372px] mx-auto">
        <StatusPill tone="live" size="xs">
          Sealed on-chain
        </StatusPill>
        <span className="text-[15px] font-medium text-foreground">
          Membership receipt{seat !== null ? ` — Seat #${seat}` : ""}
        </span>
        <span className="ml-auto font-mono text-xs text-muted-foreground" data-testid="text-verdict-tx">
          tx {shortTx}
        </span>
      </div>

      {/* Z2 · the document. */}
      {model !== null ? (
        <div className="flex flex-col items-center">
          <ReceiptTicket model={model} wallet={wallet} doorOverride={VISITOR_DOOR} />
          {wallet ? (
            <Link
              href="/receipts"
              className="text-[13px] text-proof/85 hover:text-proof underline underline-offset-4 mt-3 print:hidden"
              data-testid="link-open-binder"
            >
              Open your binder ↗
            </Link>
          ) : null}
        </div>
      ) : (
        // The binder's honest-absence body, verbatim: an engine that never
        // carried every fact prints no guessed ticket — the proof link stands.
        <div className="max-w-md mx-auto text-center" data-testid="public-receipt-incomplete">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This engine&apos;s record does not carry every fact a full ticket
            needs — nothing is guessed. The transaction itself is the receipt.
          </p>
          <a
            href={row.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-proof/80 hover:text-proof underline underline-offset-2 mt-2"
          >
            Verify on the explorer
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      )}

      {/* Z3 · provenance (approved copy) — true for any served row. */}
      <p className="text-xs text-muted-foreground text-center max-w-[372px] mx-auto mt-4">
        This page is this receipt&apos;s permanent address — anyone with the
        link can verify it against the chain.
      </p>
    </div>
  );
}
