"use client"

import type { ComponentType } from "react"

import { AssistanceVoyageForm } from "@/features/quotes/assistance-voyage/AssistanceVoyageForm"
import type { QuoteSlug } from "@/features/quotes/core/meta"

/**
 * Registre client : une définition ne franchit pas la frontière RSC, la page
 * ne peut donc pas la passer en prop. Elle transmet le slug, et ce module
 * résout le composant.
 */
const quoteFormComponents: Record<QuoteSlug, ComponentType> = {
  "assistance-voyage": AssistanceVoyageForm,
}

export function QuoteFormBySlug({ slug }: { slug: QuoteSlug }) {
  const Form = quoteFormComponents[slug]
  return <Form />
}
