"use client"

import Link from "next/link"
import Image from "next/image"
import { createDataAttribute } from "next-sanity"
import { useOptimistic } from "next-sanity/hooks"
import { POST_QUERY_RESULT } from "@/sanity/types"
import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"

const { projectId, dataset, stega } = client.config()
export const createDataAttributeConfig = {
  projectId,
  dataset,
  baseUrl: typeof stega.studioUrl === "string" ? stega.studioUrl : "",
}

export function RelatedPosts({
  relatedPosts,
  documentId,
  documentType,
}: {
  relatedPosts: NonNullable<POST_QUERY_RESULT>["relatedPosts"]
  documentId: string
  documentType: string
}) {
  const posts = useOptimistic<
    NonNullable<POST_QUERY_RESULT>["relatedPosts"] | undefined,
    NonNullable<POST_QUERY_RESULT>
  >(relatedPosts, (state, action) => {
    if (action.id === documentId && action?.document?.relatedPosts) {
      // Optimistic document only has _ref values, not resolved references
      return action.document.relatedPosts.map(
        (post) => state?.find((p) => p._key === post._key) ?? post,
      )
    }
    return state
  })
  if (!posts) {
    return null
  }
  return (
    <aside className="border-t">
      <h2>Related Posts</h2>
      <div className="not-prose text-balance">
        <ul
          className="flex flex-col sm:flex-row gap-0.5"
          data-sanity={createDataAttribute({
            ...createDataAttributeConfig,
            id: documentId,
            type: documentType,
            path: "relatedPosts",
          }).toString()}
        >
          {posts.map((post) => (
            <li
              key={post._key}
              className="p-4 bg-blue-50 sm:w-1/3 flex-shrink-0"
              data-sanity={createDataAttribute({
                ...createDataAttributeConfig,
                id: documentId,
                type: documentType,
                path: `relatedPosts[_key=="${post._key}"]`,
              }).toString()}
            >
              <Link href={`/posts/${post?.slug?.current}`}>
                {post.mainImage ? (
                  <Image
                    src={urlFor(post.mainImage).width(400).height(200).url()}
                    width={400}
                    height={200}
                    alt={post.mainImage.alt || post.title || ""}
                  />
                ) : null}
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
