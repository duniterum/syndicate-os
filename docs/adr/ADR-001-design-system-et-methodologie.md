# ADR-001 — Design System & Méthodologie (SYSTEM-WIDE)

**Projet :** TheSyndicate OS · **Version :** v2 (holistique) · **Date :** 2026-07-09
**Statut :** Accepté · **Rôles :** Astronaute (directeur) · Claude (ingénieur) · Replit (exécuteur)
**Source de vérité — code :** GitHub `duniterum/syndicate-os@main`
**Source de vérité — marque :** le **brand board** (13 images) — autorité sur toute mémoire distillée.

---

## 0. Portée — TOUT le système (pas un widget)

Ce design system sert **toutes** les surfaces, présentes et futures :
site public (Visiteur) · dashboard **Utilisateur connecté** · cockpit **Membre** « My
Syndicate » · **console Admin** (WordPress-style, modules on/off) · **contenu** (FAQ,
Docs, Whitepaper, Economy/GDP, Chronicle, Recognition, Status, Proof).
**Une fondation, chaque surface la consomme.** But : aucune partie n'est jamais un
patchwork — parce que toutes descendent des **mêmes tokens**.

## 1. Le problème qu'on tue à la racine

Pattern répété (sessions IA précédentes ET ici) : dérive, perte de contexte, bonnes
idées jamais assemblées bout-en-bout, et des correctifs **locaux** qui engendrent le
bug suivant — cyan `--ring`, patchwork monnaie, palette sprawl (24 couleurs texte / 43
fonds mêlant rgb/oklab/oklch). Cause unique : **pas de système**, des décisions prises
par composant. Le design system rend cette **classe entière** de bugs *structurellement
impossible*.

## 2. Fondation de marque (CANONIQUE — depuis le brand board)

- **Typo :** **Instrument Serif** (display) · **Work Sans** (UI) · **IBM Plex Mono**
  (data). → *Remplace toute note « Raleway » / « Fraunces » (périmées).*
- **Palette :** encre bleu-nuit + **or** (identité / recognition / seat / membership)
  + **cyan** (live / proof / vérification / activité). Hex exacts light **et** dark du
  brand board.
- **Deux modes, même code tokenisé :** **light « editorial art-museum »** (défaut) +
  **dark « command room »** (optionnel).
- **Logo :** monogramme sceau/chaîne « S ». **Pictos de sens :** Seat · Chain · Vault ·
  Seal · Archive.
- **Discipline layout — FastPay-grade :** respiration / hiérarchie claire / cartes KPI
  (icône + label + valeur + micro-trend) / tables propres (status-pills + tri + filtres
  + pagination) / data-viz sobre / **une seule** couleur d'action — coulée dans la
  palette sombre premium.

## 3. Architecture en couches (méthode industrie, à l'échelle du repo)

**Tokens (3 tiers) → Primitives → Patterns → Templates → Surfaces.**
Primitives **shadcn existantes**. **Aucune nouvelle librairie.**

- **Tokens :** primitif (`--ink`, `--gold`, `--cyan`, échelles espace/typo/élévation) →
  **sémantique** (`--focus-ring`, `--identity`, `--live`, `--proof`, `--surface`,
  `--text-*`) → composant. Les composants ne référencent **que** le sémantique.
  *(Fix permanent du cyan : `--focus-ring → primitive.gold`.)* Sortie web = variables
  CSS (ton `index.css` — à **tiérer** et **aligner** sur le brand board).
- **Primitives (atomes) :** `Amount` (monnaie), `Button`, `Tag/Badge`, `StatusPill`,
  `StatCard/KPI`, `Table`, `Field/Input`, `Icon`, `Prose` (Docs/Whitepaper). Nombres :
  formateur **BigInt** précision-safe (déjà là, on n'y touche pas) + `Amount`
  présentation.
- **Patterns :** carte KPI · table CRUD (status-pills + tri + filtres + pagination) ·
  grille dashboard · section admin (module plugin on/off) · bloc doc/whitepaper.
- **Templates :** page publique · dashboard (connecté / membre) · section admin · page
  contenu (FAQ / Docs / Whitepaper).

## 4. Carte des surfaces → ce qu'elles consomment

| Surface | Templates | Primitives/patterns clés |
|---|---|---|
| **Public** (Visiteur) — hero, Economy/GDP, Membership, Proof, Status, Chronicle | page publique | KPI · Amount · Table · Tag |
| **Utilisateur connecté** — swap/bridge/mint/explorer, dashboard léger | dashboard | KPI · Table · Amount |
| **Membre** — cockpit « My Syndicate » (seat, rang, receipts, SYN, seasons) | dashboard | KPI · Amount · Table · StatusPill |
| **Admin console** (WordPress-style) — shell 10 sections, role-scoped, ⌘K | section admin | toute la bibliothèque (spec = `SHELL_SPEC`) |
| **Contenu** — FAQ, Docs, Whitepaper | page contenu | `Prose` + ancres |

## 5. Méthodologie de travail (la boucle)

Rôles + contrainte : exécution **async & non-surveillée** → **« juste » avant « vite »**
(un prompt faux brûle un run Replit, un sync, du temps, de l'argent).
**Boucle par tâche :** LIRE tout → CLASSER l'altitude (one-off vs classe) → TRACER le
chemin de rendu/donnée → CONCEVOIR **contre le système** → **UN** prompt vérifié →
**PERSISTER** ici. **Slice par slice, jamais tout d'un coup.** Guards = colonne vérité
(fix la cause, jamais affaiblir). Truth-first (lecture chaîne ou état honnête).

## 6. Gouvernance / application (rend la dérive impossible)

Guards dependency-free : `no-raw-money` (aucune string monnaie à la main hors `Amount`
+ formateurs) · `no-raw-color` (aucun hex/couleur hors token sémantique) · + les guards
existants. Storybook léger **optionnel** plus tard pour documenter les atomes.

## 7. Roadmap disciplinée — « tokens avant composants »

1. **Fondation tokens** — tiérer `index.css` (primitif → sémantique), aligner sur le
   brand board (typo Instrument Serif/Work Sans/Plex Mono, palette exacte, 2 modes).
   → tue **cyan** + **palette sprawl** d'un coup.
2. **Primitives** — `Amount` (corrige le patchwork monnaie live comme 1re brique
   *correcte*), puis `Button`/`Tag`/`StatusPill`/`StatCard`/`Table`/`Prose`.
3. **Patterns** — KPI card · CRUD table · dashboard grid · section admin.
4. **Cascade surfaces** — public → dashboards (connecté/membre) → console admin →
   contenu (Docs/Whitepaper/FAQ).

Chaque brique = une slice vérifiée (guards + build) poussée sur `main`. Jamais un
big-bang.

---

**Note de vérité (design) :** la mémoire distillée disait « Raleway » ; le brand board
dit **Instrument Serif / Work Sans / IBM Plex Mono**. Le brand board est l'autorité,
comme la chaîne l'est pour les chiffres. *À reconfirmer si la marque a encore évolué.*

---

## Amendement 2026-07-16 — LE PLANCHER DE LISIBILITÉ (fondateur ; recherché WCAG/a11y)

**Constat fondateur (preview S7-b) : « des petits textes pas très lisibles, pas la bonne
taille. »** Recherche (A11Y Collective, Orange a11y, WebAIM, Section508) : corps ≥ 16px,
secondaire ≥ 14px, plancher pratique 12px, interligne ≥ 1,5, unités relatives, zoom 200 %
sans perte. **LA RÈGLE (design général, toutes surfaces à venir) :**

1. **Copie de lecture (phrases, notes, explications, mentions légales) : ≥ 14px**
   (`text-sm`) avec `leading-relaxed`.
2. **Étiquettes / méta / provenance (une ligne, mono uppercase) : ≥ 12px** (`text-xs`).
3. **Corps principal des pages prose : 16px+** (`type-body` — le token existe).
4. **RIEN d'utilisateur-visible sous 12px.** Les classes arbitraires `text-[9px]`/
   `text-[10px]`/`text-[11px]` sont INTERDITES dans toute nouvelle surface ; les tokens
   (`--text-label` 13px · `--text-caption` 11px→à réévaluer au sweep) priment sur les
   tailles arbitraires.
5. **Valeurs de tuiles/KPI : ≥ 18px** ; titres de cartes : ≥ 16px.
6. **Liens : affordance visible** (couleur + hover, jamais la taille seule).

**Appliqué (2026-07-16) : toute la composition /member** (shell/portes, settings, bandeau,
KPI, cartes capital/protocole/chronicle, pouls, referral, porte visiteur). **RESTE (tranche
sweep générale, notée) :** le reste du site (header affordance, checkout, admin console,
`syn-label`/`syn-caption` 9–10px, MembersProvenance compact) + un guard `no-sub-12px-text`
qui rendra le plancher structurel.

## Amendement 2026-07-16 (bis) — LA RÈGLE DE LA SURFACE FLUIDE (fondateur ; recherché)

**Constat fondateur : un cap de largeur (`max-w-screen-2xl`) n'est jamais « plein écran
partout ».** Recherche (UXPin 2025, fluid design, Polypane safe-areas, MDN viewport units,
Apple HIG/Material touch targets) : **LA RÈGLE (générale, toutes surfaces) :**

1. **Surfaces APPLICATIVES (dashboards, consoles) : FLUIDES pleine largeur** — jamais de
   cap ; gouttières responsives seulement (`px-4 sm:px-6 lg:px-8`). La lisibilité des
   textes est bornée PAR LES CARTES de la grille, jamais par un cap de page.
2. **Surfaces PROSE : cap 1200–1440px** (la loi hybride existante, inchangée).
3. **Multi-appareils/OS (iOS · Android · desktop)** : `viewport-fit=cover` + safe-areas
   `env(safe-area-inset-*)` sur le body (coût zéro hors encoches) ; **JAMAIS
   `maximum-scale=1`** (bloquait le zoom — violation WCAG 1.4.4, corrigée ce jour) ;
   hauteurs en `svh` (héros stables) / `dvh` (suivi dynamique), jamais `vh` nu.
4. **Cibles tactiles ≥ 44px** (Apple 44 / Material 48) avec ≥ 8px d'espacement — les
   puces de navigation mobiles du member shell sont à 44px mesurés.
5. **Test de toute surface : 320 → 2560px**, deux thèmes, deux OS mobiles au preview.

Appliqué ce jour : le dashboard membre fluide (1920 mesuré bord à bord, gouttières
internes seules) · viewport meta corrigée (zoom 200 % restauré) · safe-areas globales ·
puces 44px. Le reste du site suit la même règle à chaque tranche qui le touche.
