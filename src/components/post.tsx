import { PortableText } from "next-sanity"
import Image from "next/image"
import dayjs from "dayjs"

import { Author } from "@/components/author"
import { Categories } from "@/components/categories"
import { RelatedPosts } from "@/components/related-posts"
import { components } from "@/sanity/portableTextComponents"
import { POST_QUERY_RESULT } from "@/sanity/types"
import { urlFor } from "@/sanity/lib/image"

export function Post(props: NonNullable<POST_QUERY_RESULT>) {
  const {
    _id,
    title,
    author,
    mainImage,
    body,
    publishedAt,
    categories,
    relatedPosts,
  } = props

  return (
    <article className="grid lg:grid-cols-12 gap-y-12">
      <header className="lg:col-span-12 flex flex-col gap-4 items-start">
        <div className="flex gap-4 items-center">
          <Categories categories={categories} />
          {publishedAt ?? (
            <p className="text-base text-slate-700">
              {dayjs(publishedAt).format("D MMMM YYYY")}
            </p>
          )}
        </div>
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-semibold text-slate-800 text-pretty max-w-3xl">
          {title}
        </h1>
        <Author author={author} />
      </header>
      {mainImage ? (
        <figure className="lg:col-span-4 flex flex-col gap-2 items-start">
          <Image
            src={urlFor(mainImage).width(400).height(400).url()}
            width={400}
            height={400}
            alt=""
          />
        </figure>
      ) : null}
      {body ? (
        <div className="lg:col-span-7 lg:col-start-6 prose lg:prose-lg">
          <PortableText value={body} components={components} />
          <RelatedPosts
            relatedPosts={relatedPosts}
            documentId={_id}
            documentType="post"
          />
        </div>
      ) : null}
    </article>
  )
}
