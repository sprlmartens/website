import { describe, expect, it } from "vitest"

import type { SoldeRestantDuValues } from "@/features/quotes/solde-restant-du/schema"
import { soldeRestantDuSummary } from "@/features/quotes/solde-restant-du/summary"

function validValues(): SoldeRestantDuValues {
  return {
    loanAmount: "250000",
    loanDuration: "25",
    effectiveDate: "01/12/2030",
    holderCoverage: "100",
    holderHealthNotes: "",
    hasSecondInsured: false,
    secondInsured: undefined,
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

/** Aplatit les sections en « Libellé: valeur » pour des assertions lisibles. */
function flatten(values: SoldeRestantDuValues): string[] {
  return soldeRestantDuSummary(values).flatMap((section) =>
    section.rows.map((row) => `${row.label}: ${row.value}`)
  )
}

describe("soldeRestantDuSummary", () => {
  it("restitue l'ordre métier : preneur, crédit, assurés, coordonnées", () => {
    expect(soldeRestantDuSummary(validValues()).map((s) => s.stepId)).toEqual([
      "holder",
      "loan",
      "insured",
      "contact",
    ])
  })

  it("formate les réponses sur le crédit", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Montant initial: 250 000,00 €",
        "Durée: 25 ans",
        "Date de prise d'effet: 01/12/2030",
        "Quotité du preneur: 100 %",
        "Seconde personne assurée: Non",
      ])
    )
  })

  it("omet les commentaires santé vides et la seconde personne", () => {
    const rows = flatten(validValues())
    expect(rows.some((row) => row.includes("Santé"))).toBe(false)
    expect(rows.some((row) => row.startsWith("— "))).toBe(false)
  })

  it("détaille la seconde personne quand elle est assurée", () => {
    const values: SoldeRestantDuValues = {
      ...validValues(),
      holderHealthNotes: "Asthme léger",
      hasSecondInsured: true,
      secondInsured: {
        firstName: "Alex",
        lastName: "Martin",
        birthDate: "02/07/1987",
        gender: "M",
        coverage: "50",
        healthNotes: "Aucune",
      },
    }
    expect(flatten(values)).toEqual(
      expect.arrayContaining([
        "Santé du preneur: Asthme léger",
        "Seconde personne assurée: Oui",
        "— Nom et prénom: Martin Alex",
        "— Date de naissance: 02/07/1987",
        "— Genre: Masculin",
        "— Quotité: 50 %",
        "— Santé: Aucune",
      ])
    )
  })

  it("ignore une fiche restée sans « Oui »", () => {
    const values: SoldeRestantDuValues = {
      ...validValues(),
      secondInsured: {
        firstName: "Alex",
        lastName: "Martin",
        birthDate: "02/07/1987",
        gender: "M",
        coverage: "50",
        healthNotes: "",
      },
    }
    expect(flatten(values)).not.toContain("— Nom et prénom: Martin Alex")
  })
})
