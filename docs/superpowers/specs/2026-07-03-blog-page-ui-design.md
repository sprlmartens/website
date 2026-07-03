# Blog index UI redesign

## Problem

`src/app/(app)/blog/page.tsx` and its dependencies (`PostCard`, `Author`, `Categories`) were built before the site's editorial brand system existed and were never reconciled with it. They use generic Tailwind default colors (`slate-700/800`, `pink-50/600`, `cyan-50/700`, `blue-100`) instead of the Martens brand tokens (navy, accent red, paper/stone, `font-display`) used everywhere else on the site — homepage sections, `PageHeader`, etc. The blog page currently reads as a bolted-on section rather than part of the same site.

There's also a real bug in the date rendering.

## Goals

- Restyle the blog index and its post-row components to use the established brand tokens and editorial visual language (Fraunces headlines, navy/accent-red/stone palette, duotone photography, `rule-sweep` hover).
- Fix the inverted date-rendering bug.
- Keep the page simple: no filtering, no pagination, no new interactive state. Current post volume (query caps at 12, ordered by `publishedAt desc`) doesn't need either.

## Non-goals

- Category filtering/search — explicitly deferred; revisit if the archive grows.
- Reusing the shared `PageHeader` component — the blog index gets a lighter, more compact header since it's a listing page, not a narrative page like `/a-propos`.
- Pagination — out of scope at current post volume.
- Redesigning the individual post detail page (`/blog/[slug]`) — out of scope for this spec.

## Design

### Page header

Compact, custom header (not the shared `PageHeader` component):
- Small uppercase eyebrow label: "Blog" — same treatment as `PageHeader`'s eyebrow (`text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground`).
- Fraunces (`font-display`) title, e.g. "Conseils & actualités".
- No description text, no tinted background band, tighter vertical padding than `PageHeader` (this is a listing page, not a narrative one).

### Post list

Editorial list layout (rows, not a card grid), each row containing:
- **Thumbnail**: small (~120×80), using the site's `duotone` utility class (navy-tinted grayscale) instead of a plain/full-color image, for visual consistency with photography elsewhere on the site. If a post has no `mainImage`, the row simply omits the thumbnail (as today).
- **Category label**: uppercase, small, accent-red text (`text-accent`), no pill/background — matches the site's editorial voice rather than the current cyan pill.
- **Headline**: Fraunces serif (`font-display`), navy foreground color. Hover state uses the site's `rule-sweep` utility (red rule sweeping in from the left) instead of the current pink glow/scale box.
- **Meta line**: author name + formatted publish date, in muted stone tone (`text-muted-foreground`), replacing `slate-700`.

Rows are separated with `divide-y divide-border` (the brand's neutral border token) instead of `divide-blue-100`.

### Bug fix: date rendering

`post-card.tsx` currently has:
```tsx
{publishedAt ?? (
  <p className="text-base text-slate-700">
    {dayjs(publishedAt).format("D MMMM YYYY")}
  </p>
)}
```
This is inverted — it renders the raw ISO string when `publishedAt` is truthy, and only runs `dayjs().format()` (on `undefined`) when it's falsy. Fix: always format `publishedAt` when present:
```tsx
{publishedAt ? (
  <p className="text-sm text-muted-foreground">
    {dayjs(publishedAt).format("D MMMM YYYY")}
  </p>
) : null}
```

### Empty state

If `posts` is empty, render a short muted message (e.g. "Aucun article pour le moment.") instead of an empty `<ul>`.

### Footer / back link

Replace the bare `<hr />` + plain `<Link>` with a simple back-to-home link styled consistently with the rest of the site's link typography (no visual container/divider needed).

## Components touched

- `src/app/(app)/blog/page.tsx` — header, list container, empty state, footer link.
- `src/components/post-card.tsx` — row layout, thumbnail duotone treatment, headline hover, date bug fix.
- `src/components/author.tsx` — avatar and text colors → brand/muted tokens.
- `src/components/categories.tsx` — category label restyle (pill → plain uppercase accent-red text).

## Testing

- Visual check in browser: blog index with multiple posts (with and without `mainImage`), verify duotone thumbnails render, hover states work, empty state renders when no posts.
- Verify date displays correctly (formatted, not raw ISO string) for posts with `publishedAt` set.
