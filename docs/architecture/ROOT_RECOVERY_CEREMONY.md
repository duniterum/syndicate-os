# ROOT RECOVERY CEREMONY — the one-pager (founder copy)

*Written 2026-07-18 (the AAA hardening discussion's promised page). Operationalizes
OPERATOR_WALLET_AUTH §F for today's reality: **TWO ACTIVE founder_root wallets**
("Founder" `0x88ec…dd73` + "Founder Second Wallet" `0x2445…c721`, both enrolled by
audited founder acts, Q41 2026-07-18). Keep a printed copy with each wallet's backup.*

---

## Case 1 — ONE root wallet is lost or compromised (the normal case)

You can fix this yourself, from the console, in under five minutes. No ceremony.

1. Sign in at **thesyndicate.money** with the **surviving** founder wallet.
2. `/admin` → **Operators** → **Suspend** the lost/compromised wallet's row.
   Suspension takes effect on that wallet's very next request — instantly.
3. **Invite** a replacement wallet as `founder_root` (hardware-backed, stored
   separately, used for nothing else). Test it once: sign out, sign in with it,
   see "Operator · founder_root", sign out.
4. Done. Every step wrote an audit row. You are back to two roots.

**The system's own safety net:** the last-ACTIVE-founder guard makes it
impossible to suspend the final root — you can never lock yourself out by
mis-clicking. Suspension is deliberately cheaper than addition.

## Case 2 — ALL root wallets are lost (the ceremony — should never happen)

No online path exists to recover root, **by design** — anything fast enough to
save you would be fast enough to rob you. Recovery is a manual, out-of-band,
founder-authorized act:

1. **Identity, out-of-band:** the founder proves identity to the runtime
   operator (Replit) through channels **pre-established before the incident**
   (not chat alone): the registered Replit account itself + at least one more
   factor known from before (e.g. this repo's GitHub account control).
2. **Mandatory delay: 48 hours** between the request and the act. The delay IS
   the security — it gives the real founder time to contest a false request.
   During the delay, a notice of the pending act is recorded (commit or audit
   note) so it is publicly contestable.
3. **The act:** a one-time, founder-authorized manual DB operation performed by
   the runtime operator: suspend the lost root rows, insert one new
   `founder_root` row for the founder's new wallet, and write an audit row
   naming the ceremony. (The seed script deliberately REFUSES to run again —
   first-seed-only; this act is manual on purpose, so it can never be scripted
   against you.)
4. **Immediately after:** the founder signs in, verifies the badge, invites the
   second root (Case 1 step 3), and rotates any on-chain ownership the lost
   wallets held (registry `Ownable2Step` transfer from the new authority).

## Standing discipline (what makes Case 2 stay theoretical)

- Two ACTIVE roots at all times; after any loss, restore to two.
- Root keys: hardware-backed · stored in **separate physical locations** ·
  used for **nothing else** (no browsing, trading, dapps) · each tested once.
- Never store both wallets' backups in the same place.
- At the pro-firm horizon: the Safe multisig (2-of-3) takes over on-chain
  ownership and this page gets rewritten around it (§J).
