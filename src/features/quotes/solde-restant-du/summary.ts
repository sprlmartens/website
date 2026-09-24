import type { SummarySection } from "@/features/quotes/core/types"
import { genderLabels } from "@/features/quotes/shared/schema"
import {
  contactSection,
  holderSection,
  yesNo,
} from "@/features/quotes/shared/summary"
import { formatEuroAmount } from "@/lib/validation"

import type { SoldeRestantDuValues } from "./schema"

/**
 * Construit le récapitulatif dans l'ordre du dossier assureur — preneur,
 * crédit, assurés, coordonnées — quel que soit l'ordre de saisie.
 *
 * Utilisé par l'écran récapitulatif, l'e-mail à l'agence et l'accusé de
 * réception : les libellés ne peuvent pas diverger.
 */
export function soldeRestantDuSummary(
  values: SoldeRestantDuValues
): SummarySection[] {
  const second = values.hasSecondInsured ? values.secondInsured : undefined

  return [
    holderSection(values),
    {
      title: "Le crédit",
      stepId: "loan",
      rows: [
        { label: "Montant initial", value: formatEuroAmount(values.loanAmount) },
        { label: "Durée", value: `${values.loanDuration} ans` },
        { label: "Date de prise d'effet", value: values.effectiveDate },
      ],
    },
    {
      title: "Les personnes assurées",
      stepId: "insured",
      rows: [
        { label: "Quotité du preneur", value: `${values.holderCoverage} %` },
        ...(values.holderHealthNotes
          ? [{ label: "Santé du preneur", value: values.holderHealthNotes }]
          : []),
        { label: "Seconde personne assurée", value: yesNo(!!second) },
        ...(second
          ? [
              {
                label: "— Nom et prénom",
                value: `${second.lastName} ${second.firstName}`,
              },
              { label: "— Date de naissance", value: second.birthDate },
              { label: "— Genre", value: genderLabels[second.gender] },
              { label: "— Quotité", value: `${second.coverage} %` },
              ...(second.healthNotes
                ? [{ label: "— Santé", value: second.healthNotes }]
                : []),
            ]
          : []),
      ],
    },
    contactSection(values),
  ]
}
