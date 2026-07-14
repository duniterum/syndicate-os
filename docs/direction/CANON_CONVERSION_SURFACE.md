# CANON — THE CONVERSION SURFACE DOCTRINE (TIER-0)

**Founder-decided 2026-07-14 · Binding on every PUBLIC page, present and future.**
INVARIANTS ONLY (per `CANON_INVARIANT_VS_STATE.md`): rules about *how a public surface
converts a stranger*, never what exists today — so it never rots. This is the measuring
rod: every public page, at build time and at review time, is held to the checklist in §9.
Sibling of `CANON_PROTOCOL_LANGUAGE.md` (the words) — this doc governs the *stage* the
words stand on: hierarchy, geometry, weight, speed. Where the two meet, the Language
Constitution wins on wording, this doc wins on placement and hierarchy.

Enforcement posture (per `CANON_LOI_ANTIBLOCAGE.md` — minimal guards until MVP): §2–§8
are enforced by the REVIEW GRID (§9) applied at every slice gate; only measurable,
cheap-to-pin rules graduate to build guards (touch targets, image budgets) when their
slices land. A rule without a guard is still LAW — the gate is the enforcement.

Research basis: industry conversion standards (5-second comprehension testing, single-CTA
conversion studies, Core Web Vitals thresholds), adopted and adapted by the founder for a
proof-first protocol. The numbers in §6 are Google's published Core Web Vitals thresholds;
the rest are founder-adopted design law.

---

## §1 — THE 5-SECOND TEST (the first law)

A stranger landing on any public page answers three questions within five seconds:

1. **What is this?**
2. **Who is it for?**
3. **What do I do next?**

Only ~14% of pages on the open web pass this test. **Every Syndicate public page must.**
The test is run literally at every review: load the page cold, count five seconds, answer
the three questions from what was actually seen — not from what the builder knows.

## §2 — DESIRE BEFORE PROOF (the hierarchy law)

The value speaks first; the live-proof machinery supports it. Our differentiator IS the
live data — it is never hidden, never diluted — but hierarchy guides the eye:

> **emotion → figure → verify**

A stranger feels why the seat matters, then sees the live figure that makes it real, then
finds the verify path that makes it unarguable. A page that leads with instrument panels
before meaning fails this law no matter how honest the panels are. (The Language
Constitution's six-beat sequence §2 orders the *content*; this law orders the *weight*.)

## §3 — ONE PRIMARY CTA (the decision law)

One surface, one primary call to action. Pages with a single dominant CTA convert
roughly 3× better than pages with competing buttons. Secondary actions exist but stay
visually quiet (outline, text links, utility rails — never a second filled button
competing at the same visual rank). Two CTAs asking for the same act on one viewport is
a bug (the /member duplicate-connect finding is the canonical example).

## §4 — HERO GEOMETRY (the first-viewport law)

- Desktop: the hero occupies **60–100% of viewport height**.
- Mobile: **50–70%**, with the primary CTA thumb-accessible.
- The first viewport is never wasted on dead bands, empty chrome, or padding theater —
  every pixel of the first screen either says what this is or moves the visitor.

## §5 — THE HYBRID WIDTH LAW (the immersion law)

- **Visual backgrounds run FULL-BLEED** — hero scenes, maps, halos, atmospheric layers go
  edge to edge. No page-margin frames around scenery. The site must never feel "framed
  in a box" on wide screens.
- **Text content stays constrained** — reading columns cap at ~1200–1440px. Readability
  is never sacrificed to immersion.
- The two compose: a full-bleed scene with a constrained text column inside it is the
  signature composition.

## §6 — PERFORMANCE BUDGETS (the speed law)

- **LCP < 2.5s on mobile** (Google's Core Web Vitals "good" threshold).
- Hero images compressed, served as **WebP/AVIF**, target **< 500KB per image** (any
  image beyond the budget must justify itself at the gate).
- Fonts loaded without layout shift; decorative assets never block first paint.
- A conversion surface that is slow does not convert — speed is a conversion feature,
  not an infrastructure nicety.

## §7 — MOBILE AAA (the thumb law)

- Touch targets **≥ 44px** in both dimensions.
- Block order on mobile follows the persuasion order, not the desktop grid's accidents.
- The primary CTA sits where a thumb reaches it.
- Safe-area insets respected; no horizontal overflow, ever.

## §8 — TRUST SIGNALS (the proof law)

Our trust signals are **verify links and honest live figures** — never logos-of-strangers,
never testimonials we cannot prove, never invented urgency. Every bold claim carries (or
sits next to) its verify path — `CANON_PROTOCOL_LANGUAGE.md` §7 is already law; this doc
binds its *placement*: the verify path lives within the claim's visual group, never below
the fold of the claim it covers.

## §9 — THE REVIEW GRID (run at every public-page slice gate)

1. 5-second test passed cold? (§1)
2. Does emotion lead, figure support, verify seal? (§2)
3. Exactly one primary CTA on the surface? (§3)
4. Hero height in band; first viewport carries meaning? (§4)
5. Scenes full-bleed, text constrained? (§5)
6. LCP budget held; images in budget and modern formats? (§6)
7. Touch targets, block order, thumb CTA, no overflow? (§7)
8. Every bold claim's verify path inside its visual group? (§8)
9. Language: six-beat sequence, register, banned vocabulary? (`CANON_PROTOCOL_LANGUAGE.md`)

A public-page slice's gate answers the grid; a "no" is either fixed in-slice or stated
as a deliberate, founder-visible deviation with its reason.
