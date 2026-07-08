import {
  useGetProtocolReality,
  type ProtocolRealityItem,
  type ProtocolRealityResponse,
} from "@workspace/api-client-react";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type RealityGroupKey = keyof ProtocolRealityResponse["groups"];

const groupTitle: Record<RealityGroupKey, string> = {
  chain: "Chain identity",
  contracts: "Contract code (on-chain)",
  sale: "Sale engine (read-only)",
  source: "Source registry (read-only)",
  tokens: "Token metadata",
  archive: "Archive artifacts",
  financial: "Financial reality (read-only)",
};

const groupBlurb: Record<RealityGroupKey, string> = {
  chain: "Which chain answered and whether it is the expected Avalanche C-Chain.",
  contracts: "Whether each known contract has deployed code at its server-resolved address.",
  sale: "Live read-only state from the deployed membership-sale engines. V3 is the active engine — its public figures are shown as exact raw base units. This app reads only; no wallet, transaction, or referral surface is enabled.",
  source: "Read-only source-registry posture: registry linkage on the active engine and the registry's creation policy. No source ids are shown; validation happens per-link on request.",
  tokens: "Public ERC-20 metadata only — symbol and decimals. No balances or supply.",
  archive: "Whether each artifact id is configured on-chain, and the contract pause flag.",
  financial:
    "Aggregate on-chain financial figures — per-engine cumulative USDC inflow (V1 + V2a + V2b + V3, including founder buildout test transactions; never external customer revenue) with a fail-closed total, vault + operations balances (current balances, not cumulative inflow — USDC routes 70/20/10 to vault/liquidity/operations), pool reserves, burned SYN, the live member tally, and the referral attribution ACTIVITY count (indexed chain scan; no commission is paid — CommissionRouterV1 is not deployed). Exact raw base units; every figure fails closed to unavailable, never to a stored constant.",
};

const sourceTypeText: Record<string, string> = {
  SERVER_SIDE_CANON: "Server canon",
  LIVE_CHAIN_RPC: "Live chain RPC",
  CANON_RECONCILED_RPC: "Canon-reconciled RPC",
  INDEXED_CHAIN_SCAN: "Indexed chain scan",
};

const confidenceText: Record<string, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  UNKNOWN: "Unknown",
};

/** Render a read value honestly: a present value, or an em dash + reason when null. */
function RealityValue({ item }: { item: ProtocolRealityItem }) {
  if (item.value === null) {
    return (
      <div>
        <div className="font-mono text-[11px] text-muted-foreground">—</div>
        <div className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5 leading-snug">
          {item.failureReason ?? "not read"}
        </div>
      </div>
    );
  }
  const shown = typeof item.value === "boolean" ? String(item.value) : String(item.value);
  return <div className="font-mono text-[12px] text-foreground/90">{shown}</div>;
}

export function RealityTable({ items }: { items: ProtocolRealityItem[] }) {
  return (
    <Card className="bg-card/40 border-border/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-border/30">
            <TableHead className="w-[260px] font-medium text-foreground">Signal</TableHead>
            <TableHead className="w-[160px] font-medium text-foreground">Value</TableHead>
            <TableHead className="font-medium text-foreground">Source · confidence</TableHead>
            <TableHead className="text-right font-medium text-foreground">Lifecycle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className="border-border/30 hover:bg-muted/10 transition-colors align-top"
            >
              <TableCell className="font-medium text-foreground/90">
                <div>{item.label}</div>
                <div className="font-mono text-[10px] text-muted-foreground mt-1">{item.sourceRef}</div>
              </TableCell>
              <TableCell>
                <RealityValue item={item} />
              </TableCell>
              <TableCell className="text-sm">
                <div className="font-mono text-[10px] text-foreground/70">
                  {sourceTypeText[item.sourceType] ?? item.sourceType}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Confidence · {confidenceText[item.confidence] ?? item.confidence}
                </div>
                <div className="text-[11px] text-muted-foreground/80 mt-1 leading-snug">{item.note}</div>
              </TableCell>
              <TableCell className="text-right">
                <LifecycleBadge lifecycle={item.lifecycle} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <Card className="bg-card/40 border-border/50 p-12">
      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Spinner className="h-6 w-6 text-primary" />
        <p className="text-sm">{label}</p>
      </div>
    </Card>
  );
}

function ErrorCard() {
  return (
    <Card className="bg-card/40 border-border/50 p-8">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-amber-500/10 rounded-md text-amber-500 shrink-0 mt-0.5">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground">Protocol reality unavailable</h4>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            The read-only reality feed could not be reached. No fallback or placeholder values are
            shown — this surface only renders verified reads from the protocol-reality endpoint.
          </p>
        </div>
      </div>
    </Card>
  );
}

export function MetaStrip({ data }: { data: ProtocolRealityResponse }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
      <span>
        Mode <span className="text-foreground/80">{data.mode}</span>
      </span>
      <span className="text-border">·</span>
      <span>
        Expected chain <span className="text-foreground/80">{data.expectedChainId}</span>
      </span>
      <span className="text-border">·</span>
      <span>
        Cached <span className="text-foreground/80">{String(data.cached)}</span>
      </span>
      <span className="text-border">·</span>
      <span>
        Read age <span className="text-foreground/80">≤{Math.round(data.cacheTtlMs / 1000)}s</span>
      </span>
      <span className="text-border">·</span>
      <span>
        As of <span className="text-foreground/80">{new Date(data.asOf).toISOString().slice(0, 16).replace("T", " ")}</span>
      </span>
    </div>
  );
}

interface ProtocolRealityPanelProps {
  /** Which groups to render, in order. Defaults to all four. */
  groups?: RealityGroupKey[];
  /** Show the mode/chain/asOf meta strip (used on the status hub). */
  showMeta?: boolean;
}

/**
 * Read-only protocol reality, grouped into honest tables. Self-contained: it owns
 * the query, the loading/error states, and the truth-labelling of every read.
 */
export function ProtocolRealityPanel({
  groups = ["chain", "contracts", "sale", "tokens", "archive"],
  showMeta = false,
}: ProtocolRealityPanelProps) {
  const { data, isLoading, isError } = useGetProtocolReality();

  if (isLoading) return <LoadingCard label="Reading protocol reality…" />;
  if (isError || !data) return <ErrorCard />;

  return (
    <div>
      {showMeta && <MetaStrip data={data} />}
      <div className="space-y-10">
        {groups.map((g) => {
          // Defense-in-depth: never render an item the server did not mark
          // public-safe, even though this endpoint only emits public reads.
          const items = (data.groups[g] ?? []).filter((i) => i.publicSafe);
          if (items.length === 0) return null;
          return (
            <section key={g}>
              <h3 className="text-base font-medium text-foreground">{groupTitle[g]}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-2xl">{groupBlurb[g]}</p>
              <RealityTable items={items} />
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 min-w-[88px]">
      <div className="text-2xl font-light text-foreground tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

/** Compact reality summary for the console overview — counts + link, no raw values. */
export function ProtocolRealitySummary() {
  const { data, isLoading, isError } = useGetProtocolReality();

  if (isLoading) return <LoadingCard label="Reading protocol reality…" />;
  if (isError || !data) return <ErrorCard />;

  const all: ProtocolRealityItem[] = [
    ...data.groups.chain,
    ...data.groups.contracts,
    ...data.groups.sale,
    ...data.groups.tokens,
    ...data.groups.archive,
  ];
  const read = all.filter((i) => i.value !== null).length;
  const verified = all.filter((i) => i.confidence === "HIGH").length;
  const awaiting = all.filter((i) => i.value === null).length;

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-medium text-foreground">Protocol reality</h3>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
            GET /api/protocol/reality · {data.mode}
          </p>
        </div>
        <LifecycleBadge lifecycle="READ_ONLY_PROOF" />
      </div>
      <div className="flex flex-wrap gap-4">
        <Stat label="Signals" value={all.length} />
        <Stat label="Read" value={read} />
        <Stat label="Verified" value={verified} />
        <Stat label="Awaiting" value={awaiting} />
      </div>
    </Card>
  );
}
