"use client"

import {
  genderLabels,
  genders,
} from "@/features/quotes/shared/schema"

import { SelectField } from "./SelectField"

const options = genders.map((gender) => ({
  value: gender,
  label: genderLabels[gender],
}))

export function GenderField({ name }: { name: string }) {
  return (
    <SelectField
      name={name}
      label="Genre"
      placeholder="Sélectionnez un genre"
      options={options}
    />
  )
}
