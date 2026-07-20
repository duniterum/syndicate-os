// scripts/join-card.guard.ts — K2 · the invitee-card pins (BLOCKING).
// The receipt-card guard's canon applied to the join-card zone: the card
// speaks the approved register only, fails closed to the generic image,
// derives the SHORT wallet form server-side, and ships the house faces.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const zone = path.resolve(here, "..", "src", "joincard");
const routeFile = path.resolve(here, "..", "src", "routes", "joinCard.ts");
const fontsDir = path.resolve(here, "..", "src", "receiptcard", "fonts");

const errors: string[] = [];
let checks = 0;
function check(cond: boolean, fail: string): void {
  checks++;
  if (!cond) errors.push(fail);
}

const painter = readFileSync(path.join(zone, "joinCardPainter.ts"), "utf8");
const reader = readFileSync(path.join(zone, "introducerRead.ts"), "utf8");
const mark = readFileSync(path.join(zone, "synMark.ts"), "utf8");
const route = readFileSync(routeFile, "utf8");
const all = painter + reader + route;

// 1 · the approved register, verbatim — the card never improvises copy.
check(painter.includes("You were introduced."), "painter lost the approved hook 'You were introduced.'");
check(painter.includes("recorded on-chain when you take your seat."), "painter lost the recorded-on-chain line");
check(
  painter.includes("Every purchase is a verifiable receipt. Proof, not promises."),
  "painter lost the provable hook line",
);
check(
  painter.includes("SEATS ARE OPEN — SEE HOW MEMBERSHIP WORKS"),
  "painter lost the approved door line",
);
check(painter.includes("THE SYNDICATE"), "painter lost the masthead");

// 2 · the red line — promo/urgency/price vocabulary can never enter the card.
const RED_LINE =
  /\b(discount|promo|offer|sale ends|limited|hurry|urgent|bonus|reward|free|fixed price|price is)\b/i;
check(!RED_LINE.test(painter), "red-line vocabulary entered the painter");

// 3 · no recompute, no arithmetic on facts — the card carries a wallet, never money.
check(!/parseFloat|toFixed/.test(all), "float arithmetic entered the join-card path");
check(!/\$\d/.test(painter), "a dollar figure entered the painter — the invitee card carries no money");

// 4 · ADR-003 — the SHORT form is derived server-side; the full address never leaves.
check(reader.includes("slice(0, 6)") && reader.includes("slice(-4)"), "the short-form derivation left introducerRead");
check(!/getAddress\(/.test(route) && !/0x[0-9a-fA-F]{40}/.test(route), "a full address surfaced in the route");

// 5 · fail-closed serving — the generic picture, never a broken card.
check(route.includes("opengraph.jpg") && route.includes("302"), "the 302 generic fallback left the route");
check(route.includes("paintJoinCard") && route.includes("png === null"), "the null-paint fallback left the route");
check(route.includes("shortWallet === null"), "the unresolved-introducer fallback left the route");
check(reader.includes("fail closed") || reader.includes("fail-closed"), "introducerRead lost its fail-closed posture");

// 6 · the real emblem + the house faces ship with the bundle.
check(mark.includes("data:image/svg+xml;base64,"), "the interlock emblem data URI left synMark");
check(painter.includes("SYN_MARK_DATA_URI"), "the painter no longer mounts the real emblem");
for (const f of [
  "IBMPlexMono-Regular.ttf",
  "IBMPlexMono-SemiBold.ttf",
  "WorkSans-Regular.ttf",
  "WorkSans-SemiBold.ttf",
  "OFL-NOTICE.md",
]) {
  check(existsSync(path.join(fontsDir, f)), `font asset missing: ${f}`);
}

// 7 · the share standard + the ceiling (WhatsApp-safe).
check(painter.includes("CARD_W = 1200") && painter.includes("CARD_H = 630"), "the 1200×630 share standard left the painter");
check(painter.includes("CARD_MAX_BYTES = 300_000") && painter.includes("<= CARD_MAX_BYTES"), "the 300KB ceiling left the painter");

// 8 · the read discipline — chain probed, selector computed never hand-typed.
check(reader.includes("probeChain"), "the chain-identity probe left introducerRead");
check(reader.includes('keccak256') && reader.includes('sourceConfig(bytes32)'), "the computed selector left introducerRead");

if (errors.length > 0) {
  console.error(`[guard:join-card] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(`[guard:join-card] PASS — ${checks}/${checks} invitee-card pins hold.`);
