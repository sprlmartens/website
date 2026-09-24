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
  "sante-hospitalisation": {
    slug: "sante-hospitalisation",
    eyebrow: "Santé & hospitalisation",
    title: "Votre santé, sans mauvaise surprise.",
    intro:
      "Quelques minutes suffisent. Nous comparons pour vous les couvertures hospitalisation, soins courants et dentaires de nos partenaires, sans engagement.",
    metaTitle: "Devis assurance santé et hospitalisation — Martens Assurances",
    metaDescription:
      "Demandez gratuitement un devis d'assurance santé : hospitalisation, frais médicaux courants et soins dentaires, pour vous et vos proches.",
    image: {
      src: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80&fm=jpg",
      alt: "Médecin souriante échangeant avec une patiente en consultation",
    },
  },
  "epargne-pension": {
    slug: "epargne-pension",
    eyebrow: "Épargne-pension",
    title: "Préparez votre pension, à votre rythme.",
    intro:
      "Quelques minutes suffisent. Nous comparons pour vous les contrats d'épargne-pension de nos partenaires, avec leur avantage fiscal, sans engagement.",
    metaTitle: "Devis épargne-pension — Martens Assurances",
    metaDescription:
      "Demandez gratuitement un devis d'épargne-pension : constituez un capital pour votre retraite avec avantage fiscal, et une protection décès si vous le souhaitez.",
    image: {
      src: "https://images.unsplash.com/photo-1633158829875-e5316a358c6f?w=1200&q=80&fm=jpg",
      alt: "Pièces et jeune pousse, symbole d'une épargne qui grandit",
    },
  },
} as const satisfies Record<string, QuoteFormMeta>

export type QuoteSlug = keyof typeof quoteFormsMeta

export const quoteFormSlugs = Object.keys(quoteFormsMeta) as QuoteSlug[]

export function isQuoteSlug(value: string): value is QuoteSlug {
  // `Object.hasOwn` et non l'opérateur `in` : ce dernier parcourt la chaîne de
  // prototypes, donc "toString" ou "constructor" passeraient le garde-fou
  // alors qu'ils ne sont pas des slugs. Ne pas « simplifier » ce choix.
  return Object.hasOwn(quoteFormsMeta, value)
}
