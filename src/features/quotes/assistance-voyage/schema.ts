import { z } from "zod"

import {
  contactDefaultValues,
  contactFields,
  holderDefaultValues,
  holderSchema,
  insuredDefaultValues,
  insuredFields,
  insuredRuleKeys,
  refineInsured,
} from "@/features/quotes/shared/schema"
import {
  euroAmount,
  parseFrenchDate,
  todayUtc,
  whenFieldsValid,
} from "@/lib/validation"

export const destinations = [
  "europe",
  "world-except-na-carib",
  "world",
] as const
export type Destination = (typeof destinations)[number]
export const destinationLabels: Record<Destination, string> = {
  europe: "Europe",
  "world-except-na-carib": "Le monde hormis USA, Canada et Caraïbes",
  world: "Le monde",
}

export const coverageDurations = ["annual", "period"] as const
export type CoverageDuration = (typeof coverageDurations)[number]
export const coverageDurationLabels: Record<CoverageDuration, string> = {
  annual: "Une année",
  period: "Une période déterminée",
}

export const assistanceVoyageSchema = z
  .object({
    // Étape 1 — le voyage
    destination: z.enum(destinations, {
      error: "Veuillez choisir une destination.",
    }),
    coverageDuration: z.enum(coverageDurations, {
      error: "Veuillez choisir une durée de couverture.",
    }),
    periodStart: z.string().trim().optional(),
    periodEnd: z.string().trim().optional(),
    tripValue: euroAmount(),
    insureVehicle: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),
    vehicleFirstRegistration: z.string().trim().optional(),

    // Étapes 2 à 4 — assurés, preneur et coordonnées, communs aux devis
    ...insuredFields,
    holder: holderSchema,
    ...contactFields,
  })
  // Règles croisées, une par préoccupation. Chacune est gardée par
  // `whenFieldsValid` sur les seuls champs qu'elle lit : elle se déclenche
  // ainsi dès la validation de son étape, même si les étapes suivantes sont
  // encore vierges (voir `whenFieldsValid`).
  .superRefine(
    (values, ctx) => {
      if (values.coverageDuration !== "period") {
        return
      }

      const start = values.periodStart
        ? parseFrenchDate(values.periodStart)
        : null
      const end = values.periodEnd ? parseFrenchDate(values.periodEnd) : null

      if (!start) {
        ctx.addIssue({
          code: "custom",
          path: ["periodStart"],
          message: "Date de départ requise (JJ/MM/AAAA).",
        })
      } else if (start < todayUtc()) {
        ctx.addIssue({
          code: "custom",
          path: ["periodStart"],
          message: "La date de départ ne peut pas être dans le passé.",
        })
      }

      if (!end) {
        ctx.addIssue({
          code: "custom",
          path: ["periodEnd"],
          message: "Date de retour requise (JJ/MM/AAAA).",
        })
      } else if (start && end <= start) {
        ctx.addIssue({
          code: "custom",
          path: ["periodEnd"],
          message: "La date de retour doit suivre la date de départ.",
        })
      }
    },
    { when: whenFieldsValid("coverageDuration", "periodStart", "periodEnd") },
  )
  .superRefine(
    (values, ctx) => {
      if (!values.insureVehicle) {
        return
      }

      const registration = values.vehicleFirstRegistration
        ? parseFrenchDate(values.vehicleFirstRegistration)
        : null

      if (!registration) {
        ctx.addIssue({
          code: "custom",
          path: ["vehicleFirstRegistration"],
          message: "Date de mise en circulation requise (JJ/MM/AAAA).",
        })
      } else if (registration > todayUtc()) {
        ctx.addIssue({
          code: "custom",
          path: ["vehicleFirstRegistration"],
          message:
            "La date de mise en circulation ne peut pas être dans le futur.",
        })
      }
    },
    { when: whenFieldsValid("insureVehicle", "vehicleFirstRegistration") },
  )
  .superRefine(refineInsured, { when: whenFieldsValid(...insuredRuleKeys) })

export type AssistanceVoyageValues = z.infer<typeof assistanceVoyageSchema>

export const assistanceVoyageDefaultValues: AssistanceVoyageValues = {
  destination: "" as Destination,
  coverageDuration: "" as CoverageDuration,
  periodStart: "",
  periodEnd: "",
  tripValue: "",
  insureVehicle: null as unknown as boolean,
  vehicleFirstRegistration: "",
  ...insuredDefaultValues,
  holder: holderDefaultValues,
  ...contactDefaultValues,
}
