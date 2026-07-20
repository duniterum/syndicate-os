# ARTIFACT TYPOGRAPHY FLOORS — the readability law for share/print artifacts

**Provenance.** Founder order 2026-07-20 (K1.3, emphatic — "c'est illisible même en
zoomant… c'est censé être toi l'expert"): the K1 artifacts shipped with UI-scale type
(13–20px) on artifacts that are VIEWED at a fraction of their size or PRINTED at 300dpi.
This document engraves the per-context floors; `KIT_ARTIFACTS[].typeFloor` carries them
in code and the harness TYPE-FLOOR PROBE enforces them (no text node may compute below
its artifact's floor). **Durable — the UI 12px floor NEVER applies to artifacts; the
viewing context decides.**

## The law: the floor comes from the VIEWING CONTEXT, not the canvas

| Context | The math | Floor |
|---|---|---|
| **Feed/share images** (1200×630 og · 1080×1080 post · 1200×630 record) | a social feed renders the image at ~400–500px wide → everything is seen at ~40% scale; 20px → 8px on screen, the tertiary minimum; content lines must land ≥9–13px on screen | **20px** floor · content lines ≥23px · headline ≥56px |
| **Story** (1080×1920) | fullscreen phone, ~1:1 device pixels but held at arm's length | **22px** floor · headline ≥64px |
| **Web banners** (728×90 · 468×60 · 300×250) | embedded at ACTUAL pixel size on screen | **10px** floor (the on-screen minimum) |
| **A4 poster** (1240×1754 = 150dpi) | read from 1–3 m; legibility ≈ 1mm x-height per meter of distance; 25px ≈ 12pt ≈ 4.2mm — the caption minimum at ~1.5m; the headline must carry at 3m → ≥90px (≈43pt) | **25px** floor · body ≥34px · headline ≥90px |
| **Business card** (1004×650 = 300dpi for 85×55mm) | hand-held print; 300dpi → 1pt = 4.17px; the print trade floor is 7pt | **30px** floor (≈7.2pt) |
| **Video overlay QR** (900×900) | shrunk into a video corner, re-compressed by the platform | **28px** floor |

## THE BANNER FORMAT CANON (settled 2026-07-20 — "une bonne fois pour toutes")

Founder-ordered deep read (Kinsta banner-size guide FR · lightzoom 8-formats article)
+ the senior synthesis. **The set = the formats that actually perform** (Google's top
performers), nothing else:

| Format | Name | Why it's in |
|---|---|---|
| **300×250** | Medium rectangle | The #1 performer — works desktop AND mobile, in-content |
| **336×280** | Large rectangle | The #2 performer, same family |
| **300×600** | Half page | High-impact sidebar, growing inventory |
| **728×90** | Leaderboard | The top-of-page desktop standard |
| **320×100** | Mobile banner | The mobile format (chosen over 320×50 for presence) |

**Retired: 468×60** (legacy, weak inventory — kept in no kit). The social formats are
the CARDS (1200×630 og · 1080×1080 post · 1080×1920 story — matches the platform
charts). Extend-later without rework (the KIT_ARTIFACTS table): 970×250 billboard ·
600×200 newsletter.

**THE COPY LAW ON BANNERS (the sieve verdict on the marketing formulas, engraved):**
- **ADOPTED**: benefit-driven hooks · ONE message per banner · strong action verbs ·
  one clear CTA · banner copy matches the landing page (ours: /join — "Seats are
  open — see how membership works.").
- **REJECTED — BY LAW, not by habit**: invented urgency, countdowns, flash offers,
  discount claims ("-50%", "stocks limités"). The seat price is a fixed on-chain fact;
  a promo claim would be a provable lie, and the anti-financialization canon exists to
  keep every public claim provable. This constraint is protective, never useless.
- **The approved hook register** (already-served house lines only): "Every purchase is
  a verifiable receipt." · "Proof, not promises." · "Don't trust — verify." · CTA:
  "SEE HOW IT WORKS" / "SCAN TO JOIN" · personalization: "Introduced by 0x…".

## The companions of the law

- **Less text, bigger type.** A line that cannot afford its floor is CUT, not shrunk
  (the masthead sub lost "· AVALANCHE C-CHAIN"; the og facts line lost "verified
  on-chain" — the QR and the site carry the proof path).
- **Hierarchy is 3 levels max** per artifact: headline (the hook) → one support line →
  identity/CTA. Everything else goes.
- **Enforcement is structural**: `KIT_ARTIFACTS[].typeFloor` in
  `components/referral/referrerKit.tsx` + the harness TYPE-FLOOR PROBE (computed
  font-size of every text node ≥ the floor), beside the FIT, SQUARE-BOX and PIXEL
  probes. A new artifact declares its floor or fails the probe.
- The UI surfaces keep their own 12px floor (COMMISSION_RECEIPTS_DESIGN_DIRECTION §4.8)
  — the two laws never mix.
