"use client"

import { Controller, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

import { getFieldError } from "./TextField"

type BooleanFieldProps = {
  name: string
  label: string
  description?: string
  /** Appelé après le changement, pour vider les champs devenus inutiles. */
  onChanged?: (value: boolean) => void
}

const choices = [
  { value: true, label: "Oui" },
  { value: false, label: "Non" },
]

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
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-label={label}
              className="flex w-full max-w-xs gap-2"
            >
              {choices.map((choice) => {
                const isSelected = field.value === choice.value

                return (
                  <button
                    key={choice.label}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      field.onChange(choice.value)
                      onChanged?.(choice.value)
                    }}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
                      isSelected
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "border-border text-foreground hover:bg-muted",
                    )}
                  >
                    {choice.label}
                  </button>
                )
              })}
            </div>
          )}
        />
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
