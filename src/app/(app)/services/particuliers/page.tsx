import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

const coverages = [
  { name: "Auto / moto", note: "assurer vos véhicules" },
  { name: "Habitation", note: "incendie, vol, dégâts des eaux" },
  { name: "Famille", note: "responsabilité civile vie privée" },
  { name: "Santé", note: "hospitalisation et soins" },
  { name: "Assistance", note: "voyage, véhicule, rappatriement" },
]

export const metadata = {
  title: "Assurances Particuliers — Martens Assurances",
  description:
    "Auto, habitation, famille, santé : des couvertures comparées et négociées pour protéger ce que vous construisez.",
}

export default function Page() {
  return (
    <main>
      <PageHeader
        eyebrow="Particuliers & familles"
        title="Protéger ce que vous construisez."
        description="Votre maison, votre voiture, votre famille, votre avenir. Un conseiller unique qui connaît votre dossier et le défend."
        image={{
          src: "https://images.unsplash.com/photo-1758598738327-82de3cb31c56?w=1200&q=80&fm=jpg",
          alt: "Famille dans son salon",
        }}
      />
      <div className="container py-16 lg:py-20">
        <ul className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-y-0">
          {coverages.map((item, i) => (
            <li
              key={item.name}
              className={`py-6 sm:py-8 ${i % 2 === 1 ? "sm:pl-8" : "sm:pr-8"} ${
                i === coverages.length - 1 ? "" : "sm:border-b sm:border-border"
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
              Nous rencontrer
              <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
