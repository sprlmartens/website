"use client"

import { Controller, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

import { getFieldError } from "./field-utils"

export type Option = {
  value: string
  label: string
  description?: string
}

type OptionCardGroupProps = {
  name: string
  label: string
  options: Option[]
  columns?: 1 | 2 | 3
}

export function OptionCardGroup({
  name,
  label,
  options,
  columns = 1,
}: OptionCardGroupProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  const error = getFieldError(errors, name)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <RadioGroup
              value={field.value ?? ""}
              onValueChange={field.onChange}
              aria-label={label}
              aria-invalid={!!error}
              className={cn(
                columns === 2 && "sm:grid-cols-2",
                columns === 3 && "sm:grid-cols-3",
              )}
            >
              {options.map((option) => {
                const id = `${name}-${option.value}`
                const isSelected = field.value === option.value

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
                    <RadioGroupItem
                      id={id}
                      value={option.value}
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
            </RadioGroup>
          )}
        />
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  )
}
