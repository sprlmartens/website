"use client"

import { Controller, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getFieldError } from "./field-utils"
import type { Option } from "./OptionCardGroup"

type SelectFieldProps = {
  name: string
  label: string
  options: Omit<Option, "description">[]
  description?: string
  placeholder?: string
  /** Appelé après le changement, pour vider les champs devenus inutiles. */
  onChanged?: (value: string) => void
}

/** Liste déroulante, pour les choix trop nombreux pour des cartes d'option. */
export function SelectField({
  name,
  label,
  options,
  description,
  placeholder = "Sélectionnez une option",
  onChanged,
}: SelectFieldProps) {
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
            <Select
              value={field.value ?? ""}
              onValueChange={(value) => {
                // Même comportement que les cartes d'option : le choix
                // valide aussitôt le champ, sans attendre la perte de focus.
                field.onChange(value)
                onChanged?.(value)
                field.onBlur()
              }}
            >
              <SelectTrigger
                id={name}
                ref={field.ref}
                className="w-full"
                aria-invalid={!!error}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
