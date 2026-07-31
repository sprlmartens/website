import Image from "next/image"

const groups = [
  {
    src: "/Gerants-Martens-Assurances.png",
    alt: "Didier Develeer et Cécile Martens, administrateurs de Martens Assurances",
    members: [
      { name: "Didier Develeer", role: "Administrateur" },
      { name: "Cécile Martens", role: "Administratrice" },
    ],
  },
  {
    src: "/Collaborateurs-Martens-Assurances.png",
    alt: "Caroline Pirongs et Antonella Spinelli, gestionnaires chez Martens Assurances",
    members: [
      { name: "Caroline Pirongs", role: "Gestionnaire" },
      { name: "Antonella Spinelli", role: "Gestionnaire" },
    ],
  },
]

export default function Team() {
  return (
    <section id="equipe" className="bg-secondary">
      <div className="container py-24 lg:py-32">
        <h2 className="reveal max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
          L&rsquo;équipe
        </h2>
        <p className="reveal mt-6 max-w-xl text-lg leading-relaxed text-foreground/70">
          Quatre personnes, un seul bureau. Vous savez qui vous répond, et votre
          dossier ne change pas de mains.
        </p>

        <div className="reveal mt-14 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8 lg:mt-16 lg:gap-12">
          {groups.map((group) => (
            <figure key={group.src}>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={group.src}
                  alt={group.alt}
                  fill
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-6 grid grid-cols-2 gap-6 border-t border-border pt-5">
                {group.members.map((member) => (
                  <div key={member.name}>
                    <p className="font-display text-base font-medium text-foreground">
                      {member.name}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                ))}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
