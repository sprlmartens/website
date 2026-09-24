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
import { whenFieldsValid } from "@/lib/validation"

export const santeHospitalisationSchema = z
  .object({
    // Étape 1 — les couvertures souhaitées
    coverHospitalisation: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),
    coverMedicalCare: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),
    coverDental: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),

    // Étapes 2 à 4 — assurés, preneur et coordonnées, communs aux devis
    ...insuredFields,
    holder: holderSchema,
    ...contactFields,
  })
  // Règles croisées, une par préoccupation, gardées par `whenFieldsValid`
  // comme pour l'assistance voyage : chacune se déclenche dès la validation
  // de son étape.
  .superRefine(
    (values, ctx) => {
      if (
        !values.coverHospitalisation &&
        !values.coverMedicalCare &&
        !values.coverDental
      ) {
        // Porté par la dernière question : le message s'affiche sous le
        // groupe entier.
        ctx.addIssue({
          code: "custom",
          path: ["coverDental"],
          message: "Choisissez au moins une couverture.",
        })
      }
    },
    {
      when: whenFieldsValid(
        "coverHospitalisation",
        "coverMedicalCare",
        "coverDental",
      ),
    },
  )
  .superRefine(refineInsured, { when: whenFieldsValid(...insuredRuleKeys) })

export type SanteHospitalisationValues = z.infer<
  typeof santeHospitalisationSchema
>

export const santeHospitalisationDefaultValues: SanteHospitalisationValues = {
  coverHospitalisation: null as unknown as boolean,
  coverMedicalCare: null as unknown as boolean,
  coverDental: null as unknown as boolean,
  ...insuredDefaultValues,
  holder: holderDefaultValues,
  ...contactDefaultValues,
}
