import { z } from "zod"

import {
  addressSchema,
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
import { parseEuroAmount, whenFieldsValid } from "@/lib/validation"

export const MAX_FLOOR = 99
export const MAX_GARAGE_CAPACITY = 10

export const occupancies = ["owner", "tenant"] as const
export type Occupancy = (typeof occupancies)[number]
export const occupancyLabels: Record<Occupancy, string> = {
  owner: "Propriétaire",
  tenant: "Locataire",
}

export const dwellingTypes = ["house", "apartment"] as const
export type DwellingType = (typeof dwellingTypes)[number]
export const dwellingTypeLabels: Record<DwellingType, string> = {
  house: "Maison",
  apartment: "Appartement",
}

export const facadeTypes = ["detached", "semi-detached", "terraced"] as const
export type FacadeType = (typeof facadeTypes)[number]
export const facadeTypeLabels: Record<FacadeType, string> = {
  detached: "4 façades",
  "semi-detached": "3 façades",
  terraced: "Mitoyenne",
}

export const heatingTypes = [
  "gas",
  "oil",
  "electric",
  "heat-pump",
  "wood",
  "other",
] as const
export type HeatingType = (typeof heatingTypes)[number]
export const heatingTypeLabels: Record<HeatingType, string> = {
  gas: "Gaz",
  oil: "Mazout",
  electric: "Électricité",
  "heat-pump": "Pompe à chaleur",
  wood: "Bois / pellets",
  other: "Autre",
}

export const specialFeatures = [
  "pool",
  "jacuzzi",
  "solar-panels",
  "ev-charger",
  "other",
] as const
export type SpecialFeature = (typeof specialFeatures)[number]
export const specialFeatureLabels: Record<SpecialFeature, string> = {
  pool: "Piscine",
  jacuzzi: "Jacuzzi",
  "solar-panels": "Panneaux photovoltaïques",
  "ev-charger": "Borne de recharge",
  other: "Autre aménagement",
}

export const claimTypes = [
  "fire",
  "water",
  "storm",
  "glass",
  "theft",
  "natural-disaster",
  "liability",
  "other",
] as const
export type ClaimType = (typeof claimTypes)[number]
export const claimTypeLabels: Record<ClaimType, string> = {
  fire: "Incendie / explosion",
  water: "Dégâts des eaux",
  storm: "Tempête / grêle",
  glass: "Bris de vitrage",
  theft: "Vol / vandalisme",
  "natural-disaster": "Catastrophe naturelle",
  liability: "Responsabilité civile",
  other: "Autre",
}

export const habitationSchema = z
  .object({
    // Étape 1 — le logement
    occupancy: z.enum(occupancies, {
      error: "Veuillez indiquer si vous êtes propriétaire ou locataire.",
    }),
    monthlyRent: z.string().trim().optional(),
    dwellingType: z.enum(dwellingTypes, {
      error: "Veuillez choisir un type de logement.",
    }),
    facades: z
      .enum(facadeTypes, { error: "Veuillez indiquer le nombre de façades." })
      .nullable(),
    floor: z.string().trim().optional(),
    propertyIsHolderAddress: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),
    propertyAddress: addressSchema.nullable(),

    // Étape 2 — l'habitation
    heating: z.enum(heatingTypes, {
      error: "Veuillez choisir un type de chauffage.",
    }),
    hasCellar: z.boolean({ error: "Veuillez répondre « Oui » ou « Non »." }),
    hasGarage: z.boolean({ error: "Veuillez répondre « Oui » ou « Non »." }),
    garageCapacity: z.string().trim().optional(),
    rooms: z
      .string()
      .trim()
      .min(2, { error: "Veuillez décrire la composition de votre habitation." })
      .max(1000, {
        error: "La description est trop longue (1000 caractères maximum).",
      }),
    hasGarden: z.boolean({ error: "Veuillez répondre « Oui » ou « Non »." }),
    hasSpecialFeatures: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),
    specialFeatures: z.array(z.enum(specialFeatures)),
    specialFeaturesOther: z
      .string()
      .trim()
      .max(100, { error: "La précision est trop longue." })
      .optional(),

    // Étape 3 — les antécédents
    ...takeoverFields,
    ...claimsFields(claimTypes),

    // Étapes 4 et 5 — preneur et coordonnées, communs aux devis
    holder: holderSchema,
    ...contactFields,
  })
  // Règles croisées, une par préoccupation, gardées par `whenFieldsValid`
  // comme pour les autres devis : chacune se déclenche dès la validation de
  // son étape.
  .superRefine(
    (values, ctx) => {
      if (
        values.occupancy === "tenant" &&
        (!values.monthlyRent || parseEuroAmount(values.monthlyRent) === null)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["monthlyRent"],
          message: "Veuillez indiquer votre loyer mensuel hors charges.",
        })
      }
    },
    { when: whenFieldsValid("occupancy", "monthlyRent") },
  )
  .superRefine(
    (values, ctx) => {
      if (values.dwellingType === "house" && values.facades === null) {
        ctx.addIssue({
          code: "custom",
          path: ["facades"],
          message: "Veuillez indiquer le nombre de façades.",
        })
      }

      if (
        values.dwellingType === "apartment" &&
        !isIntegerBetween(values.floor, 0, MAX_FLOOR)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["floor"],
          message: "Indiquez l’étage (0 pour le rez-de-chaussée).",
        })
      }
    },
    { when: whenFieldsValid("dwellingType", "facades", "floor") },
  )
  .superRefine(
    (values, ctx) => {
      // Répondre « Non » ouvre une fiche vide : ce cas ne se présente donc
      // que sur une charge utile forgée à la main.
      if (!values.propertyIsHolderAddress && values.propertyAddress === null) {
        ctx.addIssue({
          code: "custom",
          path: ["propertyAddress"],
          message: "Veuillez indiquer l’adresse du logement.",
        })
      }
    },
    { when: whenFieldsValid("propertyIsHolderAddress", "propertyAddress") },
  )
  .superRefine(
    (values, ctx) => {
      if (
        values.hasGarage &&
        !isIntegerBetween(values.garageCapacity, 1, MAX_GARAGE_CAPACITY)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["garageCapacity"],
          message: `Indiquez un nombre de véhicules entre 1 et ${MAX_GARAGE_CAPACITY}.`,
        })
      }
    },
    { when: whenFieldsValid("hasGarage", "garageCapacity") },
  )
  .superRefine(
    (values, ctx) => {
      if (!values.hasSpecialFeatures) {
        return
      }

      if (values.specialFeatures.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["specialFeatures"],
          message: "Cochez au moins un aménagement, ou répondez « Non ».",
        })
      }

      if (
        values.specialFeatures.includes("other") &&
        !values.specialFeaturesOther
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["specialFeaturesOther"],
          message: "Veuillez préciser l’aménagement.",
        })
      }
    },
    {
      when: whenFieldsValid(
        "hasSpecialFeatures",
        "specialFeatures",
        "specialFeaturesOther",
      ),
    },
  )
  .superRefine(refineTakeover, {
    when: whenFieldsValid(...takeoverRuleKeys),
  })
  .superRefine(refineClaims, { when: whenFieldsValid(...claimsRuleKeys) })

export type HabitationValues = z.infer<typeof habitationSchema>

// Aucune réponse présélectionnée, comme pour les autres devis.
export const habitationDefaultValues: HabitationValues = {
  occupancy: "" as Occupancy,
  monthlyRent: "",
  dwellingType: "" as DwellingType,
  facades: null,
  floor: "",
  propertyIsHolderAddress: null as unknown as boolean,
  propertyAddress: null,
  heating: "" as HeatingType,
  hasCellar: null as unknown as boolean,
  hasGarage: null as unknown as boolean,
  garageCapacity: "",
  rooms: "",
  hasGarden: null as unknown as boolean,
  hasSpecialFeatures: null as unknown as boolean,
  specialFeatures: [],
  specialFeaturesOther: "",
  ...takeoverDefaultValues,
  ...claimsDefaultValues,
  holder: holderDefaultValues,
  ...contactDefaultValues,
}
