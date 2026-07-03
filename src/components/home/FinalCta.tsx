import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function FinalCta() {
  return (
    <section className="bg-primary text-white">
      <div className="container py-28 text-center lg:py-40">
        <p className="reveal text-xs font-medium uppercase tracking-[0.22em] text-white/90">
          Le premier rendez-vous est sans engagement
        </p>
        <h2 className="reveal mx-auto mt-8 max-w-4xl font-display text-5xl font-medium leading-[1.08] tracking-tight lg:text-6xl">
          Parlons de ce qui
          <br />
          compte <em className="pen-underline not-italic">pour vous</em>.
        </h2>
        <p className="reveal mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/90">
          Trente minutes suffisent pour y voir clair. Vous repartez avec un avis
          honnête et la liberté de décider.
        </p>
        <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-accent text-white transition-colors hover:bg-accent-dark"
            asChild
          >
            <Link href="tel:+3242630000">
              Prendre rendez-vous
              <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
            </Link>
          </Button>
          <Link
            href="tel:+3242630000"
            className="rule-sweep text-base font-medium text-white"
          >
            ou appelez le 04 263 00 00
          </Link>
        </div>
      </div>
    </section>
  )
}
