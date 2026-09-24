import { Star } from "lucide-react"

import { GOOGLE_REVIEWS } from "@/lib/google-reviews"
import { cn } from "@/lib/utils"

export function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("size-4 shrink-0", className)}
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

/**
 * Les étoiles pleines sont arrondies à l'entier le plus proche (4,9 → 5).
 * La note exacte est toujours affichée en toutes lettres juste à côté, et
 * reprise dans `aria-label` : l'arrondi reste donc lisible et non trompeur.
 */
export function StarRating({
  rating,
  className,
}: {
  rating: number
  className?: string
}) {
  const filled = Math.round(rating)

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating.toString().replace(".", ",")} sur 5 étoiles`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < filled ? "fill-accent text-accent" : "fill-none text-foreground/20",
            className,
          )}
        />
      ))}
    </div>
  )
}

/**
 * Bandeau de preuve sociale : logo Google + étoiles + note et nombre d'avis,
 * cliquable vers la fiche Google. Le lien est essentiel — un chiffre
 * invérifiable se lit comme du marketing, un lien comme une invitation à
 * vérifier.
 */
export function GoogleRatingStrip({ className }: { className?: string }) {
  return (
    <a
      href={GOOGLE_REVIEWS.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group/rating inline-flex flex-wrap items-center gap-x-3 gap-y-1.5",
        className,
      )}
    >
      <GoogleLogo className="size-5" />
      <StarRating rating={GOOGLE_REVIEWS.rating} />
      <span className="text-sm text-foreground/70">
        <strong className="font-semibold text-foreground">
          {GOOGLE_REVIEWS.ratingLabel}/5
        </strong>{" "}
        sur{" "}
        <strong className="font-semibold text-foreground">
          {GOOGLE_REVIEWS.count}
        </strong>{" "}
        <span className="underline decoration-foreground/25 underline-offset-4 transition-colors group-hover/rating:decoration-foreground">
          avis Google
        </span>
      </span>
    </a>
  )
}
