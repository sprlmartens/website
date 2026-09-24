import Image from "next/image"
import { ShieldCheck, Users } from "lucide-react"

import { GoogleLogo, StarRating } from "@/components/ui/google-rating"
import { GOOGLE_REVIEWS } from "@/lib/google-reviews"

/**
 * Bandeau de crédibilité, juste sous le hero.
 *
 * Les trois premiers items sont des accréditations vérifiables par un tiers —
 * Google, la FSMA, Feprabel — et répondent à deux craintes distinctes : Google
 * atteste qu'on apprécie le bureau, la FSMA et Feprabel qu'il est légitime.
 * Elles se renforcent l'une l'autre et gagnent à être contiguës. Les deux
 * derniers items portent la différenciation, et non l'accréditation.
 */
const differentiators = [
  { icon: Users, label: "20+ ans — particuliers, indépendants, entreprises" },
  { icon: ShieldCheck, label: "Conseil indépendant, réactif en cas de sinistre" },
]

export default function TrustBar() {
  return (
    <section
      aria-label="Nos accréditations"
      className="reveal border-y border-border"
    >
      <div className="container">
        <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          <li className="flex items-center py-5 sm:px-6 lg:py-6 lg:pl-0">
            <a
              href={GOOGLE_REVIEWS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/g flex items-center gap-3"
            >
              <GoogleLogo className="size-5" />
              <span>
                <StarRating rating={GOOGLE_REVIEWS.rating} className="size-3.5" />
                <span className="mt-1 block text-[0.8rem] font-medium text-foreground/70 transition-colors group-hover/g:text-foreground">
                  {GOOGLE_REVIEWS.ratingLabel}/5 — {GOOGLE_REVIEWS.count} avis
                  Google
                </span>
              </span>
            </a>
          </li>

          <li className="flex items-center gap-3 py-5 sm:px-6 lg:border-l lg:border-border lg:py-6">
            <ShieldCheck className="size-5 shrink-0 text-accent" />
            <span className="text-[0.8rem] font-medium uppercase tracking-[0.14em] text-foreground/70">
              Agréé FSMA
              <span className="mt-0.5 block tracking-normal normal-case">
                n° 065799 A
              </span>
            </span>
          </li>

          <li className="flex items-center gap-3 py-5 sm:px-6 lg:border-l lg:border-border lg:py-6">
            <Image
              src="/feprabel-logo.svg"
              alt=""
              aria-hidden
              width={120}
              height={50}
              className="h-8 w-auto shrink-0"
            />
            <span className="text-[0.8rem] font-medium uppercase tracking-[0.14em] text-foreground/70">
              Membre Feprabel
            </span>
          </li>

          <li className="py-5 sm:px-6 lg:border-l lg:border-border lg:py-6">
            <ul className="space-y-2">
              {differentiators.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5">
                  <item.icon className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  <span className="text-[0.8rem] font-medium leading-snug text-foreground/70">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </section>
  )
}
