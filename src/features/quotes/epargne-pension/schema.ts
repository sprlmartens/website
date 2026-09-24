import { z } from "zod"

import {
  contactDefaultValues,
  contactFields,
  holderDefaultValues,
  holderSchema,
} from "@/features/quotes/shared/schema"
import { euroAmount, parseEuroAmount, whenFieldsValid } from "@/lib/validation"

/** Bornes du versement annuel, fixées par le cahier des charges. */
export const MIN_ANNUAL_CONTRIBUTION = 600
export const MAX_ANNUAL_CONTRIBUTION = 1050

export const MIN_PENSION_AGE = 60
export const MAX_PENSION_AGE = 70

export const paymentFrequencies = ["monthly", "annual"] as const
export type PaymentFrequency = (typeof paymentFrequencies)[number]
export const paymentFrequencyLabels: Record<PaymentFrequency, string> = {
  monthly: "Mensuel",
  annual: "Annuel",
}

export const maritalStatuses = [
  "single",
  "married",
  "legal-cohabitant",
  "de-facto-cohabitant",
  "divorced",
  "separated",
  "widowed",
] as const
export type MaritalStatus = (typeof maritalStatuses)[number]
export const maritalStatusLabels: Record<MaritalStatus, string> = {
  single: "Célibataire",
  married: "Marié(e)",
  "legal-cohabitant": "Cohabitant(e) légal(e)",
  "de-facto-cohabitant": "Cohabitant(e) de fait",
  divorced: "Divorcé(e)",
  separated: "Séparé(e)",
  widowed: "Veuf / Veuve",
}

export const epargnePensionSchema = z
  .object({
    // Étape 1 — l'épargne-pension
    // Saisi en texte, comme les montants : un champ vide ne devient pas `NaN`.
    pensionAge: z
      .string()
      .trim()
      .refine(
        (value) => {
          if (!/^\d{2}$/.test(value)) {
            return false
          }
          const age = Number(value)
          return age >= MIN_PENSION_AGE && age <= MAX_PENSION_AGE
        },
        {
          error: `Indiquez un âge entre ${MIN_PENSION_AGE} et ${MAX_PENSION_AGE} ans.`,
        },
      ),
    annualContribution: euroAmount().refine(
      (value) => {
        // Un montant illisible est déjà signalé par `euroAmount`.
        const amount = parseEuroAmount(value)
        return (
          amount === null ||
          (amount >= MIN_ANNUAL_CONTRIBUTION &&
            amount <= MAX_ANNUAL_CONTRIBUTION)
        )
      },
      { error: "Le versement annuel doit être compris entre 600 € et 1 050 €." },
    ),
    paymentFrequency: z.enum(paymentFrequencies, {
      error: "Veuillez choisir une fréquence de versement.",
    }),
    deathCapital: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),
    deathCapitalAmount: z.string().trim().optional(),
    smoker: z.boolean().nullable(),

    // Étape 2 — le preneur, qui est aussi l'assuré, avec son état civil
    holder: holderSchema.extend({
      maritalStatus: z.enum(maritalStatuses, {
        error: "Veuillez sélectionner un état civil.",
      }),
    }),

    // Étape 3 — coordonnées, communes aux devis
    ...contactFields,
  })
  // Gardée par `whenFieldsValid` comme les règles croisées des autres devis :
  // elle se déclenche dès la validation de la première étape.
  .superRefine(
    (values, ctx) => {
      if (!values.deathCapital) {
        return
      }

      if (
        !values.deathCapitalAmount ||
        parseEuroAmount(values.deathCapitalAmount) === null
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["deathCapitalAmount"],
          message: "Veuillez indiquer le montant du capital décès.",
        })
      }

      if (values.smoker === null) {
        ctx.addIssue({
          code: "custom",
          path: ["smoker"],
          message: "Veuillez répondre « Oui » ou « Non ».",
        })
      }
    },
    { when: whenFieldsValid("deathCapital", "deathCapitalAmount", "smoker") },
  )

export type EpargnePensionValues = z.infer<typeof epargnePensionSchema>

export const epargnePensionDefaultValues: EpargnePensionValues = {
  pensionAge: "",
  annualContribution: "",
  paymentFrequency: "" as PaymentFrequency,
  deathCapital: null as unknown as boolean,
  deathCapitalAmount: "",
  smoker: null,
  holder: { ...holderDefaultValues, maritalStatus: "" as MaritalStatus },
  ...contactDefaultValues,
}
