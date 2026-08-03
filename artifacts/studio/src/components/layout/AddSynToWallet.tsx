// components/layout/AddSynToWallet.tsx — ADD SYN TO YOUR WALLET (EIP-747).
//
// The founder's footer order (2026-08-03: «un logo MetaMask … ADD SYN … et
// aussi dans d'autres wallets … si tu peux faire mieux autrement fais
// ainsi») — built mechanism-over-brand: ONE button speaking the standard
// wallet_watchAsset call to the CONNECTED client. MetaMask, Rabby, Coinbase
// Wallet, Trust and every injected wallet answer the same EIP-747 call — no
// per-wallet buttons, no brand lock. Honest fallback when no wallet
// listens: the token address lands on the clipboard, said plainly.
//
// CHAIN OF CUSTODY (the address doctrine): the SYN address is EXTRACTED
// from the served synToken verify link — the one endpoint sanctioned to
// emit protocol addresses — never a client literal. Decimals come from the
// served protocol reality (the ProtocolMap discipline). The token image
// composes CANONICAL_ORIGIN + brandAssets. FAIL-CLOSED: without the served
// facts this renders NOTHING (never a dead button). guard-watch-asset pins
// every one of these laws.

import { useRef, useState } from "react";
import { useWalletClient } from "wagmi";
import { useGetProtocolReality, useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { brandAssets } from "@/config/brand";
import { copyText } from "@/lib/clipboard";
import { CANONICAL_ORIGIN } from "@/lib/seo-route-registry";

export function AddSynToWallet() {
  const { data: walletClient } = useWalletClient();
  const verify = useGetProtocolVerifyLinks();
  const reality = useGetProtocolReality();
  const [note, setNote] = useState<string | null>(null);
  // Deduplicated timer: without it an earlier timeout clears a LATER
  // message (the class fixed one commit earlier in PressKit — 2026-08-03).
  const timer = useRef<number | null>(null);
  const say = (msg: string) => {
    setNote(msg);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNote(null), 2600);
  };

  // The served synToken link carries the address as its /token/ tail.
  const synUrl = verify.data?.links.find((l) => l.id === "synToken")?.url ?? null;
  const address = synUrl?.match(/0x[0-9a-fA-F]{40}$/)?.[0] ?? null;

  // Decimals from the served reality — integer, bounded, publicSafe.
  const decItem = reality.data?.groups.tokens.find((i) => i.id === "tokens.SYN.decimals");
  const decRaw = decItem && decItem.publicSafe ? decItem.value : null;
  const decimals =
    typeof decRaw === "number" && Number.isInteger(decRaw) && decRaw >= 0 && decRaw <= 36
      ? decRaw
      : null;

  if (address === null || decimals === null) return null;

  const copyAddress = () => {
    // ABSENT and REFUSED both speak — the shared helper answers true/false
    // for each, so a dead click is impossible (lib/clipboard.ts).
    void copyText(address).then((done) =>
      say(
        done
          ? "Token address copied — add SYN in your wallet"
          : "Couldn't copy — the SYN address is on the Economy page",
      ),
    );
  };

  const onAdd = () => {
    if (!walletClient) {
      copyAddress();
      return;
    }
    void walletClient
      .watchAsset({
        type: "ERC20",
        options: {
          address: address as `0x${string}`,
          symbol: "SYN",
          decimals,
          image: `${CANONICAL_ORIGIN}${brandAssets["syn-mark-gold"]}`,
        },
      })
      .then((added) => {
        say(added ? "SYN is in your wallet" : "The wallet declined — nothing was added");
      })
      .catch(() => {
        // Engines without the call (or a dismissed sheet): the honest hand.
        copyAddress();
      });
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex min-h-11 items-center gap-2 rounded text-sm text-muted-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45"
        data-testid="button-add-syn-wallet"
      >
        <img src={brandAssets["syn-mark-gold"]} alt="" aria-hidden="true" className="h-4 w-auto" />
        <span>Add SYN to your wallet</span>
      </button>
      {/* The live region is ALWAYS mounted and only its TEXT swaps — a
          region inserted together with its content is not reliably
          announced by NVDA/JAWS/VoiceOver (2026-08-03 audit; the pattern
          is PressKit's). */}
      <span
        role="status"
        className={note !== null ? "text-xs text-muted-foreground" : "sr-only"}
      >
        {note ?? ""}
      </span>
    </span>
  );
}
