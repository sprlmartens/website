import { defineQuery } from "next-sanity"

export const POSTS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)]|order(publishedAt desc)[0...12]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  }
}`)

export const PINNED_POSTS_QUERY =
  defineQuery(`*[_type == "post" && pinned == true && defined(slug.current)]|order(publishedAt desc)[0...3]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  }
}`)

export const POSTS_SLUGS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)]{
  "slug": slug.current
}`)

// Utilisée par app/sitemap.ts : `_updatedAt` alimente le <lastmod>.
export const POSTS_SITEMAP_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)]|order(publishedAt desc){
  "slug": slug.current,
  _updatedAt
}`)

export const POST_QUERY =
  defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  _updatedAt,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  },
  relatedPosts[]{
    _key, // required for drag and drop
    ...@->{_id, title, slug, mainImage} // get fields from the referenced post
  }
}`)
