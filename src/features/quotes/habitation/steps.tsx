"use client"

import { useFormContext, useWatch } from "react-hook-form"

import { AddressFields } from "@/components/quotes/fields/AddressFields"
import { BooleanField } from "@/components/quotes/fields/BooleanField"
import { CheckboxCardGroup } from "@/components/quotes/fields/CheckboxCardGroup"
import { OptionCardGroup } from "@/components/quotes/fields/OptionCardGroup"
import { SelectField } from "@/components/quotes/fields/SelectField"
import { TextField } from "@/components/quotes/fields/TextField"
import { TextareaField } from "@/components/quotes/fields/TextareaField"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import type { QuoteStep } from "@/features/quotes/core/types"
import { emptyAddress } from "@/features/quotes/shared/schema"
import {
  ClaimsFields,
  ContactStep,
  HolderStep,
  TakeoverFields,
} from "@/features/quotes/shared/steps"

import {
  claimTypeLabels,
  claimTypes,
  dwellingTypeLabels,
  dwellingTypes,
  facadeTypeLabels,
  facadeTypes,
  heatingTypeLabels,
  heatingTypes,
  occupancies,
  occupancyLabels,
  specialFeatureLabels,
  specialFeatures,
  type FacadeType,
  type HabitationValues,
} from "./schema"

const facadeDescriptions: Record<FacadeType, string> = {
  detached: "Maison isolée, sans mur commun.",
  "semi-detached": "Maison jumelée, un mur commun.",
  terraced: "Entre deux maisons, deux murs communs.",
}

function PropertyStep() {
  const { control, setValue } = useFormContext<HabitationValues>()
  const occupancy = useWatch({ control, name: "occupancy" })
  const dwellingType = useWatch({ control, name: "dwellingType" })
  const propertyIsHolderAddress = useWatch({
    control,
    name: "propertyIsHolderAddress",
  })

  return (
    <div className="flex flex-col gap-8">
      <OptionCardGroup
        name="occupancy"
        label="Êtes-vous propriétaire ou locataire ?"
        options={occupancies.map((value) => ({
          value,
          label: occupancyLabels[value],
        }))}
        columns={2}
        onChanged={(value) => {
          if (value !== "tenant") {
            setValue("monthlyRent", "")
          }
        }}
      />

      {occupancy === "tenant" ? (
        <TextField
          name="monthlyRent"
          label="Loyer mensuel hors charges (€)"
          placeholder="850"
          inputMode="numeric"
        />
      ) : null}

      <OptionCardGroup
        name="dwellingType"
        label="S’agit-il d’une maison ou d’un appartement ?"
        options={dwellingTypes.map((value) => ({
          value,
          label: dwellingTypeLabels[value],
        }))}
        columns={2}
        onChanged={() => {
          // Façades et étage ne valent que pour un type de logement : on
          // repart de zéro à chaque changement.
          setValue("facades", null)
          setValue("floor", "")
        }}
      />

      {dwellingType === "house" ? (
        <OptionCardGroup
          name="facades"
          label="Combien de façades ?"
          options={facadeTypes.map((value) => ({
            value,
            label: facadeTypeLabels[value],
            description: facadeDescriptions[value],
          }))}
          columns={3}
        />
      ) : null}

      {dwellingType === "apartment" ? (
        <TextField
          name="floor"
          label="Étage"
          description="0 pour le rez-de-chaussée."
          placeholder="2"
          inputMode="numeric"
        />
      ) : null}

      <BooleanField
        name="propertyIsHolderAddress"
        label="Ce logement est-il votre adresse légale actuelle ?"
        description="Si vous déménagez bientôt, répondez « Non » et indiquez l’adresse du nouveau logement."
        onChanged={(value) => {
          setValue("propertyAddress", value ? null : emptyAddress)
        }}
      />

      {propertyIsHolderAddress === false ? (
        <FieldSet className="rounded-xl border border-border p-5">
          <FieldLegend className="mb-0">Adresse du logement</FieldLegend>
          <AddressFields prefix="propertyAddress" />
        </FieldSet>
      ) : null}
    </div>
  )
}

function FeaturesStep() {
  const { control, setValue } = useFormContext<HabitationValues>()
  const hasGarage = useWatch({ control, name: "hasGarage" })
  const hasSpecialFeatures = useWatch({ control, name: "hasSpecialFeatures" })
  const selectedFeatures = useWatch({ control, name: "specialFeatures" })

  return (
    <div className="flex flex-col gap-8">
      <SelectField
        name="heating"
        label="Type de chauffage"
        placeholder="Sélectionnez un chauffage"
        options={heatingTypes.map((value) => ({
          value,
          label: heatingTypeLabels[value],
        }))}
      />

      <TextareaField
        name="rooms"
        label="Composition de l’habitation"
        description="Listez les pièces : salon, salle à manger, cuisine, nombre de chambres, bureau, salles de bain, grenier aménagé…"
        placeholder="Salon, salle à manger, cuisine, 3 chambres, 1 bureau, 1 salle de bain"
      />

      <BooleanField name="hasCellar" label="Disposez-vous d’une cave ?" />

      <BooleanField
        name="hasGarage"
        label="Disposez-vous d’un garage ?"
        onChanged={(value) => {
          if (!value) {
            setValue("garageCapacity", "")
          }
        }}
      />

      {hasGarage ? (
        <TextField
          name="garageCapacity"
          label="Pour combien de véhicules ?"
          placeholder="1"
          inputMode="numeric"
        />
      ) : null}

      <BooleanField name="hasGarden" label="Disposez-vous d’un jardin ?" />

      <BooleanField
        name="hasSpecialFeatures"
        label="Des aménagements particuliers ?"
        description="Piscine, jacuzzi, panneaux photovoltaïques, borne de recharge…"
        onChanged={(value) => {
          if (!value) {
            setValue("specialFeatures", [])
            setValue("specialFeaturesOther", "")
          }
        }}
      />

      {hasSpecialFeatures ? (
        <>
          <CheckboxCardGroup
            name="specialFeatures"
            label="Lesquels ?"
            options={specialFeatures.map((value) => ({
              value,
              label: specialFeatureLabels[value],
            }))}
            columns={2}
            onChanged={(value) => {
              if (!value.includes("other")) {
                setValue("specialFeaturesOther", "")
              }
            }}
          />

          {selectedFeatures.includes("other") ? (
            <TextField
              name="specialFeaturesOther"
              label="Précisez l’aménagement"
              placeholder="Sauna, abri de jardin…"
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function HistoryStep() {
  return (
    <div className="flex flex-col gap-8">
      <TakeoverFields label="Ce logement est-il déjà assuré ?" />

      <ClaimsFields
        claimTypes={claimTypes}
        claimTypeLabels={claimTypeLabels}
        description="Tous les sinistres déclarés pour votre habitation, dans ce logement ou le précédent."
      />
    </div>
  )
}

export const habitationSteps: QuoteStep<HabitationValues>[] = [
  {
    id: "property",
    title: "Votre logement",
    description: "Commençons par le bien à assurer.",
    fields: [
      "occupancy",
      "monthlyRent",
      "dwellingType",
      "facades",
      "floor",
      "propertyIsHolderAddress",
      "propertyAddress",
    ],
    Component: PropertyStep,
  },
  {
    id: "features",
    title: "Votre habitation",
    description: "Sa composition et ses équipements.",
    fields: [
      "heating",
      "rooms",
      "hasCellar",
      "hasGarage",
      "garageCapacity",
      "hasGarden",
      "hasSpecialFeatures",
      "specialFeatures",
      "specialFeaturesOther",
    ],
    Component: FeaturesStep,
  },
  {
    id: "history",
    title: "Vos antécédents",
    description: "Votre assurance actuelle et vos éventuels sinistres.",
    fields: [
      "isTakeover",
      "currentInsurer",
      "lastAnnualPremium",
      "hasClaims",
      "claims",
    ],
    Component: HistoryStep,
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
