"use client"

import { useFormContext, useWatch } from "react-hook-form"

import { SelectField } from "@/components/quotes/fields/SelectField"
import { TextField } from "@/components/quotes/fields/TextField"
import type { QuoteStep } from "@/features/quotes/core/types"
import {
  ClaimsFields,
  ContactStep,
  HolderStep,
  TakeoverFields,
} from "@/features/quotes/shared/steps"

import {
  claimTypeLabels,
  claimTypes,
  householdLabels,
  households,
  type FamilialeValues,
} from "./schema"

function SituationStep() {
  const { control, setValue } = useFormContext<FamilialeValues>()
  const household = useWatch({ control, name: "household" })

  return (
    <div className="flex flex-col gap-8">
      <SelectField
        name="household"
        label="Habitez-vous seul(e), en couple ou en famille ?"
        placeholder="Sélectionnez votre situation"
        options={households.map((value) => ({
          value,
          label: householdLabels[value],
        }))}
        onChanged={(value) => {
          if (value !== "family") {
            setValue("childrenCount", "")
          }
        }}
      />

      {household === "family" ? (
        <TextField
          name="childrenCount"
          label="Combien d’enfants vivent sous votre toit ?"
          placeholder="2"
          inputMode="numeric"
        />
      ) : null}

      <TakeoverFields label="Avez-vous déjà une assurance familiale ?" />

      <ClaimsFields
        claimTypes={claimTypes}
        claimTypeLabels={claimTypeLabels}
        description="Les sinistres déclarés sur votre assurance familiale, en tort ou non."
      />
    </div>
  )
}

export const familialeSteps: QuoteStep<FamilialeValues>[] = [
  {
    id: "situation",
    title: "Votre situation",
    description:
      "Votre foyer, votre assurance actuelle et vos éventuels sinistres.",
    fields: [
      "household",
      "childrenCount",
      "isTakeover",
      "currentInsurer",
      "lastAnnualPremium",
      "hasClaims",
      "claims",
    ],
    Component: SituationStep,
  },
  {
    id: "holder",
    title: "Le preneur d’assurance",
    description: "La personne qui souscrit le contrat.",
    fields: ["holder"],
    Component: HolderStep,
  },
  {
    id: "contact",
    title: "Vos coordonnées",
    description: "Pour vous transmettre votre proposition.",
    fields: ["email", "phone", "message", "consent"],
    Component: ContactStep,
  },
]
