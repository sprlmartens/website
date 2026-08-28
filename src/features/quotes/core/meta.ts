import type { QuoteFormMeta } from "./types"

/**
 * Métadonnées sérialisables des formulaires de devis.
 *
 * Séparées des définitions : un schéma zod et une fonction ne franchissent pas
 * la frontière RSC, mais ces valeurs si. Consommées par le hub `/devis`,
 * `generateStaticParams`, `generateMetadata` et le sitemap.
 */
export const quoteFormsMeta = {
  "assistance-voyage": {
    slug: "assistance-voyage",
    eyebrow: "Assistance voyage",
    title: "Partez couvert, où que vous alliez.",
    intro:
      "Quelques minutes suffisent. Nous revenons vers vous avec une proposition adaptée à votre voyage, sans engagement.",
    metaTitle: "Devis assurance assistance voyage — Martens Assurances",
    metaDescription:
      "Demandez gratuitement un devis d'assistance voyage : assistance médicale, rapatriement et véhicule, en Europe ou dans le monde.",
    image: {
      src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80&fm=jpg",
      alt: "Avion de ligne au-dessus des nuages",
    },
  },
} as const satisfies Record<string, QuoteFormMeta>

export type QuoteSlug = keyof typeof quoteFormsMeta

export const quoteFormSlugs = Object.keys(quoteFormsMeta) as QuoteSlug[]

export function isQuoteSlug(value: string): value is QuoteSlug {
  return value in quoteFormsMeta
}
