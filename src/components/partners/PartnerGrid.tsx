import Image from "next/image"

type Partner = {
  name: string
  src: string
  /** Dimensions intrinsèques, pour le ratio et le srcset. */
  width: number
  height: number
  /**
   * Hauteur de rendu, réglée logo par logo.
   *
   * Les onze logos vont du carré (AXA, DAS, DELA, Jean Verheyen) au
   * logotype très large (Baloise, presque 5:1). À hauteur égale, Baloise
   * occuperait cinq fois la largeur d'AXA et écraserait toute la grille.
   * On compense donc à l'inverse du ratio : plus un logo est large, plus
   * on le pose bas. C'est le seul champ à retoucher si l'équilibre
   * optique d'une cellule paraît faux à l'écran.
   */
  size: string
}

/**
 * Ordre alphabétique, sans regroupement par métier : la page présente les
 * partenaires comme une liste de référence, pas comme une sélection classée.
 */
const partners: Partner[] = [
  {
    name: "Aedes",
    src: "/aedes-logo.svg",
    width: 279,
    height: 123,
    size: "h-14",
  },
  {
    name: "Assudis",
    src: "/assudis-logo.png",
    width: 279,
    height: 123,
    size: "h-12",
  },
  {
    name: "Athora",
    src: "/athora-logo.svg",
    width: 279,
    height: 123,
    size: "h-11",
  },
  {
    name: "Allianz",
    src: "/allianz-logo.svg",
    width: 279,
    height: 123,
    size: "h-11",
  },
  { name: "AXA", src: "/axa-logo.svg", width: 80, height: 80, size: "h-14" },
  {
    name: "Baloise",
    src: "/baloise-logo.png",
    width: 1182,
    height: 241,
    size: "h-8",
  },
  {
    name: "DAS",
    src: "/das-logo.png",
    width: 2400,
    height: 2400,
    size: "h-18",
  },
  {
    name: "DELA",
    src: "/dela-logo.png",
    width: 2500,
    height: 2500,
    size: "h-22",
  },
  { name: "DKV", src: "/DKV-logo.svg", width: 1024, height: 255, size: "h-8" },
  {
    name: "Euromex",
    src: "/euromex.png",
    width: 285,
    height: 121,
    size: "h-14",
  },
  {
    name: "Europ Assistance",
    src: "/europ-assistance-logo.png",
    width: 215,
    height: 129,
    size: "h-14",
  },
  {
    name: "Jean Verheyen",
    src: "/jean-verheyen-logo.png",
    width: 215,
    height: 215,
    size: "h-22",
  },
  {
    name: "Legal Village",
    src: "/legal-village-logo.png",
    width: 221,
    height: 149,
    size: "h-14",
  },
  {
    name: "Vivium",
    src: "/vivium-logo.png",
    width: 2760,
    height: 1200,
    size: "h-12",
  },
]

export default function PartnerGrid() {
  return (
    <section aria-labelledby="partenaires-titre" className="bg-secondary">
      <div className="container py-16 lg:py-20">
        <h2
          id="partenaires-titre"
          className="reveal max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl"
        >
          Nos partenaires
        </h2>
        <div className="reveal mt-6 max-w-2xl">
          <p className="text-lg leading-relaxed text-foreground">
            À l’heure du « tout en ligne », s’assurer en quelques clics peut
            sembler suffisant. Mais une protection efficace ne se limite pas à
            une seule compagnie.
          </p>
          <p className="mt-6 text-base leading-relaxed text-foreground/70">
            En tant que courtiers en assurances indépendants, nous vous donnons
            accès à un écosystème de partenaires reconnus, afin de comparer,
            sélectionner et structurer les solutions les plus pertinentes.
          </p>
        </div>

        <ul className="reveal mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:mt-16 lg:grid-cols-4 lg:gap-5">
          {partners.map((partner) => (
            <li
              key={partner.name}
              className="flex h-24 items-center justify-center rounded-2xl border border-border bg-white px-4 lg:h-28 lg:px-6"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                sizes="(min-width: 1024px) 240px, (min-width: 640px) 200px, 160px"
                className={`${partner.size} w-auto max-w-full object-contain`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
