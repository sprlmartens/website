import { describe, expect, it } from "vitest"

import {
  santeHospitalisationDefaultValues,
  santeHospitalisationSchema,
  type SanteHospitalisationValues,
} from "@/features/quotes/sante-hospitalisation/schema"
import { MAX_ADDITIONAL_INSURED } from "@/features/quotes/shared/schema"

/** Un dossier complet et valide, que chaque test dégrade sur un seul point. */
function validValues(): SanteHospitalisationValues {
  return {
    coverHospitalisation: true,
    coverMedicalCare: false,
    coverDental: false,
    insureHolder: true,
    hasAdditionalInsured: false,
    additionalInsured: [],
    holder: {
      firstName: "Camille",
      lastName: "Dupont",
      birthDate: "15/03/1985",
      gender: "F",
      street: "Rue de la Station",
      streetNumber: "12A",
      postalCode: "4000",
      city: "Liège",
    },
    email: "camille@example.be",
    phone: "0475123456",
    message: "",
    consent: true,
    honeypot: "",
  }
}

const person = {
  firstName: "Louis",
  lastName: "Dupont",
  birthDate: "02/09/2010",
  gender: "M" as const,
}

/** Renvoie les chemins d'erreur, pour des assertions lisibles. */
function errorPaths(values: unknown): string[] {
  const result = santeHospitalisationSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("santeHospitalisationSchema", () => {
  it("accepte un dossier complet", () => {
    expect(santeHospitalisationSchema.safeParse(validValues()).success).toBe(
      true
    )
  })

  it("refuse un dossier sans aucune couverture", () => {
    const values = { ...validValues(), coverHospitalisation: false }
    expect(errorPaths(values)).toContain("coverDental")
  })

  it("accepte une seule couverture, quelle qu'elle soit", () => {
    const values = {
      ...validValues(),
      coverHospitalisation: false,
      coverDental: true,
    }
    expect(santeHospitalisationSchema.safeParse(values).success).toBe(true)
  })

  it("exige au moins une personne assurée", () => {
    const values = { ...validValues(), insureHolder: false }
    expect(errorPaths(values)).toContain("insureHolder")
  })

  it("accepte un preneur non assuré s'il y a un autre assuré", () => {
    const values = {
      ...validValues(),
      insureHolder: false,
      hasAdditionalInsured: true,
      additionalInsured: [person],
    }
    expect(santeHospitalisationSchema.safeParse(values).success).toBe(true)
  })

  it("accepte jusqu'au plafond d'assurés supplémentaires", () => {
    const values = {
      ...validValues(),
      hasAdditionalInsured: true,
      additionalInsured: Array(MAX_ADDITIONAL_INSURED).fill(person),
    }
    expect(santeHospitalisationSchema.safeParse(values).success).toBe(true)
  })

  it("refuse plus d'assurés supplémentaires que le plafond", () => {
    const values = {
      ...validValues(),
      hasAdditionalInsured: true,
      additionalInsured: Array(MAX_ADDITIONAL_INSURED + 1).fill(person),
    }
    expect(errorPaths(values)).toContain("additionalInsured")
  })

  it("exige le consentement", () => {
    const values = { ...validValues(), consent: false }
    expect(errorPaths(values)).toContain("consent")
  })
})

/**
 * Chaque étape est validée seule, les suivantes gardant leurs valeurs par
 * défaut : les règles croisées d'une étape ne doivent pas attendre que tout
 * le formulaire soit valide pour se déclencher.
 */
describe("validation étape par étape", () => {
  /** Étape 1 remplie, les étapes suivantes encore vierges. */
  function coverageOnly(
    overrides: Partial<SanteHospitalisationValues> = {}
  ): SanteHospitalisationValues {
    return {
      ...structuredClone(santeHospitalisationDefaultValues),
      coverHospitalisation: true,
      coverMedicalCare: false,
      coverDental: false,
      ...overrides,
    }
  }

  it("ne présélectionne aucune réponse aux questions Oui/Non", () => {
    expect(errorPaths(santeHospitalisationDefaultValues)).toEqual(
      expect.arrayContaining([
        "coverHospitalisation",
        "coverMedicalCare",
        "coverDental",
        "insureHolder",
        "hasAdditionalInsured",
      ])
    )
  })

  it("exige une couverture dès l'étape des besoins", () => {
    const values = coverageOnly({ coverHospitalisation: false })
    expect(errorPaths(values)).toContain("coverDental")
  })

  it("n'ajoute pas l'erreur de groupe tant qu'une question reste sans réponse", () => {
    const values = coverageOnly({
      coverHospitalisation: false,
      coverMedicalCare: false,
      coverDental: null as unknown as boolean,
    })
    const issues = santeHospitalisationSchema.safeParse(values).error?.issues
    expect(
      issues?.some((issue) => issue.message === "Choisissez au moins une couverture.")
    ).toBe(false)
  })

  it("exige au moins une personne assurée dès l'étape des assurés", () => {
    const values = coverageOnly({
      insureHolder: false,
      hasAdditionalInsured: false,
    })
    expect(errorPaths(values)).toContain("insureHolder")
  })

  it("exige une personne annoncée dès l'étape des assurés", () => {
    const values = coverageOnly({
      insureHolder: true,
      hasAdditionalInsured: true,
    })
    expect(errorPaths(values)).toContain("additionalInsured")
  })
})
