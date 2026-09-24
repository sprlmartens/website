import type { SummaryRow, SummarySection } from "@/features/quotes/core/types"
import { genderLabels } from "@/features/quotes/shared/schema"
import {
  addressRows,
  claimsRows,
  contactSection,
  holderSection,
  takeoverRows,
  yesNo,
} from "@/features/quotes/shared/summary"
import { formatEuroAmount } from "@/lib/validation"

import {
  claimTypeLabels,
  formulaLabels,
  fuelTypeLabels,
  legalProtectionLabels,
  relationshipLabels,
  vehicleTypeLabels,
  type AutoMotoValues,
  type MainDriver,
} from "./schema"

function mainDriverRows(driver: MainDriver): SummaryRow[] {
  return [
    {
      label: "Conducteur principal",
      value: `${driver.lastName} ${driver.firstName}`,
    },
    { label: "— Date de naissance", value: driver.birthDate },
    { label: "— Genre", value: genderLabels[driver.gender] },
    ...addressRows(driver).map((row) => ({ ...row, label: `— ${row.label}` })),
    {
      label: "— Lien avec le preneur",
      value: relationshipLabels[driver.relationship],
    },
  ]
}

/**
 * Construit le récapitulatif dans l'ordre du dossier assureur — preneur,
 * conducteur, véhicule, garanties — quel que soit l'ordre de saisie.
 *
 * Utilisé par l'écran récapitulatif, l'e-mail à l'agence et l'accusé de
 * réception : les libellés ne peuvent pas diverger.
 */
export function autoMotoSummary(values: AutoMotoValues): SummarySection[] {
  return [
    holderSection(values),
    {
      title: "Le conducteur principal",
      stepId: "driver",
      rows: [
        {
          label: "Le preneur est le conducteur principal",
          value: yesNo(values.holderIsMainDriver),
        },
        ...(!values.holderIsMainDriver && values.mainDriver
          ? mainDriverRows(values.mainDriver)
          : []),
        { label: "Date d'obtention du permis", value: values.licenceDate },
        ...claimsRows(values, claimTypeLabels),
      ],
    },
    {
      title: "Le véhicule",
      stepId: "vehicle",
      rows: [
        { label: "Type", value: vehicleTypeLabels[values.vehicleType] },
        { label: "Marque et modèle", value: `${values.brand} ${values.model}` },
        { label: "Puissance", value: `${values.powerKw} kW` },
        { label: "Carburant", value: fuelTypeLabels[values.fuelType] },
        {
          label: "Première mise en circulation",
          value: values.firstRegistration,
        },
        {
          label: "Valeur du véhicule HTVA",
          value: formatEuroAmount(values.vehicleValue),
        },
      ],
    },
    {
      title: "Les garanties",
      stepId: "coverage",
      rows: [
        { label: "Formule", value: formulaLabels[values.formula] },
        {
          label: "Protection juridique",
          value: legalProtectionLabels[values.legalProtection],
        },
        { label: "Assurance conducteur", value: yesNo(values.driverInsurance) },
        ...takeoverRows(values),
      ],
    },
    contactSection(values),
  ]
}
