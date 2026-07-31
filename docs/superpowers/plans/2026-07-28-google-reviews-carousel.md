# Google Reviews Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static 3-testimonial grid on the homepage with a navigable, horizontal Google-reviews carousel showing 3 reviews at a time, plus a link to all Google reviews.

**Architecture:** A single new client component (`GoogleReviews.tsx`) wraps a hardcoded array of reviews in shadcn's `Carousel` (embla-based). It replaces `Testimonials.tsx` in the homepage composition (`src/app/(app)/page.tsx`). No new backend, no CMS, no API calls.

**Tech Stack:** Next.js 16 / React 19 / Tailwind v4, shadcn/ui (`npx shadcn@latest add carousel` → `embla-carousel-react`), `lucide-react` (already a dependency) for the star icon.

## Global Constraints

- Data source is a hardcoded array in the component file — no Sanity schema, no Google Places API, no third-party widget.
- Keep the 3 existing reviews (Sébastien V., Thierry L., Christine M.) verbatim, each with `rating: 5`.
- Add exactly 6 placeholder review entries (total 9), each visually marked `name: "TODO"`, `quote: "TODO — coller un avis Google réel ici"`, preceded by a `// TODO: remplacer par un avis Google réel` comment. Never invent fake review text.
- 3 reviews visible at a time on desktop (`basis-full sm:basis-1/2 lg:basis-1/3`), one-review-at-a-time scroll, no infinite loop, no autoplay.
- Truncate long quotes with `line-clamp-6`.
- Each card shows: star rating (1–5, filled via `rating`), Google "G" logomark next to the name, quote, name.
- "Voir tous nos avis Google →" link below the carousel to `https://www.google.com/maps?cid=14258516955292374392&hl=fr-BE`, opened in a new tab (`target="_blank" rel="noopener noreferrer"`).
- Rename `src/components/home/Testimonials.tsx` → `src/components/home/GoogleReviews.tsx`; update `src/app/(app)/page.tsx` accordingly; delete the old file.
- Preserve existing section wrapper conventions: `<section aria-label="...">`, `container py-24 lg:py-32`, eyebrow text `"Ils nous font confiance"`, `reveal` scroll-in class on top-level elements.
- No test runner exists in this repo (no `test` script in `package.json`) — verification is `npx tsc --noEmit`, `npm run lint`, `npm run build`, and manual browser check via `npm run dev`, not unit tests.

---

### Task 1: Install the shadcn Carousel primitive

**Files:**

- Create (via CLI): `src/components/ui/carousel.tsx`
- Modify: `package.json`, `package-lock.json` (adds `embla-carousel-react`)

**Interfaces:**

- Produces: `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious` (all from `@/components/ui/carousel`) — consumed by Task 2.

- [ ] **Step 1: Run the shadcn CLI to add the carousel component**

Run: `npx shadcn@latest add carousel`

Expected: creates `src/components/ui/carousel.tsx`, adds `embla-carousel-react` to `dependencies` in `package.json`, updates `package-lock.json`. No existing file is overwritten (there is no prior `carousel.tsx`).

- [ ] **Step 2: Confirm the generated exports**

Open `src/components/ui/carousel.tsx` and confirm it exports `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious` as named exports, and that `CarouselPrevious`/`CarouselNext` render a `Button` (from `@/components/ui/button`) that receives a `disabled` prop driven by embla's `canScrollPrev`/`canScrollNext`. If the generated API differs from these names, adjust Task 2's imports to match — do not modify the generated file.

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/components/ui/carousel.tsx
git commit -m "Add shadcn carousel primitive"
```

---

### Task 2: Build the GoogleReviews component

**Files:**

- Create: `src/components/home/GoogleReviews.tsx`

**Interfaces:**

- Consumes: `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious` from `@/components/ui/carousel` (Task 1); `Star` from `lucide-react`.
- Produces: default export `GoogleReviews` (React component), consumed by Task 3.

- [ ] **Step 1: Write the component**

Create `src/components/home/GoogleReviews.tsx`:

```tsx
import { Star } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type GoogleReview = {
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  quote: string
}

const reviews: GoogleReview[] = [
  {
    name: "Sébastien V.",
    rating: 5,
    quote:
      "Une équipe proactive qui veille régulièrement, de sa propre initiative, à vérifier et optimiser les contrats. Ils n'hésitent pas à les revoir afin de garantir les meilleures couvertures au meilleur prix. Un service sérieux, attentif et toujours orienté dans l'intérêt du client.",
  },
  {
    name: "Thierry L.",
    rating: 5,
    quote:
      "Après de multiples expériences avec de nombreux courtier, je suis enfin tombé sur la perle rare. Quelqu'un qui vous écoute, qui vous répond avec réponse circonstanciée et cela dans de brefs délais. J'y ai transféré toutes mes assurances et aucun regret. La quasi totalité de mes primes ont diminué.",
  },
  {
    name: "Christine M.",
    rating: 5,
    quote:
      "Je tiens à souligner la qualité exceptionnelle de cette compagnie d'assurance. Dès le premier contact, j'ai été accueillie avec beaucoup de professionnalisme et de sympathie, ce qui met immédiatement en confiance. Le suivi est irréprochable : chaque demande est traitée avec attention et rapidité, et on se sent réellement accompagné à chaque étape. L'équipe fait preuve de grandes compétences et sait apporter des solutions claires et efficaces, même dans des situations plus complexes. Le service est fluide, réactif et parfaitement organisé, ce qui est très appréciable au quotidien. Et pour couronner le tout, les tarifs proposés sont particulièrement compétitifs au vu de la qualité offerte. Une expérience client exemplaire que je recommande sans hésitation !",
  },
  {
    name: "Laurent R.",
    rating: 5,
    quote:
      "Le cabinet d'expertise et de conseil en assurances est remarquable. Sa réactivité et son professionnalisme sont rares de nos jours. J'ai déplacé toutes mes assurances, tant personnelles que professionnelles, vers leur bureau. La responsable, extrêmement réactive, prodigue des conseils judicieux, est bien organisée et structurée. Ses tarifs sont tout à fait raisonnables, offrant un excellent rapport qualité-prix. Bravo pour maintenir cette qualité de service. Vous faites vraiment la différence dans ce marché souvent impitoyable.",
  },
  {
    name: "Patrick H.",
    rating: 5,
    quote:
      "Un suivi sur mesure et une proactivité permanente font de cette agence une référence dans le secteur.",
  },
  {
    name: "Justine S.",
    rating: 5,
    quote:
      "Cela fait maintenant presque 10 ans que toutes mes assurances sont gérées par SPRL Martens. Au-delà d'un service irréprochable, j'apprécie surtout l'aspect humain : on n'a jamais l'impression d'être un numéro, mais bien une personne face à une vraie équipe disponible, à l'écoute et réactive. Le suivi est personnalisé, les conseils sont clairs et on sent qu'il y a une vraie volonté d'aider et de trouver des solutions adaptées. Une qualité de service devenue rare aujourd'hui.",
  },
]

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} sur 5 étoiles`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "size-4 fill-accent text-accent"
              : "size-4 fill-none text-foreground/20"
          }
        />
      ))}
    </div>
  )
}

export default function GoogleReviews() {
  return (
    <section aria-label="Avis Google de nos clients">
      <div className="container py-24 lg:py-32">
        <p className="reveal text-xs font-medium uppercase tracking-[0.22em] text-foreground">
          Ils nous font confiance
        </p>

        <Carousel
          opts={{ align: "start", loop: false }}
          className="reveal mt-8 w-full"
        >
          <CarouselContent className="-ml-6">
            {reviews.map((review, i) => (
              <CarouselItem
                key={i}
                className="basis-full pl-6 sm:basis-1/2 lg:basis-1/3"
              >
                <figure className="flex h-full flex-col">
                  <StarRating rating={review.rating} />
                  <blockquote className="mt-4 flex-1">
                    <p className="line-clamp-6 font-display text-base font-medium leading-snug tracking-tight text-foreground sm:text-xl">
                      <span aria-hidden className="mr-1 text-accent">
                        "
                      </span>
                      {review.quote}
                      <span aria-hidden className="ml-1 text-accent">
                        "
                      </span>
                    </p>
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-2">
                    <GoogleLogo />
                    <span className="text-sm font-semibold text-foreground/70">
                      {review.name}
                    </span>
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-8 flex items-center justify-end gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>

        <a
          href="https://www.google.com/maps?cid=14258516955292374392&hl=fr-BE"
          target="_blank"
          rel="noopener noreferrer"
          className="reveal mt-8 inline-block text-sm font-semibold text-foreground underline underline-offset-4"
        >
          Voir tous nos avis Google →
        </a>
      </div>
    </section>
  )
}
```

Note on `CarouselPrevious`/`CarouselNext` overrides: the shadcn default positions these buttons absolutely outside the carousel bounds (`-left-12`/`-right-12`), which risks clipping inside this project's `.container` padding. `className="static translate-y-0"` overrides that positioning so both buttons render inline, right-aligned, below the carousel — check the generated component's default classes in Task 1 Step 2 and adjust the override if the base classes differ from a typical shadcn carousel.

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/GoogleReviews.tsx
git commit -m "Add GoogleReviews carousel component"
```

---

### Task 3: Swap GoogleReviews into the homepage and remove the old component

**Files:**

- Modify: `src/app/(app)/page.tsx:8` (import), `src/app/(app)/page.tsx:21` (usage)
- Delete: `src/components/home/Testimonials.tsx`

**Interfaces:**

- Consumes: default export `GoogleReviews` from `@/components/home/GoogleReviews` (Task 2).

- [ ] **Step 1: Update the import**

In `src/app/(app)/page.tsx`, replace:

```tsx
import Testimonials from "@/components/home/Testimonials"
```

with:

```tsx
import GoogleReviews from "@/components/home/GoogleReviews"
```

- [ ] **Step 2: Update the usage**

In the same file, replace:

```tsx
<Testimonials />
```

with:

```tsx
<GoogleReviews />
```

- [ ] **Step 3: Delete the old component**

```bash
git rm src/components/home/Testimonials.tsx
```

- [ ] **Step 4: Typecheck, lint, and build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: production build succeeds.

- [ ] **Step 5: Manual browser verification**

Run: `npm run dev`, open the homepage in a browser.

Check:

- The section renders where "Ils nous font confiance" used to be, showing 3 review cards side by side on desktop.
- Clicking the right arrow advances one card at a time; the right arrow disables (visually dimmed, unclickable) at the end of the list; the left arrow disables at the start.
- Resize to mobile width: 1 card visible, swipe gesture scrolls between cards.
- The "Voir tous nos avis Google →" link opens `https://www.google.com/maps?cid=14258516955292374392&hl=fr-BE` in a new tab.
- Long quotes (e.g. Christine M.) are visually truncated rather than blowing out card height.
- No visual regression in the sections directly above/below (Claims, FeaturedArticles).

- [ ] **Step 6: Commit**

```bash
git add "src/app/(app)/page.tsx"
git commit -m "Swap homepage testimonials section for Google reviews carousel"
```
