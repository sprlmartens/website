import { notFound } from "next/navigation"

import { sanityFetch } from "@/sanity/lib/live"
import { POST_QUERY } from "@/sanity/lib/queries"
import { Post } from "@/components/post"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { data: post } = await sanityFetch({
    query: POST_QUERY,
    params: await params,
  })

  if (!post) {
    notFound()
  }

  return (
    <main className="container py-12 md:py-16">
      <Post {...post} />
    </main>
  )
}
