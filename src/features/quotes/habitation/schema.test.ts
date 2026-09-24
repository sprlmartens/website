import { describe, expect, it } from "vitest"

import {
  habitationDefaultValues,
  habitationSchema,
  type HabitationValues,
} from "@/features/quotes/habitation/schema"
import { emptyAddress } from "@/features/quotes/shared/schema"

const currentYear = new Date().getUTCFullYear()

/** Un dossier complet et valide, que chaque test dégrade sur un seul point. */
function validValues(): HabitationValues {
  return {
    occupancy: "owner",
    monthlyRent: "",
    dwellingType: "house",
    facades: "semi-detached",
    floor: "",
    propertyIsHolderAddress: true,
    propertyAddress: null,
    heating: "gas",
    hasCellar: true,
    hasGarage: false,
    garageCapacity: "",
    rooms: "Salon, salle à manger, cuisine, 3 chambres, 1 bureau",
    hasGarden: true,
    hasSpecialFeatures: false,
    specialFeatures: [],
    specialFeaturesOther: "",
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

function apartment(floor: string): HabitationValues {
  return { ...validValues(), dwellingType: "apartment", facades: null, floor }
}

/** Renvoie les chemins d'erreur, pour des assertions lisibles. */
function errorPaths(values: unknown): string[] {
  const result = habitationSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("habitationSchema", () => {
  it("accepte un dossier complet", () => {
    expect(habitationSchema.safeParse(validValues()).success).toBe(true)
  })

  describe("statut d'occupation", () => {
    it("exige le loyer d'un locataire", () => {
      const values = { ...validValues(), occupancy: "tenant" as const }
      expect(errorPaths(values)).toContain("monthlyRent")
    })

    it.each(["850", "1 250,50"])("accepte un loyer de %s €", (monthlyRent) => {
      const values = {
        ...validValues(),
        occupancy: "tenant" as const,
        monthlyRent,
      }
      expect(habitationSchema.safeParse(values).success).toBe(true)
    })

    it("refuse un loyer illisible", () => {
      const values = {
        ...validValues(),
        occupancy: "tenant" as const,
        monthlyRent: "beaucoup",
      }
      expect(errorPaths(values)).toContain("monthlyRent")
    })

    it("ne demande pas de loyer à un propriétaire", () => {
      expect(errorPaths(validValues())).not.toContain("monthlyRent")
    })
  })

  describe("type de logement", () => {
    it("exige les façades d'une maison", () => {
      const values = { ...validValues(), facades: null }
      expect(errorPaths(values)).toContain("facades")
    })

    it("ne demande pas d'étage pour une maison", () => {
      expect(errorPaths(validValues())).not.toContain("floor")
    })

    it.each(["0", "3", "99"])("accepte l'étage %s", (floor) => {
      expect(habitationSchema.safeParse(apartment(floor)).success).toBe(true)
    })

    it.each(["", "100", "-1", "2e"])("refuse l'étage « %s »", (floor) => {
      expect(errorPaths(apartment(floor))).toContain("floor")
    })

    it("ne demande pas de façades pour un appartement", () => {
      expect(errorPaths(apartment("2"))).not.toContain("facades")
    })
  })

  describe("adresse du logement", () => {
    it("exige l'adresse quand ce n'est pas l'adresse légale", () => {
      const values = { ...validValues(), propertyIsHolderAddress: false }
      expect(errorPaths(values)).toContain("propertyAddress")
    })

    it("valide la fiche d'adresse", () => {
      const values = {
        ...validValues(),
        propertyIsHolderAddress: false,
        propertyAddress: emptyAddress,
      }
      expect(errorPaths(values)).toEqual(
        expect.arrayContaining([
          "propertyAddress.street",
          "propertyAddress.postalCode",
          "propertyAddress.city",
        ])
      )
    })

    it("accepte une adresse complète", () => {
      const values = {
        ...validValues(),
        propertyIsHolderAddress: false,
        propertyAddress: {
          street: "Avenue Rogier",
          streetNumber: "3",
          postalCode: "4000",
          city: "Liège",
        },
      }
      expect(habitationSchema.safeParse(values).success).toBe(true)
    })
  })

  describe("garage", () => {
    it("exige la capacité d'un garage", () => {
      const values = { ...validValues(), hasGarage: true }
      expect(errorPaths(values)).toContain("garageCapacity")
    })

    it.each(["1", "10"])("accepte %s véhicule(s)", (garageCapacity) => {
      const values = { ...validValues(), hasGarage: true, garageCapacity }
      expect(habitationSchema.safeParse(values).success).toBe(true)
    })

    it.each(["0", "11", "deux"])(
      "refuse une capacité « %s »",
      (garageCapacity) => {
        const values = { ...validValues(), hasGarage: true, garageCapacity }
        expect(errorPaths(values)).toContain("garageCapacity")
      }
    )
  })

  it("exige la composition de l'habitation", () => {
    const values = { ...validValues(), rooms: " " }
    expect(errorPaths(values)).toContain("rooms")
  })

  describe("aménagements particuliers", () => {
    it("exige au moins un aménagement quand la réponse est « Oui »", () => {
      const values = { ...validValues(), hasSpecialFeatures: true }
      expect(errorPaths(values)).toContain("specialFeatures")
    })

    it("accepte des aménagements cochés", () => {
      const values = {
        ...validValues(),
        hasSpecialFeatures: true,
        specialFeatures: ["pool" as const, "solar-panels" as const],
      }
      expect(habitationSchema.safeParse(values).success).toBe(true)
    })

    it("exige une précision pour « Autre »", () => {
      const values = {
        ...validValues(),
        hasSpecialFeatures: true,
        specialFeatures: ["other" as const],
      }
      expect(errorPaths(values)).toContain("specialFeaturesOther")
    })

    it("accepte « Autre » précisé", () => {
      const values = {
        ...validValues(),
        hasSpecialFeatures: true,
        specialFeatures: ["other" as const],
        specialFeaturesOther: "Sauna",
      }
      expect(habitationSchema.safeParse(values).success).toBe(true)
    })

    it("refuse un aménagement inconnu", () => {
      const values = {
        ...validValues(),
        hasSpecialFeatures: true,
        specialFeatures: ["helipad"],
      }
      expect(errorPaths(values)).toContain("specialFeatures.0")
    })
  })

  it("exige compagnie et prime en cas de reprise", () => {
    const values = { ...validValues(), isTakeover: true }
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining(["currentInsurer", "lastAnnualPremium"])
    )
  })

  it("exige au moins un sinistre quand l'historique en annonce", () => {
    const values = { ...validValues(), hasClaims: true, claims: [] }
    expect(errorPaths(values)).toContain("claims")
  })

  it("accepte un sinistre habitation des 5 dernières années", () => {
    const values = {
      ...validValues(),
      hasClaims: true,
      claims: [{ year: String(currentYear - 2), type: "water" as const }],
    }
    expect(habitationSchema.safeParse(values).success).toBe(true)
  })

  it("refuse un type de sinistre propre à l'auto", () => {
    const values = {
      ...validValues(),
      hasClaims: true,
      claims: [{ year: String(currentYear), type: "material-damage" }],
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
  function withDefaults(overrides: Partial<HabitationValues>): HabitationValues {
    return { ...structuredClone(habitationDefaultValues), ...overrides }
  }

  it("ne présélectionne aucune réponse", () => {
    expect(errorPaths(habitationDefaultValues)).toEqual(
      expect.arrayContaining([
        "occupancy",
        "dwellingType",
        "propertyIsHolderAddress",
        "heating",
        "rooms",
        "hasCellar",
        "hasGarage",
        "hasGarden",
        "hasSpecialFeatures",
        "isTakeover",
        "hasClaims",
      ])
    )
  })

  it("exige le loyer dès l'étape du logement", () => {
    const values = withDefaults({ occupancy: "tenant" })
    expect(errorPaths(values)).toContain("monthlyRent")
  })

  it("exige les façades dès l'étape du logement", () => {
    const values = withDefaults({ dwellingType: "house" })
    expect(errorPaths(values)).toContain("facades")
  })

  it("exige la capacité du garage dès l'étape de l'habitation", () => {
    const values = withDefaults({ hasGarage: true })
    expect(errorPaths(values)).toContain("garageCapacity")
  })

  it("exige un aménagement dès l'étape de l'habitation", () => {
    const values = withDefaults({ hasSpecialFeatures: true })
    expect(errorPaths(values)).toContain("specialFeatures")
  })

  it("exige compagnie et prime dès l'étape des antécédents", () => {
    const values = withDefaults({ isTakeover: true })
    expect(errorPaths(values)).toEqual(
      expect.arrayContaining(["currentInsurer", "lastAnnualPremium"])
    )
  })

  it("n'exécute pas les règles croisées sur une charge utile mal typée", () => {
    const values = {
      ...validValues(),
      occupancy: "squatteur",
      dwellingType: "château",
      hasGarage: "oui",
      hasSpecialFeatures: "x",
      isTakeover: "oui",
    }
    const paths = errorPaths(values)
    expect(paths).not.toContain("monthlyRent")
    expect(paths).not.toContain("facades")
    expect(paths).not.toContain("garageCapacity")
    expect(paths).not.toContain("specialFeatures")
    expect(paths).not.toContain("currentInsurer")
  })
})
