"use client"

import { GenderField } from "./GenderField"
import { MaskedDateField } from "./MaskedDateField"
import { TextField } from "./TextField"

/**
 * Bloc identité, réutilisé pour le preneur et pour chaque assuré
 * supplémentaire. `prefix` est le chemin RHF du bloc, par exemple
 * « holder » ou « additionalInsured.0 ».
 */
export function PersonFields({
  prefix,
  autoCompleteScope = false,
}: {
  prefix: string
  /** N'active l'autofill navigateur que pour le preneur. */
  autoCompleteScope?: boolean
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          name={`${prefix}.firstName`}
          label="Prénom"
          autoComplete={autoCompleteScope ? "given-name" : "off"}
        />
        <TextField
          name={`${prefix}.lastName`}
          label="Nom"
          autoComplete={autoCompleteScope ? "family-name" : "off"}
        />
      </div>
      <MaskedDateField
        name={`${prefix}.birthDate`}
        label="Date de naissance"
        autoComplete={autoCompleteScope ? "bday" : "off"}
      />
      <GenderField name={`${prefix}.gender`} />
    </>
  )
}
