# ADR-002 — Protocole opératoire anti-dérive

**Projet :** TheSyndicate OS · **Date :** 2026-07-09 (v2) · **Statut :** Accepté
**But :** ne plus jamais revivre la dérive / perte de contexte / patch-en-boucle /
copier-coller multiple.
**Principe fondateur :** le contrôle d'erreur vit **dans le process**, pas dans la
vigilance d'Astronaute.

---

## 0. Le constat (autocritique de la session 2026-07-09)

Workflow **async & non-surveillé** + confiance d'Astronaute qui ne peut pas lire le code
⇒ **les erreurs de Claude ne sont pas rattrapées, elles s'exécutent** (pendant qu'il
dort, et à 15-25 $ le run Replit). La vigilance d'Astronaute était le seul filet. C'est
LE bug à corriger.

**Cause racine :** Claude résout par défaut au **niveau local/symptôme** et ne
**s'auto-vérifie pas**. Décliné en 6 dérives cette session :
1. Rigueur baissée sur « cosmétique » (swap monnaie sans tracer le rendu).
2. Prompt prématuré par biais de momentum.
3. Cécité d'altitude (instance vs classe — Astronaute a dû remonter Claude 3×).
4. Amnésie (plan holistique déjà bâti, non récupéré).
5. Fix « durable » lui-même local (ADR scoping monnaie).
6. **Communication brouillonne** : plusieurs blocs de code par message → Astronaute ne
   sait plus lequel coller ; instructions manuelles au lieu d'un zip+prompt unique.

## 1. Boot de session — AVANT tout travail

1. Lire `docs/00_CANON_INDEX.md`, charger TIER 0 + TIER 1.
2. `conversation_search` + `recent_chats` : état courant + prochaine slice.
3. Lire l'état réel du repo pour les surfaces touchées.
4. **HANDSHAKE** : restituer en 4 lignes (où on en est / plan acté / prochaine slice /
   questions ouvertes) et **attendre la validation** avant de travailler.

## 2. Gate anti-dérive — AVANT toute proposition

Présenté en **texte simple** (jamais dans un bloc de code — un bloc de code = un prompt
à coller, rien d'autre) :

- **Altitude :** one-off | CLASSE → fix au niveau [token/primitive/pattern/surface]
- **Contexte lu :** [fichiers / past-chats / ADR]
- **Si faux :** [rayon de dégâts — ça tourne non-surveillé]
- **Fit système :** [consomme la fondation X | ⚠ local → j'escalade]

## 3. Règles dures

**Méthode :**
- Jamais changer une valeur/string/token sans **tracer le rendu/donnée** et énoncer la
  conséquence d'abord.
- **« Juste » avant « vite »** (non-surveillé ⇒ l'erreur s'exécute ; chaque run ≈ 15-25 $).
- **Niveau système, pas local** ; si j'invente du local, j'**escalade**.
- **Slice par slice**, vérifiée (guards + build), poussée sur `main`. Jamais de big-bang.
- **Guards = filet objectif** : `no-raw-money`, `no-raw-color`, existants. Fix la cause.
- **Truth-first** : autorité = la chaîne (chiffres) + le brand board (design).

**Communication avec Replit (non négociable) :**
- **AUCUN prompt Replit sans demander d'abord.**
- **UN seul prompt prêt-à-coller par action.** Jamais 2, jamais scindé en étapes à
  enchaîner. Astronaute **uploade (si zip) et colle UNE fois** — il n'ajoute, n'explique,
  ne reformule **jamais** rien à Replit (il ne phrase pas comme Claude et pourrait altérer
  l'instruction).
- **Livraison de fichiers = UN ZIP** structuré repo-relatif (s'extrait pile en place).
- **UN SEUL bloc de code par message = la seule chose à coller.** Le gate, les
  explications, tout le reste = texte simple. Zéro ambiguïté sur quoi coller.
- **Minimiser les allers-retours** : batcher, pré-vérifier, viser juste du premier coup.

## 4. Fin de session — TOUJOURS

Mettre à jour le topo/handoff + la prochaine slice + persister toute décision en ADR +
inscrire tout nouveau doc dans le CANON_INDEX. La session suivante boote d'un état complet.

## 5. Le message de démarrage (à coller à Claude au début de CHAQUE nouvelle session)

> « **Boot TheSyndicate OS.** Lis `docs/00_CANON_INDEX.md` + charge TIER 0 & TIER 1,
> cherche nos dernières conversations projet, lis l'état réel du repo, puis restitue-moi
> en 4 lignes : où on en est · le plan acté · la prochaine slice · les questions ouvertes
> — et **attends ma validation** avant de proposer ou d'écrire quoi que ce soit. Applique
> le **gate** (texte, 4 lignes) à chaque proposition. **Aucun prompt Replit sans me
> demander.** Quand tu me donnes du Replit : **UN seul zip + UN seul prompt, un seul bloc
> de code**, que je colle une fois — jamais deux, jamais moi qui explique à Replit. »

---

*Résumé : boot (récupère le contexte) → handshake → gate texte à chaque proposition →
demander avant tout prompt → UN zip + UN prompt + UN bloc de code → slice vérifiée → fin
de session qui persiste. Le filet, ce n'est plus la vigilance d'Astronaute — c'est le
process + les guards.*
