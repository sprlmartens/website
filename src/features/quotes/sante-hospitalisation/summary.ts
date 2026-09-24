import type { SummarySection } from "@/features/quotes/core/types"
import {
  contactSection,
  holderSection,
  insuredSection,
  yesNo,
} from "@/features/quotes/shared/summary"

import type { SanteHospitalisationValues } from "./schema"

/**
 * Construit le récapitulatif dans l'ordre du dossier assureur — preneur,
 * assurés, couvertures — quel que soit l'ordre de saisie.
 *
 * Utilisé par l'écran récapitulatif, l'e-mail à l'agence et l'accusé de
 * réception : les libellés ne peuvent pas diverger.
 */
export function santeHospitalisationSummary(
  values: SanteHospitalisationValues
): SummarySection[] {
  return [
    holderSection(values),
    insuredSection(values),
    {
      title: "Les couvertures souhaitées",
      stepId: "coverage",
      rows: [
        {
          label: "Hospitalisation et frais liés à une opération",
          value: yesNo(values.coverHospitalisation),
        },
        {
          label: "Frais médicaux courants",
          value: yesNo(values.coverMedicalCare),
        },
        { label: "Frais dentaires", value: yesNo(values.coverDental) },
      ],
    },
    contactSection(values),
  ]
}
