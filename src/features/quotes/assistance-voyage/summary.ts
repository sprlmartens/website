import type { SummarySection } from "@/features/quotes/core/types"
import {
  contactSection,
  holderSection,
  insuredSection,
  yesNo,
} from "@/features/quotes/shared/summary"
import { formatEuroAmount } from "@/lib/validation"

import {
  coverageDurationLabels,
  destinationLabels,
  type AssistanceVoyageValues,
} from "./schema"

/**
 * Construit le récapitulatif dans l'ordre du dossier assureur — preneur,
 * assurés, voyage — quel que soit l'ordre de saisie.
 *
 * Utilisé par l'écran récapitulatif, l'e-mail à l'agence et l'accusé de
 * réception : les libellés ne peuvent pas diverger.
 */
export function assistanceVoyageSummary(
  values: AssistanceVoyageValues
): SummarySection[] {
  return [
    holderSection(values),
    insuredSection(values),
    {
      title: "Le voyage",
      stepId: "trip",
      rows: [
        { label: "Destination", value: destinationLabels[values.destination] },
        {
          label: "Durée de la couverture",
          value: coverageDurationLabels[values.coverageDuration],
        },
        ...(values.coverageDuration === "period"
          ? [
              {
                label: "Période",
                value: `du ${values.periodStart} au ${values.periodEnd}`,
              },
            ]
          : []),
        { label: "Valeur du voyage", value: formatEuroAmount(values.tripValue) },
        { label: "Véhicule à assurer", value: yesNo(values.insureVehicle) },
        ...(values.insureVehicle
          ? [
              {
                label: "Mise en circulation du véhicule",
                value: values.vehicleFirstRegistration ?? "",
              },
            ]
          : []),
      ],
    },
    contactSection(values),
  ]
}
