import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container grid grid-cols-1 lg:grid-cols-2 items-end gap-12 pb-16 pt-14 md:pt-20 lg:gap-16 lg:pb-24">
        {/* Text block */}
        <div className="">
          <p className="rise text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Courtier indépendant - depuis plus de 20 ans
          </p>
          <h1 className="rise-1 mt-8 font-display text-5xl font-medium leading-[1.04] tracking-tight text-foreground lg:text-[4rem]">
            Un lien de confiance pour vous
            {/* <br />
            c&rsquo;est d&rsquo;abord */}
            <br />
            <p className="text-primary">assurer en toute sérénité</p>
          </h1>
          <p className="rise-2 mt-8 text-[18px] tracking-tight text-foreground">
            Depuis plus de 20 ans, nous accompagnons particuliers, indépendants
            et organisations dans des moments où chaque décision compte.
            <span className="block h-2" />
            Au fil de notre parcours, nous avons développé une conviction forte
            : une bonne assurance ne dépend pas d’un produit, mais de la qualité
            du conseil.
            <span className="block h-2" />
            Aujourd’hui, en tant que courtier indépendant, nous mettons notre
            expérience au service d’une approche différente : plus claire, plus
            humaine, plus engagée afin de vous offrir des solutions adaptées à
            vos besoins.
            <span className="block h-2" />
            Nous vous aidons à décider avec clarté, pour protéger efficacement
            ce qui vous est essentiel.
          </p>
          <div className="rise-3 mt-10 flex flex-wrap items-center gap-6">
            <Button size="lg" asChild>
              <Link href="#contact">
                Obtenir un conseil personnalisé
                <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
              </Link>
            </Button>
            {/* <Link
              href="#contact"
              className="rule-sweep text-sm font-medium text-primary"
            >
              Demander une simulation
            </Link> */}
          </div>
        </div>

        {/* Photo column, deliberately offset */}
        <div className="rise-2 relative hidden self-center lg:block">
          <figure className="duotone relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80&fm=jpg"
              alt="Conversation de conseil autour d'une table, carnet de notes ouvert"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </figure>
          <div className="absolute -left-2 bottom-6 z-10 max-w-[16rem] rounded-lg bg-white p-6 shadow-xl lg:bottom-16">
            <p className="text-foreground font-medium text-xl">
              L&apos;exigence au service de vos projets
            </p>
            <p className="mt-2 text-4xl tracking-tight font-semibold text-primary">
              +20 ans
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
