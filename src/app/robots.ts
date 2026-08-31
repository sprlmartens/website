import type { MetadataRoute } from "next"

import { isIndexableEnvironment, siteUrl } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  // Les déploiements de preview ne doivent pas être indexés : ils
  // dupliqueraient le contenu de la production sur un domaine .vercel.app.
  if (!isIndexableEnvironment) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /studio : interface d'administration Sanity, sans intérêt public.
      // /api/   : routes techniques (draft mode).
      disallow: ["/studio", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
