function ServiceRow({
  name,
  note,
  tone = "light",
}: {
  name: string
  note: string
  tone?: "light" | "dark"
}) {
  const border = tone === "dark" ? "border-white/15" : "border-border"
  const title = tone === "dark" ? "text-white" : "text-foreground"
  const sub = tone === "dark" ? "text-white/80" : "text-muted-foreground"
  return (
    <li className={`group border-b ${border}`}>
      <div className="flex items-baseline justify-between gap-6 py-4">
        <span
          className={`text-lg font-medium ${title} transition-transform duration-300 group-hover:translate-x-2`}
        >
          {name}
          <span className={`ml-3 hidden text-sm font-normal sm:inline ${sub}`}>
            {note}
          </span>
        </span>
        {/* <span
          aria-hidden
          className="text-accent opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
        >
          →
        </span> */}
      </div>
    </li>
  )
}

export default function Services() {
  return (
    <section aria-label="Nos domaines de conseil">
      {/* ---- Particuliers: editorial list right ---- */}
      <div id="particuliers" className="container scroll-mt-24 py-24 lg:py-32">
        <div className="reveal grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="flex items-baseline gap-4 text-xs font-semibold uppercase tracking-widest text-foreground">
              Particuliers &amp; familles
            </p>
            <h2 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
              Protéger ce que
              <br />
              vous construisez.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
              Votre maison, votre voiture, votre famille, votre avenir. Un
              conseiller unique qui connaît votre dossier et le défend.
            </p>
          </div>
          <ul className="self-center lg:col-span-6 lg:col-start-7">
            <ServiceRow
              name="Auto"
              note="du conducteur jeune à la voiture de collection"
            />
            <ServiceRow
              name="Habitation"
              note="incendie, vol, dégâts des eaux"
            />
            <ServiceRow
              name="Famille"
              note="responsabilité civile vie privée"
            />
            <ServiceRow name="Santé" note="hospitalisation et soins" />
            <ServiceRow
              name="Épargne"
              note="constituer un capital, à votre rythme"
            />
            <ServiceRow name="Pension" note="préparer demain dès aujourd'hui" />
          </ul>
        </div>
      </div>

      {/* ---- Indépendants: reversed composition ---- */}
      <div id="independants" className="scroll-mt-24 bg-navy-900 text-white">
        <div className="container py-24 lg:py-32">
          <div className="reveal grid grid-cols-1 gap-12 lg:grid-cols-12">
            <ul className="order-2 self-center lg:order-1 lg:col-span-6">
              <ServiceRow
                tone="dark"
                name="Protection des revenus"
                note="en cas d'incapacité de travail"
              />
              <ServiceRow
                tone="dark"
                name="Responsabilité professionnelle"
                note="exercer l'esprit libre"
              />
              <ServiceRow
                tone="dark"
                name="Véhicules"
                note="utilitaires et déplacements pro"
              />
              <ServiceRow
                tone="dark"
                name="Pension complémentaire"
                note="PLCI, EIP : optimiser fiscalement"
              />
            </ul>
            <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8">
              <p className="flex items-baseline gap-4 text-xs font-semibold uppercase tracking-widest text-white/80">
                Indépendants
              </p>
              <h2 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                Votre activité repose
                <br />
                sur vous. Et vous ?
              </h2>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-white/80">
                Quand on est son propre patron, personne ne cotise à votre
                place. Nous structurons votre protection et votre pension comme
                un plan, pas comme une pile de polices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Entreprises: wide horizontal composition ---- */}
      <div id="entreprises" className="container scroll-mt-24 py-24 lg:py-32">
        <div className="reveal">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="flex items-baseline gap-4 text-xs font-semibold uppercase tracking-widest text-foreground">
                Entreprises
              </p>
              <h2 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
                Des risques maîtrisés,
                <br />
                une croissance sereine.
              </h2>
            </div>
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              De la PME familiale à la flotte de cinquante véhicules : un audit
              de vos risques, des couvertures négociées, un interlocuteur qui
              répond.
            </p>
          </div>
          <ul className="mt-12 grid grid-cols-1 border-t border-border sm:grid-cols-2 lg:grid-cols-5 lg:border-t-0">
            {[
              { name: "Flottes", note: "véhicules & conducteurs" },
              { name: "Responsabilité", note: "RC exploitation & produits" },
              { name: "Protection juridique", note: "défendre vos intérêts" },
              { name: "Cyber", note: "données, fraude, continuité" },
              { name: "Assurances collectives", note: "fidéliser vos équipes" },
            ].map((s, i) => (
              <li
                key={s.name}
                className={`group border-b border-border lg:border-b-0 lg:border-t lg:py-2 ${
                  i > 0 ? "lg:border-l lg:pl-6" : ""
                }`}
              >
                <div className="block py-5">
                  <span className="font-display text-sm text-muted-foreground/70">
                    0{i + 1}
                  </span>
                  <p className="mt-2 text-lg font-medium text-foreground">
                    {s.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
                  {/* <span
                    aria-hidden
                    className="mt-3 inline-block text-accent opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  >
                    →
                  </span> */}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
