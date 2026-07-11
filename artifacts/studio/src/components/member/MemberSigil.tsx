// components/member/MemberSigil.tsx
//
// A member's SIGIL — a deterministic seal derived ENTIRELY from the wallet
// address. Zero data, no network, no PII beyond the client's own address: the
// SAME wallet always yields the SAME mark, so a member recognizes their own
// seal at a glance (Member Home §4, "the sigil is derived from the wallet,
// free"). Pure SVG in brand tokens — it hardcodes NO color (strokes/fills use
// currentColor, inheriting the gold identity token), so no-raw-color stays green.

interface MemberSigilProps {
  /** The client's own wallet address, or null before it is known. */
  address: string | null;
  /** Pixel size (square). */
  size?: number;
  className?: string;
}

/** FNV-1a-style deterministic 32-bit hash of the (lowercased) address. */
function hashAddress(address: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < address.length; i += 1) {
    h ^= address.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function MemberSigil({ address, size = 44, className = "" }: MemberSigilProps) {
  const seed = address ? hashAddress(address.toLowerCase()) : 0;
  const cx = 50;
  const cy = 50;
  // Outer hexagon (the seat frame) — fixed, so every sigil reads as one family.
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + 36 * Math.cos(a)).toFixed(2)},${(cy + 36 * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
  // Deterministic inner constellation: spoke count + per-spoke radius from the
  // seed, so the mark is unique to the wallet but always balanced.
  const spokes = 6 + (seed % 5); // 6..10
  const rot = (seed % 360) * (Math.PI / 180);
  const nodes = Array.from({ length: spokes }, (_, i) => {
    const a = ((2 * Math.PI) / spokes) * i + rot;
    const rr = 12 + ((seed >>> (i % 12)) % 15); // 12..26
    return { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) };
  });
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`text-gold ${className}`}
      role="img"
      aria-label="Member sigil"
    >
      <polygon points={hex} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.45" />
      {nodes.map((n, i) => (
        <line
          key={`l${i}`}
          x1={cx}
          y1={cy}
          x2={n.x.toFixed(2)}
          y2={n.y.toFixed(2)}
          stroke="currentColor"
          strokeWidth="1.4"
          opacity="0.65"
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={`n${i}`} cx={n.x.toFixed(2)} cy={n.y.toFixed(2)} r="2.4" fill="currentColor" />
      ))}
      <circle cx={cx} cy={cy} r="3.4" fill="currentColor" />
    </svg>
  );
}

export default MemberSigil;
