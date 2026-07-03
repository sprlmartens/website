import Link from "next/link"
import { Mail, PhoneCall } from "lucide-react"

import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Demande de simulation — Martens Assurances",
  description:
    "Demandez une simulation gratuite et sans engagement pour vos assurances ou vos placements.",
}

export default function Page() {
  return (
    <main>
      <PageHeader
        eyebrow="Demande de simulation"
        title="Trente minutes suffisent pour y voir clair."
        description="Décrivez-nous votre situation par téléphone ou par e-mail : nous revenons vers vous avec une simulation chiffrée et un avis honnête, sans engagement."
      />
      <div className="container py-16 lg:py-20">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" asChild>
            <Link href="tel:+3242461363">
              <PhoneCall className="h-4 w-4" />
              +32&nbsp;4&nbsp;246&nbsp;13&nbsp;63
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="mailto:assurances@sprlmartens.be">
              <Mail className="h-4 w-4" />
              assurances@sprlmartens.be
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
