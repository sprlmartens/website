import Image from "next/image"
import Link from "next/link"

import { PageHeader } from "@/components/page-header"
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
        description="Le jour où quelque chose arrive, ayez le bon reflexe, contactez l’assistance de votre compagnie d’assurance joignable 24h/24."
        image={{
          src: "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=1200&q=80&fm=jpg",
          alt: "Conseiller au téléphone, assistance client",
        }}
      />

      <AssisteursList />

      <section className="bg-background">
        <div className="container grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
          <figure className="duotone relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl lg:col-span-5">
            <Image
              src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=1200&q=80&fm=jpg"
              alt="Intervention d'urgence sur la voie publique"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </figure>

          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              Qu&rsquo;est-ce qu&rsquo;un assisteur ?
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground">
              Votre contrat d&rsquo;assurance (auto, habitation) inclut souvent
              une couverture assistance, gérée par une société spécialisée :
              l&rsquo;assisteur. C&rsquo;est elle qui organise le remorquage, le
              dépannage, le logement d&rsquo;urgence ou l&rsquo;envoi d&rsquo;un
              plombier - 24h/24 et 7j/7, sans devoir passer par nous.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Retrouvez le nom de votre assisteur sur votre carte verte, votre
              police d&rsquo;assurance ou votre certificat d&rsquo;assistance.
              En cas de doute, appelez-nous : nous vérifions votre contrat en
              quelques minutes.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="container py-20">
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            Et après l&rsquo;urgence ?
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90">
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
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
