"use client"

import { QuoteForm } from "@/components/quotes/QuoteForm"

import { familialeDefinition } from "./definition"
import { familialeSteps } from "./steps"

export function FamilialeForm() {
  return <QuoteForm definition={familialeDefinition} steps={familialeSteps} />
}
