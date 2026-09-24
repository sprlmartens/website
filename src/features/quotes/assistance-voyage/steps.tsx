"use client"

import { useEffect, useRef } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import { BooleanField } from "@/components/quotes/fields/BooleanField"
import { MaskedDateField } from "@/components/quotes/fields/MaskedDateField"
import { OptionCardGroup } from "@/components/quotes/fields/OptionCardGroup"
import { TextField } from "@/components/quotes/fields/TextField"
import type { QuoteStep } from "@/features/quotes/core/types"
import {
  ContactStep,
  HolderStep,
  InsuredStep as SharedInsuredStep,
} from "@/features/quotes/shared/steps"

import {
  coverageDurationLabels,
  coverageDurations,
  destinationLabels,
  destinations,
  type AssistanceVoyageValues,
} from "./schema"

function TripStep() {
  const { control, setValue } = useFormContext<AssistanceVoyageValues>()
  const coverageDuration = useWatch({ control, name: "coverageDuration" })
  const insureVehicle = useWatch({ control, name: "insureVehicle" })

  // Ancre le dernier `coverageDuration` connu pour ne détecter qu'un
  // changement réel. Initialisée à la valeur courante : le premier passage
  // de l'effet ci-dessous ne trouve donc jamais de différence, que ce
  // premier passage suive le montage initial ou le remontage de cette étape
  // après un aller-retour dans le stepper.
  const previousCoverageDuration = useRef(coverageDuration)

  useEffect(() => {
    const previous = previousCoverageDuration.current
    previousCoverageDuration.current = coverageDuration

    if (previous === "period" && coverageDuration !== "period") {
      // Un aller-retour sur "Une période" laisserait sinon les dates dans
      // les valeurs du formulaire, invisibles mais toujours présentes.
      setValue("periodStart", "")
      setValue("periodEnd", "")
    }
  }, [coverageDuration, setValue])

  return (
    <div className="flex flex-col gap-8">
      <OptionCardGroup
        name="destination"
        label="Où voyagez-vous ?"
        options={destinations.map((value) => ({
          value,
          label: destinationLabels[value],
        }))}
      />

      <OptionCardGroup
        name="coverageDuration"
        label="Durée de la couverture"
        options={coverageDurations.map((value) => ({
          value,
          label: coverageDurationLabels[value],
          description:
            value === "annual"
              ? "Tous vos voyages de l’année sont couverts."
              : "Un seul voyage, sur des dates précises.",
        }))}
        columns={2}
      />

      {coverageDuration === "period" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MaskedDateField name="periodStart" label="Départ le" />
          <MaskedDateField name="periodEnd" label="Retour le" />
        </div>
      ) : null}

      <TextField
        name="tripValue"
        label="Valeur du voyage (€)"
        description="Coût total pour l’ensemble des voyageurs."
        placeholder="2500"
        inputMode="numeric"
      />

      <BooleanField
        name="insureVehicle"
        label="Faut-il assurer un véhicule ?"
        onChanged={(value) => {
          // Sans ce nettoyage, une réponse abandonnée partirait dans l'e-mail.
          if (!value) {
            setValue("vehicleFirstRegistration", "")
          }
        }}
      />

      {insureVehicle ? (
        <MaskedDateField
          name="vehicleFirstRegistration"
          label="Date de première mise en circulation"
        />
      ) : null}
    </div>
  )
}

function InsuredStep() {
  return (
    <SharedInsuredStep holderDescription="Le preneur d’assurance n’est pas toujours l’un des voyageurs." />
  )
}

export const assistanceVoyageSteps: QuoteStep<AssistanceVoyageValues>[] = [
  {
    id: "trip",
    title: "Votre voyage",
    description:
      "Commençons par le voyage lui-même : où, combien de temps, et pour quel montant.",
    fields: [
      "destination",
      "coverageDuration",
      "periodStart",
      "periodEnd",
      "tripValue",
      "insureVehicle",
      "vehicleFirstRegistration",
    ],
    Component: TripStep,
  },
  {
    id: "insured",
    title: "Les personnes assurées",
    description: "Qui doit être couvert pendant ce voyage ?",
    fields: ["insureHolder", "hasAdditionalInsured", "additionalInsured"],
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
