import { z } from "zod"

import {
  contactDefaultValues,
  contactFields,
  emptyPerson,
  holderDefaultValues,
  holderSchema,
  isIntegerBetween,
  personSchema,
} from "@/features/quotes/shared/schema"
import {
  euroAmount,
  frenchDate,
  parseEuroAmount,
  parseFrenchDate,
  todayUtc,
  whenFieldsValid,
} from "@/lib/validation"

export const MIN_LOAN_DURATION = 1
export const MAX_LOAN_DURATION = 40

/** Part du crédit couverte pour une personne, contrôlée seule. */
export const MIN_COVERAGE = 1
export const MAX_COVERAGE = 100

export const HEALTH_NOTES_MAX = 1000

/** Pourcentage entier saisi en texte : un champ vide ne devient pas `NaN`. */
function coveragePercentage() {
  return z
    .string()
    .trim()
    .refine((value) => isIntegerBetween(value, MIN_COVERAGE, MAX_COVERAGE), {
      error: `Indiquez un pourcentage entre ${MIN_COVERAGE} et ${MAX_COVERAGE} %.`,
    })
}

function healthNotes() {
  return z
    .string()
    .trim()
    .max(HEALTH_NOTES_MAX, {
      error: `Le commentaire est trop long (${HEALTH_NOTES_MAX} caractères maximum).`,
    })
    .optional()
}

export const secondInsuredSchema = personSchema.extend({
  coverage: coveragePercentage(),
  healthNotes: healthNotes(),
})

export type SecondInsured = z.infer<typeof secondInsuredSchema>

export const soldeRestantDuSchema = z
  .object({
    // Étape 1 — le crédit
    loanAmount: euroAmount().refine(
      (value) => {
        // Un montant illisible est déjà signalé par `euroAmount`.
        const amount = parseEuroAmount(value)
        return amount === null || amount > 0
      },
      { error: "Veuillez indiquer le montant du crédit." },
    ),
    loanDuration: z
      .string()
      .trim()
      .refine(
        (value) =>
          isIntegerBetween(value, MIN_LOAN_DURATION, MAX_LOAN_DURATION),
        {
          error: `Indiquez une durée entre ${MIN_LOAN_DURATION} et ${MAX_LOAN_DURATION} ans.`,
        },
      ),
    effectiveDate: frenchDate().refine(
      (value) => {
        // Une date illisible est déjà signalée par `frenchDate`.
        const date = parseFrenchDate(value)
        return date === null || date >= todayUtc()
      },
      { error: "La date de prise d'effet ne peut pas être dans le passé." },
    ),

    // Étape 2 — les personnes assurées : le preneur, et une seconde personne
    // au plus, en général le co-emprunteur
    holderCoverage: coveragePercentage(),
    holderHealthNotes: healthNotes(),
    hasSecondInsured: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),
    // Absente tant que la réponse est « Non » : ses champs ne sont alors pas
    // validés, et rien d'abandonné ne part dans l'e-mail.
    secondInsured: secondInsuredSchema.optional(),

    // Étapes 3 et 4 — preneur et coordonnées, communs aux devis
    holder: holderSchema,
    ...contactFields,
  })
  // Garde-fou pour la Server Action : l'interface crée la fiche dès le « Oui ».
  .superRefine(
    (values, ctx) => {
      if (values.hasSecondInsured && !values.secondInsured) {
        ctx.addIssue({
          code: "custom",
          path: ["hasSecondInsured"],
          message: "Veuillez renseigner la seconde personne assurée.",
        })
      }
    },
    { when: whenFieldsValid("hasSecondInsured", "secondInsured") },
  )

export type SoldeRestantDuValues = z.infer<typeof soldeRestantDuSchema>

export const emptySecondInsured: SecondInsured = {
  ...emptyPerson,
  coverage: "",
  healthNotes: "",
}

export const soldeRestantDuDefaultValues: SoldeRestantDuValues = {
  loanAmount: "",
  loanDuration: "",
  effectiveDate: "",
  holderCoverage: "",
  holderHealthNotes: "",
  hasSecondInsured: null as unknown as boolean,
  secondInsured: undefined,
  holder: holderDefaultValues,
  ...contactDefaultValues,
}
