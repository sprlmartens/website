import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { JsonLd } from "@/components/seo/JsonLd"
import { quoteFormsMeta, quoteFormSlugs } from "@/features/quotes/core/meta"
import { breadcrumbSchema } from "@/lib/structured-data"

export const metadata = {
  title: "Demande de devis — Martens Assurances",
  description:
    "Demandez un devis gratuit et sans engagement. Vous recevez une proposition adaptée, comparée entre nos partenaires.",
  alternates: { canonical: "/devis" },
}

export default function Page() {
  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: "Devis", path: "/devis" }])} />
      <PageHeader
        eyebrow="Demande de devis"
        title="Une proposition sur mesure, sans engagement."
        description="Répondez à quelques questions et nous comparons les couvertures de nos partenaires pour vous."
        image={{
          src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&fm=jpg",
          alt: "Personne consultant des documents avec une calculatrice",
        }}
      />
      <div className="container py-16 lg:py-20">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quoteFormSlugs.map((slug) => {
            const meta = quoteFormsMeta[slug]

            return (
              <li key={slug}>
                <Link
                  href={`/devis/${slug}`}
                  className="group/card flex h-full flex-col rounded-2xl border border-border p-6 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <h2 className="font-display text-xl font-medium text-foreground">
                    {meta.eyebrow}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {meta.intro}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Commencer
                    <ArrowRight className="size-4 transition-transform group-hover/card:translate-x-1" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
