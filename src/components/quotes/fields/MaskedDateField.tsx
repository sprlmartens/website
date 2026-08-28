"use client"

import { Controller, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { getFieldError, maskDate } from "./field-utils"

type MaskedDateFieldProps = {
  name: string
  label: string
  description?: string
  autoComplete?: string
}

export function MaskedDateField({
  name,
  label,
  description,
  autoComplete,
}: MaskedDateFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  const error = getFieldError(errors, name)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Input
              id={name}
              inputMode="numeric"
              placeholder="JJ/MM/AAAA"
              maxLength={10}
              autoComplete={autoComplete}
              aria-invalid={!!error}
              value={field.value ?? ""}
              onBlur={field.onBlur}
              onChange={(event) => {
                const nextValue = maskDate(event.target.value, {
                  previous: field.value ?? "",
                  caret:
                    event.target.selectionStart ?? event.target.value.length,
                })
                field.onChange(nextValue)
              }}
            />
          )}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
