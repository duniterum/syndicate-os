// CoinMark.tsx — a token's REAL logo. ONE component, both surfaces.
//
// THE FOUNDER'S ASK (2026-07-28, on a screenshot of /contracts): « utilise les
// vrais logos de tokens / coins ». The "Protocol assets" card was drawing nine
// rows with GENERIC lucide glyphs — a shield for vault USDC, a wallet for
// operations USDC, a ticket for NFT sales, a bare triangle for AVAX, a hexagon
// for ETH, a droplet for the pool. The real logos were already vendored in
// public/coins/ AND already rendered by the home page's reserves band, which had
// its own private copy of this component. So this is CLAUDE.md ① again: one
// decision that lived in one file and was re-invented (worse) in another.
//
// LOGOS are vendored locally (MIT icon set, see public/coins/LICENSE.txt). No
// external host is ever called for an image: the page works offline and no third
// party learns who visits us. A missing file falls back to a lettered disc —
// never a broken image.
//
// SYN IS NOT A COIN LOGO. The protocol's own token has no entry in that icon set
// and never will; it wears the brand mark, from the same `brandAssets` map the
// header uses. That is a deliberate branch, not an omission.

import { useState } from "react";
import { brandAssets } from "@/config/brand";

/** The protocol's own token — the brand mark, never a third-party glyph. */
export const SYN_LOGO = "__syn__";

export function CoinMark({
  logo,
  symbol,
  size = 34,
  className,
}: {
  /** Local logo slug → public/coins/<logo>.svg, or SYN_LOGO for the brand mark. */
  logo: string;
  /** Fallback text when the file cannot be read — never a broken image. */
  symbol: string;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span className="font-mono text-[12px] font-bold text-muted-foreground">
        {symbol.slice(0, 3)}
      </span>
    );
  }

  const src = logo === SYN_LOGO ? brandAssets["syn-mark-gold"] : `/coins/${logo}.svg`;

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      style={{ width: size, height: size }}
      className={className ?? "object-contain"}
      onError={() => setBroken(true)}
    />
  );
}
