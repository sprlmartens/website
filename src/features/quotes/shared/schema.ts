import { z } from "zod"

import { belgianPhone, birthDate } from "@/lib/validation"

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

export const holderSchema = personSchema.extend({
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
})

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

export const holderDefaultValues: SharedQuoteValues["holder"] = {
  ...emptyPerson,
  street: "",
  streetNumber: "",
  postalCode: "",
  city: "",
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
