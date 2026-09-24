"use client"

import { useFormContext, useWatch } from "react-hook-form"

import { AddressFields } from "@/components/quotes/fields/AddressFields"
import { BooleanField } from "@/components/quotes/fields/BooleanField"
import { MaskedDateField } from "@/components/quotes/fields/MaskedDateField"
import { OptionCardGroup } from "@/components/quotes/fields/OptionCardGroup"
import { PersonFields } from "@/components/quotes/fields/PersonFields"
import { SelectField } from "@/components/quotes/fields/SelectField"
import { TextField } from "@/components/quotes/fields/TextField"
import { FieldLegend, FieldSet } from "@/components/ui/field"
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
  emptyMainDriver,
  formulaLabels,
  formulas,
  fuelTypeLabels,
  fuelTypes,
  legalProtectionLabels,
  legalProtections,
  relationshipLabels,
  relationships,
  vehicleTypeLabels,
  vehicleTypes,
  type AutoMotoValues,
  type Formula,
} from "./schema"

const formulaDescriptions: Record<Formula, string> = {
  rc: "Obligatoire : les dommages causés aux autres.",
  "mini-omnium": "RC + vol, incendie, bris de glace, forces de la nature.",
  omnium: "Mini-omnium + dégâts à votre véhicule, même en tort.",
  unsure: "Nous vous conseillons la formule adaptée.",
}

function VehicleStep() {
  return (
    <div className="flex flex-col gap-8">
      <OptionCardGroup
        name="vehicleType"
        label="Quel véhicule souhaitez-vous assurer ?"
        options={vehicleTypes.map((value) => ({
          value,
          label: vehicleTypeLabels[value],
        }))}
        columns={2}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField name="brand" label="Marque" placeholder="Volkswagen" />
        <TextField name="model" label="Modèle" placeholder="Golf" />
      </div>

      <TextField
        name="powerKw"
        label="Puissance (kW)"
        description="Indiquée sur le certificat d’immatriculation"
        placeholder="85"
        inputMode="numeric"
      />

      <SelectField
        name="fuelType"
        label="Type de carburant"
        placeholder="Sélectionnez un carburant"
        options={fuelTypes.map((value) => ({
          value,
          label: fuelTypeLabels[value],
        }))}
      />

      <MaskedDateField
        name="firstRegistration"
        label="Date de première mise en circulation"
        description="Indiquée sur le certificat d’immatriculation"
      />

      <TextField
        name="vehicleValue"
        label="Valeur du véhicule HTVA (€)"
        description="Options comprises, hors TVA et hors remise."
        placeholder="25000"
        inputMode="numeric"
      />
    </div>
  )
}

function CoverageStep() {
  return (
    <div className="flex flex-col gap-8">
      <OptionCardGroup
        name="formula"
        label="Formule souhaitée"
        options={formulas.map((value) => ({
          value,
          label: formulaLabels[value],
          description: formulaDescriptions[value],
        }))}
        columns={2}
      />

      <SelectField
        name="legalProtection"
        label="Souhaitez-vous une protection juridique ?"
        placeholder="Sélectionnez une réponse"
        options={legalProtections.map((value) => ({
          value,
          label: legalProtectionLabels[value],
        }))}
      />

      <BooleanField
        name="driverInsurance"
        label="Souhaitez-vous une assurance conducteur ?"
        description="Couvre les blessures du conducteur en tort, que ni la RC ni l’omnium ne prennent en charge."
      />

      <TakeoverFields label="S’agit-il de la reprise d’un contrat existant ?" />
    </div>
  )
}

function DriverStep() {
  const { control, setValue } = useFormContext<AutoMotoValues>()
  const holderIsMainDriver = useWatch({ control, name: "holderIsMainDriver" })

  return (
    <div className="flex flex-col gap-8">
      <BooleanField
        name="holderIsMainDriver"
        label="Êtes-vous le conducteur principal ?"
        description="Le preneur d’assurance n’est pas toujours la personne qui conduit le plus souvent le véhicule."
        onChanged={(value) => {
          setValue("mainDriver", value ? null : emptyMainDriver)
        }}
      />

      {holderIsMainDriver === false ? (
        <FieldSet className="rounded-xl border border-border p-5">
          <FieldLegend className="mb-0">Conducteur principal</FieldLegend>
          <PersonFields prefix="mainDriver" />
          <AddressFields prefix="mainDriver" />
          <SelectField
            name="mainDriver.relationship"
            label="Lien avec le preneur d’assurance"
            placeholder="Sélectionnez un lien"
            options={relationships.map((value) => ({
              value,
              label: relationshipLabels[value],
            }))}
          />
        </FieldSet>
      ) : null}

      <MaskedDateField
        name="licenceDate"
        label="Date d’obtention du permis de conduire"
        description="Celle du conducteur principal."
      />

      <ClaimsFields
        claimTypes={claimTypes}
        claimTypeLabels={claimTypeLabels}
        description="Tous les sinistres du conducteur principal, en tort ou non."
      />
    </div>
  )
}

export const autoMotoSteps: QuoteStep<AutoMotoValues>[] = [
  {
    id: "vehicle",
    title: "Votre véhicule",
    description:
      "Commençons par le véhicule. Le certificat d’immatriculation vous aidera à répondre.",
    fields: [
      "vehicleType",
      "brand",
      "model",
      "powerKw",
      "fuelType",
      "firstRegistration",
      "vehicleValue",
    ],
    Component: VehicleStep,
  },
  {
    id: "coverage",
    title: "Vos garanties",
    description: "La formule et les options souhaitées.",
    fields: [
      "formula",
      "legalProtection",
      "driverInsurance",
      "isTakeover",
      "currentInsurer",
      "lastAnnualPremium",
    ],
    Component: CoverageStep,
  },
  {
    id: "driver",
    title: "Le conducteur principal",
    description: "La personne qui conduit le plus souvent le véhicule.",
    fields: [
      "holderIsMainDriver",
      "mainDriver",
      "licenceDate",
      "hasClaims",
      "claims",
    ],
    Component: DriverStep,
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
