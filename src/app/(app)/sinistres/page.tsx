import Link from "next/link"

import { PageHeader } from "@/components/PageHeader"
import AssisteursList from "@/components/sinistres/AssisteursList"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Sinistres — Martens Assurances",
  description:
    "En cas de sinistre, contactez directement votre assisteur : les numéros de tous les assisteurs, disponibles 24h/24.",
}

export default function Page() {
  return (
    <main>
      <PageHeader
        eyebrow="En cas de sinistre"
        title="Le bon réflexe, tout de suite."
        description="Panne, accident, dégât des eaux : n'attendez pas notre feu vert. Contactez directement l'assisteur repris sur votre contrat, disponible 24h/24. Nous reprenons le dossier avec vous juste après."
      />

      <section className="bg-background">
        <div className="container max-w-2xl py-16 lg:py-20">
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Qu&rsquo;est-ce qu&rsquo;un assisteur ?
          </h2>
          <p className="mt-6 text-base leading-relaxed text-foreground">
            Votre contrat d&rsquo;assurance (auto, habitation) inclut souvent
            une couverture assistance, gérée par une société spécialisée :
            l&rsquo;assisteur. C&rsquo;est elle qui organise le remorquage, le
            dépannage, le logement d&rsquo;urgence ou l&rsquo;envoi
            d&rsquo;un plombier — 24h/24 et 7j/7, sans devoir passer par nous.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Retrouvez le nom de votre assisteur sur votre carte verte, votre
            police d&rsquo;assurance ou votre certificat d&rsquo;assistance.
            En cas de doute, appelez-nous : nous vérifions votre contrat en
            quelques minutes.
          </p>
        </div>
      </section>

      <AssisteursList />

      <section className="bg-primary text-primary-foreground">
        <div className="container py-20">
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Et après l&rsquo;urgence ?
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/90">
            Une fois l&rsquo;assisteur prévenu, le plus dur est fait.
            Contactez-nous pour la suite : déclaration, expertise, suivi du
            dossier jusqu&rsquo;à l&rsquo;indemnisation. C&rsquo;est notre
            métier.
          </p>
          <div className="mt-8">
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="inline-flex items-center border border-primary-foreground/30 text-sm font-semibold text-primary-foreground transition-colors hover:border-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link href="tel:+3242461363">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
