"use client"

import { CheckIcon } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type QuoteStepperProps = {
  titles: string[]
  currentIndex: number
  /** Retourner à une étape déjà validée. */
  onNavigate: (index: number) => void
}

export function QuoteStepper({
  titles,
  currentIndex,
  onNavigate,
}: QuoteStepperProps) {
  const total = titles.length
  const progress = ((currentIndex + 1) / total) * 100

  return (
    <>
      {/* Mobile et tablette : compteur et barre de progression. */}
      <div className="lg:hidden">
        <p className="text-sm font-medium text-muted-foreground">
          Étape {currentIndex + 1} sur {total} ·{" "}
          <span className="text-foreground">{titles[currentIndex]}</span>
        </p>
        <Progress
          value={progress}
          aria-label={`Progression du formulaire, étape ${currentIndex + 1} sur ${total}`}
          className="mt-3"
        />
      </div>

      {/* Desktop : stepper vertical. */}
      <nav aria-label="Étapes du formulaire" className="hidden lg:block">
        <ol className="flex flex-col gap-1">
          {titles.map((title, index) => {
            const isCurrent = index === currentIndex
            const isDone = index < currentIndex

            return (
              <li key={title}>
                <button
                  type="button"
                  onClick={() => onNavigate(index)}
                  disabled={index > currentIndex}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                    isCurrent && "bg-primary/5 font-medium text-primary",
                    !isCurrent && isDone && "text-foreground hover:bg-muted",
                    index > currentIndex &&
                      "cursor-default text-muted-foreground",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
                      isDone && "border-primary bg-primary text-primary-foreground",
                      isCurrent && "border-primary text-primary",
                      !isDone && !isCurrent && "border-border",
                    )}
                  >
                    {isDone ? <CheckIcon className="size-3.5" /> : index + 1}
                  </span>
                  {title}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
