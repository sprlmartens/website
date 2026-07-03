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
    <section className="relative overflow-hidden border-b border-border/50 bg-secondary/40">
      <div
        aria-hidden
        className="page-header-grid pointer-events-none absolute inset-0"
      />
      <div
        className={`container relative grid grid-cols-1 items-center gap-10 py-20 lg:py-28 ${
          image ? "lg:grid-cols-12 lg:gap-8" : ""
        }`}
      >
        <div className={image ? "lg:col-span-7" : undefined}>
          <p className="rise flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden className="h-0.5 w-6 bg-accent" />
            {eyebrow}
          </p>
          <h1 className="rise-1 mt-6 max-w-3xl font-display text-5xl font-medium leading-tight tracking-tight text-foreground sm:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="rise-2 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
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