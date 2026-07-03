import Link from "next/link"
import Image from "next/image"
import dayjs from "dayjs"

import { Author } from "@/components/author"
import { Categories } from "@/components/categories"
import { POSTS_QUERY_RESULT } from "@/sanity/types"
import { urlFor } from "@/sanity/lib/image"

export function PostCard(props: POSTS_QUERY_RESULT[0]) {
  const { title, author, mainImage, publishedAt, categories } = props

  return (
    <Link className="group" href={`/blog/${props.slug!.current}`}>
      <article className="flex items-start gap-4 md:gap-6">
        {mainImage ? (
          <div className="duotone w-30 h-20 shrink-0 rounded-md">
            <Image
              src={urlFor(mainImage).width(240).height(160).url()}
              width={240}
              height={160}
              alt={mainImage.alt || title || ""}
              className="size-full object-cover"
            />
          </div>
        ) : null}
        <div className="min-w-0">
          <Categories categories={categories} />
          <h2 className="mt-1 font-display text-lg font-medium text-pretty text-foreground md:text-xl">
            <span className="rule-sweep">{title}</span>
          </h2>
          <div className="mt-2 flex items-center gap-x-6">
            <Author author={author} />
            {publishedAt ? (
              <p className="text-sm text-muted-foreground">
                {dayjs(publishedAt).format("D MMMM YYYY")}
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  )
}
