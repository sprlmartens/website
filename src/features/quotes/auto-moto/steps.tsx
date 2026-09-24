"use client"

import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import { AddressFields } from "@/components/quotes/fields/AddressFields"
import { BooleanField } from "@/components/quotes/fields/BooleanField"
import { MaskedDateField } from "@/components/quotes/fields/MaskedDateField"
import { OptionCardGroup } from "@/components/quotes/fields/OptionCardGroup"
import { PersonFields } from "@/components/quotes/fields/PersonFields"
import { SelectField } from "@/components/quotes/fields/SelectField"
import { TextField } from "@/components/quotes/fields/TextField"
import { getFieldError } from "@/components/quotes/fields/field-utils"
import { Button } from "@/components/ui/button"
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field"
import type { QuoteStep } from "@/features/quotes/core/types"
import { ContactStep, HolderStep } from "@/features/quotes/shared/steps"
import { useListFocus } from "@/features/quotes/shared/use-list-focus"

import {
  CLAIMS_HISTORY_YEARS,
  MAX_CLAIMS,
  claimTypeLabels,
  claimTypes,
  emptyClaim,
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
  const { control, setValue } = useFormContext<AutoMotoValues>()
  const isTakeover = useWatch({ control, name: "isTakeover" })

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

      <BooleanField
        name="isTakeover"
        label="S’agit-il de la reprise d’un contrat existant ?"
        onChanged={(value) => {
          if (!value) {
            setValue("currentInsurer", "")
            setValue("lastAnnualPremium", "")
          }
        }}
      />

      {isTakeover ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="currentInsurer" label="Compagnie actuelle" />
          <TextField
            name="lastAnnualPremium"
            label="Dernière prime annuelle (€)"
            placeholder="650"
            inputMode="numeric"
          />
        </div>
      ) : null}
    </div>
  )
}

function DriverStep() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<AutoMotoValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "claims" })
  const holderIsMainDriver = useWatch({ control, name: "holderIsMainDriver" })
  const hasClaims = useWatch({ control, name: "hasClaims" })
  const listError = getFieldError(errors, "claims")
  const canAddClaim = fields.length < MAX_CLAIMS

  const { cardRefs, addButtonRef, focusCardNext, focusAddButtonNext } =
    useListFocus(fields)

  function handleAppend() {
    focusCardNext(fields.length)
    append(emptyClaim)
  }

  function handleRemove(index: number) {
    focusAddButtonNext()
    remove(index)
  }

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

      <BooleanField
        name="hasClaims"
        label={`Des sinistres ces ${CLAIMS_HISTORY_YEARS} dernières années ?`}
        description="Tous les sinistres du conducteur principal, en tort ou non."
        onChanged={(value) => {
          setValue("claims", value ? [emptyClaim] : [])
        }}
      />

      {hasClaims ? (
        <div className="flex flex-col gap-6">
          {fields.map((field, index) => (
            <FieldSet
              key={field.id}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              className="rounded-xl border border-border p-5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <FieldLegend className="mb-0">Sinistre {index + 1}</FieldLegend>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Retirer le sinistre ${index + 1}`}
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="size-4" />
                  Retirer
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
                <TextField
                  name={`claims.${index}.year`}
                  label="Année"
                  placeholder={String(new Date().getFullYear())}
                  inputMode="numeric"
                />
                <SelectField
                  name={`claims.${index}.type`}
                  label="Type de sinistre"
                  placeholder="Sélectionnez un type"
                  options={claimTypes.map((value) => ({
                    value,
                    label: claimTypeLabels[value],
                  }))}
                />
              </div>
            </FieldSet>
          ))}

          <div>
            {canAddClaim ? (
              <Button
                type="button"
                variant="outline"
                ref={addButtonRef}
                onClick={handleAppend}
              >
                <Plus className="size-4" />
                Ajouter un sinistre
              </Button>
            ) : null}
            <FieldError errors={[listError]} className="mt-2" />
          </div>
        </div>
      ) : null}
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
