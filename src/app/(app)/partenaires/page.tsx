import Link from "next/link"
import { ArrowRight } from "lucide-react"

import PartnerGrid from "@/components/partners/PartnerGrid"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbSchema } from "@/lib/structured-data"

export const metadata = {
  title: "Partenaires - Martens Assurances",
  description:
    "Les compagnies et partenaires avec lesquels nous travaillons. Courtier indépendant, nous comparons le marché pour construire la protection adaptée à votre situation.",
  alternates: { canonical: "/partenaires" },
}

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: "Partenaires", path: "/partenaires" }])}
      />
      <PageHeader
        eyebrow="Partenaires"
        title="L’indépendance, garantie d’un conseil objectif."
        description="Nous ne dépendons d’aucune compagnie. C’est ce qui nous permet de comparer l’ensemble du marché, et de ne défendre qu’un seul intérêt : le vôtre."
      />

      <PartnerGrid />

      <section className="bg-primary text-white">
        <div className="container py-24 lg:py-32">
          <p className="reveal text-xs font-medium uppercase tracking-[0.22em] text-white/90">
            Notre approche
          </p>
          <p className="reveal mt-8 max-w-4xl font-display text-3xl font-medium leading-[1.2] tracking-tight sm:text-4xl lg:text-5xl">
            Vous offrir une vision claire, objective et globale, pour construire
            une protection{" "}
            <em className="pen-underline not-italic">réellement adaptée</em> à
            votre situation, tout en optimisant votre épargne et vos projets à
            long terme.
          </p>
          <div className="reveal mt-12 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="bg-accent text-white transition-colors hover:bg-accent-dark"
              asChild
            >
              <Link href="/contact">
                Parlons de votre situation
                <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
              </Link>
            </Button>
            <Link
              href="tel:+3242461363"
              className="rule-sweep text-base font-medium text-white"
            >
              ou appelez le +32 4 246 13 63
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
