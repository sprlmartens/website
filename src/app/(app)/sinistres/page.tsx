import Claims from "@/components/home/Claims"

export const metadata = {
  title: "Sinistres — Martens Assurances",
  description:
    "En cas de sinistre, Martens Assurances gère votre dossier et défend vos intérêts auprès de la compagnie, du premier appel jusqu'à l'indemnisation.",
}

export default function Page() {
  return (
    <main>
      <Claims />
    </main>
  )
}
