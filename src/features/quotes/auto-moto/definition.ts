import type { QuoteFormDefinition } from "@/features/quotes/core/types"

import {
  autoMotoDefaultValues,
  autoMotoSchema,
  vehicleTypeLabels,
  type AutoMotoValues,
} from "./schema"
import { autoMotoSummary } from "./summary"

export const autoMotoDefinition: QuoteFormDefinition<AutoMotoValues> = {
  slug: "auto-moto",
  schema: autoMotoSchema,
  defaultValues: autoMotoDefaultValues,
  summary: autoMotoSummary,
  emailSubject: (values) =>
    `Demande de devis — Auto / moto (${vehicleTypeLabels[values.vehicleType]}) — ${values.holder.lastName} ${values.holder.firstName}`,
  recipientEmail: (values) => values.email,
}
