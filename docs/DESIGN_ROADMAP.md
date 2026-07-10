# DESIGN_ROADMAP — chemin vers "full grade-AAA" (source unique du workstream design)

**Statut : vivant.** Claude Code coche les cases à la fin de chaque slice, dans le
même commit. **Tout le monde travaille depuis CE doc** — fondateur, Claude Code,
Claude-conseil, Replit. Personne ne part de son côté.

---

## Définition de "FINI" (grade-AAA, pas juste "construit")

Le design n'est "fini" que quand TOUT ceci est vrai :

- [ ] **Adoption** — chaque surface rend via le système (aucun composant orphelin).
- [ ] **Couleur** — 0 couleur brute → guard `no-raw-color` **BLOQUANT** dans la gate.
- [ ] **Typo** — l'échelle fluide `.type-*` adoptée partout.
- [ ] **États** — chaque composant a survol / focus / désactivé / vide / erreur + a11y.
- [ ] **Mouvement** — tokens de motion appliqués (jamais "plus tard").
- [ ] **2 modes** — clair "editorial museum" + sombre "command-room" vérifiés sur chaque surface.
- [ ] **Audits verts** — accessibilité (WCAG/APCA) · responsive · performance.

---

## Phases & statut

### Phase 1 — Fondation ✅ FAIT
- [x] Tokens 3 tiers · [x] Polices marque (Instrument Serif / Work Sans / IBM Plex Mono)
- [x] Échelles (type fluide · espace · élévation · z-index · motion · densité · data-viz)
- [x] Guard `no-raw-color` (report-only)

### Phase 2 — Atomes
- [x] Amount · [x] StatusPill · [x] Button + Tag · [x] StatCard
- [x] Table · [x] Field / Formulaire · [ ] Prose (Docs/Whitepaper) · [x] Icônes

### Phase 3 — Patterns
- [ ] Grille KPI (migration du héros ProtocolOverviewPanel) · [ ] Table CRUD
- [ ] Grille dashboard · [ ] Formulaire · [ ] Page contenu (Docs/Whitepaper/FAQ)

### Phase 4 — Harmonisation totale (le "rien à moitié")
- [ ] Finir migration couleur (108 → 0) → guard **BLOQUANT** · [ ] Adopter `.type-*` partout
- [ ] Mouvement · [ ] États complets sur tous les composants · [ ] Vérifier les 2 modes

### Phase 5 — Surfaces (adoption)
- [ ] Public · [ ] Dashboards (connecté / membre) · [ ] Console admin
- [ ] Contenu (Docs / Whitepaper / FAQ)

### Phase 6 — Audits (le sceau grade-AAA)
- [ ] Accessibilité (WCAG AA / APCA, focus, clavier, cibles ≥44px)
- [ ] Responsive (fluide, container queries, 320 → 2560, pliables)
- [ ] Performance (polices auto-hébergées, Core Web Vitals, images AVIF/WebP)

---

## Ligne d'arrivée

Design **100 % fini, verrouillé** = toutes les cases de "Définition de FINI" cochées
→ **on n'y revient plus jamais.**

## Suivi couleur
Sprawl actuel : **58** sites en couleur brute (guard report-only). Objectif : **0** + guard bloquant.
Dernière baisse : `SeatFlowDiagram` entièrement tokenisé (SVG particules/gradient/traits + classes → gold + tokens viz via `hsl(var())`), 74 → 58. **Tout le hero public = 0 couleur brute.**
Décisions marque/déco à batcher (fin de Phase 1) : rouge Avalanche `#e84142` · vert « success » (pastille live sur `PublicHome`) · fonds hero `#030609`/`#080b11` + glow · pastilles feu tricolore (déco).

## Gouvernance (comment on reste aligné)
- Ce doc est la **source unique** du workstream design.
- **Claude Code met à jour ce fichier (coche les cases) à la fin de chaque slice**, dans le même commit — pas d'état "dans la tête".
- Référencé dans `CANON_INDEX` (Tier 1) + `CLAUDE.md` → **chaque session boote dessus.**
