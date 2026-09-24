import type { QuoteFormDefinition } from "@/features/quotes/core/types"

import {
  santeHospitalisationDefaultValues,
  santeHospitalisationSchema,
  type SanteHospitalisationValues,
} from "./schema"
import { santeHospitalisationSummary } from "./summary"

export const santeHospitalisationDefinition: QuoteFormDefinition<SanteHospitalisationValues> =
  {
    slug: "sante-hospitalisation",
    schema: santeHospitalisationSchema,
    defaultValues: santeHospitalisationDefaultValues,
    summary: santeHospitalisationSummary,
    emailSubject: (values) =>
      `Demande de devis — Santé & hospitalisation — ${values.holder.lastName} ${values.holder.firstName}`,
    recipientEmail: (values) => values.email,
  }
