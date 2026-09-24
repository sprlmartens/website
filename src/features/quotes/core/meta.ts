import type { QuoteFormMeta } from "./types"

/**
 * Métadonnées sérialisables des formulaires de devis.
 *
 * Séparées des définitions : un schéma zod et une fonction ne franchissent pas
 * la frontière RSC, mais ces valeurs si. Consommées par le hub `/devis`,
 * `generateStaticParams`, `generateMetadata` et le sitemap.
 */
export const quoteFormsMeta = {
  "auto-moto": {
    slug: "auto-moto",
    category: "particuliers",
    eyebrow: "Auto / moto",
    note: "RC, mini-omnium, omnium, protection juridique",
    title: "Prenez la route l'esprit tranquille.",
    intro:
      "Quelques minutes suffisent. Nous comparons pour vous les formules auto et moto de nos partenaires, de la RC à l'omnium, sans engagement.",
    metaTitle: "Devis assurance auto et moto — Martens Assurances",
    metaDescription:
      "Demandez gratuitement un devis d'assurance auto ou moto : RC, mini-omnium, omnium, protection juridique et assurance conducteur, comparés entre nos partenaires.",
    image: {
      src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80&fm=jpg",
      alt: "Conducteur au volant de sa voiture, en ville au crépuscule",
    },
  },
  habitation: {
    slug: "habitation",
    category: "particuliers",
    eyebrow: "Habitation",
    note: "Incendie, dégâts des eaux, tempête, bris de vitrage",
    title: "Votre logement, à l'abri des imprévus.",
    intro:
      "Quelques minutes suffisent. Nous comparons pour vous les assurances incendie de nos partenaires, pour le bâtiment comme pour son contenu, sans engagement.",
    metaTitle: "Devis assurance habitation (incendie) — Martens Assurances",
    metaDescription:
      "Demandez gratuitement un devis d'assurance habitation : incendie, dégâts des eaux, tempête et bris de vitrage, pour le bâtiment et son contenu, que vous soyez propriétaire ou locataire.",
    image: {
      src: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&fm=jpg",
      alt: "Maison éclairée de l'intérieur à la tombée de la nuit",
    },
  },
  familiale: {
    slug: "familiale",
    category: "particuliers",
    eyebrow: "Familiale",
    note: "Responsabilité civile vie privée",
    title: "Les petits accidents du quotidien, couverts.",
    intro:
      "Quelques minutes suffisent. Nous comparons pour vous les assurances familiales de nos partenaires, pour vous et tout votre foyer, sans engagement.",
    metaTitle: "Devis assurance familiale (RC vie privée) — Martens Assurances",
    metaDescription:
      "Demandez gratuitement un devis d'assurance familiale : la responsabilité civile vie privée qui couvre les dommages causés à autrui par vous, vos enfants ou vos animaux.",
    image: {
      src: "https://images.unsplash.com/photo-1758598738327-82de3cb31c56?w=1200&q=80&fm=jpg",
      alt: "Famille dans son salon",
    },
  },
  "assistance-voyage": {
    slug: "assistance-voyage",
    category: "particuliers",
    eyebrow: "Assistance voyage",
    note: "Assistance médicale, rapatriement, véhicule",
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
    category: "particuliers",
    eyebrow: "Santé & hospitalisation",
    note: "Hospitalisation, soins courants et dentaires",
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
    category: "placements-epargne",
    eyebrow: "Épargne-pension",
    note: "Un capital pour votre retraite, avec avantage fiscal",
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
  "solde-restant-du": {
    slug: "solde-restant-du",
    category: "placements-epargne",
    eyebrow: "Solde restant dû",
    note: "Votre crédit remboursé en cas de décès",
    title: "Votre projet immobilier, en toute sérénité.",
    intro:
      "Quelques minutes suffisent. Nous comparons pour vous les assurances solde restant dû de nos partenaires, pour vous et votre co-emprunteur, sans engagement.",
    metaTitle: "Devis assurance solde restant dû — Martens Assurances",
    metaDescription:
      "Demandez gratuitement un devis d'assurance solde restant dû : le remboursement de votre crédit hypothécaire garanti en cas de décès, pour vous et votre co-emprunteur.",
    image: {
      src: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80&fm=jpg",
      alt: "Remise des clés d'une maison",
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
