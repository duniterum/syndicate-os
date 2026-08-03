// guard-join-showcase.ts — THE BUYER-FACING REFERRAL SHOWCASE ON /join. BLOCKING.
// ---------------------------------------------------------------------------
// THE SLICE (C — the engraved sequence; founder «go avec human readable text»,
// 2026-08-03). /join carried only the invitee attribution strip (K2); the
// BUYER never learned the program's unique claim. The founder's own catch
// shaped the voice: the §7 flagship lines are REFERRER voice («You don't wait
// to get paid» read absurd to a paying buyer) — the card speaks BUYER-FUTURE
// voice, same chain-true claims, and the founder approved this copy verbatim.
//
// THE PINS:
//   1. THE MOUNT + ITS PLACE — JoinReferralShowcase exists and sits AFTER the
//      honest economics, BEFORE the boundary card (WORK-FIRST: the last
//      argument before the tail, never above the purchase work).
//   2. THE COPY, FROZEN — the engraved §7 one-liner verbatim (the site's ONE
//      sanctioned «payout», carved out in guard-forbidden-copy) + the three
//      founder-approved bold claims + the price-truth closing («never changes
//      your price» — the anti-markup fact that must never be dropped).
//   3. THE §7 FORMAT — bold claim + verify path: the /activity door and the
//      /terms door both present inside the card.
//   4. THE BUYER'S TONGUE — no machine plumbing in the card: routed/routing
//      and escrow never reach a buyer's eyes (the terms explain mechanisms).
//
// NOT COVERED (stated): rendered pixels and themes (the rig/preview gate),
// the /activity and /terms routes' own existence (the router and SEO registry
// own them), the truth of the chain facts themselves (the engine and terms).
// Scans are comment-stripped (LINE comments first — the phantom-block trap).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const PAGE = path.join(here, "..", "src", "pages", "JoinProtocol.tsx");

// Line-first, with (?!…\*\/) lookaheads: a `//` line carrying a block CLOSER
// must survive pass 1, or the block adopts the NEXT closer and swallows real
// code (review-2 logic hat, executed counter-fixture, 2026-08-03).
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

const page = stripComments(readFileSync(PAGE, "utf8"));

// ── 1. THE MOUNT + ITS PLACE ────────────────────────────────────────────────
check(
  /function JoinReferralShowcase\(/.test(page),
  "showcase: the component exists",
  "showcase: JoinReferralShowcase missing from JoinProtocol.tsx — the buyer-facing referral showcase (slice C) is gone",
);
const econIdx = page.indexOf("<JoinEconomics />");
const showIdx = page.indexOf("<JoinReferralShowcase />");
// GO-LIVE NOTE (recorded 2026-08-03, review-2 adversarial): panel-buy-readiness
// lives inside {CHECKOUT_ENABLED ? null : (…)} and the go-live slice REMOVES
// that card — when it does, THIS boundary marker must move to the next stable
// tail anchor ("Next steps") in the SAME slice, or this pin ambushes the
// go-live deploy with a false red.
const boundaryIdx = page.indexOf("panel-buy-readiness");
check(
  econIdx !== -1 && showIdx !== -1 && boundaryIdx !== -1 && econIdx < showIdx && showIdx < boundaryIdx,
  "showcase: mounted AFTER the economics, BEFORE the boundary (the last argument before the tail)",
  "showcase: the mount order broke — the card sits AFTER <JoinEconomics /> and BEFORE the boundary card, never above the purchase work (WORK-FIRST)",
);
// THE MOUNT IS UNCONDITIONAL — proven by BALANCE, not by line shape.
// The one-line pin closed only `{FLAG && <JoinReferralShowcase />}`; the
// MULTI-LINE wrap — the house style used five lines below in the very file
// being scanned — left it green with the founder-approved card unmounted
// (seven-hat audit, 2026-08-03). If every brace and paren opened between
// the unconditional <JoinEconomics /> and this mount also CLOSES between
// them, no condition can be wrapping it, in any spelling.
// The empty-braces strip is load-bearing: stripComments turns the JSX
// comment above the mount into a bare `{}` that would false-red the truth.
{
  const ECON = "<JoinEconomics />";
  const region =
    econIdx !== -1 && showIdx !== -1
      ? page.slice(econIdx + ECON.length, showIdx).replace(/\{\s*\}/g, "")
      : "{";
  const balance = (open: string, close: string) =>
    region.split(open).length - region.split(close).length;
  check(
    balance("{", "}") === 0 && balance("(", ")") === 0,
    "showcase: the mount is unconditional (brace/paren balance proves no wrapper, any spelling)",
    "showcase: <JoinReferralShowcase /> is wrapped in a condition — the founder-approved card renders always; hiding it is a founder decision, not an edit",
  );
}

// The component's own text — from its declaration to the next top-level
// function (or the page component) — so tongue/door pins scan the CARD only.
const compStart = page.indexOf("function JoinReferralShowcase(");
const afterComp = page.slice(compStart + 1);
const nextFn = afterComp.search(/\nfunction |\nexport default function /);
const card = compStart === -1 ? "" : afterComp.slice(0, nextFn === -1 ? undefined : nextFn);

// ── 2. THE COPY, FROZEN (founder-approved verbatim, 2026-08-03) ─────────────
const FROZEN: [string, string][] = [
  ["the one-liner", "The referral program where the payout is part of the purchase."],
  ["the eyebrow", "Open to every SYN holder"],
  [
    // The founder's live-prod catch (2026-08-03, second wave): «comes with»
    // was an overclaim — the terms say a link «may be granted» (the
    // ask→founder-signed activation). The truthful verb is CAN OPEN.
    // THIRD wave, same day: the SEAT premise was itself wrong. The sale
    // contract gates on the referrer wallet's SYN balance, never on a seat
    // (SPEC_REFERRAL_SYSTEM §262/§436), so this public page was turning away
    // every signed-in DEX holder. Copy and pin corrected in one commit.
    "the opening truth",
    "Any wallet holding SYN can open its own introduction link.",
  ],
  [
    "bold claim 1 (the mechanism)",
    "the contract pays your commission inside their purchase — same transaction, same block, before we ever see the money.",
  ],
  ["bold claim 2 (nothing to claim)", "Nothing to claim, ever."],
  ["bold claim 3 (never breaks, never lost)", "It can never break a sale, and it can never be lost."],
  ["the price-truth closing", "never changes your price"],
];
// Whitespace-normalized on BOTH sides: the pin freezes the WORDS, never the
// JSX line wrapping (bold claim 1 spans three source lines). Each frozen
// text is ALSO pinned to its closing element boundary — a qualifier bolted
// inside the element («Nothing to claim, ever. (during the pilot)») passed
// the bare includes() (review-2 adversarial probe, 2026-08-03).
const flatCard = card.replace(/\s+/g, " ");
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BOUNDARY: Record<string, string> = {
  "the one-liner": "</h2>",
  "bold claim 1 (the mechanism)": "</strong>",
  "bold claim 2 (nothing to claim)": "</strong>",
  "bold claim 3 (never breaks, never lost)": "</strong>",
};
for (const [name, text] of FROZEN) {
  const flatText = text.replace(/\s+/g, " ");
  const closer = BOUNDARY[name];
  const holds = closer
    ? new RegExp(`${esc(flatText)}\\s*${esc(closer)}`).test(flatCard)
    : flatCard.includes(flatText);
  check(
    holds,
    `showcase: ${name} verbatim${closer ? " (element-bounded)" : ""}`,
    `showcase: ${name} drifted, vanished, or grew a qualifier inside its element — the founder approved this copy verbatim; expected «${text}»${closer ? ` immediately closing with ${closer}` : ""}`,
  );
}

// ── 3. THE §7 FORMAT — bold claim + verify path ─────────────────────────────
check(
  /href="\/activity"/.test(card),
  "showcase: the live-record verify door (/activity) is present",
  "showcase: the /activity verify door is gone — every bold claim carries or sits next to its verify path (§7's signature format)",
);
check(
  // The founder's live-prod catch (2026-08-03): the program has ITS OWN
  // hash-anchored terms document — the door leads THERE, never to the
  // general Terms of Use.
  /href="\/referral-terms"/.test(card) && !/href="\/terms"/.test(card),
  "showcase: the terms door leads to THE program's own terms (/referral-terms)",
  "showcase: the never-breaks/never-lost claim must door to /referral-terms — the hash-anchored program terms, not the general Terms of Use (founder catch, 2026-08-03)",
);

// ── 4. THE BUYER'S TONGUE ───────────────────────────────────────────────────
const TONGUE = /\b(routed|routing|escrow)\b/i;
const tongueHit = card.match(TONGUE);
check(
  tongueHit === null,
  "showcase: no machine plumbing reaches the buyer's eyes",
  `showcase: buyer-facing machine vocabulary "${tongueHit?.[0]}" — human words only; the terms explain mechanisms`,
);

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:join-showcase] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:join-showcase] PASS — ${ok.length}/${ok.length} showcase pins hold.`);
