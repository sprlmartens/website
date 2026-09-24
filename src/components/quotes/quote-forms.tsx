"use client"

import type { ComponentType } from "react"

import type { QuoteSlug } from "@/features/quotes/core/meta"
import { AssistanceVoyageForm } from "@/features/quotes/assistance-voyage/AssistanceVoyageForm"
import { SanteHospitalisationForm } from "@/features/quotes/sante-hospitalisation/SanteHospitalisationForm"

/**
 * Registre client : une définition ne franchit pas la frontière RSC, la page
 * ne peut donc pas la passer en prop. Elle transmet le slug, et ce module
 * résout le composant.
 */
const quoteFormComponents: Record<QuoteSlug, ComponentType> = {
  "assistance-voyage": AssistanceVoyageForm,
  "sante-hospitalisation": SanteHospitalisationForm,
}

export function QuoteFormBySlug({ slug }: { slug: QuoteSlug }) {
  const Form = quoteFormComponents[slug]
  return <Form />
}
