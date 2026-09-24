import { describe, expect, it } from "vitest"

import type { HabitationValues } from "@/features/quotes/habitation/schema"
import { habitationSummary } from "@/features/quotes/habitation/summary"

function validValues(): HabitationValues {
  return {
    occupancy: "owner",
    monthlyRent: "",
    dwellingType: "house",
    facades: "detached",
    floor: "",
    propertyIsHolderAddress: true,
    propertyAddress: null,
    heating: "heat-pump",
    hasCellar: true,
    hasGarage: false,
    garageCapacity: "",
    rooms: "Salon, cuisine, 3 chambres",
    hasGarden: false,
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

/** Aplatit les sections en « Libellé: valeur » pour des assertions lisibles. */
function flatten(values: HabitationValues): string[] {
  return habitationSummary(values).flatMap((section) =>
    section.rows.map((row) => `${row.label}: ${row.value}`)
  )
}

describe("habitationSummary", () => {
  it("restitue l'ordre métier : preneur, logement, habitation, antécédents, coordonnées", () => {
    expect(habitationSummary(validValues()).map((s) => s.stepId)).toEqual([
      "holder",
      "property",
      "features",
      "history",
      "contact",
    ])
  })

  it("traduit les réponses du logement", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Statut: Propriétaire",
        "Type de logement: Maison",
        "Façades: 4 façades",
        "Adresse du logement: Identique à l'adresse légale",
      ])
    )
  })

  it("omet loyer et étage pour un propriétaire en maison", () => {
    const rows = flatten(validValues())
    expect(rows.some((row) => row.startsWith("Loyer"))).toBe(false)
    expect(rows.some((row) => row.startsWith("Étage"))).toBe(false)
  })

  it("détaille le loyer et l'étage d'un locataire en appartement", () => {
    const values: HabitationValues = {
      ...validValues(),
      occupancy: "tenant",
      monthlyRent: "850",
      dwellingType: "apartment",
      facades: null,
      floor: "0",
    }
    const rows = flatten(values)
    expect(rows).toEqual(
      expect.arrayContaining([
        "Statut: Locataire",
        "Loyer mensuel hors charges: 850,00 €",
        "Type de logement: Appartement",
        "Étage: Rez-de-chaussée",
      ])
    )
    expect(rows.some((row) => row.startsWith("Façades"))).toBe(false)
  })

  it.each([
    ["1", "1er étage"],
    ["4", "4e étage"],
  ])("formate l'étage %s", (floor, label) => {
    const values: HabitationValues = {
      ...validValues(),
      dwellingType: "apartment",
      facades: null,
      floor,
    }
    expect(flatten(values)).toContain(`Étage: ${label}`)
  })

  it("affiche l'adresse du logement quand elle diffère", () => {
    const values: HabitationValues = {
      ...validValues(),
      propertyIsHolderAddress: false,
      propertyAddress: {
        street: "Avenue Rogier",
        streetNumber: "3",
        postalCode: "4000",
        city: "Liège",
      },
    }
    expect(flatten(values)).toContain(
      "Adresse du logement: Avenue Rogier 3, 4000 Liège"
    )
  })

  it("traduit les réponses de l'habitation", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Chauffage: Pompe à chaleur",
        "Composition: Salon, cuisine, 3 chambres",
        "Cave: Oui",
        "Garage: Non",
        "Jardin: Non",
        "Aménagements particuliers: Non",
      ])
    )
  })

  it("détaille la capacité du garage", () => {
    const values = { ...validValues(), hasGarage: true, garageCapacity: "2" }
    expect(flatten(values)).toContain("— Capacité: 2 véhicules")
  })

  it("accorde la capacité au singulier", () => {
    const values = { ...validValues(), hasGarage: true, garageCapacity: "1" }
    expect(flatten(values)).toContain("— Capacité: 1 véhicule")
  })

  it("liste les aménagements, « Autre » précisé", () => {
    const values: HabitationValues = {
      ...validValues(),
      hasSpecialFeatures: true,
      specialFeatures: ["pool", "ev-charger", "other"],
      specialFeaturesOther: "Sauna",
    }
    expect(flatten(values)).toContain(
      "Aménagements particuliers: Piscine, Borne de recharge, Autre aménagement : Sauna"
    )
  })

  it("restitue reprise et sinistres", () => {
    const values: HabitationValues = {
      ...validValues(),
      isTakeover: true,
      currentInsurer: "AG Insurance",
      lastAnnualPremium: "420",
      hasClaims: true,
      claims: [{ year: "2024", type: "water" }],
    }
    expect(flatten(values)).toEqual(
      expect.arrayContaining([
        "Reprise d'un contrat existant: Oui",
        "Compagnie actuelle: AG Insurance",
        "Dernière prime annuelle: 420,00 €",
        "Sinistres ces 5 dernières années: Oui",
        "Sinistre 1: 2024 — Dégâts des eaux",
      ])
    )
  })
})
