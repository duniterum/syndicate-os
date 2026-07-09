# FOUNDATION SPEC v2 — Design System de base (world-class, grade AAA)

**Projet :** TheSyndicate OS · **Date :** 2026-07-09 (v2) · **Tier canon :** 1 (architecture)
**Base :** pratiques 2026 des design systems de référence (Material, IBM Carbon,
Atlassian, Adobe Spectrum) + Tailwind v4 + Core Web Vitals, **adaptées** à la marque
Syndicate (encre + or + cyan, command-room / museum) et au stack (React + Tailwind v4 +
Replit). On ne part PAS du repo actuel — on pose le meilleur, puis on câble.

> v2 = enrichie proactivement des best practices grade-AAA au-delà de la demande
> littérale (icônes, états, élévation, layering, motion, data-viz, densité, grille,
> a11y avancée, perf images, gouvernance).

---

## 1. Architecture des tokens — 3 tiers (source unique de vérité)

- **Primitif (base)** : rampes brutes **OKLCH** (perceptuellement uniforme, meilleur dark
  mode + gamut large). `--ink-{50..950}`, `--gold-{...}`, `--cyan-{...}`, `--neutral-{...}`,
  + échelles espace / rayon / élévation / z-index / durée.
- **Sémantique (alias)** : `--color-bg`, `--color-fg`, `--color-surface-{base,elevated}`,
  `--color-identity` (=or), `--color-live` / `--color-proof` (=cyan), `--color-focus-ring`
  (=or), `--color-border`, `--color-muted`, états (`success/warning/error/info`) + états
  d'interaction (voir §7). Les composants ne référencent **que** le sémantique.
- **Composant** : seulement si non résoluble au sémantique.
- Implémentation : Tailwind v4 `@theme` (déjà en place). Application : guard `no-raw-color`.
- **Gouvernance** : nommage `catégorie-propriété-variante-état` ; source unique ; documenté.

## 2. Typographie

- **3 polices de marque** : Instrument Serif (display) · Work Sans (UI) · IBM Plex Mono
  (data). Cible = **auto-hébergées WOFF2 subset** (perf/RGPD) ; **départ pragmatique** =
  Google Fonts via un **token échangeable** (Replit récupérera/subsettera ensuite — micro-
  slice perf, une seule ligne source à changer). Poids limités (400/500/600/700).
- **Chargement** : `preload` critiques ; `font-display: optional` (corps → CLS zéro) +
  `swap` (display) ; `size-adjust` / `ascent-override` / `descent-override` (fallback
  métriquement calé → décalage quasi nul).
- **Échelle fluide** : `clamp(min, rem+vw, max)` (rem+vw = zoom préservé, WCAG 1.4.4),
  ratio ~1.2 UI / 1.25–1.333 display. Rôles : display / h1–h4 / body / label / caption.
  rem partout. Corps ≥16px mobile, 18–20 desktop. Line-height inverse (display 1.05–1.2 ;
  body 1.5–1.6). Échelle de tracking. Mesure 60–75ch.

## 3. Espacement, layout, grille

- Échelle d'**espace fluide** (clamp) base 4/8pt ; espacement de section fluide.
- **Grille de layout** : colonnes + gouttières tokenisées ; **conteneurs fluides**
  (max-width + marges auto — pas de zones mortes) ; largeurs de contenu max par contexte.
- **Modes de densité** : `comfortable` / `compact` (tables admin/dashboard denses).

## 4. Élévation, profondeur, layering

- **Élévation** : light = échelle d'**ombres** ; dark = **élévation par surface** (teinte
  de fond), pas d'ombres. Token de **backdrop-blur** (verre command-room).
- **Z-index / layering** tokenisé : base → dropdown → sticky → overlay → modal → popover →
  toast → tooltip. Fini les `z-index: 9999` arbitraires.

## 5. Iconographie

- **SVG uniquement** (jamais icon-fonts → meilleure a11y, zéro CLS, sémantique correcte).
- Échelle de **tailles** d'icônes + **épaisseur de trait** cohérente ; alignement optique.
- Les 5 pictos de marque (Seat · Chain · Vault · Seal · Archive) + lucide, un seul registre.

## 6. Motion

- Tokens de **durée** (fast/base/slow) + **easing** (courbes nommées). `prefers-reduced-
  motion` respecté (déjà là). Unifier les animations `syn-*` existantes sur ces tokens.

## 7. États d'interaction (systématiques)

- hover / active / focus-visible / disabled / selected / loading — via **state layers**
  en alpha (à la Material) plutôt que des couleurs one-off. Focus ring **or** visible.

## 8. Data-visualisation

- **Palette data-viz dédiée** (catégorielle + séquentielle), **colorblind-safe**,
  distincte des couleurs de marque, pour donuts / courbes cashflow / graphiques Economy.

## 9. Responsive

- **Fluid-first** (clamp type + espace) → peu de breakpoints, aucun saut.
- **Container queries** (stables 2026) → responsivité au niveau **composant**.
- Mobile-first. Tester 320 → 2560 + pliables + zoom 100/150/200%.

## 10. Accessibilité (WCAG AA baseline, viser AAA)

- Contraste or/cyan sur encre ≥ AA (4.5:1 texte / 3:1 large) — vérifié aussi en **APCA**
  (plus fin que WCAG 2), aux deux modes, au niveau primitif.
- **Cibles tactiles ≥44px**, **focus-visible** clavier, HTML **sémantique** + landmarks,
  foregrounds en alpha, mode **high-contrast**, unités rem (zoom), reduced-motion.

## 11. Performance / visibilité (Google classe sur les Core Web Vitals)

- Polices : auto-héberger + subset + preload → LCP/CLS.
- **Au-delà des polices** : images **AVIF/WebP** + **lazy-loading** + **code-splitting** ;
  CSS critique inline ; HTTP/2-3. (Les images sont souvent le vrai goulot.)

## 12. Couche marque Syndicate (sur la base tokenisée)

- **Deux modes** depuis une base unique : dark « command-room » + light « editorial
  museum ». **Or = identité/recognition ; Cyan = live/proof/vérification** (jamais chrome
  d'identité — encodé dans les sémantiques).
- Discipline **FastPay-grade** (cartes KPI ; tables status-pills + tri/filtres/pagination ;
  une couleur d'action) → couche **Patterns**, sur tokens + primitives.

---

## Différé volontairement (intentionnel, pas oublié)

RTL / i18n · styles print · thématisation multi-marque. À ajouter quand le besoin arrive.

## Décisions (tranchées par l'expert, délégation du directeur)

- **Polices** : les 3 de marque, départ Google Fonts via token échangeable → auto-hébergé
  ensuite (micro-slice perf).
- **Couleur** : **OKLCH**, teintes de marque, WCAG+APCA, 2 modes ; **noms de tokens
  existants préservés** (zéro casse composant) + primitives dessous + bons sémantiques.

## Roadmap (une slice vérifiée à la fois)

1. **Fondation** (ce spec) : tokens 3 tiers (couleur + espace + rayon + élévation + z-index
   + durée + densité + data-viz) + polices + échelle typo fluide + guard `no-raw-color`.
2. **Primitives** : Amount, Button, Tag, StatusPill, StatCard, Table, Field, Icon, Prose.
3. **Patterns** : carte KPI, table CRUD, grille dashboard, section admin, charts.
4. **Cascade surfaces** : public → dashboards → console admin → contenu (Docs/Whitepaper/FAQ).
