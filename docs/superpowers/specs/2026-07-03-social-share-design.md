# Social sharing for blog posts

## Problem

Blog posts (`src/components/post.tsx`) have no way to share them on social
media. Shared links would also currently render with no title, description,
or image preview, since the site has no Open Graph metadata at all — the
root layout still has the Next.js placeholder title/description
(`src/app/layout.tsx:11-14`), and `src/app/(app)/blog/[slug]/page.tsx` has no
`generateMetadata`.

## Goals

- Add a row of share buttons (LinkedIn, WhatsApp, Facebook, Email) to the
  blog post page, so readers can share an article with one click.
- Make shared links render a correct preview (title, description, image) on
  the platforms above.
- Fix the root layout's placeholder title/description as part of setting up
  `metadataBase`.

## Non-goals

- Share buttons on `post-card.tsx` or the blog listing page — post page only.
- A native Web Share API / single "Share" button UX — an always-visible icon
  row was chosen instead.
- Adding an `excerpt` field to the Sanity `post` schema — the OG description
  is derived from the existing `body` field instead (see below), to avoid a
  content-model change and asking editors to fill in a new field.
- Any analytics/tracking on share clicks.

## Design

### 1. Site URL config

Add `NEXT_PUBLIC_SITE_URL=https://www.sprlmartens.be` to `.env.local` and
`.env.example` (placeholder domain — correct it before going live if it
turns out to differ from the final production domain).

### 2. Root layout metadata

In `src/app/layout.tsx`, replace the placeholder `metadata` export:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: "Martens Assurances — Courtier en assurances",
  description:
    "Martens Assurances, courtier en assurances indépendant. Conseils et solutions adaptés à vos besoins.",
}
```

(Exact copy to be refined with the user — placeholder above follows the
site's existing French tone.)

### 3. Plain-text excerpt helper

New file `src/lib/portable-text-to-plain-text.ts`:

```ts
import type { PortableTextBlock } from "next-sanity"

export function portableTextToPlainText(
  blocks: PortableTextBlock[] | undefined,
  maxLength = 160
): string {
  const text = (blocks ?? [])
    .filter((block) => block._type === "block")
    .map((block) =>
      (block.children ?? [])
        .map((child: { text?: string }) => child.text ?? "")
        .join("")
    )
    .join(" ")
    .trim()

  return text.length > maxLength
    ? `${text.slice(0, maxLength).trimEnd()}…`
    : text
}
```

Used for the OG `description` — takes the post `body`, flattens it to plain
text, truncates to ~160 characters (standard OG description length).

### 4. Blog post metadata

In `src/sanity/lib/queries.ts`, add `slug` to `POST_QUERY`'s projection
(needed to build the canonical/OG URL):

```ts
export const POST_QUERY =
  defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  body,
  ...
```

In `src/app/(app)/blog/[slug]/page.tsx`, add:

```ts
import type { Metadata } from "next"
import { portableTextToPlainText } from "@/lib/portable-text-to-plain-text"
import { urlFor } from "@/sanity/lib/image"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { data: post } = await sanityFetch({
    query: POST_QUERY,
    params: await params,
  })

  if (!post) return {}

  const description = portableTextToPlainText(post.body)
  const url = `/blog/${post.slug!.current}`

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title ?? undefined,
      description,
      url,
      type: "article",
      images: post.mainImage
        ? [urlFor(post.mainImage).width(1200).height(630).url()]
        : undefined,
    },
    alternates: { canonical: url },
  }
}
```

This duplicates the `sanityFetch` call already made in `Page` — acceptable
per the Next.js docs' memoization guidance, since `sanityFetch` (via
`next-sanity`'s `live` client) is request-deduped already; no extra network
round trip in practice.

### 5. `ShareButtons` component

New file `src/components/share-buttons.tsx`, a client component:

```tsx
"use client"

type ShareButtonsProps = {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const shareLinks = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offer/?url=${encodeURIComponent(url)}`,
      icon: LinkedInIcon,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: WhatsAppIcon,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: FacebookIcon,
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
      icon: MailIcon,
    },
  ]

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Partager :</span>
      {shareLinks.map(({ name, href, icon: Icon }) => (
        <a
          key={name}
          href={href}
          target={name === "Email" ? undefined : "_blank"}
          rel={name === "Email" ? undefined : "noopener noreferrer"}
          aria-label={`Partager sur ${name}`}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon className="size-5" />
        </a>
      ))}
    </div>
  )
}
```

`LinkedInIcon`, `WhatsAppIcon`, `FacebookIcon` are small inline brand SVGs
defined in the same file (`lucide-react` has no brand icons). `MailIcon`
comes from `lucide-react` (already a dependency).

### 6. Wiring into the post page

In `src/components/post.tsx`:

- Destructure `slug` from `props` (available once `POST_QUERY` includes it).
- Build `postUrl` as `` `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug!.current}` ``.
- Render `<ShareButtons url={postUrl} title={title ?? ""} />` inside
  `<header>`, after the `<Author author={author} />` line.

`Post` is a server component, so `process.env.NEXT_PUBLIC_SITE_URL` is read
server-side and passed down as a plain string prop — no client-side env
exposure concerns beyond what `NEXT_PUBLIC_*` already implies.

## Testing

- Manual: visit a post, click each of the 4 share icons, confirm each opens
  the correct share dialog/app pre-filled with the post title and URL.
- Manual: use LinkedIn's Post Inspector and a similar Facebook/WhatsApp
  preview debugger against a deployed/staged URL to confirm the OG title,
  description, and image render correctly.
- Manual: confirm the root layout's `<title>` and meta description are no
  longer the Next.js placeholder, on any page.
- No unit tests planned for `ShareButtons` (static link construction, no
  branching logic worth asserting). `portableTextToPlainText` is a plausible
  candidate for a small unit test (truncation boundary, empty input) if the
  project's testing conventions call for it — none exist in the repo today,
  so this is left as a judgment call during implementation.
