"use client"

import { Controller, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

import { getFieldError } from "./field-utils"

type BooleanFieldProps = {
  name: string
  label: string
  description?: string
  /** Appelé après le changement, pour vider les champs devenus inutiles. */
  onChanged?: (value: boolean) => void
}

// `RadioGroup` ne connaît que des valeurs textuelles : on convertit le
// booléen en « true »/« false » à la frontière du composant.
const choices = [
  { value: "true", label: "Oui" },
  { value: "false", label: "Non" },
] as const

export function BooleanField({
  name,
  label,
  description,
  onChanged,
}: BooleanFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  const error = getFieldError(errors, name)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <RadioGroup
              value={
                field.value === true
                  ? "true"
                  : field.value === false
                    ? "false"
                    : ""
              }
              onValueChange={(value) => {
                const boolValue = value === "true"
                field.onChange(boolValue)
                onChanged?.(boolValue)
                field.onBlur()
              }}
              aria-label={label}
              aria-invalid={!!error}
              className="flex w-full max-w-xs gap-2"
            >
              {choices.map((choice) => {
                const id = `${name}-${choice.value}`
                const isSelected = field.value === (choice.value === "true")

                return (
                  <label
                    key={choice.value}
                    htmlFor={id}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                      isSelected
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "border-border text-foreground hover:bg-muted",
                    )}
                  >
                    <RadioGroupItem id={id} value={choice.value} />
                    {choice.label}
                  </label>
                )
              })}
            </RadioGroup>
          )}
        />
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
