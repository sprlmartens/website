import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { portableTextToPlainText } from "@/lib/portable-text-to-plain-text"
import { sanityFetch } from "@/sanity/lib/live"
import { urlFor } from "@/sanity/lib/image"
import { POST_QUERY } from "@/sanity/lib/queries"
import { Post } from "@/components/post"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { data: post } = await sanityFetch({
    query: POST_QUERY,
    params: await params,
  })

  if (!post) {
    return {}
  }

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
