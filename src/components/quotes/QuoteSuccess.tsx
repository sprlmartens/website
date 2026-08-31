import Link from "next/link"
import { CheckIcon, PhoneCall } from "lucide-react"

import { Button } from "@/components/ui/button"

export function QuoteSuccess({ email }: { email: string }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <span
        aria-hidden
        className="mx-auto flex size-14 items-center justify-center rounded-full border border-primary/20 bg-primary/5"
      >
        <CheckIcon className="size-6 text-primary" />
      </span>
      <h2 className="mt-6 font-display text-3xl font-medium text-foreground">
        Votre demande est bien partie.
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Un récapitulatif vient d’être envoyé à {email}. Un conseiller vous
        recontacte sous deux jours ouvrables avec une proposition adaptée.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/services/particuliers">Retour aux assurances</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="tel:+3242461363">
            <PhoneCall className="size-4" />
            +32 4 246 13 63
          </a>
        </Button>
      </div>
    </div>
  )
}
