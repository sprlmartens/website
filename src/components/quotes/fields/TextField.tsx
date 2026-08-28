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

/**
 * Lit une erreur au chemin pointé, par exemple « holder.city ».
 *
 * `errors` est typé `unknown` : `FieldErrors<T>` de react-hook-form est un
 * type mappé qui ne s'assigne pas à `Record<string, unknown>`.
 */
export function getFieldError(
  errors: unknown,
  name: string
): { message?: string } | undefined {
  const found = name.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, errors)

  return found && typeof found === "object" && "message" in found
    ? (found as { message?: string })
    : undefined
}
