# Formulaire de contact — page /contact refondue

## Contexte

La page `/contact` affiche actuellement le même composant `Contact` que la
section homepage (adresse, téléphone, horaires, carte Google Maps), sans
formulaire. Le stub `src/features/contact/schema.ts` existe mais est vide.

Objectif : refondre `/contact` avec un formulaire de contact (prénom, nom,
email, téléphone, intention, message), et enrichir les informations
affichées (pas de fermeture annuelle, accessibilité/parking). La section
homepage existante (`src/components/home/Contact.tsx`) reste inchangée.

## Architecture

```
src/lib/
  mailer.ts            # transport Nodemailer/SMTP générique, réutilisable
  rate-limit.ts         # rate limit générique en mémoire, par clé, réutilisable

src/features/contact/
  schema.ts            # schéma zod partagé client/serveur (rempli, était vide)
  actions.ts            # 'use server' — submitContactForm(data)

src/components/contact/
  ContactForm.tsx        # composant client (RHF + zodResolver + sonner)
  ContactInfo.tsx         # colonne d'infos étendue (adresse, horaires, parking, etc.)

src/app/(app)/contact/page.tsx  # page refondue : 2 colonnes + carte en bas
```

### Flux de soumission

1. `ContactForm` (Client Component) valide les champs avec React Hook Form +
   `zodResolver(contactSchema)` — feedback immédiat, champ par champ.
2. À la soumission, le composant appelle directement `submitContactForm`
   (Server Action importée, pas via l'attribut `action` du `<form>`) dans un
   `useTransition`, pour gérer l'état `pending` sans dépendre de
   `useActionState`.
3. `submitContactForm` (dans `src/features/contact/actions.ts`) :
   - revalide les données avec le même `contactSchema` (ne jamais faire
     confiance au client) ;
   - vérifie le champ honeypot — s'il est rempli, retourne un faux succès
     sans rien envoyer ;
   - vérifie le rate limit par IP visiteur (`checkRateLimit`) — si dépassé,
     retourne une erreur ;
   - envoie l'email via `sendMail` (`src/lib/mailer.ts`) ;
   - retourne `{ success: true }` ou `{ success: false, error: string }`.
4. Le client affiche un toast Sonner (succès ou erreur) et réinitialise le
   formulaire en cas de succès.

## Schéma de validation (`src/features/contact/schema.ts`)

| Champ       | Règle                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------- |
| `firstName` | requis, 2–50 caractères                                                                           |
| `lastName`  | requis, 2–50 caractères                                                                           |
| `email`     | requis, format email valide                                                                       |
| `phone`     | optionnel ; si rempli, format belge basique (`+32` ou `0` suivi de 8-9 chiffres, espaces tolérés) |
| `intent`    | requis, enum `["assurance", "placement", "sinistre", "autre"]`                                    |
| `message`   | requis, 10–2000 caractères                                                                        |
| `honeypot`  | champ caché (nom anodin, ex. `website`), doit rester vide                                         |

Le honeypot fait partie du schéma zod (optionnel côté validation utilisateur,
vérifié séparément côté serveur) et du `<Input>` masqué visuellement
(`sr-only`, `tabIndex={-1}`, `autoComplete="off"`) dans le formulaire.

## Composants shadcn

Déjà installés : `Field`, `Label`, `Input`, `Select`, `Button`, `Alert`,
`Separator`.

## Anti-spam (`src/lib/rate-limit.ts`)

Utilitaire générique, réutilisable par d'autres features :

```ts
checkRateLimit(key: string, options: { max: number; windowMs: number }): boolean
```

Implémentation : `Map<string, number[]>` en mémoire du process (timestamps
des tentatives par clé), fenêtre glissante. Utilisé dans
`submitContactForm` avec l'IP du visiteur comme clé (`headers().get(
'x-forwarded-for')`), limite de 3 soumissions / 10 minutes.

**Limite connue** : sur hébergement serverless (Vercel), la mémoire du
process peut être réinitialisée entre invocations (cold start), donc la
limite n'est pas garantie à 100 %. C'est un filtre "best effort" contre les
bots simples, pas une protection béton contre un spammeur déterminé. Si
besoin d'une protection plus forte, ajouter Cloudflare Turnstile plus tard.

Le honeypot est vérifié en premier ; s'il est rempli, l'action retourne un
faux succès (sans envoyer l'email ni consommer la limite de rate limit) —
pour ne pas indiquer au bot qu'il a été détecté.

## Envoi d'email (`src/lib/mailer.ts`)

Transport Nodemailer SMTP générique (pas nommé "Brevo" spécifiquement, pour
rester réutilisable si le fournisseur change) :

```ts
sendMail(options: { to: string; subject: string; text: string; html: string; replyTo?: string }): Promise<void>
```

Configuré via variables d'environnement génériques, ajoutées (vides) à
`.env.local` — à compléter par l'utilisateur avec les identifiants SMTP
Brevo réels :

```
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
CONTACT_EMAIL_TO=assurances@sprlmartens.be
```

`submitContactForm` appelle `sendMail` avec :

- `to`: `CONTACT_EMAIL_TO`
- `subject`: `Nouvelle demande de contact — {intent}`
- `text`/`html`: reprend tous les champs du formulaire
- `replyTo`: l'email du visiteur (pour pouvoir répondre directement depuis
  la boîte mail)

## Page /contact refondue

Layout 2 colonnes (comme la section homepage actuelle), avec la carte
Google Maps ajoutée en pleine largeur en dessous :

**Colonne gauche — `ContactInfo`** (étend le contenu actuel de
`Contact.tsx`) :

- Adresse
- Téléphone / email
- Horaires (réutilise la frise horaire existante)
- **Nouveau** : "Pas de période de fermeture annuelle"
- **Nouveau** : bloc accessibilité — "Place de parking réservée aux clients"

**Colonne droite — `ContactForm`** : prénom, nom, email, téléphone, select
intention (Assurance / Placement / Sinistre / Autre), message, bouton
"Envoyer".

**En dessous, pleine largeur** : carte Google Maps (iframe, identique à
celle de la home).

La section homepage (`src/components/home/Contact.tsx`) reste inchangée ;
elle continue de renvoyer vers `/contact` via l'ancre `#contact` ou un lien
dédié existant.

## Feedback utilisateur

- Succès : toast Sonner "Merci, nous revenons vers vous rapidement." +
  formulaire réinitialisé.
- Erreur (validation serveur, échec SMTP, rate limit dépassé) : toast
  d'erreur explicite, formulaire conservé avec les données saisies.
- Pendant l'envoi : bouton "Envoyer" désactivé + état de chargement
  (`useTransition` pending).

## Hors scope

- Pas de captcha externe (Turnstile/reCAPTCHA) pour cette itération.
- Pas de stockage des demandes en base de données ou dans Sanity — l'email
  est le seul canal de réception.
- Pas de confirmation par email envoyée au visiteur (uniquement l'email
  interne vers `assurances@sprlmartens.be`, avec `replyTo` sur le
  visiteur).
