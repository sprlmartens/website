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
  if (posts.length === 0) {
    return null
  }

  return (
    <aside className="mt-16 border-t border-border pt-10">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        À lire aussi
      </p>
      <ul
        className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3"
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
            data-sanity={createDataAttribute({
              ...createDataAttributeConfig,
              id: documentId,
              type: documentType,
              path: `relatedPosts[_key=="${post._key}"]`,
            }).toString()}
          >
            <Link className="group block" href={`/blog/${post?.slug?.current}`}>
              {post.mainImage ? (
                <div className="duotone aspect-video overflow-hidden rounded-md">
                  <Image
                    src={urlFor(post.mainImage).width(400).height(225).url()}
                    width={400}
                    height={225}
                    alt={post.mainImage.alt || post.title || ""}
                    className="size-full object-cover"
                  />
                </div>
              ) : null}
              <p className="rule-sweep mt-3 inline font-display text-base font-medium text-foreground">
                {post.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
