# CANON INDEX — TheSyndicate OS (la carte des cartes)

**But :** le point d'entrée unique de toute la documentation. Toute session (et
Astronaute) commence ICI. Dit *quel doc est quoi*, *lequel charger au boot*, et *qui
gagne en cas de conflit*. Vit dans le repo : `docs/00_CANON_INDEX.md`.

---

## Ordre d'autorité (qui gagne un conflit)

1. **La chaîne** (Avalanche C-Chain) — autorité sur tous les chiffres.
2. **Le brand board** — autorité sur tout le design (typo/palette/aesthetique).
3. **`THE_SYNDICATE_OS_COMPASS.md`** — la constitution : si un doc-source énonce un
   *fait/état*, le doc-source gagne.
4. **`GRAND_RECONCILIATION_…2026-07-06.md`** — carte-blanche fondateur (lève les gates
   *de process*, garde le spine vérité/sécurité).
5. **ADR-001 / ADR-002** — design system & méthode de travail.
6. Le reste des docs canon, puis la traçabilité (audits).

---

## TIER 0 — Constitution & méthode (CHARGER À CHAQUE BOOT)

| Fichier | Ce que c'est |
|---|---|
| `docs/00_START_HERE.md` | **À LIRE EN PREMIER — le point d'entrée du protocole entier** (ce qu'est l'OS, doctrine verrouillée, les couches, l'ORDRE vers grade-AAA, les rôles). Oriente sur TOUT ; le reste est référence. |
| `CANON_INDEX.md` (ce doc) | La carte des cartes — point d'entrée. |
| `THE_SYNDICATE_OS_COMPASS.md` | Constitution + règle de conflit + doctrine (proof-first, no-fake-live, recognition≠yield, source≠commission). |
| `WORKFLOW.md` | Comment on travaille (Astronaute ↔ Claude ↔ Replit). |
| `ADR-001-design-system-et-methodologie.md` | Le design system system-wide (tokens→primitives→patterns→templates, brand board). |
| `ADR-002-protocole-anti-derive.md` | Le protocole anti-dérive (boot, gate 4 lignes, règles dures, cost discipline). |
| `docs/handoff/new-session-handoff-2026-07-09-design-system-primitives.md` | Topo le plus récent : où on en est (fondation + primitives) + la prochaine slice. Le live/DB/auth reste régi par le checkpoint 2026-07-03. |
| `replit.md` | Le contexte que Replit lit. |

## TIER 1 — Vue holistique, plan & canonical (CHARGER AU BOOT)

| Fichier | Ce que c'est |
|---|---|
| `the-syndicate-master-operating-map.md` | Carte maîtresse : surfaces + phases. |
| `docs/architecture/FULL_PROTOCOL_VISIBILITY_OS_MAP.md` | La carte OS complète (toutes surfaces visibles). |
| `docs/strategy/FULL_VISIBLE_OS_ORGANISM_2_21A.md` | L'organisme OS complet (holistique, à jour). |
| `docs/architecture/AAA_BUILD_PLAN.md` | Le plan de build Grade AAA. |
| `docs/strategy/GRAND_RECONCILIATION_AND_CARTE_BLANCHE_UNBLOCK_2026-07-06.md` | **Le canonical « Dave » + carte-blanche** — la destination réconciliée. |
| `docs/SYNDICATE_OS_BUILD_INVENTORY_AND_VOCABULARY.md` | Inventaire de build + **vocabulaire** (les noms qu'on utilise). |
| `docs/FOUNDATION_SPEC.md` | Le **spec de la fondation design-system** (tokens 3 tiers, typo fluide, polices, échelles, a11y, perf) — world-class, ce que les slices implémentent. |
| `docs/DESIGN_ROADMAP.md` | **Source unique du workstream design** — phases, cases à cocher « FINI » grade-AAA, suivi du sprawl couleur. Claude Code coche les cases à la fin de chaque slice, dans le même commit. |

## TIER 2 — Specs de domaine (charger SELON la slice)

| Fichier | Domaine |
|---|---|
| `docs/architecture/ADMIN_SHELL_SPEC.md` | Console admin (shell 10 sections, WordPress-style). |
| `docs/architecture/IDENTITY_ROLES_SPINE_CANON.md` | Identité + RBAC (Founder/Admin/Operator/Auditor/Worker). |
| `docs/architecture/WALLET_FIRST_IDENTITY_ACCESS_AND_USER_REGISTRY_DESIGN.md` · `WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` · `HOLDER_INDEX_READ_MODEL_DESIGN.md` | Identité wallet-first + Holder Index. |
| `docs/architecture/ACTIVITY_HEARTBEAT_READ_MODEL.md` | Backbone d'événements / Activity. |
| `docs/architecture/SOURCE_BOUNDARY_MANIFEST.md` | Frontière des sources (spine vérité/sécurité). |
| `docs/architecture/CAPABILITY_HARVEST_AND_REUSE_MAP.md` · `docs/strategy/DUNITERUM_CAPABILITY_HARVEST_2_20E.md` | Matrices de récolte (PRESERVE/ADAPT/REWRITE/REJECT). |
| `docs/architecture/OPERATOR_WALLET_AUTH_AND_ROLES_DESIGN.md` | Auth opérateur + rôles. |
| `docs/strategy/MEMBER_ECONOMY_…` · `SELF_READBACK_…` · `HOLDER_INDEX_SPRINT_…MEMO.md` | Mémos de décision fondateur (Economy/GDP, self-readback). |

## TIER 3 — Traçabilité (NE PAS charger au boot — référence historique)

- `docs/audits/SLICE_2_17…` → `SLICE_2_20D…` : rapports d'audit slice-par-slice.
- `docs/phase1-*` : ledgers de phase 1.
- `docs/strategy/CORRECTED_DOCTRINE_REHARVEST_2_20G.md`, `PRINCIPAL_PRIOR_ART_AUDIT…`, `PRIOR_ART_RECONCILIATION_2_19D.md` : audits d'art antérieur.
- `docs/handoff/*` anciens, `GO_LIVE.md`, `REPLIT_SETUP.md`, `deploy-readiness-checklist.md`.

---

## Règle d'hygiène (pour ne plus jamais se reperdre)

- Tout nouveau doc canon → **inscrit ici** dans le bon tier, sinon il n'existe pas.
- Fin de session → mettre à jour le topo/handoff + cet index si un doc a changé de tier.
- « Dave » = source stratégique externe, **déjà réconciliée** dans le GRAND_RECONCILIATION ; on ne repart pas des PDF bruts, on lit le doc réconcilié.
