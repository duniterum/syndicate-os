import { DataTable, type Column } from "@/components/data-table/DataTable";
import { Amount } from "@/components/amount/Amount";
import { StatusPill } from "@/components/status-pill/StatusPill";
import type { AllocationLive } from "@/components/tokenomics/useTokenomics";

// ReconciliationTable — the mint-time DESIGN target beside the CURRENT live
// on-chain balance for each allocation. The design column is a labelled config
// target; the balance + share columns are live chain reads (fail-closed to a
// PENDING pill, never a typed number). Built on the DataTable atom. Reused by
// the whitepaper and tokenomics.
function LivePct({ value }: { value: string | null }) {
  if (value === null) {
    return (
      <StatusPill tone="caution" size="xs">
        PENDING
      </StatusPill>
    );
  }
  return <span className="font-mono tabular-nums text-foreground">{value}%</span>;
}

const COLUMNS: Column<AllocationLive>[] = [
  {
    key: "label",
    header: "Allocation",
    cell: (r) => <span className="font-medium text-foreground/90">{r.label}</span>,
  },
  {
    key: "design",
    header: "Design",
    align: "right",
    cell: (r) => <span className="font-mono text-muted-foreground">{r.designPct}%</span>,
  },
  {
    key: "live",
    header: "Live now",
    align: "right",
    cell: (r) => (
      <Amount segments={r.currentSyn ? [{ value: r.currentSyn, unit: "SYN" }] : null} variant="inline" />
    ),
  },
  {
    key: "pct",
    header: "% of supply",
    align: "right",
    cell: (r) => <LivePct value={r.currentPct} />,
  },
];

export function ReconciliationTable({
  rows,
  loading,
}: {
  rows: AllocationLive[];
  loading?: boolean;
}) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={loading ? null : rows}
      getRowKey={(r) => r.key}
      density="compact"
    />
  );
}
