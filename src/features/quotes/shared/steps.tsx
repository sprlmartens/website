"use client"

import type { ReactNode } from "react"
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import { AddressFields } from "@/components/quotes/fields/AddressFields"
import { BooleanField } from "@/components/quotes/fields/BooleanField"
import { PersonFields } from "@/components/quotes/fields/PersonFields"
import { SelectField } from "@/components/quotes/fields/SelectField"
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

import {
  CLAIMS_HISTORY_YEARS,
  MAX_ADDITIONAL_INSURED,
  MAX_CLAIMS,
  emptyPerson,
  type SharedQuoteValues,
} from "./schema"
import { useListFocus } from "./use-list-focus"

export function InsuredStep({
  holderDescription,
}: {
  holderDescription: string
}) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<SharedQuoteValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalInsured",
  })
  const hasAdditionalInsured = useWatch({
    control,
    name: "hasAdditionalInsured",
  })
  const listError = getFieldError(errors, "additionalInsured")
  const canAddPerson = fields.length < MAX_ADDITIONAL_INSURED

  const { cardRefs, addButtonRef, focusCardNext, focusAddButtonNext } =
    useListFocus(fields)

  function handleAppend() {
    focusCardNext(fields.length)
    append(emptyPerson)
  }

  function handleRemove(index: number) {
    focusAddButtonNext()
    remove(index)
  }

  return (
    <div className="flex flex-col gap-8">
      <BooleanField
        name="insureHolder"
        label="Êtes-vous vous-même assuré(e) ?"
        description={holderDescription}
      />

      <BooleanField
        name="hasAdditionalInsured"
        label="Faut-il assurer d’autres personnes ?"
        onChanged={(value) => {
          if (value) {
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
            {canAddPerson ? (
              <Button
                type="button"
                variant="outline"
                ref={addButtonRef}
                onClick={handleAppend}
              >
                <Plus className="size-4" />
                Ajouter une personne
              </Button>
            ) : null}
            <FieldError errors={[listError]} className="mt-2" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

/**
 * `children` complète le bloc « Identité » avec les questions propres à un
 * produit, par exemple l'état civil pour l'épargne-pension.
 */
export function HolderStep({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-10">
      <FieldSet>
        <FieldLegend>Identité</FieldLegend>
        <PersonFields prefix="holder" autoCompleteScope />
        {children}
      </FieldSet>

      <FieldSet>
        <FieldLegend>Adresse légale</FieldLegend>
        <AddressFields prefix="holder" autoCompleteScope />
      </FieldSet>
    </div>
  )
}

export function ContactStep() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SharedQuoteValues>()
  const consentError = getFieldError(errors, "consent")
  const messageError = getFieldError(errors, "message")

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
          label="Téléphone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      <Field data-invalid={!!messageError}>
        <FieldLabel htmlFor="message">
          Une précision à nous transmettre ? (facultatif)
        </FieldLabel>
        <FieldContent>
          <Textarea
            id="message"
            rows={4}
            aria-invalid={!!messageError}
            {...register("message")}
          />
          <FieldError errors={[messageError]} />
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
            J’accepte que Martens Assurances traite mes données pour répondre à
            cette demande.
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

type TakeoverFormValues = {
  isTakeover: boolean
  currentInsurer?: string
  lastAnnualPremium?: string
}

/** Reprise d'un contrat existant : compagnie actuelle et dernière prime. */
export function TakeoverFields({ label }: { label: string }) {
  const { control, setValue } = useFormContext<TakeoverFormValues>()
  const isTakeover = useWatch({ control, name: "isTakeover" })

  return (
    <>
      <BooleanField
        name="isTakeover"
        label={label}
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
    </>
  )
}

type ClaimsFormValues = {
  hasClaims: boolean
  claims: { year: string; type: string }[]
}

const emptyClaim = { year: "", type: "" }

/**
 * Historique de sinistres : une question « Oui / Non », puis une fiche
 * « année + type » par sinistre. Les types sont propres à chaque produit.
 */
export function ClaimsFields({
  claimTypes,
  claimTypeLabels,
  description,
}: {
  claimTypes: readonly string[]
  claimTypeLabels: Record<string, string>
  description: string
}) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ClaimsFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "claims" })
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
    <>
      <BooleanField
        name="hasClaims"
        label={`Des sinistres ces ${CLAIMS_HISTORY_YEARS} dernières années ?`}
        description={description}
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
    </>
  )
}
