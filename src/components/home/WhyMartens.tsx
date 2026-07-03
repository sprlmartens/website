import { Check } from "lucide-react"

const rows = [
  {
    benefit: "Conseil personnalisé",
    direct: "Un script, le même pour tous",
    martens: "Une analyse de votre situation, en personne",
  },
  {
    benefit: "Choix des couvertures",
    direct: "Les produits d’une seule compagnie",
    martens: "La comparaison de l’ensemble du marché",
  },
  {
    benefit: "En cas de sinistre",
    direct: "Un numéro vert et un dossier",
    martens: "Nous gérons et défendons votre dossier",
  },
  {
    benefit: "Dans la durée",
    direct: "Un contrat reconduit tacitement",
    martens: "Une relation suivie, revue à chaque étape de vie",
  },
  {
    benefit: "Placements & pension",
    direct: "Hors périmètre",
    martens: "Une expertise épargne et investissement intégrée",
  },
  {
    benefit: "Contact",
    direct: "Un chatbot, une file d’attente",
    martens: "Un visage, un bureau, une ligne directe",
  },
]

export default function WhyMartens() {
  return (
    <section className="bg-secondary">
      <div className="container py-24 lg:py-32">
        <h2 className="reveal mt-12 max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
          Un assureur vous vend une police.
          <br />
          Un courtier{" "}
          <em className="pen-underline not-italic text-primary">
            vous représente
          </em>
          .
        </h2>

        <div className="reveal mt-8 md:mt-16 overflow-hidden">
          {/* Column heads */}
          <div className="hidden grid-cols-12 gap-6 border-b border-border pb-4 md:grid">
            <p className="col-span-4"></p>
            <p className="col-span-4 text-xs font-medium uppercase tracking-widest text-foreground/80">
              Assureur direct
            </p>
            <p className="col-span-4 text-xs font-semibold uppercase tracking-widest text-primary">
              Le conseiller Martens
            </p>
          </div>

          <dl>
            {rows.map((row) => (
              <div
                key={row.benefit}
                className="grid grid-cols-1 gap-2 border-b border-border py-6 md:grid-cols-12 md:gap-6 md:py-5"
              >
                <dt className="font-display text-base font-medium text-foreground md:col-span-4 items-center">
                  {row.benefit}
                </dt>
                <dd className="flex gap-2 text-sm leading-relaxed text-foreground/80 md:col-span-4 items-center">
                  <span>
                    <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground md:hidden">
                      Assureur direct :
                    </span>
                    {row.direct}
                  </span>
                </dd>
                <dd className="flex gap-2 text-sm font-medium leading-relaxed text-foreground md:col-span-4 items-center">
                  <Check className="h-4 w-4 text-accent" />
                  <span>
                    <span className="mr-1 text-xs font-medium uppercase tracking-wide text-primary md:hidden">
                      Martens :
                    </span>
                    {row.martens}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
