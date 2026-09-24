"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

import { getFieldError } from "./field-utils"
import type { Option } from "./OptionCardGroup"

type CheckboxCardGroupProps = {
  name: string
  label: string
  options: Option[]
  description?: string
  columns?: 1 | 2 | 3
  /** Appelé après le changement, pour vider les champs devenus inutiles. */
  onChanged?: (value: string[]) => void
}

/**
 * Choix multiple, présenté comme `OptionCardGroup`. La valeur est un tableau
 * rangé dans l'ordre des options, quel que soit l'ordre des clics : le
 * récapitulatif reste stable.
 */
export function CheckboxCardGroup({
  name,
  label,
  options,
  description,
  columns = 1,
  onChanged,
}: CheckboxCardGroupProps) {
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
          render={({ field }) => {
            const selected: string[] = field.value ?? []

            return (
              <div
                role="group"
                aria-label={label}
                className={cn(
                  "grid gap-3",
                  columns === 2 && "sm:grid-cols-2",
                  columns === 3 && "sm:grid-cols-3",
                )}
              >
                {options.map((option) => {
                  const id = `${name}-${option.value}`
                  const isSelected = selected.includes(option.value)

                  return (
                    <label
                      key={option.value}
                      htmlFor={id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                        isSelected
                          ? "border-primary/40 bg-primary/5"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      <Checkbox
                        id={id}
                        checked={isSelected}
                        aria-invalid={!!error}
                        onCheckedChange={(checked) => {
                          const next = options
                            .map((o) => o.value)
                            .filter((value) =>
                              value === option.value
                                ? checked === true
                                : selected.includes(value),
                            )
                          field.onChange(next)
                          onChanged?.(next)
                          field.onBlur()
                        }}
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">
                          {option.label}
                        </span>
                        {option.description ? (
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  )
                })}
              </div>
            )
          }}
        />
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
