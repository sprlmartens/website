import { z } from "zod"

import {
  claimsDefaultValues,
  claimsFields,
  claimsRuleKeys,
  contactDefaultValues,
  contactFields,
  holderDefaultValues,
  holderSchema,
  refineClaims,
  refineTakeover,
  takeoverDefaultValues,
  takeoverFields,
  takeoverRuleKeys,
} from "@/features/quotes/shared/schema"
import { euroAmount, pastDate, whenFieldsValid } from "@/lib/validation"

export const MIN_POWER_KW = 1
export const MAX_POWER_KW = 1000

export const vehicleTypes = ["car", "motorbike"] as const
export type VehicleType = (typeof vehicleTypes)[number]
export const vehicleTypeLabels: Record<VehicleType, string> = {
  car: "Voiture",
  motorbike: "Moto",
}

export const fuelTypes = ["petrol", "diesel", "hybrid", "electric"] as const
export type FuelType = (typeof fuelTypes)[number]
export const fuelTypeLabels: Record<FuelType, string> = {
  petrol: "Essence",
  diesel: "Diesel",
  hybrid: "Hybride",
  electric: "Électrique",
}

export const formulas = ["rc", "mini-omnium", "omnium", "unsure"] as const
export type Formula = (typeof formulas)[number]
export const formulaLabels: Record<Formula, string> = {
  rc: "RC seule",
  "mini-omnium": "Mini-omnium",
  omnium: "Omnium",
  unsure: "Je ne sais pas, conseillez-moi",
}

export const legalProtections = ["yes", "existing", "no"] as const
export type LegalProtection = (typeof legalProtections)[number]
export const legalProtectionLabels: Record<LegalProtection, string> = {
  yes: "Oui",
  existing: "J’ai déjà un contrat spécialisé (DAS, ARAG, Legal Village…)",
  no: "Non",
}

export const relationships = [
  "partner",
  "parent",
  "child",
  "family",
  "other",
] as const
export type Relationship = (typeof relationships)[number]
export const relationshipLabels: Record<Relationship, string> = {
  partner: "Conjoint(e) / partenaire",
  parent: "Parent",
  child: "Enfant",
  family: "Autre membre de la famille",
  other: "Autre",
}

export const claimTypes = [
  "liability",
  "material-damage",
  "glass",
  "theft-fire",
  "other",
] as const
export type ClaimType = (typeof claimTypes)[number]
export const claimTypeLabels: Record<ClaimType, string> = {
  liability: "Responsabilité civile (en tort)",
  "material-damage": "Dégâts matériels",
  glass: "Bris de glace",
  "theft-fire": "Vol / incendie",
  other: "Autre",
}


const mainDriverSchema = holderSchema.extend({
  relationship: z.enum(relationships, {
    error: "Veuillez indiquer le lien avec le preneur d’assurance.",
  }),
})

export type MainDriver = z.infer<typeof mainDriverSchema>

export const autoMotoSchema = z
  .object({
    // Étape 1 — le véhicule
    vehicleType: z.enum(vehicleTypes, {
      error: "Veuillez choisir un type de véhicule.",
    }),
    brand: z
      .string()
      .trim()
      .min(1, { error: "Veuillez indiquer la marque." })
      .max(50, { error: "La marque est trop longue." }),
    model: z
      .string()
      .trim()
      .min(1, { error: "Veuillez indiquer le modèle." })
      .max(80, { error: "Le modèle est trop long." }),
    powerKw: z
      .string()
      .trim()
      .refine(
        (value) => {
          if (!/^\d{1,4}$/.test(value)) {
            return false
          }
          const power = Number(value)
          return power >= MIN_POWER_KW && power <= MAX_POWER_KW
        },
        {
          error: `Indiquez une puissance entre ${MIN_POWER_KW} et 1 000 kW.`,
        },
      ),
    fuelType: z.enum(fuelTypes, {
      error: "Veuillez choisir un type de carburant.",
    }),
    firstRegistration: pastDate(
      "Date de mise en circulation invalide (JJ/MM/AAAA).",
    ),
    vehicleValue: euroAmount("Veuillez indiquer la valeur du véhicule."),

    // Étape 2 — les garanties
    formula: z.enum(formulas, { error: "Veuillez choisir une formule." }),
    legalProtection: z.enum(legalProtections, {
      error: "Veuillez choisir une réponse.",
    }),
    driverInsurance: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),
    ...takeoverFields,

    // Étape 3 — le conducteur principal, `null` quand c'est le preneur
    holderIsMainDriver: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),
    mainDriver: mainDriverSchema.nullable(),
    licenceDate: pastDate("Date d’obtention du permis invalide (JJ/MM/AAAA)."),
    ...claimsFields(claimTypes),

    // Étapes 4 et 5 — preneur et coordonnées, communs aux devis
    holder: holderSchema,
    ...contactFields,
  })
  // Règles croisées, une par préoccupation, gardées par `whenFieldsValid`
  // comme pour les autres devis : chacune se déclenche dès la validation de
  // son étape.
  .superRefine(refineTakeover, {
    when: whenFieldsValid(...takeoverRuleKeys),
  })
  .superRefine(
    (values, ctx) => {
      // Répondre « Non » ouvre une fiche vide : ce cas ne se présente donc
      // que sur une charge utile forgée à la main.
      if (!values.holderIsMainDriver && values.mainDriver === null) {
        ctx.addIssue({
          code: "custom",
          path: ["mainDriver"],
          message: "Veuillez renseigner le conducteur principal.",
        })
      }
    },
    { when: whenFieldsValid("holderIsMainDriver", "mainDriver") },
  )
  .superRefine(refineClaims, { when: whenFieldsValid(...claimsRuleKeys) })

export type AutoMotoValues = z.infer<typeof autoMotoSchema>

// Aucune réponse présélectionnée, comme pour les autres devis.
export const emptyMainDriver: MainDriver = {
  ...holderDefaultValues,
  relationship: "" as Relationship,
}

export const autoMotoDefaultValues: AutoMotoValues = {
  vehicleType: "" as VehicleType,
  brand: "",
  model: "",
  powerKw: "",
  fuelType: "" as FuelType,
  firstRegistration: "",
  vehicleValue: "",
  formula: "" as Formula,
  legalProtection: "" as LegalProtection,
  driverInsurance: null as unknown as boolean,
  ...takeoverDefaultValues,
  holderIsMainDriver: null as unknown as boolean,
  mainDriver: null,
  licenceDate: "",
  ...claimsDefaultValues,
  holder: holderDefaultValues,
  ...contactDefaultValues,
}
