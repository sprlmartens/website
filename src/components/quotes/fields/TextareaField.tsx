"use client"

import { useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

import { getFieldError } from "./field-utils"

type TextareaFieldProps = {
  name: string
  label: string
  description?: string
  placeholder?: string
  rows?: number
}

/** Texte libre sur plusieurs lignes, même présentation que `TextField`. */
export function TextareaField({
  name,
  label,
  description,
  placeholder,
  rows = 4,
}: TextareaFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const error = getFieldError(errors, name)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <Textarea
          id={name}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={!!error}
          {...register(name)}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
