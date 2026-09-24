import type { QuoteFormDefinition } from "@/features/quotes/core/types"

import {
  familialeDefaultValues,
  familialeSchema,
  householdLabels,
  type FamilialeValues,
} from "./schema"
import { familialeSummary } from "./summary"

export const familialeDefinition: QuoteFormDefinition<FamilialeValues> = {
  slug: "familiale",
  schema: familialeSchema,
  defaultValues: familialeDefaultValues,
  summary: familialeSummary,
  emailSubject: (values) =>
    `Demande de devis — Familiale (${householdLabels[values.household]}) — ${values.holder.lastName} ${values.holder.firstName}`,
  recipientEmail: (values) => values.email,
}
