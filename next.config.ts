import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Redirections depuis l'ancien site WordPress.
  // Les URL sources proviennent des sitemaps Yoast de www.sprlmartens.be.
  // Toute modification doit être validée par `npm run check:redirects`.
  async redirects() {
    return [
      // Articles WordPress : /2024/01/mon-article/ -> /blog/mon-article
      {
        source: "/:year(\\d{4})/:month(\\d{2})/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
      // Anciennes pages d'index d'actualités
      { source: "/notre-actualite", destination: "/blog", permanent: true },
      { source: "/actualites", destination: "/blog", permanent: true },
      // Taxonomies WordPress (catégories et auteurs) : pas d'équivalent,
      // on renvoie vers l'index du blog.
      { source: "/category/:slug", destination: "/blog", permanent: true },
      { source: "/author/:slug", destination: "/blog", permanent: true },
      // Sitemap Yoast : URL déclarée dans l'ancien robots.txt et connue de
      // Search Console.
      {
        source: "/sitemap_index.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      // L'ancienne page de simulation a été remplacée par /devis ; l'URL a pu
      // être partagée avant sa suppression.
      { source: "/simulation", destination: "/devis", permanent: true },
    ]
  },
}

export default nextConfig
