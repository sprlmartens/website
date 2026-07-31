import { Star } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type GoogleReview = {
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  quote: string
}

const reviews: GoogleReview[] = [
  {
    name: "Sébastien V.",
    rating: 5,
    quote:
      "Une équipe proactive qui veille régulièrement, de sa propre initiative, à vérifier et optimiser les contrats. Ils n'hésitent pas à les revoir afin de garantir les meilleures couvertures au meilleur prix. Un service sérieux, attentif et toujours orienté dans l'intérêt du client.",
  },
  {
    name: "Thierry L.",
    rating: 5,
    quote:
      "Après de multiples expériences avec de nombreux courtier, je suis enfin tombé sur la perle rare. Quelqu'un qui vous écoute, qui vous répond avec réponse circonstanciée et cela dans de brefs délais. J'y ai transféré toutes mes assurances et aucun regret. La quasi totalité de mes primes ont diminué.",
  },
  {
    name: "Christine M.",
    rating: 5,
    quote:
      "Je tiens à souligner la qualité exceptionnelle de cette compagnie d’assurance. Dès le premier contact, j’ai été accueillie avec beaucoup de professionnalisme et de sympathie, ce qui met immédiatement en confiance. Le suivi est irréprochable : chaque demande est traitée avec attention et rapidité, et on se sent réellement accompagné à chaque étape. L’équipe fait preuve de grandes compétences et sait apporter des solutions claires et efficaces, même dans des situations plus complexes. Le service est fluide, réactif et parfaitement organisé, ce qui est très appréciable au quotidien. Et pour couronner le tout, les tarifs proposés sont particulièrement compétitifs au vu de la qualité offerte. Une expérience client exemplaire que je recommande sans hésitation !",
  },
  {
    name: "Laurent R.",
    rating: 5,
    quote:
      "Le cabinet d'expertise et de conseil en assurances est remarquable. Sa réactivité et son professionnalisme sont rares de nos jours. J'ai déplacé toutes mes assurances, tant personnelles que professionnelles, vers leur bureau. La responsable, extrêmement réactive, prodigue des conseils judicieux, est bien organisée et structurée. Ses tarifs sont tout à fait raisonnables, offrant un excellent rapport qualité-prix. Bravo pour maintenir cette qualité de service. Vous faites vraiment la différence dans ce marché souvent impitoyable.",
  },
  {
    name: "Patrick H.",
    rating: 5,
    quote:
      "Un suivi sur mesure et une proactivité permanente font de cette agence une référence dans le secteur.",
  },
  {
    name: "Justine S.",
    rating: 5,
    quote:
      "Cela fait maintenant presque 10 ans que toutes mes assurances sont gérées par SPRL Martens. Au-delà d'un service irréprochable, j'apprécie surtout l'aspect humain : on n'a jamais l'impression d'être un numéro, mais bien une personne face à une vraie équipe disponible, à l'écoute et réactive. Le suivi est personnalisé, les conseils sont clairs et on sent qu'il y a une vraie volonté d'aider et de trouver des solutions adaptées. Une qualité de service devenue rare aujourd'hui.",
  },
]

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} sur 5 étoiles`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "size-4 fill-accent text-accent"
              : "size-4 fill-none text-foreground/20"
          }
        />
      ))}
    </div>
  )
}

export default function GoogleReviews() {
  return (
    <section aria-label="Avis Google de nos clients" className="bg-secondary">
      <div className="container py-24 lg:py-32">
        <p className="reveal text-xs font-medium uppercase tracking-[0.22em] text-foreground">
          Ils nous font confiance
        </p>

        <Carousel
          opts={{ align: "start", loop: false }}
          className="reveal mt-8 w-full"
        >
          <CarouselContent className="-ml-6">
            {reviews.map((review, i) => (
              <CarouselItem
                key={i}
                className="basis-full pl-6 sm:basis-1/2 lg:basis-1/3"
              >
                <figure className="flex h-full flex-col">
                  <StarRating rating={review.rating} />
                  <blockquote className="mt-4 flex-1">
                    <p className="line-clamp-10 font-display text-base font-medium leading-snug tracking-tight text-foreground sm:text-xl">
                      <span aria-hidden className="mr-1 text-accent">
                        {'"'}
                      </span>
                      {review.quote}
                      <span aria-hidden className="ml-1 text-accent">
                        {'"'}
                      </span>
                    </p>
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-2">
                    <GoogleLogo />
                    <span className="text-sm font-semibold text-foreground/70">
                      {review.name}
                    </span>
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-8 flex items-center justify-end gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>

        <a
          href="https://www.google.com/maps?cid=14258516955292374392&hl=fr-BE"
          target="_blank"
          rel="noopener noreferrer"
          className="reveal mt-8 inline-block text-sm font-semibold text-foreground underline underline-offset-4"
        >
          Voir tous nos avis Google →
        </a>
      </div>
    </section>
  )
}
