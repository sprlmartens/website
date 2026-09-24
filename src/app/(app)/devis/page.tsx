import Link from "next/link"
import {
  ArrowRight,
  Car,
  HeartPulse,
  House,
  LifeBuoy,
  PiggyBank,
  Users,
  type LucideIcon,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { JsonLd } from "@/components/seo/JsonLd"
import {
  quoteFormsMeta,
  quoteFormSlugs,
  type QuoteSlug,
} from "@/features/quotes/core/meta"
import type { QuoteCategory } from "@/features/quotes/core/types"
import { breadcrumbSchema } from "@/lib/structured-data"

// Les icônes restent ici : un composant ne traverse pas la frontière RSC,
// contrairement aux métadonnées. Le `satisfies` impose une icône à chaque
// nouveau produit.
const icons = {
  "auto-moto": Car,
  habitation: House,
  familiale: Users,
  "assistance-voyage": LifeBuoy,
  "sante-hospitalisation": HeartPulse,
  "epargne-pension": PiggyBank,
} satisfies Record<QuoteSlug, LucideIcon>

// Même ordre et mêmes libellés que `/services`. Une rubrique sans produit
// n'est pas affichée.
const categories: { id: QuoteCategory; title: string }[] = [
  { id: "particuliers", title: "Particuliers" },
  { id: "professionnels", title: "Professionnels" },
  { id: "placements-epargne", title: "Placements & Épargne" },
]

export const metadata = {
  title: "Demande de devis — Martens Assurances",
  description:
    "Demandez un devis gratuit et sans engagement. Vous recevez une proposition adaptée, comparée entre nos partenaires.",
  alternates: { canonical: "/devis" },
}

export default function Page() {
  const groups = categories
    .map((category) => ({
      ...category,
      slugs: quoteFormSlugs.filter(
        (slug) => quoteFormsMeta[slug].category === category.id,
      ),
    }))
    .filter((group) => group.slugs.length > 0)

  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: "Devis", path: "/devis" }])} />
      <PageHeader
        eyebrow="Demande de devis"
        title="Une proposition sur mesure, sans engagement."
        description="Choisissez un produit, répondez à quelques questions et nous comparons les couvertures de nos partenaires pour vous."
        image={{
          src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&fm=jpg",
          alt: "Personne consultant des documents avec une calculatrice",
        }}
      />
      <div className="container space-y-12 py-16 lg:py-20">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`devis-${group.id}`}>
            <h2
              id={`devis-${group.id}`}
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {group.title}
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.slugs.map((slug) => {
                const meta = quoteFormsMeta[slug]
                const Icon = icons[slug]

                return (
                  <li key={slug}>
                    <Link
                      href={`/devis/${slug}`}
                      className="group/card flex h-full items-start gap-4 rounded-2xl border border-border p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span
                        aria-hidden
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5"
                      >
                        <Icon className="size-5 text-primary" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg font-medium text-foreground">
                          {meta.eyebrow}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                          {meta.note}
                        </span>
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover/card:translate-x-1"
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
        <p className="text-sm text-muted-foreground">
          Votre besoin n&apos;est pas dans la liste ?{" "}
          <Link
            href="/contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Contactez-nous
          </Link>
          , nous établissons aussi des devis sur demande.
        </p>
      </div>
    </main>
  )
}
