"use client"

import { useFormContext, useWatch } from "react-hook-form"

import { BooleanField } from "@/components/quotes/fields/BooleanField"
import { MaskedDateField } from "@/components/quotes/fields/MaskedDateField"
import { PersonFields } from "@/components/quotes/fields/PersonFields"
import { TextField } from "@/components/quotes/fields/TextField"
import { TextareaField } from "@/components/quotes/fields/TextareaField"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import type { QuoteStep } from "@/features/quotes/core/types"
import { ContactStep, HolderStep } from "@/features/quotes/shared/steps"

import { emptySecondInsured, type SoldeRestantDuValues } from "./schema"

const coverageDescription = "De 1 à 100 %."

const healthNotesDescription =
  "Ces informations restent confidentielles et servent uniquement à établir votre proposition."

function LoanStep() {
  return (
    <div className="flex flex-col gap-8">
      <TextField
        name="loanAmount"
        label="Montant initial du crédit (€)"
        placeholder="250000"
        inputMode="numeric"
      />

      <TextField
        name="loanDuration"
        label="Durée du crédit (en années)"
        placeholder="25"
        inputMode="numeric"
      />

      <MaskedDateField
        name="effectiveDate"
        label="Date de prise d’effet du contrat"
        description="En principe, la date de passage des actes."
      />
    </div>
  )
}

function InsuredStep() {
  const { control, setValue } = useFormContext<SoldeRestantDuValues>()
  const hasSecondInsured = useWatch({ control, name: "hasSecondInsured" })

  return (
    <div className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Vous</FieldLegend>
        <TextField
          name="holderCoverage"
          label="Part du crédit à assurer (%)"
          description={coverageDescription}
          placeholder="100"
          inputMode="numeric"
        />
        <TextareaField
          name="holderHealthNotes"
          label="Particularités de santé (facultatif)"
          description={healthNotesDescription}
        />
      </FieldSet>

      <BooleanField
        name="hasSecondInsured"
        label="Faut-il assurer une seconde personne ?"
        description="Par exemple, votre co-emprunteur."
        onChanged={(value) => {
          // Sans ce nettoyage, des réponses abandonnées partiraient dans
          // l'e-mail.
          setValue("secondInsured", value ? emptySecondInsured : undefined)
        }}
      />

      {hasSecondInsured ? (
        <FieldSet className="rounded-xl border border-border p-5">
          <FieldLegend>Seconde personne assurée</FieldLegend>
          <PersonFields prefix="secondInsured" />
          <TextField
            name="secondInsured.coverage"
            label="Part du crédit à assurer (%)"
            description={coverageDescription}
            placeholder="100"
            inputMode="numeric"
          />
          <TextareaField
            name="secondInsured.healthNotes"
            label="Particularités de santé (facultatif)"
            description={healthNotesDescription}
          />
        </FieldSet>
      ) : null}
    </div>
  )
}

export const soldeRestantDuSteps: QuoteStep<SoldeRestantDuValues>[] = [
  {
    id: "loan",
    title: "Votre crédit",
    description: "Commençons par le crédit à couvrir.",
    fields: ["loanAmount", "loanDuration", "effectiveDate"],
    Component: LoanStep,
  },
  {
    id: "insured",
    title: "Les personnes assurées",
    description: "Qui doit être couvert, et pour quelle part du crédit ?",
    fields: [
      "holderCoverage",
      "holderHealthNotes",
      "hasSecondInsured",
      "secondInsured",
    ],
    Component: InsuredStep,
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
