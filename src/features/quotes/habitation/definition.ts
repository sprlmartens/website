import type { QuoteFormDefinition } from "@/features/quotes/core/types"

import {
  dwellingTypeLabels,
  habitationDefaultValues,
  habitationSchema,
  occupancyLabels,
  type HabitationValues,
} from "./schema"
import { habitationSummary } from "./summary"

export const habitationDefinition: QuoteFormDefinition<HabitationValues> = {
  slug: "habitation",
  schema: habitationSchema,
  defaultValues: habitationDefaultValues,
  summary: habitationSummary,
  emailSubject: (values) =>
    `Demande de devis — Habitation (${occupancyLabels[values.occupancy]}, ${dwellingTypeLabels[values.dwellingType]}) — ${values.holder.lastName} ${values.holder.firstName}`,
  recipientEmail: (values) => values.email,
}
