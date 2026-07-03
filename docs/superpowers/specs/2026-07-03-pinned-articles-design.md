# Pinned articles on the landing page

## Problem

Editors have no way to highlight specific blog posts on the homepage. The
landing page (`src/app/(app)/page.tsx`) currently has no articles section at
all.

## Goals

- Let editors mark a post as "pinned" in Sanity Studio.
- Show up to 3 pinned posts in a new section on the homepage, most recent
  first.
- If no posts are pinned, the section doesn't render (no empty state).

## Non-goals

- Numbered/manual pin ordering (ordering is by `publishedAt desc`).
- A cap-agnostic "show all pinned" mode — capped at 3.
- Reusing or modifying the existing `Journal.tsx` component (it stays as-is,
  untouched, with its mock data).

## Design

### 1. Schema: `pinned` field on `postType`

In `src/sanity/schemaTypes/postType.ts`, add a boolean field near the top of
the `fields` array (after `slug`, before `author`):

```ts
defineField({
  name: "pinned",
  type: "boolean",
  title: "Épinglé",
  description:
    "Afficher cet article dans la section mise en avant de la page d'accueil.",
  initialValue: false,
}),
```

### 2. Query: `PINNED_POSTS_QUERY`

In `src/sanity/lib/queries.ts`, add a query following the same projection
shape as `POSTS_QUERY`, filtered to pinned posts and capped at 3:

```ts
export const PINNED_POSTS_QUERY =
  defineQuery(`*[_type == "post" && pinned == true && defined(slug.current)]|order(publishedAt desc)[0...3]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  }
}`)
```

### 3. Component: `FeaturedArticles`

New file `src/components/home/FeaturedArticles.tsx`, a server component:

- Fetches `PINNED_POSTS_QUERY` via `sanityFetch` (same pattern as
  `src/app/(app)/blog/page.tsx`).
- Returns `null` if the result is empty (no section, no heading, nothing
  rendered).
- Otherwise renders a `<section>` with a heading ("Nos derniers articles")
  and a grid of `PostCard` (existing component from
  `src/components/post-card.tsx`), reusing it as-is for visual consistency
  with the `/blog` listing.
- Styling follows the conventions of other `src/components/home/*` sections
  (container, spacing, `font-display` heading) rather than introducing new
  visual patterns.

### 4. Wiring into the homepage

In `src/app/(app)/page.tsx`, import and render `<FeaturedArticles />` between
`<Testimonials />` and `<FinalCta />`.

## Testing

- Manual verification: pin 0, 1, and 3+ posts in Studio and confirm the
  section is absent / shows the right posts / caps at 3, respecting
  `publishedAt desc` order.
- Existing blog page and `PostCard` behavior must remain unaffected (new
  query and component only; no changes to `POSTS_QUERY` or `POST_QUERY`).
