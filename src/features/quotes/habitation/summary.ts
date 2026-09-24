import type { SummaryRow, SummarySection } from "@/features/quotes/core/types"
import {
  claimsRows,
  contactSection,
  holderSection,
  takeoverRows,
  yesNo,
} from "@/features/quotes/shared/summary"
import { formatEuroAmount } from "@/lib/validation"

import {
  claimTypeLabels,
  dwellingTypeLabels,
  facadeTypeLabels,
  heatingTypeLabels,
  occupancyLabels,
  specialFeatureLabels,
  type HabitationValues,
} from "./schema"

function floorLabel(floor: string): string {
  const number = Number(floor)
  if (number === 0) {
    return "Rez-de-chaussée"
  }
  return number === 1 ? "1er étage" : `${number}e étage`
}

function propertyRows(values: HabitationValues): SummaryRow[] {
  const address = values.propertyAddress

  return [
    { label: "Statut", value: occupancyLabels[values.occupancy] },
    ...(values.occupancy === "tenant"
      ? [
          {
            label: "Loyer mensuel hors charges",
            value: formatEuroAmount(values.monthlyRent ?? ""),
          },
        ]
      : []),
    { label: "Type de logement", value: dwellingTypeLabels[values.dwellingType] },
    ...(values.dwellingType === "house" && values.facades
      ? [{ label: "Façades", value: facadeTypeLabels[values.facades] }]
      : []),
    ...(values.dwellingType === "apartment"
      ? [{ label: "Étage", value: floorLabel(values.floor ?? "") }]
      : []),
    {
      label: "Adresse du logement",
      value:
        values.propertyIsHolderAddress || !address
          ? "Identique à l'adresse légale"
          : `${address.street} ${address.streetNumber}, ${address.postalCode} ${address.city}`,
    },
  ]
}

function specialFeaturesValue(values: HabitationValues): string {
  if (!values.hasSpecialFeatures) {
    return "Non"
  }

  return values.specialFeatures
    .map((feature) =>
      feature === "other"
        ? `${specialFeatureLabels.other} : ${values.specialFeaturesOther ?? ""}`
        : specialFeatureLabels[feature]
    )
    .join(", ")
}

function featureRows(values: HabitationValues): SummaryRow[] {
  const capacity = Number(values.garageCapacity)

  return [
    { label: "Chauffage", value: heatingTypeLabels[values.heating] },
    { label: "Composition", value: values.rooms },
    { label: "Cave", value: yesNo(values.hasCellar) },
    { label: "Garage", value: yesNo(values.hasGarage) },
    ...(values.hasGarage
      ? [
          {
            label: "— Capacité",
            value: `${capacity} véhicule${capacity > 1 ? "s" : ""}`,
          },
        ]
      : []),
    { label: "Jardin", value: yesNo(values.hasGarden) },
    { label: "Aménagements particuliers", value: specialFeaturesValue(values) },
  ]
}

/**
 * Construit le récapitulatif dans l'ordre du dossier assureur — preneur,
 * logement, habitation, antécédents — quel que soit l'ordre de saisie.
 *
 * Utilisé par l'écran récapitulatif, l'e-mail à l'agence et l'accusé de
 * réception : les libellés ne peuvent pas diverger.
 */
export function habitationSummary(values: HabitationValues): SummarySection[] {
  return [
    holderSection(values),
    { title: "Le logement", stepId: "property", rows: propertyRows(values) },
    { title: "L'habitation", stepId: "features", rows: featureRows(values) },
    {
      title: "Les antécédents",
      stepId: "history",
      rows: [...takeoverRows(values), ...claimsRows(values, claimTypeLabels)],
    },
    contactSection(values),
  ]
}
