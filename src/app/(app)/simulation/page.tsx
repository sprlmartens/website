import Link from "next/link"
import { Mail, PhoneCall } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Demande de simulation — Martens Assurances",
  description:
    "Demandez une simulation gratuite et sans engagement pour vos assurances ou vos placements.",
  // La page n'est pas encore construite (contenu à faire) : on empêche son
  // indexation tout en laissant les robots suivre ses liens. À retirer une
  // fois le contenu en place, et à réintégrer dans app/sitemap.ts.
  robots: { index: false, follow: true },
  alternates: { canonical: "/simulation" },
}

export default function Page() {
  return (
    <main>
      <PageHeader
        eyebrow="Demande de simulation"
        title="TODO"
        description="TODO"
        image={{
          src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&fm=jpg",
          alt: "Personne consultant des documents financiers avec une calculatrice",
        }}
      />
      <div className="container py-16 lg:py-20"></div>
    </main>
  )
}
