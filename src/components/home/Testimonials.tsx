const testimonials = [
  {
    quote:
      "Après notre incendie, M. Martens a géré l’expertise de bout en bout. Nous n’avons jamais eu l’impression d’être un numéro de dossier.",
    name: "Famille Lambert",
    context: "Clients habitation & famille, Rocourt",
  },
  {
    quote:
      "En tant qu’indépendante, je n’avais ni le temps ni l’envie de comparer les assurances. Un rendez-vous a suffi pour tout remettre à plat et économiser.",
    name: "Sophie D.",
    context: "Kinésithérapeute indépendante, Liège",
  },
  {
    quote:
      "Vingt ans que Martens suit notre société. Flotte, bâtiments, assurance groupe : un seul appel, et c’est traité.",
    name: "Marc V.",
    context: "Administrateur de PME, 35 collaborateurs",
  },
]

export default function Testimonials() {
  return (
    <section aria-label="Témoignages de clients">
      <div className="container py-24 lg:py-32">
        <p className="reveal text-xs font-medium uppercase tracking-[0.22em] text-foreground">
          Ils nous font confiance
        </p>

        <div className="mt-8 grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:gap-x-8">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className={`reveal lg:col-span-6 ${
                i === 1
                  ? "lg:col-start-7 lg:translate-y-16"
                  : i === 2
                    ? "lg:col-start-3 lg:mt-8"
                    : ""
              }`}
            >
              <blockquote>
                <p className="font-display text-2xl font-medium leading-snug tracking-tight text-ink sm:text-[1.7rem]">
                  <span aria-hidden className="mr-1 text-accent">
                    "
                  </span>
                  {t.quote}
                  <span aria-hidden className="ml-1 text-accent">
                    "
                  </span>
                </p>
              </blockquote>
              <figcaption className="mt-5 flex items-baseline gap-3 border-l-2 border-accent pl-4">
                <span className="text-sm font-semibold text-foreground">
                  {t.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t.context}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
