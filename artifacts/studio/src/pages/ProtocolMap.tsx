import { Link } from "wouter";
import {
  useGetProtocolReality,
  type ProtocolRealityItem,
  type ProtocolRealityResponse,
} from "@workspace/api-client-react";
import { PublicPage } from "@/components/PublicPage";
import { ProtocolRealityPanel } from "@/components/ProtocolReality";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { formatRawUnits } from "@/lib/rawUnits";

// The public proof map. Zero new endpoints: everything on this page is a
// read-only composition of GET /api/protocol/reality. Raw base-unit strings are
// the source of truth and derived displays are labelled, with decimals taken
// from the live tokens group — if decimals are unreadable, we fail closed to
// raw-only. V3 is a deployed, readable contract: a failed figure read renders
// as "unreadable (fail-closed)", never as pending/inactive.
// (Footer audit 2026-07-30: the archive group is BOUND — the old "deliberately
// NOT rendered here" deferral had become an unpinned future claim while the
// same group already rendered on /status one footer link away. The financial
// group stays unrendered here, so the lead scopes itself honestly and claims
// no completeness.)

type RealityData = ProtocolRealityResponse;
type RealityItem = ProtocolRealityItem;

const MAP_GROUPS = ["chain", "contracts", "tokens", "sale", "source", "archive"] as const;

const V3_FIGURES: readonly {
  id: string;
  label: string;
  tokenKey: "SYN" | "USDC" | null;
}[] = [
  { id: "sale.MEMBERSHIP_SALE_V3.availableSyn", label: "Available SYN", tokenKey: "SYN" },
  { id: "sale.MEMBERSHIP_SALE_V3.totalGrossUsdc", label: "Gross USDC received (all-time)", tokenKey: "USDC" },
  { id: "sale.MEMBERSHIP_SALE_V3.receiptCount", label: "Receipt count", tokenKey: null },
];

/** Read a token's decimals from the live tokens group; fail closed to null. */
function readTokenDecimals(data: RealityData, tokenKey: "SYN" | "USDC"): number | null {
  const item = data.groups.tokens.find((i: RealityItem) => i.id === `tokens.${tokenKey}.decimals`);
  if (!item || !item.publicSafe) return null;
  const v = item.value;
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 36 ? v : null;
}

function findFigure(data: RealityData, id: string): RealityItem | null {
  const item = data.groups.sale.find((i: RealityItem) => i.id === id);
  if (!item || !item.publicSafe) return null;
  return item;
}

function FigureRow({
  label,
  wireId,
  raw,
  decimals,
  failureReason,
}: {
  label: string;
  wireId: string;
  raw: string | null;
  decimals: number | null;
  failureReason?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border/40 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{wireId}</div>
      </div>
      <div className="sm:text-right shrink-0 max-w-full">
        {raw === null ? (
          <div className="text-sm text-muted-foreground">
            unreadable (fail-closed)
            {failureReason ? (
              <span className="font-mono text-[10px] block">{failureReason}</span>
            ) : null}
          </div>
        ) : (
          <>
            {decimals !== null ? (
              <div className="text-sm text-foreground tabular-nums">
                {formatRawUnits(raw, decimals)}{" "}
                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                  derived · raw ÷ 10^{decimals}
                </span>
              </div>
            ) : null}
            <div className="font-mono text-[10px] text-muted-foreground break-all">
              exact raw · {raw}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** The V3 engine's three public figures, raw-first with labelled derivation. */
function V3FiguresBand() {
  const { data, isLoading, isError } = useGetProtocolReality();

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Reading the membership engine…</p>
      </Card>
    );
  }
  if (isError || !data) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          Protocol reality unavailable — nothing is assumed, nothing is invented. The figures
          return when the spine answers again.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-medium text-foreground">Membership engine — public figures</h2>
          <p className="text-sm text-muted-foreground mt-1 measure">
            Read directly from the deployed V3 sale engine. Raw base-unit strings are the source
            of truth; the derived display uses token decimals read live from chain, and falls
            back to raw-only if decimals are unreadable.
          </p>
        </div>
        <LifecycleBadge lifecycle="READ_ONLY_PROOF" />
      </div>
      <div className="mt-4">
        {V3_FIGURES.map((f) => {
          const item = findFigure(data, f.id);
          const raw = item && typeof item.value === "string" ? item.value : null;
          const decimals = f.tokenKey && raw !== null ? readTokenDecimals(data, f.tokenKey) : null;
          return (
            <FigureRow
              key={f.id}
              label={f.label}
              wireId={f.id}
              raw={raw}
              decimals={decimals}
              failureReason={item?.failureReason ?? null}
            />
          );
        })}
      </div>
    </Card>
  );
}

export default function ProtocolMap() {
  return (
    <PublicPage
      eyebrow="Public proof"
      title="Protocol Map"
      lead="The protocol's identity, contract, token, sale, source and archive signals in one place — read live by our own server and checked against the pinned contract records. A failed read renders as unavailable; nothing is estimated or invented. The live treasury and reserve figures have their own homes on the front page and /contracts."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
      variant="app"
    >
      <div className="space-y-10">
        <V3FiguresBand />

        <section>
          <ProtocolRealityPanel groups={[...MAP_GROUPS]} showMeta />
        </section>

        <section className="text-sm text-muted-foreground space-y-2">
          <p>
            This page renders figures, not addresses — every contract behind them carries its
            explorer verify-link on the status hub. Reading this page writes nothing: it never
            connects a wallet and never sends a transaction.
          </p>
          <p>
            The authoritative wiring ledger for every module lives on the{" "}
            <Link href="/status" className="text-foreground underline underline-offset-4">
              status hub
            </Link>
            .
          </p>
        </section>
      </div>
    </PublicPage>
  );
}
