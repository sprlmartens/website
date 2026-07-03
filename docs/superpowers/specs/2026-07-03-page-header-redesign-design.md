# PageHeader redesign

## Problem

`src/components/PageHeader.tsx` is the banner used at the top of 7 pages
(`services`, `services/particuliers`, `services/independants`,
`services/placements-epargne`, `a-propos`, `sinistres`, `simulation`). It's
currently just an eyebrow label, a title, and an optional description on a
flat `bg-secondary/40` panel — no texture, no imagery, no entrance motion. It
reads as a placeholder next to the homepage `Hero`, which uses the brand's
duotone photography, an accent-highlighted title word, and staggered
`rise-in` animation. The goal is to bring PageHeader up to the same visual
bar — confident, editorial, "financial institution" polish — without
duplicating Hero's signature stat-card move.

## Component API

```tsx
type PageHeaderImage = {
  src: string
  alt: string
}

function PageHeader({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  image?: PageHeaderImage
})
```

`image` is optional and backward compatible: a call site that omits it still
renders correctly (text-only banner, no empty gap on the right). All 7
current call sites will be updated to pass an `image`.

## Visual treatment

- **Layout**: same two-column grid pattern as `Hero` (text `lg:col-span-7`,
  photo `lg:col-span-5`), but shorter — this is a page banner, not a landing
  hero. Photo column is `hidden` below `lg:` (matches Hero's mobile
  behavior).
- **Background**: keep `bg-secondary/40`, add a very subtle fine dot-grid
  texture in navy at low opacity (a quiet "precision/stability" cue, not a
  loud pattern). Implemented as a background-image radial-gradient dot
  pattern via inline style or a small CSS utility, `pointer-events-none`,
  layered under the content.
- **Eyebrow**: becomes a proper kicker — a short horizontal accent-colored
  rule (`bg-accent`, ~1.5rem wide, 2px tall) before the existing uppercase
  tracked label, both inline in a flex row.
- **Title**: stays `font-display` (Fraunces), grows one step
  (`text-4xl sm:text-5xl` → `text-5xl sm:text-6xl`) to feel closer to Hero's
  weight. `title` remains a `ReactNode` so call sites can wrap a phrase in
  `<span className="text-primary">…</span>` for an accent highlight, same
  technique Hero uses for "bien conseillé" — optional per page, not
  required.
- **Description**: unchanged styling.
- **Photo**: `duotone` utility class (already defined in
  `globals.css`) on a `rounded-2xl` card with `shadow-lg`,
  `aspect-[4/3]` (shorter than Hero's `aspect-[4/5]` since the band itself is
  shorter). No floating stat card — that stays a Hero-only device.
- **Motion**: `rise` / `rise-1` / `rise-2` staggered classes on
  eyebrow / title+description / photo, consistent with Hero's entrance
  animation. Respects the existing `prefers-reduced-motion` override in
  `globals.css`.

## Per-page images

All Unsplash, `?w=1200&q=80&fm=jpg`, same format as Hero's existing image.

| Page | Theme | Alt text (fr) |
|---|---|---|
| `services` | Advisor & client reviewing documents together | Conseiller et client examinant des documents ensemble |
| `services/particuliers` | Family at home | Famille dans son salon |
| `services/independants` | Independent professional at work | Indépendant travaillant à son bureau |
| `services/placements-epargne` | Calm financial planning / growth | Plan financier et graphique de croissance sur une table |
| `a-propos` | Team in conversation, office setting | Équipe en discussion dans un bureau |
| `sinistres` | Calm support call / assistance (reassuring, not accident imagery) | Conseiller au téléphone, assistance client |
| `simulation` | Reviewing plans/documents with a calculator | Personne consultant des documents financiers avec une calculatrice |

Specific Unsplash photo URLs will be selected during implementation, matching
Hero's existing sourcing pattern (`images.unsplash.com/photo-<id>`).

## Out of scope

- Breadcrumb navigation (considered, not chosen for this pass).
- Floating stat/badge card (Hero-exclusive device).
- Any change to pages that don't currently use `PageHeader`.
