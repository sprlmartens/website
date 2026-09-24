import Link from "next/link"
import {
  ArrowRight,
  Car,
  HeartPulse,
  House,
  LifeBuoy,
  Users,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbSchema } from "@/lib/structured-data"

const coverages = [
  { icon: Car, name: "Auto / moto", note: "assurer vos véhicules" },
  { icon: House, name: "Habitation", note: "incendie, vol, dégâts des eaux" },
  { icon: Users, name: "Famille", note: "responsabilité civile vie privée" },
  {
    icon: HeartPulse,
    name: "Santé",
    note: "hospitalisation et soins",
    quote: {
      href: "/devis/sante-hospitalisation",
      label: "Demander un devis",
    },
  },
  {
    icon: LifeBuoy,
    name: "Assistance",
    note: "voyage, rapatriement",
    // Les autres couvertures recevront ce champ quand leur formulaire existera.
    quote: { href: "/devis/assistance-voyage", label: "Demander un devis" },
  },
]

export const metadata = {
  title: "Assurances Particuliers — Martens Assurances",
  description:
    "Auto, habitation, famille, santé : des couvertures comparées et négociées pour protéger ce que vous construisez.",
  alternates: { canonical: "/services/particuliers" },
}

export default function Page() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Services", path: "/services" },
          { name: "Particuliers", path: "/services/particuliers" },
        ])}
      />
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
              className={`flex items-start gap-4 py-6 sm:py-8 ${
                i % 2 === 1 ? "sm:pl-8" : "sm:pr-8"
              } ${
                i === coverages.length - 1 ? "" : "sm:border-b sm:border-border"
              }`}
            >
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5"
              >
                <item.icon className="size-5 text-primary" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-medium text-foreground">
                  {item.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.note}
                </p>
                {item.quote ? (
                  <Link
                    href={item.quote.href}
                    className="group/quote mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {item.quote.label}
                    <ArrowRight className="size-3.5 transition-transform group-hover/quote:translate-x-0.5" />
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/contact">
              Nous rencontrer
              <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
