/**
 * URL canonique du site, sans slash final.
 *
 * Utilisée par sitemap.xml et robots.txt, qui exigent des URL absolues.
 * Le repli évite de faire planter le build si la variable d'environnement
 * manque — contrairement au `!` utilisé dans le layout racine.
 */
const FALLBACK_SITE_URL = "https://www.sprlmartens.be"

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL
).replace(/\/$/, "")

/**
 * Le site ne doit être indexable que sur le déploiement de production.
 *
 * On bloque uniquement les valeurs de `VERCEL_ENV` connues comme non
 * publiques. Si la variable est absente (build local, hébergement hors
 * Vercel), on autorise l'indexation : mieux vaut une preview indexée par
 * erreur qu'une production rendue invisible par une variable oubliée.
 */
export const isIndexableEnvironment =
  process.env.VERCEL_ENV !== "preview" && process.env.VERCEL_ENV !== "development"
