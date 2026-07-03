import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"

const coverages = [
  { name: "Protection des revenus", note: "en cas d'incapacité de travail" },
  { name: "Responsabilité professionnelle", note: "exercer l'esprit libre" },
  { name: "Véhicules", note: "utilitaires et déplacements pro" },
  { name: "Pension complémentaire", note: "PLCI, EIP : optimiser fiscalement" },
]

export const metadata = {
  title: "Assurances Indépendants — Martens Assurances",
  description:
    "Protection des revenus, responsabilité professionnelle, véhicules et pension complémentaire pour les indépendants.",
}

export default function Page() {
  return (
    <main>
      <PageHeader
        eyebrow="Services · Indépendants"
        title="Votre activité repose sur vous. Et vous ?"
        description="Quand on est son propre patron, personne ne cotise à votre place. Nous structurons votre protection et votre pension comme un plan, pas comme une pile de polices."
        image={{
          src: "https://images.unsplash.com/photo-1546514714-df0ccc50d7bf?w=1200&q=80&fm=jpg",
          alt: "Indépendant travaillant à son bureau",
        }}
      />
      <div className="container py-16 lg:py-20">
        <ul className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-y-0">
          {coverages.map((item, i) => (
            <li
              key={item.name}
              className={`py-6 sm:py-8 ${i % 2 === 1 ? "sm:pl-8" : "sm:pr-8"} ${
                i < 2 ? "sm:border-b sm:border-border" : ""
              }`}
            >
              <h2 className="font-display text-xl font-medium text-foreground">
                {item.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.note}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/simulation">
              Demander une simulation
              <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
            </Link>
          </Button>
          <Link href="/contact" className="rule-sweep text-sm font-medium text-primary">
            Nous rencontrer
          </Link>
        </div>
      </div>
    </main>
  )
}
