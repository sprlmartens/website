import { describe, expect, it } from "vitest"

import {
  assistanceVoyageDefaultValues,
  assistanceVoyageSchema,
  type AssistanceVoyageValues,
} from "@/features/quotes/assistance-voyage/schema"

/** Un dossier complet et valide, que chaque test dégrade sur un seul point. */
function validValues(): AssistanceVoyageValues {
  return {
    destination: "europe",
    coverageDuration: "annual",
    periodStart: "",
    periodEnd: "",
    tripValue: "2500",
    insureVehicle: false,
    vehicleFirstRegistration: "",
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

/** Renvoie les chemins d'erreur, pour des assertions lisibles. */
function errorPaths(values: unknown): string[] {
  const result = assistanceVoyageSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("assistanceVoyageSchema", () => {
  it("accepte un dossier complet", () => {
    expect(assistanceVoyageSchema.safeParse(validValues()).success).toBe(true)
  })

  it("exige les dates quand la couverture est une période", () => {
    const values = { ...validValues(), coverageDuration: "period" as const }
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining(["periodStart", "periodEnd"])
    )
  })

  it("accepte une période correctement remplie", () => {
    const values = {
      ...validValues(),
      coverageDuration: "period" as const,
      periodStart: "01/07/2099",
      periodEnd: "15/07/2099",
    }
    expect(assistanceVoyageSchema.safeParse(values).success).toBe(true)
  })

  it("refuse une date de départ passée", () => {
    const values = {
      ...validValues(),
      coverageDuration: "period" as const,
      periodStart: "01/01/2020",
      periodEnd: "15/01/2020",
    }
    expect(errorPaths(values)).toContain("periodStart")
  })

  it("refuse une date de retour antérieure au départ", () => {
    const values = {
      ...validValues(),
      coverageDuration: "period" as const,
      periodStart: "15/07/2099",
      periodEnd: "01/07/2099",
    }
    expect(errorPaths(values)).toContain("periodEnd")
  })

  it("exige la mise en circulation quand un véhicule est assuré", () => {
    const values = { ...validValues(), insureVehicle: true }
    expect(errorPaths(values)).toContain("vehicleFirstRegistration")
  })

  it("refuse une mise en circulation dans le futur", () => {
    const values = {
      ...validValues(),
      insureVehicle: true,
      vehicleFirstRegistration: "01/01/2099",
    }
    expect(errorPaths(values)).toContain("vehicleFirstRegistration")
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
      additionalInsured: [
        {
          firstName: "Louis",
          lastName: "Dupont",
          birthDate: "02/09/2010",
          gender: "M" as const,
        },
      ],
    }
    expect(assistanceVoyageSchema.safeParse(values).success).toBe(true)
  })

  it("exige une personne quand on annonce d'autres assurés", () => {
    const values = { ...validValues(), hasAdditionalInsured: true }
    expect(errorPaths(values)).toContain("additionalInsured")
  })

  it("refuse plus de quatre assurés supplémentaires", () => {
    const person = {
      firstName: "Louis",
      lastName: "Dupont",
      birthDate: "02/09/2010",
      gender: "M" as const,
    }
    const values = {
      ...validValues(),
      hasAdditionalInsured: true,
      additionalInsured: [person, person, person, person, person],
    }
    expect(errorPaths(values)).toContain("additionalInsured")
  })

  it("refuse un code postal non belge", () => {
    const values = validValues()
    values.holder.postalCode = "75001"
    expect(errorPaths(values)).toContain("holder.postalCode")
  })

  it("refuse une date de naissance dans le futur", () => {
    const values = validValues()
    values.holder.birthDate = "01/01/2099"
    expect(errorPaths(values)).toContain("holder.birthDate")
  })

  it("accepte un téléphone vide", () => {
    const values = { ...validValues(), phone: "" }
    expect(assistanceVoyageSchema.safeParse(values).success).toBe(true)
  })

  it("exige le consentement", () => {
    const values = { ...validValues(), consent: false }
    expect(errorPaths(values)).toContain("consent")
  })
})

/**
 * Chaque étape est validée seule, les suivantes gardant leurs valeurs par
 * défaut (énumérations vides comprises) : les règles croisées d'une étape ne
 * doivent pas attendre que tout le formulaire soit valide pour se déclencher.
 */
describe("validation étape par étape", () => {
  /** Étape 1 remplie, les étapes suivantes encore vierges. */
  function tripOnly(
    overrides: Partial<AssistanceVoyageValues> = {}
  ): AssistanceVoyageValues {
    return {
      ...structuredClone(assistanceVoyageDefaultValues),
      destination: "europe",
      coverageDuration: "annual",
      tripValue: "2500",
      ...overrides,
    }
  }

  it("exige les dates de période dès l'étape du voyage", () => {
    const values = tripOnly({ coverageDuration: "period" })
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining(["periodStart", "periodEnd"])
    )
  })

  it("refuse une date de départ passée dès l'étape du voyage", () => {
    const values = tripOnly({
      coverageDuration: "period",
      periodStart: "01/01/2020",
      periodEnd: "15/01/2020",
    })
    expect(errorPaths(values)).toContain("periodStart")
  })

  it("refuse un retour antérieur au départ dès l'étape du voyage", () => {
    const values = tripOnly({
      coverageDuration: "period",
      periodStart: "15/07/2099",
      periodEnd: "01/07/2099",
    })
    expect(errorPaths(values)).toContain("periodEnd")
  })

  it("exige la mise en circulation dès l'étape du voyage", () => {
    const values = tripOnly({ insureVehicle: true })
    expect(errorPaths(values)).toContain("vehicleFirstRegistration")
  })

  it("exige au moins une personne assurée dès l'étape des assurés", () => {
    const values = tripOnly({ insureHolder: false })
    expect(errorPaths(values)).toContain("insureHolder")
  })

  it("exige une personne annoncée dès l'étape des assurés", () => {
    const values = tripOnly({ hasAdditionalInsured: true })
    expect(errorPaths(values)).toContain("additionalInsured")
  })

  it("n'exécute pas les règles croisées sur une charge utile mal typée", () => {
    const values = {
      ...validValues(),
      coverageDuration: 42,
      insureVehicle: "oui",
      additionalInsured: "x",
    }
    const paths = errorPaths(values)
    expect(paths).not.toContain("periodStart")
    expect(paths).not.toContain("vehicleFirstRegistration")
    expect(paths).not.toContain("insureHolder")
  })
})
