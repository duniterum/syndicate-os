// Guard: lifecycle-label presence.
// Every page that renders a product surface must carry an honesty label —
// <LifecycleBadge> or <TruthLabel> — so no surface can quietly imply it is live.
//
// Allowlisted (render no protocol/surface VALUES, so need no label):
//   - Learning.tsx  : real, fully-live educational prose.
//   - not-found.tsx : utility 404 fallback (also serves as the neutral wall
//     at INTERNAL routes for non-operators — /admin-in-prod, Ruling ②).
//
// Node-loadable (Node >= 22.6 / 24), dependency-free.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(here, "..", "src", "pages");
const EXEMPT = new Set([
  "Learning.tsx",
  "not-found.tsx",
  // S2d (2026-07-24): the /member page SHELL renders no protocol value of its
  // own anymore — the reserved dashed cards (the file's last badge sites)
  // died when the Season+Quests cards shipped FILLED; every value surface on
  // the page is a gated wallet component carrying its OWN honesty label
  // (SeasonStandingCard's FUTURE pot frame, CapitalAxisCard, MemberYourSeat…).
  "MemberAccess.tsx",
  // §11 slot-2c teaser pages: their honesty label IS rendered — by the shared
  // TeaserSurface chassis from spec.lifecycle (chassis check below pays for
  // the exemption, so it cannot rot into an unlabeled surface).
  // (ACT-1: Activity + Fire Ledger went LIVE and render their badge directly —
  // removed from this list; only the Chronicle teaser remains chassis-labeled.)
  "ChronicleTeaser.tsx",
  // NOTIF-1 (founder AAA recomposition 2026-07-18): /notifications is a WORK
  // surface whose truth is STATE-AWARE — every static badge lied in some
  // state ("Sign in required" to a signed-in member; LIVE_ACTION's "signed
  // from your wallet" for a session act). Its honesty label lives in the
  // wallet panel per state (the "Live · your own row" chip + the honest
  // sign-in/denied/unavailable cards) — the chassis check below pays for
  // this exemption, so it cannot rot into an unlabeled surface.
  "MemberNotifications.tsx",
  // /referral (elevated 2026-07-19): ReferralSurface is a PURE FORK — it renders
  // SourceAttribution (anon; a page guarded directly below) or the
  // MemberReferralDashboard (connected; carries its own "Your referral" +
  // LifecycleBadge). It holds no content of its own, so the honesty label lives
  // in its children — the chassis check below pays for this exemption.
  "ReferralSurface.tsx",
  // /receipt/{txHash} (2026-07-20): the page only opens the door; its truth is
  // STATE-AWARE and lives in the panel — the "Sealed on-chain" StatusPill on a
  // real document, the honest unavailable/no-receipt cards otherwise (a static
  // page badge would lie in some state, the MemberNotifications lesson). The
  // chassis check below pays for this exemption.
  "PublicReceipt.tsx",
]);

// The chassis check that pays for the teaser exemptions: TeaserSurface must
// itself render the LifecycleBadge from its spec — if that ever disappears,
// this guard goes red even though the pages are exempt.
{
  const chassis = readFileSync(
    path.resolve(here, "..", "src", "components", "TeaserSurface.tsx"),
    "utf8",
  );
  if (!/LifecycleBadge/.test(chassis) || !/spec\.lifecycle/.test(chassis)) {
    console.error(
      "[guard:lifecycle] FAIL — TeaserSurface no longer renders <LifecycleBadge lifecycle={spec.lifecycle}>; the teaser-page exemptions are void.",
    );
    process.exit(1);
  }
}
// The chassis check that pays for the MemberNotifications exemption: the
// wallet panel must keep its state-aware honesty — the live chip AND the
// honest fail-closed line. If either disappears, this guard goes red even
// though the page is exempt.
{
  const panel = readFileSync(
    path.resolve(here, "..", "src", "wallet", "MemberNotificationsPanel.tsx"),
    "utf8",
  );
  if (
    !/Live · your own row/.test(panel) ||
    !/unavailable right now \(fail-closed\)/.test(panel)
  ) {
    console.error(
      "[guard:lifecycle] FAIL — MemberNotificationsPanel lost its state-aware honesty (the 'Live · your own row' chip or the fail-closed line); the MemberNotifications.tsx exemption is void.",
    );
    process.exit(1);
  }
}
// The chassis check that pays for the PublicReceipt.tsx exemption: the
// public receipt chain must keep its state-aware honesty — the "Sealed
// on-chain" pill lives in the WALLET mount (rendered only over a
// strictly-parsed row — the review-verified truth order) and the honest
// unavailable line in the panel. If either disappears, this guard goes red
// even though the page is exempt.
{
  const panel = readFileSync(
    path.resolve(here, "..", "src", "components", "receipt", "PublicReceiptPanel.tsx"),
    "utf8",
  );
  const mount = readFileSync(
    path.resolve(here, "..", "src", "wallet", "PublicReceiptTicket.tsx"),
    "utf8",
  );
  if (
    !/Sealed on-chain/.test(mount) ||
    !/The record is unavailable right now/.test(panel)
  ) {
    console.error(
      "[guard:lifecycle] FAIL — the public receipt chain lost its state-aware honesty (the 'Sealed on-chain' pill in PublicReceiptTicket, or the honest unavailable line in PublicReceiptPanel); the PublicReceipt.tsx exemption is void.",
    );
    process.exit(1);
  }
}
// The chassis check that pays for the ReferralSurface.tsx exemption: the
// connected branch renders MemberReferralDashboard, which must keep its own
// LifecycleBadge (the "Your referral" heading). The anon branch renders
// SourceAttribution, a page this guard scans directly. If the dashboard ever
// loses its badge, this guard goes red even though ReferralSurface is exempt.
{
  const dash = readFileSync(
    path.resolve(here, "..", "src", "components", "referral", "MemberReferralDashboard.tsx"),
    "utf8",
  );
  if (!/LifecycleBadge/.test(dash)) {
    console.error(
      "[guard:lifecycle] FAIL — MemberReferralDashboard no longer renders <LifecycleBadge>; the ReferralSurface.tsx exemption is void.",
    );
    process.exit(1);
  }
}
// StatusPill is the canonical status atom since the Phase-1 consolidation:
// TruthLabel is a thin wrapper over it, and it replaced the older
// LifecycleBadge/PostureBadge sprawl. A page rendering any of these carries an
// honesty label. (The whitepaper labels every section with a <StatusPill>.)
// AUD-TRUTH-2 (2026-07-16): PostureBadge joined the accepted labels — it IS an
// honesty label (the source-status registry's posture text, e.g. "Verified —
// view only"); /status carries one per registry row and lost its only
// TruthLabel when the operator surface map moved to /os-map.
const LABEL_RE = /\b(LifecycleBadge|TruthLabel|StatusPill|PostureBadge)\b/;

const errors: string[] = [];
let ok = 0;
for (const f of readdirSync(pagesDir).filter((n) => n.endsWith(".tsx"))) {
  if (EXEMPT.has(f)) continue;
  const src = readFileSync(path.join(pagesDir, f), "utf8");
  if (LABEL_RE.test(src)) ok++;
  else
    errors.push(
      `page ${f} renders no <LifecycleBadge>/<TruthLabel> (add an honesty label, or allowlist it with a reason)`,
    );
}

console.log(`[guard:lifecycle] ${ok} page(s) carry a lifecycle/truth label.`);
if (errors.length) {
  console.error(`[guard:lifecycle] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  process.exit(1);
}
console.log(`[guard:lifecycle] PASS \u2014 all non-exempt pages are honesty-labelled.`);
