// wallet/ownReads.ts (build-time-gated wallet module)
//
// S7-b — the member's OWN live figure hooks, shared by the identity band and
// the KPI row (one read implementation, never two drifting copies). Every
// hook fails closed to null on any failure — a line/tile simply does not
// render a figure; nothing is invented or cached stale.

import { useEffect, useState } from "react";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import {
  readArtifactBalance,
  readSaleUsdcToken,
  readTokenBalance,
} from "@/lib/chainReads";
import { formatRawUnitsDisplay } from "@/lib/rawUnits";
import { fetchCapitalRung } from "@/lib/capitalStanding";
import {
  fetchOwnPurchases,
  fetchSourceStanding,
  type OwnPurchasesReadback,
  type SourceStandingReadback,
} from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

/** Token address out of a verify-links explorer URL (token or address form). */
function addressFromUrl(url: string): string | null {
  return url.match(/\/(?:token|address)\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}

/**
 * The wallet's OWN live SYN balance. Token address comes from the server's
 * verify-links (synToken) — never hardcoded.
 */
export function useOwnSynBalance(wallet: string | undefined): string | null {
  const { data } = useGetProtocolVerifyLinks();
  const tokenUrl = data?.links?.find((l) => l.id === "synToken")?.url ?? null;
  const tokenAddr = tokenUrl ? addressFromUrl(tokenUrl) : null;
  const [balance, setBalance] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setBalance(null);
    if (!wallet || !tokenAddr) return;
    void readTokenBalance(tokenAddr, wallet).then((raw) => {
      // Human display (S7-e): 2 decimals, exact half-up — never the 18-digit tail.
      if (active && raw !== null)
        setBalance(formatRawUnitsDisplay(raw.toString(), 18, 2));
    });
    return () => {
      active = false;
    };
  }, [wallet, tokenAddr]);
  return balance;
}

/**
 * The wallet's OWN live USDC balance. The USDC address is the sale engine's
 * own immutable USDC() (never hardcoded); the engine address comes from
 * verify-links. Fail closed to null.
 */
export function useOwnUsdcBalance(wallet: string | undefined): string | null {
  const { data } = useGetProtocolVerifyLinks();
  const saleUrl =
    data?.links?.find((l) => l.id === "membershipSaleV3")?.url ?? null;
  const saleAddr = saleUrl ? addressFromUrl(saleUrl) : null;
  const [balance, setBalance] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setBalance(null);
    if (!wallet || !saleAddr) return;
    void readSaleUsdcToken(saleAddr).then((usdc) => {
      if (!active || usdc === null) return;
      void readTokenBalance(usdc, wallet).then((raw) => {
        if (active && raw !== null)
          setBalance(formatRawUnitsDisplay(raw.toString(), 6, 2));
      });
    });
    return () => {
      active = false;
    };
  }, [wallet, saleAddr]);
  return balance;
}

/**
 * The seat's OWN capital-axis rung — the server's canon walk, title only
 * (recognition, never an amount, never a next-rung shape).
 */
export function useOwnCapitalRung(seat: string | null): string | null {
  const [rung, setRung] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setRung(null);
    if (seat === null) return;
    void fetchCapitalRung(seat).then((r) => {
      if (active && r !== null) setRung(r);
    });
    return () => {
      active = false;
    };
  }, [seat]);
  return rung;
}

/**
 * The wallet's OWN R5 introduction standing (indexed counts + live registry
 * reads). Re-reads on session changes so the dashboard resolves in place.
 */
export function useOwnSourceStanding(): SourceStandingReadback | null {
  const [standing, setStanding] = useState<SourceStandingReadback | null>(null);
  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchSourceStanding().then((r) => {
        if (active) setStanding(r);
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);
  return standing;
}

/**
 * D-TRUTH D3: the wallet's OWN purchase rows (the footprint's addends, each
 * with its verify anchor). Re-reads on session changes; null on any failure.
 */
export function useOwnPurchases(): OwnPurchasesReadback | null {
  const [readback, setReadback] = useState<OwnPurchasesReadback | null>(null);
  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchOwnPurchases().then((r) => {
        if (active) setReadback(r);
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);
  return readback;
}

/**
 * D-TRUTH D5: the two publicly mintable Archive artifacts. Ids + public
 * titles are protocol canon (the archive id registry; the same names the
 * reality spine serves on /archive and the feed speaks per mint). The
 * CONTRACT address still arrives live from verify-links — never hardcoded.
 */
export const OWN_ARCHIVE_ARTIFACTS = [
  { id: 1, label: "The First Signal" },
  { id: 3, label: "Patron Seal" },
] as const;

export interface OwnArtifactHolding {
  readonly id: number;
  readonly label: string;
  /** Live count as a plain integer string ("0" is a real, definitive zero). */
  readonly count: string;
}

/**
 * D5: the wallet's OWN Archive artifact holdings — live ERC-1155 balanceOf
 * per configured artifact (the own-balance class: read client-side, the
 * SYN-balance pattern). Null while unreadable; a served row's zero is real.
 */
export function useOwnArchiveHoldings(
  wallet: string | undefined,
): readonly OwnArtifactHolding[] | null {
  const { data } = useGetProtocolVerifyLinks();
  const archiveUrl =
    data?.links?.find((l) => l.id === "nftArchive")?.url ?? null;
  const archiveAddr = archiveUrl ? addressFromUrl(archiveUrl) : null;
  const [holdings, setHoldings] = useState<readonly OwnArtifactHolding[] | null>(
    null,
  );
  useEffect(() => {
    let active = true;
    setHoldings(null);
    if (!wallet || !archiveAddr) return;
    void Promise.all(
      OWN_ARCHIVE_ARTIFACTS.map((a) =>
        readArtifactBalance(archiveAddr, wallet, a.id).then(
          (raw): OwnArtifactHolding | null =>
            raw !== null
              ? { id: a.id, label: a.label, count: raw.toString() }
              : null,
        ),
      ),
    ).then((rows) => {
      if (!active) return;
      // Fail closed WHOLE: one unreadable artifact means the panel says
      // "unavailable" rather than a silently partial list.
      const complete: OwnArtifactHolding[] = [];
      for (const r of rows) {
        if (r === null) {
          setHoldings(null);
          return;
        }
        complete.push(r);
      }
      setHoldings(complete);
    });
    return () => {
      active = false;
    };
  }, [wallet, archiveAddr]);
  return holdings;
}

/** Whole-USDC display from 6-decimal base units, e.g. "$0.50". */
export function usdFromRaw(raw: string): string {
  const n = BigInt(raw);
  const whole = n / 1_000_000n;
  const cents = ((n % 1_000_000n) / 10_000n).toString().padStart(2, "0");
  return `$${whole}.${cents}`;
}
