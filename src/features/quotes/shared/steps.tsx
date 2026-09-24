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

import {
  MAX_ADDITIONAL_INSURED,
  emptyPerson,
  type SharedQuoteValues,
} from "./schema"

type PendingFocus = { kind: "card"; index: number } | { kind: "add" }

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

  const cardRefs = useRef<Array<HTMLFieldSetElement | null>>([])
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const pendingFocus = useRef<PendingFocus | null>(null)

  useEffect(() => {
    const target = pendingFocus.current
    if (target === null) {
      return
    }
    pendingFocus.current = null

    if (target.kind === "card") {
      cardRefs.current[target.index]
        ?.querySelector<HTMLElement>("input")
        ?.focus()
    } else {
      addButtonRef.current?.focus()
    }
  }, [fields])

  function handleAppend() {
    pendingFocus.current = { kind: "card", index: fields.length }
    append(emptyPerson)
  }

  function handleRemove(index: number) {
    pendingFocus.current = { kind: "add" }
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

export function HolderStep() {
  return (
    <div className="flex flex-col gap-10">
      <FieldSet>
        <FieldLegend>Identité</FieldLegend>
        <PersonFields prefix="holder" autoCompleteScope />
      </FieldSet>

      <FieldSet>
        <FieldLegend>Adresse légale</FieldLegend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
          <TextField
            name="holder.street"
            label="Rue"
            autoComplete="address-line1"
          />
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
          label="Téléphone (facultatif)"
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
