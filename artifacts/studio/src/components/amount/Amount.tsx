type Unit = "USDC" | "SYN";
interface Segment { value: string; unit: Unit; }
type Variant = "lead" | "stat" | "inline" | "compact";

const ORDER: Record<Unit, number> = { USDC: 0, SYN: 1 };
const NUM: Record<Variant, string> = {
  lead: "font-mono text-sm font-black sm:text-base",
  stat: "font-mono text-xl font-black",
  inline: "font-mono",
  compact: "font-mono text-[9px]",
};
const UNIT: Record<Variant, string> = {
  lead: "ml-1 font-mono text-[9px] font-semibold text-muted-foreground",
  stat: "ml-1 font-mono text-xs font-semibold text-muted-foreground",
  inline: "ml-1 font-mono",
  compact: "ml-1 font-mono text-[9px]",
};

interface AmountProps {
  segments: Segment[] | null;
  variant?: Variant;
  loading?: boolean;
  className?: string;
}

// Single presentation primitive for on-chain monetary values. Number formatting is
// done UPSTREAM (BigInt-safe formatBaseUnits); this atom owns typography per variant,
// canonical compound ordering (USDC before SYN), and the fail-closed placeholder.
export function Amount({ segments, variant = "lead", loading = false, className }: AmountProps) {
  if (!segments || segments.length === 0) {
    return (
      <span className={`font-mono text-[11px] font-semibold text-muted-foreground ${className ?? ""}`}>
        {loading ? "Checking\u2026" : "Unavailable"}
      </span>
    );
  }
  const ordered = [...segments].sort((a, b) => ORDER[a.unit] - ORDER[b.unit]);
  return (
    <span className={className}>
      {ordered.map((seg, i) => (
        <span key={`${seg.unit}-${i}`}>
          {i > 0 ? <span className="mx-1 font-mono text-[9px] font-semibold text-muted-foreground">+</span> : null}
          <span className={NUM[variant]}>{seg.value}</span>
          <span className={UNIT[variant]}>{seg.unit}</span>
        </span>
      ))}
    </span>
  );
}
