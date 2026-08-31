"use client"

import { useCallback, useRef, useState, useTransition } from "react"
import { FormProvider, useForm, type FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { submitQuoteRequest } from "@/features/quotes/core/action"
import type { QuoteFormDefinition, QuoteStep } from "@/features/quotes/core/types"
import { useQuoteDraft } from "@/features/quotes/core/useQuoteDraft"

import { QuoteDraftBanner } from "./QuoteDraftBanner"
import { QuoteReview } from "./QuoteReview"
import { QuoteStepper } from "./QuoteStepper"
import { QuoteSuccess } from "./QuoteSuccess"

const REVIEW_TITLE = "Récapitulatif"

type QuoteFormProps<T extends FieldValues> = {
  definition: QuoteFormDefinition<T>
  steps: QuoteStep<T>[]
}

export function QuoteForm<T extends FieldValues>({
  definition,
  steps,
}: QuoteFormProps<T>) {
  const [stepIndex, setStepIndex] = useState(0)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const form = useForm<T>({
    resolver: zodResolver(definition.schema),
    defaultValues: definition.defaultValues,
    mode: "onTouched",
  })

  const { pendingDraft, restoreDraft, discardDraft, clearSavedDraft } =
    useQuoteDraft(definition.slug, form, stepIndex)

  // Le récapitulatif est fourni par le moteur, pas par le produit.
  const isReview = stepIndex === steps.length
  const stepTitles = [...steps.map((step) => step.title), REVIEW_TITLE]

  const goToStep = useCallback(
    (index: number) => {
      // Borne défensive : un brouillon restauré peut porter un `stepIndex`
      // hérité d'une version du formulaire ayant un nombre d'étapes différent.
      const clamped = Math.min(Math.max(index, 0), steps.length)
      setStepIndex(clamped)
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      // Le focus sur le titre fait annoncer le nouveau contexte aux lecteurs
      // d'écran ; `preventScroll` laisse le défilement doux se dérouler.
      headingRef.current?.focus({ preventScroll: true })
    },
    [steps.length]
  )

  const handleNext = useCallback(async () => {
    const step = steps[stepIndex]
    if (!step) {
      return
    }

    const isStepValid = await form.trigger(step.fields, { shouldFocus: true })
    if (isStepValid) {
      goToStep(stepIndex + 1)
    }
  }, [form, goToStep, stepIndex, steps])

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await submitQuoteRequest(definition.slug, values)

      if (result.success) {
        clearSavedDraft()
        setSubmittedEmail(definition.recipientEmail(values))
      } else {
        toast.error(result.error)
      }
    })
  })

  if (submittedEmail) {
    return <QuoteSuccess email={submittedEmail} />
  }

  const StepComponent = isReview ? null : steps[stepIndex].Component
  const currentTitle = stepTitles[stepIndex]
  const currentDescription = isReview ? undefined : steps[stepIndex].description

  return (
    <div ref={containerRef} className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <QuoteStepper
            titles={stepTitles}
            currentIndex={stepIndex}
            onNavigate={goToStep}
          />
        </div>
      </div>

      <div className="lg:col-span-8">
        {pendingDraft ? (
          <QuoteDraftBanner
            savedAt={pendingDraft.savedAt}
            onRestore={() => goToStep(restoreDraft())}
            onDiscard={discardDraft}
          />
        ) : null}

        <FormProvider {...form}>
          <form
            onSubmit={onSubmit}
            onKeyDown={(event) => {
              // Entrée fait avancer d'une étape plutôt que soumettre, sauf
              // dans un champ multiligne et sauf sur le récapitulatif. Les
              // boutons (Retour, Continuer, cases à cocher/radios Radix)
              // gèrent déjà eux-mêmes leur activation par Entrée : les
              // intercepter aussi les empêcherait d'être actionnés au clavier
              // (« Retour » avancerait au lieu de reculer).
              const target = event.target as HTMLElement
              if (
                event.key === "Enter" &&
                !isReview &&
                target.tagName !== "TEXTAREA" &&
                target.tagName !== "BUTTON"
              ) {
                event.preventDefault()
                void handleNext()
              }
            }}
            noValidate
          >
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-2xl font-medium text-foreground outline-none md:text-3xl"
            >
              {currentTitle}
            </h2>
            {currentDescription ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {currentDescription}
              </p>
            ) : null}

            <div className="mt-8">
              {StepComponent ? (
                <StepComponent />
              ) : (
                <QuoteReview
                  sections={definition.summary(form.getValues())}
                  onEdit={(stepId) => {
                    const index = steps.findIndex((step) => step.id === stepId)
                    if (index >= 0) {
                      goToStep(index)
                    }
                  }}
                />
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              {stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => goToStep(stepIndex - 1)}
                >
                  <ArrowLeft className="size-4" />
                  Retour
                </Button>
              ) : null}

              {isReview ? (
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? "Envoi en cours…" : "Envoyer ma demande"}
                  {isPending ? null : <Send className="size-4" />}
                </Button>
              ) : (
                <Button type="button" size="lg" onClick={handleNext}>
                  Continuer
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
