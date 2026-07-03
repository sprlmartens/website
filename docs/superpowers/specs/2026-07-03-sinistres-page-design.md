# /sinistres page — design

## Purpose

Give a client in an emergency (accident, breakdown, water damage) the phone
number they need in seconds, without depending on Martens Assurances being
reachable first. Reframe Martens' value as the follow-up (dossier, expertise,
indemnisation), not the first call.

## Current state

`src/app/(app)/sinistres/page.tsx` renders the `Claims` component
(`src/components/home/Claims.tsx`), which is also embedded on the homepage.
This design replaces that on the `/sinistres` route with a dedicated,
reference-style page. `Claims` itself is untouched and stays on the homepage.

## Page structure

Four sections, top to bottom:

1. **PageHeader** — reuse `@/components/PageHeader` (same pattern as
   `/services`, `/contact`).
2. **Explainer** — "Qu'est-ce qu'un assisteur ?" — light background, plain
   text, no card treatment.
3. **Assisteurs list** — beige (`bg-secondary`) block with all 8 rows
   (7 assisteurs, Allianz split into 2 numbers), alphabetical, each a full-row
   `tel:` link.
4. **Closing CTA** — navy (`bg-primary`) block bridging to Martens' role in
   the follow-up, with a `tel:`/contact CTA button.

## Copy

### 1. PageHeader

- Eyebrow: `En cas de sinistre`
- Title: `Le bon réflexe, tout de suite.`
- Description: `Panne, accident, dégât des eaux : n'attendez pas notre feu
  vert. Contactez directement l'assisteur repris sur votre contrat,
  disponible 24h/24. Nous reprenons le dossier avec vous juste après.`

### 2. Explainer

- Heading: `Qu'est-ce qu'un assisteur ?`
- Body: `Votre contrat d'assurance (auto, habitation) inclut souvent une
  couverture assistance, gérée par une société spécialisée : l'assisteur.
  C'est elle qui organise le remorquage, le dépannage, le logement d'urgence
  ou l'envoi d'un plombier — 24h/24 et 7j/7, sans devoir passer par nous.`
- Identification note: `Retrouvez le nom de votre assisteur sur votre carte
  verte, votre police d'assurance ou votre certificat d'assistance. En cas de
  doute, appelez-nous : nous vérifions votre contrat en quelques minutes.`

### 3. Assisteurs list

Heading: `Les numéros à connaître`

Rows, alphabetical by assisteur name, phone numbers formatted with dots as
given by the client:

| Assisteur                              | Téléphone       |
| --------------------------------------- | --------------- |
| Aedes Assistance                        | 04.340.56.23    |
| Allianz Assistance — Assistance Médicale| 02.290.61.00    |
| Allianz Assistance — Assistance Véhicule| 02.773.62.61    |
| ASSUDIS                                 | 02.888.10.85    |
| AXA Assistance                          | 02.550.05.55    |
| Baloise Assistance                      | 03.870.95.70    |
| Europ Assistance                        | 02.533.75.75    |
| Vivium Assistance                       | 02.406.30.00    |

Each number renders as `<a href="tel:+32...">`, full row tappable.

### 4. Closing CTA

- Heading: `Et après l'urgence ?`
- Body: `Une fois l'assisteur prévenu, le plus dur est fait. Contactez-nous
  pour la suite : déclaration, expertise, suivi du dossier jusqu'à
  l'indemnisation. C'est notre métier.`
- CTA: `Nous contacter` → `tel:+3242461363` (existing Martens number, same as
  used in `Contact.tsx` and `Claims.tsx`)

## Visual design

- **PageHeader**: standard existing component, no changes needed.
- **Explainer**: plain white/background section, `container py-16`, single
  column, `max-w-2xl`. Body paragraph in default foreground; identification
  note in `text-muted-foreground`, slightly smaller.
- **Assisteurs list**: `bg-secondary` section (beige, matches existing
  `--secondary` token). Rows styled like the `dl` block in `Contact.tsx`:
  `border-t border-foreground/10` between rows, assisteur name in
  `text-foreground`, phone number in `text-primary font-semibold` as the
  link. Full row wrapped in the `<a>` for a large mobile tap target.
- **Closing CTA**: `bg-primary text-primary-foreground` (navy, white text)
  section, `container py-20`. Heading + body copy, then a `Button` (from
  `@/components/ui/button`) styled like the existing Claims CTA (`variant="ghost"`,
  white border, hover fills white/inverts text) linking to `tel:+3242461363`.

## Components

- No new shared/reusable component required beyond what's needed for this
  page — build directly in
  `src/app/(app)/sinistres/page.tsx`, or extract a single
  `src/components/sinistres/AssisteursList.tsx` if the JSX for the list
  section gets unwieldy. Reuses: `PageHeader`, `Button`.
- `Claims` component (`src/components/home/Claims.tsx`) is not modified and
  is not rendered on this page anymore.

## Out of scope

- No mapping of assisteur → underlying insurer/product (not available).
- No search/filter UI (list of 8 rows doesn't need it).
- No changes to the homepage `Claims` section or its CTA link target.
- No changes to metadata beyond what already exists in the page file
  (title/description already appropriate, can be reused as-is or lightly
  adjusted to match new content).
