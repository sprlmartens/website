import type { QuoteFormDefinition } from "@/features/quotes/core/types"

import {
  assistanceVoyageDefaultValues,
  assistanceVoyageSchema,
  type AssistanceVoyageValues,
} from "./schema"
import { assistanceVoyageSummary } from "./summary"

export const assistanceVoyageDefinition: QuoteFormDefinition<AssistanceVoyageValues> =
  {
    slug: "assistance-voyage",
    schema: assistanceVoyageSchema,
    defaultValues: assistanceVoyageDefaultValues,
    summary: assistanceVoyageSummary,
    emailSubject: (values) =>
      `Demande de devis — Assistance voyage — ${values.holder.lastName} ${values.holder.firstName}`,
    recipientEmail: (values) => values.email,
  }
