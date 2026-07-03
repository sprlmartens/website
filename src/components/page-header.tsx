import type { ReactNode } from "react"
import Image from "next/image"

type PageHeaderImage = {
  src: string
  alt: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  image?: PageHeaderImage
}) {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        className={`container relative grid grid-cols-1 items-center gap-10 py-16 lg:py-18 ${
          image ? "lg:grid-cols-12 lg:gap-8" : ""
        }`}
      >
        <div className={image ? "lg:col-span-7" : undefined}>
          <p className="rise inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
          <h1 className="rise-1 mt-6 max-w-3xl font-display text-5xl font-medium leading-tight tracking-tight text-foreground md:text-6xl/17">
            {title}
          </h1>
          {description ? (
            <p className="rise-2 mt-6 max-w-xl text-lg leading-relaxed text-foreground/70">
              {description}
            </p>
          ) : null}
        </div>
        {image ? (
          <div className="rise-2 hidden lg:col-span-5 lg:block">
            <figure className="duotone relative ml-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </figure>
          </div>
        ) : null}
      </div>
    </section>
  )
}
