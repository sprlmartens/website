import Image from "next/image"

// Source photos are ~180px wide: keep them small so they stay sharp.
const members = [
  {
    name: "Didier Develeer",
    role: "Administrateur",
    email: "didier.develeer@sprlmartens.be",
    photo: "/team/didier-develeer.webp",
  },
  {
    name: "Cécile Martens",
    role: "Administratrice",
    email: "cecile.martens@sprlmartens.be",
    photo: "/team/cecile-martens.webp",
  },
  {
    name: "Caroline Pirongs",
    role: "Gestionnaire",
    email: "assurances@sprlmartens.be",
    photo: "/team/caroline-pirongs.webp",
  },
  {
    name: "Antonella Spinelli",
    role: "Gestionnaire",
    email: "assurances@sprlmartens.be",
    photo: "/team/antonella-spinelli.webp",
  },
]

export default function Team() {
  return (
    <section id="equipe" className="bg-secondary">
      <div className="container py-16 lg:py-20">
        <h2 className="reveal max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
          L&rsquo;équipe
        </h2>
        <p className="reveal mt-6 max-w-xl text-lg leading-relaxed text-foreground/70">
          Quatre personnes, un seul bureau. Vous savez qui vous répond, et votre
          dossier ne change pas de mains.
        </p>

        <ul className="reveal mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:mt-16 lg:gap-x-12">
          {members.map((member) => (
            <li key={member.name} className="flex items-center gap-5">
              <Image
                src={member.photo}
                alt={`${member.name}, ${member.role.toLowerCase()} chez Martens Assurances`}
                width={96}
                height={96}
                className="size-24 shrink-0 rounded-full object-cover object-top shadow-md"
              />
              <div className="min-w-0">
                <p className="font-display text-base font-medium text-foreground">
                  {member.name}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {member.role}
                </p>
                <a
                  href={`mailto:${member.email}`}
                  className="mt-3 block break-all text-sm text-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {member.email}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
