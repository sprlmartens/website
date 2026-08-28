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

import { getFieldError } from "./TextField"

/**
 * Insère les « / » au fil de la saisie et ignore tout caractère non
 * numérique. La suppression fonctionne naturellement : on repart toujours des
 * seuls chiffres saisis.
 */
function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
  return parts.filter(Boolean).join("/")
}

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
              onChange={(event) => field.onChange(maskDate(event.target.value))}
            />
          )}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
