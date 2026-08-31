"use client"

import { useEffect, useRef } from "react"
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import { BooleanField } from "@/components/quotes/fields/BooleanField"
import { MaskedDateField } from "@/components/quotes/fields/MaskedDateField"
import { OptionCardGroup } from "@/components/quotes/fields/OptionCardGroup"
import { PersonFields } from "@/components/quotes/fields/PersonFields"
import { TextField } from "@/components/quotes/fields/TextField"
import { getFieldError } from "@/components/quotes/fields/field-utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { QuoteStep } from "@/features/quotes/core/types"

import {
  MAX_ADDITIONAL_INSURED,
  coverageDurationLabels,
  coverageDurations,
  destinationLabels,
  destinations,
  type AssistanceVoyageValues,
} from "./schema"

const emptyPerson = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "" as AssistanceVoyageValues["holder"]["gender"],
}

function TripStep() {
  const { control, setValue } = useFormContext<AssistanceVoyageValues>()
  const coverageDuration = useWatch({ control, name: "coverageDuration" })
  const insureVehicle = useWatch({ control, name: "insureVehicle" })

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
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<AssistanceVoyageValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalInsured",
  })
  const hasAdditionalInsured = useWatch({
    control,
    name: "hasAdditionalInsured",
  })
  const listError = getFieldError(errors, "additionalInsured")

  // Gestion du focus à l'ajout/au retrait d'une carte : sans elle, le focus
  // retombe sur le document (retrait, la carte disparaît sous le bouton
  // cliqué) ou reste sur le bouton « Ajouter » loin du nouveau formulaire
  // (ajout). `pendingFocusIndex` distingue un ajout explicite du peuplement
  // programmatique déclenché par le « Oui » de `hasAdditionalInsured`, qui
  // ne doit pas voler le focus au bouton radio que l'utilisateur vient
  // d'activer.
  const cardRefs = useRef<Array<HTMLFieldSetElement | null>>([])
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const pendingFocusIndex = useRef<number | null>(null)

  useEffect(() => {
    if (pendingFocusIndex.current === null) {
      return
    }
    const index = pendingFocusIndex.current
    pendingFocusIndex.current = null
    cardRefs.current[index]?.querySelector<HTMLElement>("input")?.focus()
  }, [fields])

  function handleAppend() {
    pendingFocusIndex.current = fields.length
    append(emptyPerson)
  }

  function handleRemove(index: number) {
    remove(index)
    // Le bouton « Ajouter » reste toujours monté : ancre de secours stable
    // après un retrait, pour ne pas laisser le focus retomber sur le
    // document.
    addButtonRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-8">
      <BooleanField
        name="insureHolder"
        label="Êtes-vous vous-même assuré(e) ?"
        description="Le preneur d’assurance n’est pas toujours l’un des voyageurs."
      />

      <BooleanField
        name="hasAdditionalInsured"
        label="Faut-il assurer d’autres personnes ?"
        onChanged={(value) => {
          if (value) {
            // Une première carte évite un état vide sans indication.
            setValue("additionalInsured", [emptyPerson])
          } else {
            setValue("additionalInsured", [])
          }
        }}
      />

      {hasAdditionalInsured ? (
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
                <FieldLegend className="mb-0">
                  Assuré supplémentaire {index + 1}
                </FieldLegend>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Retirer l’assuré supplémentaire ${index + 1}`}
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="size-4" />
                  Retirer
                </Button>
              </div>
              <PersonFields prefix={`additionalInsured.${index}`} />
            </FieldSet>
          ))}

          <div>
            <Button
              type="button"
              variant="outline"
              ref={addButtonRef}
              onClick={handleAppend}
              disabled={fields.length >= MAX_ADDITIONAL_INSURED}
            >
              <Plus className="size-4" />
              Ajouter une personne
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              {MAX_ADDITIONAL_INSURED} personnes supplémentaires au maximum.
            </p>
            <FieldError errors={[listError]} className="mt-2" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function HolderStep() {
  return (
    <div className="flex flex-col gap-10">
      <FieldSet>
        <FieldLegend>Identité</FieldLegend>
        <PersonFields prefix="holder" autoCompleteScope />
      </FieldSet>

      <FieldSet>
        <FieldLegend>Adresse légale</FieldLegend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
          <TextField name="holder.street" label="Rue" autoComplete="address-line1" />
          <TextField
            name="holder.streetNumber"
            label="N° / Boîte"
            autoComplete="address-line2"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
          <TextField
            name="holder.postalCode"
            label="Code postal"
            inputMode="numeric"
            autoComplete="postal-code"
          />
          <TextField
            name="holder.city"
            label="Localité"
            autoComplete="address-level2"
          />
        </div>
      </FieldSet>
    </div>
  )
}

function ContactStep() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<AssistanceVoyageValues>()
  const consentError = getFieldError(errors, "consent")

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          name="email"
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
        />
        <TextField
          name="phone"
          label="Téléphone (facultatif)"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      <Field>
        <FieldLabel htmlFor="message">
          Une précision à nous transmettre ? (facultatif)
        </FieldLabel>
        <FieldContent>
          <Textarea id="message" rows={4} {...register("message")} />
        </FieldContent>
      </Field>

      <Field orientation="horizontal" data-invalid={!!consentError}>
        <Controller
          control={control}
          name="consent"
          render={({ field }) => (
            <Checkbox
              id="consent"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              aria-invalid={!!consentError}
            />
          )}
        />
        <FieldContent>
          <FieldLabel htmlFor="consent" className="font-normal">
            J’accepte que Martens Assurances traite mes données pour répondre
            à cette demande.
          </FieldLabel>
          <FieldError errors={[consentError]} />
        </FieldContent>
      </Field>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Ne pas remplir ce champ</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("honeypot")}
        />
      </div>
    </div>
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
