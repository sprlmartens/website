import { describe, expect, it } from "vitest"

import { assistanceVoyageSummary } from "@/features/quotes/assistance-voyage/summary"
import type { AssistanceVoyageValues } from "@/features/quotes/assistance-voyage/schema"

function validValues(): AssistanceVoyageValues {
  return {
    destination: "world",
    coverageDuration: "annual",
    periodStart: "",
    periodEnd: "",
    tripValue: "2500,50",
    insureVehicle: false,
    vehicleFirstRegistration: "",
    insureHolder: true,
    hasAdditionalInsured: false,
    additionalInsured: [],
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
    phone: "",
    message: "",
    consent: true,
    honeypot: "",
  }
}

/** Aplatit les sections en « Libellé: valeur » pour des assertions lisibles. */
function flatten(values: AssistanceVoyageValues): string[] {
  return assistanceVoyageSummary(values).flatMap((section) =>
    section.rows.map((row) => `${row.label}: ${row.value}`)
  )
}

describe("assistanceVoyageSummary", () => {
  it("restitue l'ordre métier : preneur, assurés, voyage, coordonnées", () => {
    expect(assistanceVoyageSummary(validValues()).map((s) => s.stepId)).toEqual([
      "holder",
      "insured",
      "trip",
      "contact",
    ])
  })

  it("traduit les énumérations en libellés français", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Genre: Féminin",
        "Destination: Le monde",
        "Durée de la couverture: Une année",
      ])
    )
  })

  it("formate le montant du voyage", () => {
    expect(flatten(validValues())).toContain("Valeur du voyage: 2 500,50 €")
  })

  it("compose l'adresse en deux lignes", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Adresse: Rue de la Station 12A",
        "Code postal et localité: 4000 Liège",
      ])
    )
  })

  it("n'affiche pas la période quand la couverture est annuelle", () => {
    expect(flatten(validValues()).some((row) => row.startsWith("Période:"))).toBe(
      false
    )
  })

  it("affiche la période quand elle est renseignée", () => {
    const values = {
      ...validValues(),
      coverageDuration: "period" as const,
      periodStart: "01/07/2099",
      periodEnd: "15/07/2099",
    }
    expect(flatten(values)).toContain("Période: du 01/07/2099 au 15/07/2099")
  })

  it("n'affiche la mise en circulation que si un véhicule est assuré", () => {
    expect(
      flatten(validValues()).some((row) =>
        row.startsWith("Mise en circulation")
      )
    ).toBe(false)

    const values = {
      ...validValues(),
      insureVehicle: true,
      vehicleFirstRegistration: "20/06/2018",
    }
    expect(flatten(values)).toContain(
      "Mise en circulation du véhicule: 20/06/2018"
    )
  })

  it("liste chaque assuré supplémentaire", () => {
    const values = {
      ...validValues(),
      hasAdditionalInsured: true,
      additionalInsured: [
        {
          firstName: "Louis",
          lastName: "Dupont",
          birthDate: "02/09/2010",
          gender: "M" as const,
        },
      ],
    }
    expect(flatten(values)).toEqual(
      expect.arrayContaining([
        "Assuré supplémentaire 1: Dupont Louis",
        "— Date de naissance: 02/09/2010",
        "— Genre: Masculin",
      ])
    )
  })

  it("indique un téléphone non renseigné plutôt qu'une ligne vide", () => {
    expect(flatten(validValues())).toContain("Téléphone: Non renseigné")
  })

  it("omet le message quand il est vide", () => {
    expect(flatten(validValues()).some((row) => row.startsWith("Message:"))).toBe(
      false
    )
  })
})
