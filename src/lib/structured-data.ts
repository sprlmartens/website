import { siteUrl } from "@/lib/site-url"

/**
 * Identifiant stable de l'entreprise, pour que les autres blocs schema.org
 * (Article, BreadcrumbList…) puissent référencer la même entité.
 */
export const ORGANIZATION_ID = `${siteUrl}/#organization`

/**
 * Horaires d'ouverture.
 *
 * Source : ScheduleTimeline.tsx. Le mardi après-midi (13h-18h) est
 * volontairement absent : il est « sur rendez-vous » et non en accès libre.
 * Ces horaires peuvent être affichés tels quels par Google — toute
 * modification doit rester alignée sur ScheduleTimeline et sur la fiche
 * Google Business Profile.
 */
const openingHours = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Wednesday", "Thursday"],
    opens: "09:00",
    closes: "12:30",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Wednesday", "Thursday"],
    opens: "13:00",
    closes: "18:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Tuesday",
    opens: "09:00",
    closes: "12:30",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Friday",
    opens: "09:00",
    closes: "12:30",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Friday",
    opens: "13:00",
    closes: "16:30",
  },
]

/**
 * Fiche d'entreprise (InsuranceAgency, sous-type de LocalBusiness).
 *
 * À compléter quand l'information sera disponible :
 * - `vatID` : numéro de TVA.
 */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "InsuranceAgency",
  "@id": ORGANIZATION_ID,
  name: "Martens Assurances & Placements",
  url: siteUrl,
  logo: `${siteUrl}/martens-assurances-logo.png`,
  image: `${siteUrl}/martens-assurances-logo.png`,
  description:
    "Courtier indépendant en assurances et en placements à Rocourt (Liège), au service des familles, des indépendants et des entreprises depuis plus de 20 ans.",
  telephone: "+3242461363",
  email: "assurances@sprlmartens.be",
  // Numéro d'inscription FSMA en tant qu'intermédiaire d'assurance.
  // Signal de confiance déterminant pour un courtier belge.
  identifier: {
    "@type": "PropertyValue",
    propertyID: "FSMA",
    value: "065799 A",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rue François Lefebvre 10/B",
    postalCode: "4000",
    addressLocality: "Rocourt",
    addressRegion: "Liège",
    addressCountry: "BE",
  },
  // Coordonnées du bureau (relevées sur Google Maps). Arrondies à 6
  // décimales : au-delà, la précision est illusoire (~10 cm).
  geo: {
    "@type": "GeoCoordinates",
    latitude: 50.67696,
    longitude: 5.547062,
  },
  areaServed: {
    "@type": "City",
    name: "Liège",
  },
  openingHoursSpecification: openingHours,
  sameAs: [
    "https://www.facebook.com/sprlmartens/",
    "https://www.courtierenassurances.be/brokers/3975",
  ],
  knowsLanguage: "fr-BE",
}

/** Bloc WebSite, rendu une seule fois sur la page d'accueil. */
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: "Martens Assurances & Placements",
  inLanguage: "fr-BE",
  publisher: { "@id": ORGANIZATION_ID },
}

/**
 * Fil d'Ariane. `items` part de la racine implicite : passer uniquement les
 * niveaux suivants, par ex. [{ name: "Services", path: "/services" }].
 */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: `${siteUrl}${item.path}`,
      })),
    ],
  }
}

export function articleSchema({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  imageUrl,
  authorName,
}: {
  title: string
  description?: string
  slug: string
  publishedAt?: string | null
  updatedAt?: string | null
  imageUrl?: string | null
  authorName?: string | null
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    ...(description ? { description } : {}),
    mainEntityOfPage: `${siteUrl}/blog/${slug}`,
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    ...(authorName
      ? { author: { "@type": "Person", name: authorName } }
      : { author: { "@id": ORGANIZATION_ID } }),
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "fr-BE",
  }
}
