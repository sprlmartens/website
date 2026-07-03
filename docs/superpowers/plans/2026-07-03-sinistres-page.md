# /sinistres Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `Claims` homepage-teaser component on `/sinistres` with a
dedicated reference page that lets a client find their assisteur's phone
number immediately, then bridges back to Martens for the claim follow-up.

**Architecture:** A single Next.js server component page
(`src/app/(app)/sinistres/page.tsx`) composed of the existing `PageHeader`
component, a new `AssisteursList` component holding the static data + list
markup, and inline JSX for the explainer and closing-CTA sections. No new
routes, no client-side state, no data fetching.

**Tech Stack:** Next.js (App Router, React Server Components), Tailwind CSS
v4 (design tokens in `src/app/(app)/globals.css`), existing `Button`
component (`@/components/ui/button`), existing `PageHeader` component
(`@/components/PageHeader`).

## Global Constraints

- Reuse `@/components/PageHeader` and `@/components/ui/button` — do not
  create new header or button primitives.
- `src/components/home/Claims.tsx` must not be modified and must no longer be
  rendered on `/sinistres` (it stays on the homepage only).
- All copy is French, matching the exact wording in the spec
  (`docs/superpowers/specs/2026-07-03-sinistres-page-design.md`).
- Phone numbers render as `tel:` links using the international format
  (`+32...`, no spaces/dots) in `href`, while the visible text keeps the
  dotted format from the spec (e.g. `04.340.56.23`).
- Assisteurs list background is `bg-secondary` (beige) with `text-primary`
  phone numbers — explicitly not the navy/`bg-navy-900` treatment used by
  `Claims`/`Contact`.
- Closing CTA section is `bg-primary text-primary-foreground` (navy, white
  text).
- No test framework exists in this repo (`package.json` has no test script).
  Verification is via `npx tsc --noEmit`, `npm run lint`, and manual check in
  the dev server — do not introduce a new test runner for this task.

---

### Task 1: Assisteurs data + list component

**Files:**
- Create: `src/components/sinistres/AssisteursList.tsx`

**Interfaces:**
- Produces: `export default function AssisteursList()` — a self-contained
  section component, no props. Renders a `<section>` with `bg-secondary`.

- [ ] **Step 1: Create the component file with data and markup**

```tsx
// src/components/sinistres/AssisteursList.tsx
type Assisteur = {
  name: string
  phoneDisplay: string
  phoneHref: string
}

const assisteurs: Assisteur[] = [
  {
    name: "Aedes Assistance",
    phoneDisplay: "04.340.56.23",
    phoneHref: "tel:+3243405623",
  },
  {
    name: "Allianz Assistance — Assistance Médicale",
    phoneDisplay: "02.290.61.00",
    phoneHref: "tel:+3222906100",
  },
  {
    name: "Allianz Assistance — Assistance Véhicule",
    phoneDisplay: "02.773.62.61",
    phoneHref: "tel:+3227736261",
  },
  {
    name: "ASSUDIS",
    phoneDisplay: "02.888.10.85",
    phoneHref: "tel:+3228881085",
  },
  {
    name: "AXA Assistance",
    phoneDisplay: "02.550.05.55",
    phoneHref: "tel:+3225500555",
  },
  {
    name: "Baloise Assistance",
    phoneDisplay: "03.870.95.70",
    phoneHref: "tel:+3238709570",
  },
  {
    name: "Europ Assistance",
    phoneDisplay: "02.533.75.75",
    phoneHref: "tel:+3225337575",
  },
  {
    name: "Vivium Assistance",
    phoneDisplay: "02.406.30.00",
    phoneHref: "tel:+3224063000",
  },
]

export default function AssisteursList() {
  return (
    <section className="bg-secondary">
      <div className="container py-16 lg:py-20">
        <h2 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Les numéros à connaître
        </h2>
        <dl className="mt-8 max-w-2xl">
          {assisteurs.map((assisteur) => (
            <div
              key={assisteur.name}
              className="border-t border-foreground/10 first:border-t-0"
            >
              <a
                href={assisteur.phoneHref}
                className="flex items-center justify-between gap-4 py-4 text-sm sm:text-base"
              >
                <dt className="text-foreground">{assisteur.name}</dt>
                <dd className="shrink-0 font-semibold text-primary">
                  {assisteur.phoneDisplay}
                </dd>
              </a>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check the new file**

Run: `npx tsc --noEmit`
Expected: no errors reported for `src/components/sinistres/AssisteursList.tsx`

- [ ] **Step 3: Lint the new file**

Run: `npm run lint`
Expected: no errors/warnings for `src/components/sinistres/AssisteursList.tsx`

- [ ] **Step 4: Commit**

```bash
git add src/components/sinistres/AssisteursList.tsx
git commit -m "feat: add AssisteursList component for /sinistres page"
```

---

### Task 2: Build the /sinistres page

**Files:**
- Modify: `src/app/(app)/sinistres/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` from `@/components/PageHeader`
  (`{ eyebrow: string; title: ReactNode; description?: string }`);
  `AssisteursList` default export from `@/components/sinistres/AssisteursList`
  (no props); `Button` from `@/components/ui/button`
  (`{ asChild?: boolean; variant?: ...; size?: ...; className?: string }`
  wrapping a `Link`/`a` child, per existing usage in
  `src/components/home/Claims.tsx:70-77`).

- [ ] **Step 1: Replace the page contents**

Replace the full contents of `src/app/(app)/sinistres/page.tsx`:

```tsx
import Link from "next/link"

import { PageHeader } from "@/components/PageHeader"
import AssisteursList from "@/components/sinistres/AssisteursList"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Sinistres — Martens Assurances",
  description:
    "En cas de sinistre, contactez directement votre assisteur : les numéros de tous les assisteurs, disponibles 24h/24.",
}

export default function Page() {
  return (
    <main>
      <PageHeader
        eyebrow="En cas de sinistre"
        title="Le bon réflexe, tout de suite."
        description="Panne, accident, dégât des eaux : n'attendez pas notre feu vert. Contactez directement l'assisteur repris sur votre contrat, disponible 24h/24. Nous reprenons le dossier avec vous juste après."
      />

      <section className="bg-background">
        <div className="container max-w-2xl py-16 lg:py-20">
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Qu&rsquo;est-ce qu&rsquo;un assisteur ?
          </h2>
          <p className="mt-6 text-base leading-relaxed text-foreground">
            Votre contrat d&rsquo;assurance (auto, habitation) inclut souvent
            une couverture assistance, gérée par une société spécialisée :
            l&rsquo;assisteur. C&rsquo;est elle qui organise le remorquage, le
            dépannage, le logement d&rsquo;urgence ou l&rsquo;envoi
            d&rsquo;un plombier — 24h/24 et 7j/7, sans devoir passer par nous.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Retrouvez le nom de votre assisteur sur votre carte verte, votre
            police d&rsquo;assurance ou votre certificat d&rsquo;assistance.
            En cas de doute, appelez-nous : nous vérifions votre contrat en
            quelques minutes.
          </p>
        </div>
      </section>

      <AssisteursList />

      <section className="bg-primary text-primary-foreground">
        <div className="container py-20">
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Et après l&rsquo;urgence ?
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/90">
            Une fois l&rsquo;assisteur prévenu, le plus dur est fait.
            Contactez-nous pour la suite : déclaration, expertise, suivi du
            dossier jusqu&rsquo;à l&rsquo;indemnisation. C&rsquo;est notre
            métier.
          </p>
          <div className="mt-8">
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="inline-flex items-center border border-primary-foreground/30 text-sm font-semibold text-primary-foreground transition-colors hover:border-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link href="tel:+3242461363">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Type-check the page**

Run: `npx tsc --noEmit`
Expected: no errors reported for `src/app/(app)/sinistres/page.tsx`

- [ ] **Step 3: Lint the page**

Run: `npm run lint`
Expected: no errors/warnings for `src/app/(app)/sinistres/page.tsx`

- [ ] **Step 4: Manual check in the dev server**

Run: `npm run dev` (leave running), then open
`http://localhost:3000/sinistres` in a browser.

Verify:
- PageHeader renders with the eyebrow/title/description above.
- Explainer section renders both paragraphs.
- Assisteurs list renders 8 rows on a beige background, alphabetically
  ordered (Aedes, Allianz Médicale, Allianz Véhicule, ASSUDIS, AXA, Baloise,
  Europ Assistance, Vivium), each row's phone number is a clickable `tel:`
  link (inspect href in devtools, e.g. AXA row → `tel:+3225500555`).
- Closing CTA section renders on a navy background with white text and a
  "Nous contacter" button linking to `tel:+3242461363`.
- The homepage (`/`) still renders the original navy `Claims` section
  unchanged (Claims.tsx was not modified).

Stop the dev server after verifying (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/sinistres/page.tsx"
git commit -m "feat: build dedicated /sinistres page with assisteurs list"
```
