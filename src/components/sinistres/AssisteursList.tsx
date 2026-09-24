type Assisteur = {
  name: string
  phoneDisplay: string
  phoneHref: string
}

const assisteurs: Assisteur[] = [
  {
    name: "Aedes Assistance",
    phoneDisplay: "04/340.56.23",
    phoneHref: "tel:+3243405623",
  },
  {
    name: "Allianz Assistance - Assistance Médicale",
    phoneDisplay: "02/290.61.00",
    phoneHref: "tel:+3222906100",
  },
  {
    name: "Allianz Assistance - Assistance Véhicule",
    phoneDisplay: "02/773.62.61",
    phoneHref: "tel:+3227736261",
  },
  {
    name: "ASSUDIS",
    phoneDisplay: "02/888.10.85",
    phoneHref: "tel:+3228881085",
  },
  {
    name: "AXA Assistance",
    phoneDisplay: "02/550.05.55",
    phoneHref: "tel:+3225500555",
  },
  {
    name: "Baloise Assistance",
    phoneDisplay: "03/870.95.70",
    phoneHref: "tel:+3238709570",
  },
  {
    name: "Europ Assistance",
    phoneDisplay: "02/533.75.75",
    phoneHref: "tel:+3225337575",
  },
  {
    name: "Vivium Assistance",
    phoneDisplay: "02/406.30.00",
    phoneHref: "tel:+3224063000",
  },
]

export default function AssisteursList() {
  return (
    <section className="bg-secondary">
      <div className="container py-16 lg:py-20">
        <h2 className="reveal max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
          Les numéros des services d’assistance par compagnie
        </h2>
        <dl className="mt-8 max-w-2xl">
          {assisteurs.map((assisteur) => (
            <div
              key={assisteur.name}
              className="border-t border-border first:border-t-0"
            >
              <a
                href={assisteur.phoneHref}
                className="flex items-center justify-between gap-4 py-4 text-sm sm:text-base"
              >
                <dt className="text-foreground">{assisteur.name}</dt>
                <dd className="shrink-0 font-semibold text-primary">
                  {assisteur.phoneDisplay}
                </dd>
              </a>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
