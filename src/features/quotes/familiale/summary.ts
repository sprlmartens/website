import type { SummaryRow, SummarySection } from "@/features/quotes/core/types"
import {
  claimsRows,
  contactSection,
  holderSection,
  takeoverRows,
} from "@/features/quotes/shared/summary"

import {
  claimTypeLabels,
  householdLabels,
  type FamilialeValues,
} from "./schema"

function householdRows(values: FamilialeValues): SummaryRow[] {
  const children = Number(values.childrenCount)

  return [
    { label: "Composition du foyer", value: householdLabels[values.household] },
    ...(values.household === "family"
      ? [
          {
            label: "— Enfants",
            value: `${children} enfant${children > 1 ? "s" : ""}`,
          },
        ]
      : []),
  ]
}

/**
 * Construit le récapitulatif dans l'ordre du dossier assureur — preneur,
 * foyer et antécédents — quel que soit l'ordre de saisie.
 *
 * Foyer et antécédents partagent une section : ils sont saisis sur la même
 * étape, et le récapitulatif indexe ses sections par étape.
 *
 * Utilisé par l'écran récapitulatif, l'e-mail à l'agence et l'accusé de
 * réception : les libellés ne peuvent pas diverger.
 */
export function familialeSummary(values: FamilialeValues): SummarySection[] {
  return [
    holderSection(values),
    {
      title: "Le foyer et les antécédents",
      stepId: "situation",
      rows: [
        ...householdRows(values),
        ...takeoverRows(values),
        ...claimsRows(values, claimTypeLabels),
      ],
    },
    contactSection(values),
  ]
}
