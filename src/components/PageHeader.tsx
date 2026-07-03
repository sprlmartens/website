import type { ReactNode } from "react"

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
}) {
  return (
    <section className="border-b border-border/50 bg-secondary/40">
      <div className="container py-20 lg:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  )
}
