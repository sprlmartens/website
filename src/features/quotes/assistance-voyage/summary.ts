import type { SummarySection } from "@/features/quotes/core/types"
import { formatEuroAmount } from "@/lib/validation"

import {
  coverageDurationLabels,
  destinationLabels,
  genderLabels,
  type AssistanceVoyageValues,
} from "./schema"

function yesNo(value: boolean): string {
  return value ? "Oui" : "Non"
}

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
    {
      title: "Le preneur d'assurance",
      stepId: "holder",
      rows: [
        { label: "Nom", value: values.holder.lastName },
        { label: "Prénom", value: values.holder.firstName },
        { label: "Date de naissance", value: values.holder.birthDate },
        { label: "Genre", value: genderLabels[values.holder.gender] },
        {
          label: "Adresse",
          value: `${values.holder.street} ${values.holder.streetNumber}`,
        },
        {
          label: "Code postal et localité",
          value: `${values.holder.postalCode} ${values.holder.city}`,
        },
      ],
    },
    {
      title: "Les personnes assurées",
      stepId: "insured",
      rows: [
        { label: "Le preneur est assuré", value: yesNo(values.insureHolder) },
        ...values.additionalInsured.flatMap((person, index) => [
          {
            label: `Assuré supplémentaire ${index + 1}`,
            value: `${person.lastName} ${person.firstName}`,
          },
          { label: "— Date de naissance", value: person.birthDate },
          { label: "— Genre", value: genderLabels[person.gender] },
        ]),
      ],
    },
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
    {
      title: "Vos coordonnées",
      stepId: "contact",
      rows: [
        { label: "E-mail", value: values.email },
        { label: "Téléphone", value: values.phone || "Non renseigné" },
        ...(values.message
          ? [{ label: "Message", value: values.message }]
          : []),
      ],
    },
  ]
}
