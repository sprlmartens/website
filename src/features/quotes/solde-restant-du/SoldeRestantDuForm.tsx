"use client"

import { QuoteForm } from "@/components/quotes/QuoteForm"

import { soldeRestantDuDefinition } from "./definition"
import { soldeRestantDuSteps } from "./steps"

export function SoldeRestantDuForm() {
  return (
    <QuoteForm
      definition={soldeRestantDuDefinition}
      steps={soldeRestantDuSteps}
    />
  )
}
