const testimonials = [
  {
    quote:
      "Une équipe proactive qui veille régulièrement, de sa propre initiative, à vérifier et optimiser les contrats. Ils n'hésitent pas à les revoir afin de garantir les meilleures couvertures au meilleur prix. Un service sérieux, attentif et toujours orienté dans l'intérêt du client.",
    name: "Sébastien V.",
  },
  {
    quote:
      "Après de multiples expériences avec de nombreux courtier, je suis enfin tombé sur la perle rare. Quelqu'un qui vous écoute, qui vous répond avec réponse circonstanciée et cela dans de brefs délais. J'y ai transféré toutes mes assurances et aucun regret. La quasi totalité de mes primes ont diminué.",
    name: "Thierry L.",
  },
  {
    quote:
      "Je tiens à souligner la qualité exceptionnelle de cette compagnie d’assurance. Dès le premier contact, j’ai été accueillie avec beaucoup de professionnalisme et de sympathie, ce qui met immédiatement en confiance. Le suivi est irréprochable : chaque demande est traitée avec attention et rapidité, et on se sent réellement accompagné à chaque étape. L’équipe fait preuve de grandes compétences et sait apporter des solutions claires et efficaces, même dans des situations plus complexes. Le service est fluide, réactif et parfaitement organisé, ce qui est très appréciable au quotidien. Et pour couronner le tout, les tarifs proposés sont particulièrement compétitifs au vu de la qualité offerte. Une expérience client exemplaire que je recommande sans hésitation !",
    name: "Christine M.",
  },
]

export default function Testimonials() {
  return (
    <section aria-label="Témoignages de clients">
      <div className="container py-24 lg:py-32">
        <p className="reveal text-xs font-medium uppercase tracking-[0.22em] text-foreground">
          Ils nous font confiance
        </p>

        <div className="mt-8 grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:gap-x-12">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className={`reveal lg:col-span-6 ${
                i === 1
                  ? "lg:col-start-7 lg:translate-y-16"
                  : i === 2
                    ? "lg:col-start-3 lg:mt-10 lg:col-span-8"
                    : ""
              }`}
            >
              <blockquote>
                <p className="font-display text-base font-medium leading-snug tracking-tight text-foreground sm:text-xl">
                  <span aria-hidden className="mr-1 text-accent">
                    "
                  </span>
                  {t.quote}
                  <span aria-hidden className="ml-1 text-accent">
                    "
                  </span>
                </p>
              </blockquote>
              <figcaption className="mt-5 flex items-baseline gap-3">
                <span className="text-sm font-semibold text-foreground/70">
                  {t.name}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
