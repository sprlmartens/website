import { describe, expect, it } from "vitest"

import type { AutoMotoValues } from "@/features/quotes/auto-moto/schema"
import { autoMotoSummary } from "@/features/quotes/auto-moto/summary"

function validValues(): AutoMotoValues {
  return {
    vehicleType: "motorbike",
    brand: "Yamaha",
    model: "MT-07",
    powerKw: "54",
    fuelType: "petrol",
    firstRegistration: "15/03/2021",
    vehicleValue: "9500",
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

/** Aplatit les sections en « Libellé: valeur » pour des assertions lisibles. */
function flatten(values: AutoMotoValues): string[] {
  return autoMotoSummary(values).flatMap((section) =>
    section.rows.map((row) => `${row.label}: ${row.value}`)
  )
}

describe("autoMotoSummary", () => {
  it("restitue l'ordre métier : preneur, conducteur, véhicule, garanties, coordonnées", () => {
    expect(autoMotoSummary(validValues()).map((s) => s.stepId)).toEqual([
      "holder",
      "driver",
      "vehicle",
      "coverage",
      "contact",
    ])
  })

  it("traduit et formate les réponses du véhicule", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Type: Moto",
        "Marque et modèle: Yamaha MT-07",
        "Puissance: 54 kW",
        "Carburant: Essence",
        "Première mise en circulation: 15/03/2021",
        "Valeur du véhicule HTVA: 9 500,00 €",
      ])
    )
  })

  it("traduit les garanties", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Formule: RC seule",
        "Protection juridique: J’ai déjà un contrat spécialisé (DAS, ARAG, Legal Village…)",
        "Assurance conducteur: Oui",
        "Reprise d'un contrat existant: Non",
      ])
    )
  })

  it("omet les détails de reprise sans reprise", () => {
    const rows = flatten(validValues())
    expect(rows.some((row) => row.startsWith("Compagnie actuelle"))).toBe(false)
    expect(rows.some((row) => row.startsWith("Dernière prime"))).toBe(false)
  })

  it("détaille la reprise quand elle s'applique", () => {
    const values = {
      ...validValues(),
      isTakeover: true,
      currentInsurer: "AG Insurance",
      lastAnnualPremium: "650",
    }
    expect(flatten(values)).toEqual(
      expect.arrayContaining([
        "Compagnie actuelle: AG Insurance",
        "Dernière prime annuelle: 650,00 €",
      ])
    )
  })

  it("omet la fiche du conducteur quand c'est le preneur", () => {
    const rows = flatten(validValues())
    expect(rows).toContain("Le preneur est le conducteur principal: Oui")
    expect(rows.some((row) => row.startsWith("Conducteur principal:"))).toBe(
      false
    )
  })

  it("détaille le conducteur principal quand ce n'est pas le preneur", () => {
    const values = {
      ...validValues(),
      holderIsMainDriver: false,
      mainDriver: {
        firstName: "Alex",
        lastName: "Dupont",
        birthDate: "02/09/2003",
        gender: "M" as const,
        street: "Avenue Rogier",
        streetNumber: "3",
        postalCode: "4000",
        city: "Liège",
        relationship: "child" as const,
      },
    }
    expect(flatten(values)).toEqual(
      expect.arrayContaining([
        "Le preneur est le conducteur principal: Non",
        "Conducteur principal: Dupont Alex",
        "— Date de naissance: 02/09/2003",
        "— Genre: Masculin",
        "— Adresse: Avenue Rogier 3",
        "— Code postal et localité: 4000 Liège",
        "— Lien avec le preneur: Enfant",
      ])
    )
  })

  it("liste les sinistres déclarés", () => {
    const values = {
      ...validValues(),
      hasClaims: true,
      claims: [
        { year: "2023", type: "glass" as const },
        { year: "2021", type: "liability" as const },
      ],
    }
    expect(flatten(values)).toEqual(
      expect.arrayContaining([
        "Sinistres ces 5 dernières années: Oui",
        "Sinistre 1: 2023 — Bris de glace",
        "Sinistre 2: 2021 — Responsabilité civile (en tort)",
      ])
    )
  })

  it("affiche le téléphone", () => {
    expect(flatten(validValues())).toContain("Téléphone: 0475123456")
  })
})
