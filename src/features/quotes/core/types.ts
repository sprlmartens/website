import type { ComponentType } from "react"
import type { DefaultValues, FieldValues, Path } from "react-hook-form"
import type { z } from "zod"

export type SummaryRow = {
  label: string
  value: string
}

export type SummarySection = {
  title: string
  /** Étape à rouvrir depuis le lien « Modifier » du récapitulatif. */
  stepId: string
  rows: SummaryRow[]
}

export type QuoteStep<T extends FieldValues> = {
  id: string
  title: string
  description?: string
  /** Champs validés avant de passer à l'étape suivante. */
  fields: Path<T>[]
  /** Lit le formulaire via `useFormContext()` : aucune prop. */
  Component: ComponentType
}

export type QuoteFormDefinition<T extends FieldValues> = {
  slug: string
  /**
   * `z.ZodType<T, T>` et non `z.ZodType<T>` : ce dernier a `unknown` pour type
   * d'entrée, que `zodResolver` refuse.
   */
  schema: z.ZodType<T, T>
  defaultValues: DefaultValues<T>
  summary: (values: T) => SummarySection[]
  emailSubject: (values: T) => string
  /** Adresse du prospect, destinataire de l'accusé de réception. */
  recipientEmail: (values: T) => string
}

/** Métadonnées sérialisables : traversent la frontière RSC sans encombre. */
export type QuoteFormMeta = {
  slug: string
  eyebrow: string
  title: string
  intro: string
  metaTitle: string
  metaDescription: string
  image: { src: string; alt: string }
}
