import Link from "next/link"

import { sanityFetch } from "@/sanity/lib/live"
import { POSTS_QUERY } from "@/sanity/lib/queries"
import { PostCard } from "@/components/post-card"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbSchema } from "@/lib/structured-data"

export const metadata = {
  title: "Conseils & actualités assurance — Martens Assurances",
  description:
    "Conseils et actualités d'un courtier liégeois : assurances, épargne-pension, fiscalité et sinistres, expliqués simplement.",
  alternates: { canonical: "/blog" },
}

// Rendu dynamique : sanityFetch met ses requêtes en cache avec
// `revalidate: false`, donc une page prérendue au build garderait
// indéfiniment la liste d'articles figée à la date du déploiement.
export const dynamic = "force-dynamic"

export default async function Page() {
  const { data: posts } = await sanityFetch({ query: POSTS_QUERY })

  return (
    <main className="container py-12 md:py-16">
      <JsonLd data={breadcrumbSchema([{ name: "Blog", path: "/blog" }])} />
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Blog
      </p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        Conseils &amp; actualités
      </h1>

      {posts.length > 0 ? (
        <ul className="mt-10 grid grid-cols-1 divide-y divide-border">
          {posts.map((post) => (
            <li key={post._id} className="py-6 first:pt-0">
              <PostCard {...post} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-muted-foreground">
          Aucun article pour le moment.
        </p>
      )}
    </main>
  )
}
