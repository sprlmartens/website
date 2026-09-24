import { z } from "zod"

import {
  claimsDefaultValues,
  claimsFields,
  claimsRuleKeys,
  contactDefaultValues,
  contactFields,
  holderDefaultValues,
  holderSchema,
  isIntegerBetween,
  refineClaims,
  refineTakeover,
  takeoverDefaultValues,
  takeoverFields,
  takeoverRuleKeys,
} from "@/features/quotes/shared/schema"
import { whenFieldsValid } from "@/lib/validation"

export const MAX_CHILDREN = 10

export const households = ["single", "couple", "family"] as const
export type Household = (typeof households)[number]
export const householdLabels: Record<Household, string> = {
  single: "Seul(e)",
  couple: "En couple",
  family: "En famille",
}

export const claimTypes = [
  "third-party-property",
  "third-party-injury",
  "child",
  "animal",
  "other",
] as const
export type ClaimType = (typeof claimTypes)[number]
export const claimTypeLabels: Record<ClaimType, string> = {
  "third-party-property": "Dommages matériels à un tiers",
  "third-party-injury": "Dommages corporels à un tiers",
  child: "Dégâts causés par un enfant",
  animal: "Dégâts causés par un animal",
  other: "Autre",
}

export const familialeSchema = z
  .object({
    // Étape 1 — la situation : le foyer, puis les antécédents
    household: z.enum(households, {
      error: "Veuillez indiquer la composition de votre foyer.",
    }),
    childrenCount: z.string().trim().optional(),
    ...takeoverFields,
    ...claimsFields(claimTypes),

    // Étapes 2 et 3 — preneur et coordonnées, communs aux devis
    holder: holderSchema,
    ...contactFields,
  })
  // Règles croisées, une par préoccupation, gardées par `whenFieldsValid`
  // comme pour les autres devis : chacune se déclenche dès la validation de
  // son étape.
  .superRefine(
    (values, ctx) => {
      if (
        values.household === "family" &&
        !isIntegerBetween(values.childrenCount, 1, MAX_CHILDREN)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["childrenCount"],
          message: `Indiquez un nombre d’enfants entre 1 et ${MAX_CHILDREN}.`,
        })
      }
    },
    { when: whenFieldsValid("household", "childrenCount") },
  )
  .superRefine(refineTakeover, {
    when: whenFieldsValid(...takeoverRuleKeys),
  })
  .superRefine(refineClaims, { when: whenFieldsValid(...claimsRuleKeys) })

export type FamilialeValues = z.infer<typeof familialeSchema>

// Aucune réponse présélectionnée, comme pour les autres devis.
export const familialeDefaultValues: FamilialeValues = {
  household: "" as Household,
  childrenCount: "",
  ...takeoverDefaultValues,
  ...claimsDefaultValues,
  holder: holderDefaultValues,
  ...contactDefaultValues,
}
