import Link from "next/link"
import {
  ArrowRight,
  Briefcase,
  HandCoins,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbSchema } from "@/lib/structured-data"

const coverages = [
  {
    icon: PiggyBank,
    name: "Épargne-pension",
    note: "un capital constitué à votre rythme",
    quote: { href: "/devis/epargne-pension", label: "Demander un devis" },
  },
  {
    icon: TrendingUp,
    name: "Assurance-placement (branche 21, 23 et 26)",
    note: "sécurité ou rendement, selon votre profil",
  },
  {
    icon: Briefcase,
    name: "PLCI & EIP",
    note: "pension complémentaire des indépendants et dirigeants d'entreprises",
  },
  {
    icon: ShieldCheck,
    name: "Solde restant dû",
    note: "assurer le remboursement de votre crédit en cas d'incapacité de travail ou de décès",
  },
  {
    icon: HandCoins,
    name: "Transmission de patrimoine",
    note: "préparer demain sereinement",
  },
]

export const metadata = {
  title: "Placements & Épargne — Martens Assurances",
  description:
    "Épargne-pension, assurance-placement, PLCI, EIP : une expertise épargne et investissement intégrée à votre conseil en assurances.",
  alternates: { canonical: "/services/placements-epargne" },
}

export default function Page() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Services", path: "/services" },
          {
            name: "Placements & Épargne",
            path: "/services/placements-epargne",
          },
        ])}
      />
      <PageHeader
        eyebrow="Placements & Épargne"
        title="Faire fructifier ce que vous avez construit."
        description="Constituer un capital, préparer sa pension, transmettre un patrimoine, couvrir les frais de succession, aider un proche, ... Nous comparons les solutions du marché pour bâtir une stratégie d'épargne adaptée à votre profil et à votre horizon."
        image={{
          src: "https://images.unsplash.com/photo-1633158829875-e5316a358c6f?w=1200&q=80&fm=jpg",
          alt: "Pièces et jeune pousse, symbole d'une épargne qui grandit",
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
