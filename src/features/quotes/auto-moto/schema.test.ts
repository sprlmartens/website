import { describe, expect, it } from "vitest"

import {
  autoMotoDefaultValues,
  autoMotoSchema,
  emptyMainDriver,
  type AutoMotoValues,
} from "@/features/quotes/auto-moto/schema"

const currentYear = new Date().getUTCFullYear()

/** Un dossier complet et valide, que chaque test dégrade sur un seul point. */
function validValues(): AutoMotoValues {
  return {
    vehicleType: "car",
    brand: "Volkswagen",
    model: "Golf",
    powerKw: "85",
    fuelType: "petrol",
    firstRegistration: "15/03/2021",
    vehicleValue: "25000",
    formula: "rc",
    legalProtection: "existing",
    driverInsurance: true,
    isTakeover: false,
    currentInsurer: "",
    lastAnnualPremium: "",
    holderIsMainDriver: true,
    mainDriver: null,
    licenceDate: "01/06/2005",
    hasClaims: false,
    claims: [],
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

function mainDriver() {
  return {
    firstName: "Alex",
    lastName: "Dupont",
    birthDate: "02/09/2003",
    gender: "M" as const,
    street: "Rue de la Station",
    streetNumber: "12A",
    postalCode: "4000",
    city: "Liège",
    relationship: "child" as const,
  }
}

/** Renvoie les chemins d'erreur, pour des assertions lisibles. */
function errorPaths(values: unknown): string[] {
  const result = autoMotoSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("autoMotoSchema", () => {
  it("accepte un dossier complet", () => {
    expect(autoMotoSchema.safeParse(validValues()).success).toBe(true)
  })

  it.each(["1", "85", "1000"])("accepte une puissance de %s kW", (powerKw) => {
    const values = { ...validValues(), powerKw }
    expect(autoMotoSchema.safeParse(values).success).toBe(true)
  })

  it.each(["0", "1001", "", "85,5", "beaucoup"])(
    "refuse une puissance « %s »",
    (powerKw) => {
      const values = { ...validValues(), powerKw }
      expect(errorPaths(values)).toContain("powerKw")
    }
  )

  it("refuse une mise en circulation dans le futur", () => {
    const values = {
      ...validValues(),
      firstRegistration: `01/01/${currentYear + 1}`,
    }
    expect(errorPaths(values)).toContain("firstRegistration")
  })

  it("refuse une date de permis dans le futur", () => {
    const values = { ...validValues(), licenceDate: `01/01/${currentYear + 1}` }
    expect(errorPaths(values)).toContain("licenceDate")
  })

  it.each(["25000", "25 000", "18500,50"])(
    "accepte une valeur de véhicule de %s €",
    (vehicleValue) => {
      const values = { ...validValues(), vehicleValue }
      expect(autoMotoSchema.safeParse(values).success).toBe(true)
    }
  )

  it.each(["", "cher"])("refuse une valeur de véhicule « %s »", (vehicleValue) => {
    const values = { ...validValues(), vehicleValue }
    expect(errorPaths(values)).toContain("vehicleValue")
  })

  it("exige compagnie et prime en cas de reprise", () => {
    const values = { ...validValues(), isTakeover: true }
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining(["currentInsurer", "lastAnnualPremium"])
    )
  })

  it("accepte une reprise complète", () => {
    const values = {
      ...validValues(),
      isTakeover: true,
      currentInsurer: "AG Insurance",
      lastAnnualPremium: "650",
    }
    expect(autoMotoSchema.safeParse(values).success).toBe(true)
  })

  it("exige le conducteur principal quand ce n'est pas le preneur", () => {
    const values = { ...validValues(), holderIsMainDriver: false }
    expect(errorPaths(values)).toContain("mainDriver")
  })

  it("valide la fiche du conducteur principal", () => {
    const values = {
      ...validValues(),
      holderIsMainDriver: false,
      mainDriver: emptyMainDriver,
    }
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining([
        "mainDriver.firstName",
        "mainDriver.birthDate",
        "mainDriver.city",
        "mainDriver.relationship",
      ])
    )
  })

  it("accepte un conducteur principal complet", () => {
    const values = {
      ...validValues(),
      holderIsMainDriver: false,
      mainDriver: mainDriver(),
    }
    expect(autoMotoSchema.safeParse(values).success).toBe(true)
  })

  it("exige au moins un sinistre quand l'historique en annonce", () => {
    const values = { ...validValues(), hasClaims: true, claims: [] }
    expect(errorPaths(values)).toContain("claims")
  })

  it("accepte un sinistre des 5 dernières années", () => {
    const values = {
      ...validValues(),
      hasClaims: true,
      claims: [{ year: String(currentYear - 5), type: "glass" as const }],
    }
    expect(autoMotoSchema.safeParse(values).success).toBe(true)
  })

  it.each([
    String(currentYear - 6),
    String(currentYear + 1),
    "",
    "23",
  ])("refuse un sinistre de l'année « %s »", (year) => {
    const values = {
      ...validValues(),
      hasClaims: true,
      claims: [{ year, type: "glass" as const }],
    }
    expect(errorPaths(values)).toContain("claims.0.year")
  })

  it("exige le type de chaque sinistre", () => {
    const values = {
      ...validValues(),
      hasClaims: true,
      claims: [{ year: String(currentYear), type: "" }],
    }
    expect(errorPaths(values)).toContain("claims.0.type")
  })
})

/**
 * Chaque étape est validée seule, les suivantes gardant leurs valeurs par
 * défaut : les règles croisées ne doivent pas attendre que tout le
 * formulaire soit valide pour se déclencher.
 */
describe("validation étape par étape", () => {
  function withDefaults(overrides: Partial<AutoMotoValues>): AutoMotoValues {
    return { ...structuredClone(autoMotoDefaultValues), ...overrides }
  }

  it("ne présélectionne aucune réponse", () => {
    expect(errorPaths(autoMotoDefaultValues)).toEqual(
      expect.arrayContaining([
        "vehicleType",
        "fuelType",
        "vehicleValue",
        "formula",
        "legalProtection",
        "driverInsurance",
        "isTakeover",
        "holderIsMainDriver",
        "hasClaims",
      ])
    )
  })

  it("exige compagnie et prime dès l'étape des garanties", () => {
    const values = withDefaults({ isTakeover: true })
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining(["currentInsurer", "lastAnnualPremium"])
    )
  })

  it("exige un sinistre dès l'étape du conducteur", () => {
    const values = withDefaults({ hasClaims: true, claims: [] })
    expect(errorPaths(values)).toContain("claims")
  })

  it("n'exécute pas les règles croisées sur une charge utile mal typée", () => {
    const values = {
      ...validValues(),
      formula: "tout-risque",
      isTakeover: "oui",
      hasClaims: "x",
    }
    const paths = errorPaths(values)
    expect(paths).not.toContain("currentInsurer")
    expect(paths).not.toContain("claims")
  })
})
