# The Syndicate OS — AAA build plan & order

**Purpose.** One canonical reference for the founder, Replit, and Dave: where we are, what we keep,
what we rebuild, and the **logical AAA order** we build in. Source of truth = the GitHub repo
`duniterum/syndicate-os`. This plan is grounded in the *real* repo and the *proven* backend — it is
not a fresh lookalike.

## 1. The arc (read-back, so we don't repeat mistakes)

Early on, work drifted into polished **lookalikes** built outside the repo — the founder was right to
reject them. Since then everything is grounded in the real monorepo: canon reconciled, the referral
organ + admin control tower built (guard-verified), GitHub established as source of truth, and a
**Phase 3 write zone proven end-to-end** (SIWE auth → operator registry → role bridge → write
endpoints → audit, 25/25 e2e; the founder signed in for real and a save wrote to the DB in dev).

**The lesson we carry:** ground everything in the real repo + the proven backend. No lookalikes.

## 2. Where we are now (honest map)

**🟢 Proven backbone — KEEP, do not rebuild:**
SIWE auth zone · operator registry (`operator`) · identity→role bridge (`operatorContext`, ACTIVE-only,
fail-closed) · write zone (`referral-terms` + `invite`/`suspend`, founder/admin-gated, audit on every
write) · append-only `audit_log` · 500+ guards (truth/safety spine) · read-only protocol reality
(live on-chain reads). This is the hard, valuable part. It is stable and it is the fixed contract.

**🟠 Client experience — REBUILD clean to AAA:**
wallet connect is bespoke and confusing · `/admin` is a flat single page (no home, no sections, no
role-scoping) · a fake red "Offline" chip is hardcoded · "preview/sample/paused" framing lingers where
we're going live.

## 3. Doctrine (non-negotiable, governs every phase)

- **Truth-first.** Never show fake/simulated numbers as live. A value is a real on-chain/DB read or an
  honest "0 / no data yet". Drop a surface's "preview" label only when it is genuinely live.
- **Backend is the fixed contract.** The client rebuilds *against* `/api/auth/*`, `/api/operator/*`,
  `/api/protocol/*`. No cascading refactor — the API doesn't move.
- **Guards are the spine.** If a guard blocks a change, fix the cause or harden the guard — never weaken it.
- **No passive-income framing.** Revenue = protocol operating inflows (sales). Referral commission is a
  **payout/outflow**, never member "yield/passive income".
- **Self-documenting admin.** Every metric and every plugin/addon carries a tooltip: what it is, what the
  value means, where the number comes from. The admin is never lost.
- **One spine.** Identity → Role → Permission → Surface. `/admin` = control tower, `/studio` = atelier,
  `/member` = cockpit. Founder/operator/worker/auditor are roles in one authority system.

## 4. Keep vs rebuild

| Keep (proven) | Rebuild clean (AAA) |
|---|---|
| Auth + registry + bridge + write zone + audit + guards + protocol reality | Wallet connect · admin shell · live-mode framing · status chips |
| The API contract (`/api/*`) | Everything the user sees and clicks |

## 5. The AAA build order (dependency-ordered — each phase unblocks the next)

**Phase 1 — Identity & access, done right.**
- Adopt **wagmi + RainbowKit**: one "Connect wallet" button → one signature (the Uniswap/OpenSea
  standard). Replaces the confusing bespoke flow.
- A real **"Sign in as operator"** on `/admin` (not only `/member`).
- **Login-gate `/admin`** (auth to even see it — not just a visibility preview).
- **Kill the fake "Offline" chip** → a real status ("Live · on-chain healthy" from the reality spine).
- *Why first:* identity is the root of the spine; the shell and go-live depend on knowing who you are.

**Phase 2 — The AAA admin shell.**
- Sidebar sections (Dashboard · Members · Sources & referrals · Operators · Content · Modules ·
  Broadcast · Audit log · Support · Settings) + `/admin/*` routing + **role-scoped** panels.
- **Admin home dashboard**: header (search ⌘K, notifications, help, account + sign-out), business KPIs
  with prior-period deltas, revenue-by-stream, needs-attention, quick actions.
- **Tooltips everywhere** (self-documenting).
- Rehome the existing panels into their sections.
- *Why second:* needs identity/roles to scope; it's the container the writes live in.

**Phase 3 — Wire real writes + real data into the shell.**
- The proven writes get their real UI: Save referral terms, invite/suspend operators — by clicking.
- Dashboard KPIs read **real** on-chain/DB data or honest zeros; model the income streams (membership +
  artifacts/NFTs live, the rest marked roadmap); referral shown as an outflow.
- Read-model adapters for the real numbers.
- *Why third:* needs the shell (2) + identity (1); this is where "built → live product" happens.

**Phase 4 — Go live per surface + hardening.**
- Drop "preview" labels per surface as each becomes genuinely live (truth-first transition).
- Controlled **production activation** (`SYNDICATE_AUTH_ENABLED` in prod) with the founder bootstrap
  (multiple `founder_root` rows for recovery).
- **Reconcile the drizzle drift** via migrations before any prod schema push (never cascade).
- Then the designed-not-built layers as needed: recovery flows, workers/agents, users/registry tab.

## 6. Cross-cutting (all phases)

- **Small guard-verified increments**, one Replit run each; Claude pre-verifies with guards; native
  Version Control for pushes (not Agent-scripted GitHub API); English to Replit; cost-disciplined.
- **Income streams (Dave's list) = revenue roadmap (info, not commitment).** GitHub is the source of
  truth; wire real streams incrementally; never promise passive income.
- **Founder identity = DB registry** (auditable, suspendable), seeded once via a bootstrap wallet, then
  the registry governs. Multisig/Safe is a production target, not MVP.
- **Roles now, granular permission strings later** (the `permissions` jsonb is the extension point).

## 7. Decisions locked

Wallet modal: **RainbowKit** (swappable). Founder auth: **wallet SIWE** + DB registry + bootstrap.
Permissions: **role-based** for MVP. `/founder`: a **role-view inside `/admin`**, not a separate app.
Prod stays **dark** until Phase 4 activation.

## 8. Immediate next step

Write **Phase 1 slice 1**: introduce `wagmi + RainbowKit` (one connect button, one signature) behind
the existing wallet gate, wired to the unchanged `/api/auth` SIWE backend — replacing the bespoke flow.
Guard-verified, one Replit run.
