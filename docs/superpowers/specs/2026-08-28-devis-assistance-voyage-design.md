# Formulaires de devis multi-étapes — moteur générique + Assistance voyage

**Date :** 2026-08-28
**Statut :** proposé
**Portée :** un moteur de formulaire multi-étapes réutilisable, et son premier
produit : la demande de devis en assistance voyage.

## Contexte

Le site ne possède aujourd'hui qu'un seul formulaire : `ContactForm`
(`src/components/contact/ContactForm.tsx` + `src/features/contact/`). C'est un
formulaire à écran unique, huit champs, envoyé par e-mail via une Server Action.

Martens souhaite proposer des demandes de devis par produit d'assurance. Le
premier est l'**assistance voyage**, qui demande une vingtaine de champs :
identité et adresse du preneur, jusqu'à cinq assurés, et les caractéristiques du
voyage. D'autres produits (auto, habitation, famille, santé) suivront.

Deux problèmes en découlent :

1. Une vingtaine de champs sur un écran unique est un mur qui fait fuir. Il faut
   découper, montrer la progression, et ne demander les données personnelles
   qu'une fois l'utilisateur engagé.
2. Écrire chaque futur formulaire de zéro dupliquerait la navigation par étapes,
   la validation, la persistance du brouillon, le récapitulatif et l'envoi. Le
   coût du deuxième formulaire doit être proche de celui de son seul contenu
   métier.

La page `/simulation`, jusqu'ici un gabarit vide en `noindex`, a été supprimée.
Les liens qui la visaient (bouton d'en-tête, entrée de pied de page) sont
actuellement commentés.

## Décisions

| Sujet | Décision |
|---|---|
| URL | `/devis` (hub) et `/devis/[produit]` (route dynamique unique) |
| Ordre des étapes | Voyage → Assurés → Preneur → Coordonnées → Récapitulatif |
| Coordonnées | Étape dédiée en fin de parcours (e-mail requis, téléphone optionnel, consentement RGPD) |
| Traitement | E-mail à l'agence + accusé de réception au prospect |
| Date de naissance | Champ texte masqué `JJ/MM/AAAA`, `inputMode="numeric"` |
| Brouillon | Sauvegarde `localStorage`, restauration proposée par bandeau |
| Tests | Vitest, limité aux schémas et helpers purs |

## 1. Parcours utilisateur

### 1.1 Point d'entrée

Sur `/services/particuliers`, la liste `coverages` reçoit un champ optionnel
`quote?: { href: string; label: string }`. La ligne « Assistance » l'utilise et
affiche un lien « Demander un devis → » sous sa description. Les autres
couvertures restent inchangées jusqu'à ce que leur formulaire existe : ajouter
un produit consistera à renseigner ce champ.

Le lien est un `<Link>` distinct, pas la ligne entière rendue cliquable : la
ligne contient déjà un `<h2>`, et l'imbriquer dans un lien nuirait à la
navigation au clavier et au lecteur d'écran.

### 1.2 Les cinq écrans

| # | Étape | Champs |
|---|---|---|
| 1 | **Votre voyage** | Destination (3 cartes radio) · Durée : annuelle ou période (→ 2 dates) · Valeur du voyage (€) · Véhicule à assurer ? (→ date de 1ʳᵉ mise en circulation) |
| 2 | **Les personnes assurées** | « Êtes-vous vous-même assuré(e) ? » O/N · « D'autres personnes à assurer ? » O/N → liste ajoutable, max 4 |
| 3 | **Le preneur d'assurance** | *Identité* : prénom, nom, date de naissance, genre — *Adresse* : rue, n°/boîte, code postal, localité |
| 4 | **Vos coordonnées** | E-mail (requis), téléphone, message libre, consentement RGPD |
| 5 | **Récapitulatif** | Résumé par section, chacune éditable en un clic, bouton d'envoi |

Chaque `SummarySection` porte le `stepId` dont elle provient : le lien
« Modifier » d'une section ramène directement à l'étape correspondante, et le
retour au récapitulatif se fait par le bouton de navigation habituel.

L'ordre place le concret et rapide en premier, les données personnelles en
dernier. L'ordre de saisie n'a pas d'incidence sur l'e-mail reçu par l'agence :
le récapitulatif est construit par une fonction dédiée qui restitue l'ordre
métier (preneur → assurés → voyage).

**Anti-mur sur l'étape 2 :** les quatre assurés supplémentaires ne sont jamais
affichés vides. L'utilisateur ajoute une carte à la fois via « Ajouter une
personne » ; le bouton se désactive à quatre ; chaque carte porte un bouton de
suppression. Répondre « Non » à une question masque **et vide** les champs
dépendants, afin qu'aucune donnée fantôme ne parte dans l'e-mail.

**Étape 3 :** les huit champs sont regroupés en deux `FieldSet` avec
`FieldLegend` (« Identité », « Adresse »). Les attributs `autoComplete`
(`given-name`, `family-name`, `street-address`, `postal-code`,
`address-level2`) permettent au navigateur de remplir le bloc adresse d'un
seul geste.

### 1.3 Progression

- **Desktop (≥ `lg`)** : stepper vertical sticky en colonne gauche, cinq
  entrées numérotées, coche sur les étapes validées, étape courante mise en
  avant. Les étapes déjà validées sont cliquables pour revenir en arrière ; les
  suivantes ne le sont pas.
- **Mobile et tablette** : barre sticky en haut du formulaire — « Étape 2 sur 5 ·
  Les personnes assurées », barre de progression fine, flèche retour.
- Le stepper est un `<nav aria-label="Étapes du formulaire">` ; l'étape courante
  porte `aria-current="step"`.

### 1.4 Brouillon local

Les valeurs du formulaire sont sérialisées dans `localStorage` sous la clé
`martens:devis:<slug>:v1`, en debounce de 500 ms, avec l'index de l'étape
courante et un horodatage.

- **Exclus de la sauvegarde :** `consent` et `honeypot`. Un consentement RGPD ne
  se restaure pas silencieusement ; l'utilisateur doit le recocher.
- **Restauration :** au montage, si un brouillon de moins de 7 jours existe, un
  bandeau discret propose « Reprendre où vous en étiez ? » avec deux actions,
  *Reprendre* et *Recommencer*. Aucune restauration automatique : réafficher
  sans prévenir des données personnelles est déroutant, en particulier sur un
  poste partagé.
- **Purge :** à l'envoi réussi, et sur *Recommencer*.
- Toutes les lectures et écritures sont encadrées d'un `try/catch` : le stockage
  peut lever une exception (navigation privée, stockage bloqué).

### 1.5 Écran de succès

Pas un toast. Après cinq étapes, le formulaire est remplacé par un écran de
confirmation : coche, « Votre demande est bien partie », délai de réponse
annoncé, téléphone de l'agence, lien de retour vers `/services/particuliers`.
Les toasts `sonner` restent utilisés pour les erreurs d'envoi.

## 2. Architecture

### 2.1 Arborescence

```
src/features/quotes/
  core/
    types.ts            QuoteStep, QuoteFormDefinition, SummarySection
    meta.ts             quoteFormsMeta — métadonnées sérialisables, sûres côté serveur
    definitions.ts      quoteDefinitions — schémas + summary, importé par la Server Action
    action.ts           "use server" submitQuoteRequest
    email.ts            rendu texte et HTML d'un SummarySection[]
    useQuoteDraft.ts    persistance localStorage
  assistance-voyage/
    schema.ts           schéma zod, énumérations et libellés
    summary.ts          values -> SummarySection[]
    definition.ts       assemble schema + summary + defaultValues (aucun JSX)
    steps.tsx           définition des étapes et composants de champs
    AssistanceVoyageForm.tsx   "use client", assemble definition + steps
src/components/quotes/
  quote-forms.tsx       "use client", registre slug -> composant + QuoteFormBySlug
  QuoteForm.tsx         moteur client : RHF, navigation, soumission
  QuoteStepper.tsx      stepper desktop + barre de progression mobile
  QuoteReview.tsx       récapitulatif
  QuoteSuccess.tsx      écran de confirmation
  QuoteDraftBanner.tsx  bandeau de reprise
  fields/
    MaskedDateField.tsx   JJ/MM/AAAA
    GenderField.tsx
    OptionCardGroup.tsx   cartes radio
    BooleanField.tsx      segmenté Oui / Non
    EuroField.tsx
    PersonFields.tsx      prénom, nom, date de naissance, genre — réutilisé 5 fois
    AddressFields.tsx
src/app/(app)/devis/
  page.tsx              hub
  [produit]/page.tsx    route unique pilotée par le registre
```

### 2.2 Types du moteur

```ts
// src/features/quotes/core/types.ts
export type SummaryRow = { label: string; value: string }
export type SummarySection = { title: string; stepId: string; rows: SummaryRow[] }

export type QuoteStep<T extends FieldValues> = {
  id: string
  title: string
  description?: string
  /** Champs validés avant de passer à l'étape suivante. */
  fields: Path<T>[]
  Component: React.ComponentType
}

export type QuoteFormDefinition<T extends FieldValues> = {
  slug: string
  schema: z.ZodType<T>
  defaultValues: DefaultValues<T>
  summary: (values: T) => SummarySection[]
  emailSubject: (values: T) => string
  recipientEmail: (values: T) => string
}
```

Les composants d'étape lisent le formulaire par `useFormContext()`. Ils ne
reçoivent aucune prop : pas de props-drilling, et l'ajout d'un champ ne touche
qu'un fichier.

### 2.3 Trois registres, et pourquoi

Un schéma zod et une fonction ne franchissent pas la frontière RSC : une page
Server Component ne peut pas passer une `QuoteFormDefinition` en prop à un
composant client. D'où une séparation en trois modules, chacun avec un seul
consommateur :

| Module | Contenu | Consommateurs |
|---|---|---|
| `core/meta.ts` | slug, titre, chapô, description meta, image — sérialisable | hub `/devis`, `generateStaticParams`, `generateMetadata`, `sitemap.ts` |
| `core/definitions.ts` | slug → `QuoteFormDefinition` (schéma, summary) | Server Action uniquement |
| `components/quotes/quote-forms.tsx` | `"use client"`, slug → composant de formulaire | la page, via un petit `QuoteFormBySlug` |

```ts
export const quoteFormsMeta = {
  "assistance-voyage": { … },
} as const satisfies Record<string, QuoteFormMeta>

export type QuoteSlug = keyof typeof quoteFormsMeta
```

Le typage générique s'arrête à la frontière : `submitQuoteRequest` reçoit
`(slug: QuoteSlug, values: unknown)` et récupère le type en parsant avec le
schéma de la définition. `unknown` en entrée est la signature honnête — les
données viennent du réseau — et évite toute gymnastique de variance dans le
registre.

`definition.ts` ne contient aucun JSX, afin que le graphe d'import de la Server
Action ne tire pas les composants client.

### 2.4 Route

`src/app/(app)/devis/[produit]/page.tsx` :

- `generateStaticParams()` renvoie les clés de `quoteFormsMeta`
- `export const dynamicParams = false` — tout slug inconnu donne un 404
- `generateMetadata()` construit titre, description et `alternates.canonical`
  depuis `quoteFormsMeta`
- `params` est un `Promise` dans cette version de Next : `const { produit } = await params`
- rendu : `PageHeader` (cohérent avec le reste du site) + `<QuoteFormBySlug slug={produit} />`

`src/app/(app)/devis/page.tsx` est le hub : une carte par entrée de
`quoteFormsMeta`, plus un texte expliquant que la demande est gratuite et sans
engagement.

Ajouter un produit = un dossier sous `features/quotes/`, une entrée dans chacun
des trois registres. Aucun fichier de route.

### 2.5 Raccordement du reste du site

- `next.config.ts` : redirection permanente `/simulation` → `/devis`. La page
  est supprimée mais l'URL a pu être partagée ; la redirection coûte trois
  lignes.
- `src/components/home/Header.tsx` : réactiver le bloc CTA commenté, libellé
  « Demander un devis », `href="/devis"`.
- `src/components/home/Footer.tsx` : réactiver l'entrée commentée, libellé
  « Demande de devis », `href="/devis"`.
- `src/app/sitemap.ts` : ajouter `/devis` et `/devis/assistance-voyage` à
  `staticRoutes`, et mettre à jour le commentaire d'en-tête qui mentionne
  encore `/simulation`.
- `src/app/robots.ts` : supprimer le commentaire relatif à `/simulation`, devenu
  sans objet. Les pages `/devis` sont indexables, aucune règle à ajouter.

## 3. Validation

### 3.1 Helpers partagés

Deux extractions rendues nécessaires par le second formulaire :

- `src/lib/html.ts` — `escapeHtml`, déplacé depuis
  `src/features/contact/actions.ts`, qui l'importe désormais.
- `src/lib/validation.ts` — le regex `belgianPhone` déplacé depuis
  `src/features/contact/schema.ts`, `parseFrenchDate` et `parseEuroAmount`
  ci-dessous, ainsi que les fabriques de schéma réutilisables par tous les
  produits : `frenchDate(message)`, `birthDate()` (date passée, âge ≤ 120 ans)
  et `euroAmount()`.

```ts
const FRENCH_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/

/** Renvoie null si le format est invalide ou la date inexistante (31/02). */
export function parseFrenchDate(value: string): Date | null {
  const match = FRENCH_DATE.exec(value.trim())
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const day = Number(dd), month = Number(mm), year = Number(yyyy)
  const date = new Date(Date.UTC(year, month - 1, day))
  // `Date` normalise silencieusement le 31/02 en 03/03 : on compare les
  // composantes pour rejeter ces dates.
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null
}
```

Les comparaisons « passé » et « futur » se font en UTC à la journée. La Belgique
étant en UTC+1/+2, une saisie faite entre minuit et 2 h peut être jugée d'un
jour trop tolérante — jamais trop stricte. C'est le bon sens de l'erreur.

### 3.2 Schéma assistance voyage

Syntaxe zod v4 avec messages `{ error: "…" }`, comme dans
`src/features/contact/schema.ts`.

```ts
export const genders = ["M", "F"] as const
export const destinations = ["europe", "world-except-na-carib", "world"] as const
export const coverageDurations = ["annual", "period"] as const
```

Libellés français exportés en regard de chaque énumération
(`destinationLabels`, etc.), consommés par les cartes radio **et** par
`summary.ts` — écrits une seule fois.

```ts
const personSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName:  z.string().trim().min(2).max(50),
  birthDate: birthDate(),          // JJ/MM/AAAA, passée, âge <= 120
  gender:    z.enum(genders, { error: "Veuillez sélectionner un genre." }),
})

export const assistanceVoyageSchema = z.object({
  // Étape 1
  destination:      z.enum(destinations, { error: "Veuillez choisir une destination." }),
  coverageDuration: z.enum(coverageDurations, { error: "Veuillez choisir une durée." }),
  periodStart: z.string().trim().optional(),
  periodEnd:   z.string().trim().optional(),
  tripValue:   euroAmount(),
  insureVehicle: z.boolean(),
  vehicleFirstRegistration: z.string().trim().optional(),

  // Étape 2
  insureHolder: z.boolean(),
  additionalInsured: z.array(personSchema).max(4),

  // Étape 3
  holder: personSchema.extend({
    street:       z.string().trim().min(2).max(100),
    streetNumber: z.string().trim().min(1).max(20),
    postalCode:   z.string().trim().regex(/^\d{4}$/, { error: "Code postal belge invalide (4 chiffres)." }),
    city:         z.string().trim().min(2).max(80),
  }),

  // Étape 4
  email:   z.email({ error: "Adresse e-mail invalide." }),
  phone:   z.union([z.literal(""), z.string().trim().regex(belgianPhone, { error: "Numéro de téléphone invalide." })]).optional(),
  message: z.string().trim().max(1000).optional(),
  consent: z.literal(true, { error: "Veuillez accepter le traitement de vos données." }),
  honeypot: z.string().optional(),
}).superRefine((values, ctx) => { /* règles conditionnelles, cf. 3.3 */ })
```

**Montants.** `euroAmount()` est un champ texte, pas un `z.number()` : un
`<input>` vide converti en nombre donne `NaN`, et les utilisateurs belges
écrivent aussi bien `2500` que `2 500,50`. Le schéma valide
`/^\d{1,7}([.,]\d{1,2})?$/` après suppression des espaces, et un helper
`parseEuroAmount` produit la valeur numérique pour l'affichage dans le
récapitulatif et l'e-mail.

### 3.3 Règles conditionnelles

Portées par `superRefine`, avec un `path` explicite pour que l'erreur s'affiche
sur le bon champ :

1. `coverageDuration === "period"` → `periodStart` requis, valide, non passé ;
   `periodEnd` requis, valide, strictement postérieur à `periodStart`.
2. `insureVehicle === true` → `vehicleFirstRegistration` requis, valide, non
   futur.
3. `insureHolder === false && additionalInsured.length === 0` → erreur sur
   `insureHolder` : « Il faut au moins une personne assurée. » Règle métier
   absente du questionnaire d'origine, mais une demande sans aucun assuré n'a
   pas de sens.

### 3.4 Validation par étape

`useForm({ resolver: zodResolver(schema), defaultValues, mode: "onTouched" })`.

« Suivant » appelle `await trigger(step.fields, { shouldFocus: true })` et
n'avance qu'en cas de succès. `zodResolver` valide le schéma entier puis filtre
les erreurs sur les champs demandés : les erreurs issues de `superRefine`
portant un `path` sont donc bien rattrapées par l'étape concernée, et une erreur
visant un champ d'une étape ultérieure ne bloque pas l'étape courante — c'est le
comportement voulu.

Seule l'étape 5 soumet réellement, via `handleSubmit`. Les boutons de navigation
sont en `type="button"`, et le `<form>` intercepte la touche Entrée pour faire
avancer d'une étape au lieu de soumettre.

Au changement d'étape : défilement en haut du formulaire et focus sur le titre
de l'étape (`<h2 tabIndex={-1}>`), pour que les lecteurs d'écran annoncent le
nouveau contexte.

### 3.5 Nettoyage des champs conditionnels

Quand une question O/N repasse à « Non », les champs qu'elle contrôle sont
réinitialisés (`setValue(..., "", { shouldValidate: false })`), et le tableau
`additionalInsured` est vidé. Sans cela, une réponse abandonnée resterait dans
l'état du formulaire et partirait dans l'e-mail.

## 4. Envoi

### 4.1 Server Action

`submitQuoteRequest(slug: QuoteSlug, values: unknown)`, dans
`src/features/quotes/core/action.ts`, reprend la chaîne éprouvée de
`submitContactForm` :

1. Résolution de la définition dans `quoteDefinitions` ; slug inconnu → échec.
2. `definition.schema.safeParse(values)` — revalidation serveur intégrale.
3. Honeypot rempli → `{ success: true }` sans rien envoyer.
4. `checkRateLimit(\`quote:${slug}:${ip}\`, { max: 3, windowMs: 10 * 60_000 })`,
   IP lue dans `x-forwarded-for`.
5. Destinataire : `process.env.QUOTE_EMAIL_TO ?? process.env.CONTACT_EMAIL_TO` ;
   absent → message d'erreur invitant à téléphoner.
6. `definition.summary(data)` → rendu texte et HTML par `core/email.ts`.
7. `sendMail` vers l'agence, `replyTo` = e-mail du prospect, sujet donné par
   `definition.emailSubject(data)`.
8. `sendMail` de l'accusé de réception vers `definition.recipientEmail(data)`,
   **dans son propre `try/catch`** : un accusé qui échoue est journalisé et
   ignoré. La demande est reçue par l'agence, le prospect ne doit pas être
   invité à recommencer.
9. `{ success: true }`.

### 4.2 Rendu des e-mails

`core/email.ts` transforme un `SummarySection[]` en texte brut et en HTML,
chaque valeur passée par `escapeHtml`. Aucune connaissance du produit : ajouter
un formulaire n'y touche pas.

`summary.ts` est écrit une fois par produit et alimente trois consommateurs —
l'écran récapitulatif, l'e-mail agence, l'accusé de réception. Les libellés ne
peuvent pas diverger.

Une nouvelle variable d'environnement optionnelle, `QUOTE_EMAIL_TO`, permet de
router les devis vers une autre adresse que le formulaire de contact. Le dépôt
n'a pas de `.env.example` ; la variable est simplement ajoutée à `.env.local`
et à la configuration de l'hébergeur. Elle reste facultative : sans elle, les
devis arrivent sur `CONTACT_EMAIL_TO`, déjà configurée.

## 5. Composants d'interface à créer

Aucune dépendance nouvelle : `radix-ui` (paquet unifié) est déjà installé et
c'est le style d'import du dossier `ui/` (`import { Select as SelectPrimitive } from "radix-ui"`).

- `src/components/ui/checkbox.tsx` — consentement RGPD (`Checkbox` de `radix-ui`)
- `src/components/ui/radio-group.tsx` — socle des cartes radio et du choix de genre
- `src/components/ui/progress.tsx` — barre de progression mobile

`OptionCardGroup` et `BooleanField` sont des habillages de `RadioGroup` : cible
tactile large, bordure et fond `primary/5` à l'état sélectionné, cohérents avec
les encarts d'icônes de `/services/particuliers`.

`MaskedDateField` : `<input type="text" inputMode="numeric" placeholder="JJ/MM/AAAA">`,
insertion automatique des `/` à la saisie, `maxLength={10}`, valeur stockée
telle quelle et convertie par le schéma. Un `<input type="date">` reste utilisé
là où il est bon — dates de voyage et mise en circulation, proches du présent,
où le calendrier natif aide — mais pas pour une date de naissance, dont le
défilement des années est pénible.

## 6. Tests

Vitest est ajouté en dépendance de développement, avec `vitest.config.ts`
déclarant l'alias `@` → `./src`, et les scripts `test` (`vitest run`) et
`test:watch`. La portée est volontairement étroite : le code pur et à forte
valeur de régression.

- `src/lib/validation.test.ts` — `parseFrenchDate` (formats invalides, 31/02,
  années bissextiles), `belgianPhone`, `parseEuroAmount`.
- `src/features/quotes/assistance-voyage/schema.test.ts` — chaque règle de
  `superRefine` dans ses deux sens, le code postal, la borne des 4 assurés
  supplémentaires, le rejet d'une date de naissance future.
- `src/features/quotes/assistance-voyage/summary.test.ts` — un dossier complet
  produit les sections attendues ; les champs conditionnels absents ne
  produisent pas de ligne vide.

Pas de test de rendu : aucune infrastructure de test de composants n'existe, et
l'introduire dépasse la portée de ce travail. La navigation entre étapes est
couverte par la checklist de QA manuelle.

## 7. Ce qui est explicitement hors périmètre

- Aucune persistance en base ni dans Sanity : la demande part par e-mail. Un
  back-office de suivi est un projet distinct, avec ses propres questions de
  rétention RGPD.
- Aucun calcul de prime ni tarification : c'est une demande de devis, pas un
  comparateur.
- Aucun formulaire pour les autres couvertures. Le moteur est conçu pour les
  accueillir ; ils feront l'objet de leurs propres spécifications de contenu.
- Aucune reprise de brouillon entre appareils : `localStorage` est local au
  navigateur, et c'est suffisant.

## 8. Vérification

- `npm run lint` et `npm run build` sans erreur
- `npm run test` au vert
- QA manuelle : parcours complet sur mobile et desktop ; retour arrière depuis
  le récapitulatif ; rechargement en cours de saisie puis reprise du brouillon ;
  bascule d'une question O/N sur « Non » après avoir rempli ses champs, en
  vérifiant que l'e-mail reçu n'en porte pas trace ; envoi avec les quatre
  assurés supplémentaires ; navigation entière au clavier
- `node scripts/check-redirects.mjs` — la redirection `/simulation` → `/devis`
  n'y figure pas (le script couvre les URL WordPress), mais elle est vérifiée
  manuellement
