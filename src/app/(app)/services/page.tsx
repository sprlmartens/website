import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PageHeader } from "@/components/page-header"

const categories = [
  {
    title: "Particuliers",
    href: "/services/particuliers",
    note: "Auto, habitation, famille, santé",
  },
  {
    title: "Indépendants",
    href: "/services/independants",
    note: "Revenus, responsabilité professionnelle, pension",
  },
  {
    title: "Placements & Épargne",
    href: "/services/placements-epargne",
    note: "Constituer et faire fructifier un capital",
  },
]

export const metadata = {
  title: "Services — Martens Assurances",
  description:
    "Assurances et placements pour les particuliers, les indépendants et les entreprises : un conseil indépendant, adapté à votre situation.",
}

export default function Page() {
  return (
    <main>
      <PageHeader
        eyebrow="Services"
        title="Un conseil pour chaque étape de votre vie."
        description="Que vous protégiez une famille, une activité indépendante ou une épargne, nous comparons le marché et construisons une couverture sur mesure."
        image={{
          src: "https://images.unsplash.com/photo-1714974528737-3e6c7e4d11af?w=1200&q=80&fm=jpg",
          alt: "Conseiller et client examinant des documents ensemble",
        }}
      />
      <div className="container py-16 lg:py-20">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {categories.map((category, i) => (
            <li key={category.href} className={`reveal rise-${i + 1}`}>
              <Link
                href={category.href}
                className="group block h-full rounded-2xl border border-border p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-navy-900/5"
              >
                <span className="font-display text-sm text-accent">
                  0{i + 1}
                </span>
                <h2 className="mt-3 font-display text-xl font-medium text-foreground">
                  {category.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {category.note}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Découvrir
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
