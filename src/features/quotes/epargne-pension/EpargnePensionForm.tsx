"use client"

import { QuoteForm } from "@/components/quotes/QuoteForm"

import { epargnePensionDefinition } from "./definition"
import { epargnePensionSteps } from "./steps"

export function EpargnePensionForm() {
  return (
    <QuoteForm
      definition={epargnePensionDefinition}
      steps={epargnePensionSteps}
    />
  )
}
