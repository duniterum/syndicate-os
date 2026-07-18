// guard-member-menu.ts — THE APPROVED MEMBER MENU, pinned.
// ---------------------------------------------------------------------------
// Founder GO 2026-07-16 (wireframes-2026-07-16.html §2, THE VISUAL CHANGE
// LAW) + NOTIF-1 amendment (founder decision 2026-07-18: the Notifications
// door joins the BOTTOM utilities group ABOVE Settings — on desktop the
// header bell is the primary entry, the door is the secondary/mobile path;
// no-email canon): the member left menu is an APPROVED COMPOSITION — 14 rows
// in FOUR groups (Member: 5 primaries + Receipts locked-visible · The record ·
// Growth, name pinned: navigation, not a member promise · Account (renamed
// from the jargon "Off-chain comfort" — founder 2026-07-18, human-readable
// law): Notifications then Settings LAST, separated), one approved lucide
// icon per door, and an
// UNMISTAKABLE active state: gold tint + persistent left bar + weight —
// shape AND color, never color alone (WCAG 1.4.1) — plus aria-current and a
// visible focus ring. Hash doors must match by pathname+hash (the dead-click
// class: wouter's pushState fires no hashchange). These pins keep the
// approved composition from drifting silently; changing it means a NEW
// founder-approved wireframe, then updating the pins in the same slice.
// HARDENED (adversarial review 2026-07-17): pins anchor to CODE shapes, not
// bare substrings a header comment satisfies; the row count counts EVERY
// door object, so an icon-less door can't slip in as an unpinned 14th row.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");
const doorsText = readFileSync(join(SRC, "config", "memberDoors.ts"), "utf8");
const shellText = readFileSync(
  join(SRC, "components", "member", "MemberShell.tsx"),
  "utf8",
);
const scrollText = readFileSync(
  join(SRC, "components", "RouteScrollManager.tsx"),
  "utf8",
);

let pins = 0;
let failures = 0;
function pin(cond: boolean, msg: string) {
  pins += 1;
  if (!cond) {
    failures += 1;
    console.error(`  ✗ ${msg}`);
  }
}

// The MENU section of the config (reserved Member-Home slots live below it
// and are NOT menu rows — never count them). Both anchors must exist, or the
// slice is unrecognizable and every pin below would scan the wrong region.
const menuStart = doorsText.indexOf("MEMBER_DOOR_GROUPS");
const menuEnd = doorsText.indexOf("MEMBER_HOME_RESERVED_SLOTS");
pin(menuStart >= 0, "memberDoors.ts must export MEMBER_DOOR_GROUPS (anchor missing)");
pin(menuEnd > menuStart, "memberDoors.ts must keep MEMBER_HOME_RESERVED_SLOTS below the groups (anchor missing)");
const menuText = failures === 0 ? doorsText.slice(menuStart, menuEnd) : "";

// ── 1 · The four groups, in the approved order ──────────────────────────────
const groupTitles = [...menuText.matchAll(/title: "([^"]+)"/g)].map((m) => m[1]);
pin(
  JSON.stringify(groupTitles) ===
    JSON.stringify(["Member", "The record", "Growth", "Account"]),
  `groups must be exactly [Member · The record · Growth · Account] in order — got [${groupTitles.join(" · ")}]`,
);

// ── 2 · The 14 rows in the approved order, each with its approved icon ──────
const APPROVED: ReadonlyArray<readonly [label: string, icon: string]> = [
  ["Member Home", "house"],
  ["Wallet", "wallet"],
  ["Referral", "user-plus"],
  ["Activity", "activity"],
  ["Toolkit", "wrench"],
  ["Receipts", "receipt"],
  ["Chronicle", "book-open"],
  ["Fire Ledger", "flame"],
  ["Archive", "archive"],
  ["Recognition", "award"],
  ["Protocol graph", "map"],
  ["Liquidity", "droplets"],
  ["Notifications", "bell"],
  ["Settings", "settings"],
];
// EVERY door object counts (a door without an icon is still a visible row —
// the adversarial review proved an icon-less door slipped the old pair-only
// count as an unpinned 14th row while the guard stayed green).
const allLabels = [...menuText.matchAll(/label: "([^"]+)"/g)].map((m) => m[1]);
const rows = [...menuText.matchAll(/label: "([^"]+)", icon: "([^"]+)"/g)].map(
  (m) => [m[1], m[2]] as const,
);
pin(
  allLabels.length === 14,
  `the menu is 14 rows (13 doors + Receipts locked-visible; NOTIF-1 added Notifications) — got ${allLabels.length} door objects`,
);
pin(
  rows.length === allLabels.length,
  `every door carries an icon adjacent to its label (label: "…", icon: "…") — ${allLabels.length} door(s) but only ${rows.length} label+icon pair(s)`,
);
for (const [i, [label, icon]] of APPROVED.entries()) {
  pin(
    rows[i]?.[0] === label && rows[i]?.[1] === icon,
    `row ${i + 1} must be "${label}" with icon "${icon}" — got "${rows[i]?.[0]}" / "${rows[i]?.[1]}"`,
  );
}

// ── 3 · Receipts: locked-visible via the EXISTING badge system, never a link ─
const receiptsRow = menuText.match(/\{ label: "Receipts"[^}]*\}/)?.[0] ?? "";
pin(
  receiptsRow.includes('lifecycle: "FUTURE"'),
  'Receipts is locked-visible with lifecycle: "FUTURE" (the existing badge system — never a second one)',
);
pin(
  !receiptsRow.includes("href"),
  "Receipts carries NO href until its surface exists (a door is a link only when its surface exists today)",
);

// ── 4 · Settings: pinned LAST, in the separated comfort group ───────────────
pin(
  allLabels[allLabels.length - 1] === "Settings",
  "Settings is pinned LAST (account comfort, never protocol)",
);
pin(
  /title: "Account",\s*separated: true/.test(menuText),
  "the Account group is visually separated (separated: true)",
);

// ── 5 · The shell renders the approved states (CODE shapes, not comments) ───
pin(
  (shellText.match(/aria-current=\{/g) ?? []).length >= 2,
  "MemberShell sets aria-current as a JSX attribute on BOTH renders (rows + chips) — audit lens 8",
);
pin(
  shellText.includes("border-gold") && shellText.includes("bg-gold/10"),
  "active state = gold tint + gold left bar (border-gold + bg-gold/10)",
);
pin(
  /border-l-2/.test(shellText) && shellText.includes("font-semibold"),
  "active state carries SHAPE + WEIGHT (border-l-2 bar, font-semibold) — never color alone (WCAG 1.4.1)",
);
pin(
  shellText.includes("focus-visible:ring-2"),
  "keyboard focus is a visible ring (focus-visible:ring-2)",
);
pin(
  /useLocationProperty\(/.test(shellText) &&
    shellText.includes('from "wouter/use-browser-location"'),
  "active matching CALLS useLocationProperty (pathname+hash — hash doors must highlight); the import must be real, not a comment",
);
pin(
  (shellText.match(/<LifecycleBadge/g) ?? []).length >= 2,
  "an inert door renders its LifecycleBadge in BOTH renders (desktop row + mobile chip) — a dead tap must say why",
);
pin(
  /scrollToHash\(/.test(shellText),
  "same-door re-clicks re-scroll via scrollToHash (wouter Links never reach native same-hash behavior)",
);
pin(
  !/muted-foreground\/\d/.test(shellText),
  "no alpha-faded muted-foreground anywhere in the shell (light-theme contrast, audit lens 8)",
);
const pxSizes = [...shellText.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)].map((m) =>
  Number(m[1]),
);
const remSizes = [...shellText.matchAll(/text-\[(\d*\.?\d+)rem\]/g)].map((m) =>
  Number(m[1]),
);
pin(
  pxSizes.every((n) => n >= 12) && remSizes.every((n) => n >= 0.75),
  "no user-visible text under 12px in the shell, px or rem (ADR-001 readability floor)",
);

// ── 6 · The dead-click class stays dead (CODE shapes) ────────────────────────
pin(
  /useLocationProperty\(/.test(scrollText) &&
    scrollText.includes('from "wouter/use-browser-location"'),
  "RouteScrollManager subscribes to pathname+hash via a REAL useLocationProperty call (wouter pushState fires no hashchange)",
);
pin(
  /tries < HASH_RETRY_MAX/.test(scrollText),
  "hash scroll retries for late-mounting targets (the tries < HASH_RETRY_MAX loop, e.g. #settings mounts after session resolve)",
);
pin(
  /export function scrollToHash/.test(scrollText),
  "scrollToHash stays exported (MemberShell's same-door re-click depends on it)",
);

if (failures > 0) {
  console.error(`[guard:member-menu] ${failures} FAILURE(S) of ${pins} pins.`);
  process.exit(1);
}
console.log(`[guard:member-menu] PASS — ${pins}/${pins} pins green.`);
