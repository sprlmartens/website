# PageHeader Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate `PageHeader` (the banner at the top of 7 pages) from a flat text-only panel to an editorial, "financial institution"-grade banner with an optional duotone photo, an accent kicker rule, a subtle background texture, and staggered entrance motion — matching the visual bar already set by the homepage `Hero`.

**Architecture:** `PageHeader` gains one new optional prop, `image: { src, alt }`. When present, the banner renders a two-column layout (text left, duotone photo right on `lg:`) reusing the exact grid pattern `Hero` already established. When absent, it falls back to the plain, but still visually elevated, text-only banner. A new `page-header-grid` CSS utility (alongside the existing `duotone`, `pen-underline`, `rule-sweep` utilities in `globals.css`) supplies the background texture. All 7 existing call sites are updated to pass a themed `image`.

**Tech Stack:** Next.js (App Router), React 19, Tailwind v4 (`@theme`/`@utility` CSS), `next/image`.

## Global Constraints

- `image` prop is optional and backward compatible — no call site is required to pass it, and existing behavior for `eyebrow`/`title`/`description` is unchanged.
- Reuse existing brand utilities/tokens only: `duotone`, `rise`/`rise-1`/`rise-2`, `--color-navy-900`, `--color-accent`, `font-display`. Do not invent new color tokens.
- Photo column follows `Hero`'s exact responsive rule: `hidden` below `lg:`, visible at `lg:` and up.
- No floating stat/badge card on `PageHeader` — that stays a `Hero`-exclusive device (per spec).
- No breadcrumb navigation (out of scope per spec).
- All image `alt` text is in French, matching the rest of the site's copy.

---

### Task 1: Add the `page-header-grid` background utility

**Files:**
- Modify: `src/app/(app)/globals.css` (append to the "Editorial utilities" section, after the existing `rule-sweep` utility block and before the "Motion" section)

**Interfaces:**
- Produces: CSS utility class `page-header-grid`, consumed by `PageHeader.tsx` in Task 2.

- [ ] **Step 1: Add the utility**

Open `src/app/(app)/globals.css` and find this block:

```css
/* Hover link: red rule sweeps in from the left */
@utility rule-sweep {
  position: relative;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -1.5px;
    height: 1px;
    width: 100%;
    background: var(--color-accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  &:hover::after,
  &:focus-visible::after {
    transform: scaleX(1);
  }
}

/* ---- Motion ---- */
```

Insert a new utility between `rule-sweep` and the `/* ---- Motion ---- */` comment:

```css
/* Fine dot-grid texture for page banners: a quiet precision cue */
@utility page-header-grid {
  background-image: radial-gradient(
    var(--color-navy-900) 1px,
    transparent 1px
  );
  background-size: 18px 18px;
  opacity: 0.06;
}

/* ---- Motion ---- */
```

- [ ] **Step 2: Verify the file parses**

Run: `npm run lint`
Expected: no new errors related to `globals.css` (CSS isn't linted by ESLint, so this mainly confirms the lint command itself still runs cleanly — a syntax error in the CSS would instead surface in Task 2's dev-server check).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/globals.css"
git commit -m "Add page-header-grid background utility"
```

---

### Task 2: Rewrite `PageHeader` with the `image` prop and elevated styling

**Files:**
- Modify: `src/components/PageHeader.tsx` (full rewrite)

**Interfaces:**
- Consumes: `page-header-grid` utility (Task 1), `duotone` utility (existing, `globals.css`), `rise`/`rise-1`/`rise-2` utilities (existing, `globals.css`).
- Produces:
  ```ts
  type PageHeaderImage = { src: string; alt: string }

  function PageHeader(props: {
    eyebrow: string
    title: ReactNode
    description?: string
    image?: PageHeaderImage
  }): JSX.Element
  ```
  Consumed by all 7 call sites in Tasks 3–9.

- [ ] **Step 1: Replace the component**

Replace the full contents of `src/components/PageHeader.tsx` with:

```tsx
import type { ReactNode } from "react"
import Image from "next/image"

type PageHeaderImage = {
  src: string
  alt: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  image?: PageHeaderImage
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-secondary/40">
      <div
        aria-hidden
        className="page-header-grid pointer-events-none absolute inset-0"
      />
      <div
        className={`container relative grid grid-cols-1 items-center gap-10 py-20 lg:py-28 ${
          image ? "lg:grid-cols-12 lg:gap-8" : ""
        }`}
      >
        <div className={image ? "lg:col-span-7" : undefined}>
          <p className="rise flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden className="h-0.5 w-6 bg-accent" />
            {eyebrow}
          </p>
          <h1 className="rise-1 mt-6 max-w-3xl font-display text-5xl font-medium leading-tight tracking-tight text-foreground sm:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="rise-2 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {image ? (
          <div className="rise-2 hidden lg:col-span-5 lg:block">
            <figure className="duotone relative ml-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </figure>
          </div>
        ) : null}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify types and lint**

Run: `npm run lint`
Expected: no errors in `src/components/PageHeader.tsx`.

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 3: Visual check with no `image` (backward-compat path)**

Run: `npm run dev`, then open `http://localhost:3000/simulation` (this call site is updated last, in Task 9, so right now it still renders without an `image` prop).
Expected: banner renders full-width text, no broken layout, no console errors, dot-grid texture faintly visible, eyebrow shows the small accent dash.

- [ ] **Step 4: Commit**

```bash
git add src/components/PageHeader.tsx
git commit -m "Redesign PageHeader with optional photo, accent kicker, and texture"
```

---

### Task 3: Add image to the `services` page banner

**Files:**
- Modify: `src/app/(app)/services/page.tsx:33-37`

**Interfaces:**
- Consumes: `PageHeader` `image` prop (Task 2).

- [ ] **Step 1: Pass the image**

In `src/app/(app)/services/page.tsx`, replace:

```tsx
      <PageHeader
        eyebrow="Services"
        title="Un conseil pour chaque étape de votre vie."
        description="Que vous protégiez une famille, une activité indépendante ou une épargne, nous comparons le marché et construisons une couverture sur mesure."
      />
```

with:

```tsx
      <PageHeader
        eyebrow="Services"
        title="Un conseil pour chaque étape de votre vie."
        description="Que vous protégiez une famille, une activité indépendante ou une épargne, nous comparons le marché et construisons une couverture sur mesure."
        image={{
          src: "https://images.unsplash.com/photo-1714974528737-3e6c7e4d11af?w=1200&q=80&fm=jpg",
          alt: "Conseiller et client examinant des documents ensemble",
        }}
      />
```

- [ ] **Step 2: Visual check**

Run: `npm run dev`, open `http://localhost:3000/services`.
Expected: duotone photo appears in the right column at `lg:` widths and above; hidden below `lg:`; no layout shift or overflow.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/services/page.tsx"
git commit -m "Add banner photo to services page"
```

---

### Task 4: Add image to the `services/particuliers` page banner

**Files:**
- Modify: `src/app/(app)/services/particuliers/page.tsx:20-24`

**Interfaces:**
- Consumes: `PageHeader` `image` prop (Task 2).

- [ ] **Step 1: Pass the image**

In `src/app/(app)/services/particuliers/page.tsx`, replace:

```tsx
      <PageHeader
        eyebrow="Services · Particuliers & familles"
        title="Protéger ce que vous construisez."
        description="Votre maison, votre voiture, votre famille, votre avenir. Un conseiller unique qui connaît votre dossier et le défend."
      />
```

with:

```tsx
      <PageHeader
        eyebrow="Services · Particuliers & familles"
        title="Protéger ce que vous construisez."
        description="Votre maison, votre voiture, votre famille, votre avenir. Un conseiller unique qui connaît votre dossier et le défend."
        image={{
          src: "https://images.unsplash.com/photo-1758598738327-82de3cb31c56?w=1200&q=80&fm=jpg",
          alt: "Famille dans son salon",
        }}
      />
```

- [ ] **Step 2: Visual check**

Run: `npm run dev`, open `http://localhost:3000/services/particuliers`.
Expected: duotone family photo appears in the right column at `lg:` widths and above.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/services/particuliers/page.tsx"
git commit -m "Add banner photo to services/particuliers page"
```

---

### Task 5: Add image to the `services/independants` page banner

**Files:**
- Modify: `src/app/(app)/services/independants/page.tsx:19-23`

**Interfaces:**
- Consumes: `PageHeader` `image` prop (Task 2).

- [ ] **Step 1: Pass the image**

In `src/app/(app)/services/independants/page.tsx`, replace:

```tsx
      <PageHeader
        eyebrow="Services · Indépendants"
        title="Votre activité repose sur vous. Et vous ?"
        description="Quand on est son propre patron, personne ne cotise à votre place. Nous structurons votre protection et votre pension comme un plan, pas comme une pile de polices."
      />
```

with:

```tsx
      <PageHeader
        eyebrow="Services · Indépendants"
        title="Votre activité repose sur vous. Et vous ?"
        description="Quand on est son propre patron, personne ne cotise à votre place. Nous structurons votre protection et votre pension comme un plan, pas comme une pile de polices."
        image={{
          src: "https://images.unsplash.com/photo-1546514714-df0ccc50d7bf?w=1200&q=80&fm=jpg",
          alt: "Indépendant travaillant à son bureau",
        }}
      />
```

- [ ] **Step 2: Visual check**

Run: `npm run dev`, open `http://localhost:3000/services/independants`.
Expected: duotone photo of a person working appears in the right column at `lg:` widths and above.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/services/independants/page.tsx"
git commit -m "Add banner photo to services/independants page"
```

---

### Task 6: Add image to the `services/placements-epargne` page banner

**Files:**
- Modify: `src/app/(app)/services/placements-epargne/page.tsx:20-24`

**Interfaces:**
- Consumes: `PageHeader` `image` prop (Task 2).

- [ ] **Step 1: Pass the image**

In `src/app/(app)/services/placements-epargne/page.tsx`, replace:

```tsx
      <PageHeader
        eyebrow="Services · Placements & Épargne"
        title="Faire fructifier ce que vous avez construit."
        description="Constituer un capital, préparer sa pension, transmettre un patrimoine : nous comparons les solutions du marché pour bâtir une stratégie d'épargne adaptée à votre profil et à votre horizon."
      />
```

with:

```tsx
      <PageHeader
        eyebrow="Services · Placements & Épargne"
        title="Faire fructifier ce que vous avez construit."
        description="Constituer un capital, préparer sa pension, transmettre un patrimoine : nous comparons les solutions du marché pour bâtir une stratégie d'épargne adaptée à votre profil et à votre horizon."
        image={{
          src: "https://images.unsplash.com/photo-1633158829875-e5316a358c6f?w=1200&q=80&fm=jpg",
          alt: "Pièces et jeune pousse, symbole d'une épargne qui grandit",
        }}
      />
```

- [ ] **Step 2: Visual check**

Run: `npm run dev`, open `http://localhost:3000/services/placements-epargne`.
Expected: duotone photo of coins and a plant appears in the right column at `lg:` widths and above.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/services/placements-epargne/page.tsx"
git commit -m "Add banner photo to services/placements-epargne page"
```

---

### Task 7: Add image to the `a-propos` page banner

**Files:**
- Modify: `src/app/(app)/a-propos/page.tsx:15-19`

**Interfaces:**
- Consumes: `PageHeader` `image` prop (Task 2).

- [ ] **Step 1: Pass the image**

In `src/app/(app)/a-propos/page.tsx`, replace:

```tsx
      <PageHeader
        eyebrow="À propos"
        title="Un courtier indépendant, à taille humaine."
        description="Depuis plus de 20 ans, nous accompagnons les familles, les indépendants et les entreprises dans leurs choix de protection et de placement — avec un seul objectif : votre intérêt, pas celui d'une compagnie."
      />
```

with:

```tsx
      <PageHeader
        eyebrow="À propos"
        title="Un courtier indépendant, à taille humaine."
        description="Depuis plus de 20 ans, nous accompagnons les familles, les indépendants et les entreprises dans leurs choix de protection et de placement — avec un seul objectif : votre intérêt, pas celui d'une compagnie."
        image={{
          src: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=1200&q=80&fm=jpg",
          alt: "Équipe en discussion dans un bureau",
        }}
      />
```

- [ ] **Step 2: Visual check**

Run: `npm run dev`, open `http://localhost:3000/a-propos`.
Expected: duotone team photo appears in the right column at `lg:` widths and above; confirm it reads as visually distinct from the homepage Hero photo when comparing the two pages side by side.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/a-propos/page.tsx"
git commit -m "Add banner photo to a-propos page"
```

---

### Task 8: Add image to the `sinistres` page banner

**Files:**
- Modify: `src/app/(app)/sinistres/page.tsx:16-20`

**Interfaces:**
- Consumes: `PageHeader` `image` prop (Task 2).

- [ ] **Step 1: Pass the image**

In `src/app/(app)/sinistres/page.tsx`, replace:

```tsx
      <PageHeader
        eyebrow="En cas de sinistre"
        title="Le bon réflexe, tout de suite."
        description="Panne, accident, dégât des eaux : n'attendez pas notre feu vert. Contactez directement l'assisteur repris sur votre contrat, disponible 24h/24. Nous reprenons le dossier avec vous juste après."
      />
```

with:

```tsx
      <PageHeader
        eyebrow="En cas de sinistre"
        title="Le bon réflexe, tout de suite."
        description="Panne, accident, dégât des eaux : n'attendez pas notre feu vert. Contactez directement l'assisteur repris sur votre contrat, disponible 24h/24. Nous reprenons le dossier avec vous juste après."
        image={{
          src: "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=1200&q=80&fm=jpg",
          alt: "Conseiller au téléphone, assistance client",
        }}
      />
```

- [ ] **Step 2: Visual check**

Run: `npm run dev`, open `http://localhost:3000/sinistres`.
Expected: banner shows a calm, reassuring "on the phone" photo, visually distinct from the existing emergency-intervention photo further down the page (in the "Qu'est-ce qu'un assisteur ?" section); no jarring repetition between the two.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/sinistres/page.tsx"
git commit -m "Add banner photo to sinistres page"
```

---

### Task 9: Add image to the `simulation` page banner

**Files:**
- Modify: `src/app/(app)/simulation/page.tsx:15-19`

**Interfaces:**
- Consumes: `PageHeader` `image` prop (Task 2).

- [ ] **Step 1: Pass the image**

In `src/app/(app)/simulation/page.tsx`, replace:

```tsx
      <PageHeader
        eyebrow="Demande de simulation"
        title="Trente minutes suffisent pour y voir clair."
        description="Décrivez-nous votre situation par téléphone ou par e-mail : nous revenons vers vous avec une simulation chiffrée et un avis honnête, sans engagement."
      />
```

with:

```tsx
      <PageHeader
        eyebrow="Demande de simulation"
        title="Trente minutes suffisent pour y voir clair."
        description="Décrivez-nous votre situation par téléphone ou par e-mail : nous revenons vers vous avec une simulation chiffrée et un avis honnête, sans engagement."
        image={{
          src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&fm=jpg",
          alt: "Personne consultant des documents financiers avec une calculatrice",
        }}
      />
```

- [ ] **Step 2: Visual check**

Run: `npm run dev`, open `http://localhost:3000/simulation`.
Expected: duotone photo of documents and a calculator appears in the right column at `lg:` widths and above.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/simulation/page.tsx"
git commit -m "Add banner photo to simulation page"
```

---

### Task 10: Final cross-page verification

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Full lint and typecheck**

Run: `npm run lint && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Full production build**

Run: `npm run build`
Expected: build succeeds with no errors (this also validates the `next/image` remote host — if it fails on an "unconfigured host" error for `images.unsplash.com`, check `next.config.ts` for an existing `images.remotePatterns`/`domains` entry covering it; `Hero.tsx` and `sinistres/page.tsx` already load images from this host successfully, so this should already be configured).

- [ ] **Step 3: Browser walk-through of all 7 pages**

Run: `npm run dev`, then visit each of:
- `http://localhost:3000/services`
- `http://localhost:3000/services/particuliers`
- `http://localhost:3000/services/independants`
- `http://localhost:3000/services/placements-epargne`
- `http://localhost:3000/a-propos`
- `http://localhost:3000/sinistres`
- `http://localhost:3000/simulation`

For each: confirm the banner shows eyebrow with accent dash, larger display-serif title, description, duotone photo at `lg:`+ widths, faint dot-grid texture, and a staggered fade/rise-in on load. Resize the viewport below `lg:` and confirm the photo column disappears cleanly with no leftover gap or broken image request.

- [ ] **Step 4: Commit (if any fixups were needed)**

Only if Steps 1–3 surfaced issues requiring code changes:

```bash
git add -A
git commit -m "Fix issues found in PageHeader cross-page verification"
```
