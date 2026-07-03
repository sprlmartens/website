import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PageHeader } from "@/components/PageHeader"
import ServicesSection from "@/components/home/Services"

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
      />
      <div className="container py-16 lg:py-20">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {categories.map((category) => (
            <li key={category.href}>
              <Link
                href={category.href}
                className="group block h-full rounded-2xl border border-border p-6 transition-colors hover:border-primary"
              >
                <h2 className="font-display text-xl font-medium text-foreground">
                  {category.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {category.note}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Découvrir
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <ServicesSection />
    </main>
  )
}
