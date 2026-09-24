import { describe, expect, it } from "vitest"

import type { EpargnePensionValues } from "@/features/quotes/epargne-pension/schema"
import { epargnePensionSummary } from "@/features/quotes/epargne-pension/summary"

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
      maritalStatus: "cohabitant",
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

/** Aplatit les sections en « Libellé: valeur » pour des assertions lisibles. */
function flatten(values: EpargnePensionValues): string[] {
  return epargnePensionSummary(values).flatMap((section) =>
    section.rows.map((row) => `${row.label}: ${row.value}`)
  )
}

describe("epargnePensionSummary", () => {
  it("restitue l'ordre métier : preneur, épargne, coordonnées", () => {
    expect(epargnePensionSummary(validValues()).map((s) => s.stepId)).toEqual([
      "holder",
      "savings",
      "contact",
    ])
  })

  it("place l'état civil après le genre, avant l'adresse", () => {
    const rows = flatten(validValues())
    const gender = rows.indexOf("Genre: Féminin")
    const status = rows.indexOf("État civil: Cohabitant(e)")
    const address = rows.indexOf("Adresse: Rue de la Station 12A")
    expect(gender).toBeGreaterThanOrEqual(0)
    expect(status).toBe(gender + 1)
    expect(address).toBe(status + 1)
  })

  it("traduit et formate les réponses d'épargne", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Âge de la pension légale: 67 ans",
        "Versement annuel: 1 050,00 €",
        "Fréquence des versements: Mensuel",
        "Capital décès minimum: Non",
      ])
    )
  })

  it("omet montant et fumeur sans capital décès", () => {
    const rows = flatten(validValues())
    expect(rows.some((row) => row.startsWith("Montant du capital décès"))).toBe(
      false
    )
    expect(rows.some((row) => row.startsWith("Fumeur"))).toBe(false)
  })

  it("détaille le capital décès quand il est demandé", () => {
    const values = {
      ...validValues(),
      deathCapital: true,
      deathCapitalAmount: "25000",
      smoker: true,
    }
    expect(flatten(values)).toEqual(
      expect.arrayContaining([
        "Capital décès minimum: Oui",
        "Montant du capital décès: 25 000,00 €",
        "Fumeur: Oui",
      ])
    )
  })

  it("affiche le téléphone", () => {
    expect(flatten(validValues())).toContain("Téléphone: 0475123456")
  })
})
