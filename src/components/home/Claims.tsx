import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"

const steps = [
  {
    title: "Vous nous appelez",
    text: "Pas de plateforme, pas de file d’attente. Vous parlez à quelqu’un qui connaît votre dossier.",
  },
  {
    title: "Nous prenons le relais",
    text: "Déclaration, expertise, échanges avec la compagnie : nous gérons chaque étape et défendons vos intérêts.",
  },
  {
    title: "Vous êtes indemnisé",
    text: "Nous suivons votre dossier jusqu’au paiement et nous restons là après.",
  },
]

export default function Claims() {
  return (
    <section
      id="sinistre"
      className="relative scroll-mt-24 overflow-hidden bg-navy-900 text-white"
    >
      {/* Documentary backdrop */}
      <div className="duotone absolute inset-0 opacity-35" aria-hidden>
        <Image
          src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=1800&q=70&fm=jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/40"
        aria-hidden
      />

      <div className="container relative py-28 lg:py-40">
        <p className="reveal text-xs font-medium uppercase tracking-[0.22em] text-white/80">
          En cas de sinistre
        </p>
        <h2 className="reveal mt-8 max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
          Présent quand cela
          <br />
          compte <span className="pen-underline">vraiment</span>.
        </h2>
        <p className="reveal mt-8 max-w-xl text-lg leading-relaxed text-white/90">
          Un dégât des eaux un dimanche soir. Un accident sur l&rsquo;autoroute.
          Un incendie dans l&rsquo;atelier. C&rsquo;est dans ces moments-là
          qu&rsquo;on mesure la valeur d&rsquo;un courtier, pas à la signature
          du contrat.
        </p>

        <ol className="reveal mt-16 grid max-w-4xl grid-cols-1 gap-10 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t border-border/20 pt-5">
              <span className="font-display text-sm text-accent">0{i + 1}</span>
              <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                {step.text}
              </p>
            </li>
          ))}
        </ol>

        <div className="reveal mt-14 flex flex-wrap items-center gap-6">
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="inline-flex items-center border border-border/30 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-primary"
          >
            <Link href="tel:+3242630000">Assistance en cas de sinistre</Link>
          </Button>
          <p className="text-sm text-white/90">
            Réponse rapide, suivi personnel.
          </p>
        </div>
      </div>
    </section>
  )
}
