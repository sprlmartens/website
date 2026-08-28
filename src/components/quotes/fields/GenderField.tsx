"use client"

import {
  genderLabels,
  genders,
} from "@/features/quotes/assistance-voyage/schema"

import { OptionCardGroup } from "./OptionCardGroup"

const options = genders.map((gender) => ({
  value: gender,
  label: genderLabels[gender],
}))

export function GenderField({ name }: { name: string }) {
  return (
    <OptionCardGroup name={name} label="Genre" options={options} columns={2} />
  )
}
