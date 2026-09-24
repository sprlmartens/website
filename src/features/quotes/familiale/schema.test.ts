import { describe, expect, it } from "vitest"

import {
  familialeDefaultValues,
  familialeSchema,
  type FamilialeValues,
} from "@/features/quotes/familiale/schema"

const currentYear = new Date().getUTCFullYear()

/** Un dossier complet et valide, que chaque test dégrade sur un seul point. */
function validValues(): FamilialeValues {
  return {
    household: "couple",
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

function family(childrenCount: string): FamilialeValues {
  return { ...validValues(), household: "family", childrenCount }
}

/** Renvoie les chemins d'erreur, pour des assertions lisibles. */
function errorPaths(values: unknown): string[] {
  const result = familialeSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("familialeSchema", () => {
  it("accepte un dossier complet", () => {
    expect(familialeSchema.safeParse(validValues()).success).toBe(true)
  })

  describe("composition du foyer", () => {
    it("refuse une composition inconnue", () => {
      const values = { ...validValues(), household: "colocation" }
      expect(errorPaths(values)).toContain("household")
    })

    it("exige le nombre d'enfants d'une famille", () => {
      expect(errorPaths(family(""))).toContain("childrenCount")
    })

    it.each(["1", "3", "10"])("accepte %s enfant(s)", (childrenCount) => {
      expect(familialeSchema.safeParse(family(childrenCount)).success).toBe(
        true
      )
    })

    it.each(["0", "11", "deux", "-1"])(
      "refuse un nombre d'enfants « %s »",
      (childrenCount) => {
        expect(errorPaths(family(childrenCount))).toContain("childrenCount")
      }
    )

    it.each(["single", "couple"] as const)(
      "ne demande pas d'enfants pour « %s »",
      (household) => {
        const values = { ...validValues(), household }
        expect(errorPaths(values)).not.toContain("childrenCount")
      }
    )
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
      lastAnnualPremium: "95",
    }
    expect(familialeSchema.safeParse(values).success).toBe(true)
  })

  it("exige au moins un sinistre quand l'historique en annonce", () => {
    const values = { ...validValues(), hasClaims: true, claims: [] }
    expect(errorPaths(values)).toContain("claims")
  })

  it("accepte un sinistre RC vie privée des 5 dernières années", () => {
    const values = {
      ...validValues(),
      hasClaims: true,
      claims: [{ year: String(currentYear - 1), type: "child" as const }],
    }
    expect(familialeSchema.safeParse(values).success).toBe(true)
  })

  it("refuse un type de sinistre propre à l'habitation", () => {
    const values = {
      ...validValues(),
      hasClaims: true,
      claims: [{ year: String(currentYear), type: "water" }],
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
  function withDefaults(overrides: Partial<FamilialeValues>): FamilialeValues {
    return { ...structuredClone(familialeDefaultValues), ...overrides }
  }

  it("ne présélectionne aucune réponse", () => {
    expect(errorPaths(familialeDefaultValues)).toEqual(
      expect.arrayContaining(["household", "isTakeover", "hasClaims"])
    )
  })

  it("exige le nombre d'enfants dès l'étape de la situation", () => {
    const values = withDefaults({ household: "family" })
    expect(errorPaths(values)).toContain("childrenCount")
  })

  it("exige compagnie et prime dès l'étape de la situation", () => {
    const values = withDefaults({ isTakeover: true })
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining(["currentInsurer", "lastAnnualPremium"])
    )
  })

  it("n'exécute pas les règles croisées sur une charge utile mal typée", () => {
    const values = {
      ...validValues(),
      household: "tribu",
      isTakeover: "oui",
      hasClaims: "oui",
    }
    const paths = errorPaths(values)
    expect(paths).not.toContain("childrenCount")
    expect(paths).not.toContain("currentInsurer")
    expect(paths).not.toContain("claims")
  })
})
