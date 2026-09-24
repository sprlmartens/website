"use client"

import { useCallback, useRef, useState, useTransition } from "react"
import {
  FormProvider,
  useForm,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { submitQuoteRequest } from "@/features/quotes/core/action"
import type { QuoteFormDefinition, QuoteStep } from "@/features/quotes/core/types"

import { QuoteReview } from "./QuoteReview"
import { QuoteStepper } from "./QuoteStepper"
import { QuoteSuccess } from "./QuoteSuccess"

const REVIEW_TITLE = "Récapitulatif"

// Message générique en cas d'échec réseau de la Server Action elle-même,
// distinct des échecs métier déjà couverts par `{ success: false }` (voir
// `GENERIC_ERROR` dans `core/action.ts`, non exporté car ce fichier est
// serveur uniquement).
const SUBMIT_NETWORK_ERROR =
  "L'envoi a échoué. Veuillez réessayer ou nous appeler directement."

type QuoteFormProps<T extends FieldValues> = {
  definition: QuoteFormDefinition<T>
  steps: QuoteStep<T>[]
}

/**
 * Un nœud d'erreurs react-hook-form contient-il un message, à sa racine ou
 * chez un descendant (champ imbriqué ou tableau) ? Sert à savoir si une
 * étape « possède » au moins une erreur après une validation complète.
 */
function hasErrorMessage(node: unknown): boolean {
  if (!node || typeof node !== "object") {
    return false
  }
  if (
    "message" in node &&
    typeof (node as { message?: unknown }).message === "string"
  ) {
    return true
  }
  return Object.values(node as Record<string, unknown>).some(hasErrorMessage)
}

/** Descend dans l'arbre d'erreurs le long d'un chemin en pointillés. */
function getErrorNode(errors: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, errors)
}

export function QuoteForm<T extends FieldValues>({
  definition,
  steps,
}: QuoteFormProps<T>) {
  const [stepIndex, setStepIndex] = useState(0)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [acknowledgementSent, setAcknowledgementSent] = useState(false)
  const [isPending, startTransition] = useTransition()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const form = useForm<T>({
    resolver: zodResolver(definition.schema),
    defaultValues: definition.defaultValues,
    mode: "onTouched",
  })

  // Le récapitulatif est fourni par le moteur, pas par le produit.
  const isReview = stepIndex === steps.length
  const stepTitles = [...steps.map((step) => step.title), REVIEW_TITLE]

  const goToStep = useCallback(
    (index: number) => {
      setStepIndex(index)
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      // Le focus sur le titre fait annoncer le nouveau contexte aux lecteurs
      // d'écran ; `preventScroll` laisse le défilement doux se dérouler.
      headingRef.current?.focus({ preventScroll: true })
    },
    []
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

  const handleValidSubmit = (values: T) => {
    startTransition(async () => {
      try {
        const result = await submitQuoteRequest(definition.slug, values)

        if (result.success) {
          setAcknowledgementSent(result.acknowledgementSent)
          setSubmittedEmail(definition.recipientEmail(values))
        } else {
          toast.error(result.error)
        }
      } catch (error) {
        // Distinct des échecs métier ci-dessus : ici, l'appel réseau vers
        // la Server Action lui-même a échoué (perte de connexion, etc.).
        console.error("Failed to call submitQuoteRequest", error)
        toast.error(SUBMIT_NETWORK_ERROR)
      }
    })
  }

  // Route vers la première étape propriétaire d'un champ en erreur quand la
  // validation complète du récapitulatif échoue. `QuoteReview` n'affiche
  // aucune erreur de champ : sans ce filet, un rejet du schéma sur un
  // chemin qu'aucune étape ne couvrirait laisserait le bouton « Envoyer »
  // sans aucun effet visible.
  const handleInvalidSubmit = (errors: FieldErrors<T>) => {
    const ownerIndex = steps.findIndex((step) =>
      step.fields.some((field) => hasErrorMessage(getErrorNode(errors, field)))
    )

    if (ownerIndex >= 0) {
      goToStep(ownerIndex)
    }

    toast.error(
      "Certains champs sont invalides. Veuillez vérifier vos réponses."
    )
  }

  if (submittedEmail) {
    return (
      <QuoteSuccess
        email={submittedEmail}
        acknowledgementSent={acknowledgementSent}
      />
    )
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
        <FormProvider {...form}>
          <form
            onSubmit={(event) => {
              // Composé ici, dans le gestionnaire d'événement, plutôt qu'en
              // haut du composant : `handleInvalidSubmit` lit des refs via
              // `goToStep`, et les passer à `form.handleSubmit(...)` pendant
              // le rendu déclencherait la règle `react-hooks/refs`. Au sein
              // d'un gestionnaire d'événement, cette lecture est sûre —
              // comme pour tous les autres appels à `goToStep` ci-dessous.
              void form.handleSubmit(handleValidSubmit, handleInvalidSubmit)(event)
            }}
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
