// guard-member-home.ts — ③ HOME: THE APPROVED DASHBOARD COMPOSITION, pinned.
// ---------------------------------------------------------------------------
// Founder GO 2026-07-16 (wireframes-2026-07-16.html §3, THE VISUAL CHANGE
// LAW; Z3 verdict: "session expiring" dropped — replaced by the standing-
// approval card): the signed-in member dashboard is zones Z1–Z8 — identity
// band (sealed) · KPI row SIX tiles · NEEDS YOUR ATTENTION (real state
// only, anti-scarcity bound, the approved quiet line verbatim) · YOUR
// RECENT ACTIVITY (own D3 rows, verify anchor per row, figures never
// recomputed) · the pulse BELOW own work · referral (sealed) · capital
// axis + snapshot + chronicle (sealed) · THE DOORS as a grouped grid from
// the ONE config. HARDENED (adversarial review 2026-07-17): every pin runs
// on COMMENT-STRIPPED text (a comment satisfies nothing and violates
// nothing), and the composition pins scan the DASHBOARD REGION ONLY —
// MemberAccess carries TWO compositions, and a visitor-branch mount must
// never satisfy a dashboard pin. Changing the composition means a NEW
// founder-approved wireframe, then updating these pins in the same slice.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");

// One rule for every pin: comments are invisible (strip // and /* */ blocks,
// which also removes JSX {/* … */} bodies — a commented-out mount can never
// satisfy a presence pin, and a doc comment can never trip a ban).
const stripComments = (t: string) =>
  t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

const accessRaw = readFileSync(join(SRC, "pages", "MemberAccess.tsx"), "utf8");
const accessCode = stripComments(accessRaw);
const kpiCode = stripComments(
  readFileSync(join(SRC, "wallet", "MemberKpiRow.tsx"), "utf8"),
);
const attentionRaw = readFileSync(
  join(SRC, "wallet", "MemberAttention.tsx"),
  "utf8",
);
const attentionCode = stripComments(attentionRaw);
const recentCode = stripComments(
  readFileSync(join(SRC, "wallet", "MemberRecentActivity.tsx"), "utf8"),
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

// ── 0 · The two-composition split: scope to the DASHBOARD region ────────────
// The dashboard branch is the `if (memberView)` return; the visitor branch
// follows it. Both anchors must exist or every pin below scans wrong text.
const dashStart = accessCode.indexOf("if (memberView)");
const dashEnd = accessCode.indexOf("member-door-band"); // the visitor door scene
pin(dashStart >= 0, "MemberAccess keeps the memberView dashboard branch (anchor missing)");
pin(
  dashEnd > dashStart,
  "MemberAccess keeps the visitor door composition below the dashboard (anchor missing)",
);
const dashText =
  dashStart >= 0 && dashEnd > dashStart
    ? accessCode.slice(dashStart, dashEnd)
    : "";

// ── 1 · The Z order in the DASHBOARD composition (JSX mount order) ──────────
// Referral was elevated to its own surface /referral (2026-07-19, founder GO —
// one door, one surface); it no longer mounts in the /member dashboard. The
// "Introductions" KPI tile (guard-pinned in the KPI row below) keeps the count
// on this page.
const zOrder = [
  "<MemberYourSeat",
  "<MemberKpiRow",
  "<MemberAttention",
  "<MemberRecentActivity",
  "<MemberPulse",
];
const idx = zOrder.map((tag) => dashText.indexOf(tag));
pin(
  idx.every((i) => i >= 0),
  `the DASHBOARD mounts every zone component (missing: ${zOrder.filter((_, i) => idx[i] < 0).join(", ") || "none"})`,
);
pin(
  idx.every((i, n) => n === 0 || i > idx[n - 1]),
  "the approved Z order holds IN THE DASHBOARD: identity → KPI → attention → recent activity → pulse → referral (my-work above world-news)",
);
for (const sealed of [
  "<CapitalAxisCard",
  "<ProtocolSnapshot",
  "<ChronicleLatest",
  "<MemberSettings",
  "<VerifyFoundationRow",
]) {
  pin(
    dashText.includes(sealed),
    `sealed-stays-sealed: the DASHBOARD still mounts ${sealed}> (Z6/Z7/Z8/settings/verify)`,
  );
}

// ── 2 · Z2: the KPI row is SIX tiles, the approved labels in order ──────────
// \slabel= : the KpiTile prop only — aria-label/data-label never match.
const kpiLabels = [...kpiCode.matchAll(/\slabel="([^"]+)"/g)].map((m) => m[1]);
pin(
  JSON.stringify(kpiLabels) ===
    JSON.stringify([
      "Your SYN",
      "Your USDC",
      "Your footprint",
      "Introductions",
      "Receipts",
      "Artifacts",
    ]),
  `Z2 is exactly the six approved tiles in order — got [${kpiLabels.join(" · ")}]`,
);

// ── 3 · Z3: real-state-only, anti-scarcity, honest states ───────────────────
pin(
  attentionCode.includes("Nothing needs you — the record is quiet."),
  "Z3 empty state speaks the approved line verbatim",
);
pin(
  /promotionDue === true/.test(attentionCode),
  "Z3 promotion card derives from the own-row promotionDue field (real state, never invented)",
);
pin(
  /readAllowance\(/.test(attentionCode),
  "Z3 standing-approval card derives from the LIVE allowance read (the founder's Z3 replacement for session-expiring)",
);
pin(
  /promotionUnreadable/.test(attentionCode) &&
    /sourceOnChain === false/.test(attentionCode),
  "Z3 tracks the promotion class's OWN readability (a served standing:null without the definitive no-source marker is unreadable — the quiet line must never overclaim it)",
);
pin(
  /undefined/.test(attentionRaw) && /useSettledSourceStanding/.test(attentionCode),
  "Z3 distinguishes in-flight from failed reads (the settled wrapper — a failed read is never shown as still reading)",
);
pin(
  /EFFECTIVELY_UNLIMITED_RAW/.test(attentionCode),
  "Z3 names an effectively-unlimited approval instead of printing a 72-digit dollar figure",
);
pin(
  !/milestone/i.test(attentionCode),
  "Z3 renders NO milestone card — no live source ties a milestone to a seat today (real-state-only; joins when its read exists)",
);
pin(
  !/hurry|urgent|last chance|act now|don.t miss|limited time|only \d+ left/i.test(
    attentionCode,
  ),
  "Z3 carries zero urgency theater (the anti-scarcity law binds this zone)",
);
pin(
  !/session expir/i.test(attentionCode),
  'the founder-killed "session expiring" card can never return (a system event, not a decision)',
);

// ── 4 · Z4: own rows, exact fields, verify anchor, no early binder ──────────
pin(
  /useSettledOwnPurchases\(/.test(recentCode),
  "Z4 reads the own-row D3 record with settlement tracked (failed ≠ still reading)",
);
pin(
  /usdFromRaw\(/.test(recentCode) &&
    !/parseFloat|Number\(.*amountRaw/.test(recentCode),
  "Z4 renders the record's own amount field via usdFromRaw — never recomputed",
);
pin(
  /explorerUrl/.test(recentCode),
  "Z4 rows carry their verify anchor (every figure carries its verify path)",
);
pin(
  /RECENT_LIMIT = 5/.test(recentCode),
  "Z4 shows the last 5 rows (the approved count)",
);
pin(
  !/View receipt|Open receipt|ReceiptTicket|\/receipts?\b/i.test(recentCode),
  "Z4 mounts NO receipt-opening affordance, by any name or path — placements ride A1 per the GO'd decision",
);
pin(
  !/printed its ticket/.test(recentCode) && !/printed its ticket/.test(kpiCode),
  "no PAST-TENSE ticket claim anywhere — most indexed purchases predate the receipt product (fabricated history, adversarial-review kill)",
);

// ── 5 · The doors live ONCE — the sidebar, never a duplicate Z8 grid ────────
// The dashboard's right column used to mount <MemberDoorsGrid>, a full-column
// duplicate of the MemberShell sidebar (the SAME MEMBER_DOOR_GROUPS, only the
// one-line descriptions differed). Removed 2026-07-18 (founder, WORK-FIRST):
// the doors are the sidebar's job; the right column is freed for real work.
// This pin keeps the duplicate from creeping back.
pin(
  !dashText.includes("<MemberDoorsGrid"),
  "the dashboard does NOT re-mount the duplicate doors grid (doors live in the MemberShell sidebar only — removed 2026-07-18, WORK-FIRST)",
);

if (failures > 0) {
  console.error(`[guard:member-home] ${failures} FAILURE(S) of ${pins} pins.`);
  process.exit(1);
}
console.log(`[guard:member-home] PASS — ${pins}/${pins} pins green.`);
