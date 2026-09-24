import { z } from "zod"

import { belgianPhone, birthDate, parseEuroAmount } from "@/lib/validation"

export const genders = ["M", "F"] as const
export type Gender = (typeof genders)[number]
export const genderLabels: Record<Gender, string> = {
  M: "Masculin",
  F: "Féminin",
}

export const MAX_ADDITIONAL_INSURED = 10

export const personSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: "Veuillez indiquer un prénom." })
    .max(50, { error: "Le prénom est trop long." }),
  lastName: z
    .string()
    .trim()
    .min(1, { error: "Veuillez indiquer un nom." })
    .max(50, { error: "Le nom est trop long." }),
  birthDate: birthDate(),
  gender: z.enum(genders, { error: "Veuillez sélectionner un genre." }),
})

export type Person = z.infer<typeof personSchema>

/** Champs d'une adresse belge, lus par `AddressFields`. */
export const addressFields = {
  street: z
    .string()
    .trim()
    .min(2, { error: "Veuillez indiquer la rue." })
    .max(100, { error: "Le nom de rue est trop long." }),
  streetNumber: z
    .string()
    .trim()
    .min(1, { error: "Veuillez indiquer le numéro." })
    .max(20, { error: "Le numéro est trop long." }),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, {
      error: "Code postal belge invalide (4 chiffres).",
    }),
  city: z
    .string()
    .trim()
    .min(2, { error: "Veuillez indiquer la localité." })
    .max(80, { error: "Le nom de localité est trop long." }),
}

export const addressSchema = z.object(addressFields)

export type Address = z.infer<typeof addressSchema>

export const holderSchema = personSchema.extend(addressFields)

export const insuredFields = {
  insureHolder: z.boolean({ error: "Veuillez répondre « Oui » ou « Non »." }),
  hasAdditionalInsured: z.boolean({
    error: "Veuillez répondre « Oui » ou « Non ».",
  }),
  additionalInsured: z.array(personSchema).max(MAX_ADDITIONAL_INSURED, {
    error: `Vous pouvez assurer ${MAX_ADDITIONAL_INSURED} personnes supplémentaires au maximum.`,
  }),
}

export const contactFields = {
  email: z.email({ error: "Adresse e-mail invalide." }),
  phone: z
    .string()
    .trim()
    .min(1, { error: "Veuillez indiquer votre numéro de téléphone." })
    .regex(belgianPhone, { error: "Numéro de téléphone invalide." }),
  message: z
    .string()
    .trim()
    .max(1000, {
      error: "Le message est trop long (1000 caractères maximum).",
    })
    .optional(),
  consent: z.boolean().refine((value) => value, {
    error: "Veuillez accepter le traitement de vos données.",
  }),
  honeypot: z.string().optional(),
}

export const sharedQuoteSchema = z.object({
  ...insuredFields,
  holder: holderSchema,
  ...contactFields,
})

/** Valeurs communes à tous les devis, lues par les étapes partagées. */
export type SharedQuoteValues = z.infer<typeof sharedQuoteSchema>

type InsuredValues = Pick<
  SharedQuoteValues,
  "insureHolder" | "hasAdditionalInsured" | "additionalInsured"
>

/** Champs lus par `refineInsured`, à passer à `whenFieldsValid`. */
export const insuredRuleKeys = [
  "insureHolder",
  "hasAdditionalInsured",
  "additionalInsured",
] as const

/**
 * Règles croisées des assurés : une personne annoncée doit être saisie, et
 * le contrat doit couvrir au moins quelqu'un. À brancher avec
 * `{ when: whenFieldsValid(...insuredRuleKeys) }`.
 */
export function refineInsured<T extends InsuredValues>(
  values: T,
  ctx: z.core.$RefinementCtx<T>,
) {
  // Une carte d'assuré invalide saute cette règle : sans conséquence,
  // le nombre d'assurés est alors d'au moins un.
  const insuredCount = values.additionalInsured.length

  if (values.hasAdditionalInsured && insuredCount === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["additionalInsured"],
      message: "Ajoutez au moins une personne, ou répondez « Non ».",
    })
  }

  if (!values.insureHolder && insuredCount === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["insureHolder"],
      message: "Il faut au moins une personne assurée.",
    })
  }
}

// Aucune réponse présélectionnée : les booléens partent de `null` et les
// énumérations d'une chaîne vide, que le schéma refuse tant que
// l'utilisateur n'a pas choisi.
export const emptyPerson: Person = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "" as Gender,
}

export const insuredDefaultValues: InsuredValues = {
  insureHolder: null as unknown as boolean,
  hasAdditionalInsured: null as unknown as boolean,
  additionalInsured: [],
}

export const emptyAddress: Address = {
  street: "",
  streetNumber: "",
  postalCode: "",
  city: "",
}

export const holderDefaultValues: SharedQuoteValues["holder"] = {
  ...emptyPerson,
  ...emptyAddress,
}

export const contactDefaultValues: Pick<
  SharedQuoteValues,
  "email" | "phone" | "message" | "consent" | "honeypot"
> = {
  email: "",
  phone: "",
  message: "",
  consent: false,
  honeypot: "",
}

/**
 * Entier saisi en texte, comme la puissance d'un véhicule : un champ vide ne
 * devient pas `NaN`.
 */
export function isIntegerBetween(
  value: string | undefined,
  min: number,
  max: number,
) {
  if (!value || !/^\d{1,3}$/.test(value)) {
    return false
  }
  const number = Number(value)
  return number >= min && number <= max
}

/*
 * Reprise d'un contrat existant : compagnie actuelle et dernière prime,
 * demandées dès que le prospect est déjà assuré ailleurs.
 */

export const takeoverFields = {
  isTakeover: z.boolean({ error: "Veuillez répondre « Oui » ou « Non »." }),
  currentInsurer: z
    .string()
    .trim()
    .max(80, { error: "Le nom de la compagnie est trop long." })
    .optional(),
  lastAnnualPremium: z.string().trim().optional(),
}

type TakeoverValues = {
  isTakeover: boolean
  currentInsurer?: string
  lastAnnualPremium?: string
}

/** Champs lus par `refineTakeover`, à passer à `whenFieldsValid`. */
export const takeoverRuleKeys = [
  "isTakeover",
  "currentInsurer",
  "lastAnnualPremium",
] as const

/** En cas de reprise, compagnie et prime deviennent obligatoires. */
export function refineTakeover<T extends TakeoverValues>(
  values: T,
  ctx: z.core.$RefinementCtx<T>,
) {
  if (!values.isTakeover) {
    return
  }

  if (!values.currentInsurer) {
    ctx.addIssue({
      code: "custom",
      path: ["currentInsurer"],
      message: "Veuillez indiquer votre compagnie actuelle.",
    })
  }

  if (
    !values.lastAnnualPremium ||
    parseEuroAmount(values.lastAnnualPremium) === null
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["lastAnnualPremium"],
      message: "Veuillez indiquer votre dernière prime annuelle.",
    })
  }
}

export const takeoverDefaultValues: TakeoverValues = {
  isTakeover: null as unknown as boolean,
  currentInsurer: "",
  lastAnnualPremium: "",
}

/*
 * Historique de sinistres. Chaque produit fournit ses propres types de
 * sinistre ; l'année et les règles de liste sont communes.
 */

export const MAX_CLAIMS = 10

/** Profondeur de l'historique de sinistres demandé par les assureurs. */
export const CLAIMS_HISTORY_YEARS = 5

/**
 * Année d'un sinistre, parmi les dernières années. Saisie en texte : un champ
 * vide ne devient pas `NaN`. L'année courante est lue à la validation, pas au
 * chargement.
 */
export function claimYear() {
  return z
    .string()
    .trim()
    .refine(
      (value) => {
        if (!/^\d{4}$/.test(value)) {
          return false
        }
        const year = Number(value)
        const currentYear = new Date().getUTCFullYear()
        return year >= currentYear - CLAIMS_HISTORY_YEARS && year <= currentYear
      },
      {
        error: `Indiquez une année parmi les ${CLAIMS_HISTORY_YEARS} dernières.`,
      },
    )
}

export function createClaimSchema<
  const Types extends readonly [string, ...string[]],
>(types: Types) {
  return z.object({
    year: claimYear(),
    type: z.enum(types, { error: "Veuillez choisir un type de sinistre." }),
  })
}

/** Champs `hasClaims` et `claims`, pour les types de sinistre du produit. */
export function claimsFields<
  const Types extends readonly [string, ...string[]],
>(types: Types) {
  return {
    hasClaims: z.boolean({ error: "Veuillez répondre « Oui » ou « Non »." }),
    claims: z.array(createClaimSchema(types)).max(MAX_CLAIMS, {
      error: `Vous pouvez déclarer ${MAX_CLAIMS} sinistres au maximum.`,
    }),
  }
}

type ClaimsValues = { hasClaims: boolean; claims: readonly unknown[] }

/** Champs lus par `refineClaims`, à passer à `whenFieldsValid`. */
export const claimsRuleKeys = ["hasClaims", "claims"] as const

/** Un historique annoncé doit compter au moins un sinistre. */
export function refineClaims<T extends ClaimsValues>(
  values: T,
  ctx: z.core.$RefinementCtx<T>,
) {
  if (values.hasClaims && values.claims.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["claims"],
      message: "Ajoutez au moins un sinistre, ou répondez « Non ».",
    })
  }
}

export const claimsDefaultValues = {
  hasClaims: null as unknown as boolean,
  claims: [],
}
