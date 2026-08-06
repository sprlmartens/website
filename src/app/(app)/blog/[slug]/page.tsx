import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { portableTextToPlainText } from "@/lib/portable-text-to-plain-text"
import { sanityFetch } from "@/sanity/lib/live"
import { urlFor } from "@/sanity/lib/image"
import { POST_QUERY } from "@/sanity/lib/queries"
import { Post } from "@/components/post"
import { JsonLd } from "@/components/seo/JsonLd"
import { articleSchema, breadcrumbSchema } from "@/lib/structured-data"

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

  const slug = post.slug!.current

  return (
    <main className="container py-12 md:py-16">
      <JsonLd
        data={articleSchema({
          title: post.title ?? "",
          description: portableTextToPlainText(post.body),
          slug,
          publishedAt: post.publishedAt,
          updatedAt: post._updatedAt,
          imageUrl: post.mainImage
            ? urlFor(post.mainImage).width(1200).height(630).url()
            : null,
          authorName: post.author?.name,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Blog", path: "/blog" },
          { name: post.title ?? slug, path: `/blog/${slug}` },
        ])}
      />
      <Post {...post} />
    </main>
  )
}
