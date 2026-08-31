"use client"

import type { SummarySection } from "@/features/quotes/core/types"

type QuoteReviewProps = {
  sections: SummarySection[]
  onEdit: (stepId: string) => void
}

export function QuoteReview({ sections, onEdit }: QuoteReviewProps) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Vérifiez vos réponses avant l’envoi. Chaque section reste modifiable.
      </p>

      {sections.map((section) => (
        <section key={section.stepId}>
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
            <h3 className="font-display text-lg font-medium text-foreground">
              {section.title}
            </h3>
            <button
              type="button"
              onClick={() => onEdit(section.stepId)}
              // Nom accessible explicite : « Modifier » seul, répété pour
              // chaque section, serait ambigu au lecteur d'écran.
              aria-label={`Modifier — ${section.title}`}
              className="shrink-0 text-sm text-primary underline-offset-4 hover:underline"
            >
              Modifier
            </button>
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,14rem)_1fr]">
            {section.rows.map((row, index) => (
              <div key={`${row.label}-${index}`} className="contents">
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="text-sm text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
