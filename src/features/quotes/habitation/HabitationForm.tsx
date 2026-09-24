"use client"

import { QuoteForm } from "@/components/quotes/QuoteForm"

import { habitationDefinition } from "./definition"
import { habitationSteps } from "./steps"

export function HabitationForm() {
  return <QuoteForm definition={habitationDefinition} steps={habitationSteps} />
}
