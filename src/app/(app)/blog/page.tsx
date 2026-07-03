import Link from "next/link"

import { sanityFetch } from "@/sanity/lib/live"
import { POSTS_QUERY } from "@/sanity/lib/queries"
import { PostCard } from "@/components/post-card"

export default async function Page() {
  const { data: posts } = await sanityFetch({ query: POSTS_QUERY })

  return (
    <main className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <h1 className="text-4xl font-bold">Blog</h1>
      <ul className="grid grid-cols-1 divide-y divide-blue-100">
        {posts.map((post) => (
          <li key={post._id} className="p-4">
            <PostCard {...post} />
          </li>
        ))}
      </ul>
    </main>
  )
}
