import { describe, expect, it } from "vitest"

import type { SanteHospitalisationValues } from "@/features/quotes/sante-hospitalisation/schema"
import { santeHospitalisationSummary } from "@/features/quotes/sante-hospitalisation/summary"

function validValues(): SanteHospitalisationValues {
  return {
    coverHospitalisation: true,
    coverMedicalCare: false,
    coverDental: true,
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
function flatten(values: SanteHospitalisationValues): string[] {
  return santeHospitalisationSummary(values).flatMap((section) =>
    section.rows.map((row) => `${row.label}: ${row.value}`)
  )
}

describe("santeHospitalisationSummary", () => {
  it("restitue l'ordre métier : preneur, assurés, couvertures, coordonnées", () => {
    expect(
      santeHospitalisationSummary(validValues()).map((s) => s.stepId)
    ).toEqual(["holder", "insured", "coverage", "contact"])
  })

  it("traduit chaque couverture en Oui/Non", () => {
    expect(flatten(validValues())).toEqual(
      expect.arrayContaining([
        "Hospitalisation et frais liés à une opération: Oui",
        "Frais médicaux courants: Non",
        "Frais dentaires: Oui",
      ])
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
})
