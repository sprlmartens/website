"use client"

import { QuoteForm } from "@/components/quotes/QuoteForm"

import { santeHospitalisationDefinition } from "./definition"
import { santeHospitalisationSteps } from "./steps"

export function SanteHospitalisationForm() {
  return (
    <QuoteForm
      definition={santeHospitalisationDefinition}
      steps={santeHospitalisationSteps}
    />
  )
}
