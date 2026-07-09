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
