import { z } from "zod"

import { belgianPhone } from "@/lib/validation"

export const contactIntents = [
  "assurance",
  "placement",
  "sinistre",
  "autre",
] as const

export type ContactIntent = (typeof contactIntents)[number]

export const contactIntentLabels: Record<ContactIntent, string> = {
  assurance: "Assurance",
  placement: "Placement",
  sinistre: "Sinistre",
  autre: "Autre",
}

export const contactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { error: "Le prénom doit contenir au moins 2 caractères." })
    .max(50, { error: "Le prénom est trop long." }),
  lastName: z
    .string()
    .trim()
    .min(2, { error: "Le nom doit contenir au moins 2 caractères." })
    .max(50, { error: "Le nom est trop long." }),
  email: z.email({ error: "Adresse e-mail invalide." }),
  phone: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(belgianPhone, { error: "Numéro de téléphone invalide." }),
    ])
    .optional(),
  intent: z.enum(contactIntents, {
    error: "Veuillez sélectionner un motif de contact.",
  }),
  message: z
    .string()
    .trim()
    .min(10, { error: "Le message doit contenir au moins 10 caractères." })
    .max(2000, {
      error: "Le message est trop long (2000 caractères maximum).",
    }),
  honeypot: z.string().optional(),
})

export type ContactFormValues = z.infer<typeof contactSchema>
