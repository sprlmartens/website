import { describe, expect, it } from "vitest"

import type { FamilialeValues } from "@/features/quotes/familiale/schema"
import { familialeSummary } from "@/features/quotes/familiale/summary"

function validValues(): FamilialeValues {
  return {
    household: "single",
    childrenCount: "",
    isTakeover: false,
    currentInsurer: "",
    lastAnnualPremium: "",
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

/** Aplatit les sections en « Libellé: valeur » pour des assertions lisibles. */
function flatten(values: FamilialeValues): string[] {
  return familialeSummary(values).flatMap((section) =>
    section.rows.map((row) => `${row.label}: ${row.value}`)
  )
}

describe("familialeSummary", () => {
  it("restitue l'ordre métier : preneur, situation, coordonnées", () => {
    expect(familialeSummary(validValues()).map((s) => s.stepId)).toEqual([
      "holder",
      "situation",
      "contact",
    ])
  })

  it.each([
    ["single", "Seul(e)"],
    ["couple", "En couple"],
  ] as const)("traduit le foyer « %s » sans ligne d'enfants", (household, label) => {
    const rows = flatten({ ...validValues(), household })
    expect(rows).toContain(`Composition du foyer: ${label}`)
    expect(rows.some((row) => row.startsWith("— Enfants"))).toBe(false)
  })

  it("détaille le nombre d'enfants d'une famille", () => {
    const values: FamilialeValues = {
      ...validValues(),
      household: "family",
      childrenCount: "3",
    }
    expect(flatten(values)).toEqual(
      expect.arrayContaining([
        "Composition du foyer: En famille",
        "— Enfants: 3 enfants",
      ])
    )
  })

  it("accorde le nombre d'enfants au singulier", () => {
    const values: FamilialeValues = {
      ...validValues(),
      household: "family",
      childrenCount: "1",
    }
    expect(flatten(values)).toContain("— Enfants: 1 enfant")
  })

  it("restitue reprise et sinistres", () => {
    const values: FamilialeValues = {
      ...validValues(),
      isTakeover: true,
      currentInsurer: "AG Insurance",
      lastAnnualPremium: "95",
      hasClaims: true,
      claims: [{ year: "2024", type: "animal" }],
    }
    expect(flatten(values)).toEqual(
      expect.arrayContaining([
        "Reprise d'un contrat existant: Oui",
        "Compagnie actuelle: AG Insurance",
        "Dernière prime annuelle: 95,00 €",
        "Sinistres ces 5 dernières années: Oui",
        "Sinistre 1: 2024 — Dégâts causés par un animal",
      ])
    )
  })
})
