import { describe, expect, it } from "vitest"

import {
  epargnePensionDefaultValues,
  epargnePensionSchema,
  type EpargnePensionValues,
} from "@/features/quotes/epargne-pension/schema"

/** Un dossier complet et valide, que chaque test dégrade sur un seul point. */
function validValues(): EpargnePensionValues {
  return {
    pensionAge: "67",
    annualContribution: "1050",
    paymentFrequency: "monthly",
    deathCapital: false,
    deathCapitalAmount: "",
    smoker: null,
    holder: {
      firstName: "Camille",
      lastName: "Dupont",
      birthDate: "15/03/1985",
      gender: "F",
      maritalStatus: "married",
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
  const result = epargnePensionSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("epargnePensionSchema", () => {
  it("accepte un dossier complet", () => {
    expect(epargnePensionSchema.safeParse(validValues()).success).toBe(true)
  })

  it.each(["600", "1050", "800,50", "1 000"])(
    "accepte un versement annuel de %s €",
    (annualContribution) => {
      const values = { ...validValues(), annualContribution }
      expect(epargnePensionSchema.safeParse(values).success).toBe(true)
    }
  )

  it.each(["599", "1051", "", "beaucoup"])(
    "refuse un versement annuel de « %s »",
    (annualContribution) => {
      const values = { ...validValues(), annualContribution }
      expect(errorPaths(values)).toContain("annualContribution")
    }
  )

  it.each(["60", "70"])("accepte une pension à %s ans", (pensionAge) => {
    const values = { ...validValues(), pensionAge }
    expect(epargnePensionSchema.safeParse(values).success).toBe(true)
  })

  it.each(["59", "71", "", "66,5", "abc"])(
    "refuse un âge de pension « %s »",
    (pensionAge) => {
      const values = { ...validValues(), pensionAge }
      expect(errorPaths(values)).toContain("pensionAge")
    }
  )

  it("exige une fréquence de versement", () => {
    const values = { ...validValues(), paymentFrequency: "" }
    expect(errorPaths(values)).toContain("paymentFrequency")
  })

  it("exige le montant et la réponse fumeur quand un capital décès est demandé", () => {
    const values = { ...validValues(), deathCapital: true }
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining(["deathCapitalAmount", "smoker"])
    )
  })

  it("refuse un montant de capital décès illisible", () => {
    const values = {
      ...validValues(),
      deathCapital: true,
      deathCapitalAmount: "beaucoup",
      smoker: false,
    }
    expect(errorPaths(values)).toContain("deathCapitalAmount")
  })

  it("accepte un capital décès complet", () => {
    const values = {
      ...validValues(),
      deathCapital: true,
      deathCapitalAmount: "25000",
      smoker: true,
    }
    expect(epargnePensionSchema.safeParse(values).success).toBe(true)
  })

  it("ignore montant et fumeur sans capital décès", () => {
    const values = { ...validValues(), deathCapital: false, smoker: null }
    expect(epargnePensionSchema.safeParse(values).success).toBe(true)
  })

  it("exige l'état civil du preneur", () => {
    const values = validValues()
    values.holder.maritalStatus = "" as never
    expect(errorPaths(values)).toContain("holder.maritalStatus")
  })

  it("exige un numéro de téléphone", () => {
    const values = { ...validValues(), phone: "" }
    expect(errorPaths(values)).toContain("phone")
  })
})

/**
 * Chaque étape est validée seule, les suivantes gardant leurs valeurs par
 * défaut : la règle du capital décès ne doit pas attendre que tout le
 * formulaire soit valide pour se déclencher.
 */
describe("validation étape par étape", () => {
  /** Étape 1 remplie, les étapes suivantes encore vierges. */
  function savingsOnly(
    overrides: Partial<EpargnePensionValues> = {}
  ): EpargnePensionValues {
    return {
      ...structuredClone(epargnePensionDefaultValues),
      pensionAge: "67",
      annualContribution: "1050",
      paymentFrequency: "annual",
      deathCapital: false,
      ...overrides,
    }
  }

  it("ne présélectionne aucune réponse", () => {
    expect(errorPaths(epargnePensionDefaultValues)).toEqual(
      expect.arrayContaining([
        "pensionAge",
        "annualContribution",
        "paymentFrequency",
        "deathCapital",
        "holder.maritalStatus",
      ])
    )
  })

  it("exige le montant et la réponse fumeur dès l'étape de l'épargne", () => {
    const values = savingsOnly({ deathCapital: true })
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining(["deathCapitalAmount", "smoker"])
    )
  })

  it("n'exécute pas la règle croisée sur une charge utile mal typée", () => {
    const values = { ...validValues(), deathCapital: "oui", smoker: "x" }
    expect(errorPaths(values)).not.toContain("deathCapitalAmount")
  })
})
