import type { QuoteFormDefinition } from "@/features/quotes/core/types"

import {
  soldeRestantDuDefaultValues,
  soldeRestantDuSchema,
  type SoldeRestantDuValues,
} from "./schema"
import { soldeRestantDuSummary } from "./summary"

export const soldeRestantDuDefinition: QuoteFormDefinition<SoldeRestantDuValues> =
  {
    slug: "solde-restant-du",
    schema: soldeRestantDuSchema,
    defaultValues: soldeRestantDuDefaultValues,
    summary: soldeRestantDuSummary,
    emailSubject: (values) =>
      `Demande de devis — Solde restant dû — ${values.holder.lastName} ${values.holder.firstName}`,
    recipientEmail: (values) => values.email,
  }
