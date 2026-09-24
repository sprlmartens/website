import { z } from "zod"

import {
  belgianPhone,
  birthDate,
  euroAmount,
  parseFrenchDate,
  todayUtc,
  whenFieldsValid,
} from "@/lib/validation"

export const genders = ["M", "F"] as const
export type Gender = (typeof genders)[number]
export const genderLabels: Record<Gender, string> = {
  M: "Masculin",
  F: "Féminin",
}

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

export const MAX_ADDITIONAL_INSURED = 4

const personSchema = z.object({
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
  birthDate: birthDate(),
  gender: z.enum(genders, { error: "Veuillez sélectionner un genre." }),
})

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

    // Étape 2 — les assurés
    insureHolder: z.boolean({ error: "Veuillez répondre « Oui » ou « Non »." }),
    hasAdditionalInsured: z.boolean({
      error: "Veuillez répondre « Oui » ou « Non ».",
    }),
    additionalInsured: z.array(personSchema).max(MAX_ADDITIONAL_INSURED, {
      error: `Vous pouvez assurer ${MAX_ADDITIONAL_INSURED} personnes supplémentaires au maximum.`,
    }),

    // Étape 3 — le preneur
    holder: personSchema.extend({
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
    }),

    // Étape 4 — les coordonnées
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
    message: z
      .string()
      .trim()
      .max(1000, {
        error: "Le message est trop long (1000 caractères maximum).",
      })
      .optional(),
    // `z.boolean().refine(...)` plutôt que `z.literal(true)` : le type reste
    // `boolean`, ce qui permet une valeur par défaut `false` côté formulaire.
    consent: z.boolean().refine((value) => value, {
      error: "Veuillez accepter le traitement de vos données.",
    }),
    honeypot: z.string().optional(),
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
  .superRefine(
    (values, ctx) => {
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
    },
    {
      when: whenFieldsValid(
        "insureHolder",
        "hasAdditionalInsured",
        "additionalInsured",
      ),
    },
  )

export type AssistanceVoyageValues = z.infer<typeof assistanceVoyageSchema>

export const assistanceVoyageDefaultValues: AssistanceVoyageValues = {
  destination: "" as Destination,
  coverageDuration: "" as CoverageDuration,
  periodStart: "",
  periodEnd: "",
  tripValue: "",
  insureVehicle: null as unknown as boolean,
  vehicleFirstRegistration: "",
  insureHolder: null as unknown as boolean,
  hasAdditionalInsured: null as unknown as boolean,
  additionalInsured: [],
  holder: {
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "" as Gender,
    street: "",
    streetNumber: "",
    postalCode: "",
    city: "",
  },
  email: "",
  phone: "",
  message: "",
  consent: false,
  honeypot: "",
}
