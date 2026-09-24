import { describe, expect, it } from "vitest"

import {
  soldeRestantDuDefaultValues,
  soldeRestantDuSchema,
  type SoldeRestantDuValues,
} from "@/features/quotes/solde-restant-du/schema"

/** Date « JJ/MM/AAAA » décalée de `days` jours par rapport à aujourd'hui (UTC). */
function frenchDateFromToday(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  const dd = String(date.getUTCDate()).padStart(2, "0")
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}/${date.getUTCFullYear()}`
}

/** Un dossier complet et valide, que chaque test dégrade sur un seul point. */
function validValues(): SoldeRestantDuValues {
  return {
    loanAmount: "250000",
    loanDuration: "25",
    effectiveDate: frenchDateFromToday(30),
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

function withSecondInsured(): SoldeRestantDuValues {
  return {
    ...validValues(),
    hasSecondInsured: true,
    secondInsured: {
      firstName: "Alex",
      lastName: "Martin",
      birthDate: "02/07/1987",
      gender: "M",
      coverage: "50",
      healthNotes: "",
    },
  }
}

/** Renvoie les chemins d'erreur, pour des assertions lisibles. */
function errorPaths(values: unknown): string[] {
  const result = soldeRestantDuSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("soldeRestantDuSchema", () => {
  it("accepte un dossier complet sans seconde personne", () => {
    expect(soldeRestantDuSchema.safeParse(validValues()).success).toBe(true)
  })

  it("accepte un dossier complet avec une seconde personne", () => {
    expect(soldeRestantDuSchema.safeParse(withSecondInsured()).success).toBe(
      true
    )
  })

  it.each(["250000", "180 000", "95000,50"])(
    "accepte un crédit de %s €",
    (loanAmount) => {
      const values = { ...validValues(), loanAmount }
      expect(soldeRestantDuSchema.safeParse(values).success).toBe(true)
    }
  )

  it.each(["0", "", "beaucoup"])(
    "refuse un montant de crédit « %s »",
    (loanAmount) => {
      const values = { ...validValues(), loanAmount }
      expect(errorPaths(values)).toContain("loanAmount")
    }
  )

  it.each(["1", "40"])("accepte une durée de %s ans", (loanDuration) => {
    const values = { ...validValues(), loanDuration }
    expect(soldeRestantDuSchema.safeParse(values).success).toBe(true)
  })

  it.each(["0", "41", "20,5", ""])(
    "refuse une durée « %s »",
    (loanDuration) => {
      const values = { ...validValues(), loanDuration }
      expect(errorPaths(values)).toContain("loanDuration")
    }
  )

  it("accepte une prise d'effet aujourd'hui", () => {
    const values = { ...validValues(), effectiveDate: frenchDateFromToday(0) }
    expect(soldeRestantDuSchema.safeParse(values).success).toBe(true)
  })

  it("refuse une prise d'effet dans le passé", () => {
    const values = { ...validValues(), effectiveDate: frenchDateFromToday(-1) }
    expect(errorPaths(values)).toEqual(["effectiveDate"])
  })

  it("ne signale qu'une erreur pour une date illisible", () => {
    const values = { ...validValues(), effectiveDate: "31/02/2030" }
    expect(errorPaths(values)).toEqual(["effectiveDate"])
  })

  it.each(["0", "101", "50,5", ""])(
    "refuse une quotité « %s »",
    (holderCoverage) => {
      const values = { ...validValues(), holderCoverage }
      expect(errorPaths(values)).toContain("holderCoverage")
    }
  )

  it("refuse un commentaire santé trop long", () => {
    const values = { ...validValues(), holderHealthNotes: "a".repeat(1001) }
    expect(errorPaths(values)).toContain("holderHealthNotes")
  })

  it("exige la seconde personne quand elle est annoncée", () => {
    const values = { ...validValues(), hasSecondInsured: true }
    expect(errorPaths(values)).toContain("hasSecondInsured")
  })

  it("valide les champs de la seconde personne", () => {
    const values = withSecondInsured()
    values.secondInsured!.coverage = "150"
    values.secondInsured!.birthDate = ""
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining([
        "secondInsured.coverage",
        "secondInsured.birthDate",
      ])
    )
  })

  it("exige un numéro de téléphone", () => {
    const values = { ...validValues(), phone: "" }
    expect(errorPaths(values)).toContain("phone")
  })
})

describe("validation étape par étape", () => {
  it("ne présélectionne aucune réponse", () => {
    expect(errorPaths(soldeRestantDuDefaultValues)).toEqual(
      expect.arrayContaining([
        "loanAmount",
        "loanDuration",
        "effectiveDate",
        "holderCoverage",
        "hasSecondInsured",
      ])
    )
  })

  it("n'exécute pas la règle croisée sur une charge utile mal typée", () => {
    const values = { ...validValues(), hasSecondInsured: "oui" }
    expect(errorPaths(values)).toEqual(["hasSecondInsured"])
  })
})
