import { PortableText } from "next-sanity"
import Image from "next/image"
import dayjs from "dayjs"

import { Author } from "@/components/author"
import { Categories } from "@/components/categories"
import { RelatedPosts } from "@/components/related-posts"
import { ShareButtons } from "@/components/share-buttons"
import { components } from "@/sanity/portableTextComponents"
import { POST_QUERY_RESULT } from "@/sanity/types"
import { urlFor } from "@/sanity/lib/image"

export function Post(props: NonNullable<POST_QUERY_RESULT>) {
  const {
    _id,
    title,
    slug,
    author,
    mainImage,
    body,
    publishedAt,
    categories,
    relatedPosts,
  } = props

  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug!.current}`

  return (
    <article>
      {mainImage ? (
        <div className="duotone aspect-[21/9] max-h-100 w-full overflow-hidden rounded-lg">
          <Image
            src={urlFor(mainImage).width(1600).height(686).url()}
            width={1600}
            height={686}
            alt={mainImage.alt || title || ""}
            className="size-full object-cover"
            priority
          />
        </div>
      ) : null}

      <header className="mx-auto mt-8 flex max-w-2xl flex-col items-start gap-4">
        <div className="flex items-center gap-4">
          <Categories categories={categories} />
          {publishedAt ? (
            <p className="text-sm text-muted-foreground">
              {dayjs(publishedAt).format("D MMMM YYYY")}
            </p>
          ) : null}
        </div>
        <h1 className="font-display text-3xl font-medium text-pretty text-foreground md:text-5xl">
          {title}
        </h1>
        <Author author={author} />
        <ShareButtons url={postUrl} title={title ?? ""} />
      </header>

      {body ? (
        <div className="prose mx-auto mt-10 max-w-2xl">
          <PortableText value={body} components={components} />
        </div>
      ) : null}

      <RelatedPosts
        relatedPosts={relatedPosts}
        documentId={_id}
        documentType="post"
      />
    </article>
  )
}
