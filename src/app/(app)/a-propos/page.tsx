import { PageHeader } from "@/components/PageHeader"
import Manifesto from "@/components/home/Manifesto"
import WhyMartens from "@/components/home/WhyMartens"
import TrustBar from "@/components/home/TrustBar"

export const metadata = {
  title: "À propos — Martens Assurances",
  description:
    "Courtier indépendant en assurances et en placements à Rocourt (Liège), depuis plus de 20 ans au service des familles, indépendants et entreprises.",
}

export default function Page() {
  return (
    <main>
      <PageHeader
        eyebrow="À propos"
        title="Un courtier indépendant, à taille humaine."
        description="Depuis plus de 20 ans, nous accompagnons les familles, les indépendants et les entreprises dans leurs choix de protection et de placement — avec un seul objectif : votre intérêt, pas celui d'une compagnie."
      />
      <TrustBar />
      <Manifesto />
      <WhyMartens />
    </main>
  )
}
