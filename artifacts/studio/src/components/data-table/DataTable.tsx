import { useMemo, useState, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// DataTable — the FastPay-grade table atom. It composes the shadcn table
// primitives (already token-clean) and adds the shared needs of every OS table:
// a header row, click-to-sort columns, density (comfortable/compact via the
// --density-row tokens), zebra + hover rows, right-aligned numeric cells (which
// accept <Amount/>), a status cell (via a <StatusPill/> returned from `cell`),
// and honest empty + loading states. Tokens only, no new library — sorting is a
// few lines here rather than a table dependency. Filtering + pagination belong
// to the later CRUD-table PATTERN, not this atom.
export type SortDir = "asc" | "desc";
export type CellAlign = "left" | "right";

export interface Column<Row> {
  key: string;
  header: ReactNode;
  align?: CellAlign;
  sortable?: boolean;
  // Comparable value for sorting; required for a column to actually sort.
  sortAccessor?: (row: Row) => string | number;
  // Cell renderer — return a plain figure, an <Amount/>, a <StatusPill/>, etc.
  cell: (row: Row) => ReactNode;
  headClassName?: string;
  cellClassName?: string;
}

export type TableDensity = "comfortable" | "compact";

interface DataTableProps<Row> {
  columns: Column<Row>[];
  // null = loading (renders skeleton rows); [] = empty (renders the empty slot).
  rows: Row[] | null;
  getRowKey: (row: Row, index: number) => string;
  density?: TableDensity;
  zebra?: boolean;
  loading?: boolean;
  empty?: ReactNode;
  initialSort?: { key: string; dir: SortDir };
  className?: string;
  "data-testid"?: string;
}

const DENSITY: Record<TableDensity, string> = {
  comfortable: "[&_tbody_td]:h-[var(--density-row)]",
  compact: "[&_tbody_td]:h-[var(--density-row-compact)] [&_tbody_td]:py-1",
};

const SORT_GLYPH: Record<SortDir, string> = { asc: "▲", desc: "▼" };

export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  density = "comfortable",
  zebra = false,
  loading = false,
  empty,
  initialSort,
  className,
  ...rest
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(
    initialSort ?? null,
  );

  const isLoading = loading || rows === null;
  const baseRows = useMemo(() => rows ?? [], [rows]);

  const sorted = useMemo(() => {
    if (!sort) return baseRows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortAccessor) return baseRows;
    const acc = col.sortAccessor;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...baseRows].sort((a, b) => {
      const av = acc(a);
      const bv = acc(b);
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [baseRows, sort, columns]);

  function toggleSort(key: string) {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  return (
    <Table className={cn(DENSITY[density], className)} {...rest}>
      <TableHeader>
        <TableRow>
          {columns.map((col) => {
            const active = sort?.key === col.key;
            const alignRight = col.align === "right";
            return (
              <TableHead
                key={col.key}
                aria-sort={
                  active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined
                }
                className={cn(
                  alignRight && "text-right",
                  col.sortable && "cursor-pointer select-none",
                  col.headClassName,
                )}
                onClick={col.sortable ? () => toggleSort(col.key) : undefined}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    alignRight && "flex-row-reverse",
                  )}
                >
                  {col.header}
                  {col.sortable ? (
                    <span
                      aria-hidden
                      className={cn(
                        "font-mono text-[9px]",
                        active ? "text-foreground" : "text-muted-foreground/50",
                      )}
                    >
                      {active ? SORT_GLYPH[sort!.dir] : "↕"}
                    </span>
                  ) : null}
                </span>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, r) => (
            <TableRow key={`skeleton-${r}`}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(col.align === "right" && "text-right", col.cellClassName)}
                >
                  <Skeleton className="h-4 w-full max-w-[8rem]" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : sorted.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              {empty ?? "No rows to show."}
            </TableCell>
          </TableRow>
        ) : (
          sorted.map((row, index) => (
            <TableRow
              key={getRowKey(row, index)}
              className={cn(zebra && index % 2 === 1 && "bg-muted/30")}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(col.align === "right" && "text-right", col.cellClassName)}
                >
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
