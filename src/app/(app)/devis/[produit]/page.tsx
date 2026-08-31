import { notFound } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { QuoteFormBySlug } from "@/components/quotes/quote-forms"
import { JsonLd } from "@/components/seo/JsonLd"
import {
  isQuoteSlug,
  quoteFormSlugs,
  quoteFormsMeta,
} from "@/features/quotes/core/meta"
import { breadcrumbSchema } from "@/lib/structured-data"

type PageProps = {
  params: Promise<{ produit: string }>
}

export function generateStaticParams() {
  return quoteFormSlugs.map((produit) => ({ produit }))
}

// Tout slug hors registre donne un 404 plutôt qu'un rendu à la demande.
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps) {
  const { produit } = await params

  if (!isQuoteSlug(produit)) {
    return {}
  }

  const meta = quoteFormsMeta[produit]

  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    alternates: { canonical: `/devis/${produit}` },
  }
}

export default async function Page({ params }: PageProps) {
  const { produit } = await params

  if (!isQuoteSlug(produit)) {
    notFound()
  }

  const meta = quoteFormsMeta[produit]

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Devis", path: "/devis" },
          { name: meta.eyebrow, path: `/devis/${produit}` },
        ])}
      />
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.intro}
        image={meta.image}
      />
      <div className="container pb-20 lg:pb-24">
        <QuoteFormBySlug slug={produit} />
      </div>
    </main>
  )
}
