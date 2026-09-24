import type { QuoteFormDefinition } from "@/features/quotes/core/types"

import {
  epargnePensionDefaultValues,
  epargnePensionSchema,
  type EpargnePensionValues,
} from "./schema"
import { epargnePensionSummary } from "./summary"

export const epargnePensionDefinition: QuoteFormDefinition<EpargnePensionValues> =
  {
    slug: "epargne-pension",
    schema: epargnePensionSchema,
    defaultValues: epargnePensionDefaultValues,
    summary: epargnePensionSummary,
    emailSubject: (values) =>
      `Demande de devis — Épargne-pension — ${values.holder.lastName} ${values.holder.firstName}`,
    recipientEmail: (values) => values.email,
  }
