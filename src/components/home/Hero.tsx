import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container grid grid-cols-1 items-end gap-12 pb-16 pt-14 md:pt-20 lg:grid-cols-12 lg:gap-8 lg:pb-24">
        {/* Text block */}
        <div className="lg:col-span-7">
          <p className="rise text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Courtier indépendant - depuis plus de 20 ans
          </p>
          <h1 className="rise-1 mt-8 font-display text-6xl font-medium leading-[1.04] tracking-tight text-foreground lg:text-[4.5rem]">
            Bien assuré,
            <br />
            c&rsquo;est d&rsquo;abord
            <br />
            <p className="text-primary">bien conseillé.</p>
          </h1>
          <p className="rise-2 mt-8 max-w-md text-lg leading-relaxed text-foreground/70">
            Martens Assurances accompagne les familles, les indépendants et les
            entreprises dans leurs décisions de protection et de placement. Un
            seul interlocuteur, toutes les compagnies, votre intérêt
            d&rsquo;abord.
          </p>
          <div className="rise-3 mt-10 flex flex-wrap items-center gap-6">
            <Button size="lg" asChild>
              <Link href="#contact">
                Demander une simulation
                <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
              </Link>
            </Button>
            <Link
              href="#contact"
              className="rule-sweep text-sm font-medium text-primary"
            >
              Contactez-nous
            </Link>
          </div>
        </div>

        {/* Photo column, deliberately offset */}
        <div className="rise-2 hidden lg:block relative lg:col-span-5">
          <figure className="duotone relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl lg:translate-y-8">
            <Image
              src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80&fm=jpg"
              alt="Conversation de conseil autour d'une table, carnet de notes ouvert"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </figure>
          <div className="absolute -left-4 bottom-6 z-10 max-w-[16rem] rounded-lg bg-white p-6 shadow-lg lg:-left-10 lg:bottom-16">
            <p className="text-xl font-medium text-primary">Plus de 20 ans</p>
            <p className="text-foreground/80">
              aux côtés de nos clients, à Liège et partout en Belgique
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
