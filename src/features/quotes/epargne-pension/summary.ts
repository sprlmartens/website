import type { SummarySection } from "@/features/quotes/core/types"
import {
  contactSection,
  holderSection,
  yesNo,
} from "@/features/quotes/shared/summary"
import { formatEuroAmount } from "@/lib/validation"

import {
  maritalStatusLabels,
  paymentFrequencyLabels,
  type EpargnePensionValues,
} from "./schema"

/**
 * Construit le récapitulatif dans l'ordre du dossier assureur — preneur,
 * épargne, coordonnées — quel que soit l'ordre de saisie.
 *
 * Utilisé par l'écran récapitulatif, l'e-mail à l'agence et l'accusé de
 * réception : les libellés ne peuvent pas diverger.
 */
export function epargnePensionSummary(
  values: EpargnePensionValues
): SummarySection[] {
  return [
    holderSection(values, [
      {
        label: "État civil",
        value: maritalStatusLabels[values.holder.maritalStatus],
      },
    ]),
    {
      title: "L'épargne-pension",
      stepId: "savings",
      rows: [
        { label: "Âge de la pension légale", value: `${values.pensionAge} ans` },
        {
          label: "Versement annuel",
          value: formatEuroAmount(values.annualContribution),
        },
        {
          label: "Fréquence des versements",
          value: paymentFrequencyLabels[values.paymentFrequency],
        },
        { label: "Capital décès minimum", value: yesNo(values.deathCapital) },
        ...(values.deathCapital
          ? [
              {
                label: "Montant du capital décès",
                value: formatEuroAmount(values.deathCapitalAmount ?? ""),
              },
              { label: "Fumeur", value: yesNo(values.smoker === true) },
            ]
          : []),
      ],
    },
    contactSection(values),
  ]
}
