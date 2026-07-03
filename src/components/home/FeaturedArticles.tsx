import { sanityFetch } from "@/sanity/lib/live"
import { PINNED_POSTS_QUERY } from "@/sanity/lib/queries"
import { PostCard } from "@/components/post-card"

const GRID_CLASS_BY_COUNT: Record<number, string> = {
  1: "grid-cols-1 max-w-3xl mx-auto",
  2: "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}

export default async function FeaturedArticles() {
  const { data: posts } = await sanityFetch({ query: PINNED_POSTS_QUERY })

  if (posts.length === 0) {
    return null
  }

  return (
    <section aria-label="Articles mis en avant" className="bg-secondary">
      <div className="container py-24 lg:py-32">
        <p className="reveal text-xs font-medium uppercase tracking-[0.22em] text-foreground">
          Nos derniers articles
        </p>
        <h2 className="reveal mt-3 max-w-2xl font-display text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
          Nos conseils, pour y voir clair
        </h2>

        <div
          className={`reveal mt-12 grid gap-y-10 gap-x-8 md:mt-16 ${GRID_CLASS_BY_COUNT[posts.length]}`}
        >
          {posts.map((post) => (
            <PostCard key={post._id} {...post} />
          ))}
        </div>
      </div>
    </section>
  )
}
