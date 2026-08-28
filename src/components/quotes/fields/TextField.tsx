"use client"

import { useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { getFieldError } from "./field-utils"

type TextFieldProps = {
  name: string
  label: string
  description?: string
  placeholder?: string
  autoComplete?: string
  inputMode?: "text" | "numeric" | "tel" | "email"
  type?: "text" | "email" | "tel"
}

export function TextField({
  name,
  label,
  description,
  placeholder,
  autoComplete,
  inputMode,
  type = "text",
}: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  // `errors` est imbriqué comme les valeurs : « holder.city » se lit en deux
  // temps. `getFieldError` fait ce parcours sans dépendance supplémentaire.
  const error = getFieldError(errors, name)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <Input
          id={name}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          {...register(name)}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
