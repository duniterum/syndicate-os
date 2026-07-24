# ADR-003 — Identité & confidentialité : anti-doxx par conception

**Projet :** TheSyndicate OS · **Date :** 2026-07-11 · **Statut :** Accepté
**But :** figer une bonne fois POURQUOI le modèle d'identité est ce qu'il est — pour
qu'aucune session / IA future ne le re-litige ni ne le change en silence. (C'est la cause
directe de la confusion « je ne sais pas quelle IA a ajouté ça, ni quand ».)
**Principe fondateur :** la chaîne est publique **mais pseudonyme**. Le danger n'est
**jamais** la donnée on-chain brute — c'est la **LIAISON** (wallet ↔ personne réelle) et
l'**AGRÉGATION** (la plateforme qui fait, gratuitement, le travail du doxxeur).

---

## 0. Le constat — « mais tout est déjà on-chain »

Vrai : chaque achat de siège (le reçu = la transaction `MembershipPurchased*`) est **déjà
public** sur Avalanche. Wallet ↔ siège est lisible par quiconque a l'adresse du contrat.
On ne peut pas le cacher, et prétendre le faire serait malhonnête (doctrine *proof-first*).

**Mais** un wallet on-chain est `0x2445…` — pas un nom. Le doxxing n'arrive que lorsqu'on
**lie** `0x2445…` à une **personne réelle**. Donc la confidentialité ici n'a jamais eu
pour but de cacher la chaîne (impossible). Son but est double, et c'est **tout** le sujet :

- **Ne pas être le point de LIAISON** — dès qu'une plateforme stocke ou affiche une
  identité réelle à côté d'un wallet (nom, e-mail, social, doc KYC), ce wallet est doxxé.
  Et comme la chaîne est un graphe, **un seul wallet doxxé peut dérouler ceux qui lui sont
  liés**. C'est très probablement ainsi qu'une équipe crypto s'est fait doxxer : pas la
  chaîne, mais une plateforme devenue le pont identité ↔ wallet.
- **Ne pas être l'AGRÉGATEUR** — si la plateforme publie un annuaire propre
  (« Membre #1 = 0x2445…, #2 = 0x… »), elle fait le travail du doxxeur sans effort. La
  donnée était publique mais dispersée ; l'annuaire la rend triviale.

## 1. La doctrine — 3 règles dures

1. **PAS DE KYC, aucune identité réelle stockée.** Il n'existe *rien* à fuiter qui lie un
   wallet à une personne. C'est le **bouclier le plus fort** — et la différence entre ce
   protocole et celui qui s'est fait doxxer. Le wallet EST l'identité (§ facts).
2. **PAS D'ANNUAIRE.** Chaque surface est **OWN-ROW** (tu lis TON propre standing via ta
   session signée) **ou AGRÉGAT** (comptes, racines, jamais un roster nominatif). Aucun
   lookup par wallet/siège d'un tiers n'existe nulle part. La plateforme **refuse** d'être
   l'agrégateur. Le mapping memberNumber → wallet reste **server-only**, jamais sérialisé.
3. **RÉVÉLATION OPT-IN.** Un membre **peut choisir** d'afficher un nom d'affichage ou de
   partager la preuve de son siège (un « flex »). **Défaut = pseudonyme.** Toujours son
   choix, jamais imposé, jamais rétroactif.

## 2. Le POURQUOI — à ne JAMAIS re-litiger

- La chaîne publique + pseudonyme est **une force** (preuve sans confiance), pas une fuite.
- Le doxxing = **liaison + agrégation**, pas la donnée brute.
- Le KYC serait le **vecteur de fuite** ; son absence est délibérée et protectrice.
- Un annuaire nominatif serait **le cadeau au doxxeur** ; son absence est délibérée.
- Donc : ne JAMAIS ajouter de stockage d'identité réelle, ni d'annuaire, « pour améliorer
  l'UX ». Si une session future propose ça, elle re-crée exactement le risque que cet ADR
  existe pour tuer. C'est un acte **go-live fondateur explicite**, pas un défaut technique.

## 3. Ce que ça AUTORISE / INTERDIT (contraignant sur le design des preuves)

| Surface | Verdict |
|---|---|
| Membre voit **son propre** reçu / tx-hash (own-row, sa session) | ✅ sa donnée — il la partage s'il veut |
| Membre **opt-in** partage/affiche son siège publiquement | ✅ son choix explicite |
| Plateforme publie un **annuaire** wallet ↔ siège ↔ identité | ❌ **JAMAIS** — le vecteur de doxx |
| Preuve **visiteur** = **AGRÉGAT** (12 sièges live-chain, racine de gel, contrats vérifiables) | ✅ confiance sans exposer un seul wallet |
| Stockage d'une **identité réelle** (nom légal, e-mail, KYC) liée au wallet | ❌ **JAMAIS** sans go-live fondateur + refonte de cet ADR |

**Corollaire reçu/preuve (design en cours) :** vérifier n'est **pas** pour le membre (il
sait qu'il a acheté). C'est **(1)** le membre pouvant *montrer* un reçu irréfutable, et
**(2)** un visiteur pouvant *croire* sans acte de foi. Le lien « vérifier » ne doit jamais
déverser l'utilisateur sur la page brute du contrat (ne prouve pas SON siège) : reçu
own-row côté cockpit, preuve agrégée côté `/proof`.

## 4. L'enforcement DÉJÀ dans le code — ne pas régresser

- **Zone auth own-row + fail-closed** : `member-standing` / `member-self` ne lisent que le
  compte lié à la session ; jamais d'echo du wallet ; scan anti-fuite (0x40-hex / account)
  dans les tests `auth-skeleton`. Le pont genesis (`auth/memberRoster.ts`) est own-row.
- **PII server-only** : `member_continuity_record.entry_wallet` / `entry_transaction` ne
  sortent d'aucun payload public (doctrine schéma `memberContinuity.ts` / `partB.ts`).
- **Pas d'annuaire** : `guard-access-state` interdit tout matériel de lookup membre dans le
  frontend ; le snapshot Holder Index est **agrégat seul, 0 adresse**.
- **Émission d'adresses bornée** : seul `verifyLinks.ts` émet des adresses — et **uniquement
  d'infrastructure** (contrats, trésorerie, LP, burn), jamais un wallet membre
  (`member-continuity.guard` épingle cet invariant).

**Loi opératoire (rappel `ORIGIN_RECLAMATION_LEDGER`) : l'enforcement est borné par le
VOCABULAIRE.** Toute nouvelle surface de preuve/identité doit *nommer* ce qu'elle interdit
(annuaire, identité-réelle, echo-wallet) et ajouter le guard correspondant — sinon elle
n'est pas protégée.

## 5. Ce qui reste au fondateur (go-live)

- Toute surface qui **révélerait** au-delà de l'own-row (partage public, nom d'affichage,
  « membres visibles ») = **slice opt-in, go-live fondateur explicite**.
- Toute introduction, un jour, d'identité réelle / KYC = **refonte de cet ADR d'abord**,
  jamais un ajout silencieux.

---

*Companion : `THE_SYNDICATE_OS_COMPASS.md` (proof-first), `SETTLED_RULES_DO_NOT_RELITIGATE.md`
(le mécanisme décide, pas le mot), `WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` (l'archi
own-row). En cas de conflit, la Boussole gagne ; corriger le pointeur.*

---

## Amendement 2026-07-11 — décision fondateur : lever le NET runtime de discipline (réversible)

**Qui / quoi :** le **fondateur** a décidé, explicitement et enregistré ici (comme le §2
l'exige — jamais un changement silencieux), de **lever l'enforcement runtime** du filet
« discipline » sur le payload servi (`assertProtocolRealityDiscipline`) : le **net anti-fuite
d'adresse** (0x-40hex) **et** le **net anti-cadrage financier** (ROI/yield/profit/casino…).
Motif : jugé **non nécessaire pour l'instant**. À **revoir quand ce sera nécessaire** —
c'est un appel du **fondateur**, quand LUI le veut *(amendé 2026-07-24, SETTLED_RULES
§8-⑧ : il n'existe AUCUNE barrière légale dans ce système ; la clause « passage
avocat-crypto Phase 5 » qui figurait ici est supprimée et ne doit jamais être réinsérée)*.

**Réversible en 1 ligne :** l'implémentation garde la logique intacte derrière le drapeau
`DISCIPLINE_ENFORCED` (`payloadDiscipline.ts`) — la repasser à `true` ré-arme les deux nets.
Le motif anti-fuite d'adresse a même été **corrigé** au passage (il confondait un reçu 64-hex
avec une adresse 40-hex et renvoyait 500 à chaque membre reconnu), donc un futur ré-armement
est propre et gratuit.

**Ce qui NE change PAS — le cœur d'ADR-003 tient (§1–§5 restent en vigueur) :** pas de KYC /
aucune identité réelle stockée · **pas d'annuaire** · chaque surface own-row ou agrégat · le
mapping `memberNumber → wallet` reste **server-only** (jamais construit dans un payload servi
en premier lieu). Lever ce *net* ne doxxe donc **personne aujourd'hui** — il retire la
**capture automatique** d'une régression future. Les guards de build qui scannent
indépendamment les enveloppes servies pour une fuite d'adresse (`protocol-reality` §happy/
unreachable/fin-*, `FULL_ADDRESS_RE`) **ne sont pas touchés** et tournent toujours ; le §4
« enforcement déjà dans le code » reste vrai à l'exception explicite de ce seul net runtime.

**Portée :** ce lever concerne **uniquement** le net runtime `assertProtocolRealityDiscipline`.
Les guards de contenu build-time (`guard-forbidden-copy` côté studio, `verify-canon-integrity`
côté canon) ne bloquent aucun membre et ne sont **pas** touchés par cet amendement.

---

## Amendement 2026-07-15 — LA FIERTÉ DU REGISTRE PUBLIC (décision fondateur : le masquage des adresses membres est levé sur le FLUX)

**Qui / quoi :** le **fondateur** a annulé le masquage des adresses membres dans le flux
d'activité (tranche H2-P). Motif engraved : la chaîne est publique, chaque adresse vit déjà
sur l'explorer et dans nos propres ancres de vérification ; le masquage théâtral côté serveur
ne protège personne et supprime la **FIERTÉ** du membre — le moteur statut-par-preuve
(« je peux montrer le registre »). Les archives de l'origine, retrouvées cette semaine, parlent
verbatim par adresse (« 0x123…abcd entered the public registry » · « 0x123…abcd archived
First Signal ») — la fierté-par-adresse EST la voix d'origine ; le masquage était notre
déviation, pas la tradition.

**Ce qui change :** le flux (et les surfaces qui le relaient) PEUT afficher le numéro de
membre de l'événement et l'adresse de son acteur en **FORME COURTE** (« 0x123…abcd »),
telle que l'origine le faisait. Le §1.2 (« le mapping memberNumber → wallet reste
server-only, jamais sérialisé ») est **restreint, pas supprimé** : le flux ne republie que
ce qu'UN SEUL événement de chaîne porte lui-même (le log V3 publie nombre et wallet
ensemble) — **jamais** d'annuaire, **jamais** d'API de lookup, **jamais** d'enrichissement
au-delà des champs de l'événement, **jamais** de jointure roster/cross-événement.

**Le « qui-a-amené-qui » (FOUNDER OVERRIDE le jour même, 2026-07-15 : la forme B voilée
est REMPLACÉE par la forme A — le référreur NOMMÉ) :** motif fondateur engraved : le
référreur est la partie fière — sa fierté est le moteur de croissance (SPEC_REFERRAL §⑨,
honour-roll décidé ; des kits référreur payants seront vendus — un référreur voilé tue le
produit). Structurellement propre par la logique même de ce gate : le `sourceWallet` vit
dans le MÊME log d'achat V3 — un seul événement republié, aucune jointure de relation.
Rendu : « Member #14 · 0xea8…5881 entered the public registry — brought by 0x3f2…0a91 » —
forme courte, même discipline de scanner ; le sourceId reste réduit au booléen (l'id ne
sort jamais) ; un événement référé dont le champ wallet serait malformé dégrade à la
formulation voilée (« brought by a verified referral ») — un trou honnête, jamais une
invention. Quand la couche alias arrivera (M2/M3), l'alias remplacera l'adresse sur cette
même ligne (« brought by CryptoKemal » — la vitrine).

**Ce qui NE change PAS — le cœur tient :** pas de KYC / aucune identité réelle stockée ·
pas d'annuaire ni de lookup · zone own-row/auth intacte · le rapport agrégé du backbone
reste aveugle (ni nombres, ni adresses) · **une adresse COMPLÈTE de membre ne se sérialise
nulle part** — la forme courte est dérivée côté serveur et les scanners de sortie (40-hex)
restent armés, inchangés : une adresse complète dans un payload reste un build rouge / 500 ·
la règle voix-fondateur tient (les actes du fondateur DISENT le fondateur) · l'ancre de
vérification reste le chemin de la vérité complète. **Exception d'écriture nommée :** le
script founder-gated `archive:minter-backfill` restaure, UNE fois, le minter des 17 mints
historiques depuis les logs de la chaîne elle-même (update de `decoded_json` seul,
cross-check fail-closed avant toute écriture).
