import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/site-url"
import { sanityFetch } from "@/sanity/lib/live"
import { POSTS_SITEMAP_QUERY } from "@/sanity/lib/queries"

/**
 * Pages statiques indexables.
 *
 * Volontairement exclu :
 * - /studio : interface d'administration Sanity
 *
 * Aucun `lastModified` n'est fourni pour ces pages : une date inventée
 * pousse Google à ignorer complètement le <lastmod> du sitemap.
 */
// Rendu dynamique, pour la même raison que /blog : sanityFetch met ses
// requêtes en cache avec `revalidate: false`. Prérendu au build, le sitemap
// resterait figé et n'annoncerait jamais les articles publiés depuis.
export const dynamic = "force-dynamic"

const staticRoutes = [
  "",
  "/a-propos",
  "/services",
  "/services/particuliers",
  "/services/professionnels",
  "/services/placements-epargne",
  "/partenaires",
  "/sinistres",
  "/blog",
  "/contact",
  "/devis",
  "/devis/auto-moto",
  "/devis/habitation",
  "/devis/familiale",
  "/devis/assistance-voyage",
  "/devis/sante-hospitalisation",
  "/devis/epargne-pension",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: posts } = await sanityFetch({ query: POSTS_SITEMAP_QUERY })

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
    })),
    ...(posts ?? [])
      .filter((post) => post.slug)
      .map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: new Date(post._updatedAt),
      })),
  ]
}
