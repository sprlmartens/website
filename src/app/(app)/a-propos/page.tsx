import { PageHeader } from "@/components/page-header"
import Team from "@/components/about/Team"

import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbSchema } from "@/lib/structured-data"

export const metadata = {
  title: "À propos — Martens Assurances",
  description:
    "Courtier indépendant en assurances et en placements à Rocourt (Liège), depuis plus de 20 ans au service des familles, indépendants et entreprises.",
  alternates: { canonical: "/a-propos" },
}

export default function Page() {
  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: "À propos", path: "/a-propos" }])} />
      <PageHeader
        eyebrow="À propos"
        title="Un courtier indépendant, à taille humaine."
        description="Depuis plus de 20 ans, nous accompagnons les familles, les indépendants et les entreprises dans leurs choix de protection et de placement avec un seul objectif prioritaire : votre intérêt."
        image={{
          src: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=1200&q=80&fm=jpg",
          alt: "Équipe en discussion dans un bureau",
        }}
      />

      <Team />
    </main>
  )
}
