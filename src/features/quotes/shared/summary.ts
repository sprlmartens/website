import type { SummarySection } from "@/features/quotes/core/types"

import { genderLabels, type SharedQuoteValues } from "./schema"

/**
 * Sections de récapitulatif communes à tous les devis. Chaque produit les
 * assemble avec ses propres sections, dans l'ordre du dossier assureur.
 */

export function yesNo(value: boolean): string {
  return value ? "Oui" : "Non"
}

export function holderSection(values: SharedQuoteValues): SummarySection {
  return {
    title: "Le preneur d'assurance",
    stepId: "holder",
    rows: [
      { label: "Nom", value: values.holder.lastName },
      { label: "Prénom", value: values.holder.firstName },
      { label: "Date de naissance", value: values.holder.birthDate },
      { label: "Genre", value: genderLabels[values.holder.gender] },
      {
        label: "Adresse",
        value: `${values.holder.street} ${values.holder.streetNumber}`,
      },
      {
        label: "Code postal et localité",
        value: `${values.holder.postalCode} ${values.holder.city}`,
      },
    ],
  }
}

export function insuredSection(values: SharedQuoteValues): SummarySection {
  return {
    title: "Les personnes assurées",
    stepId: "insured",
    rows: [
      { label: "Le preneur est assuré", value: yesNo(values.insureHolder) },
      ...values.additionalInsured.flatMap((person, index) => [
        {
          label: `Assuré supplémentaire ${index + 1}`,
          value: `${person.lastName} ${person.firstName}`,
        },
        { label: "— Date de naissance", value: person.birthDate },
        { label: "— Genre", value: genderLabels[person.gender] },
      ]),
    ],
  }
}

export function contactSection(values: SharedQuoteValues): SummarySection {
  return {
    title: "Vos coordonnées",
    stepId: "contact",
    rows: [
      { label: "E-mail", value: values.email },
      { label: "Téléphone", value: values.phone || "Non renseigné" },
      ...(values.message ? [{ label: "Message", value: values.message }] : []),
    ],
  }
}
