"use client"

import { useFormContext, useWatch } from "react-hook-form"

import { BooleanField } from "@/components/quotes/fields/BooleanField"
import { OptionCardGroup } from "@/components/quotes/fields/OptionCardGroup"
import { TextField } from "@/components/quotes/fields/TextField"
import type { QuoteStep } from "@/features/quotes/core/types"
import {
  ContactStep,
  HolderStep as SharedHolderStep,
} from "@/features/quotes/shared/steps"

import {
  maritalStatusLabels,
  maritalStatuses,
  paymentFrequencies,
  paymentFrequencyLabels,
  type EpargnePensionValues,
} from "./schema"

function SavingsStep() {
  const { control, setValue } = useFormContext<EpargnePensionValues>()
  const deathCapital = useWatch({ control, name: "deathCapital" })

  return (
    <div className="flex flex-col gap-8">
      <TextField
        name="pensionAge"
        label="Âge de la pension légale"
        description="Entre 60 et 70 ans. En Belgique : 66 ans aujourd’hui, 67 ans à partir de 2030."
        placeholder="67"
        inputMode="numeric"
      />

      <TextField
        name="annualContribution"
        label="Objectif de versement annuel (€)"
        description="Entre 600 € et 1 050 € par an."
        placeholder="1050"
        inputMode="numeric"
      />

      <OptionCardGroup
        name="paymentFrequency"
        label="Fréquence des versements"
        options={paymentFrequencies.map((value) => ({
          value,
          label: paymentFrequencyLabels[value],
          description:
            value === "monthly"
              ? "Votre objectif annuel réparti en 12 versements."
              : "Un seul versement par an.",
        }))}
        columns={2}
      />

      <BooleanField
        name="deathCapital"
        label="Faut-il prévoir un capital décès minimum ?"
        onChanged={(value) => {
          // Sans ce nettoyage, des réponses abandonnées partiraient dans
          // l'e-mail.
          if (!value) {
            setValue("deathCapitalAmount", "")
            setValue("smoker", null)
          }
        }}
      />

      {deathCapital ? (
        <>
          <TextField
            name="deathCapitalAmount"
            label="Montant du capital décès (€)"
            placeholder="25000"
            inputMode="numeric"
          />
          <BooleanField name="smoker" label="Êtes-vous fumeur ?" />
        </>
      ) : null}
    </div>
  )
}

function HolderStep() {
  return (
    <SharedHolderStep>
      <OptionCardGroup
        name="holder.maritalStatus"
        label="État civil"
        options={maritalStatuses.map((value) => ({
          value,
          label: maritalStatusLabels[value],
        }))}
        columns={2}
      />
    </SharedHolderStep>
  )
}

export const epargnePensionSteps: QuoteStep<EpargnePensionValues>[] = [
  {
    id: "savings",
    title: "Votre épargne-pension",
    description:
      "Commençons par votre objectif d’épargne et les garanties souhaitées.",
    fields: [
      "pensionAge",
      "annualContribution",
      "paymentFrequency",
      "deathCapital",
      "deathCapitalAmount",
      "smoker",
    ],
    Component: SavingsStep,
  },
  {
    id: "holder",
    title: "Le preneur d’assurance",
    description: "La personne qui souscrit le contrat et qui épargne.",
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
