# DESIGN_ROADMAP — chemin vers "full grade-AAA" (source unique du workstream design)

**Statut : vivant.** Claude Code coche les cases à la fin de chaque slice, dans le
même commit. **Tout le monde travaille depuis CE doc** — fondateur, Claude Code,
Claude-conseil, Replit. Personne ne part de son côté.

---

## Définition de "FINI" (grade-AAA, pas juste "construit")

Le design n'est "fini" que quand TOUT ceci est vrai :

- [ ] **Adoption** — chaque surface rend via le système (aucun composant orphelin).
- [x] **Couleur** — 0 couleur brute → guard `no-raw-color` **BLOQUANT** dans la gate.
- [x] **Typo** — l'échelle fluide `.type-*` adoptée partout (titres display/h1/h2/h3 sur toutes les surfaces, en Instrument Serif ; corps via `.type-body`).
- [x] **États** — chaque composant a survol / focus / désactivé / vide / erreur + a11y (atomes : Field default/focus/error/disabled ; DataTable vide/loading/hover + tri clavier ; Button/Input focus/disabled ; l'audit a11y profond WCAG/APCA = Phase 6).
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
- [x] Table · [x] Field / Formulaire · [x] Prose (Docs/Whitepaper — livré slice 2.1) · [x] Icônes

### Phase 3 — Patterns
- [ ] Grille KPI (migration du héros ProtocolOverviewPanel) · [ ] Table CRUD
- [ ] Grille dashboard · [ ] Formulaire · [ ] Page contenu (Docs/Whitepaper/FAQ)

### Phase 4 — Harmonisation totale (le "rien à moitié")
- [x] Finir migration couleur (108 → 0) → guard **BLOQUANT** · [x] Adopter `.type-*` partout (titres, ~17 pages, serif)
- [ ] Mouvement · [x] États complets sur tous les composants · [ ] Vérifier les 2 modes

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

## Suivi couleur — ✅ FERMÉ
Sprawl : **0** couleur brute. Guard `no-raw-color` **BLOQUANT** dans la gate (`pnpm guards`), toute
nouvelle couleur brute casse le build. Du pic de **137 sites** → **0** au fil des slices d'harmonisation.
Une seule exception documentée : `QrCodeBlock` (fond blanc du canvas QR, requis pour la lisibilité),
taguée `no-raw-color-allow`. Le token layer (`index.css`) reste la seule source de couleur brute légitime.

## Gouvernance (comment on reste aligné)
- Ce doc est la **source unique** du workstream design.
- **Claude Code met à jour ce fichier (coche les cases) à la fin de chaque slice**, dans le même commit — pas d'état "dans la tête".
- Référencé dans `CANON_INDEX` (Tier 1) + `CLAUDE.md` → **chaque session boote dessus.**
