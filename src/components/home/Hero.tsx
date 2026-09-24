import Image from "next/image"
import Link from "next/link"
import { ArrowRight, PhoneCall } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  GoogleLogo,
  GoogleRatingStrip,
  StarRating,
} from "@/components/ui/google-rating"

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container grid grid-cols-1 items-center gap-12 pb-16 pt-14 md:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-24">
        {/* Text block */}
        <div>
          {/* L'exergue porte l'intention de recherche locale (service + ville),
              ce que le titre — volontairement plus incarné — ne fait pas. */}
          {/* <p className="rise text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Courtier indépendant en assurances — Liège
          </p> */}
          <h1 className="rise-1 mt-8 font-display text-5xl font-medium leading-[1.04] tracking-tight text-foreground lg:text-[3.5rem]">
            Un lien de confiance pour&nbsp;vous{" "}
            <span className="block text-primary">
              assurer en toute sérénité
            </span>
          </h1>
          {/* Deux lignes, pas davantage : le récit long (conviction,
              indépendance, conseil) est déjà porté par le Manifeste. */}
          <p className="rise-2 mt-8 max-w-xl text-[18px] leading-relaxed tracking-tight text-foreground">
            Depuis plus de 20 ans, notre approche repose sur la conviction{" "}
            <span className="font-semibold text-foreground">
              qu’une bonne assurance ne dépend pas d’un produit, mais de la
              qualité du conseil
            </span>
            . Nous défendons vos intérêts en assurances et en placements.
          </p>

          <div className="rise-3 mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href="#contact">
                Obtenir un conseil personnalisé
                <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
              </Link>
            </Button>
            {/* Second niveau d'engagement : pour une bonne part de la
                clientèle, le téléphone reste le canal le plus direct. */}
            <Button size="lg" variant="outline" asChild>
              <Link href="tel:+3242461363">
                <PhoneCall className="h-4 w-4" />
                04 246 13 63
              </Link>
            </Button>
          </div>

          {/* La preuve sociale est accolée aux CTA — au moment précis de la
              décision — et reste visible à tous les breakpoints. */}
          <GoogleRatingStrip className="rise-3 mt-8" />
        </div>

        {/* Photo column */}
        <div className="rise-2 relative self-center">
          <figure className="duotone-soft relative ml-auto aspect-4/3 w-full overflow-hidden rounded-2xl">
            <Image
              src="/team/hero-martens.jpg"
              alt="Didier Develeer et Cécile Martens, administrateurs de Martens Assurances"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </figure>

          <div className="absolute -bottom-12 -left-12 z-10 hidden max-w-64 rounded-lg bg-white p-5 shadow-xl lg:block">
            <div className="flex items-center gap-2">
              <GoogleLogo />
              <StarRating rating={5} />
            </div>
            <p className="mt-3 text-sm leading-snug text-foreground">
              «&nbsp;Enfin tombé sur la perle rare. Quelqu&rsquo;un qui vous
              écoute et qui vous répond dans de brefs délais.&nbsp;»
            </p>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Thierry L. — avis Google
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
