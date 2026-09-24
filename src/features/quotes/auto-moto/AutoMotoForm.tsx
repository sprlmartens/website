"use client"

import { QuoteForm } from "@/components/quotes/QuoteForm"

import { autoMotoDefinition } from "./definition"
import { autoMotoSteps } from "./steps"

export function AutoMotoForm() {
  return <QuoteForm definition={autoMotoDefinition} steps={autoMotoSteps} />
}
