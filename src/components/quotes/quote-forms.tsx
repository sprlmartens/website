"use client"

import type { ComponentType } from "react"

import type { QuoteSlug } from "@/features/quotes/core/meta"
import { AutoMotoForm } from "@/features/quotes/auto-moto/AutoMotoForm"
import { AssistanceVoyageForm } from "@/features/quotes/assistance-voyage/AssistanceVoyageForm"
import { EpargnePensionForm } from "@/features/quotes/epargne-pension/EpargnePensionForm"
import { FamilialeForm } from "@/features/quotes/familiale/FamilialeForm"
import { HabitationForm } from "@/features/quotes/habitation/HabitationForm"
import { SanteHospitalisationForm } from "@/features/quotes/sante-hospitalisation/SanteHospitalisationForm"

/**
 * Registre client : une définition ne franchit pas la frontière RSC, la page
 * ne peut donc pas la passer en prop. Elle transmet le slug, et ce module
 * résout le composant.
 */
const quoteFormComponents: Record<QuoteSlug, ComponentType> = {
  "auto-moto": AutoMotoForm,
  habitation: HabitationForm,
  familiale: FamilialeForm,
  "assistance-voyage": AssistanceVoyageForm,
  "sante-hospitalisation": SanteHospitalisationForm,
  "epargne-pension": EpargnePensionForm,
}

export function QuoteFormBySlug({ slug }: { slug: QuoteSlug }) {
  const Form = quoteFormComponents[slug]
  return <Form />
}
