"use client"

import { QuoteForm } from "@/components/quotes/QuoteForm"

import { assistanceVoyageDefinition } from "./definition"
import { assistanceVoyageSteps } from "./steps"

export function AssistanceVoyageForm() {
  return (
    <QuoteForm
      definition={assistanceVoyageDefinition}
      steps={assistanceVoyageSteps}
    />
  )
}
