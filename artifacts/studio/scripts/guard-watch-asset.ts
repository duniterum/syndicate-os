// guard-watch-asset.ts — ADD SYN TO YOUR WALLET (EIP-747), the footer door. BLOCKING.
// ---------------------------------------------------------------------------
// THE SLICE (founder order, 2026-08-03: «un logo MetaMask au footer … ADD SYN
// … et aussi dans d'autres wallets … si tu peux faire mieux autrement fais
// ainsi»). The better-than-the-past shape, taken: ONE mechanism-over-brand
// button speaking EIP-747 wallet_watchAsset to the CONNECTED client —
// MetaMask, Rabby, Coinbase, Trust and every injected wallet answer the same
// call — with the honest copy-address fallback when no wallet listens.
//
// THE PINS (chain-of-custody above all — the address doctrine):
//   1. THE CONTROL EXISTS in the public footer's brand row, fail-closed:
//      without the SERVED facts it renders nothing (never a dead button).
//   2. NO CLIENT ADDRESS LITERAL — the SYN address is extracted from the
//      served verify-links synToken URL (the ONE sanctioned address-emitting
//      endpoint); a 0x40-hex literal in the component is RED.
//   3. NO HARDCODED DECIMALS — decimals come from the served protocol
//      reality (the ProtocolMap discipline); a `decimals: 18` literal is RED.
//   4. THE MECHANISM IS THE STANDARD — walletClient.watchAsset with type
//      ERC20; never a MetaMask-only deep link.
//   5. THE IMAGE IS THE AUTHORITY — CANONICAL_ORIGIN + brandAssets, never a
//      retyped absolute URL.
//
// NOT COVERED (stated): each wallet's live behavior on the call (rendered
// fact — the founder's own wallet is the gate), the served endpoint's truth
// (api guards own protocolTargets reconciliation).
// Scans are comment-stripped (line-first, closer-preserving lookaheads).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const COMPONENT = path.join(srcDir, "components", "layout", "AddSynToWallet.tsx");
const LAYOUT = path.join(srcDir, "components", "layout", "PublicLayout.tsx");

function stripComments(code: string): string {
  return code
    .replace(/^[ \t]*\/\/(?![^\n]*\*\/).*$/gm, "")
    .replace(/([^:"'])\/\/(?![^\n"']*\*\/)[^\n"']*$/gm, "$1")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

const comp = existsSync(COMPONENT) ? stripComments(readFileSync(COMPONENT, "utf8")) : "";
const layout = stripComments(readFileSync(LAYOUT, "utf8"));

// ── 1. THE CONTROL, MOUNTED AND FAIL-CLOSED ─────────────────────────────────
check(comp.length > 0, "watch-asset: the component exists", "watch-asset: components/layout/AddSynToWallet.tsx MISSING");
check(
  /<AddSynToWallet \/>/.test(layout),
  "watch-asset: mounted in the public footer",
  "watch-asset: <AddSynToWallet /> is not mounted in PublicLayout's footer brand row",
);
check(
  /return null;/.test(comp),
  "watch-asset: fail-closed (no served facts → no button)",
  "watch-asset: the component must render null without the served address+decimals — never a dead button",
);

// ── 2. NO CLIENT ADDRESS LITERAL ────────────────────────────────────────────
check(
  !/0x[0-9a-fA-F]{40}/.test(comp),
  "watch-asset: no address literal — the served verify-links url is the source",
  "watch-asset: a 0x40-hex literal lives in the component — the SYN address is EXTRACTED from the served synToken verify link, never retyped",
);
check(
  /synToken/.test(comp),
  "watch-asset: reads the served synToken link",
  "watch-asset: the component does not read the synToken verify link — the one sanctioned address source",
);

// ── 3. NO HARDCODED DECIMALS — negative AND positive ────────────────────────
// The negative alone forbade ONE spelling: hoisting the literal to a const
// defeated it entirely (seven-hat audit fixture, 2026-08-03). The chain of
// custody needs the POSITIVE too — decimals must demonstrably come from the
// served reality item.
check(
  !/decimals:\s*\d/.test(comp),
  "watch-asset: no hardcoded decimals literal",
  "watch-asset: decimals are hardcoded — read them from the served protocol reality (the ProtocolMap discipline)",
);
check(
  /useGetProtocolReality/.test(comp) && /tokens\.SYN\.decimals/.test(comp),
  "watch-asset: decimals READ from the served reality item tokens.SYN.decimals",
  "watch-asset: the component must READ decimals from the served protocol reality (tokens.SYN.decimals) — a client constant breaks the chain of custody the negative pin only half-guards",
);

// ── 4. THE STANDARD MECHANISM ───────────────────────────────────────────────
check(
  /watchAsset\s*\(/.test(comp) && /"ERC20"/.test(comp),
  "watch-asset: EIP-747 watchAsset(ERC20) — every wallet, one call",
  "watch-asset: the control must call walletClient.watchAsset with type ERC20 — the standard, never a per-wallet deep link",
);

// ── 5. THE IMAGE AUTHORITY ──────────────────────────────────────────────────
check(
  /CANONICAL_ORIGIN/.test(comp) && /brandAssets\[/.test(comp) && !/https:\/\/thesyndicate\.money/.test(comp),
  "watch-asset: the token image is CANONICAL_ORIGIN + brandAssets",
  "watch-asset: the token image must compose CANONICAL_ORIGIN + brandAssets — never a retyped absolute url",
);

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:watch-asset] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:watch-asset] PASS — ${ok.length}/${ok.length} watch-asset pins hold.`);
