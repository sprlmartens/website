/* eslint-disable @typescript-eslint/no-explicit-any */
import { autoMotoDefinition } from "@/features/quotes/auto-moto/definition"
import { assistanceVoyageDefinition } from "@/features/quotes/assistance-voyage/definition"
import { epargnePensionDefinition } from "@/features/quotes/epargne-pension/definition"
import { familialeDefinition } from "@/features/quotes/familiale/definition"
import { habitationDefinition } from "@/features/quotes/habitation/definition"
import { santeHospitalisationDefinition } from "@/features/quotes/sante-hospitalisation/definition"

import type { QuoteSlug } from "./meta"
import type { QuoteFormDefinition } from "./types"

/**
 * Registre des définitions, consommé par la seule Server Action.
 *
 * Le `any` est délibéré : les définitions ont chacune leur type de valeurs, et
 * l'action ne les manipule qu'après `safeParse`, donc de façon sûre.
 */
export const quoteDefinitions: Record<QuoteSlug, QuoteFormDefinition<any>> = {
  "auto-moto": autoMotoDefinition,
  habitation: habitationDefinition,
  familiale: familialeDefinition,
  "assistance-voyage": assistanceVoyageDefinition,
  "sante-hospitalisation": santeHospitalisationDefinition,
  "epargne-pension": epargnePensionDefinition,
}
